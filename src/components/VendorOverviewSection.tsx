
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VendorData {
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
  street_address_line2?: string;
  postal_code?: string;
  tax_id?: string;
  products_services_description?: string;
  relationship_owner?: string;
  currency?: string;
  payment_terms?: string;
  bank_account_details?: string;
}

interface Props {
  vendor: VendorData;
  onUpdate: (updatedVendor: VendorData) => void;
}

const VendorOverviewSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<VendorData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditedData({
      legal_entity_name: vendor.legal_entity_name || '',
      trade_name: vendor.trade_name || '',
      contact_name: vendor.contact_name || '',
      email: vendor.email || '',
      phone_number: vendor.phone_number || '',
      website: vendor.website || '',
      street_address: vendor.street_address || '',
      street_address_line2: vendor.street_address_line2 || '',
      city: vendor.city || '',
      state: vendor.state || '',
      postal_code: vendor.postal_code || '',
      country: vendor.country || '',
      tax_id: vendor.tax_id || '',
      business_description: vendor.business_description || '',
      vendor_type: vendor.vendor_type || '',
      year_established: vendor.year_established || '',
      employee_count: vendor.employee_count || '',
      annual_revenue: vendor.annual_revenue || '',
      duns_number: vendor.duns_number || '',
      operating_status: vendor.operating_status || '',
      stock_symbol: vendor.stock_symbol || '',
      products_services_description: vendor.products_services_description || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update(editedData)
        .eq('vendor_id', vendor.vendor_id);

      if (error) throw error;

      const updatedVendor = { ...vendor, ...editedData };
      onUpdate(updatedVendor);
      setIsEditing(false);
      toast.success('Overview information saved successfully');
    } catch (error) {
      console.error('Error saving overview:', error);
      toast.error('Failed to save overview information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData({});
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Overview</CardTitle>
            <p className="text-sm text-gray-600">Company overview and general information</p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registration Details */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Legal Entity Name *</Label>
              {isEditing ? (
                <Input
                  value={editedData.legal_entity_name || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, legal_entity_name: e.target.value }))}
                  placeholder="Enter legal entity name"
                  required
                />
              ) : (
                <Input value={vendor.legal_entity_name || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            
            <div>
              <Label>Trade Name (DBA)</Label>
              {isEditing ? (
                <Input
                  value={editedData.trade_name || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, trade_name: e.target.value }))}
                  placeholder="Enter trade name"
                />
              ) : (
                <Input value={vendor.trade_name || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Contact Name *</Label>
              {isEditing ? (
                <Input
                  value={editedData.contact_name || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Enter contact name"
                  required
                />
              ) : (
                <Input value={vendor.contact_name || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Email *</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedData.email || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  required
                />
              ) : (
                <Input value={vendor.email || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Phone Number</Label>
              {isEditing ? (
                <Input
                  value={editedData.phone_number || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Enter phone number"
                />
              ) : (
                <Input value={vendor.phone_number || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Website</Label>
              {isEditing ? (
                <Input
                  value={editedData.website || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Enter website"
                />
              ) : (
                <Input value={vendor.website || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Tax ID</Label>
              {isEditing ? (
                <Input
                  value={editedData.tax_id || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, tax_id: e.target.value }))}
                  placeholder="Enter tax ID"
                />
              ) : (
                <Input value={vendor.tax_id || ''} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>

          <div className="mt-4">
            <Label>Street Address</Label>
            {isEditing ? (
              <Input
                value={editedData.street_address || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, street_address: e.target.value }))}
                placeholder="Enter street address"
              />
            ) : (
              <Input value={vendor.street_address || ''} readOnly className="bg-gray-50" />
            )}
          </div>

          <div className="mt-4">
            <Label>Street Address Line 2</Label>
            {isEditing ? (
              <Input
                value={editedData.street_address_line2 || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, street_address_line2: e.target.value }))}
                placeholder="Enter street address line 2"
              />
            ) : (
              <Input value={vendor.street_address_line2 || ''} readOnly className="bg-gray-50" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <Label>City</Label>
              {isEditing ? (
                <Input
                  value={editedData.city || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              ) : (
                <Input value={vendor.city || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>State</Label>
              {isEditing ? (
                <Input
                  value={editedData.state || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                />
              ) : (
                <Input value={vendor.state || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>ZIP Code</Label>
              {isEditing ? (
                <Input
                  value={editedData.postal_code || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="Enter ZIP code"
                />
              ) : (
                <Input value={vendor.postal_code || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Country</Label>
              {isEditing ? (
                <Input
                  value={editedData.country || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              ) : (
                <Input value={vendor.country || ''} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          
          <div>
            <Label className="text-base font-semibold">Company Description</Label>
            {isEditing ? (
              <Textarea
                value={editedData.business_description || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, business_description: e.target.value }))}
                rows={4}
                placeholder="Describe your company and services"
                className="mt-2"
              />
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
                {vendor.business_description || 'No description provided'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <Label>Company Type</Label>
              {isEditing ? (
                <Select value={editedData.vendor_type || ''} onValueChange={(value) => setEditedData(prev => ({ ...prev, vendor_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="nonprofit">Non-profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={vendor.vendor_type || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            
            <div>
              <Label>Year Established</Label>
              {isEditing ? (
                <Input
                  value={editedData.year_established || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, year_established: e.target.value }))}
                  placeholder="e.g., 2010"
                  type="number"
                />
              ) : (
                <Input value={vendor.year_established || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Employee Count</Label>
              {isEditing ? (
                <Select value={editedData.employee_count || ''} onValueChange={(value) => setEditedData(prev => ({ ...prev, employee_count: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1,000</SelectItem>
                    <SelectItem value="1001-5000">1,001-5,000</SelectItem>
                    <SelectItem value="5001+">5,001+</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={vendor.employee_count || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Annual Revenue</Label>
              {isEditing ? (
                <Select value={editedData.annual_revenue || ''} onValueChange={(value) => setEditedData(prev => ({ ...prev, annual_revenue: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select annual revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under $100K">Under $100K</SelectItem>
                    <SelectItem value="$100K - $500K">$100K - $500K</SelectItem>
                    <SelectItem value="$500K - $1M">$500K - $1M</SelectItem>
                    <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                    <SelectItem value="$5M - $10M">$5M - $10M</SelectItem>
                    <SelectItem value="$10M+">$10M+</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={vendor.annual_revenue || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>D-U-N-S Number</Label>
              {isEditing ? (
                <Input
                  value={editedData.duns_number || ''}
                  onChange={(e) => setEditedData(prev => ({ ...prev, duns_number: e.target.value }))}
                  placeholder="Enter D-U-N-S number"
                />
              ) : (
                <Input value={vendor.duns_number || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Operating Status</Label>
              {isEditing ? (
                <Select value={editedData.operating_status || ''} onValueChange={(value) => setEditedData(prev => ({ ...prev, operating_status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operating status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={vendor.operating_status || ''} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>

          <div className="mt-4">
            <Label>Products/Services Description</Label>
            {isEditing ? (
              <Textarea
                value={editedData.products_services_description || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, products_services_description: e.target.value }))}
                rows={3}
                placeholder="Describe your products and services"
              />
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[80px]">
                {vendor.products_services_description || 'No products/services description provided'}
              </div>
            )}
          </div>

          <div>
            <Label>Date of Incorporation</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={editedData.stock_symbol || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, stock_symbol: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Overview Information'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorOverviewSection;
