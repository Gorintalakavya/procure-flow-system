
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VendorUser {
  vendorId: string;
  email: string;
}

interface FinancialInfo {
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  swift_code: string;
  bank_address: string;
  reconciliation_account: string;
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

const VendorProfile = () => {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('financial');
  
  // Form states
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: '',
    swift_code: '',
    bank_address: '',
    reconciliation_account: ''
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

      if (profile) {
        // Load financial info
        setFinancialInfo({
          bank_name: profile.bank_name || '',
          account_number: profile.account_number || '',
          routing_number: profile.routing_number || '',
          account_type: profile.account_type || '',
          swift_code: profile.swift_code || '',
          bank_address: profile.bank_address || '',
          reconciliation_account: profile.reconciliation_account || ''
        });
        
        // Load procurement info
        setProcurementInfo({
          primary_contact: profile.primary_contact || '',
          secondary_contact: profile.secondary_contact || '',
          relationship_owner: profile.relationship_owner || '',
          services_offered: profile.services_offered || '',
          contract_details: profile.contract_details || '',
          billing_address: profile.billing_address || ''
        });
        
        // Load compliance info
        setComplianceInfo({
          certifications: profile.certifications || '',
          compliance_forms: profile.compliance_forms || '',
          regulatory_notes: profile.regulatory_notes || '',
          last_audit_date: profile.last_audit_date ? new Date(profile.last_audit_date) : null,
          next_audit_date: profile.next_audit_date ? new Date(profile.next_audit_date) : null
        });
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Error loading vendor data');
    } finally {
      setLoading(false);
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
          reconciliation_account: financialInfo.reconciliation_account
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!vendor) {
    return <div className="flex justify-center items-center h-64">Vendor not found</div>;
  }

  const sectionTitles = {
    financial: 'Financial Information',
    procurement: 'Procurement Information',
    compliance: 'Compliance & Audit'
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
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

      {/* Financial Information */}
      {activeSection === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>Bank account and financial details</CardDescription>
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
    </div>
  );
};

export default VendorProfile;
