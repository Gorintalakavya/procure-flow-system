
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import sanitizeHtml from "npm:sanitize-html@2.17.0";

// Use your provided credentials directly with fallbacks to environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_cCeBZSWk_93jQ7fCnjqq4ybQpXcdjSCQX";
const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
const EMAIL_API_KEY = Deno.env.get("EMAIL_API_KEY") || "email-api-secure-key-2024";
const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:8080", "https://xinxmjswzapwzbzhlbyo.supabase.co", "https://xinxmjswzapwzbzhlbyo.lovableproject.com"];

// Enforce required environment variables
if (!RESEND_API_KEY || RESEND_API_KEY === "your-resend-api-key") {
  throw new Error("RESEND_API_KEY is required and must be set properly");
}

console.log("Email function initialized with RESEND_API_KEY:", RESEND_API_KEY ? "✓ Set" : "✗ Missing");

const resend = new Resend(RESEND_API_KEY);

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidVendorId = (vendorId: string): boolean => {
  return /^[A-Z0-9]{6,12}$/.test(vendorId);
};

const isValidAdminId = (adminId: string): boolean => {
  return /^ADM[A-Z0-9]{7}$/.test(adminId);
};

const VALID_ACTIONS = [
  'signup', 'signin', 'registration', 'approval', 'rejection', 'suspension', 
  'deletion', 'forgot-password', 'profile-update', 'admin-signin', 'admin-signup'
];

const isValidAction = (action: string): boolean => {
  return VALID_ACTIONS.includes(action);
};

const sanitizeSiteName = (siteName: string): string => {
  return sanitizeHtml(siteName, {
    allowedTags: [],
    allowedAttributes: {}
  }).replace(/[^a-zA-Z0-9\s-]/g, '').toLowerCase().replace(/\s+/g, '');
};

interface EmailRequest {
  email: string;
  vendorId?: string;
  adminId?: string;
  section: 'vendor' | 'admin';
  action: string;
  notes?: string;
  siteName?: string;
  siteUrl?: string;
  resetToken?: string;
}

