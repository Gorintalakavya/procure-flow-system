
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
  console.log('📧 Email function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('📧 Request body received:', requestBody);
    
    const { email, vendorId, section, action }: EmailRequest = requestBody;

    console.log('📧 Processing email request:');
    console.log('- Email:', email);
    console.log('- ID (Vendor/Admin):', vendorId);
    console.log('- Section:', section);
    console.log('- Action:', action);

    // Create email content based on section and action type
    let subject = '';
    let htmlContent = '';
    let textContent = '';

    if (section === 'admin') {
      if (action === 'signup') {
        subject = `🎉 Welcome to Admin Portal - Account Created Successfully`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Account Created</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Admin Portal!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Admin Account Created Successfully</h2>
              <p>Dear Administrator,</p>
              <p>Congratulations! Your admin account has been successfully created in our procurement portal system.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="margin-top: 0; color: #667eea;">Account Details:</h3>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>🆔 Admin ID:</strong> ${vendorId}</p>
                <p style="margin: 5px 0;"><strong>✅ Account Status:</strong> Active</p>
                <p style="margin: 5px 0;"><strong>👤 Role:</strong> Administrator</p>
                <p style="margin: 5px 0;"><strong>🕐 Created:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>You now have full administrative access to:</p>
              <ul style="background-color: #f0f7ff; padding: 15px 15px 15px 35px; border-radius: 5px; margin: 15px 0;">
                <li>Manage vendor registrations and approvals</li>
                <li>Monitor compliance and certifications</li>
                <li>Access analytics and reporting tools</li>
                <li>Manage user roles and permissions</li>
                <li>Oversee document management system</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app-url.com'}/admin-dashboard" 
                   style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🔗 Access Admin Dashboard
                </a>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Security Reminder:</strong> Keep your Admin ID confidential and use strong passwords.</p>
              </div>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
              <p>Best regards,<br><strong>Procurement Portal Team</strong></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </body>
          </html>
        `;
        textContent = `Welcome to Admin Portal! Your admin account (${email}) has been created successfully. Admin ID: ${vendorId}`;
      } else if (action === 'signin') {
        subject = `🔐 Admin Portal - Successful Login Notification`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Admin Login Notification</h1>
            </div>
            
            <div style="background: white; padding: 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p>Dear Administrator,</p>
              <p>You have successfully logged into your admin portal account.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>🕐 Login Time:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>🆔 Admin ID:</strong> ${vendorId}</p>
              </div>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb; margin: 20px 0;">
                <p style="margin: 0; color: #721c24;"><strong>Security Alert:</strong> If this wasn't you, please contact our support team immediately.</p>
              </div>
              
              <p>Best regards,<br><strong>Procurement Portal Team</strong></p>
            </div>
          </body>
          </html>
        `;
        textContent = `Admin login successful for ${email} at ${new Date().toLocaleString()}`;
      }
    } else if (section === 'vendor') {
      if (action === 'registration') {
        subject = `🎉 Vendor Registration Successful - Welcome to Our Network!`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vendor Registration Successful</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #333; margin: 0; font-size: 28px;">🎉 Registration Successful!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Welcome to Our Vendor Network</h2>
              <p>Dear Vendor Partner,</p>
              <p>Thank you for registering with our procurement portal system! We're excited to have you join our vendor network.</p>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin-top: 0; color: #28a745;">Registration Details:</h3>
                <p style="margin: 5px 0;"><strong>🆔 Vendor ID:</strong> ${vendorId}</p>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>📋 Registration Status:</strong> Pending Review</p>
                <p style="margin: 5px 0;"><strong>🕐 Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #856404;">Important: Next Steps Required</h3>
                <p style="margin: 0;">Your registration has been submitted and is currently under review. Please create your login credentials to access your vendor profile.</p>
              </div>
              
              <p><strong>Next steps:</strong></p>
              <ol style="background-color: #f0f7ff; padding: 15px 15px 15px 35px; border-radius: 5px; margin: 15px 0;">
                <li>✅ Create your login credentials using your Vendor ID</li>
                <li>📝 Complete your vendor profile with additional information</li>
                <li>📄 Upload required compliance documents</li>
                <li>⏳ Wait for admin approval</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app-url.com'}/vendor-auth" 
                   style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🔗 Create Your Account
                </a>
              </div>
              
              <p>If you have any questions, please contact our support team with your Vendor ID: <strong>${vendorId}</strong></p>
              <p>Best regards,<br><strong>Procurement Portal Team</strong></p>
            </div>
          </body>
          </html>
        `;
        textContent = `Vendor registration successful! Vendor ID: ${vendorId}. Please create your login credentials to continue.`;
      } else if (action === 'signup') {
        subject = `🎉 Welcome to Vendor Portal - Account Created Successfully`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vendor Account Created</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Vendor Portal!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Account Created Successfully</h2>
              <p>Dear Vendor Partner,</p>
              <p>Your vendor account has been successfully created in our procurement portal system.</p>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin-top: 0; color: #28a745;">Account Details:</h3>
                <p style="margin: 5px 0;"><strong>🆔 Vendor ID:</strong> ${vendorId}</p>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>✅ Account Status:</strong> Active</p>
                <p style="margin: 5px 0;"><strong>🕐 Created:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>You can now access your vendor profile and manage your information through our portal.</p>
              
              <p><strong>Please complete all sections of your vendor profile including:</strong></p>
              <ul style="background-color: #f0f7ff; padding: 15px 15px 15px 35px; border-radius: 5px; margin: 15px 0;">
                <li>ℹ️ General Information</li>
                <li>💰 Financial Information</li>
                <li>📋 Procurement Information</li>
                <li>🛡️ Compliance Information</li>
                <li>📄 Document Uploads</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app-url.com'}/vendor-profile" 
                   style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🔗 Access Your Profile
                </a>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,<br><strong>Procurement Portal Team</strong></p>
            </div>
          </body>
          </html>
        `;
        textContent = `Welcome to Vendor Portal! Your account (${email}) has been created. Vendor ID: ${vendorId}`;
      } else if (action === 'signin') {
        subject = `🔐 Vendor Portal - Successful Login Notification`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vendor Login Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Successful Login</h1>
            </div>
            
            <div style="background: white; padding: 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p>Dear Vendor,</p>
              <p>You have successfully logged into your vendor portal account.</p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>🆔 Vendor ID:</strong> ${vendorId}</p>
                <p style="margin: 5px 0;"><strong>🕐 Login Time:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
              </div>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb; margin: 20px 0;">
                <p style="margin: 0; color: #721c24;"><strong>Security Alert:</strong> If this wasn't you, please contact our support team immediately.</p>
              </div>
              
              <p>Best regards,<br><strong>Procurement Portal Team</strong></p>
            </div>
          </body>
          </html>
        `;
        textContent = `Vendor login successful for ${email} at ${new Date().toLocaleString()}`;
      }
    }

    // Simulate sending the email (In production, integrate with Resend, SendGrid, etc.)
    const emailData = {
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
      timestamp: new Date().toISOString(),
      section: section,
      action: action,
      id: vendorId
    };

    console.log('📧 Email would be sent with the following details:');
    console.log('To:', email);
    console.log('Subject:', subject);
    console.log('✅ Enhanced email content prepared successfully');

    // In a real implementation, you would send the email here using a service like Resend
    // Example with Resend:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // const emailResponse = await resend.emails.send(emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Enhanced confirmation email processed successfully',
      emailData: {
        to: email,
        subject: subject,
        timestamp: emailData.timestamp,
        section: section,
        action: action,
        enhanced: true
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ Error in send-confirmation-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
