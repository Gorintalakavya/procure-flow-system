
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
  console.log('Email function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { email, vendorId, section, action }: EmailRequest = requestBody;

    console.log('Processing email request:');
    console.log('- Email:', email);
    console.log('- Vendor/Admin ID:', vendorId);
    console.log('- Section:', section);
    console.log('- Action:', action);

    // Create email content based on section and action type
    let subject = '';
    let htmlContent = '';
    let textContent = '';

    if (section === 'admin') {
      if (action === 'signup') {
        subject = `Welcome to Admin Portal - Account Created Successfully`;
        htmlContent = `
          <h2>🎉 Welcome to Admin Portal!</h2>
          <p>Dear Administrator,</p>
          <p>Your admin account has been successfully created in our vendor management system.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🆔 Admin ID:</strong> ${vendorId}</p>
            <p><strong>✅ Account Status:</strong> Active</p>
            <p><strong>👤 Role:</strong> Administrator</p>
          </div>
          <p>You now have full administrative access to manage vendors, compliance, and system settings.</p>
          <p>🔗 <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app-url.com'}/admin-dashboard">Access Admin Dashboard</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
        textContent = `Welcome to Admin Portal! Your admin account (${email}) has been created successfully. Admin ID: ${vendorId}`;
      } else if (action === 'signin') {
        subject = `Admin Portal - Successful Login Notification`;
        htmlContent = `
          <h2>🔐 Admin Login Notification</h2>
          <p>Dear Administrator,</p>
          <p>You have successfully logged into your admin portal account.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>🕐 Login Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🆔 Admin ID:</strong> ${vendorId}</p>
          </div>
          <p>If this wasn't you, please contact our support team immediately.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
        textContent = `Admin login successful for ${email} at ${new Date().toLocaleString()}`;
      }
    } else if (section === 'vendor') {
      if (action === 'registration') {
        subject = `🎉 Vendor Registration Successful - Welcome!`;
        htmlContent = `
          <h2>Registration Successful!</h2>
          <p>Dear Vendor,</p>
          <p>Thank you for registering with our vendor management system.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>🆔 Vendor ID:</strong> ${vendorId}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>📋 Registration Status:</strong> Pending Review</p>
          </div>
          <p>Your registration has been submitted and is currently under review. You can now create your login credentials to access your vendor profile.</p>
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>✅ Create your login credentials using your Vendor ID</li>
            <li>📝 Complete your vendor profile with additional information</li>
            <li>⏳ Wait for admin approval</li>
          </ul>
          <p>🔗 <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app-url.com'}/vendor-auth">Create Your Account</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
        textContent = `Vendor registration successful! Vendor ID: ${vendorId}. Please create your login credentials to continue.`;
      } else if (action === 'signup') {
        subject = `Welcome to Vendor Portal - Account Created Successfully`;
        htmlContent = `
          <h2>🎉 Welcome to Vendor Portal!</h2>
          <p>Dear Vendor,</p>
          <p>Your vendor account has been successfully created in our vendor management system.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>🆔 Vendor ID:</strong> ${vendorId}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>✅ Account Status:</strong> Active</p>
          </div>
          <p>You can now access your vendor profile and manage your information through our portal.</p>
          <p><strong>Please complete all sections of your vendor profile including:</strong></p>
          <ul>
            <li>ℹ️ General Information</li>
            <li>💰 Financial Information</li>
            <li>📋 Procurement Information</li>
            <li>🛡️ Compliance Information</li>
          </ul>
          <p>🔗 <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app-url.com'}/vendor-profile">Access Your Profile</a></p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
        textContent = `Welcome to Vendor Portal! Your account (${email}) has been created. Vendor ID: ${vendorId}`;
      } else if (action === 'signin') {
        subject = `Vendor Portal - Successful Login Notification`;
        htmlContent = `
          <h2>🔐 Successful Login Notification</h2>
          <p>Dear Vendor,</p>
          <p>You have successfully logged into your vendor portal account.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>🆔 Vendor ID:</strong> ${vendorId}</p>
            <p><strong>🕐 Login Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
          </div>
          <p>If this wasn't you, please contact our support team immediately.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
        textContent = `Vendor login successful for ${email} at ${new Date().toLocaleString()}`;
      } else if (action === 'forgot-password') {
        subject = `Password Reset Instructions - Vendor Portal`;
        htmlContent = `
          <h2>🔑 Password Reset Request</h2>
          <p>Dear User,</p>
          <p>We received a request to reset your password for the Vendor Portal.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🕐 Request Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>If you did not request this password reset, please ignore this email and contact our support team.</p>
          <p>For security reasons, please contact our support team directly to reset your password.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
        textContent = `Password reset requested for ${email}`;
      }
    } else {
      // Profile update confirmations
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
      subject = `✅ Profile Update Confirmation - ${sectionName} Information`;
      htmlContent = `
        <h2>Profile Update Confirmation</h2>
        <p>Dear User,</p>
        <p>Your <strong>${sectionName} Information</strong> has been successfully updated in our system.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>📝 Updated Section:</strong> ${sectionName}</p>
          <p><strong>🕐 Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          ${vendorId ? `<p><strong>🆔 ID:</strong> ${vendorId}</p>` : ''}
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Vendor Management Team</p>
      `;
      textContent = `${sectionName} information updated successfully for ${email}`;
    }

    // For now, we'll simulate sending the email and log the content
    // In production, you would integrate with an email service like Resend, SendGrid, etc.
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
    console.log('Content prepared successfully');

    // Log the email content to console for debugging
    console.log('Email Content:', emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Confirmation email processed successfully',
      emailData: {
        to: email,
        subject: subject,
        timestamp: emailData.timestamp,
        section: section,
        action: action
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
