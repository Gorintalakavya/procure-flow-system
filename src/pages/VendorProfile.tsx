
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Building2, User, CreditCard, FileText, Shield, BarChart3, Bell, LogOut, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VendorProfile = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('general');
  const [progress, setProgress] = useState(16);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
  }, [navigate]);

  const handleSaveSection = (sectionId: string) => {
    console.log(`Saving ${sectionId} section data`);
    
    let dataToSave;
    switch (sectionId) {
      case 'general':
        dataToSave = generalInfo;
        break;
      case 'financial':
        dataToSave = financialInfo;
        break;
      case 'procurement':
        dataToSave = procurementInfo;
        break;
      case 'regulatory':
        dataToSave = regulatoryInfo;
        break;
      default:
        dataToSave = {};
    }

    console.log(`${sectionId} data:`, dataToSave);
    
    // Here you would save to Supabase
    toast.success(`${sectionId} information saved successfully!`);
    
    // Update progress
    const completedSections = sections.filter(s => s.id !== 'audit').length;
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    const newProgress = Math.min(((currentIndex + 1) / completedSections) * 100, 100);
    setProgress(newProgress);
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

      <Button onClick={() => handleSaveSection('financial')} className="w-full">
        Save Financial Information
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
              <Badge variant="secondary">Pending</Badge>
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
                {currentSection === 'roles' && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Role-Based Access</h3>
                    <p className="text-gray-600">Configure user roles and permissions for your organization.</p>
                    <Button className="mt-4" onClick={() => handleSaveSection('roles')}>
                      Configure Roles
                    </Button>
                  </div>
                )}
                {currentSection === 'compliance' && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Tracking</h3>
                    <p className="text-gray-600">Monitor compliance status and regulatory requirements.</p>
                    <Button className="mt-4" onClick={() => handleSaveSection('compliance')}>
                      Update Compliance
                    </Button>
                  </div>
                )}
                {currentSection === 'documents' && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Document Management</h3>
                    <p className="text-gray-600">Upload and manage your business documents.</p>
                    <Button className="mt-4" onClick={() => handleSaveSection('documents')}>
                      Manage Documents
                    </Button>
                  </div>
                )}
                {currentSection === 'analytics' && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics & Reporting</h3>
                    <p className="text-gray-600">View performance metrics and generate reports.</p>
                    <Button className="mt-4" onClick={() => handleSaveSection('analytics')}>
                      View Analytics
                    </Button>
                  </div>
                )}
                {currentSection === 'audit' && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Audit & Notifications</h3>
                    <p className="text-gray-600">Configure notifications and view audit logs.</p>
                    <Button className="mt-4" onClick={() => handleSaveSection('audit')}>
                      Configure Notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
