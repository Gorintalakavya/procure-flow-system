
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorAuth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVendor, setPendingVendor] = useState<any>(null);
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    vendorId: ''
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if we have pending vendor data from registration
    const pendingData = localStorage.getItem('pendingVendor');
    if (pendingData) {
      const vendor = JSON.parse(pendingData);
      setPendingVendor(vendor);
      setSignUpData(prev => ({
        ...prev,
        email: vendor.email,
        vendorId: vendor.vendorId
      }));
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Create user in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: signUpData.email,
          password_hash: signUpData.password, // In production, this should be properly hashed
          vendor_id: signUpData.vendorId,
          is_authenticated: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        toast.error('Failed to create user account');
        return;
      }

      // Create initial vendor profile
      await supabase
        .from('vendor_profiles')
        .insert({
          vendor_id: signUpData.vendorId,
          user_id: userData.id
        });

      // Create default notification preferences
      await supabase
        .from('notification_preferences')
        .insert({
          vendor_id: signUpData.vendorId,
          email_notifications: true,
          status_updates: true,
          document_reminders: true,
          compliance_alerts: true
        });

      // Log the signup action
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: signUpData.vendorId,
          user_id: userData.id,
          action: 'SIGNUP',
          entity_type: 'user',
          entity_id: userData.id,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      toast.success('Account created successfully!');
      
      // Store user session
      localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        email: userData.email,
        vendorId: userData.vendor_id,
        isAuthenticated: true
      }));

      // Clear pending vendor data
      localStorage.removeItem('pendingVendor');

      // Navigate to vendor profile
      navigate('/vendor-profile');

    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Authenticate user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', signInData.email)
        .eq('password_hash', signInData.password) // In production, properly hash and compare
        .single();

      if (userError || !userData) {
        toast.error('Invalid email or password');
        return;
      }

      // Update authentication status
      await supabase
        .from('users')
        .update({ is_authenticated: true })
        .eq('id', userData.id);

      // Log the signin action
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: userData.vendor_id,
          user_id: userData.id,
          action: 'SIGNIN',
          entity_type: 'user',
          entity_id: userData.id,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      toast.success('Signed in successfully!');
      
      // Store user session
      localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        email: userData.email,
        vendorId: userData.vendor_id,
        isAuthenticated: true
      }));

      // Navigate to vendor profile
      navigate('/vendor-profile');

    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset functionality will be implemented soon');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Vendor Portal</h1>
          <p className="text-gray-600 mt-2">Access your vendor account</p>
          {pendingVendor && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Registration successful! Vendor ID: <strong>{pendingVendor.vendorId}</strong>
              </p>
              <p className="text-sm text-green-600">Please create your account to continue.</p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? 'Create your vendor account to access the portal' 
                : 'Sign in to your vendor account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignUp ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="vendorId">Vendor ID</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="vendorId"
                      value={signUpData.vendorId}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, vendorId: e.target.value }))}
                      placeholder="Enter your vendor ID"
                      className="pl-10"
                      disabled={!!pendingVendor}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="pl-10"
                      disabled={!!pendingVendor}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Create a password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your password"
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
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signInEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signInEmail"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signInPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signInPassword"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
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

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-800"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAuth;
