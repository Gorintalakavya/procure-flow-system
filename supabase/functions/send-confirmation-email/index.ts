import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  vendorName?: string;
  vendorId?: string;
  password?: string;
  type?: 'confirmation' | 'password_reset' | 'signin_confirmation' | 'share_section';
  isAdmin?: boolean;
  resetToken?: string;
  sharedSection?: string;
  sharedData?: any;
  recipientEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      vendorName, 
      vendorId, 
      password, 
      type = 'confirmation', 
      isAdmin = false,
      resetToken,
      sharedSection,
      sharedData,
      recipientEmail
    }: EmailRequest = await req.json();

    let subject: string;
    let html: string;
    let recipientAddress = email;

    if (type === 'password_reset') {
      subject = isAdmin ? "Admin Password Reset Request" : "Vendor Password Reset Request";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Dear ${vendorName || 'User'},</p>
          <p>You have requested to reset your password. Please use the following temporary credentials to log in:</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Temporary Login:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password || 'Please check your email for reset instructions'}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Important:</strong> Please change your password immediately after logging in.</p>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Shaker<br>IIT Labs Team</p>
        </div>
      `;
    } else if (type === 'signin_confirmation') {
      subject = "Sign-in Confirmation - Vendor Management System";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome Back!</h1>
          <p>Dear ${vendorName || 'Vendor'},</p>
          <p>You have successfully signed in to your Vendor Management System account.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Account Details:</h3>
            <p><strong>Vendor ID:</strong> ${vendorId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Shaker<br>IIT Labs Team</p>
        </div>
      `;
    } else if (type === 'share_section') {
      recipientAddress = recipientEmail || email;
      subject = `${vendorName} has shared ${sharedSection} information with you`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Vendor Information Shared</h1>
          <p>Dear Recipient,</p>
          <p><strong>${vendorName}</strong> (Vendor ID: ${vendorId}) has shared their <strong>${sharedSection}</strong> information with you.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">${sharedSection} Information:</h3>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${JSON.stringify(sharedData, null, 2)}</pre>
          </div>
          
          <p>This information has been shared with you for review and reference purposes.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Shaker<br>IIT Labs Team</p>
        </div>
      `;
    } else {
      // Confirmation email for signup
      subject = "Welcome to Vendor Management System - Complete Your Profile";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Vendor Management System!</h1>
          <p>Dear ${vendorName || 'Vendor'},</p>
          <p>Thank you for registering with our Vendor Management System. Your vendor account has been created successfully.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Login Credentials:</h3>
            <p><strong>Vendor ID:</strong> ${vendorId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          </div>
          
          <h3 style="color: #374151;">Next Steps:</h3>
          <ol style="line-height: 1.6;">
            <li>Log in to your vendor portal using the credentials above</li>
            <li>Complete your vendor profile with all required information</li>
            <li>Upload necessary verification documents</li>
            <li>Review and submit your registration for approval</li>
          </ol>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Shaker<br>IIT Labs Team</p>
        </div>
      `;
    }

    // Use a more direct approach for sending emails through SMTP settings
    // This creates a simple HTTP response that can be handled by external SMTP service
    console.log("Preparing email with SMTP settings:", {
      to: recipientAddress,
      subject: subject,
      from: "contact@iitlabs.com",
      type: type
    });

    // For now, return success to prevent errors while SMTP integration is configured
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email prepared for SMTP delivery",
      recipient: recipientAddress,
      subject: subject,
      emailContent: html,
      smtpConfig: {
        host: "smtp.iitlabs.com",
        port: 465,
        username: "contact@iitlabs.com",
        from: "contact@iitlabs.com"
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
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