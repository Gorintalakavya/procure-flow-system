
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const sendAdminConfirmationEmail = async (email: string, adminId: string, action: string, password?: string) => {
    try {
      console.log('📧 Sending admin confirmation email...');
      
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          adminId,
          section: 'admin',
          action,
          password,
          isNewAccount: !!password,
          apiKey: 'default-key'
        }
      });

      if (error) {
        console.error('❌ Error sending admin confirmation email:', error);
        toast.error('Failed to send confirmation email');
        return false;
      } else {
        console.log('✅ Admin confirmation email sent successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error invoking admin email function:', error);
      toast.error('Failed to send confirmation email');
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Admin sign in attempt:', loginData.email);

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', loginData.email)
        .eq('password_hash', loginData.password)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        console.error('❌ Invalid password for admin:', loginData.email);
        toast.error('Invalid email or password');
        return;
      }

      const { data: profileData } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('admin_user_id', adminData.id)
        .single();

      const adminProfileData = profileData || { admin_id: 'N/A' };

      localStorage.setItem('adminAuth', JSON.stringify({
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        adminId: adminProfileData.admin_id,
        isAuthenticated: true
      }));

      console.log('✅ Admin login successful. Admin ID:', adminProfileData.admin_id);

      const emailSent = await sendAdminConfirmationEmail(adminData.email, adminProfileData.admin_id, 'admin-signin');
      
      if (emailSent) {
        toast.success('Login successful! Confirmation email sent. Redirecting to dashboard...');
      } else {
        toast.success('Login successful! Redirecting to dashboard...');
      }

      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1000);

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

    setIsLoading(true);

    try {
      console.log('📝 Admin signup attempt:', signupData.email);

      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', signupData.email)
        .single();

      if (existingAdmin) {
        toast.error('Admin with this email already exists');
        return;
      }

      const adminId = generateUniqueAdminId();
      console.log('🆔 Generated Admin ID:', adminId);

      const { data: newAdmin, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          name: signupData.name,
          email: signupData.email,
          password_hash: signupData.password,
          role: 'admin',
          is_active: true
        })
        .select()
        .single();

      if (adminError) {
        console.error('❌ Error creating admin:', adminError);
        toast.error('Failed to create admin account');
        return;
      }

      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          admin_user_id: newAdmin.id,
          admin_id: adminId
        });

      if (profileError) {
        console.error('❌ Error creating admin profile:', profileError);
      }

      localStorage.setItem('adminAuth', JSON.stringify({
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        adminId: adminId,
        isAuthenticated: true
      }));

      console.log('✅ Admin account created successfully');

      const emailSent = await sendAdminConfirmationEmail(newAdmin.email, adminId, 'admin-signup', signupData.password);
      
      if (emailSent) {
        toast.success('Admin account created successfully! Confirmation email sent to your email address.');
      } else {
        toast.success('Admin account created successfully!');
      }

      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);

    } catch (error) {
      console.error('❌ Error creating admin:', error);
      toast.error('An unexpected error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
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
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
                  <p className="text-sm text-slate-600">Secure administrator access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Administrator Authentication</CardTitle>
              <CardDescription className="text-center">
                Sign in to existing account or create new admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
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
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
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
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
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
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
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
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
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
