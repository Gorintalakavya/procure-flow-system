
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X, Building2 } from "lucide-react";
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
  const [editedVendor, setEditedVendor] = useState<VendorData>(vendor);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedVendor(vendor);
  }, [vendor]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          legal_entity_name: editedVendor.legal_entity_name,
          trade_name: editedVendor.trade_name,
          email: editedVendor.email,
          contact_name: editedVendor.contact_name,
          phone_number: editedVendor.phone_number,
          website: editedVendor.website,
          business_description: editedVendor.business_description,
          vendor_type: editedVendor.vendor_type,
          street_address: editedVendor.street_address,
          street_address_line2: editedVendor.street_address_line2,
          city: editedVendor.city,
          state: editedVendor.state,
          country: editedVendor.country,
          postal_code: editedVendor.postal_code,
          year_established: editedVendor.year_established,
          employee_count: editedVendor.employee_count,
          annual_revenue: editedVendor.annual_revenue,
          operating_status: editedVendor.operating_status,
          stock_symbol: editedVendor.stock_symbol,
          duns_number: editedVendor.duns_number,
          tax_id: editedVendor.tax_id,
          products_services_description: editedVendor.products_services_description,
          relationship_owner: editedVendor.relationship_owner,
          currency: editedVendor.currency,
          payment_terms: editedVendor.payment_terms,
          bank_account_details: editedVendor.bank_account_details
        })
        .eq('vendor_id', vendor.vendor_id);

      if (error) throw error;

      onUpdate(editedVendor);
      setIsEditing(false);
      toast.success('Vendor information updated successfully');
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedVendor(vendor);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof VendorData, value: string) => {
    setEditedVendor(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Vendor Overview</CardTitle>
              <p className="text-sm text-gray-600">Basic information and registration details</p>
            </div>
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
        {/* Basic Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vendor ID</Label>
              <Input value={vendor.vendor_id} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Registration Status</Label>
              <Input value={vendor.registration_status} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Legal Entity Name *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.legal_entity_name}
                  onChange={(e) => handleInputChange('legal_entity_name', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.legal_entity_name} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Trade Name / DBA</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.trade_name || ''}
                  onChange={(e) => handleInputChange('trade_name', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.trade_name || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Primary Contact Name *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.contact_name || ''}
                  onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.contact_name || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Email Address *</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedVendor.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.email} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Phone Number</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.phone_number || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Website</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.website || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Vendor Type *</Label>
              {isEditing ? (
                <Select value={editedVendor.vendor_type} onValueChange={(value) => handleInputChange('vendor_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="non_profit">Non-Profit</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedVendor.vendor_type} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Year Established</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.year_established || ''}
                  onChange={(e) => handleInputChange('year_established', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.year_established || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Employee Count</Label>
              {isEditing ? (
                <Select value={editedVendor.employee_count || ''} onValueChange={(value) => handleInputChange('employee_count', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedVendor.employee_count || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Annual Revenue</Label>
              {isEditing ? (
                <Select value={editedVendor.annual_revenue || ''} onValueChange={(value) => handleInputChange('annual_revenue', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select annual revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< $1M">< $1M</SelectItem>
                    <SelectItem value="$1M - $10M">$1M - $10M</SelectItem>
                    <SelectItem value="$10M - $50M">$10M - $50M</SelectItem>
                    <SelectItem value="$50M - $100M">$50M - $100M</SelectItem>
                    <SelectItem value="$100M+">$100M+</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedVendor.annual_revenue || ''} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <Label>Business Description</Label>
            {isEditing ? (
              <Textarea
                value={editedVendor.business_description || ''}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                {editedVendor.business_description || 'No description provided'}
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Street Address *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.street_address || ''}
                  onChange={(e) => handleInputChange('street_address', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.street_address || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div className="md:col-span-2">
              <Label>Street Address Line 2</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.street_address_line2 || ''}
                  onChange={(e) => handleInputChange('street_address_line2', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.street_address_line2 || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>City *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.city} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>State/Province *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.state} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Postal Code *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.postal_code || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Country *</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              ) : (
                <Input value={editedVendor.country} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tax ID</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.tax_id || ''}
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.tax_id || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>DUNS Number</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.duns_number || ''}
                  onChange={(e) => handleInputChange('duns_number', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.duns_number || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Stock Symbol</Label>
              {isEditing ? (
                <Input
                  value={editedVendor.stock_symbol || ''}
                  onChange={(e) => handleInputChange('stock_symbol', e.target.value)}
                />
              ) : (
                <Input value={editedVendor.stock_symbol || ''} readOnly className="bg-gray-50" />
              )}
            </div>
            <div>
              <Label>Operating Status</Label>
              {isEditing ? (
                <Select value={editedVendor.operating_status || ''} onValueChange={(value) => handleInputChange('operating_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedVendor.operating_status || ''} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <Label>Products/Services Description</Label>
            {isEditing ? (
              <Textarea
                value={editedVendor.products_services_description || ''}
                onChange={(e) => handleInputChange('products_services_description', e.target.value)}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                {editedVendor.products_services_description || 'No description provided'}
              </div>
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorOverviewSection;
