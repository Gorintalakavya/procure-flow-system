
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Eye, Edit, Check, X, Mail, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import VendorDetailsModal from "./VendorDetailsModal";
import VendorProfileEditor from "./VendorProfileEditor";

interface Vendor {
  vendor_id: string;
  legal_entity_name: string;
  trade_name?: string;
  email: string;
  registration_status: string;
  vendor_type: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
  phone_number?: string;
  website?: string;
  business_description?: string;
  year_established?: string;
  employee_count?: string;
  annual_revenue?: string;
  operating_status?: string;
  stock_symbol?: string;
  duns_number?: string;
  contact_name?: string;
  street_address?: string;
}

const AdminVendorManagement = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, statusFilter]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.legal_entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.vendor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.registration_status === statusFilter);
    }

    setFilteredVendors(filtered);
  };

  const updateVendorStatus = async (vendorId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ registration_status: newStatus })
        .eq('vendor_id', vendorId);

      if (error) throw error;

      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'STATUS_UPDATE',
          entity_type: 'vendor',
          entity_id: vendorId,
          new_values: { registration_status: newStatus, admin_notes: notes },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      const vendor = vendors.find(v => v.vendor_id === vendorId);
      if (vendor) {
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: vendor.email,
            vendorId: vendorId,
            section: 'vendor',
            action: newStatus === 'approved' ? 'approval' : 'rejection',
            notes: notes
          }
        });
      }

      toast.success(`Vendor status updated to ${newStatus}. Confirmation email sent.`);
      fetchVendors();
      setSelectedVendor(null);
      setReviewNotes('');
      setShowReviewDialog(false);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status');
    }
  };

  const handleVendorUpdate = (updatedVendor: Vendor) => {
    setVendors(prev => prev.map(v => v.vendor_id === updatedVendor.vendor_id ? updatedVendor : v));
    setEditingVendor(null);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Vendor ID', 'Company Name', 'Email', 'Status', 'Type', 'Location', 'Registration Date'],
      ...filteredVendors.map(vendor => [
        vendor.vendor_id,
        vendor.legal_entity_name,
        vendor.email,
        vendor.registration_status,
        vendor.vendor_type,
        `${vendor.city}, ${vendor.state}, ${vendor.country}`,
        new Date(vendor.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendors_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
  };

  const handleReviewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowReviewDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company name, email, vendor ID, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.vendor_id}>
                  <TableCell className="font-mono">{vendor.vendor_id}</TableCell>
                  <TableCell className="font-medium">{vendor.legal_entity_name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{getStatusBadge(vendor.registration_status)}</TableCell>
                  <TableCell className="capitalize">{vendor.vendor_type}</TableCell>
                  <TableCell>{vendor.city}, {vendor.state}</TableCell>
                  <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVendor(vendor)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVendor(vendor)}
                        title="Edit Vendor"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewVendor(vendor)}
                        title="Review Status"
                      >
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Details Modal */}
      <VendorDetailsModal
        vendor={selectedVendor}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedVendor(null);
        }}
      />

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <VendorProfileEditor
          vendor={editingVendor}
          onUpdate={handleVendorUpdate}
          isAdmin={true}
        />
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Vendor: {selectedVendor?.legal_entity_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vendor ID</Label>
              <p className="font-mono text-sm">{selectedVendor?.vendor_id}</p>
            </div>
            <div>
              <Label>Current Status</Label>
              <div className="mt-1">{selectedVendor && getStatusBadge(selectedVendor.registration_status)}</div>
            </div>
            <div>
              <Label htmlFor="reviewNotes">Review Notes (optional)</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this decision..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => selectedVendor && updateVendorStatus(selectedVendor.vendor_id, 'approved', reviewNotes)}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => selectedVendor && updateVendorStatus(selectedVendor.vendor_id, 'rejected', reviewNotes)}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => selectedVendor && updateVendorStatus(selectedVendor.vendor_id, 'suspended', reviewNotes)}
            >
              Suspend
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVendorManagement;
