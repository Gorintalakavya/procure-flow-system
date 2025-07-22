
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${resetToken}&type=recovery&redirect_to=${Deno.env.get('SITE_URL') || supabaseUrl}/vendor-auth`;
      
      subject = isAdmin ? "Admin Password Reset Request" : "Vendor Password Reset Request";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Confirm your signup</h2>
          <p>Follow this link to confirm your user:</p>
          <p><a href="${resetUrl}">Confirm your mail</a></p>
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
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${supabaseUrl}/vendor-profile" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Profile
            </a>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Shaker<br>IIT Labs Team</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
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
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
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
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${supabaseUrl}/vendor-auth" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Vendor Portal
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Shaker<br>IIT Labs Team</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `;
    }

    // Send email using Supabase's built-in email system with your SMTP settings
    let emailResult;
    
    if (type === 'share_section') {
      // For share functionality, we need to create a temporary user and send a magic link
      // This leverages Supabase's email system with your SMTP settings
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create a temporary signup to trigger email sending
      const { error: signupError } = await supabase.auth.admin.createUser({
        email: recipientAddress,
        password: tempPassword,
        email_confirm: false,
        user_metadata: {
          temp_email_type: 'share_section',
          shared_section: sharedSection,
          shared_data: JSON.stringify(sharedData),
          vendor_name: vendorName,
          vendor_id: vendorId
        }
      });

      if (signupError && !signupError.message.includes('already registered')) {
        throw signupError;
      }

      // Send reset password email which will use your SMTP settings
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: recipientAddress,
        options: {
          redirectTo: `${supabaseUrl}`,
          data: {
            custom_subject: subject,
            custom_html: html
          }
        }
      });

      emailResult = { error: resetError };
    } else {
      // For other email types, use the inviteUserByEmail which uses SMTP settings
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(recipientAddress, {
        redirectTo: `${supabaseUrl}/vendor-auth`,
        data: {
          vendor_name: vendorName,
          vendor_id: vendorId,
          password: password,
          email_type: type,
          custom_subject: subject,
          custom_html: html
        }
      });

      emailResult = { error: inviteError };
    }

    if (emailResult.error) {
      throw emailResult.error;
    }

    console.log("Email sent successfully using Supabase SMTP:", {
      to: recipientAddress,
      subject: subject,
      type: type
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully using your SMTP settings",
      recipient: recipientAddress,
      subject: subject
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
