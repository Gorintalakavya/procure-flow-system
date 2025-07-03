
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Building2, User, CreditCard, FileText, Shield, BarChart3, Bell, LogOut, CheckCircle, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VendorProfile = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('general');
  const [progress, setProgress] = useState(16);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [generalInfo, setGeneralInfo] = useState({
    vendorId: '',
    legalEntityName: '',
    tradeName: '',
    businessType: '',
    website: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: '',
    businessDescription: ''
  });

  const [financialInfo, setFinancialInfo] = useState({
    taxId: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    paymentTerms: '',
    currency: '',
    billingAddress: ''
  });

  const [procurementInfo, setProcurementInfo] = useState({
    servicesOffered: '',
    primaryContact: '',
    secondaryContact: '',
    relationshipOwner: '',
    contractDetails: '',
    certifications: ''
  });

  const [regulatoryInfo, setRegulatoryInfo] = useState({
    complianceForms: '',
    reconciliationAccount: '',
    regulatoryNotes: '',
    lastAuditDate: '',
    nextAuditDate: ''
  });

  const [roleInfo, setRoleInfo] = useState({
    userEmail: '',
    role: '',
    accessLevel: '',
    department: '',
    isPrimaryContact: false
  });

  const [complianceInfo, setComplianceInfo] = useState({
    complianceType: '',
    status: '',
    certificationName: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    complianceScore: '',
    notes: ''
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    statusUpdates: true,
    documentReminders: true,
    complianceAlerts: true
  });

  const [documents, setDocuments] = useState<any[]>([]);

  const sections = [
    { id: 'general', name: 'Vendor Management', icon: <Building2 className="h-5 w-5" />, component: 'general' },
    { id: 'roles', name: 'Role-Based Access', icon: <User className="h-5 w-5" />, component: 'roles' },
    { id: 'compliance', name: 'Compliance Tracking', icon: <Shield className="h-5 w-5" />, component: 'compliance' },
    { id: 'documents', name: 'Document Management', icon: <FileText className="h-5 w-5" />, component: 'documents' },
    { id: 'analytics', name: 'Analytics & Reporting', icon: <BarChart3 className="h-5 w-5" />, component: 'analytics' },
    { id: 'audit', name: 'Audit & Notifications', icon: <Bell className="h-5 w-5" />, component: 'audit' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      navigate('/vendor-auth');
      return;
    }
    
    const user = JSON.parse(userData);
    setCurrentUser(user);
    setGeneralInfo(prev => ({ ...prev, vendorId: user.vendorId }));
    loadVendorData(user.vendorId);
  }, [navigate]);

  const loadVendorData = async (vendorId: string) => {
    try {
      // Load vendor profile data
      const { data: profileData } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (profileData) {
        setFinancialInfo({
          taxId: profileData.tax_id || '',
          bankName: profileData.bank_name || '',
          accountNumber: profileData.account_number || '',
          routingNumber: profileData.routing_number || '',
          paymentTerms: profileData.payment_terms || '',
          currency: profileData.currency || '',
          billingAddress: profileData.billing_address || ''
        });

        setProcurementInfo({
          servicesOffered: profileData.services_offered || '',
          primaryContact: profileData.primary_contact || '',
          secondaryContact: profileData.secondary_contact || '',
          relationshipOwner: profileData.relationship_owner || '',
          contractDetails: profileData.contract_details || '',
          certifications: profileData.certifications || ''
        });

        setRegulatoryInfo({
          complianceForms: profileData.compliance_forms || '',
          reconciliationAccount: profileData.reconciliation_account || '',
          regulatoryNotes: profileData.regulatory_notes || '',
          lastAuditDate: profileData.last_audit_date || '',
          nextAuditDate: profileData.next_audit_date || ''
        });
      }

      // Load notification preferences
      const { data: notifData } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (notifData) {
        setNotificationPrefs({
          emailNotifications: notifData.email_notifications,
          statusUpdates: notifData.status_updates,
          documentReminders: notifData.document_reminders,
          complianceAlerts: notifData.compliance_alerts
        });
      }

      // Load documents
      const { data: docsData } = await supabase
        .from('documents')
        .select('*')
        .eq('vendor_id', vendorId);

      if (docsData) {
        setDocuments(docsData);
      }

    } catch (error) {
      console.error('Error loading vendor data:', error);
    }
  };

  const handleSaveSection = async (sectionId: string) => {
    console.log(`Saving ${sectionId} section data`);
    
    try {
      const vendorId = currentUser?.vendorId;
      if (!vendorId) {
        toast.error('Vendor ID not found');
        return;
      }

      let dataToSave;
      let tableName = '';
      let updateData = {};

      switch (sectionId) {
        case 'general':
          // Update vendors table
          updateData = {
            legal_entity_name: generalInfo.legalEntityName,
            trade_name: generalInfo.tradeName,
            vendor_type: generalInfo.businessType,
            website: generalInfo.website,
            year_established: generalInfo.yearEstablished,
            employee_count: generalInfo.employeeCount,
            annual_revenue: generalInfo.annualRevenue,
            business_description: generalInfo.businessDescription,
            updated_at: new Date().toISOString()
          };
          
          const { error: vendorError } = await supabase
            .from('vendors')
            .update(updateData)
            .eq('vendor_id', vendorId);

          if (vendorError) throw vendorError;
          break;

        case 'financial':
        case 'procurement':
        case 'regulatory':
          // Upsert vendor_profiles table
          updateData = {
            vendor_id: vendorId,
            tax_id: financialInfo.taxId,
            bank_name: financialInfo.bankName,
            account_number: financialInfo.accountNumber,
            routing_number: financialInfo.routingNumber,
            payment_terms: financialInfo.paymentTerms,
            currency: financialInfo.currency,
            billing_address: financialInfo.billingAddress,
            services_offered: procurementInfo.servicesOffered,
            primary_contact: procurementInfo.primaryContact,
            secondary_contact: procurementInfo.secondaryContact,
            relationship_owner: procurementInfo.relationshipOwner,
            contract_details: procurementInfo.contractDetails,
            certifications: procurementInfo.certifications,
            compliance_forms: regulatoryInfo.complianceForms,
            reconciliation_account: regulatoryInfo.reconciliationAccount,
            regulatory_notes: regulatoryInfo.regulatoryNotes,
            last_audit_date: regulatoryInfo.lastAuditDate || null,
            next_audit_date: regulatoryInfo.nextAuditDate || null,
            updated_at: new Date().toISOString()
          };

          const { error: profileError } = await supabase
            .from('vendor_profiles')
            .upsert(updateData);

          if (profileError) throw profileError;
          break;

        case 'roles':
          // Insert into user_roles table
          const roleData = {
            vendor_id: vendorId,
            user_email: roleInfo.userEmail,
            role: roleInfo.role,
            access_level: roleInfo.accessLevel,
            department: roleInfo.department,
            is_primary_contact: roleInfo.isPrimaryContact
          };

          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert(roleData);

          if (roleError) throw roleError;
          break;

        case 'compliance':
          // Insert into compliance_tracking table
          const complianceData = {
            vendor_id: vendorId,
            compliance_type: complianceInfo.complianceType,
            status: complianceInfo.status,
            certification_name: complianceInfo.certificationName,
            issue_date: complianceInfo.issueDate || null,
            expiry_date: complianceInfo.expiryDate || null,
            issuing_authority: complianceInfo.issuingAuthority,
            compliance_score: complianceInfo.complianceScore ? parseInt(complianceInfo.complianceScore) : null,
            notes: complianceInfo.notes
          };

          const { error: complianceError } = await supabase
            .from('compliance_tracking')
            .upsert(complianceData);

          if (complianceError) throw complianceError;
          break;

        case 'audit':
          // Update notification preferences
          const notifData = {
            vendor_id: vendorId,
            email_notifications: notificationPrefs.emailNotifications,
            status_updates: notificationPrefs.statusUpdates,
            document_reminders: notificationPrefs.documentReminders,
            compliance_alerts: notificationPrefs.complianceAlerts,
            updated_at: new Date().toISOString()
          };

          const { error: notifError } = await supabase
            .from('notification_preferences')
            .upsert(notifData);

          if (notifError) throw notifError;
          break;
      }

      // Log audit trail
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'UPDATE',
          entity_type: sectionId,
          entity_id: vendorId,
          new_values: updateData,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      toast.success(`${sectionId} information saved successfully!`);
      
      // Update progress
      const completedSections = sections.filter(s => s.id !== 'audit').length;
      const currentIndex = sections.findIndex(s => s.id === sectionId);
      const newProgress = Math.min(((currentIndex + 1) / completedSections) * 100, 100);
      setProgress(newProgress);

    } catch (error) {
      console.error(`Error saving ${sectionId}:`, error);
      toast.error(`Failed to save ${sectionId} information`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.vendorId}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { error: docError } = await supabase
        .from('documents')
        .insert({
          vendor_id: currentUser.vendorId,
          document_name: file.name,
          document_type: documentType,
          file_path: fileName,
          file_size: file.size,
          uploaded_by: currentUser.email,
          tags: [documentType]
        });

      if (docError) throw docError;

      toast.success(`${documentType} uploaded successfully!`);
      loadVendorData(currentUser.vendorId);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generatePerformanceReport = async () => {
    try {
      const reportData = {
        vendor_id: currentUser.vendorId,
        report_type: 'performance',
        report_data: {
          compliance_rate: 85,
          documents_submitted: documents.length,
          last_updated: new Date().toISOString(),
          risk_factors: ['Low', 'Medium', 'High'],
          performance_metrics: {
            response_time: '2 days',
            completion_rate: '95%',
            quality_score: 8.5
          }
        },
        performance_score: 85,
        compliance_rate: 85.5,
        risk_level: 'Low'
      };

      const { error } = await supabase
        .from('analytics_reports')
        .insert(reportData);

      if (error) throw error;

      // Create downloadable report
      const reportContent = JSON.stringify(reportData.report_data, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance_report_${currentUser.vendorId}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Performance report generated and downloaded!');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const renderGeneralInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendorId">Vendor ID</Label>
          <Input
            id="vendorId"
            value={generalInfo.vendorId}
            disabled
            className="bg-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="legalEntityName">Legal Entity Name *</Label>
          <Input
            id="legalEntityName"
            value={generalInfo.legalEntityName}
            onChange={(e) => setGeneralInfo(prev => ({ ...prev, legalEntityName: e.target.value }))}
            placeholder="Enter legal business name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tradeName">Trade Name</Label>
          <Input
            id="tradeName"
            value={generalInfo.tradeName}
            onChange={(e) => setGeneralInfo(prev => ({ ...prev, tradeName: e.target.value }))}
            placeholder="Enter trade name"
          />
        </div>
        <div>
          <Label htmlFor="businessType">Business Type *</Label>
          <Select onValueChange={(value) => setGeneralInfo(prev => ({ ...prev, businessType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corporation">Corporation</SelectItem>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={generalInfo.website}
            onChange={(e) => setGeneralInfo(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <Label htmlFor="yearEstablished">Year Established</Label>
          <Input
            id="yearEstablished"
            value={generalInfo.yearEstablished}
            onChange={(e) => setGeneralInfo(prev => ({ ...prev, yearEstablished: e.target.value }))}
            placeholder="YYYY"
          />
        </div>
        <div>
          <Label htmlFor="employeeCount">Employee Count</Label>
          <Select onValueChange={(value) => setGeneralInfo(prev => ({ ...prev, employeeCount: value }))}>
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
      </div>

      <div>
        <Label htmlFor="businessDescription">Business Description</Label>
        <Textarea
          id="businessDescription"
          value={generalInfo.businessDescription}
          onChange={(e) => setGeneralInfo(prev => ({ ...prev, businessDescription: e.target.value }))}
          placeholder="Describe your business and services..."
          rows={4}
        />
      </div>

      <Button onClick={() => handleSaveSection('general')} className="w-full">
        Save General Information
      </Button>
    </div>
  );

  const renderFinancialInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taxId">Tax ID/EIN *</Label>
          <Input
            id="taxId"
            value={financialInfo.taxId}
            onChange={(e) => setFinancialInfo(prev => ({ ...prev, taxId: e.target.value }))}
            placeholder="XX-XXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="bankName">Bank Name *</Label>
          <Input
            id="bankName"
            value={financialInfo.bankName}
            onChange={(e) => setFinancialInfo(prev => ({ ...prev, bankName: e.target.value }))}
            placeholder="Enter bank name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            value={financialInfo.accountNumber}
            onChange={(e) => setFinancialInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
            placeholder="Enter account number"
            type="password"
          />
        </div>
        <div>
          <Label htmlFor="routingNumber">Routing Number *</Label>
          <Input
            id="routingNumber"
            value={financialInfo.routingNumber}
            onChange={(e) => setFinancialInfo(prev => ({ ...prev, routingNumber: e.target.value }))}
            placeholder="9-digit routing number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Select onValueChange={(value) => setFinancialInfo(prev => ({ ...prev, paymentTerms: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="net15">Net 15</SelectItem>
              <SelectItem value="net30">Net 30</SelectItem>
              <SelectItem value="net45">Net 45</SelectItem>
              <SelectItem value="net60">Net 60</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select onValueChange={(value) => setFinancialInfo(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="billingAddress">Billing Address</Label>
        <Textarea
          id="billingAddress"
          value={financialInfo.billingAddress}
          onChange={(e) => setFinancialInfo(prev => ({ ...prev, billingAddress: e.target.value }))}
          placeholder="Enter billing address"
          rows={3}
        />
      </div>

      <Button onClick={() => handleSaveSection('financial')} className="w-full">
        Save Financial Information
      </Button>
    </div>
  );

  const renderRoleAccess = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="userEmail">User Email *</Label>
          <Input
            id="userEmail"
            value={roleInfo.userEmail}
            onChange={(e) => setRoleInfo(prev => ({ ...prev, userEmail: e.target.value }))}
            placeholder="user@company.com"
            type="email"
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select onValueChange={(value) => setRoleInfo(prev => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="procurement">Procurement</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accessLevel">Access Level</Label>
          <Select onValueChange={(value) => setRoleInfo(prev => ({ ...prev, accessLevel: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="read">Read Only</SelectItem>
              <SelectItem value="write">Read/Write</SelectItem>
              <SelectItem value="admin">Full Access</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={roleInfo.department}
            onChange={(e) => setRoleInfo(prev => ({ ...prev, department: e.target.value }))}
            placeholder="Enter department"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPrimaryContact"
          checked={roleInfo.isPrimaryContact}
          onCheckedChange={(checked) => setRoleInfo(prev => ({ ...prev, isPrimaryContact: checked }))}
        />
        <Label htmlFor="isPrimaryContact">Primary Contact</Label>
      </div>

      <Button onClick={() => handleSaveSection('roles')} className="w-full">
        Save Role Information
      </Button>
    </div>
  );

  const renderComplianceTracking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="complianceType">Compliance Type *</Label>
          <Select onValueChange={(value) => setComplianceInfo(prev => ({ ...prev, complianceType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select compliance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iso9001">ISO 9001</SelectItem>
              <SelectItem value="iso27001">ISO 27001</SelectItem>
              <SelectItem value="sox">SOX Compliance</SelectItem>
              <SelectItem value="gdpr">GDPR</SelectItem>
              <SelectItem value="hipaa">HIPAA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select onValueChange={(value) => setComplianceInfo(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="non-compliant">Non-Compliant</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="certificationName">Certification Name</Label>
          <Input
            id="certificationName"
            value={complianceInfo.certificationName}
            onChange={(e) => setComplianceInfo(prev => ({ ...prev, certificationName: e.target.value }))}
            placeholder="Enter certification name"
          />
        </div>
        <div>
          <Label htmlFor="issuingAuthority">Issuing Authority</Label>
          <Input
            id="issuingAuthority"
            value={complianceInfo.issuingAuthority}
            onChange={(e) => setComplianceInfo(prev => ({ ...prev, issuingAuthority: e.target.value }))}
            placeholder="Enter issuing authority"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={complianceInfo.issueDate}
            onChange={(e) => setComplianceInfo(prev => ({ ...prev, issueDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            value={complianceInfo.expiryDate}
            onChange={(e) => setComplianceInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="complianceScore">Compliance Score (0-100)</Label>
          <Input
            id="complianceScore"
            type="number"
            min="0"
            max="100"
            value={complianceInfo.complianceScore}
            onChange={(e) => setComplianceInfo(prev => ({ ...prev, complianceScore: e.target.value }))}
            placeholder="Enter score"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={complianceInfo.notes}
          onChange={(e) => setComplianceInfo(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Enter compliance notes..."
          rows={3}
        />
      </div>

      <Button onClick={() => handleSaveSection('compliance')} className="w-full">
        Save Compliance Information
      </Button>
    </div>
  );

  const renderDocumentManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Business License</h4>
          <p className="text-sm text-gray-600 mb-2">Upload your business registration certificate</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => handleFileUpload(e, 'Business License')}
            className="hidden"
            id="business-license"
          />
          <Button 
            onClick={() => document.getElementById('business-license')?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Business License'}
          </Button>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Tax Certificate</h4>
          <p className="text-sm text-gray-600 mb-2">Upload your tax registration certificate</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => handleFileUpload(e, 'Tax Certificate')}
            className="hidden"
            id="tax-certificate"
          />
          <Button 
            onClick={() => document.getElementById('tax-certificate')?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Tax Certificate'}
          </Button>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Insurance Certificate</h4>
          <p className="text-sm text-gray-600 mb-2">Upload your insurance coverage certificate</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => handleFileUpload(e, 'Insurance Certificate')}
            className="hidden"
            id="insurance-certificate"
          />
          <Button 
            onClick={() => document.getElementById('insurance-certificate')?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Insurance Certificate'}
          </Button>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Compliance Documents</h4>
          <p className="text-sm text-gray-600 mb-2">Upload compliance and certification documents</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => handleFileUpload(e, 'Compliance Document')}
            className="hidden"
            id="compliance-document"
          />
          <Button 
            onClick={() => document.getElementById('compliance-document')?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Compliance Document'}
          </Button>
        </Card>
      </div>

      {documents.length > 0 && (
        <div>
          <h4 className="font-medium mb-4">Uploaded Documents</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{doc.document_name}</p>
                  <p className="text-sm text-gray-600">{doc.document_type} • {new Date(doc.upload_date).toLocaleDateString()}</p>
                </div>
                <Badge variant="secondary">{doc.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={() => handleSaveSection('documents')} className="w-full">
        Complete Document Section
      </Button>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <h4 className="font-medium mb-2">Compliance Rate</h4>
          <p className="text-2xl font-bold text-green-600">85%</p>
        </Card>
        <Card className="p-4 text-center">
          <h4 className="font-medium mb-2">Documents Submitted</h4>
          <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <h4 className="font-medium mb-2">Risk Level</h4>
          <p className="text-2xl font-bold text-yellow-600">Low</p>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-medium mb-4">Performance Metrics</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Response Time</span>
              <span className="text-sm">Good (2 days avg)</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Completion Rate</span>
              <span className="text-sm">95%</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Quality Score</span>
              <span className="text-sm">8.5/10</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </div>
      </Card>

      <Button onClick={generatePerformanceReport} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download Performance Report
      </Button>
    </div>
  );

  const renderAuditNotifications = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h4 className="font-medium mb-4">Notification Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive email updates about your account</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notificationPrefs.emailNotifications}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="statusUpdates">Status Updates</Label>
              <p className="text-sm text-gray-600">Get notified about status changes</p>
            </div>
            <Switch
              id="statusUpdates"
              checked={notificationPrefs.statusUpdates}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, statusUpdates: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="documentReminders">Document Reminders</Label>
              <p className="text-sm text-gray-600">Reminders for document expiry dates</p>
            </div>
            <Switch
              id="documentReminders"
              checked={notificationPrefs.documentReminders}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, documentReminders: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="complianceAlerts">Compliance Alerts</Label>
              <p className="text-sm text-gray-600">Important compliance notifications</p>
            </div>
            <Switch
              id="complianceAlerts"
              checked={notificationPrefs.complianceAlerts}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, complianceAlerts: checked }))}
            />
          </div>
        </div>
      </Card>

      <Button onClick={() => handleSaveSection('audit')} className="w-full">
        Save Notification Preferences
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Vendor Profile</h1>
                <p className="text-sm text-gray-600">Vendor ID: {currentUser?.vendorId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Active</Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentSection(section.id)}
                  >
                    {section.icon}
                    <span className="ml-2">{section.name}</span>
                    {section.id === 'general' && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {sections.find(s => s.id === currentSection)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSection === 'general' && renderGeneralInfo()}
                {currentSection === 'roles' && renderRoleAccess()}
                {currentSection === 'compliance' && renderComplianceTracking()}
                {currentSection === 'documents' && renderDocumentManagement()}
                {currentSection === 'analytics' && renderAnalytics()}
                {currentSection === 'audit' && renderAuditNotifications()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
