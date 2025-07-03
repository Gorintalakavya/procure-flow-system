
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    legalEntityName: '',
    tradeName: '',
    vendorType: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    businessDescription: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['legalEntityName', 'vendorType', 'streetAddress', 'city', 'state', 'postalCode', 'country', 'contactName', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    try {
      // Generate a unique vendor ID (10 digits)
      const vendorId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      console.log('Vendor Registration Data:', { ...formData, vendorId });
      
      // Here you would normally save to Supabase
      // For now, we'll simulate success and navigate to auth page
      toast.success('Registration successful! Please sign up to complete your profile.');
      
      // Store vendor data temporarily in localStorage for the next step
      localStorage.setItem('pendingVendorData', JSON.stringify({ ...formData, vendorId }));
      
      navigate('/vendor-auth');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">Vendor Registration</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              New Vendor Registration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please provide your business information to begin the registration process.
              Fields marked with * are required.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="legalEntityName" className="flex items-center">
                    Legal Entity Name <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="legalEntityName"
                    value={formData.legalEntityName}
                    onChange={(e) => handleInputChange('legalEntityName', e.target.value)}
                    placeholder="Enter legal business name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tradeName">Trade Name (Optional)</Label>
                  <Input
                    id="tradeName"
                    value={formData.tradeName}
                    onChange={(e) => handleInputChange('tradeName', e.target.value)}
                    placeholder="Enter trade name if different"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vendorType" className="flex items-center">
                  Vendor Type/Category <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select onValueChange={(value) => handleInputChange('vendorType', value)} required>
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

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                <div>
                  <Label htmlFor="streetAddress" className="flex items-center">
                    Street Address <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="flex items-center">
                      City <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="flex items-center">
                      State/Province <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State/Province"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="flex items-center">
                      Postal Code <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Postal Code"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country" className="flex items-center">
                    Country <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('country', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName" className="flex items-center">
                      Contact Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="Primary contact name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="business@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Business Description */}
              <div>
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  placeholder="Describe your products or services..."
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" className="px-12">
                  <Check className="h-4 w-4 mr-2" />
                  Register Interest
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VendorRegistration;
