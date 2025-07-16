
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, Globe, MapPin, Calendar, Users, DollarSign } from "lucide-react";

interface Vendor {
  vendor_id: string;
  legal_entity_name: string;
  trade_name?: string;
  email: string;
  phone_number?: string;
  website?: string;
  business_description?: string;
  vendor_type: string;
  city: string;
  state: string;
  country: string;
  registration_status: string;
  year_established?: string;
  employee_count?: string;
  annual_revenue?: string;
  operating_status?: string;
  stock_symbol?: string;
  duns_number?: string;
  contact_name?: string;
  street_address?: string;
  created_at: string;
}

interface VendorDetailsModalProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
}

const VendorDetailsModal: React.FC<VendorDetailsModalProps> = ({ vendor, isOpen, onClose }) => {
  if (!vendor) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {vendor.legal_entity_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Vendor ID: {vendor.vendor_id}</p>
              {vendor.trade_name && (
                <p className="text-sm text-gray-600">Trade Name: {vendor.trade_name}</p>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(vendor.registration_status)}
              <p className="text-xs text-gray-500 mt-1">
                Registered: {new Date(vendor.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Company Type</p>
                  <p className="capitalize">{vendor.vendor_type}</p>
                </div>
                {vendor.operating_status && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Operating Status</p>
                    <p className="capitalize">{vendor.operating_status}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {vendor.year_established && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Year Established</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p>{vendor.year_established}</p>
                    </div>
                  </div>
                )}
                {vendor.employee_count && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Employee Count</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <p>{vendor.employee_count}</p>
                    </div>
                  </div>
                )}
                {vendor.annual_revenue && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Annual Revenue</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <p>{vendor.annual_revenue}</p>
                    </div>
                  </div>
                )}
              </div>

              {vendor.stock_symbol && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Stock Symbol</p>
                  <p className="font-mono">{vendor.stock_symbol}</p>
                </div>
              )}

              {vendor.duns_number && (
                <div>
                  <p className="text-sm font-medium text-gray-700">D-U-N-S Number</p>
                  <p className="font-mono">{vendor.duns_number}</p>
                </div>
              )}

              {vendor.business_description && (
                <div>
                  <p className="text-sm font-medium text-gray-700">About the Company</p>
                  <p className="text-gray-600 mt-1">{vendor.business_description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Primary Contact</p>
                  <p>{vendor.contact_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p>{vendor.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {vendor.phone_number && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p>{vendor.phone_number}</p>
                    </div>
                  </div>
                )}
                {vendor.website && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Website</p>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a 
                        href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <div className="mt-1">
                    {vendor.street_address && <p>{vendor.street_address}</p>}
                    <p>{vendor.city}, {vendor.state}</p>
                    <p className="text-gray-600">{vendor.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsModal;
