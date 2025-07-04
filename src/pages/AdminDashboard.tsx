
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Clock
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
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{vendor.legal_entity_name}</h3>
                    <p className="text-sm text-slate-600">{vendor.email}</p>
                    <p className="text-sm text-slate-500">Vendor ID: {vendor.vendor_id}</p>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
