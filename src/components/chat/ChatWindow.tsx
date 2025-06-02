import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Phone, Video, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface ChatWindowProps {
  recipientId: string;
  bookingId?: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipientId, bookingId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && recipientId) {
      fetchRecipient();
      fetchMessages();
      setupRealtimeSubscription();
    }

    return () => {
      // Cleanup subscription if needed
    };
  }, [user, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRecipient = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", recipientId)
        .single();

      if (error) throw error;
      setRecipient(data);
    } catch (error) {
      console.error("Error fetching recipient:", error);
      toast({
        title: "Error",
        description: "Failed to load chat recipient",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch messages first
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch sender profiles for each message
      const messagesWithSenders = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", message.sender_id)
            .single();

          return {
            ...message,
            sender: senderProfile || {
              id: message.sender_id,
              username: "Unknown",
              full_name: "Unknown User",
              avatar_url: ""
            }
          };
        })
      );

      setMessages(messagesWithSenders);

      // Mark messages as read
      await markMessagesAsRead();
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", recipientId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id}))`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages(); // Refetch to get complete message with sender info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          receiver_id: recipientId,
          booking_id: bookingId || null,
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!recipient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] border rounded-lg bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipient.avatar_url} />
            <AvatarFallback>
              {recipient.full_name?.charAt(0) || recipient.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {recipient.full_name || recipient.username || "User"}
            </h3>
            <p className="text-sm text-gray-500">
              {recipient.is_verified ? "Verified User" : "User"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender_id === user?.id
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id
                        ? "text-brand-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
