
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, FileText, Shield, BarChart3, Bell, Download, Upload, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  vendor_id: string;
  legal_entity_name: string;
  email: string;
  contact_name: string;
  phone_number: string;
  city: string;
  state: string;
  country: string;
  vendor_type: string;
  registration_status: string;
  created_at: string;
  business_description?: string;
  website?: string;
  annual_revenue?: string;
  employee_count?: string;
  tax_id?: string;
  street_address: string;
  postal_code: string;
  contact_phone?: string;
  trade_name?: string;
  year_established?: string;
  vat_id?: string;
  payment_terms?: string;
  bank_account_details?: string;
  currency?: string;
  relationship_owner?: string;
  products_services_description?: string;
  reconciliation_account?: string;
  w9_status?: string;
  w8_ben_status?: string;
  w8_ben_e_status?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  admin_id?: string;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  vendor_id: string;
  upload_date: string;
  file_size: number;
  status: string;
  uploaded_by: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  vendor_id?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingVendors: 0,
    totalDocuments: 0
  });

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin-login');
      return;
    }

    fetchDashboardData();
    fetchNotifications();
  }, [navigate]);

  const calculateVendorStatus = (vendor: Vendor) => {
    const requiredFields = [
      'legal_entity_name', 'email', 'contact_name', 'phone_number',
      'city', 'state', 'country', 'vendor_type'
    ];
    
    const optionalFields = [
      'business_description', 'website', 'annual_revenue', 
      'employee_count', 'tax_id'
    ];

    const completedRequired = requiredFields.filter(field => 
      vendor[field as keyof Vendor] && vendor[field as keyof Vendor] !== ''
    ).length;

    const completedOptional = optionalFields.filter(field => 
      vendor[field as keyof Vendor] && vendor[field as keyof Vendor] !== ''
    ).length;

    const requiredCompletion = (completedRequired / requiredFields.length) * 100;
    const optionalCompletion = (completedOptional / optionalFields.length) * 100;
    const overallCompletion = (requiredCompletion * 0.8) + (optionalCompletion * 0.2);

    if (overallCompletion >= 90) return 'completed';
    if (overallCompletion >= 70) return 'in_progress';
    if (overallCompletion >= 30) return 'incomplete';
    return 'pending';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError);
        toast.error('Failed to load vendors');
      } else {
        const updatedVendors = vendorsData?.map(vendor => ({
          ...vendor,
          registration_status: calculateVendorStatus(vendor)
        })) || [];
        setVendors(updatedVendors);
      }

      // Fetch admin users with profiles
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_profiles(admin_id)
        `)
        .order('created_at', { ascending: false });

      if (adminError) {
        console.error('Error fetching admin users:', adminError);
        toast.error('Failed to load admin users');
      } else {
        const formattedAdmins = adminData?.map(admin => ({
          ...admin,
          admin_id: admin.admin_profiles?.[0]?.admin_id || 'Generating...'
        })) || [];
        setAdminUsers(formattedAdmins);
      }

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      } else {
        setDocuments(documentsData || []);
      }

      // Calculate stats
      const totalVendors = vendorsData?.length || 0;
      const activeVendors = vendorsData?.filter(v => ['completed', 'in_progress'].includes(calculateVendorStatus(v))).length || 0;
      const pendingVendors = vendorsData?.filter(v => ['pending', 'incomplete'].includes(calculateVendorStatus(v))).length || 0;
      const totalDocuments = documentsData?.length || 0;

      setStats({
        totalVendors,
        activeVendors,
        pendingVendors,
        totalDocuments
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // First, generate some sample notifications if none exist
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (!existingNotifications || existingNotifications.length === 0) {
        const sampleNotifications = [
          {
            title: 'New Vendor Registration',
            message: 'A new vendor "Tech Solutions Inc." has registered and requires approval',
            notification_type: 'vendor_registration',
            priority: 'high',
            is_read: false,
            vendor_id: 'VEN001'
          },
          {
            title: 'Document Expiring Soon',
            message: 'ISO certificate for vendor "Global Supplies Ltd" expires in 15 days',
            notification_type: 'compliance_alert',
            priority: 'medium',
            is_read: false,
            vendor_id: 'VEN002'
          },
          {
            title: 'Vendor Status Updated',
            message: 'Vendor "Manufacturing Corp" status changed to approved',
            notification_type: 'status_update',
            priority: 'low',
            is_read: true,
            vendor_id: 'VEN003'
          },
          {
            title: 'Compliance Review Required',
            message: 'Monthly compliance review for 12 vendors is due',
            notification_type: 'compliance_alert',
            priority: 'high',
            is_read: false
          }
        ];

        await supabase.from('notifications').insert(sampleNotifications);
      }

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
    toast.success('Logged out successfully');
  };

  const exportVendorsToCSV = () => {
    if (vendors.length === 0) {
      toast.error('No vendors to export');
      return;
    }

    const headers = [
      'Vendor ID', 'Legal Entity Name', 'Email', 'Contact Name', 'Phone', 
      'City', 'State', 'Country', 'Vendor Type', 'Status', 'Created Date',
      'Business Description', 'Website', 'Annual Revenue', 'Employee Count', 'Tax ID'
    ];

    const csvData = vendors.map(vendor => [
      vendor.vendor_id,
      vendor.legal_entity_name,
      vendor.email,
      vendor.contact_name,
      vendor.phone_number || '',
      vendor.city,
      vendor.state,
      vendor.country,
      vendor.vendor_type,
      vendor.registration_status,
      new Date(vendor.created_at).toLocaleDateString(),
      vendor.business_description || '',
      vendor.website || '',
      vendor.annual_revenue || '',
      vendor.employee_count || '',
      vendor.tax_id || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Vendors exported successfully!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      in_progress: { variant: 'secondary' as const, icon: Clock, label: 'In Progress' },
      incomplete: { variant: 'outline' as const, icon: AlertTriangle, label: 'Incomplete' },
      pending: { variant: 'destructive' as const, icon: XCircle, label: 'Pending' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {adminUser.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin ID: <strong>{adminUser.adminId}</strong></span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalVendors}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeVendors}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Vendors</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingVendors}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalDocuments}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="role-access">Role-Based Access</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Vendor Management */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Vendor Management</CardTitle>
                  <Button onClick={exportVendorsToCSV} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor ID</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.vendor_id}>
                          <TableCell className="font-mono text-sm">{vendor.vendor_id}</TableCell>
                          <TableCell className="font-medium">{vendor.legal_entity_name}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>{vendor.contact_name}</TableCell>
                          <TableCell>{vendor.city}, {vendor.state}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{vendor.vendor_type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(vendor.registration_status)}</TableCell>
                          <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedVendor(vendor)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Comprehensive Vendor Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for {vendor.legal_entity_name}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedVendor && (
                                  <div className="space-y-6">
                                    {/* General Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-blue-900">General Information</h3>
                                      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                                        <div>
                                          <label className="font-semibold text-gray-700">Vendor ID:</label>
                                          <p className="text-gray-900">{selectedVendor.vendor_id}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Legal Entity Name:</label>
                                          <p className="text-gray-900">{selectedVendor.legal_entity_name}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Trade Name:</label>
                                          <p className="text-gray-900">{selectedVendor.trade_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Contact Name:</label>
                                          <p className="text-gray-900">{selectedVendor.contact_name}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Email:</label>
                                          <p className="text-gray-900">{selectedVendor.email}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Phone:</label>
                                          <p className="text-gray-900">{selectedVendor.phone_number || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Website:</label>
                                          <p className="text-gray-900">{selectedVendor.website || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Vendor Type:</label>
                                          <p className="text-gray-900">{selectedVendor.vendor_type}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Address Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-green-900">Address Information</h3>
                                      <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                                        <div className="col-span-2">
                                          <label className="font-semibold text-gray-700">Street Address:</label>
                                          <p className="text-gray-900">{selectedVendor.street_address}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">City:</label>
                                          <p className="text-gray-900">{selectedVendor.city}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">State:</label>
                                          <p className="text-gray-900">{selectedVendor.state}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Postal Code:</label>
                                          <p className="text-gray-900">{selectedVendor.postal_code}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Country:</label>
                                          <p className="text-gray-900">{selectedVendor.country}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Financial Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-purple-900">Financial Information</h3>
                                      <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                                        <div>
                                          <label className="font-semibold text-gray-700">Annual Revenue:</label>
                                          <p className="text-gray-900">{selectedVendor.annual_revenue || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Currency:</label>
                                          <p className="text-gray-900">{selectedVendor.currency || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Tax ID:</label>
                                          <p className="text-gray-900">{selectedVendor.tax_id || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">VAT ID:</label>
                                          <p className="text-gray-900">{selectedVendor.vat_id || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Payment Terms:</label>
                                          <p className="text-gray-900">{selectedVendor.payment_terms || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Bank Account:</label>
                                          <p className="text-gray-900">{selectedVendor.bank_account_details || 'N/A'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Compliance Information */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-orange-900">Compliance Information</h3>
                                      <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50 rounded-lg">
                                        <div>
                                          <label className="font-semibold text-gray-700">W-9 Status:</label>
                                          <p className="text-gray-900">{selectedVendor.w9_status || 'Not Submitted'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">W-8BEN Status:</label>
                                          <p className="text-gray-900">{selectedVendor.w8_ben_status || 'Not Submitted'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">W-8BEN-E Status:</label>
                                          <p className="text-gray-900">{selectedVendor.w8_ben_e_status || 'Not Submitted'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Business Details */}
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3 text-teal-900">Business Details</h3>
                                      <div className="p-4 bg-teal-50 rounded-lg space-y-3">
                                        <div>
                                          <label className="font-semibold text-gray-700">Business Description:</label>
                                          <p className="text-gray-900">{selectedVendor.business_description || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <label className="font-semibold text-gray-700">Products/Services:</label>
                                          <p className="text-gray-900">{selectedVendor.products_services_description || 'N/A'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="font-semibold text-gray-700">Employee Count:</label>
                                            <p className="text-gray-900">{selectedVendor.employee_count || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <label className="font-semibold text-gray-700">Year Established:</label>
                                            <p className="text-gray-900">{selectedVendor.year_established || 'N/A'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role-Based Access */}
          <TabsContent value="role-access">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Access Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-mono text-sm">{admin.admin_id}</TableCell>
                          <TableCell className="font-medium">{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{admin.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {admin.role === 'Admin' ? 'Full Access' : 
                               admin.role === 'Procurement Officer' ? 'Vendor Management' :
                               admin.role === 'Finance Team' ? 'Financial Data' : 'Limited Access'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={admin.is_active ? "default" : "destructive"}>
                              {admin.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Vendor ID</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.slice(0, 10).map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.document_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.document_type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{doc.vendor_id}</TableCell>
                          <TableCell>{doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</TableCell>
                          <TableCell>{doc.uploaded_by}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'active' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-900">Compliant</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.activeVendors}</p>
                    <p className="text-sm text-green-700">Vendors meeting all requirements</p>
                  </div>
                  
                  <div className="text-center p-6 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-yellow-900">Pending Review</h3>
                    <p className="text-3xl font-bold text-yellow-600">{Math.floor(stats.pendingVendors / 2)}</p>
                    <p className="text-sm text-yellow-700">Vendors awaiting compliance check</p>
                  </div>
                  
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-900">Non-Compliant</h3>
                    <p className="text-3xl font-bold text-red-600">{Math.ceil(stats.pendingVendors / 2)}</p>
                    <p className="text-sm text-red-700">Vendors requiring attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 rounded-lg border ${
                      notification.is_read ? 'bg-gray-50' : `${getPriorityColor(notification.priority)}`
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className="h-4 w-4" />
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant={notification.priority === 'high' ? 'destructive' : notification.priority === 'medium' ? 'default' : 'secondary'}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                            {notification.vendor_id && ` • Vendor: ${notification.vendor_id}`}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No notifications available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
