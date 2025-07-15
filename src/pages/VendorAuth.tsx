
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVendor, setPendingVendor] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    vendorId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pendingVendor');
    if (stored) {
      const vendor = JSON.parse(stored);
      setPendingVendor(vendor);
      setSignupData(prev => ({
        ...prev,
        vendorId: vendor.vendorId,
        email: vendor.email
      }));
    }
  }, []);

  const sendConfirmationEmail = async (email: string, vendorId: string, action: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          vendorId,
          section: 'vendor',
          action
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast.error('Failed to send confirmation email');
      } else {
        console.log('Confirmation email sent successfully');
        toast.success('Confirmation email sent to your email address!');
      }
    } catch (error) {
      console.error('Error invoking email function:', error);
      toast.error('Failed to send confirmation email');
    }
  };

  const logUserActivity = async (action: string, vendorId: string, details: any = {}) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action,
          entity_type: 'vendor_auth',
          entity_id: vendorId,
          vendor_id: vendorId,
          new_values: details,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Vendor sign in attempt:', loginData.email);

      // Check if user exists and credentials are correct
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .eq('password_hash', loginData.password)
        .eq('is_authenticated', true)
        .single();

      if (userError || !userData) {
        console.error('❌ Invalid credentials for:', loginData.email);
        toast.error('Invalid email or password');
        return;
      }

      // Get vendor details
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', userData.vendor_id)
        .single();

      if (vendorError || !vendorData) {
        console.error('❌ Vendor not found for user:', userData.vendor_id);
        toast.error('Vendor account not found');
        return;
      }

      // Store user session data
      localStorage.setItem('vendorUser', JSON.stringify({
        id: userData.id,
        email: userData.email,
        vendorId: userData.vendor_id,
        isAuthenticated: true,
        vendor: vendorData
      }));

      // Log the sign-in activity
      await logUserActivity('vendor_signin', userData.vendor_id, {
        email: userData.email,
        timestamp: new Date().toISOString()
      });

      // Send confirmation email
      await sendConfirmationEmail(userData.email, userData.vendor_id || '', 'signin');
      
      console.log('✅ Vendor login successful');
      toast.success('Login successful! Redirecting to your profile...');
      
      // Navigate to vendor profile
      setTimeout(() => {
        navigate('/vendor-profile');
      }, 1000);

    } catch (error) {
      console.error('❌ Login error:', error);
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

    if (!signupData.vendorId) {
      toast.error('Vendor ID is required. Please complete registration first.');
      return;
    }

    if (!signupData.email) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Vendor signup attempt:', signupData.email);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', signupData.email)
        .single();

      if (existingUser) {
        toast.error('User with this email already exists');
        return;
      }

      // Verify vendor exists
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', signupData.vendorId)
        .single();

      if (vendorError || !vendorData) {
        toast.error('Invalid vendor ID. Please complete vendor registration first.');
        return;
      }

      // Create user account
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: signupData.email,
          password_hash: signupData.password,
          vendor_id: signupData.vendorId,
          is_authenticated: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        toast.error('Failed to create user account');
        return;
      }

      // Update vendor status to 'in_progress' after account creation
      await supabase
        .from('vendors')
        .update({ 
          registration_status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', signupData.vendorId);

      // Store user session data
      localStorage.setItem('vendorUser', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        vendorId: newUser.vendor_id,
        isAuthenticated: true,
        vendor: vendorData
      }));

      // Log the signup activity
      await logUserActivity('vendor_signup', newUser.vendor_id, {
        email: newUser.email,
        timestamp: new Date().toISOString()
      });

      // Send confirmation email
      await sendConfirmationEmail(newUser.email, newUser.vendor_id || '', 'signup');
      
      console.log('✅ Vendor account created successfully');
      toast.success('Account created successfully! Confirmation email sent.');
      
      // Clear pending vendor data
      localStorage.removeItem('pendingVendor');
      
      // Navigate to vendor profile
      setTimeout(() => {
        navigate('/vendor-profile');
      }, 1000);

    } catch (error) {
      console.error('❌ Error creating user:', error);
      toast.error('An unexpected error occurred during signup');
    } finally {
      setIsLoading(false);
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
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email, vendor_id')
        .eq('email', forgotPasswordEmail)
        .single();

      if (!existingUser) {
        toast.error('No account found with this email address');
        return;
      }

      await sendConfirmationEmail(forgotPasswordEmail, existingUser.vendor_id || '', 'forgot-password');
      toast.success('Password reset instructions sent to your email');
      setForgotPasswordEmail('');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Vendor Portal</h1>
                  <p className="text-sm text-slate-600">Create your vendor account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-4">
          {pendingVendor && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Registration Complete!</strong><br />
                Vendor ID: {pendingVendor.vendorId}<br />
                Create your login credentials below.
              </p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Vendor Authentication</CardTitle>
              <CardDescription className="text-center">
                Sign in to existing account or create new vendor account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
                </TabsList>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-vendor-id">Vendor ID</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-vendor-id"
                          type="text"
                          value={signupData.vendorId}
                          onChange={(e) => setSignupData(prev => ({ ...prev, vendorId: e.target.value }))}
                          placeholder="Enter your vendor ID"
                          className="pl-10"
                          required
                          readOnly={!!pendingVendor}
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
                          readOnly={!!pendingVendor}
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
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>

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
                          placeholder="Enter your email"
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
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="forgot">
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
                          placeholder="Enter your email address"
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
                      {isLoading ? 'Sending...' : 'Send Reset Instructions'}
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

export default VendorAuth;
