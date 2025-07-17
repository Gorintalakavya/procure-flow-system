
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Props {
  vendor: VendorData;
  onUpdate: (updatedVendor: VendorData) => void;
}

const VendorProcurementSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditedData({
      primary_contact: vendor.contact_name || '',
      secondary_contact: '',
      relationship_owner: vendor.relationship_owner || '',
      services_offered: vendor.products_services_description || '',
      contract_details: '',
      billing_address: `${vendor.street_address || ''} ${vendor.street_address_line2 || ''} ${vendor.city || ''}, ${vendor.state || ''} ${vendor.postal_code || ''}`
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update vendor table
      const { error } = await supabase
        .from('vendors')
        .update({
          contact_name: editedData.primary_contact,
          relationship_owner: editedData.relationship_owner,
          products_services_description: editedData.services_offered
        })
        .eq('vendor_id', vendor.vendor_id);

      if (error) throw error;

      // Update or insert vendor profile
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          vendor_id: vendor.vendor_id,
          primary_contact: editedData.primary_contact,
          secondary_contact: editedData.secondary_contact,
          relationship_owner: editedData.relationship_owner,
          services_offered: editedData.services_offered,
          contract_details: editedData.contract_details,
          billing_address: editedData.billing_address
        });

      if (profileError) throw profileError;

      const updatedVendor = { 
        ...vendor, 
        contact_name: editedData.primary_contact,
        relationship_owner: editedData.relationship_owner,
        products_services_description: editedData.services_offered
      };
      onUpdate(updatedVendor);
      setIsEditing(false);
      toast.success('Procurement information saved successfully');
    } catch (error) {
      console.error('Error saving procurement information:', error);
      toast.error('Failed to save procurement information');
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
            <CardTitle>Procurement Information</CardTitle>
            <p className="text-sm text-gray-600">Contact details and service information</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Primary Contact</Label>
            <Input 
              value={isEditing ? editedData.primary_contact || '' : vendor.contact_name || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, primary_contact: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter primary contact name"
            />
          </div>
          
          <div>
            <Label>Secondary Contact</Label>
            <Input 
              value={isEditing ? editedData.secondary_contact || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, secondary_contact: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter secondary contact name"
            />
          </div>
        </div>

        <div>
          <Label>Relationship Owner</Label>
          <Input 
            value={isEditing ? editedData.relationship_owner || '' : vendor.relationship_owner || ''}
            onChange={(e) => setEditedData(prev => ({ ...prev, relationship_owner: e.target.value }))}
            disabled={!isEditing}
            className={!isEditing ? "bg-gray-50" : ""}
            placeholder="Enter relationship owner"
          />
        </div>

        <div>
          <Label>Services Offered</Label>
          {isEditing ? (
            <Textarea
              value={editedData.services_offered || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, services_offered: e.target.value }))}
              rows={4}
              placeholder="Describe the services offered"
            />
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
              {vendor.products_services_description || 'No services described'}
            </div>
          )}
        </div>

        <div>
          <Label>Contract Details</Label>
          {isEditing ? (
            <Textarea
              value={editedData.contract_details || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, contract_details: e.target.value }))}
              rows={4}
              placeholder="Enter contract details"
            />
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
              No contract details provided
            </div>
          )}
        </div>

        <div>
          <Label>Billing Address</Label>
          {isEditing ? (
            <Textarea
              value={editedData.billing_address || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, billing_address: e.target.value }))}
              rows={3}
              placeholder="Enter billing address"
            />
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              {`${vendor.street_address || ''} ${vendor.street_address_line2 || ''} ${vendor.city || ''}, ${vendor.state || ''} ${vendor.postal_code || ''}` || 'No billing address provided'}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Procurement Information'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorProcurementSection;
