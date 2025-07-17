
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const VendorComplianceSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditedData({
      certifications: '',
      compliance_forms: '',
      regulatory_notes: '',
      last_audit_date: '',
      next_audit_date: ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update or insert vendor profile
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          vendor_id: vendor.vendor_id,
          certifications: editedData.certifications,
          compliance_forms: editedData.compliance_forms,
          regulatory_notes: editedData.regulatory_notes,
          last_audit_date: editedData.last_audit_date,
          next_audit_date: editedData.next_audit_date
        });

      if (profileError) throw profileError;

      setIsEditing(false);
      toast.success('Compliance information saved successfully');
    } catch (error) {
      console.error('Error saving compliance information:', error);
      toast.error('Failed to save compliance information');
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
            <CardTitle>Compliance & Audit</CardTitle>
            <p className="text-sm text-gray-600">Certification and audit information</p>
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
          <Label>Certifications</Label>
          {isEditing ? (
            <Textarea
              value={editedData.certifications || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, certifications: e.target.value }))}
              rows={4}
              placeholder="List all relevant certifications"
            />
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
              No certifications provided
            </div>
          )}
        </div>

        <div>
          <Label>Compliance Forms</Label>
          {isEditing ? (
            <Textarea
              value={editedData.compliance_forms || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, compliance_forms: e.target.value }))}
              rows={4}
              placeholder="List compliance forms and status"
            />
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
              No compliance forms provided
            </div>
          )}
        </div>

        <div>
          <Label>Regulatory Notes</Label>
          {isEditing ? (
            <Textarea
              value={editedData.regulatory_notes || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, regulatory_notes: e.target.value }))}
              rows={4}
              placeholder="Enter regulatory notes and compliance status"
            />
          ) : (
            <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
              No regulatory notes provided
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Last Audit Date</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input 
                type="date"
                value={isEditing ? editedData.last_audit_date || '' : ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, last_audit_date: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
          </div>
          
          <div>
            <Label>Next Audit Date</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input 
                type="date"
                value={isEditing ? editedData.next_audit_date || '' : ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, next_audit_date: e.target.value }))}
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
              {isLoading ? 'Saving...' : 'Save Compliance Information'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorComplianceSection;
