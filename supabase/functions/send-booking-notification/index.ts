
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationData {
  bookingId: string;
  ownerId: string;
  renterId: string;
  itemId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookingId, ownerId, renterId, itemId }: BookingNotificationData = await req.json();

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      throw bookingError;
    }

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) {
      console.error('Error fetching item:', itemError);
      throw itemError;
    }

    // Get owner profile
    const { data: owner, error: ownerError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', ownerId)
      .single();

    if (ownerError) {
      console.error('Error fetching owner profile:', ownerError);
      throw ownerError;
    }

    // Get renter profile
    const { data: renter, error: renterError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', renterId)
      .single();

    if (renterError) {
      console.error('Error fetching renter profile:', renterError);
      throw renterError;
    }

    console.log('Booking notification processed successfully:', {
      bookingId,
      itemTitle: item.title,
      ownerName: owner.full_name || owner.username,
      renterName: renter.full_name || renter.username
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification processed successfully' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
