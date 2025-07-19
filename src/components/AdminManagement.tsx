
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Edit, Trash2, Shield, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_profiles?: {
    admin_id: string;
  }[];
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm]);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_profiles(admin_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admin users');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.admin_profiles?.[0]?.admin_id && 
         admin.admin_profiles[0].admin_id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredAdmins(filtered);
  };

  const handleViewAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowDetailsModal(true);
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      setIsLoading(true);

      // Delete admin profile first
      if (adminToDelete.admin_profiles?.[0]?.admin_id) {
        const { error: profileError } = await supabase
          .from('admin_profiles')
          .delete()
          .eq('admin_user_id', adminToDelete.id);

        if (profileError) console.error('Error deleting admin profile:', profileError);
      }

      // Delete admin user
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminToDelete.id);

      if (adminError) throw adminError;

      // Log the deletion
      await supabase
        .from('audit_logs')
        .insert({
          action: 'ADMIN_DELETED',
          entity_type: 'admin',
          entity_id: adminToDelete.id,
          new_values: { 
            deleted_admin: adminToDelete.email,
            deleted_by: 'admin',
            reason: 'admin_deletion' 
          },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      toast.success('Admin deleted successfully');
      fetchAdmins();
      setShowDeleteDialog(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (admin: AdminUser) => {
    try {
      const newStatus = !admin.is_active;
      
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: newStatus })
        .eq('id', admin.id);

      if (error) throw error;

      toast.success(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading admins...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          Total Admins: {filteredAdmins.length}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, role, or admin ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Administrators ({filteredAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-mono">
                    {admin.admin_profiles?.[0]?.admin_id || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell className="capitalize">{admin.role}</TableCell>
                  <TableCell>{getStatusBadge(admin.is_active)}</TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAdmin(admin)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdminStatus(admin)}
                        title={admin.is_active ? "Deactivate Admin" : "Activate Admin"}
                        className={admin.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                      >
                        {admin.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin)}
                        title="Delete Admin"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div>
                <Label>Admin ID</Label>
                <p className="font-mono text-sm">
                  {selectedAdmin.admin_profiles?.[0]?.admin_id || 'Not assigned'}
                </p>
              </div>
              <div>
                <Label>Full Name</Label>
                <p className="text-sm">{selectedAdmin.name}</p>
              </div>
              <div>
                <Label>Email Address</Label>
                <p className="text-sm">{selectedAdmin.email}</p>
              </div>
              <div>
                <Label>Role</Label>
                <p className="text-sm capitalize">{selectedAdmin.role}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedAdmin.is_active)}</div>
              </div>
              <div>
                <Label>Account Created</Label>
                <p className="text-sm">{new Date(selectedAdmin.created_at).toLocaleString()}</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm">{new Date(selectedAdmin.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete admin <strong>{adminToDelete?.name}</strong>? 
              This action cannot be undone and will remove all admin privileges and access.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>Admin account and credentials</li>
                <li>All admin privileges and access rights</li>
                <li>Admin profile and associated data</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmDeleteAdmin}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;
