import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, DollarSign, FileText, Shield, ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DocumentUploadSection from "@/components/DocumentUploadSection";

interface Director {
  din: string;
  name: string;
  designation: string;
  appointment_date: string;
}

interface PastDirector {
  din: string;
  name: string;
  designation: string;
  appointment_date: string;
  cessation_date: string;
}

const VendorProfile = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [generalInfo, setGeneralInfo] = useState({
    legal_entity_name: '',
    trade_name: '',
    contact_name: '',
    email: '',
    phone_number: '',
    website: '',
    street_address: '',
    street_address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    vendor_type: '',
    year_established: '',
    employee_count: '',
    annual_revenue: '',
    business_description: '',
    products_services_description: '',
    cin_number: '',
    roc_name: '',
    registration_number: '',
    date_of_incorporation: '',
    listed_in_stock_exchange: '',
    category_of_company: '',
    subcategory_of_company: '',
    class_of_company: '',
    roc_office: '',
    rd_name_region: ''
  });
  
  const [financialInfo, setFinancialInfo] = useState({
    tax_id: '',
    vat_id: '',
    payment_terms: '',
    currency: 'USD',
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: '',
    swift_code: '',
    bank_address: '',
    authorised_capital: '',
    paid_up_capital: ''
  });
  
  const [procurementInfo, setProcurementInfo] = useState({
    contract_effective_date: '',
    contract_expiration_date: '',
    relationship_owner: '',
    reconciliation_account: '',
    primary_contact: '',
    secondary_contact: ''
  });
  
  const [complianceInfo, setComplianceInfo] = useState({
    w9_status: '',
    w8_ben_status: '',
    w8_ben_e_status: '',
    certifications: '',
    compliance_forms: '',
    regulatory_notes: '',
    last_audit_date: '',
    next_audit_date: '',
    company_status: '',
    date_of_balance_sheet: '',
    date_of_last_agm: ''
  });

  const [directorsInfo, setDirectorsInfo] = useState<{
    current_directors: Director[];
    past_directors: PastDirector[];
  }>({
    current_directors: [
      { din: '', name: '', designation: '', appointment_date: '' }
    ],
    past_directors: [
      { din: '', name: '', designation: '', appointment_date: '', cessation_date: '' }
    ]
  });

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    const vendorUser = JSON.parse(localStorage.getItem('vendorUser') || '{}');
    if (!vendorUser.vendorId) {
      navigate('/vendor-auth');
      return;
    }

    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', vendorUser.vendorId)
        .single();

      if (error) throw error;

      setVendorData(vendor);
      
      // Set general info with all fields
      setGeneralInfo({
        legal_entity_name: vendor.legal_entity_name || '',
        trade_name: vendor.trade_name || '',
        contact_name: vendor.contact_name || '',
        email: vendor.email || '',
        phone_number: vendor.phone_number || '',
        website: vendor.website || '',
        street_address: vendor.street_address || '',
        street_address_line2: vendor.street_address_line2 || '',
        city: vendor.city || '',
        state: vendor.state || '',
        postal_code: vendor.postal_code || '',
        country: vendor.country || '',
        vendor_type: vendor.vendor_type || '',
        year_established: vendor.year_established || '',
        employee_count: vendor.employee_count || '',
        annual_revenue: vendor.annual_revenue || '',
        business_description: vendor.business_description || '',
        products_services_description: vendor.products_services_description || '',
        cin_number: vendor.cin_number || '',
        roc_name: vendor.roc_name || '',
        registration_number: vendor.registration_number || '',
        date_of_incorporation: vendor.date_of_incorporation || '',
        listed_in_stock_exchange: vendor.listed_in_stock_exchange || '',
        category_of_company: vendor.category_of_company || '',
        subcategory_of_company: vendor.subcategory_of_company || '',
        class_of_company: vendor.class_of_company || '',
        roc_office: vendor.roc_office || '',
        rd_name_region: vendor.rd_name_region || ''
      });
      
      // Set financial info
      setFinancialInfo(prev => ({
        ...prev,
        tax_id: vendor.tax_id || '',
        vat_id: vendor.vat_id || '',
        payment_terms: vendor.payment_terms || '',
        currency: vendor.currency || 'USD',
        authorised_capital: vendor.authorised_capital || '',
        paid_up_capital: vendor.paid_up_capital || ''
      }));

      // Set procurement info
      setProcurementInfo(prev => ({
        ...prev,
        contract_effective_date: vendor.contract_effective_date || '',
        contract_expiration_date: vendor.contract_expiration_date || '',
        relationship_owner: vendor.relationship_owner || '',
        reconciliation_account: vendor.reconciliation_account || ''
      }));

      // Set compliance info
      setComplianceInfo(prev => ({
        ...prev,
        w9_status: vendor.w9_status || '',
        w8_ben_status: vendor.w8_ben_status || '',
        w8_ben_e_status: vendor.w8_ben_e_status || '',
        company_status: vendor.company_status || '',
        date_of_balance_sheet: vendor.date_of_balance_sheet || '',
        date_of_last_agm: vendor.date_of_last_agm || ''
      }));

      // Fetch additional profile data
      const { data: profile } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', vendor.id)
        .single();

      if (profile) {
        setFinancialInfo(prev => ({
          ...prev,
          bank_name: profile.bank_name || '',
          account_number: profile.account_number || '',
          routing_number: profile.routing_number || '',
          account_type: profile.account_type || '',
          swift_code: profile.swift_code || '',
          bank_address: profile.bank_address || ''
        }));
        
        setProcurementInfo(prev => ({
          ...prev,
          primary_contact: profile.primary_contact || '',
          secondary_contact: profile.secondary_contact || ''
        }));
        
        setComplianceInfo(prev => ({
          ...prev,
          certifications: profile.certifications || '',
          compliance_forms: profile.compliance_forms || '',
          regulatory_notes: profile.regulatory_notes || '',
          last_audit_date: profile.last_audit_date || '',
          next_audit_date: profile.next_audit_date || ''
        }));

        // Fetch directors info if stored in profile
        if (profile.current_directors && Array.isArray(profile.current_directors)) {
          setDirectorsInfo(prev => ({
            ...prev,
            current_directors: profile.current_directors as unknown as Director[]
          }));
        }
        if (profile.past_directors && Array.isArray(profile.past_directors)) {
          setDirectorsInfo(prev => ({
            ...prev,
            past_directors: profile.past_directors as unknown as PastDirector[]
          }));
        }
      }

    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor data');
    }
  };

  const saveGeneralInfo = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update(generalInfo)
        .eq('vendor_id', vendorData.vendor_id);

      if (error) throw error;

      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: generalInfo.email,
          vendorId: vendorData.vendor_id,
          section: 'general',
          action: 'update'
        }
      });

      toast.success('General information saved successfully');
    } catch (error) {
      console.error('Error saving general info:', error);
      toast.error('Failed to save general information');
    } finally {
      setIsLoading(false);
    }
  };

  const saveFinancialInfo = async () => {
    setIsLoading(true);
    try {
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({
          tax_id: financialInfo.tax_id,
          vat_id: financialInfo.vat_id,
          payment_terms: financialInfo.payment_terms,
          currency: financialInfo.currency,
          authorised_capital: financialInfo.authorised_capital,
          paid_up_capital: financialInfo.paid_up_capital
        })
        .eq('vendor_id', vendorData.vendor_id);

      if (vendorError) throw vendorError;

      // Create user_id from vendor_id and upsert to vendor_profiles
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendorData.id, // Use the vendor's UUID as user_id
          bank_name: financialInfo.bank_name,
          account_number: financialInfo.account_number,
          routing_number: financialInfo.routing_number,
          currency: financialInfo.currency,
          payment_terms: financialInfo.payment_terms,
          account_type: financialInfo.account_type,
          swift_code: financialInfo.swift_code,
          bank_address: financialInfo.bank_address
        });

      if (profileError) throw profileError;

      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: vendorData.email,
          vendorId: vendorData.vendor_id,
          section: 'financial',
          action: 'update'
        }
      });

      toast.success('Financial information saved successfully');
    } catch (error) {
      console.error('Error saving financial info:', error);
      toast.error('Failed to save financial information');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProcurementInfo = async () => {
    setIsLoading(true);
    try {
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({
          contract_effective_date: procurementInfo.contract_effective_date,
          contract_expiration_date: procurementInfo.contract_expiration_date,
          relationship_owner: procurementInfo.relationship_owner,
          reconciliation_account: procurementInfo.reconciliation_account
        })
        .eq('vendor_id', vendorData.vendor_id);

      if (vendorError) throw vendorError;

      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendorData.id,
          primary_contact: procurementInfo.primary_contact,
          secondary_contact: procurementInfo.secondary_contact,
          relationship_owner: procurementInfo.relationship_owner,
          reconciliation_account: procurementInfo.reconciliation_account
        });

      if (profileError) throw profileError;

      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: vendorData.email,
          vendorId: vendorData.vendor_id,
          section: 'procurement',
          action: 'update'
        }
      });

      toast.success('Procurement information saved successfully');
    } catch (error) {
      console.error('Error saving procurement info:', error);
      toast.error('Failed to save procurement information');
    } finally {
      setIsLoading(false);
    }
  };

  const saveComplianceInfo = async () => {
    setIsLoading(true);
    try {
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({
          w9_status: complianceInfo.w9_status,
          w8_ben_status: complianceInfo.w8_ben_status,
          w8_ben_e_status: complianceInfo.w8_ben_e_status,
          company_status: complianceInfo.company_status,
          date_of_balance_sheet: complianceInfo.date_of_balance_sheet,
          date_of_last_agm: complianceInfo.date_of_last_agm
        })
        .eq('vendor_id', vendorData.vendor_id);

      if (vendorError) throw vendorError;

      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendorData.id,
          certifications: complianceInfo.certifications,
          compliance_forms: complianceInfo.compliance_forms,
          regulatory_notes: complianceInfo.regulatory_notes,
          last_audit_date: complianceInfo.last_audit_date,
          next_audit_date: complianceInfo.next_audit_date
        });

      if (profileError) throw profileError;

      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: vendorData.email,
          vendorId: vendorData.vendor_id,
          section: 'compliance',
          action: 'update'
        }
      });

      toast.success('Compliance information saved successfully');
    } catch (error) {
      console.error('Error saving compliance info:', error);
      toast.error('Failed to save compliance information');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDirectorsInfo = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendorData.id,
          current_directors: directorsInfo.current_directors,
          past_directors: directorsInfo.past_directors
        });

      if (error) throw error;

      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: vendorData.email,
          vendorId: vendorData.vendor_id,
          section: 'directors',
          action: 'update'
        }
      });

      toast.success('Directors information saved successfully');
    } catch (error) {
      console.error('Error saving directors info:', error);
      toast.error('Failed to save directors information');
    } finally {
      setIsLoading(false);
    }
  };

  const addCurrentDirector = () => {
    setDirectorsInfo(prev => ({
      ...prev,
      current_directors: [...prev.current_directors, { din: '', name: '', designation: '', appointment_date: '' }]
    }));
  };

  const addPastDirector = () => {
    setDirectorsInfo(prev => ({
      ...prev,
      past_directors: [...prev.past_directors, { din: '', name: '', designation: '', appointment_date: '', cessation_date: '' }]
    }));
  };

  const updateCurrentDirector = (index: number, field: string, value: string) => {
    setDirectorsInfo(prev => ({
      ...prev,
      current_directors: prev.current_directors.map((director, i) => 
        i === index ? { ...director, [field]: value } : director
      )
    }));
  };

  const updatePastDirector = (index: number, field: string, value: string) => {
    setDirectorsInfo(prev => ({
      ...prev,
      past_directors: prev.past_directors.map((director, i) => 
        i === index ? { ...director, [field]: value } : director
      )
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorUser');
    navigate('/vendor-auth');
    toast.success('Logged out successfully');
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
                <p className="text-gray-600">Manage your business information and compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Vendor ID: {vendorData.vendor_id}</span>
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="w-full">
          {/* Sticky Tab Navigation */}
          <div className="sticky top-24 z-40 bg-white border-b pb-4 mb-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="procurement" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Procurement
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="directors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Directors
              </TabsTrigger>
              <TabsTrigger value="past-directors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Past Directors
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Information */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>I. General Information</CardTitle>
                <CardDescription>Basic company and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="legal_entity_name">Legal Entity Name *</Label>
                    <Input
                      id="legal_entity_name"
                      value={generalInfo.legal_entity_name}
                      onChange={(e) => setGeneralInfo({...generalInfo, legal_entity_name: e.target.value})}
                      placeholder="Enter legal entity name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trade_name">Trade Name</Label>
                    <Input
                      id="trade_name"
                      value={generalInfo.trade_name}
                      onChange={(e) => setGeneralInfo({...generalInfo, trade_name: e.target.value})}
                      placeholder="Enter trade name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cin_number">CIN Number</Label>
                    <Input
                      id="cin_number"
                      value={generalInfo.cin_number}
                      onChange={(e) => setGeneralInfo({...generalInfo, cin_number: e.target.value})}
                      placeholder="Enter CIN number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={generalInfo.registration_number}
                      onChange={(e) => setGeneralInfo({...generalInfo, registration_number: e.target.value})}
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_incorporation">Date of Incorporation</Label>
                    <Input
                      id="date_of_incorporation"
                      type="date"
                      value={generalInfo.date_of_incorporation}
                      onChange={(e) => setGeneralInfo({...generalInfo, date_of_incorporation: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="listed_in_stock_exchange">Listed in Stock Exchange(s)</Label>
                    <Select value={generalInfo.listed_in_stock_exchange} onValueChange={(value) => setGeneralInfo({...generalInfo, listed_in_stock_exchange: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Y/N" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category_of_company">Category of Company</Label>
                    <Input
                      id="category_of_company"
                      value={generalInfo.category_of_company}
                      onChange={(e) => setGeneralInfo({...generalInfo, category_of_company: e.target.value})}
                      placeholder="e.g., Company limited by shares"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subcategory_of_company">Subcategory of Company</Label>
                    <Input
                      id="subcategory_of_company"
                      value={generalInfo.subcategory_of_company}
                      onChange={(e) => setGeneralInfo({...generalInfo, subcategory_of_company: e.target.value})}
                      placeholder="e.g., Non-government company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="class_of_company">Class of Company</Label>
                    <Input
                      id="class_of_company"
                      value={generalInfo.class_of_company}
                      onChange={(e) => setGeneralInfo({...generalInfo, class_of_company: e.target.value})}
                      placeholder="e.g., Private"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roc_name">ROC Name</Label>
                    <Input
                      id="roc_name"
                      value={generalInfo.roc_name}
                      onChange={(e) => setGeneralInfo({...generalInfo, roc_name: e.target.value})}
                      placeholder="Enter ROC name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roc_office">ROC Office</Label>
                    <Input
                      id="roc_office"
                      value={generalInfo.roc_office}
                      onChange={(e) => setGeneralInfo({...generalInfo, roc_office: e.target.value})}
                      placeholder="Enter ROC office"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rd_name_region">RD Name & Region</Label>
                    <Input
                      id="rd_name_region"
                      value={generalInfo.rd_name_region}
                      onChange={(e) => setGeneralInfo({...generalInfo, rd_name_region: e.target.value})}
                      placeholder="Enter RD name and region"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contact_name">Contact Name *</Label>
                      <Input
                        id="contact_name"
                        value={generalInfo.contact_name}
                        onChange={(e) => setGeneralInfo({...generalInfo, contact_name: e.target.value})}
                        placeholder="Enter contact name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={generalInfo.email}
                        onChange={(e) => setGeneralInfo({...generalInfo, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={generalInfo.phone_number}
                        onChange={(e) => setGeneralInfo({...generalInfo, phone_number: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={generalInfo.website}
                        onChange={(e) => setGeneralInfo({...generalInfo, website: e.target.value})}
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="street_address">Street Address *</Label>
                      <Input
                        id="street_address"
                        value={generalInfo.street_address}
                        onChange={(e) => setGeneralInfo({...generalInfo, street_address: e.target.value})}
                        placeholder="Enter street address"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="street_address_line2">Street Address Line 2</Label>
                      <Input
                        id="street_address_line2"
                        value={generalInfo.street_address_line2}
                        onChange={(e) => setGeneralInfo({...generalInfo, street_address_line2: e.target.value})}
                        placeholder="Enter additional address information"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={generalInfo.city}
                        onChange={(e) => setGeneralInfo({...generalInfo, city: e.target.value})}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={generalInfo.state}
                        onChange={(e) => setGeneralInfo({...generalInfo, state: e.target.value})}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        value={generalInfo.postal_code}
                        onChange={(e) => setGeneralInfo({...generalInfo, postal_code: e.target.value})}
                        placeholder="Enter postal code"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={generalInfo.country}
                        onChange={(e) => setGeneralInfo({...generalInfo, country: e.target.value})}
                        placeholder="Enter country"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="vendor_type">Vendor Type *</Label>
                      <Select value={generalInfo.vendor_type} onValueChange={(value) => setGeneralInfo({...generalInfo, vendor_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="service_provider">Service Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year_established">Year Established</Label>
                      <Input
                        id="year_established"
                        value={generalInfo.year_established}
                        onChange={(e) => setGeneralInfo({...generalInfo, year_established: e.target.value})}
                        placeholder="Enter year established"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee_count">Employee Count</Label>
                      <Select value={generalInfo.employee_count} onValueChange={(value) => setGeneralInfo({...generalInfo, employee_count: value})}>
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
                      <Label htmlFor="annual_revenue">Annual Revenue</Label>
                      <Select value={generalInfo.annual_revenue} onValueChange={(value) => setGeneralInfo({...generalInfo, annual_revenue: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select annual revenue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less_than_1m">&lt;$1M</SelectItem>
                          <SelectItem value="1m_to_10m">$1M-$10M</SelectItem>
                          <SelectItem value="10m_to_50m">$10M-$50M</SelectItem>
                          <SelectItem value="50m_to_100m">$50M-$100M</SelectItem>
                          <SelectItem value="more_than_100m">&gt;$100M</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="business_description">Business Description</Label>
                    <Textarea
                      id="business_description"
                      value={generalInfo.business_description}
                      onChange={(e) => setGeneralInfo({...generalInfo, business_description: e.target.value})}
                      placeholder="Describe your business"
                      rows={3}
                    />
                  </div>
                </div>

                <Button onClick={saveGeneralInfo} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save General Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Information */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>II. Financial and Tax Information</CardTitle>
                <CardDescription>Tax identification and payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tax_id">Tax ID</Label>
                    <Input
                      id="tax_id"
                      value={financialInfo.tax_id}
                      onChange={(e) => setFinancialInfo({...financialInfo, tax_id: e.target.value})}
                      placeholder="Enter tax identification number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vat_id">VAT ID</Label>
                    <Input
                      id="vat_id"
                      value={financialInfo.vat_id}
                      onChange={(e) => setFinancialInfo({...financialInfo, vat_id: e.target.value})}
                      placeholder="Enter VAT identification number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="authorised_capital">Authorised Capital (Rs)</Label>
                    <Input
                      id="authorised_capital"
                      value={financialInfo.authorised_capital}
                      onChange={(e) => setFinancialInfo({...financialInfo, authorised_capital: e.target.value})}
                      placeholder="Enter authorised capital"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paid_up_capital">Paid up Capital (Rs)</Label>
                    <Input
                      id="paid_up_capital"
                      value={financialInfo.paid_up_capital}
                      onChange={(e) => setFinancialInfo({...financialInfo, paid_up_capital: e.target.value})}
                      placeholder="Enter paid up capital"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_terms">Payment Terms</Label>
                    <Select value={financialInfo.payment_terms} onValueChange={(value) => setFinancialInfo({...financialInfo, payment_terms: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net45">Net 45</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                        <SelectItem value="immediate">Immediate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={financialInfo.currency} onValueChange={(value) => setFinancialInfo({...financialInfo, currency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={financialInfo.bank_name}
                        onChange={(e) => setFinancialInfo({...financialInfo, bank_name: e.target.value})}
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        value={financialInfo.account_number}
                        onChange={(e) => setFinancialInfo({...financialInfo, account_number: e.target.value})}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input
                        id="routing_number"
                        value={financialInfo.routing_number}
                        onChange={(e) => setFinancialInfo({...financialInfo, routing_number: e.target.value})}
                        placeholder="Enter routing number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_type">Account Type</Label>
                      <Select value={financialInfo.account_type} onValueChange={(value) => setFinancialInfo({...financialInfo, account_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="swift_code">SWIFT Code (International)</Label>
                      <Input
                        id="swift_code"
                        value={financialInfo.swift_code}
                        onChange={(e) => setFinancialInfo({...financialInfo, swift_code: e.target.value})}
                        placeholder="Enter SWIFT code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_address">Bank Address</Label>
                      <Input
                        id="bank_address"
                        value={financialInfo.bank_address}
                        onChange={(e) => setFinancialInfo({...financialInfo, bank_address: e.target.value})}
                        placeholder="Enter bank address"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={saveFinancialInfo} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Financial Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Procurement Information */}
          <TabsContent value="procurement">
            <Card>
              <CardHeader>
                <CardTitle>III. Procurement Information</CardTitle>
                <CardDescription>Contract and relationship management details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contract_effective_date">Contract Effective Date</Label>
                    <Input
                      id="contract_effective_date"
                      type="date"
                      value={procurementInfo.contract_effective_date}
                      onChange={(e) => setProcurementInfo({...procurementInfo, contract_effective_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract_expiration_date">Contract Expiration Date</Label>
                    <Input
                      id="contract_expiration_date"
                      type="date"
                      value={procurementInfo.contract_expiration_date}
                      onChange={(e) => setProcurementInfo({...procurementInfo, contract_expiration_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship_owner">Relationship Owner</Label>
                    <Input
                      id="relationship_owner"
                      value={procurementInfo.relationship_owner}
                      onChange={(e) => setProcurementInfo({...procurementInfo, relationship_owner: e.target.value})}
                      placeholder="Enter relationship owner name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reconciliation_account">Reconciliation Account</Label>
                    <Input
                      id="reconciliation_account"
                      value={procurementInfo.reconciliation_account}
                      onChange={(e) => setProcurementInfo({...procurementInfo, reconciliation_account: e.target.value})}
                      placeholder="Enter reconciliation account"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary_contact">Primary Contact</Label>
                    <Input
                      id="primary_contact"
                      value={procurementInfo.primary_contact}
                      onChange={(e) => setProcurementInfo({...procurementInfo, primary_contact: e.target.value})}
                      placeholder="Enter primary contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary_contact">Secondary Contact</Label>
                    <Input
                      id="secondary_contact"
                      value={procurementInfo.secondary_contact}
                      onChange={(e) => setProcurementInfo({...procurementInfo, secondary_contact: e.target.value})}
                      placeholder="Enter secondary contact name"
                    />
                  </div>
                </div>

                <Button onClick={saveProcurementInfo} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Procurement Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Information */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>IV. Compliance Information</CardTitle>
                <CardDescription>Regulatory and compliance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="w9_status">W-9 Status</Label>
                    <Select value={complianceInfo.w9_status} onValueChange={(value) => setComplianceInfo({...complianceInfo, w9_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select W-9 status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="w8_ben_status">W8-BEN Status</Label>
                    <Select value={complianceInfo.w8_ben_status} onValueChange={(value) => setComplianceInfo({...complianceInfo, w8_ben_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select W8-BEN status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="w8_ben_e_status">W8-BEN-E Status</Label>
                    <Select value={complianceInfo.w8_ben_e_status} onValueChange={(value) => setComplianceInfo({...complianceInfo, w8_ben_e_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select W8-BEN-E status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="company_status">Company Status</Label>
                    <Input
                      id="company_status"
                      value={complianceInfo.company_status}
                      onChange={(e) => setComplianceInfo({...complianceInfo, company_status: e.target.value})}
                      placeholder="e.g., Amalgamated"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_balance_sheet">Date of Balance Sheet</Label>
                    <Input
                      id="date_of_balance_sheet"
                      type="date"
                      value={complianceInfo.date_of_balance_sheet}
                      onChange={(e) => setComplianceInfo({...complianceInfo, date_of_balance_sheet: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_last_agm">Date of Last AGM</Label>
                    <Input
                      id="date_of_last_agm"
                      type="date"
                      value={complianceInfo.date_of_last_agm}
                      onChange={(e) => setComplianceInfo({...complianceInfo, date_of_last_agm: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="last_audit_date">Last Audit Date</Label>
                    <Input
                      id="last_audit_date"
                      type="date"
                      value={complianceInfo.last_audit_date}
                      onChange={(e) => setComplianceInfo({...complianceInfo, last_audit_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_audit_date">Next Audit Date</Label>
                    <Input
                      id="next_audit_date"
                      type="date"
                      value={complianceInfo.next_audit_date}
                      onChange={(e) => setComplianceInfo({...complianceInfo, next_audit_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={complianceInfo.certifications}
                    onChange={(e) => setComplianceInfo({...complianceInfo, certifications: e.target.value})}
                    placeholder="List relevant certifications"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="compliance_forms">Compliance Forms</Label>
                  <Textarea
                    id="compliance_forms"
                    value={complianceInfo.compliance_forms}
                    onChange={(e) => setComplianceInfo({...complianceInfo, compliance_forms: e.target.value})}
                    placeholder="List completed compliance forms"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="regulatory_notes">Regulatory Notes</Label>
                  <Textarea
                    id="regulatory_notes"
                    value={complianceInfo.regulatory_notes}
                    onChange={(e) => setComplianceInfo({...complianceInfo, regulatory_notes: e.target.value})}
                    placeholder="Additional regulatory information"
                    rows={3}
                  />
                </div>

                <Button onClick={saveComplianceInfo} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Compliance Information'}
                </Button>
              </CardContent>
            </Card>

            <DocumentUploadSection vendorId={vendorData.vendor_id} />
          </TabsContent>

          {/* Directors & Key Managerial Personnel */}
          <TabsContent value="directors">
            <Card>
              <CardHeader>
                <CardTitle>V. Directors & Key Managerial Personnel</CardTitle>
                <CardDescription>Current directors and key personnel information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {directorsInfo.current_directors.map((director, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-4">Director {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`din_${index}`}>DIN</Label>
                        <Input
                          id={`din_${index}`}
                          value={director.din}
                          onChange={(e) => updateCurrentDirector(index, 'din', e.target.value)}
                          placeholder="Enter DIN"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`name_${index}`}>Director Name</Label>
                        <Input
                          id={`name_${index}`}
                          value={director.name}
                          onChange={(e) => updateCurrentDirector(index, 'name', e.target.value)}
                          placeholder="Enter director name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`designation_${index}`}>Designation</Label>
                        <Input
                          id={`designation_${index}`}
                          value={director.designation}
                          onChange={(e) => updateCurrentDirector(index, 'designation', e.target.value)}
                          placeholder="Enter designation"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`appointment_date_${index}`}>Appointment Date</Label>
                        <Input
                          id={`appointment_date_${index}`}
                          type="date"
                          value={director.appointment_date}
                          onChange={(e) => updateCurrentDirector(index, 'appointment_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button onClick={addCurrentDirector} variant="outline" className="w-full">
                  Add Another Director
                </Button>
                <Button onClick={saveDirectorsInfo} disabled={isLoading} className="w-full mt-4">
                  {isLoading ? 'Saving...' : 'Save Directors Information'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Past Directors & Key Managerial Personnel */}
          <TabsContent value="past-directors">
            <Card>
              <CardHeader>
                <CardTitle>VI. Past Directors & Key Managerial Personnel</CardTitle>
                <CardDescription>Former directors and key personnel information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {directorsInfo.past_directors.map((director, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-4">Past Director {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`past_din_${index}`}>DIN</Label>
                        <Input
                          id={`past_din_${index}`}
                          value={director.din}
                          onChange={(e) => updatePastDirector(index, 'din', e.target.value)}
                          placeholder="Enter DIN"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`past_name_${index}`}>Director Name</Label>
                        <Input
                          id={`past_name_${index}`}
                          value={director.name}
                          onChange={(e) => updatePastDirector(index, 'name', e.target.value)}
                          placeholder="Enter director name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`past_designation_${index}`}>Designation</Label>
                        <Input
                          id={`past_designation_${index}`}
                          value={director.designation}
                          onChange={(e) => updatePastDirector(index, 'designation', e.target.value)}
                          placeholder="Enter designation"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`past_appointment_date_${index}`}>Appointment Date</Label>
                        <Input
                          id={`past_appointment_date_${index}`}
                          type="date"
                          value={director.appointment_date}
                          onChange={(e) => updatePastDirector(index, 'appointment_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`past_cessation_date_${index}`}>Cessation Date</Label>
                        <Input
                          id={`past_cessation_date_${index}`}
                          type="date"
                          value={director.cessation_date}
                          onChange={(e) => updatePastDirector(index, 'cessation_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button onClick={addPastDirector} variant="outline" className="w-full">
                  Add Another Past Director
                </Button>
                <Button onClick={saveDirectorsInfo} disabled={isLoading} className="w-full mt-4">
                  {isLoading ? 'Saving...' : 'Save Past Directors Information'}
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
