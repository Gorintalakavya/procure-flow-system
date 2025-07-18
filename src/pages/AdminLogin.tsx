import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as bcrypt from 'bcryptjs';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'administrator'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendAdminConfirmationEmail = async (email: string, adminId: string, action: string) => {
    try {
      console.log(`📧 Sending admin confirmation email for action: ${action}`);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: email,
          adminId: adminId,
          section: 'admin',
          action: action,
          siteName: 'Vendor Management Portal',
          siteUrl: window.location.origin
        }
      });

      if (error) {
        console.error('❌ Error invoking admin email function:', error);
        throw error;
      }

      console.log('✅ Admin confirmation email sent successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending admin confirmation email:', error);
      throw error;
    }
  };

  const generateAdminId = () => {
    const prefix = 'ADM';
    const randomChars = Math.random().toString(36).substring(2, 9).toUpperCase();
    return prefix + randomChars;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Admin sign in attempt:', formData.email);

      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (fetchError || !adminUser) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(formData.password, adminUser.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      console.log('✅ Admin login successful. Admin ID:', adminUser.id);

      // Get admin profile to get the actual admin_id
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('admin_id')
        .eq('admin_user_id', adminUser.id)
        .single();

      // Send confirmation email
      try {
        await sendAdminConfirmationEmail(
          adminUser.email, 
          adminProfile?.admin_id || adminUser.id,
          'admin-signin'
        );
      } catch (emailError) {
        console.error('Email sending failed, but login continues:', emailError);
      }

      toast({
        title: "Login Successful",
        description: "Redirecting to admin dashboard...",
      });

      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      setError('Invalid email or password. Please try again.');
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
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
      console.log('📝 Admin signup attempt:', formData.email);

      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingAdmin) {
        throw new Error('Admin account with this email already exists');
      }

      // Generate admin ID and hash password
      const adminId = generateAdminId();
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      console.log('🆔 Generated Admin ID:', adminId);

      // Create admin user
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: formData.email,
          password_hash: hashedPassword,
          name: formData.name,
          role: formData.role,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      // Create admin profile
      await supabase
        .from('admin_profiles')
        .insert({
          admin_id: adminId,
          admin_user_id: newAdmin.id
        });

      console.log('✅ Admin account created successfully');

      // Send confirmation email
      try {
        await sendAdminConfirmationEmail(formData.email, adminId, 'admin-signup');
      } catch (emailError) {
        console.error('Email sending failed, but account creation continues:', emailError);
      }

      toast({
        title: "Account Created Successfully",
        description: "Redirecting to dashboard...",
      });

      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Admin signup error:', error);
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
      console.log('🔐 Admin forgot password request:', forgotPasswordEmail);

      // Check if admin exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', forgotPasswordEmail)
        .single();

      if (fetchError || !adminUser) {
        throw new Error('No admin account found with this email address');
      }

      // Get admin profile to get the actual admin_id
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('admin_id')
        .eq('admin_user_id', adminUser.id)
        .single();

      // Generate reset token (in production, store this in database)
      const resetToken = crypto.randomUUID();

      // Send forgot password email
      await sendAdminConfirmationEmail(
        forgotPasswordEmail,
        adminProfile?.admin_id || adminUser.id,
        'forgot-password'
      );

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for reset instructions.",
      });

      setShowForgotPassword(false);
      setForgotPasswordEmail('');

    } catch (error: any) {
      console.error('❌ Admin forgot password error:', error);
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
          <CardTitle className="text-2xl text-center">{showSignUp ? "Admin Sign Up" : "Admin Login"}</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {showSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
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
            <Input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {showForgotPassword && (
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
          )}

          {showForgotPassword ? (
            <Button disabled={isLoading} onClick={handleForgotPassword} className="w-full">
              {isLoading ? "Sending Reset Email..." : "Send Reset Email"}
            </Button>
          ) : showSignUp ? (
            <Button disabled={isLoading} onClick={handleSignUp} className="w-full">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          ) : (
            <Button disabled={isLoading} onClick={handleSignIn} className="w-full">
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          )}

          {!showForgotPassword && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
