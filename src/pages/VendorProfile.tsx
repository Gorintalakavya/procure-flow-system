
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, DollarSign, FileText, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorProfile = () => {
  const navigate = useNavigate();
  const [vendorUser, setVendorUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // General Information
  const [generalInfo, setGeneralInfo] = useState({
    legal_entity_name: '',
    trade_name: '',
    vendor_id: '',
    vendor_type: '',
    street_address: '',
    street_address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    contact_name: '',
    email: '',
    contact_phone: '',
    phone_number: '',
    website: '',
    year_established: '',
    employee_count: '',
    annual_revenue: '',
    business_description: ''
  });

  // Financial Information
  const [financialInfo, setFinancialInfo] = useState({
    tax_id: '',
    vat_id: '',
    payment_terms: '',
    bank_account_details: '',
    currency: 'USD'
  });

  // Procurement Information
  const [procurementInfo, setProcurementInfo] = useState({
    relationship_owner: '',
    products_services_description: '',
    contract_effective_date: '',
    contract_expiration_date: '',
    reconciliation_account: ''
  });

  // Compliance Information
  const [complianceInfo, setComplianceInfo] = useState({
    w9_status: '',
    w8_ben_status: '',
    w8_ben_e_status: ''
  });

  useEffect(() => {
    // Check vendor authentication
    const vendor = localStorage.getItem('vendorUser');
    if (!vendor) {
      navigate('/vendor-auth');
      return;
    }
    
    const vendorData = JSON.parse(vendor);
    setVendorUser(vendorData);
    loadVendorProfile(vendorData.vendorId);
  }, [navigate]);

  const loadVendorProfile = async (vendorId: string) => {
    try {
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (error) {
        console.error('Error loading vendor profile:', error);
        return;
      }

      if (vendorData) {
        // Set general information
        setGeneralInfo({
          legal_entity_name: vendorData.legal_entity_name || '',
          trade_name: vendorData.trade_name || '',
          vendor_id: vendorData.vendor_id || '',
          vendor_type: vendorData.vendor_type || '',
          street_address: vendorData.street_address || '',
          street_address_line2: vendorData.street_address_line2 || '',
          city: vendorData.city || '',
          state: vendorData.state || '',
          postal_code: vendorData.postal_code || '',
          country: vendorData.country || '',
          contact_name: vendorData.contact_name || '',
          email: vendorData.email || '',
          contact_phone: vendorData.contact_phone || '',
          phone_number: vendorData.phone_number || '',
          website: vendorData.website || '',
          year_established: vendorData.year_established || '',
          employee_count: vendorData.employee_count || '',
          annual_revenue: vendorData.annual_revenue || '',
          business_description: vendorData.business_description || ''
        });

        // Set financial information
        setFinancialInfo({
          tax_id: vendorData.tax_id || '',
          vat_id: vendorData.vat_id || '',
          payment_terms: vendorData.payment_terms || '',
          bank_account_details: vendorData.bank_account_details || '',
          currency: vendorData.currency || 'USD'
        });

        // Set procurement information
        setProcurementInfo({
          relationship_owner: vendorData.relationship_owner || '',
          products_services_description: vendorData.products_services_description || vendorData.business_description || '',
          contract_effective_date: vendorData.contract_effective_date || '',
          contract_expiration_date: vendorData.contract_expiration_date || '',
          reconciliation_account: vendorData.reconciliation_account || ''
        });

        // Set compliance information
        setComplianceInfo({
          w9_status: vendorData.w9_status || '',
          w8_ben_status: vendorData.w8_ben_status || '',
          w8_ben_e_status: vendorData.w8_ben_e_status || ''
        });
      }
    } catch (error) {
      console.error('Error loading vendor profile:', error);
    }
  };

  const handleSave = async (section: string) => {
    if (!vendorUser) return;
    
    setIsLoading(true);

    try {
      let updateData = {};

      switch (section) {
        case 'general':
          updateData = { ...generalInfo };
          break;
        case 'financial':
          updateData = { ...financialInfo };
          break;
        case 'procurement':
          updateData = { ...procurementInfo };
          break;
        case 'compliance':
          updateData = { ...complianceInfo };
          break;
        default:
          updateData = { ...generalInfo, ...financialInfo, ...procurementInfo, ...complianceInfo };
      }

      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('vendor_id', vendorUser.vendorId);

      if (error) {
        console.error('Error updating vendor profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      // Log the update action
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorUser.vendorId,
          action: 'UPDATE_PROFILE',
          entity_type: 'vendor',
          entity_id: vendorUser.vendorId,
          new_values: updateData,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      toast.success(`${section === 'general' ? 'General information' : 
                    section === 'financial' ? 'Financial information' :
                    section === 'procurement' ? 'Procurement information' :
                    section === 'compliance' ? 'Compliance information' : 'Profile'} updated successfully!`);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An unexpected error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vendorUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
                <p className="text-gray-600">Manage your business information and compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Vendor ID: {vendorUser.vendorId}</span>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financial</span>
            </TabsTrigger>
            <TabsTrigger value="procurement" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Procurement</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
          </TabsList>

          {/* I. General Information */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>I. General Information</CardTitle>
                <CardDescription>Basic business and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal_entity_name">Legal Entity Name *</Label>
                    <Input
                      id="legal_entity_name"
                      value={generalInfo.legal_entity_name}
                      onChange={(e) => setGeneralInfo(prev => ({ ...prev, legal_entity_name: e.target.value }))}
                      placeholder="Enter legal business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trade_name">Trade Name</Label>
                    <Input
                      id="trade_name"
                      value={generalInfo.trade_name}
                      onChange={(e) => setGeneralInfo(prev => ({ ...prev, trade_name: e.target.value }))}
                      placeholder="Enter trade name (if different)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor_id">Vendor ID</Label>
                    <Input
                      id="vendor_id"
                      value={generalInfo.vendor_id}
                      disabled
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vendor_type">Vendor Type *</Label>
                    <Select 
                      value={generalInfo.vendor_type} 
                      onValueChange={(value) => setGeneralInfo(prev => ({ ...prev, vendor_type: value }))}
                    >
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
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <div>
                    <Label htmlFor="street_address">Street Address *</Label>
                    <Input
                      id="street_address"
                      value={generalInfo.street_address}
                      onChange={(e) => setGeneralInfo(prev => ({ ...prev, street_address: e.target.value }))}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="street_address_line2">Street Address Line 2</Label>
                    <Input
                      id="street_address_line2"
                      value={generalInfo.street_address_line2}
                      onChange={(e) => setGeneralInfo(prev => ({ ...prev, street_address_line2: e.target.value }))}
                      placeholder="Apt, suite, etc. (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={generalInfo.city}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={generalInfo.state}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        value={generalInfo.postal_code}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select 
                      value={generalInfo.country} 
                      onValueChange={(value) => setGeneralInfo(prev => ({ ...prev, country: value }))}
                    >
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

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_name">Contact Name *</Label>
                      <Input
                        id="contact_name"
                        value={generalInfo.contact_name}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, contact_name: e.target.value }))}
                        placeholder="Enter primary contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Contact Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={generalInfo.email}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_phone">Contact Phone Number</Label>
                      <Input
                        id="contact_phone"
                        value={generalInfo.contact_phone}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="Enter contact phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={generalInfo.website}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://www.yourcompany.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year_established">Year Established</Label>
                      <Input
                        id="year_established"
                        value={generalInfo.year_established}
                        onChange={(e) => setGeneralInfo(prev => ({ ...prev, year_established: e.target.value }))}
                        placeholder="YYYY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_count">Employee Count</Label>
                      <Select 
                        value={generalInfo.employee_count} 
                        onValueChange={(value) => setGeneralInfo(prev => ({ ...prev, employee_count: value }))}
                      >
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
                      <Label htmlFor="annual_revenue">Annual Revenue</Label>
                      <Select 
                        value={generalInfo.annual_revenue} 
                        onValueChange={(value) => setGeneralInfo(prev => ({ ...prev, annual_revenue: value }))}
                      >
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
                    <Label htmlFor="business_description">Business Description</Label>
                    <Textarea
                      id="business_description"
                      value={generalInfo.business_description}
                      onChange={(e) => setGeneralInfo(prev => ({ ...prev, business_description: e.target.value }))}
                      placeholder="Describe your business, products, and services..."
                      rows={4}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('general')} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save General Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* II. Financial and Tax Information */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>II. Financial and Tax Information</CardTitle>
                <CardDescription>Tax identification and payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tax_id">Tax ID</Label>
                    <Input
                      id="tax_id"
                      value={financialInfo.tax_id}
                      onChange={(e) => setFinancialInfo(prev => ({ ...prev, tax_id: e.target.value }))}
                      placeholder="Enter tax identification number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vat_id">VAT ID</Label>
                    <Input
                      id="vat_id"
                      value={financialInfo.vat_id}
                      onChange={(e) => setFinancialInfo(prev => ({ ...prev, vat_id: e.target.value }))}
                      placeholder="Enter VAT identification number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select 
                      value={financialInfo.payment_terms} 
                      onValueChange={(value) => setFinancialInfo(prev => ({ ...prev, payment_terms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net-15">Net 15</SelectItem>
                        <SelectItem value="net-30">Net 30</SelectItem>
                        <SelectItem value="net-45">Net 45</SelectItem>
                        <SelectItem value="net-60">Net 60</SelectItem>
                        <SelectItem value="net-90">Net 90</SelectItem>
                        <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={financialInfo.currency} 
                      onValueChange={(value) => setFinancialInfo(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bank_account_details">Bank Account Details</Label>
                  <Textarea
                    id="bank_account_details"
                    value={financialInfo.bank_account_details}
                    onChange={(e) => setFinancialInfo(prev => ({ ...prev, bank_account_details: e.target.value }))}
                    placeholder="Enter bank account details for payments..."
                    rows={3}
                  />
                </div>

                <Button onClick={() => handleSave('financial')} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Financial Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* III. Procurement & Relationship Information */}
          <TabsContent value="procurement">
            <Card>
              <CardHeader>
                <CardTitle>III. Procurement & Relationship Information</CardTitle>
                <CardDescription>Contract and relationship management details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="relationship_owner">Internal Relationship Owner</Label>
                    <Input
                      id="relationship_owner"
                      value={procurementInfo.relationship_owner}
                      onChange={(e) => setProcurementInfo(prev => ({ ...prev, relationship_owner: e.target.value }))}
                      placeholder="Person/department managing this vendor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reconciliation_account">Reconciliation Account (SAP)</Label>
                    <Input
                      id="reconciliation_account"
                      value={procurementInfo.reconciliation_account}
                      onChange={(e) => setProcurementInfo(prev => ({ ...prev, reconciliation_account: e.target.value }))}
                      placeholder="SAP reconciliation account"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="products_services_description">Description of Products/Services</Label>
                  <Textarea
                    id="products_services_description"
                    value={procurementInfo.products_services_description}
                    onChange={(e) => setProcurementInfo(prev => ({ ...prev, products_services_description: e.target.value }))}
                    placeholder="Detailed description of products and services offered..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contract_effective_date">Contract Effective Date</Label>
                    <Input
                      id="contract_effective_date"
                      type="date"
                      value={procurementInfo.contract_effective_date}
                      onChange={(e) => setProcurementInfo(prev => ({ ...prev, contract_effective_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract_expiration_date">Contract Expiration Date</Label>
                    <Input
                      id="contract_expiration_date"
                      type="date"
                      value={procurementInfo.contract_expiration_date}
                      onChange={(e) => setProcurementInfo(prev => ({ ...prev, contract_expiration_date: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('procurement')} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Procurement Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IV. Regulatory & Compliance Information */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>IV. Regulatory & Compliance Information</CardTitle>
                <CardDescription>Tax forms and compliance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="w9_status">W-9 Status</Label>
                    <Select 
                      value={complianceInfo.w9_status} 
                      onValueChange={(value) => setComplianceInfo(prev => ({ ...prev, w9_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select W-9 status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-required">Not Required</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="w8_ben_status">W8-BEN Status</Label>
                    <Select 
                      value={complianceInfo.w8_ben_status} 
                      onValueChange={(value) => setComplianceInfo(prev => ({ ...prev, w8_ben_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select W8-BEN status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-required">Not Required</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="w8_ben_e_status">W8-BEN-E Status</Label>
                    <Select 
                      value={complianceInfo.w8_ben_e_status} 
                      onValueChange={(value) => setComplianceInfo(prev => ({ ...prev, w8_ben_e_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select W8-BEN-E status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-required">Not Required</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => handleSave('compliance')} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Compliance Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProfile;