const generateEmailContent = (req: EmailRequest) => {
  const { email, vendorId, adminId, section, action, notes, siteName = 'Vendor Management Portal', siteUrl = SITE_URL, resetToken } = req;
  
  const sanitizedNotes = notes ? sanitizeHtml(notes, {
    allowedTags: [],
    allowedAttributes: {}
  }) : '';

  const baseUrl = siteUrl.replace(/\/$/, '');
  const profileUrl = section === 'admin' 
    ? `${baseUrl}/admin-dashboard`
    : `${baseUrl}/vendor-profile`;

  const idDisplay = section === 'admin' 
    ? `Admin ID: ${adminId || 'N/A'}`
    : `Vendor ID: ${vendorId || 'N/A'}`;

  let subject = '';
  let content = '';

  switch (action) {
    case 'admin-signup':
      subject = 'Admin Account Created Successfully';
      content = `
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; color: white;">Admin Account Created Successfully!</h1>
        </div>
        <div style="background-color: #d4edda; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #155724; margin-top: 0;">Account Details:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Admin ID:</strong> ${adminId}</p>
          <p><strong>Account Created:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Your admin account has been created successfully.</p>
        <p>You can now access your admin dashboard to manage vendors and system settings.</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Admin Dashboard</a>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      `;
      break;

    case 'signup':
      subject = 'Vendor Account Created Successfully';
      content = `
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; color: white;">Vendor Account Created Successfully!</h1>
        </div>
        <div style="background-color: #d4edda; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #155724; margin-top: 0;">Account Details:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Vendor ID:</strong> ${vendorId}</p>
          <p><strong>Account Created:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Your vendor account has been created successfully.</p>
        <p>You can now access your vendor portal to complete your profile, upload documents, and manage your vendor information.</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Profile</a>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      `;
      break;

    case 'admin-signin':
      subject = 'Admin Portal Login Confirmation';
      content = `
        <h1>Admin Portal Login Confirmation</h1>
        <p>You have successfully signed in to your admin portal.</p>
        <p><strong>Admin ID: ${adminId}</strong></p>
        <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Dashboard</a>
        </div>
        <p>If this wasn't you, please contact our support team immediately.</p>
      `;
      break;

    case 'signin':
      subject = 'Vendor Portal Login Confirmation';
      content = `
        <h1>Vendor Portal Login Confirmation</h1>
        <p>You have successfully signed in to your vendor portal.</p>
        <p><strong>Vendor ID: ${vendorId}</strong></p>
        <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Dashboard</a>
        </div>
        <p>If this wasn't you, please contact our support team immediately.</p>
      `;
      break;

    case 'registration':
      subject = 'Vendor Registration Submitted';
      content = `
        <h1>Vendor Registration Received</h1>
        <p>Thank you for submitting your vendor registration.</p>
        <p><strong>Vendor ID: ${vendorId}</strong></p>
        <p>Your application is currently under review. You will receive an email notification once the review is complete.</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Profile</a>
        </div>
        <p>Review typically takes 2-3 business days.</p>
      `;
      break;

    case 'approval':
      subject = 'Vendor Application Approved';
      content = `
        <h1>Congratulations! Your Vendor Application has been Approved</h1>
        <p>We're pleased to inform you that your vendor application has been approved.</p>
        <p><strong>Vendor ID: ${vendorId}</strong></p>
        <p>You can now access all vendor portal features and begin conducting business with us.</p>
        ${sanitizedNotes ? `<p><strong>Administrator Notes:</strong> ${sanitizedNotes}</p>` : ''}
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Vendor Portal</a>
        </div>
      `;
      break;

    case 'rejection':
      subject = 'Vendor Application Status Update';
      content = `
        <h1>Vendor Application Status Update</h1>
        <p>We have completed the review of your vendor application.</p>
        <p><strong>Vendor ID: ${vendorId}</strong></p>
        <p>Unfortunately, we are unable to approve your application at this time.</p>
        ${sanitizedNotes ? `<p><strong>Reason:</strong> ${sanitizedNotes}</p>` : ''}
        <p>You may resubmit your application after addressing the mentioned concerns.</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Your Profile</a>
        </div>
      `;
      break;

    case 'suspension':
      subject = 'Vendor Account Status Update';
      content = `
        <h1>Vendor Account Suspended</h1>
        <p>Your vendor account has been temporarily suspended.</p>
        <p><strong>Vendor ID: ${vendorId}</strong></p>
        ${sanitizedNotes ? `<p><strong>Reason:</strong> ${sanitizedNotes}</p>` : ''}
        <p>Please contact our support team for more information about reactivating your account.</p>
        <p>Email: support@vendormanagementportal.com</p>
      `;
      break;

    case 'deletion':
      subject = 'Vendor Account Deleted';
      content = `
        <h1>Vendor Account Deleted</h1>
        <p>Your vendor account has been permanently deleted from our system.</p>
        <p><strong>Former Vendor ID: ${vendorId}</strong></p>
        ${sanitizedNotes ? `<p><strong>Administrator Notes:</strong> ${sanitizedNotes}</p>` : ''}
        <p>All associated data has been removed. If you believe this was done in error, please contact our support team.</p>
        <p>Email: support@vendormanagementportal.com</p>
      `;
      break;

    case 'forgot-password':
      const resetUrl = resetToken 
        ? `${baseUrl}/${section === 'admin' ? 'admin-login' : 'vendor-auth'}?reset=true&token=${resetToken}`
        : `${baseUrl}/${section === 'admin' ? 'admin-login' : 'vendor-auth'}?reset=true`;
      subject = 'Password Reset Request';
      content = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your ${section} account.</p>
        <p><strong>${idDisplay}</strong></p>
        <p>Click the button below to reset your password.</p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
      `;
      break;

    case 'profile-update':
      subject = 'Profile Updated Successfully';
      content = `
        <h1>Profile Updated</h1>
        <p>Your ${section} profile has been updated successfully.</p>
        <p><strong>${idDisplay}</strong></p>
        <p><strong>Update Time:</strong> ${new Date().toLocaleString()}</p>
        ${sanitizedNotes ? `<p><strong>Changes:</strong> ${sanitizedNotes}</p>` : ''}
        <div style="margin: 20px 0; text-align: center;">
          <a href="${profileUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Profile</a>
        </div>
      `;
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return { subject, content };
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  console.log(`📧 Received ${req.method} request to send-confirmation-email`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    // API Key authentication (optional, can be removed if not needed)
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    const requestBody: EmailRequest = await req.json();
    console.log('📧 Processing email request:', {
      email: requestBody.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // Mask email for privacy
      action: requestBody.action,
      section: requestBody.section,
      vendorId: requestBody.vendorId,
      adminId: requestBody.adminId
    });

    // Input validation
    if (!requestBody.email || !isValidEmail(requestBody.email)) {
      throw new Error("Valid email address is required");
    }

    if (!requestBody.section || !['vendor', 'admin'].includes(requestBody.section)) {
      throw new Error("Section must be 'vendor' or 'admin'");
    }

    if (!requestBody.action || !isValidAction(requestBody.action)) {
      throw new Error(`Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}`);
    }

    // Validate IDs when provided
    if (requestBody.vendorId && !isValidVendorId(requestBody.vendorId)) {
      throw new Error("Invalid vendor ID format");
    }

    if (requestBody.adminId && !isValidAdminId(requestBody.adminId)) {
      throw new Error("Invalid admin ID format");
    }

    const { subject, content } = generateEmailContent(requestBody);

    console.log(`📧 Sending email with subject: ${subject} to ${requestBody.email.replace(/(.{3}).*(@.*)/, '$1***$2')}`);

    const emailResponse = await resend.emails.send({
      from: `Vendor Portal <${FROM_EMAIL}>`,
      to: [requestBody.email],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${content}
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">
              This is an automated email from ${requestBody.siteName || 'Vendor Management Portal'}. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("❌ Resend API error:", JSON.stringify(emailResponse.error, null, 2));
      throw new Error(`Email sending failed: ${JSON.stringify(emailResponse.error)}`);
    }

    console.log("✅ Email sent successfully:", emailResponse.data);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Error in send-confirmation-email function:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
