
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
  vendorId?: string;
  section?: string;
  action?: string;
  notes?: string;
  credentials?: {
    email: string;
    password: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, vendorId, section, action, notes, credentials }: EmailRequest = await req.json();

    let subject = "";
    let html = "";

    if (section === "vendor") {
      if (action === "signup") {
        subject = "Welcome to Vendor Portal - Complete Your Registration";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to Vendor Portal</h1>
            <p>Thank you for registering with us. Your vendor account has been created successfully.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af;">Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${credentials?.email || email}</p>
              <p><strong>Password:</strong> ${credentials?.password || 'Please use the password you set during registration'}</p>
            </div>
            
            <p>Please log in to your vendor portal to complete your profile and upload required documents.</p>
            
            <div style="margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '')}.lovableproject.com/vendor-auth" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Vendor Portal
              </a>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `;
      } else if (action === "approval") {
        subject = "Vendor Registration Approved";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Vendor Registration Approved</h1>
            <p>Congratulations! Your vendor registration has been approved.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #15803d;">Status: APPROVED</h3>
              <p><strong>Vendor ID:</strong> ${vendorId}</p>
              ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p>You can now access all vendor portal features and submit proposals.</p>
            
            <div style="margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '')}.lovableproject.com/vendor-auth" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Vendor Portal
              </a>
            </div>
            
            <p>Thank you for your business!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `;
      } else if (action === "rejection") {
        subject = "Vendor Registration Status Update";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Vendor Registration Update</h1>
            <p>We have reviewed your vendor registration application.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626;">Status: NEEDS ATTENTION</h3>
              <p><strong>Vendor ID:</strong> ${vendorId}</p>
              ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p>Please review the feedback and update your application accordingly.</p>
            
            <div style="margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '')}.lovableproject.com/vendor-auth" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Update Application
              </a>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `;
      }
    } else if (section === "admin" && action === "password_reset") {
      subject = "Admin Password Reset Request";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Password Reset Request</h1>
          <p>We received a request to reset your admin password.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Please contact your system administrator to reset your password.</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <p>If you did not request this reset, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Vendor Portal <support@innosoul.com>",
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
