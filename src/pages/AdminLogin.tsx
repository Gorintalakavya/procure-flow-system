
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
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
      // Don't throw error here, just log it so signup/signin can continue
      return { success: false, error };
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
      console.log('🔐 Admin sign in attempt for:', formData.email);

      // First check if admin user exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', formData.email.toLowerCase().trim())
        .single();

      if (fetchError || !adminUser) {
        console.error('❌ Admin user not found:', fetchError);
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      console.log('👤 Found admin user:', adminUser.email);

      // Verify password
      const isValidPassword = await bcrypt.compare(formData.password, adminUser.password_hash);
      if (!isValidPassword) {
        console.error('❌ Invalid password for admin:', adminUser.email);
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      console.log('✅ Admin password validated successfully');

      // Get admin profile to get the actual admin_id
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('admin_id')
        .eq('admin_user_id', adminUser.id)
        .single();

      console.log('✅ Admin login successful. Admin ID:', adminProfile?.admin_id || adminUser.id);

      // Send confirmation email (don't block login if this fails)
      try {
        await sendAdminConfirmationEmail(
          adminUser.email, 
          adminProfile?.admin_id || adminUser.id,
          'admin-signin'
        );
        console.log('✅ Confirmation email sent successfully');
      } catch (emailError) {
        console.error('⚠️ Email sending failed, but login continues:', emailError);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to admin dashboard...",
      });

      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      setError(error.message || 'Invalid email or password. Please try again.');
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
      console.log('📝 Admin signup attempt for:', formData.email);

      // Validate required fields
      if (!formData.email || !formData.password || !formData.name) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const emailToCheck = formData.email.toLowerCase().trim();

      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', emailToCheck)
        .single();

      if (existingAdmin) {
        throw new Error('Admin account with this email already exists');
      }

      // Generate admin ID and hash password
      const adminId = generateAdminId();
      const hashedPassword = await bcrypt.hash(formData.password, 12);

      console.log('🆔 Generated Admin ID:', adminId);
      console.log('🔐 Password hashed successfully');

      // Create admin user
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: emailToCheck,
          password_hash: hashedPassword,
          name: formData.name.trim(),
          role: formData.role,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating admin user:', createError);
        throw new Error('Failed to create admin account. Please try again.');
      }

      console.log('✅ Admin user created with ID:', newAdmin.id);

      // Create admin profile
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          admin_id: adminId,
          admin_user_id: newAdmin.id
        });

      if (profileError) {
        console.error('❌ Error creating admin profile:', profileError);
        // Clean up the admin user if profile creation fails
        await supabase.from('admin_users').delete().eq('id', newAdmin.id);
        throw new Error('Failed to create admin profile. Please try again.');
      }

      console.log('✅ Admin profile created successfully');

      // Send confirmation email (don't block signup if this fails)
      try {
        await sendAdminConfirmationEmail(formData.email, adminId, 'admin-signup');
        console.log('✅ Confirmation email sent successfully');
      } catch (emailError) {
        console.error('⚠️ Email sending failed, but account creation continues:', emailError);
      }

      toast({
        title: "Account Created Successfully",
        description: "Your admin account has been created. Redirecting to dashboard...",
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
      console.log('🔐 Admin forgot password request for:', forgotPasswordEmail);

      if (!forgotPasswordEmail) {
        throw new Error('Please enter your email address');
      }

      const emailToCheck = forgotPasswordEmail.toLowerCase().trim();

      // Check if admin exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', emailToCheck)
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
              {showForgotPassword ? "Reset Password" : showSignUp ? "Admin Sign Up" : "Admin Login"}
            </CardTitle>
          </div>
          <CardDescription>
            {showForgotPassword ? "Enter your email to reset password" : "Enter your credentials to access the admin dashboard"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}

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
                <div className="grid gap-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
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
                {showSignUp && (
                  <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                )}
              </div>

              {showSignUp && (
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="procurement-officer">Procurement Officer</SelectItem>
                      <SelectItem value="finance-team">Finance Team</SelectItem>
                      <SelectItem value="compliance-manager">Compliance Manager</SelectItem>
                      <SelectItem value="audit-manager">Audit Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

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

export default AdminLogin;
