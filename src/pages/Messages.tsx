
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    avatar_url: string;
    username: string;
    full_name: string;
  };
}

interface Conversation {
  id: string;
  username: string;
  avatar_url: string;
  full_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select(`
          receiver_id,
          content,
          created_at,
          is_read,
          profiles!messages_receiver_id_fkey(username, avatar_url, full_name)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select(`
          sender_id,
          content,
          created_at,
          is_read,
          profiles!messages_sender_id_fkey(username, avatar_url, full_name)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError || receivedError) {
        throw sentError || receivedError;
      }

      // Process and combine conversations
      const conversationMap = new Map<string, Conversation>();

      // Process sent messages
      sentMessages?.forEach((message) => {
        const otherUserId = message.receiver_id;
        const profile = message.profiles;
        
        if (!conversationMap.has(otherUserId) && profile) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            username: profile.username || 'User',
            avatar_url: profile.avatar_url,
            full_name: profile.full_name || 'User',
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0
          });
        }
      });

      // Process received messages
      receivedMessages?.forEach((message) => {
        const otherUserId = message.sender_id;
        const profile = message.profiles;
        
        if (!conversationMap.has(otherUserId) && profile) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            username: profile.username || 'User',
            avatar_url: profile.avatar_url,
            full_name: profile.full_name || 'User',
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: message.is_read ? 0 : 1
          });
        } else if (conversationMap.has(otherUserId)) {
          // Update unread count
          const conversation = conversationMap.get(otherUserId)!;
          if (!message.is_read) {
            conversation.unread_count += 1;
          }
          
          // Update last message if it's newer
          const currentTime = new Date(conversation.last_message_time);
          const messageTime = new Date(message.created_at);
          if (messageTime > currentTime) {
            conversation.last_message = message.content;
            conversation.last_message_time = message.created_at;
          }
          
          conversationMap.set(otherUserId, conversation);
        }
      });

      // Convert map to array and sort by last message time
      const sortedConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
      
      setConversations(sortedConversations);
      
      // If we have conversations and none selected, select the first one
      if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error loading conversations",
        description: "There was a problem fetching your conversations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    if (!user) return;
    
    try {
      // Fetch messages between current user and selected user
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(avatar_url, username, full_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter messages to only include those between these two users
      const filteredMessages = data.filter(message => 
        (message.sender_id === user.id && message.receiver_id === userId) || 
        (message.sender_id === userId && message.receiver_id === user.id)
      );
      
      setMessages(filteredMessages);

      // Mark unread messages as read
      const unreadMessageIds = filteredMessages
        .filter(msg => msg.receiver_id === user.id && !msg.is_read)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds);
        
        // Refresh conversations to update unread counts
        fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "There was a problem fetching your messages.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
          is_read: false
        });

      if (error) throw error;

      setNewMessage("");
      // Refresh messages and conversations
      fetchMessages(selectedConversation);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Please Sign In</h3>
              <p className="text-gray-500">
                You need to be signed in to view your messages.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = "/auth"}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Messages Yet</h3>
              <p className="text-gray-500">
                Your conversations with other users will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="md:col-span-1 h-[70vh] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                        selectedConversation === conversation.id 
                          ? 'bg-brand-100 dark:bg-brand-900' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar_url} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-medium truncate">
                            {conversation.full_name || conversation.username}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conversation.last_message}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="ml-2 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Messages View */}
            <Card className="md:col-span-2 h-[70vh] flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="pb-2 border-b">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage 
                          src={conversations.find(c => c.id === selectedConversation)?.avatar_url} 
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg">
                        {conversations.find(c => c.id === selectedConversation)?.full_name || 
                         conversations.find(c => c.id === selectedConversation)?.username}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-end gap-2 max-w-[80%]">
                            {message.sender_id !== user.id && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender?.avatar_url} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div 
                              className={`px-4 py-2 rounded-lg ${
                                message.sender_id === user.id 
                                  ? 'bg-brand-600 text-white rounded-br-none' 
                                  : 'bg-gray-100 dark:bg-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <form 
                      className="flex gap-2" 
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                    >
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newMessage.trim() || sendingMessage}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Select a conversation</h3>
                    <p className="text-gray-500 mt-2">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
