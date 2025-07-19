
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  type?: 'confirmation' | 'password_reset';
  isAdmin?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, vendorName, vendorId, password, type = 'confirmation', isAdmin = false }: EmailRequest = await req.json();

    let subject: string;
    let html: string;

    if (type === 'password_reset') {
      if (isAdmin) {
        subject = "Admin Password Reset Request";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Reset Request</h1>
            <p>Dear Admin,</p>
            <p>We received a request to reset your admin account password. If you made this request, please contact your system administrator to reset your password.</p>
            <p>If you did not request this password reset, please ignore this email or contact support immediately.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Vendor Management System</p>
            <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `;
      } else {
        subject = "Vendor Password Reset Request";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Reset Request</h1>
            <p>Dear Vendor,</p>
            <p>We received a request to reset your vendor account password. If you made this request, please contact support to reset your password.</p>
            <p>If you did not request this password reset, please ignore this email or contact support immediately.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Support Contact:</strong> support@innosoul.com</p>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Vendor Management System</p>
            <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `;
      }
    } else {
      // Confirmation email
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
            <p><strong>Temporary Password:</strong> ${password}</p>
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
            <a href="${Deno.env.get('SITE_URL') || 'https://vendor-management.com'}/vendor-auth" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Vendor Portal
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>Vendor Management Team<br>support@innosoul.com</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Vendor Management System <support@innosoul.com>",
      to: [email],
      subject: subject,
      html: html,
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
