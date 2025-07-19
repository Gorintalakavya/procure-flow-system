
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Upload, Save, Trash2 } from "lucide-react";
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

interface VerificationDocs {
  ein_verification_letter?: string;
  articles_of_incorporation?: string;
  business_licenses?: string;
  w9_form?: string;
  w9_ein?: string;
  irs_tax_compliance_cert?: string;
  sec_filings?: string;
  osha_epa_labor_compliance?: string;
  fcpa_hipaa_compliance?: string;
}

const VendorDocumentsSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [verificationDocs, setVerificationDocs] = useState<VerificationDocs>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchVerificationDocuments();
  }, [vendor.vendor_id]);

  const fetchVerificationDocuments = async () => {
    try {
      const { data: docs, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('vendor_id', vendor.vendor_id)
        .single();

      if (!error && docs) {
        setVerificationDocs(docs);
      }
    } catch (error) {
      console.error('Error fetching verification documents:', error);
    }
  };

  const handleDocumentUpload = async (field: keyof VerificationDocs, file: File) => {
    if (!vendor) return;

    try {
      const updatedDocs = {
        ...verificationDocs,
        [field]: file.name
      };

      setVerificationDocs(updatedDocs);
      setHasChanges(true);
      toast.success('Document selected for upload');
    } catch (error) {
      console.error('Error selecting document:', error);
      toast.error('Failed to select document');
    }
  };

  const handleDocumentDelete = async (field: keyof VerificationDocs) => {
    try {
      const updatedDocs = {
        ...verificationDocs,
        [field]: null
      };

      setVerificationDocs(updatedDocs);
      setHasChanges(true);
      toast.success('Document removed');
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  const handleSaveDocuments = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('verification_documents')
        .upsert({
          vendor_id: vendor.vendor_id,
          ...verificationDocs
        });

      if (error) throw error;

      setHasChanges(false);
      toast.success('Verification documents saved successfully');
    } catch (error) {
      console.error('Error saving verification documents:', error);
      toast.error('Failed to save verification documents');
    } finally {
      setIsLoading(false);
    }
  };

  const documentFields = [
    { key: 'ein_verification_letter', label: 'EIN Verification Letter (Form SS-4)' },
    { key: 'articles_of_incorporation', label: 'Articles of Incorporation' },
    { key: 'business_licenses', label: 'Business Licenses or State Registration' },
    { key: 'w9_form', label: 'W-9 Form Upload' },
    { key: 'w9_ein', label: 'W-9 / EIN' },
    { key: 'irs_tax_compliance_cert', label: 'IRS Tax Compliance Cert.' },
    { key: 'sec_filings', label: 'SEC Filings (if public)' },
    { key: 'osha_epa_labor_compliance', label: 'OSHA / EPA / Labor Compliance' },
    { key: 'fcpa_hipaa_compliance', label: 'FCPA / HIPAA Compliance' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Verification Documents
            </CardTitle>
            <p className="text-sm text-gray-600">Upload required verification documents</p>
          </div>
          {hasChanges && (
            <Button onClick={handleSaveDocuments} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Documents'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentFields.map((field) => (
            <div key={field.key} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <Label>{field.label}</Label>
                <div className="flex items-center gap-2">
                  {verificationDocs[field.key as keyof VerificationDocs] ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  {verificationDocs[field.key as keyof VerificationDocs] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDocumentDelete(field.key as keyof VerificationDocs)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {verificationDocs[field.key as keyof VerificationDocs] ? (
                <p className="text-sm text-gray-600 mb-2">{verificationDocs[field.key as keyof VerificationDocs]}</p>
              ) : (
                <p className="text-sm text-gray-500 mb-2">No document uploaded</p>
              )}
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDocumentUpload(field.key as keyof VerificationDocs, file);
                }}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG accepted</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Document Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All documents must be clear and legible</li>
            <li>• Accepted formats: PDF, JPG, PNG</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Documents will be reviewed within 2-3 business days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorDocumentsSection;
