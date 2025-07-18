import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client";
import * as bcrypt from 'bcryptjs';
import { Separator } from "@/components/ui/separator"

interface FormData {
  email: string;
  password?: string;
  name?: string;
  companyName?: string;
}

const VendorAuth = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendConfirmationEmail = async (email: string, vendorId: string, action: string) => {
    try {
      console.log(`🚀 Sending confirmation email for ${action} to ${email}`);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: email,
          vendorId: vendorId,
          section: 'vendor',
          action: action,
          siteName: 'Vendor Management Portal',
          siteUrl: window.location.origin
        }
      });

      if (error) {
        console.error('❌ Error invoking email function:', error);
        throw error;
      }

      console.log('✅ Confirmation email sent successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      throw error;
    }
  };

  const generateVendorId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let vendorId = '';
    for (let i = 0; i < 8; i++) {
      vendorId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return vendorId;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Vendor sign in attempt:', formData.email);

      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*, vendors!inner(*)')
        .eq('email', formData.email)
        .single();

      if (fetchError || !user) {
        throw new Error('Invalid credentials for vendor: ' + formData.email);
      }

      const isValidPassword = await bcrypt.compare(formData.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials for vendor: ' + formData.email);
      }

      console.log('✅ Vendor login successful');

      // Send confirmation email
      try {
        await sendConfirmationEmail(user.email, user.vendors.vendor_id, 'signin');
      } catch (emailError) {
        console.error('Email sending failed, but login continues:', emailError);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your profile...",
      });

      setTimeout(() => {
        navigate('/vendor-profile');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Invalid credentials for vendor:', formData.email);
      setError('Invalid email or password. Please try again.');
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Vendor signup attempt:', formData.email);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        throw new Error('Account with this email already exists');
      }

      // Generate vendor ID and hash password
      const vendorId = generateVendorId();
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      console.log('🆔 Generated Vendor ID:', vendorId);

      // Create user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: formData.email,
          password_hash: hashedPassword,
          is_authenticated: true
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create vendor record
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          vendor_id: vendorId,
          legal_entity_name: formData.companyName || 'New Vendor',
          email: formData.email,
          contact_name: formData.name || '',
          vendor_type: 'corporation',
          street_address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US',
          registration_status: 'pending',
          currency: 'USD'
        });

      if (vendorError) throw vendorError;

      // Update user with vendor_id
      await supabase
        .from('users')
        .update({ vendor_id: vendorId })
        .eq('id', newUser.id);

      console.log('✅ Vendor account created successfully');

      // Send confirmation email
      try {
        await sendConfirmationEmail(formData.email, vendorId, 'signup');
      } catch (emailError) {
        console.error('Email sending failed, but account creation continues:', emailError);
      }

      toast({
        title: "Account Created Successfully",
        description: "Welcome! Redirecting to your profile...",
      });

      setTimeout(() => {
        navigate('/vendor-profile');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Vendor signup error:', error);
      setError(error.message || 'Failed to create account');
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Vendor forgot password request:', forgotPasswordEmail);

      // Check if vendor exists
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*, vendors!inner(*)')
        .eq('email', forgotPasswordEmail)
        .single();

      if (fetchError || !user) {
        throw new Error('No vendor account found with this email address');
      }

      // Generate reset token (in production, store this in database)
      const resetToken = crypto.randomUUID();

      // Send forgot password email
      await sendConfirmationEmail(
        forgotPasswordEmail,
        user.vendors.vendor_id,
        'forgot-password'
      );

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for reset instructions.",
      });

      setShowForgotPassword(false);
      setForgotPasswordEmail('');

    } catch (error: any) {
      console.error('❌ Vendor forgot password error:', error);
      setError(error.message || 'Failed to send reset email');
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Vendor Authentication</CardTitle>
          <CardDescription className="text-center">Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button disabled={isLoading} onClick={handleSignIn}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="link" onClick={() => setShowForgotPassword(true)}>
            Forgot Password?
          </Button>
          <Separator />
          <div className="relative w-full">
            <Button variant="outline" onClick={() => navigate('/vendor-registration')}>
              Create Vendor Account
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-4 w-full max-w-md h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={() => setShowForgotPassword(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Enter your email to reset your password
                </h3>
                <input
                  type="email"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Email address"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
                <Button
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-red-600 rounded-lg focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                <button
                  type="button"
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAuth;
