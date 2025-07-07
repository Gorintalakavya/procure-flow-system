import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Users, FileText, CheckCircle2, Clock, AlertTriangle, BarChart3, Bell, Building2, Eye, Check, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vendor-management');
  const [vendors, setVendors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch vendors
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      setVendors(vendorsData || []);

      // Fetch vendor users (users with vendor_id)
      const { data: usersData } = await supabase
        .from('user_roles')
        .select('*')
        .not('vendor_id', 'is', null)
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Fetch admin users with their admin IDs
      const { data: adminData } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_profiles(admin_id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      const formattedAdminData = adminData?.map(admin => ({
        id: admin.id,
        user_email: admin.email,
        role: 'admin',
        admin_id: admin.admin_profiles?.[0]?.admin_id || 'N/A',
        access_level: 'Full Access',
        department: 'Administration',
        created_at: admin.created_at
      })) || [];
      
      setAdminUsers(formattedAdminData);

      // Fetch compliance data
      const { data: complianceData } = await supabase
        .from('compliance_tracking')
        .select('*')
        .order('created_at', { ascending: false });
      setCompliance(complianceData || []);

      // Fetch documents
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .order('upload_date', { ascending: false });
      setDocuments(documentsData || []);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      setNotifications(notificationsData || []);

      // Fetch audit logs
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      setAuditLogs(auditData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorAction = async (vendorId: string, action: 'approve' | 'reject') => {
    setIsLoading(true);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('vendors')
        .update({ registration_status: newStatus })
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: action.toUpperCase(),
          entity_type: 'vendor',
          entity_id: vendorId,
          new_values: { registration_status: newStatus },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      toast.success(`Vendor ${action}d successfully`);
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      toast.error(`Failed to ${action} vendor`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
    toast.success('Logged out successfully');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const VendorDetailsModal = ({ vendor, onClose }: { vendor: any, onClose: () => void }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Vendor Details - {vendor.legal_entity_name}</DialogTitle>
        <DialogDescription>Complete vendor information</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">General Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Vendor ID:</strong> {vendor.vendor_id}</p>
            <p><strong>Legal Entity Name:</strong> {vendor.legal_entity_name}</p>
            <p><strong>Trade Name:</strong> {vendor.trade_name || 'N/A'}</p>
            <p><strong>Type:</strong> {vendor.vendor_type}</p>
            <p><strong>Email:</strong> {vendor.email}</p>
            <p><strong>Phone:</strong> {vendor.phone_number || 'N/A'}</p>
            <p><strong>Website:</strong> {vendor.website || 'N/A'}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Address Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Street:</strong> {vendor.street_address}</p>
            {vendor.street_address_line2 && <p><strong>Line 2:</strong> {vendor.street_address_line2}</p>}
            <p><strong>City:</strong> {vendor.city}</p>
            <p><strong>State:</strong> {vendor.state}</p>
            <p><strong>Postal Code:</strong> {vendor.postal_code}</p>
            <p><strong>Country:</strong> {vendor.country}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Financial Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Tax ID:</strong> {vendor.tax_id || 'N/A'}</p>
            <p><strong>VAT ID:</strong> {vendor.vat_id || 'N/A'}</p>
            <p><strong>Payment Terms:</strong> {vendor.payment_terms || 'N/A'}</p>
            <p><strong>Currency:</strong> {vendor.currency}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Compliance Status</h3>
          <div className="space-y-2 text-sm">
            <p><strong>W-9 Status:</strong> {vendor.w9_status || 'N/A'}</p>
            <p><strong>W8-BEN Status:</strong> {vendor.w8_ben_status || 'N/A'}</p>
            <p><strong>W8-BEN-E Status:</strong> {vendor.w8_ben_e_status || 'N/A'}</p>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Vendor Management & Compliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, Admin</span>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
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
            <CardContent className="flex items-center p-6">
              <Building2 className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
                <p className="text-gray-600">Total Vendors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-yellow-500 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.registration_status === 'pending').length}
                </p>
                <p className="text-gray-600">Pending Approvals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <CheckCircle2 className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {vendors.filter(v => v.registration_status === 'approved').length}
                </p>
                <p className="text-gray-600">Active Vendors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <FileText className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-gray-600">Documents</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="vendor-management">Vendor Management</TabsTrigger>
            <TabsTrigger value="role-based-access">Role-Based Access</TabsTrigger>
            <TabsTrigger value="compliance-tracking">Compliance Tracking</TabsTrigger>
            <TabsTrigger value="document-management">Document Management</TabsTrigger>
            <TabsTrigger value="analytics-reporting">Analytics & Reporting</TabsTrigger>
            <TabsTrigger value="audit-notifications">Audit & Notifications</TabsTrigger>
          </TabsList>

          {/* Vendor Management */}
          <TabsContent value="vendor-management">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Vendor Management
                </CardTitle>
                <CardDescription>Review and manage vendor registrations with complete information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor ID</TableHead>
                        <TableHead>Legal Entity Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.vendor_id}</TableCell>
                          <TableCell>{vendor.legal_entity_name}</TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell className="capitalize">{vendor.vendor_type}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(vendor.registration_status)}>
                              {vendor.registration_status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedVendor(vendor)}>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                {selectedVendor && (
                                  <VendorDetailsModal 
                                    vendor={selectedVendor} 
                                    onClose={() => setSelectedVendor(null)} 
                                  />
                                )}
                              </Dialog>
                              {vendor.registration_status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVendorAction(vendor.vendor_id, 'approve')}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVendorAction(vendor.vendor_id, 'reject')}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
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
          <TabsContent value="role-based-access">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Role-Based Access Control
                </CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Admin Users Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Admin Users</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Admin ID</TableHead>
                          <TableHead>Access Level</TableHead>
                          <TableHead>Department</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminUsers.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell>{admin.user_email}</TableCell>
                            <TableCell className="capitalize">{admin.role}</TableCell>
                            <TableCell className="font-medium">{admin.admin_id}</TableCell>
                            <TableCell>{admin.access_level}</TableCell>
                            <TableCell>{admin.department}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vendor Users Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vendor Users</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Vendor ID</TableHead>
                          <TableHead>Access Level</TableHead>
                          <TableHead>Department</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.user_email}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell className="font-medium">{user.vendor_id}</TableCell>
                            <TableCell>{user.access_level || 'Standard'}</TableCell>
                            <TableCell>{user.department || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tracking */}
          <TabsContent value="compliance-tracking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance Tracking
                </CardTitle>
                <CardDescription>Monitor vendor compliance and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Compliance Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compliance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.vendor_id}</TableCell>
                        <TableCell className="capitalize">{item.compliance_type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.expiry_date || 'N/A'}</TableCell>
                        <TableCell>{item.compliance_score || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Management */}
          <TabsContent value="document-management">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Management
                </CardTitle>
                <CardDescription>Manage vendor documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Vendor ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.document_name}</TableCell>
                        <TableCell>{doc.vendor_id}</TableCell>
                        <TableCell className="capitalize">{doc.document_type}</TableCell>
                        <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(doc.status)}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics & Reporting */}
          <TabsContent value="analytics-reporting">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics & Reporting
                </CardTitle>
                <CardDescription>View analytics and generate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">Vendor Registration Rate</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {vendors.filter(v => v.registration_status === 'approved').length}/{vendors.length}
                    </p>
                    <p className="text-blue-700 mt-1">Approved/Total</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900">Compliance Rate</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {compliance.filter(c => c.status === 'approved').length}/{compliance.length || 1}
                    </p>
                    <p className="text-green-700 mt-1">Compliant/Total</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900">Document Processing</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {documents.filter(d => d.status === 'active').length}/{documents.length || 1}
                    </p>
                    <p className="text-purple-700 mt-1">Active/Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit & Notifications */}
          <TabsContent value="audit-notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Audit & Notifications
                </CardTitle>
                <CardDescription>Monitor system activities and manage notification settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Audit Logs</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity Type</TableHead>
                          <TableHead>Vendor ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.slice(0, 10).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            <TableCell className="capitalize">{log.action}</TableCell>
                            <TableCell className="capitalize">{log.entity_type}</TableCell>
                            <TableCell>{log.vendor_id || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notifications.slice(0, 10).map((notification) => (
                          <TableRow key={notification.id}>
                            <TableCell>{notification.title}</TableCell>
                            <TableCell>{notification.message}</TableCell>
                            <TableCell className="capitalize">{notification.notification_type}</TableCell>
                            <TableCell>
                              <Badge className={
                                notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {notification.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(notification.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
