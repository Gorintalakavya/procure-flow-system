
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import sanitizeHtml from "npm:sanitize-html@2.11.0";

// Environment variables validation
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://6e56a7fd-db0a-43dc-b3da-b3003493a03b.lovableproject.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Vendor Portal <onboarding@resend.dev>";
const API_KEY = Deno.env.get("EMAIL_API_KEY") || "default-key";
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "*").split(",");

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes("*") ? "*" : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Valid action types
const VALID_ACTIONS = [
  'registration', 'approval', 'rejection', 'signin', 'signup', 
  'forgot-password', 'profile-update', 'admin-signup', 'admin-signin'
];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input validation functions
const validateEmail = (email: string): boolean => {
  return typeof email === 'string' && EMAIL_REGEX.test(email) && email.length <= 254;
};

const validateId = (id: string): boolean => {
  return typeof id === 'string' && /^[A-Z0-9]{3,20}$/.test(id);
};

const validateAction = (action: string): boolean => {
  return typeof action === 'string' && VALID_ACTIONS.includes(action);
};

const validatePassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6 && password.length <= 128;
};

const sanitizeNotes = (notes: string): string => {
  if (!notes || typeof notes !== 'string') return '';
  return sanitizeHtml(notes, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    allowedAttributes: {},
    textFilter: (text) => text.length > 1000 ? text.substring(0, 1000) + '...' : text
  });
};

interface EmailRequest {
  email: string;
  vendorId?: string;
  adminId?: string;
  section?: string;
  action?: string;
  password?: string;
  isNewAccount?: boolean;
  notes?: string;
  apiKey?: string;
}

const generateResetToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const requestData: EmailRequest = await req.json();
    
    // API Key authentication
    const providedApiKey = requestData.apiKey || req.headers.get('x-api-key');
    if (providedApiKey !== API_KEY) {
      console.error("Invalid API key provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, vendorId, adminId, section, action, password, isNewAccount, notes } = requestData;

    // Validate required fields
    if (!validateEmail(email)) {
      console.error("Invalid email format:", email);
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!validateAction(action || '')) {
      console.error("Invalid action:", action);
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (vendorId && !validateId(vendorId)) {
      console.error("Invalid vendor ID format:", vendorId);
      return new Response(JSON.stringify({ error: "Invalid vendor ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (adminId && !validateId(adminId)) {
      console.error("Invalid admin ID format:", adminId);
      return new Response(JSON.stringify({ error: "Invalid admin ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (password && !validatePassword(password)) {
      console.error("Invalid password format for email:", email);
      return new Response(JSON.stringify({ error: "Invalid password format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sanitizedNotes = sanitizeNotes(notes || '');

    console.log(`Processing email request for: ${email}, action: ${action}`);

    let emailSubject = "";
    let emailContent = "";

    if (isNewAccount && password) {
      // Send credentials for new account
      if (vendorId) {
        emailSubject = "Welcome to Vendor Portal - Your Login Credentials";
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Welcome to the Vendor Portal!</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; margin-bottom: 20px;">Your vendor account has been created successfully.</p>
              
              <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Your Login Credentials:</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Vendor ID:</strong> ${vendorId}</p>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Important:</strong> Please save these credentials securely. You will need them to access your vendor portal.</p>
              </div>
              
              <p>Please visit the vendor portal to complete your profile and upload required documents.</p>
              <p>If you have any questions, please contact our support team.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/vendor-auth" 
                   style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Access Vendor Portal
                </a>
              </div>
            </div>
            <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
            </div>
          </div>
        `;
      } else if (adminId) {
        emailSubject = "Welcome to Admin Portal - Your Login Credentials";
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Welcome to the Admin Portal!</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; margin-bottom: 20px;">Your admin account has been created successfully.</p>
              
              <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #1f2937; margin-top: 0;">Your Login Credentials:</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Admin ID:</strong> ${adminId}</p>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Important:</strong> Please save these credentials securely. You will need them to access the admin portal.</p>
              </div>
              
              <p>Please visit the admin portal to manage vendors and system settings.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/admin-login" 
                   style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Access Admin Portal
                </a>
              </div>
            </div>
            <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0;">Best regards,<br>The Admin Team</p>
            </div>
          </div>
        `;
      }
    } else {
      // Send confirmation for various actions
      if (vendorId) {
        switch (action) {
          case 'registration':
            emailSubject = `Vendor Registration Confirmation - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Registration Successful!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Thank you for registering with our vendor portal.</p>
                  
                  <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Registration Details:</h2>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> Pending Review</p>
                  </div>
                  
                  <p>Your registration is now under review. Our team will evaluate your application and notify you of the approval status within 2-3 business days.</p>
                  <p>You can now create your login credentials to access the vendor portal.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/vendor-auth" 
                       style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Create Login Credentials
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
            break;
          case 'approval':
            emailSubject = `Vendor Application Approved - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">🎉 Application Approved!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Congratulations! Your vendor application has been approved.</p>
                  
                  <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                    <h2 style="color: #065f46; margin-top: 0;">Approval Details:</h2>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> Active</p>
                    ${sanitizedNotes ? `<p><strong>Notes:</strong> ${sanitizedNotes}</p>` : ''}
                  </div>
                  
                  <p>You are now an approved vendor in our network. You can access all vendor portal features and begin conducting business with us.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/vendor-profile" 
                       style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Access Your Profile
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
            break;
          case 'rejection':
            emailSubject = `Vendor Application Status Update - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Application Status Update</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">We have reviewed your vendor application.</p>
                  
                  <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <h2 style="color: #991b1b; margin-top: 0;">Application Status:</h2>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Review Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> Not Approved</p>
                    ${sanitizedNotes ? `<p><strong>Reason:</strong> ${sanitizedNotes}</p>` : ''}
                  </div>
                  
                  <p>Unfortunately, we are unable to approve your vendor application at this time. If you believe this decision was made in error or if you have additional information to provide, please contact our support team.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/contact" 
                       style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Contact Support
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
            break;
          case 'signin':
            emailSubject = `Vendor Portal Login Confirmation - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Login Confirmation</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">You have successfully logged into the vendor portal.</p>
                  
                  <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Login Details:</h2>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Email:</strong> ${email}</p>
                  </div>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;">If this was not you, please contact support immediately and change your password.</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/vendor-profile" 
                       style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Go to Vendor Portal
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
            break;
          case 'signup':
            emailSubject = `Vendor Account Created - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Account Created Successfully!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Your vendor account has been created successfully.</p>
                  
                  <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                    <h2 style="color: #065f46; margin-top: 0;">Account Details:</h2>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Account Created:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <p>You can now access your vendor portal to complete your profile, upload documents, and manage your vendor information.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/vendor-profile" 
                       style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Complete Your Profile
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
            break;
          case 'forgot-password':
            const resetToken = generateResetToken();
            emailSubject = `Password Reset Request - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password.</p>
                  
                  <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Reset Details:</h2>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Email:</strong> ${email}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}" 
                       style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Reset Password
                    </a>
                  </div>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;">If you did not request this password reset, please ignore this email. This link will expire in 1 hour.</p>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
            break;
          default:
            emailSubject = `Vendor Profile Update - ${vendorId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Profile Update Confirmation</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Your vendor profile has been successfully updated.</p>
                  
                  <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Update Details:</h2>
                    <p><strong>Vendor ID:</strong> ${vendorId}</p>
                    <p><strong>Section Updated:</strong> ${section}</p>
                    <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <p>Thank you for keeping your information up to date. This helps us serve you better.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/vendor-profile" 
                       style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      View Your Profile
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Vendor Management Team</p>
                </div>
              </div>
            `;
        }
      } else if (adminId) {
        switch (action) {
          case 'admin-signup':
            emailSubject = `Admin Account Created - ${adminId}`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Admin Account Created!</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Your admin account has been created successfully.</p>
                  
                  <div style="background-color: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
                    <h2 style="color: #3730a3; margin-top: 0;">Account Details:</h2>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Admin ID:</strong> ${adminId}</p>
                    <p><strong>Account Created:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  <p>You can now access the admin dashboard to manage vendors and system settings.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/admin-dashboard" 
                       style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Access Admin Dashboard
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Admin Team</p>
                </div>
              </div>
            `;
            break;
          case 'admin-signin':
            emailSubject = `Admin Portal Login Confirmation`;
            emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Admin Login Confirmation</h1>
                </div>
                <div style="padding: 30px; background-color: #f9fafb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">You have successfully logged into the admin portal.</p>
                  
                  <div style="background-color: #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #1f2937; margin-top: 0;">Login Details:</h2>
                    <p><strong>Admin ID:</strong> ${adminId}</p>
                    <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Email:</strong> ${email}</p>
                  </div>
                  
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;">If this was not you, please contact support immediately.</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${SITE_URL}/admin-dashboard" 
                       style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Go to Admin Dashboard
                    </a>
                  </div>
                </div>
                <div style="background-color: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0;">Best regards,<br>The Admin Team</p>
                </div>
              </div>
            `;
            break;
        }
      }
    }

    console.log(`Sending email with subject: ${emailSubject}`);

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: emailSubject,
      html: emailContent,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
