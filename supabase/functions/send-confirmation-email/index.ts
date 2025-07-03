
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  vendorId: string;
  section: string;
  action: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, vendorId, section, action }: EmailRequest = await req.json();

    console.log('Sending confirmation email to:', email);
    console.log('Vendor ID:', vendorId);
    console.log('Section:', section);
    console.log('Action:', action);

    // For now, we'll just log the email that would be sent
    // In production, you would integrate with an email service like Resend
    const emailContent = {
      to: email,
      subject: `Vendor Profile Update Confirmation - ${section}`,
      html: `
        <h2>Vendor Profile Update Confirmation</h2>
        <p>Dear Vendor,</p>
        <p>Your <strong>${section}</strong> information has been successfully updated in our system.</p>
        <p><strong>Vendor ID:</strong> ${vendorId}</p>
        <p><strong>Updated Section:</strong> ${section.charAt(0).toUpperCase() + section.slice(1)}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Vendor Management Team</p>
      `
    };

    console.log('Email would be sent with content:', emailContent);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Confirmation email logged successfully',
      emailContent 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in send-confirmation-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
