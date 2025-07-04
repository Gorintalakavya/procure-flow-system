
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVendor, setPendingVendor] = useState<any>(null);
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
        toast.error('Failed to send confirmation email, but account was created successfully');
      } else {
        toast.success('Confirmation email sent successfully!');
      }
    } catch (error) {
      console.error('Error invoking email function:', error);
      toast.error('Failed to send confirmation email, but account was created successfully');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .eq('password_hash', loginData.password)
        .eq('is_authenticated', true)
        .single();

      if (userError || !userData) {
        toast.error('Invalid email or password');
        return;
      }

      localStorage.setItem('vendorUser', JSON.stringify({
        id: userData.id,
        email: userData.email,
        vendorId: userData.vendor_id,
        isAuthenticated: true
      }));

      await sendConfirmationEmail(userData.email, userData.vendor_id || '', 'signin');
      toast.success('Login successful!');
      navigate('/vendor-profile');

    } catch (error) {
      console.error('Login error:', error);
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
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', signupData.email)
        .single();

      if (existingUser) {
        toast.error('User with this email already exists');
        return;
      }

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
        throw createError;
      }

      localStorage.setItem('vendorUser', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        vendorId: newUser.vendor_id,
        isAuthenticated: true
      }));

      await sendConfirmationEmail(newUser.email, newUser.vendor_id || '', 'signup');
      toast.success('Account created successfully!');
      localStorage.removeItem('pendingVendor');
      navigate('/vendor-profile');

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('An unexpected error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Vendor Portal</h1>
          <p className="text-slate-600 mt-2">Access your vendor account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Vendor Authentication</CardTitle>
            <CardDescription className="text-center">
              Sign in to existing account or create new vendor account
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
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
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

export default VendorAuth;
