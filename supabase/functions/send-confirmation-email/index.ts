
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

    // Create email content based on section and action type
    let subject = '';
    let htmlContent = '';

    if (section === 'admin') {
      if (action === 'signup') {
        subject = `Welcome to Admin Portal - Account Created`;
        htmlContent = `
          <h2>Welcome to Admin Portal!</h2>
          <p>Dear Administrator,</p>
          <p>Your admin account has been successfully created in our vendor management system.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Account Status:</strong> Active</p>
          <p><strong>Role:</strong> Administrator</p>
          <p>You now have full administrative access to manage vendors, compliance, and system settings.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
      } else if (action === 'signin') {
        subject = `Admin Portal - Successful Login`;
        htmlContent = `
          <h2>Admin Login Notification</h2>
          <p>Dear Administrator,</p>
          <p>You have successfully logged into your admin portal account.</p>
          <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>If this wasn't you, please contact our support team immediately.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
      }
    } else if (section === 'vendor') {
      if (action === 'registration') {
        subject = `Vendor Registration Successful - Welcome!`;
        htmlContent = `
          <h2>Registration Successful!</h2>
          <p>Dear Vendor,</p>
          <p>Thank you for registering with our vendor management system.</p>
          <p><strong>Vendor ID:</strong> ${vendorId}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Registration Status:</strong> Pending Review</p>
          <p>Your registration has been submitted and is currently under review. You can now create your login credentials to access your vendor profile.</p>
          <p>Next steps:</p>
          <ul>
            <li>Create your login credentials using your Vendor ID</li>
            <li>Complete your vendor profile with additional information</li>
            <li>Wait for admin approval</li>
          </ul>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
      } else if (action === 'signup') {
        subject = `Welcome to Vendor Portal - Account Created`;
        htmlContent = `
          <h2>Welcome to Vendor Portal!</h2>
          <p>Dear Vendor,</p>
          <p>Your vendor account has been successfully created in our vendor management system.</p>
          <p><strong>Vendor ID:</strong> ${vendorId}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Account Status:</strong> Active</p>
          <p>You can now access your vendor profile and manage your information through our portal.</p>
          <p>Please complete all sections of your vendor profile including:</p>
          <ul>
            <li>General Information</li>
            <li>Financial Information</li>
            <li>Procurement Information</li>
            <li>Compliance Information</li>
          </ul>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
      } else if (action === 'signin') {
        subject = `Vendor Portal - Successful Login`;
        htmlContent = `
          <h2>Successful Login Notification</h2>
          <p>Dear Vendor,</p>
          <p>You have successfully logged into your vendor portal account.</p>
          <p><strong>Vendor ID:</strong> ${vendorId}</p>
          <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>If this wasn't you, please contact our support team immediately.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
      } else if (action === 'forgot-password') {
        subject = `Password Reset Instructions - Vendor Portal`;
        htmlContent = `
          <h2>Password Reset Request</h2>
          <p>Dear User,</p>
          <p>We received a request to reset your password for the Vendor Portal.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you did not request this password reset, please ignore this email and contact our support team.</p>
          <p>For security reasons, please contact our support team directly to reset your password.</p>
          <p>Best regards,<br>Vendor Management Team</p>
        `;
      }
    } else {
      subject = `Profile Update Confirmation - ${section}`;
      htmlContent = `
        <h2>Profile Update Confirmation</h2>
        <p>Dear User,</p>
        <p>Your <strong>${section}</strong> information has been successfully updated in our system.</p>
        <p><strong>Updated Section:</strong> ${section.charAt(0).toUpperCase() + section.slice(1)}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Vendor Management Team</p>
      `;
    }

    // For now, we'll just log the email that would be sent
    // In production, you would integrate with an email service like Resend
    const emailContent = {
      to: email,
      subject: subject,
      html: htmlContent,
      timestamp: new Date().toISOString(),
      section: section,
      action: action,
      vendorId: vendorId
    };

    console.log('Email would be sent with content:', emailContent);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Confirmation email processed successfully',
      emailContent,
      timestamp: new Date().toISOString()
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
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
