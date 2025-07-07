
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalEntityName: '',
    tradeName: '',
    vendorType: '',
    streetAddress: '',
    streetAddressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    contactPhone: '',
    businessDescription: '',
    website: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendConfirmationEmail = async (email: string, vendorId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          vendorId,
          section: 'vendor',
          action: 'registration'
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast.error('Failed to send confirmation email, but registration was successful');
      } else {
        toast.success('Registration successful! Confirmation email sent.');
      }
    } catch (error) {
      console.error('Error invoking email function:', error);
      toast.error('Failed to send confirmation email, but registration was successful');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['legalEntityName', 'vendorType', 'streetAddress', 'city', 'state', 'postalCode', 'country', 'contactName', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique vendor ID using timestamp and random number
      const timestamp = Date.now().toString();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const vendorId = `VND-${timestamp.slice(-6)}-${randomNum}`;

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          vendor_id: vendorId,
          legal_entity_name: formData.legalEntityName,
          trade_name: formData.tradeName || null,
          vendor_type: formData.vendorType,
          street_address: formData.streetAddress,
          street_address_line2: formData.streetAddressLine2 || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
          contact_name: formData.contactName,
          email: formData.email,
          phone_number: formData.phoneNumber || null,
          contact_phone: formData.contactPhone || null,
          business_description: formData.businessDescription || null,
          website: formData.website || null,
          year_established: formData.yearEstablished || null,
          employee_count: formData.employeeCount || null,
          annual_revenue: formData.annualRevenue || null,
          registration_status: 'pending'
        })
        .select()
        .single();

      if (vendorError) {
        console.error('Error creating vendor:', vendorError);
        toast.error('Failed to register vendor');
        return;
      }

      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'REGISTER',
          entity_type: 'vendor',
          entity_id: vendorId,
          new_values: formData,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      await sendConfirmationEmail(formData.email, vendorId);
      
      localStorage.setItem('pendingVendor', JSON.stringify({
        vendorId: vendorId,
        email: formData.email,
        contactName: formData.contactName
      }));

      navigate('/vendor-auth');

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Registration</h1>
                <p className="text-gray-600">Register your business with our procurement portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">General Information</CardTitle>
            <CardDescription>
              Please provide basic information about your business. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="legalEntityName">Legal Entity Name *</Label>
                  <Input
                    id="legalEntityName"
                    value={formData.legalEntityName}
                    onChange={(e) => handleInputChange('legalEntityName', e.target.value)}
                    placeholder="Enter your legal business name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tradeName">Trade Name</Label>
                  <Input
                    id="tradeName"
                    value={formData.tradeName}
                    onChange={(e) => handleInputChange('tradeName', e.target.value)}
                    placeholder="Enter your trade name (if different)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="vendorType">Vendor Type/Category *</Label>
                  <Select onValueChange={(value) => handleInputChange('vendorType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="service-provider">Service Provider</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    type="url"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Address</h3>
                <div>
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    placeholder="Enter your street address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="streetAddressLine2">Street Address Line 2</Label>
                  <Input
                    id="streetAddressLine2"
                    value={formData.streetAddressLine2}
                    onChange={(e) => handleInputChange('streetAddressLine2', e.target.value)}
                    placeholder="Apt, suite, etc. (optional)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="Enter primary contact name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="Enter contact phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input
                      id="yearEstablished"
                      value={formData.yearEstablished}
                      onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                      placeholder="YYYY"
                      pattern="[0-9]{4}"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Select onValueChange={(value) => handleInputChange('employeeCount', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-1000">201-1000</SelectItem>
                        <SelectItem value="1000+">1000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="annualRevenue">Annual Revenue</Label>
                    <Select onValueChange={(value) => handleInputChange('annualRevenue', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-1m">Under $1M</SelectItem>
                        <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                        <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                        <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                        <SelectItem value="over-100m">Over $100M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business, products, and services..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  className="px-8 py-3 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRegistration;
