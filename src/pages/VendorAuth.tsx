import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const sendConfirmationEmail = async (email: string, vendorId: string, action: string) => {
    try {
      console.log('🚀 Sending confirmation email for', action, 'to', email);
      
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'default-api-key'
        },
        body: JSON.stringify({
          email,
          vendorId,
          section: 'vendor',
          action,
          siteName: 'Vendor Management Portal',
          siteUrl: window.location.origin
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error sending confirmation email:', errorText);
        return false;
      } else {
        const result = await response.json();
        console.log('✅ Confirmation email sent successfully:', result);
        return true;
      }
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Vendor forgot password request:', forgotPasswordEmail);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', forgotPasswordEmail)
        .single();

      if (userError || !userData) {
        toast.error('No vendor account found with this email address');
        return;
      }

      const emailSent = await sendConfirmationEmail(
        userData.email, 
        userData.vendor_id || 'N/A', 
        'forgot-password'
      );

      if (emailSent) {
        toast.success('Password reset instructions sent to your email address.');
      } else {
        toast.error('Failed to send password reset email');
      }

      setShowForgotPassword(false);
      setForgotPasswordEmail('');

    } catch (error) {
      console.error('❌ Vendor forgot password error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Vendor sign in attempt:', loginData.email);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .eq('password_hash', loginData.password)
        .single();

      if (userError || !userData) {
        console.error('❌ Invalid credentials for vendor:', loginData.email);
        toast.error('Invalid email or password');
        return;
      }

      localStorage.setItem('vendorAuth', JSON.stringify({
        id: userData.id,
        email: userData.email,
        vendorId: userData.vendor_id,
        isAuthenticated: true
      }));

      console.log('✅ Vendor login successful');

      const emailSent = await sendConfirmationEmail(userData.email, userData.vendor_id || 'N/A', 'signin');
      
      if (emailSent) {
        toast.success('Login successful! Confirmation email sent. Redirecting...');
      } else {
        toast.success('Login successful! Redirecting...');
      }

      setTimeout(() => {
        navigate('/vendor-profile');
      }, 1000);

    } catch (error) {
      console.error('❌ Vendor login error:', error);
      toast.error('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                    <p className="text-sm text-slate-600">Access your vendor account</p>
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
                <CardTitle className="text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email address to receive password reset instructions
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
                        placeholder="Enter your vendor email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Sign In
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  <p className="text-sm text-slate-600">Access your vendor account</p>
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
              <CardTitle className="text-center">Vendor Authentication</CardTitle>
              <CardDescription className="text-center">
                Sign in to your vendor account or register as a new vendor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="register">New Vendor</TabsTrigger>
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
                      className="w-full bg-blue-600 hover:bg-blue-700"
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
                      Forgot Password?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">New to our vendor network?</p>
                    <Button 
                      onClick={() => navigate('/vendor-registration')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Start Vendor Registration
                    </Button>
                    <p className="text-xs text-gray-500">
                      Complete our registration process to become an approved vendor
                    </p>
                  </div>
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
