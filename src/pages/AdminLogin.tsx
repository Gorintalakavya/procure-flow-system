import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const generateUniqueAdminId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = 'ADM';
    
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    for (let i = 0; i < 3; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
  };

  const sendAdminConfirmationEmail = async (email: string, action: string, adminId?: string) => {
    try {
      console.log('📧 Sending admin confirmation email...');
      const response = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          vendorId: adminId || '',
          section: 'admin',
          action
        }
      });

      if (response.error) {
        console.error('❌ Error sending admin confirmation email:', response.error);
      } else {
        console.log('✅ Admin confirmation email sent successfully');
        toast.success('Confirmation email sent!');
      }
    } catch (error) {
      console.error('❌ Error invoking admin email function:', error);
    }
  };

  const logAdminActivity = async (action: string, adminId: string, details: any = {}) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action,
          entity_type: 'admin_auth',
          entity_id: adminId,
          new_values: details,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Check if admin exists
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', forgotPasswordEmail.toLowerCase().trim())
        .maybeSingle();

      if (!adminData) {
        toast.error('No admin account found with this email');
        return;
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/admin-login`
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Admin sign in attempt:', loginData.email);
      
      // First check if admin exists and get their data
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_profiles!inner(admin_id)
        `)
        .eq('email', loginData.email)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError) {
        console.error('❌ Database error:', adminError);
        toast.error('Database error occurred');
        return;
      }

      if (!adminData) {
        console.error('❌ Admin not found with email:', loginData.email);
        toast.error('Invalid email or password');
        return;
      }

      // Simple password comparison (in production, use proper hashing)
      if (adminData.password_hash !== loginData.password) {
        console.error('❌ Invalid password for admin:', adminData.email);
        toast.error('Invalid email or password');
        return;
      }

      const adminId = adminData.admin_profiles?.[0]?.admin_id || '';
      console.log('✅ Admin login successful. Admin ID:', adminId);

      // Store admin session data
      localStorage.setItem('adminUser', JSON.stringify({
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        adminId: adminId,
        isAuthenticated: true
      }));

      // Log the sign-in activity
      await logAdminActivity('admin_signin', adminId, {
        email: adminData.email,
        timestamp: new Date().toISOString()
      });

      await sendAdminConfirmationEmail(adminData.email, 'signin', adminId);
      toast.success('Admin login successful!');
      navigate('/admin-dashboard');

    } catch (error) {
      console.error('❌ Admin login error:', error);
      toast.error('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!signupData.role) {
      toast.error('Please select a role');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Admin signup attempt:', signupData.email);

      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', signupData.email)
        .maybeSingle();

      if (existingAdmin) {
        toast.error('Admin with this email already exists');
        return;
      }

      // Generate unique admin ID
      const adminId = generateUniqueAdminId();
      console.log('🆔 Generated Admin ID:', adminId);

      // Create admin user
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          name: signupData.name,
          email: signupData.email,
          password_hash: signupData.password, // In production, hash this
          role: signupData.role,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating admin:', createError);
        toast.error('Failed to create admin account');
        return;
      }

      // Create admin profile with generated ID
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          admin_id: adminId,
          admin_user_id: newAdmin.id
        });

      if (profileError) {
        console.error('❌ Error creating admin profile:', profileError);
        toast.error('Failed to create admin profile');
        return;
      }

      // Store admin session data
      localStorage.setItem('adminUser', JSON.stringify({
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        adminId: adminId,
        isAuthenticated: true
      }));

      // Log the signup activity
      await logAdminActivity('admin_signup', adminId, {
        email: newAdmin.email,
        timestamp: new Date().toISOString()
      });

      console.log('✅ Admin account created successfully');
      await sendAdminConfirmationEmail(newAdmin.email, 'signup', adminId);
      toast.success('Admin account created successfully!');
      navigate('/admin-dashboard');

    } catch (error) {
      console.error('❌ Error creating admin:', error);
      toast.error('An unexpected error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
                    <p className="text-sm text-slate-600">Reset your password</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="max-w-md w-full mx-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="Enter your admin email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
                  <p className="text-sm text-slate-600">Administrative access to procurement portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Admin Authentication</CardTitle>
              <CardDescription className="text-center">
                Sign in to your admin account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="admin-signin-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-signin-email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your admin email"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="admin-signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-signin-password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="admin-signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-signup-name"
                          type="text"
                          value={signupData.name}
                          onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="admin-signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-signup-email"
                          type="email"
                          value={signupData.email}
                          onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email address"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="admin-signup-role">Role</Label>
                      <Select value={signupData.role} onValueChange={(value) => setSignupData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Procurement Officer">Procurement Officer</SelectItem>
                          <SelectItem value="Finance Team">Finance Team</SelectItem>
                          <SelectItem value="Vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="admin-signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-signup-password"
                          type={showPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Create a password (min 6 characters)"
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="admin-signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
