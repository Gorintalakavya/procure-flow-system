
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Save, ArrowLeft, ArrowRight } from "lucide-react";
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

interface VendorRegistrationWizardProps {
  onComplete: (data: any) => void;
  initialData?: any;
}

const VendorRegistrationWizard: React.FC<VendorRegistrationWizardProps> = ({ onComplete, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    legalEntityName: initialData.legalEntityName || '',
    tradeName: initialData.tradeName || '',
    vendorType: initialData.vendorType || '',
    yearEstablished: initialData.yearEstablished || '',
    businessDescription: initialData.businessDescription || '',
    
    // Step 2: Contact Information
    contactName: initialData.contactName || '',
    email: initialData.email || '',
    phoneNumber: initialData.phoneNumber || '',
    website: initialData.website || '',
    
    // Step 3: Address Information
    streetAddress: initialData.streetAddress || '',
    streetAddressLine2: initialData.streetAddressLine2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'US',
    customCountry: initialData.customCountry || '',
    
    // Step 4: Business Details
    employeeCount: initialData.employeeCount || '',
    annualRevenue: initialData.annualRevenue || '',
    productsServicesDescription: initialData.productsServicesDescription || '',
    
    // Step 5: Financial Information
    taxId: initialData.taxId || '',
    vatId: initialData.vatId || '',
    bankAccountDetails: initialData.bankAccountDetails || '',
    paymentTerms: initialData.paymentTerms || '',
    currency: initialData.currency || 'USD'
  });

  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState(initialData.id || null);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    'Basic Information',
    'Contact Details', 
    'Address Information',
    'Business Details',
    'Financial Information'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveDraft = async () => {
    try {
      setIsDraft(true);
      
      const draftData = {
        ...formData,
        registration_status: 'draft',
        updated_at: new Date().toISOString()
      };

      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from('vendor_drafts')
          .update(draftData)
          .eq('id', draftId);
        
        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('vendor_drafts')
          .insert(draftData)
          .select()
          .single();
        
        if (error) throw error;
        setDraftId(data.id);
      }

      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsDraft(false);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.legalEntityName && formData.vendorType;
      case 2:
        return formData.contactName && formData.email;
      case 3:
        return formData.streetAddress && formData.city && formData.state && formData.postalCode && formData.country;
      case 4:
        return true; // Optional fields
      case 5:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }
    onComplete(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
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
                <Label htmlFor="tradeName">Trade Name</Label>
                <Input
                  id="tradeName"
                  value={formData.tradeName}
                  onChange={(e) => handleInputChange('tradeName', e.target.value)}
                  placeholder="Enter trade name (if different)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorType">Vendor Type *</Label>
                <Select value={formData.vendorType} onValueChange={(value) => handleInputChange('vendorType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
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
            <div>
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business and services"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Primary Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Enter contact person's name"
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
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div>
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                placeholder="Enter street address"
                required
                className="mb-2"
              />
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
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.country === 'Other' && (
                <div className="mt-2">
                  <Label htmlFor="customCountry">Enter Country Name</Label>
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
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Details</h3>
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
                    <SelectItem value="500+">500+</SelectItem>
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
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="Enter tax identification number"
                />
              </div>
              <div>
                <Label htmlFor="vatId">VAT ID</Label>
                <Input
                  id="vatId"
                  value={formData.vatId}
                  onChange={(e) => handleInputChange('vatId', e.target.value)}
                  placeholder="Enter VAT identification number"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Preferred Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="bankAccountDetails">Bank Account Details</Label>
              <Textarea
                id="bankAccountDetails"
                value={formData.bankAccountDetails}
                onChange={(e) => handleInputChange('bankAccountDetails', e.target.value)}
                placeholder="Enter bank account information (optional)"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Vendor Registration Wizard
          <Button
            onClick={saveDraft}
            variant="outline"
            size="sm"
            disabled={isDraft}
          >
            <Save className="h-4 w-4 mr-2" />
            {isDraft ? 'Saving...' : 'Save Draft'}
          </Button>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
        {/* Step indicators */}
        <div className="flex items-center justify-between mt-4">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                index + 1 < currentStep ? 'bg-green-500 border-green-500 text-white' :
                index + 1 === currentStep ? 'border-blue-500 text-blue-500' :
                'border-gray-300 text-gray-300'
              }`}>
                {index + 1 < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span className={`ml-2 text-xs ${
                index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {title}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {renderStep()}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            variant="outline"
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentStep === totalSteps ? (
            <Button onClick={handleSubmit}>
              Complete Registration
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorRegistrationWizard;
