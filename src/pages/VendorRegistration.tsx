import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, Mail, Phone, Globe, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'Other', name: 'Other' }
];

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalEntityName: '',
    tradeName: '',
    companyType: '',
    operatingStatus: '',
    stockSymbol: '',
    dunsNumber: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    website: '',
    aboutTheCompany: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: '',
    streetAddress: '',
    streetAddressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    customCountry: '',
    productsServicesDescription: ''
  });

  const generateUniqueVendorId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = 'VEN';
    
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    for (let i = 0; i < 3; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
  };

  const sendVendorConfirmationEmail = async (email: string, action: string, vendorId?: string) => {
    try {
      console.log('📧 Sending vendor confirmation email...');
      const response = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          vendorId: vendorId || '',
          section: 'vendor',
          action,
          apiKey: 'default-key'
        }
      });

      if (response.error) {
        console.error('❌ Error sending vendor confirmation email:', response.error);
        toast.error('Failed to send confirmation email');
      } else {
        console.log('✅ Vendor confirmation email sent successfully');
        toast.success('Confirmation email sent to your email address!');
      }
    } catch (error) {
      console.error('❌ Error invoking vendor email function:', error);
      toast.error('Failed to send confirmation email');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Vendor registration attempt...');

      const requiredFields = [
        'legalEntityName', 'companyType',
        'streetAddress', 'city', 'state', 'zipCode', 'country'
      ];

      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.country === 'Other' && !formData.customCountry) {
        toast.error('Please specify your country name');
        return;
      }

      const vendorId = generateUniqueVendorId();
      console.log('🆔 Generated Vendor ID:', vendorId);

      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingVendor) {
        toast.error('A vendor with this email already exists');
        return;
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          vendor_id: vendorId,
          legal_entity_name: formData.legalEntityName,
          trade_name: formData.tradeName || null,
          vendor_type: formData.companyType,
          operating_status: formData.operatingStatus || null,
          stock_symbol: formData.stockSymbol || null,
          duns_number: formData.dunsNumber || null,
          contact_name: formData.contactName,
          email: formData.email,
          phone_number: formData.phoneNumber || null,
          website: formData.website || null,
          business_description: formData.aboutTheCompany || null,
          year_established: formData.yearEstablished || null,
          employee_count: formData.employeeCount || null,
          annual_revenue: formData.annualRevenue || null,
          street_address: formData.streetAddress,
          street_address_line2: formData.streetAddressLine2 || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country === 'Other' ? formData.customCountry : formData.country,
          products_services_description: formData.productsServicesDescription || null,
          registration_status: 'pending',
          currency: 'USD'
        })
        .select()
        .single();

      if (vendorError) {
        console.error('❌ Vendor registration error:', vendorError);
        throw vendorError;
      }

      console.log('✅ Vendor registered successfully:', vendorData);

      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'REGISTER',
          entity_type: 'vendor',
          entity_id: vendorId,
          new_values: { registration_status: 'pending' },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      await sendVendorConfirmationEmail(formData.email, 'registration', vendorId);

      localStorage.setItem('pendingVendor', JSON.stringify({
        vendorId: vendorId,
        email: formData.email,
        fromRegistration: true
      }));

      toast.success('Vendor registration submitted successfully!');
      navigate('/vendor-auth');

    } catch (error) {
      console.error('❌ Registration error:', error);
      toast.error('Failed to register vendor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900">Vendor Registration</h1>
            <p className="text-slate-600 mt-2">Complete your vendor profile to join our procurement network</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>
                Please provide accurate information for your vendor registration. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="legalEntityName">Legal Entity Name *</Label>
                      <Input
                        id="legalEntityName"
                        value={formData.legalEntityName}
                        onChange={(e) => handleInputChange('legalEntityName', e.target.value)}
                        placeholder="Enter legal entity name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradeName">Trade Name (Doing Business As)</Label>
                      <Input
                        id="tradeName"
                        value={formData.tradeName}
                        onChange={(e) => handleInputChange('tradeName', e.target.value)}
                        placeholder="Enter trade name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyType">Company Type *</Label>
                      <Select value={formData.companyType} onValueChange={(value) => handleInputChange('companyType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="nonprofit">Non-profit</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="for-profit">For Profit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        value={formData.yearEstablished}
                        onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                        placeholder="e.g., 2010"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="operatingStatus">Operating Status</Label>
                      <Select value={formData.operatingStatus} onValueChange={(value) => handleInputChange('operatingStatus', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operating status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="dissolved">Dissolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="stockSymbol">Stock Symbol</Label>
                      <Input
                        id="stockSymbol"
                        value={formData.stockSymbol}
                        onChange={(e) => handleInputChange('stockSymbol', e.target.value)}
                        placeholder="e.g., AAPL"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dunsNumber">D-U-N-S Number (optional)</Label>
                    <Input
                      id="dunsNumber"
                      value={formData.dunsNumber}
                      onChange={(e) => handleInputChange('dunsNumber', e.target.value)}
                      placeholder="Enter D-U-N-S number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="aboutTheCompany">About the Company</Label>
                    <Textarea
                      id="aboutTheCompany"
                      value={formData.aboutTheCompany}
                      onChange={(e) => handleInputChange('aboutTheCompany', e.target.value)}
                      placeholder="Describe your company and services"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Primary Contact Name</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Enter contact person's name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="Enter phone number"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                  
                  <div>
                    <Label htmlFor="streetAddress">Street Address *</Label>
                    <div className="relative mb-2">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="streetAddress"
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                        placeholder="Enter street address"
                        className="pl-10"
                        required
                      />
                    </div>
                    <Input
                      id="streetAddressLine2"
                      value={formData.streetAddressLine2}
                      onChange={(e) => handleInputChange('streetAddressLine2', e.target.value)}
                      placeholder="Apartment, suite, etc. (optional)"
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
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="Enter ZIP code"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.country === 'Other' && (
                      <div className="mt-2">
                        <Label htmlFor="customCountry">Enter Country Name *</Label>
                        <Input
                          id="customCountry"
                          value={formData.customCountry}
                          onChange={(e) => handleInputChange('customCountry', e.target.value)}
                          placeholder="Enter your country name"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Select value={formData.employeeCount} onValueChange={(value) => handleInputChange('employeeCount', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="501-1000">501-1,000</SelectItem>
                          <SelectItem value="1001-5000">1,001-5,000</SelectItem>
                          <SelectItem value="5001-10000">5,001-10,000</SelectItem>
                          <SelectItem value="10001-50000">10,001-50,000</SelectItem>
                          <SelectItem value="50000+">50,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="annualRevenue">Annual Revenue</Label>
                      <Select value={formData.annualRevenue} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select annual revenue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Under $100K">Under $100K</SelectItem>
                          <SelectItem value="$100K - $500K">$100K - $500K</SelectItem>
                          <SelectItem value="$500K - $1M">$500K - $1M</SelectItem>
                          <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                          <SelectItem value="$5M - $10M">$5M - $10M</SelectItem>
                          <SelectItem value="$10M+">$10M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="productsServicesDescription">Products/Services Description</Label>
                    <Textarea
                      id="productsServicesDescription"
                      value={formData.productsServicesDescription}
                      onChange={(e) => handleInputChange('productsServicesDescription', e.target.value)}
                      placeholder="Describe the products or services you offer"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Registration'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
