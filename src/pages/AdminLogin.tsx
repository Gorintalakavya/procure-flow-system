
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Admin sign in attempt:', loginData.email);
      
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_profiles!inner(admin_id)
        `)
        .eq('email', loginData.email)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        console.error('❌ Admin not found:', adminError);
        toast.error('Invalid email or password');
        return;
      }

      if (adminData.password_hash !== loginData.password) {
        console.error('❌ Invalid password');
        toast.error('Invalid email or password');
        return;
      }

      const adminId = adminData.admin_profiles?.[0]?.admin_id || '';
      console.log('✅ Admin login successful. Admin ID:', adminId);

      localStorage.setItem('adminUser', JSON.stringify({
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        adminId: adminId,
        isAuthenticated: true
      }));

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

      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', signupData.email)
        .single();

      if (existingAdmin) {
        toast.error('Admin with this email already exists');
        return;
      }

      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          name: signupData.name,
          email: signupData.email,
          password_hash: signupData.password,
          role: signupData.role,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating admin:', createError);
        throw createError;
      }

      const adminId = generateUniqueAdminId();
      console.log('🆔 Generated Admin ID:', adminId);
      
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          admin_id: adminId,
          admin_user_id: newAdmin.id
        });

      if (profileError) {
        console.error('❌ Error creating admin profile:', profileError);
        throw profileError;
      }

      localStorage.setItem('adminUser', JSON.stringify({
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        adminId: adminId,
        isAuthenticated: true
      }));

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-slate-600 mt-2">Administrative access to procurement portal</p>
        </div>

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
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
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
                    {isLoading ? 'Signing In...' : 'Sign In'}
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
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create a password (min 6 characters)"
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin-signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="admin-signup-confirm-password"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your password"
                        className="pl-10"
                        required
                        minLength={6}
                      />
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
  );
};

export default AdminLogin;
