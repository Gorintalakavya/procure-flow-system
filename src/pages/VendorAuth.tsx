
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

      const isValidPassword = await bcrypt.compare(formData.password || '', user.password_hash);
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
      const hashedPassword = await bcrypt.hash(formData.password || '', 10);

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

      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*, vendors!inner(*)')
        .eq('email', forgotPasswordEmail)
        .single();

      if (fetchError || !user) {
        throw new Error('No vendor account found with this email address');
      }

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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">
              {showForgotPassword ? "Reset Password" : showSignUp ? "Vendor Sign Up" : "Vendor Authentication"}
            </CardTitle>
          </div>
          <CardDescription>
            {showForgotPassword ? "Enter your email to reset password" : showSignUp ? "Create a new vendor account" : "Sign in or create an account to continue"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {showForgotPassword ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="forgot-password-email">Email</Label>
                <Input
                  id="forgot-password-email"
                  placeholder="Enter your email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>
              <Button disabled={isLoading} onClick={handleForgotPassword} className="w-full">
                {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
              </Button>
              <Button variant="link" onClick={() => setShowForgotPassword(false)}>
                Back to Login
              </Button>
            </>
          ) : (
            <>
              {showSignUp && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Contact Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter contact name"
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {showSignUp ? (
                <Button disabled={isLoading} onClick={handleSignUp} className="w-full">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              ) : (
                <Button disabled={isLoading} onClick={handleSignIn} className="w-full">
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              )}

              <div className="flex justify-between text-sm">
                {!showSignUp ? (
                  <Button variant="link" onClick={() => setShowSignUp(true)}>
                    Create Account
                  </Button>
                ) : (
                  <Button variant="link" onClick={() => setShowSignUp(false)}>
                    Already have an account?
                  </Button>
                )}
                <Button variant="link" onClick={() => setShowForgotPassword(true)}>
                  Forgot Password?
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAuth;
