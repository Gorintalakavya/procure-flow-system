
import React, { useState, useEffect } from 'react';
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

interface ComplianceData {
  compliance_status?: string;
  regulatory_bodies?: string;
  federal_regulations?: string;
  industry_regulations?: string;
  compliance_officer?: string;
  last_compliance_review?: string;
  next_compliance_review?: string;
  audit_type?: string;
  last_internal_audit?: string;
  last_external_audit?: string;
  external_auditing_firm?: string;
  audit_result_summary?: string;
  corrective_actions?: string;
  audit_reports_available?: string;
  next_audit_due?: string;
  certifications?: string;
  compliance_forms?: string;
  regulatory_notes?: string;
}

const VendorComplianceSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ComplianceData>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComplianceData();
  }, [vendor.vendor_id]);

  const fetchComplianceData = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('vendor_id', vendor.vendor_id)
        .single();

      if (!error && profile) {
        setEditedData({
          compliance_status: profile.compliance_status || '',
          regulatory_bodies: profile.regulatory_bodies || '',
          federal_regulations: profile.federal_regulations || '',
          industry_regulations: profile.industry_regulations || '',
          compliance_officer: profile.compliance_officer || '',
          last_compliance_review: profile.last_compliance_review || '',
          next_compliance_review: profile.next_compliance_review || '',
          audit_type: profile.audit_type || '',
          last_internal_audit: profile.last_internal_audit || '',
          last_external_audit: profile.last_external_audit || '',
          external_auditing_firm: profile.external_auditing_firm || '',
          audit_result_summary: profile.audit_result_summary || '',
          corrective_actions: profile.corrective_actions || '',
          audit_reports_available: profile.audit_reports_available || '',
          next_audit_due: profile.next_audit_due || '',
          certifications: profile.certifications || '',
          compliance_forms: profile.compliance_forms || '',
          regulatory_notes: profile.regulatory_notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          vendor_id: vendor.vendor_id,
          ...editedData
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
    fetchComplianceData();
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ComplianceData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
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
        {/* Compliance Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Compliance Status</Label>
              {isEditing ? (
                <Select value={editedData.compliance_status || ''} onValueChange={(value) => handleInputChange('compliance_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedData.compliance_status || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Compliance Officer Contact</Label>
              {isEditing ? (
                <Input
                  value={editedData.compliance_officer || ''}
                  onChange={(e) => handleInputChange('compliance_officer', e.target.value)}
                  placeholder="Name and email"
                />
              ) : (
                <Input value={editedData.compliance_officer || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Date of Last Compliance Review</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={editedData.last_compliance_review || ''}
                  onChange={(e) => handleInputChange('last_compliance_review', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label>Next Scheduled Compliance Review</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={editedData.next_compliance_review || ''}
                  onChange={(e) => handleInputChange('next_compliance_review', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <Label>Regulatory Bodies Involved</Label>
              {isEditing ? (
                <Textarea
                  value={editedData.regulatory_bodies || ''}
                  onChange={(e) => handleInputChange('regulatory_bodies', e.target.value)}
                  placeholder="E.g., IRS, SEC, OSHA, EPA, FTC, FDA"
                  rows={2}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {editedData.regulatory_bodies || 'No regulatory bodies specified'}
                </div>
              )}
            </div>

            <div>
              <Label>Applicable Federal Regulations</Label>
              {isEditing ? (
                <Textarea
                  value={editedData.federal_regulations || ''}
                  onChange={(e) => handleInputChange('federal_regulations', e.target.value)}
                  placeholder="SOX (Sarbanes-Oxley), HIPAA, GLBA, FCPA, etc."
                  rows={2}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {editedData.federal_regulations || 'No federal regulations specified'}
                </div>
              )}
            </div>

            <div>
              <Label>Industry-Specific Regulations</Label>
              {isEditing ? (
                <Textarea
                  value={editedData.industry_regulations || ''}
                  onChange={(e) => handleInputChange('industry_regulations', e.target.value)}
                  placeholder="e.g., FINRA for finance, FDA for pharma/food"
                  rows={2}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md min-h-[60px]">
                  {editedData.industry_regulations || 'No industry regulations specified'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold mb-4">Audit Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Audit Type</Label>
              {isEditing ? (
                <Select value={editedData.audit_type || ''} onValueChange={(value) => handleInputChange('audit_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedData.audit_type || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>External Auditing Firm</Label>
              {isEditing ? (
                <Input
                  value={editedData.external_auditing_firm || ''}
                  onChange={(e) => handleInputChange('external_auditing_firm', e.target.value)}
                  placeholder="E.g., Deloitte, PwC, EY, KPMG"
                />
              ) : (
                <Input value={editedData.external_auditing_firm || ''} readOnly className="bg-gray-50" />
              )}
            </div>

            <div>
              <Label>Last Internal Audit Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={editedData.last_internal_audit || ''}
                  onChange={(e) => handleInputChange('last_internal_audit', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label>Last External Audit Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={editedData.last_external_audit || ''}
                  onChange={(e) => handleInputChange('last_external_audit', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label>Next Audit Due Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={editedData.next_audit_due || ''}
                  onChange={(e) => handleInputChange('next_audit_due', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label>Audit Reports Available?</Label>
              {isEditing ? (
                <Select value={editedData.audit_reports_available || ''} onValueChange={(value) => handleInputChange('audit_reports_available', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={editedData.audit_reports_available || ''} readOnly className="bg-gray-50" />
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <Label>Audit Result Summary</Label>
              {isEditing ? (
                <Textarea
                  value={editedData.audit_result_summary || ''}
                  onChange={(e) => handleInputChange('audit_result_summary', e.target.value)}
                  placeholder="Short summary of findings"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                  {editedData.audit_result_summary || 'No audit result summary provided'}
                </div>
              )}
            </div>

            <div>
              <Label>Corrective Actions Implemented</Label>
              {isEditing ? (
                <Textarea
                  value={editedData.corrective_actions || ''}
                  onChange={(e) => handleInputChange('corrective_actions', e.target.value)}
                  placeholder="Description or uploaded report"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                  {editedData.corrective_actions || 'No corrective actions documented'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Certifications</h3>
          <div>
            <Label>Certifications</Label>
            {isEditing ? (
              <Textarea
                value={editedData.certifications || ''}
                onChange={(e) => handleInputChange('certifications', e.target.value)}
                rows={4}
                placeholder="List all relevant certifications"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
                {editedData.certifications || 'No certifications provided'}
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
              {isLoading ? 'Saving...' : 'Save Compliance Information'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorComplianceSection;
