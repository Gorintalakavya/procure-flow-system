import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface VendorUser {
  vendorId: string;
  email: string;
}

interface OverviewInfo {
  company_description: string;
  ranking: string;
  key_principal: string;
  industry: string;
  year_started: string;
  date_of_incorporation: Date | null;
}

interface FinancialInfo {
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  swift_code: string;
  bank_address: string;
  reconciliation_account: string;
  revenue: string;
  sales_growth: string;
  net_income_growth: string;
  assets: string;
  fiscal_year_end: string;
  stock_exchange: string;
  esg_ranking: string;
  esg_industry_average: string;
}

interface ProcurementInfo {
  primary_contact: string;
  secondary_contact: string;
  relationship_owner: string;
  services_offered: string;
  contract_details: string;
  billing_address: string;
}

interface ComplianceInfo {
  certifications: string;
  compliance_forms: string;
  regulatory_notes: string;
  last_audit_date: Date | null;
  next_audit_date: Date | null;
}

interface VerificationDocs {
  ein_verification_letter: string;
  articles_of_incorporation: string;
  business_licenses: string;
  w9_form: string;
}

const VendorProfile = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Form states
  const [overviewInfo, setOverviewInfo] = useState<OverviewInfo>({
    company_description: '',
    ranking: '',
    key_principal: '',
    industry: '',
    year_started: '',
    date_of_incorporation: null
  });
  
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: '',
    swift_code: '',
    bank_address: '',
    reconciliation_account: '',
    revenue: '',
    sales_growth: '',
    net_income_growth: '',
    assets: '',
    fiscal_year_end: '',
    stock_exchange: '',
    esg_ranking: '',
    esg_industry_average: ''
  });
  
  const [procurementInfo, setProcurementInfo] = useState<ProcurementInfo>({
    primary_contact: '',
    secondary_contact: '',
    relationship_owner: '',
    services_offered: '',
    contract_details: '',
    billing_address: ''
  });
  
  const [complianceInfo, setComplianceInfo] = useState<ComplianceInfo>({
    certifications: '',
    compliance_forms: '',
    regulatory_notes: '',
    last_audit_date: null,
    next_audit_date: null
  });

  const [verificationDocs, setVerificationDocs] = useState<VerificationDocs>({
    ein_verification_letter: '',
    articles_of_incorporation: '',
    business_licenses: '',
    w9_form: ''
  });

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      // Get vendor user info from localStorage
      const vendorUserStr = localStorage.getItem('vendorUser');
      if (!vendorUserStr) {
        toast.error('Please login first');
        return;
      }
      
      const vendorUser: VendorUser = JSON.parse(vendorUserStr);
      
      // Get vendor details
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', vendorUser.vendorId)
        .single();
      
      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        toast.error('Error loading vendor data');
        return;
      }
      
      if (!vendorData) {
        toast.error('Vendor not found');
        return;
      }
      
      setVendor(vendorData);
      
      // Get vendor profile data
      const { data: profile } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', vendorData.id)
        .maybeSingle();

      // Get verification documents
      const { data: verificationData } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('vendor_id', vendorData.vendor_id)
        .maybeSingle();

      if (profile) {
        setOverviewInfo({
          company_description: profile.company_description || vendorData.business_description || '',
          ranking: profile.ranking || '',
          key_principal: profile.key_principal || '',
          industry: profile.industry || '',
          year_started: profile.year_started || vendorData.year_established || '',
          date_of_incorporation: profile.date_of_incorporation ? new Date(profile.date_of_incorporation) : null
        });
        
        setFinancialInfo({
          bank_name: profile.bank_name || '',
          account_number: profile.account_number || '',
          routing_number: profile.routing_number || '',
          account_type: profile.account_type || '',
          swift_code: profile.swift_code || '',
          bank_address: profile.bank_address || '',
          reconciliation_account: profile.reconciliation_account || '',
          revenue: profile.revenue || '',
          sales_growth: profile.sales_growth || '',
          net_income_growth: profile.net_income_growth || '',
          assets: profile.assets || '',
          fiscal_year_end: profile.fiscal_year_end || '',
          stock_exchange: profile.stock_exchange || '',
          esg_ranking: profile.esg_ranking || '',
          esg_industry_average: profile.esg_industry_average || ''
        });
        
        setProcurementInfo({
          primary_contact: profile.primary_contact || '',
          secondary_contact: profile.secondary_contact || '',
          relationship_owner: profile.relationship_owner || '',
          services_offered: profile.services_offered || '',
          contract_details: profile.contract_details || '',
          billing_address: profile.billing_address || ''
        });
        
        setComplianceInfo({
          certifications: profile.certifications || '',
          compliance_forms: profile.compliance_forms || '',
          regulatory_notes: profile.regulatory_notes || '',
          last_audit_date: profile.last_audit_date ? new Date(profile.last_audit_date) : null,
          next_audit_date: profile.next_audit_date ? new Date(profile.next_audit_date) : null
        });
      }

      if (verificationData) {
        setVerificationDocs({
          ein_verification_letter: verificationData.ein_verification_letter || '',
          articles_of_incorporation: verificationData.articles_of_incorporation || '',
          business_licenses: verificationData.business_licenses || '',
          w9_form: verificationData.w9_form || ''
        });
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Error loading vendor data');
    } finally {
      setLoading(false);
    }
  };

  const saveOverviewInfo = async () => {
    if (!vendor) return;
    
    try {
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendor.id,
          company_description: overviewInfo.company_description,
          ranking: overviewInfo.ranking,
          key_principal: overviewInfo.key_principal,
          industry: overviewInfo.industry,
          year_started: overviewInfo.year_started,
          date_of_incorporation: overviewInfo.date_of_incorporation?.toISOString().split('T')[0] || null
        });

      if (profileError) {
        console.error('Error saving overview info:', profileError);
        toast.error('Error saving overview information');
        return;
      }

      toast.success('Overview information saved successfully');
    } catch (error) {
      console.error('Error saving overview info:', error);
      toast.error('Error saving overview information');
    }
  };

  const saveFinancialInfo = async () => {
    if (!vendor) return;
    
    try {
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendor.id,
          bank_name: financialInfo.bank_name,
          account_number: financialInfo.account_number,
          routing_number: financialInfo.routing_number,
          account_type: financialInfo.account_type,
          swift_code: financialInfo.swift_code,
          bank_address: financialInfo.bank_address,
          reconciliation_account: financialInfo.reconciliation_account,
          revenue: financialInfo.revenue,
          sales_growth: financialInfo.sales_growth,
          net_income_growth: financialInfo.net_income_growth,
          assets: financialInfo.assets,
          fiscal_year_end: financialInfo.fiscal_year_end,
          stock_exchange: financialInfo.stock_exchange,
          esg_ranking: financialInfo.esg_ranking,
          esg_industry_average: financialInfo.esg_industry_average
        });

      if (profileError) {
        console.error('Error saving financial info:', profileError);
        toast.error('Error saving financial information');
        return;
      }

      toast.success('Financial information saved successfully');
    } catch (error) {
      console.error('Error saving financial info:', error);
      toast.error('Error saving financial information');
    }
  };

  const saveProcurementInfo = async () => {
    if (!vendor) return;
    
    try {
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendor.id,
          primary_contact: procurementInfo.primary_contact,
          secondary_contact: procurementInfo.secondary_contact,
          relationship_owner: procurementInfo.relationship_owner,
          services_offered: procurementInfo.services_offered,
          contract_details: procurementInfo.contract_details,
          billing_address: procurementInfo.billing_address
        });

      if (profileError) {
        console.error('Error saving procurement info:', profileError);
        toast.error('Error saving procurement information');
        return;
      }

      toast.success('Procurement information saved successfully');
    } catch (error) {
      console.error('Error saving procurement info:', error);
      toast.error('Error saving procurement information');
    }
  };

  const saveComplianceInfo = async () => {
    if (!vendor) return;
    
    try {
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          user_id: vendor.id,
          certifications: complianceInfo.certifications,
          compliance_forms: complianceInfo.compliance_forms,
          regulatory_notes: complianceInfo.regulatory_notes,
          last_audit_date: complianceInfo.last_audit_date?.toISOString().split('T')[0] || null,
          next_audit_date: complianceInfo.next_audit_date?.toISOString().split('T')[0] || null
        });

      if (profileError) {
        console.error('Error saving compliance info:', profileError);
        toast.error('Error saving compliance information');
        return;
      }

      toast.success('Compliance information saved successfully');
    } catch (error) {
      console.error('Error saving compliance info:', error);
      toast.error('Error saving compliance information');
    }
  };

  const saveVerificationDocs = async () => {
    if (!vendor) return;
    
    try {
      const { error: verificationError } = await supabase
        .from('verification_documents')
        .upsert({
          vendor_id: vendor.vendor_id,
          ein_verification_letter: verificationDocs.ein_verification_letter,
          articles_of_incorporation: verificationDocs.articles_of_incorporation,
          business_licenses: verificationDocs.business_licenses,
          w9_form: verificationDocs.w9_form
        });

      if (verificationError) {
        console.error('Error saving verification documents:', verificationError);
        toast.error('Error saving verification documents');
        return;
      }

      toast.success('Verification documents saved successfully');
    } catch (error) {
      console.error('Error saving verification documents:', error);
      toast.error('Error saving verification documents');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!vendor) {
    return <div className="flex justify-center items-center h-64">Vendor not found</div>;
  }

  const sectionTitles = {
    overview: 'Overview',
    financial: 'Financial Information',
    procurement: 'Procurement Information',
    compliance: 'Compliance & Audit',
    verification: 'Verification Documents'
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vendor.legal_entity_name}</h1>
          <p className="text-gray-600">Vendor ID: {vendor.vendor_id}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4">
        <nav className="flex space-x-8">
          {Object.entries(sectionTitles).map(([key, title]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={cn(
                "pb-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeSection === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {title}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Company overview and general information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                value={overviewInfo.company_description}
                onChange={(e) => setOverviewInfo(prev => ({ ...prev, company_description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ranking">Ranking</Label>
                <Input
                  id="ranking"
                  value={overviewInfo.ranking}
                  onChange={(e) => setOverviewInfo(prev => ({ ...prev, ranking: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key_principal">Key Principal</Label>
                <Input
                  id="key_principal"
                  value={overviewInfo.key_principal}
                  onChange={(e) => setOverviewInfo(prev => ({ ...prev, key_principal: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={overviewInfo.industry}
                  onChange={(e) => setOverviewInfo(prev => ({ ...prev, industry: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_started">Year Started</Label>
                <Input
                  id="year_started"
                  value={overviewInfo.year_started}
                  onChange={(e) => setOverviewInfo(prev => ({ ...prev, year_started: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date of Incorporation</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !overviewInfo.date_of_incorporation && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {overviewInfo.date_of_incorporation ? format(overviewInfo.date_of_incorporation, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={overviewInfo.date_of_incorporation || undefined}
                    onSelect={(date) => setOverviewInfo(prev => ({ ...prev, date_of_incorporation: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={saveOverviewInfo} className="w-full">
              Save Overview Information
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Financial Information */}
      {activeSection === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>Banking details and financial metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={financialInfo.bank_name}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, bank_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={financialInfo.account_number}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, account_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routing_number">Routing Number</Label>
                <Input
                  id="routing_number"
                  value={financialInfo.routing_number}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, routing_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type</Label>
                <Select
                  value={financialInfo.account_type || ""}
                  onValueChange={(value) => setFinancialInfo(prev => ({ ...prev, account_type: value }))}
                >
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
              <div className="space-y-2">
                <Label htmlFor="swift_code">SWIFT Code</Label>
                <Input
                  id="swift_code"
                  value={financialInfo.swift_code}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, swift_code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reconciliation_account">Reconciliation Account</Label>
                <Input
                  id="reconciliation_account"
                  value={financialInfo.reconciliation_account}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, reconciliation_account: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  value={financialInfo.revenue}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, revenue: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales_growth">Sales Growth</Label>
                <Input
                  id="sales_growth"
                  value={financialInfo.sales_growth}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, sales_growth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="net_income_growth">Net Income Growth</Label>
                <Input
                  id="net_income_growth"
                  value={financialInfo.net_income_growth}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, net_income_growth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assets">Assets</Label>
                <Input
                  id="assets"
                  value={financialInfo.assets}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, assets: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiscal_year_end">Fiscal Year End</Label>
                <Input
                  id="fiscal_year_end"
                  value={financialInfo.fiscal_year_end}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, fiscal_year_end: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_exchange">Stock Exchange</Label>
                <Input
                  id="stock_exchange"
                  value={financialInfo.stock_exchange}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, stock_exchange: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esg_ranking">ESG Ranking</Label>
                <Input
                  id="esg_ranking"
                  value={financialInfo.esg_ranking}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, esg_ranking: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esg_industry_average">ESG Industry Average</Label>
                <Input
                  id="esg_industry_average"
                  value={financialInfo.esg_industry_average}
                  onChange={(e) => setFinancialInfo(prev => ({ ...prev, esg_industry_average: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_address">Bank Address</Label>
              <Textarea
                id="bank_address"
                value={financialInfo.bank_address}
                onChange={(e) => setFinancialInfo(prev => ({ ...prev, bank_address: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={saveFinancialInfo} className="w-full">
              Save Financial Information
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Procurement Information */}
      {activeSection === 'procurement' && (
        <Card>
          <CardHeader>
            <CardTitle>Procurement Information</CardTitle>
            <CardDescription>Contact details and service information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_contact">Primary Contact</Label>
                <Input
                  id="primary_contact"
                  value={procurementInfo.primary_contact}
                  onChange={(e) => setProcurementInfo(prev => ({ ...prev, primary_contact: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_contact">Secondary Contact</Label>
                <Input
                  id="secondary_contact"
                  value={procurementInfo.secondary_contact}
                  onChange={(e) => setProcurementInfo(prev => ({ ...prev, secondary_contact: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship_owner">Relationship Owner</Label>
                <Input
                  id="relationship_owner"
                  value={procurementInfo.relationship_owner}
                  onChange={(e) => setProcurementInfo(prev => ({ ...prev, relationship_owner: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="services_offered">Services Offered</Label>
              <Textarea
                id="services_offered"
                value={procurementInfo.services_offered}
                onChange={(e) => setProcurementInfo(prev => ({ ...prev, services_offered: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_details">Contract Details</Label>
              <Textarea
                id="contract_details"
                value={procurementInfo.contract_details}
                onChange={(e) => setProcurementInfo(prev => ({ ...prev, contract_details: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_address">Billing Address</Label>
              <Textarea
                id="billing_address"
                value={procurementInfo.billing_address}
                onChange={(e) => setProcurementInfo(prev => ({ ...prev, billing_address: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={saveProcurementInfo} className="w-full">
              Save Procurement Information
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Compliance & Audit */}
      {activeSection === 'compliance' && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance & Audit</CardTitle>
            <CardDescription>Certification and audit information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={complianceInfo.certifications}
                onChange={(e) => setComplianceInfo(prev => ({ ...prev, certifications: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compliance_forms">Compliance Forms</Label>
              <Textarea
                id="compliance_forms"
                value={complianceInfo.compliance_forms}
                onChange={(e) => setComplianceInfo(prev => ({ ...prev, compliance_forms: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regulatory_notes">Regulatory Notes</Label>
              <Textarea
                id="regulatory_notes"
                value={complianceInfo.regulatory_notes}
                onChange={(e) => setComplianceInfo(prev => ({ ...prev, regulatory_notes: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last Audit Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !complianceInfo.last_audit_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {complianceInfo.last_audit_date ? format(complianceInfo.last_audit_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={complianceInfo.last_audit_date || undefined}
                      onSelect={(date) => setComplianceInfo(prev => ({ ...prev, last_audit_date: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Next Audit Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !complianceInfo.next_audit_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {complianceInfo.next_audit_date ? format(complianceInfo.next_audit_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={complianceInfo.next_audit_date || undefined}
                      onSelect={(date) => setComplianceInfo(prev => ({ ...prev, next_audit_date: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button onClick={saveComplianceInfo} className="w-full">
              Save Compliance Information
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verification Documents */}
      {activeSection === 'verification' && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Documents</CardTitle>
            <CardDescription>Upload and manage verification documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ein_verification_letter">EIN Verification Letter (Form SS-4)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ein_verification_letter"
                  value={verificationDocs.ein_verification_letter}
                  onChange={(e) => setVerificationDocs(prev => ({ ...prev, ein_verification_letter: e.target.value }))}
                  placeholder="Document URL or path"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="articles_of_incorporation">Articles of Incorporation</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="articles_of_incorporation"
                  value={verificationDocs.articles_of_incorporation}
                  onChange={(e) => setVerificationDocs(prev => ({ ...prev, articles_of_incorporation: e.target.value }))}
                  placeholder="Document URL or path"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_licenses">Business Licenses or State Registration</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="business_licenses"
                  value={verificationDocs.business_licenses}
                  onChange={(e) => setVerificationDocs(prev => ({ ...prev, business_licenses: e.target.value }))}
                  placeholder="Document URL or path"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="w9_form">W-9 Form Upload</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="w9_form"
                  value={verificationDocs.w9_form}
                  onChange={(e) => setVerificationDocs(prev => ({ ...prev, w9_form: e.target.value }))}
                  placeholder="Document URL or path"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
            <Button onClick={saveVerificationDocs} className="w-full">
              Save Verification Documents
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorProfile;
