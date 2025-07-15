
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
  adminId?: string;
  section?: string;
  action?: string;
  password?: string;
  isNewAccount?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, vendorId, adminId, section, action, password, isNewAccount }: EmailRequest = await req.json();

    let emailSubject = "";
    let emailContent = "";

    if (isNewAccount && password) {
      // Send credentials for new account
      if (vendorId) {
        emailSubject = "Welcome to Vendor Portal - Your Login Credentials";
        emailContent = `
          <h1>Welcome to the Vendor Portal!</h1>
          <p>Your vendor account has been created successfully.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Your Login Credentials:</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Vendor ID:</strong> ${vendorId}</p>
          </div>
          <p><strong>Important:</strong> Please save these credentials securely. You will need them to access your vendor portal.</p>
          <p>Please visit the vendor portal to complete your profile and upload required documents.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Vendor Management Team</p>
        `;
      } else if (adminId) {
        emailSubject = "Welcome to Admin Portal - Your Login Credentials";
        emailContent = `
          <h1>Welcome to the Admin Portal!</h1>
          <p>Your admin account has been created successfully.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Your Login Credentials:</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Admin ID:</strong> ${adminId}</p>
          </div>
          <p><strong>Important:</strong> Please save these credentials securely. You will need them to access the admin portal.</p>
          <p>Please visit the admin portal to manage vendors and system settings.</p>
          <p>If you have any questions, please contact the system administrator.</p>
          <p>Best regards,<br>The Admin Team</p>
        `;
      }
    } else {
      // Send confirmation for profile updates
      if (vendorId) {
        emailSubject = `Vendor Profile ${action === 'update' ? 'Updated' : 'Confirmation'}`;
        emailContent = `
          <h1>Profile Update Confirmation</h1>
          <p>Your vendor profile has been successfully updated.</p>
          <p><strong>Vendor ID:</strong> ${vendorId}</p>
          <p><strong>Section Updated:</strong> ${section}</p>
          <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
          <p>Thank you for keeping your information up to date.</p>
          <p>Best regards,<br>The Vendor Management Team</p>
        `;
      } else if (adminId) {
        emailSubject = `Admin Login Confirmation`;
        emailContent = `
          <h1>Admin Login Confirmation</h1>
          <p>You have successfully logged into the admin portal.</p>
          <p><strong>Admin ID:</strong> ${adminId}</p>
          <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If this was not you, please contact support immediately.</p>
          <p>Best regards,<br>The Admin Team</p>
        `;
      }
    }

    const emailResponse = await resend.emails.send({
      from: "Vendor Portal <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailContent,
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
