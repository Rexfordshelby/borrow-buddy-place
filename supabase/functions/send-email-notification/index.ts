
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  to: string;
  type: 'booking_confirmation' | 'booking_request' | 'message_received' | 'review_received';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: EmailNotificationRequest = await req.json();

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'booking_confirmation':
        subject = "Booking Confirmed - BorrowBuddy";
        htmlContent = `
          <h1>Your booking has been confirmed!</h1>
          <p>Hello ${data.renterName},</p>
          <p>Your booking for <strong>${data.itemTitle}</strong> has been confirmed.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <p><strong>Item:</strong> ${data.itemTitle}</p>
            <p><strong>Dates:</strong> ${data.startDate} to ${data.endDate}</p>
            <p><strong>Total Price:</strong> $${data.totalPrice}</p>
            <p><strong>Owner:</strong> ${data.ownerName}</p>
          </div>
          <p>You can contact the owner through the BorrowBuddy platform for any questions.</p>
          <p>Best regards,<br>The BorrowBuddy Team</p>
        `;
        break;

      case 'booking_request':
        subject = "New Booking Request - BorrowBuddy";
        htmlContent = `
          <h1>You have a new booking request!</h1>
          <p>Hello ${data.ownerName},</p>
          <p>Someone wants to rent your <strong>${data.itemTitle}</strong>.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Request Details:</h3>
            <p><strong>Item:</strong> ${data.itemTitle}</p>
            <p><strong>Requested Dates:</strong> ${data.startDate} to ${data.endDate}</p>
            <p><strong>Total Price:</strong> $${data.totalPrice}</p>
            <p><strong>Renter:</strong> ${data.renterName}</p>
          </div>
          <p>Please log in to your BorrowBuddy account to review and respond to this request.</p>
          <p>Best regards,<br>The BorrowBuddy Team</p>
        `;
        break;

      case 'message_received':
        subject = "New Message - BorrowBuddy";
        htmlContent = `
          <h1>You have a new message!</h1>
          <p>Hello ${data.receiverName},</p>
          <p>You have received a new message from <strong>${data.senderName}</strong>.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p>${data.content}</p>
          </div>
          <p>Please log in to your BorrowBuddy account to reply.</p>
          <p>Best regards,<br>The BorrowBuddy Team</p>
        `;
        break;

      case 'review_received':
        subject = "New Review Received - BorrowBuddy";
        htmlContent = `
          <h1>You received a new review!</h1>
          <p>Hello ${data.revieweeName},</p>
          <p><strong>${data.reviewerName}</strong> left you a ${data.rating}-star review.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Rating:</strong> ${data.rating}/5 stars</p>
            <p><strong>Comment:</strong></p>
            <p>${data.comment}</p>
          </div>
          <p>Thank you for being part of the BorrowBuddy community!</p>
          <p>Best regards,<br>The BorrowBuddy Team</p>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "BorrowBuddy <noreply@borrowbuddy.com>",
      to: [to],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-notification function:", error);
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
