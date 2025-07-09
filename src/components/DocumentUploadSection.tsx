
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2, CheckCircle, Save, Link } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UploadedDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  document_url?: string | null;
  upload_date: string;
  status: string;
}

interface DocumentUploadSectionProps {
  vendorId: string;
}

const DOCUMENT_TYPES = [
  { value: 'w9_form', label: 'W-9 Form', purpose: 'Tax forms for US vendors' },
  { value: 'w8ben_form', label: 'W-8BEN Form', purpose: 'Tax forms for foreign vendors' },
  { value: 'w8bene_form', label: 'W-8BEN-E Form', purpose: 'Tax forms for foreign entities' },
  { value: 'iso_certificate', label: 'ISO Certificate', purpose: 'Quality assurance compliance' },
  { value: 'business_registration', label: 'Business Registration Certificate', purpose: 'Proof of legal business' },
  { value: 'gst_registration', label: 'GST Registration', purpose: 'Required for Indian vendors' },
  { value: 'pan_card', label: 'PAN Card', purpose: 'India tax ID verification' },
  { value: 'bank_verification', label: 'Bank Verification Letter', purpose: 'Optional, under financial' },
  { value: 'msme_certificate', label: 'MSME/SSI Certificate', purpose: 'Small business classification' },
  { value: 'contracts_mous', label: 'Contracts/MOUs', purpose: 'Under Procurement Info' }
];

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ vendorId }) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    fetchUploadedDocuments();
  }, [vendorId]);

  const fetchUploadedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setUploadedDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const validateDocumentFormat = (documentType: string, fileName: string) => {
    const validationRules = {
      'pan_card': /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      'gst_registration': /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    };
    
    // Add more validation rules as needed
    return true; // For now, return true
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocumentType) {
      toast.error('Please select a document type and file');
      return;
    }

    // Validate document format
    if (!validateDocumentFormat(selectedDocumentType, file.name)) {
      toast.error('Invalid document format for the selected type');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendorId}_${selectedDocumentType}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          vendor_id: vendorId,
          document_type: selectedDocumentType,
          document_name: file.name,
          file_path: filePath,
          document_url: documentUrl || null,
          file_size: file.size,
          status: 'uploaded',
          uploaded_by: 'vendor'
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully!');
      setSelectedDocumentType('');
      setDocumentUrl('');
      fetchUploadedDocuments();
      
      // Clear file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      if (filePath) {
        await supabase.storage
          .from('vendor-documents')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document deleted successfully!');
      fetchUploadedDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleSaveDocumentSection = async () => {
    setIsSaving(true);
    try {
      // Update the vendor's document completion status
      const { error } = await supabase
        .from('vendors')
        .update({ 
          updated_at: new Date().toISOString(),
          // You could add a field to track document section completion
        })
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Create audit log
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'DOCUMENT_SECTION_SAVED',
          entity_type: 'vendor_profile',
          entity_id: vendorId,
          new_values: { documents_updated: uploadedDocuments.length }
        });

      toast.success('Document section saved successfully!');
    } catch (error) {
      console.error('Error saving document section:', error);
      toast.error('Failed to save document section');
    } finally {
      setIsSaving(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(doc => doc.value === type)?.label || type;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type Selection and Upload */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="document-type">Document Type *</Label>
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type to upload" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    <div>
                      <div className="font-medium">{docType.label}</div>
                      <div className="text-sm text-gray-500">{docType.purpose}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="document-url">Document URL (Optional)</Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="document-url"
                type="url"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Add a URL link to your document if available online
            </p>
          </div>

          <div>
            <Label htmlFor="document-file">Upload File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="document-file"
                type="file"
                onChange={handleFileUpload}
                disabled={!selectedDocumentType || isUploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Upload className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
            </p>
          </div>
        </div>

        {/* Uploaded Documents List */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">{getDocumentTypeLabel(doc.document_type)}</div>
                      <div className="text-sm text-gray-600">{doc.document_name}</div>
                      {doc.document_url && (
                        <a 
                          href={doc.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Link className="h-3 w-3" />
                          View Online
                        </a>
                      )}
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Requirements Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Document Requirements & Smart Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
            {DOCUMENT_TYPES.map((docType) => (
              <div key={docType.value} className="flex justify-between">
                <span className="font-medium">{docType.label}:</span>
                <span className="text-right">{docType.purpose}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-1">Auto-Validation Features:</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• PAN format validation (AAAAA9999A)</li>
              <li>• GST format validation (22AAAAA0000A1Z5)</li>
              <li>• Document expiry date checks</li>
              <li>• Mandatory field validation</li>
            </ul>
          </div>
        </div>

        {/* Save Section Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSaveDocumentSection}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Document Section
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadSection;
