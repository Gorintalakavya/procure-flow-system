
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
      business_description: vendor.business_description || '',
      vendor_type: vendor.vendor_type || '',
      year_established: vendor.year_established || '',
      duns_number: vendor.duns_number || '',
      operating_status: vendor.operating_status || '',
      stock_symbol: vendor.stock_symbol || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        business_description: editedData.business_description,
        vendor_type: editedData.vendor_type,
        year_established: editedData.year_established,
        duns_number: editedData.duns_number,
        operating_status: editedData.operating_status,
        stock_symbol: editedData.stock_symbol
      };

      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('vendor_id', vendor.vendor_id);

      if (error) throw error;

      const updatedVendor = { ...vendor, ...updateData };
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Ranking</Label>
            {isEditing ? (
              <Input 
                value={editedData.vendor_type || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, vendor_type: e.target.value }))}
                placeholder="Enter ranking"
                className="mt-1"
              />
            ) : (
              <Input value={vendor.vendor_type || ''} readOnly className="mt-1 bg-gray-50" />
            )}
          </div>
          
          <div>
            <Label>Key Principal</Label>
            {isEditing ? (
              <Input 
                value={editedData.duns_number || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, duns_number: e.target.value }))}
                placeholder="Enter key principal"
                className="mt-1"
              />
            ) : (
              <Input value={vendor.duns_number || ''} readOnly className="mt-1 bg-gray-50" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Industry</Label>
            {isEditing ? (
              <Select value={editedData.operating_status || ''} onValueChange={(value) => setEditedData(prev => ({ ...prev, operating_status: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value={vendor.operating_status || ''} readOnly className="mt-1 bg-gray-50" />
            )}
          </div>
          
          <div>
            <Label>Year Started</Label>
            {isEditing ? (
              <Input 
                value={editedData.year_established || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, year_established: e.target.value }))}
                placeholder="e.g., 2010"
                type="number"
                className="mt-1"
              />
            ) : (
              <Input value={vendor.year_established || ''} readOnly className="mt-1 bg-gray-50" />
            )}
          </div>
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
