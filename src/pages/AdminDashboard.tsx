
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingApprovals: 0,
    activeVendors: 0,
    totalDocuments: 0
  });
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  useEffect(() => {
    // Check admin authentication
    const admin = localStorage.getItem('adminUser');
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    setAdminUser(JSON.parse(admin));
    
    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Load vendor statistics
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*');

      if (!vendorError && vendorData) {
        setVendors(vendorData);
        setStats({
          totalVendors: vendorData.length,
          pendingApprovals: vendorData.filter(v => v.registration_status === 'pending').length,
          activeVendors: vendorData.filter(v => v.registration_status === 'approved').length,
          totalDocuments: 0 // You can add document count logic here
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleVendorStatusChange = async (vendorId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ registration_status: status })
        .eq('vendor_id', vendorId);

      if (error) {
        toast.error('Failed to update vendor status');
        return;
      }

      toast.success(`Vendor ${status} successfully`);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('An error occurred while updating vendor status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-10 w-10 text-slate-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600">Vendor Management & Compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {adminUser.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalVendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeVendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Documents</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Management */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Management</CardTitle>
            <CardDescription>Review and manage vendor registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">Vendor List</TabsTrigger>
                <TabsTrigger value="details">Vendor Details</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{vendor.legal_entity_name}</h3>
                      <p className="text-sm text-slate-600">{vendor.email}</p>
                      <p className="text-sm text-slate-500">Vendor ID: {vendor.vendor_id}</p>
                      <p className="text-sm text-slate-500">Type: {vendor.vendor_type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={
                          vendor.registration_status === 'approved' ? 'default' :
                          vendor.registration_status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {vendor.registration_status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {vendor.registration_status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleVendorStatusChange(vendor.vendor_id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleVendorStatusChange(vendor.vendor_id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="details">
                {selectedVendor ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">{selectedVendor.legal_entity_name}</h3>
                      <Badge 
                        variant={
                          selectedVendor.registration_status === 'approved' ? 'default' :
                          selectedVendor.registration_status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {selectedVendor.registration_status}
                      </Badge>
                    </div>

                    {/* I. General Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>I. General Information</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Legal Entity Name</label>
                          <p className="text-sm">{selectedVendor.legal_entity_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Trade Name</label>
                          <p className="text-sm">{selectedVendor.trade_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Vendor ID</label>
                          <p className="text-sm">{selectedVendor.vendor_id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Vendor Type</label>
                          <p className="text-sm">{selectedVendor.vendor_type}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-slate-600">Address</label>
                          <p className="text-sm">
                            {selectedVendor.street_address}
                            {selectedVendor.street_address_line2 && `, ${selectedVendor.street_address_line2}`}
                            <br />
                            {selectedVendor.city}, {selectedVendor.state} {selectedVendor.postal_code}
                            <br />
                            {selectedVendor.country}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Contact Name</label>
                          <p className="text-sm">{selectedVendor.contact_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Contact Email</label>
                          <p className="text-sm">{selectedVendor.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Contact Phone</label>
                          <p className="text-sm">{selectedVendor.contact_phone || selectedVendor.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Website</label>
                          <p className="text-sm">{selectedVendor.website || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* II. Financial and Tax Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>II. Financial and Tax Information</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Tax ID</label>
                          <p className="text-sm">{selectedVendor.tax_id || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">VAT ID</label>
                          <p className="text-sm">{selectedVendor.vat_id || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Payment Terms</label>
                          <p className="text-sm">{selectedVendor.payment_terms || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Currency</label>
                          <p className="text-sm">{selectedVendor.currency || 'USD'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-slate-600">Bank Account Details</label>
                          <p className="text-sm">{selectedVendor.bank_account_details || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* III. Procurement & Relationship Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>III. Procurement & Relationship Information</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Relationship Owner</label>
                          <p className="text-sm">{selectedVendor.relationship_owner || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Reconciliation Account</label>
                          <p className="text-sm">{selectedVendor.reconciliation_account || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-slate-600">Products/Services Description</label>
                          <p className="text-sm">{selectedVendor.products_services_description || selectedVendor.business_description || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Contract Effective Date</label>
                          <p className="text-sm">{selectedVendor.contract_effective_date || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Contract Expiration Date</label>
                          <p className="text-sm">{selectedVendor.contract_expiration_date || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* IV. Regulatory & Compliance Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>IV. Regulatory & Compliance Information</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">W-9 Status</label>
                          <p className="text-sm">{selectedVendor.w9_status || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">W8-BEN Status</label>
                          <p className="text-sm">{selectedVendor.w8_ben_status || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">W8-BEN-E Status</label>
                          <p className="text-sm">{selectedVendor.w8_ben_e_status || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Business Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Business Information</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-600">Year Established</label>
                          <p className="text-sm">{selectedVendor.year_established || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Employee Count</label>
                          <p className="text-sm">{selectedVendor.employee_count || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Annual Revenue</label>
                          <p className="text-sm">{selectedVendor.annual_revenue || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-600">Registration Status</label>
                          <p className="text-sm">{selectedVendor.registration_status}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedVendor.registration_status === 'pending' && (
                      <div className="flex space-x-4">
                        <Button 
                          onClick={() => handleVendorStatusChange(selectedVendor.vendor_id, 'approved')}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Vendor
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleVendorStatusChange(selectedVendor.vendor_id, 'rejected')}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Vendor
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-600">Select a vendor from the list to view details</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
