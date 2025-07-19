
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, Trash2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface DocumentData {
  w9_form?: string;
  ein_verification_letter?: string;
  articles_of_incorporation?: string;
  business_licenses?: string;
  irs_tax_compliance_cert?: string;
  sec_filings?: string;
  osha_epa_labor_compliance?: string;
  fcpa_hipaa_compliance?: string;
}

interface UploadedDocument {
  id: string;
  document_name: string;
  document_type: string;
  file_path?: string;
  upload_date: string;
  file_size?: number;
  document_url?: string;
}

const VendorDocumentsSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<DocumentData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});

  const documentFields = [
    { key: 'w9_form', label: 'W-9 / EIN Form', accept: '.pdf,.doc,.docx' },
    { key: 'ein_verification_letter', label: 'EIN Verification Letter', accept: '.pdf,.doc,.docx' },
    { key: 'articles_of_incorporation', label: 'Articles of Incorporation', accept: '.pdf,.doc,.docx' },
    { key: 'business_licenses', label: 'Business Licenses', accept: '.pdf,.doc,.docx' },
    { key: 'irs_tax_compliance_cert', label: 'IRS Tax Compliance Cert.', accept: '.pdf,.doc,.docx' },
    { key: 'sec_filings', label: 'SEC Filings (if public)', accept: '.pdf,.doc,.docx' },
    { key: 'osha_epa_labor_compliance', label: 'OSHA / EPA / Labor Compliance', accept: '.pdf,.doc,.docx' },
    { key: 'fcpa_hipaa_compliance', label: 'FCPA / HIPAA Compliance', accept: '.pdf,.doc,.docx' }
  ];

  useEffect(() => {
    fetchDocumentData();
    fetchUploadedDocuments();
  }, [vendor.vendor_id]);

  const fetchDocumentData = async () => {
    try {
      const { data: documents, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('vendor_id', vendor.vendor_id)
        .single();

      if (!error && documents) {
        setEditedData({
          w9_form: documents.w9_form || '',
          ein_verification_letter: documents.ein_verification_letter || '',
          articles_of_incorporation: documents.articles_of_incorporation || '',
          business_licenses: documents.business_licenses || '',
          irs_tax_compliance_cert: documents.irs_tax_compliance_cert || '',
          sec_filings: documents.sec_filings || '',
          osha_epa_labor_compliance: documents.osha_epa_labor_compliance || '',
          fcpa_hipaa_compliance: documents.fcpa_hipaa_compliance || ''
        });
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    }
  };

  const fetchUploadedDocuments = async () => {
    try {
      const { data: documents, error } = await supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', vendor.vendor_id)
        .order('upload_date', { ascending: false });

      if (!error && documents) {
        setUploadedDocuments(documents);
      }
    } catch (error) {
      console.error('Error fetching uploaded documents:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('verification_documents')
        .upsert({
          vendor_id: vendor.vendor_id,
          ...editedData
        });

      if (error) throw error;

      setIsEditing(false);
      toast.success('Document information saved successfully');
    } catch (error) {
      console.error('Error saving document information:', error);
      toast.error('Failed to save document information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchDocumentData();
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof DocumentData, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [documentType]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendor.vendor_id}/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('vendor_documents')
        .insert({
          vendor_id: vendor.vendor_id,
          document_name: file.name,
          document_type: documentType,
          document_category: 'verification',
          file_path: fileName,
          document_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: 'vendor'
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      fetchUploadedDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('vendor-documents')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('vendor_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      fetchUploadedDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (documentUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Verification Documents</CardTitle>
            <p className="text-sm text-gray-600">Upload and manage verification documents</p>
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
        {/* Document Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Document Upload</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept={field.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, field.key);
                      }
                    }}
                    disabled={uploadingFiles[field.key]}
                    className="flex-1"
                  />
                  {uploadingFiles[field.key] && (
                    <div className="text-sm text-gray-500">Uploading...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Documents Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Documents</h3>
          {uploadedDocuments.length > 0 ? (
            <div className="space-y-2">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.document_type} • {new Date(doc.upload_date).toLocaleDateString()} • {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.document_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.document_url!, doc.document_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{doc.document_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDocument(doc.id, doc.file_path || '')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
          )}
        </div>

        {/* Document Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Document Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentFields.map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                {isEditing ? (
                  <Input
                    value={editedData[field.key as keyof DocumentData] || ''}
                    onChange={(e) => handleInputChange(field.key as keyof DocumentData, e.target.value)}
                    placeholder={`Enter ${field.label} link or reference`}
                  />
                ) : (
                  <Input 
                    value={editedData[field.key as keyof DocumentData] || ''} 
                    readOnly 
                    className="bg-gray-50" 
                  />
                )}
              </div>
            ))}
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
              {isLoading ? 'Saving...' : 'Save Documents'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorDocumentsSection;
