
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Save, X } from "lucide-react";
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

interface VendorProfileEditorProps {
  vendor: VendorData;
  onUpdate: (updatedVendor: VendorData) => void;
  isAdmin?: boolean;
}

const VendorProfileEditor: React.FC<VendorProfileEditorProps> = ({ vendor, onUpdate, isAdmin = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<VendorData>(vendor);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update(editedData)
        .eq('vendor_id', vendor.vendor_id);

      if (error) throw error;

      onUpdate(editedData);
      setIsEditing(false);
      toast.success('Vendor profile updated successfully');
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      toast.error('Failed to update vendor profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData(vendor);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof VendorData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isEditing) {
    return (
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legal_entity_name">Legal Entity Name *</Label>
                  <Input
                    id="legal_entity_name"
                    value={editedData.legal_entity_name}
                    onChange={(e) => handleInputChange('legal_entity_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="trade_name">Trade Name (DBA)</Label>
                  <Input
                    id="trade_name"
                    value={editedData.trade_name || ''}
                    onChange={(e) => handleInputChange('trade_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor_type">Company Type</Label>
                  <Select value={editedData.vendor_type} onValueChange={(value) => handleInputChange('vendor_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="for-profit">For Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="operating_status">Operating Status</Label>
                  <Select value={editedData.operating_status || ''} onValueChange={(value) => handleInputChange('operating_status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="dissolved">Dissolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year_established">Year Established</Label>
                  <Input
                    id="year_established"
                    value={editedData.year_established || ''}
                    onChange={(e) => handleInputChange('year_established', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stock_symbol">Stock Symbol</Label>
                  <Input
                    id="stock_symbol"
                    value={editedData.stock_symbol || ''}
                    onChange={(e) => handleInputChange('stock_symbol', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="duns_number">D-U-N-S Number</Label>
                  <Input
                    id="duns_number"
                    value={editedData.duns_number || ''}
                    onChange={(e) => handleInputChange('duns_number', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business_description">About the Company</Label>
                <Textarea
                  id="business_description"
                  value={editedData.business_description || ''}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Primary Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={editedData.contact_name || ''}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={editedData.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editedData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  value={editedData.street_address || ''}
                  onChange={(e) => handleInputChange('street_address', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="street_address_line2">Street Address Line 2</Label>
                <Input
                  id="street_address_line2"
                  value={editedData.street_address_line2 || ''}
                  onChange={(e) => handleInputChange('street_address_line2', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editedData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={editedData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">ZIP Code</Label>
                  <Input
                    id="postal_code"
                    value={editedData.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={editedData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_count">Employee Count</Label>
                  <Select value={editedData.employee_count || ''} onValueChange={(value) => handleInputChange('employee_count', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1,000</SelectItem>
                      <SelectItem value="1001-5000">1,001-5,000</SelectItem>
                      <SelectItem value="5001-10000">5,001-10,000</SelectItem>
                      <SelectItem value="10001-50000">10,001-50,000</SelectItem>
                      <SelectItem value="50000+">50,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="annual_revenue">Annual Revenue</Label>
                  <Select value={editedData.annual_revenue || ''} onValueChange={(value) => handleInputChange('annual_revenue', value)}>
                    <SelectTrigger>
                      <SelectValue />
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
                </div>
              </div>

              <div>
                <Label htmlFor="products_services_description">Products/Services Description</Label>
                <Textarea
                  id="products_services_description"
                  value={editedData.products_services_description || ''}
                  onChange={(e) => handleInputChange('products_services_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    value={editedData.tax_id || ''}
                    onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={editedData.currency || 'USD'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorProfileEditor;
