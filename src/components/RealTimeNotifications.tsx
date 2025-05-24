
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

const RealTimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Listen for new bookings where user is the owner
    const bookingsChannel = supabase
      .channel('user-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `owner_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New booking:', payload);
          
          // Fetch item details for the notification
          const { data: item } = await supabase
            .from('items')
            .select('title')
            .eq('id', payload.new.item_id)
            .single();

          toast({
            title: "New Booking Request!",
            description: `Someone wants to rent your ${item?.title}`,
          });
        }
      )
      .subscribe();

    // Listen for booking status updates where user is the renter
    const bookingUpdatesChannel = supabase
      .channel('user-booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `renter_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Booking update:', payload);
          
          if (payload.new.status !== payload.old.status) {
            const { data: item } = await supabase
              .from('items')
              .select('title')
              .eq('id', payload.new.item_id)
              .single();

            const statusMessages = {
              confirmed: `Your booking for ${item?.title} has been confirmed!`,
              rejected: `Your booking for ${item?.title} was declined`,
              cancelled: `Your booking for ${item?.title} was cancelled`
            };

            toast({
              title: "Booking Update",
              description: statusMessages[payload.new.status as keyof typeof statusMessages] || 
                          `Your booking status changed to ${payload.new.status}`,
              variant: payload.new.status === 'confirmed' ? 'default' : 'destructive'
            });
          }
        }
      )
      .subscribe();

    // Listen for new messages
    const messagesChannel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New message:', payload);
          
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', payload.new.sender_id)
            .single();

          toast({
            title: "New Message",
            description: `Message from ${sender?.full_name || sender?.username || 'Unknown'}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(bookingUpdatesChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  return null; // This component only handles notifications
};

export default RealTimeNotifications;
