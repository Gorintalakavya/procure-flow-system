
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [vendorId, setVendorId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorsLoaded, setVendorsLoaded] = useState(false);

  React.useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select('vendor_id, legal_entity_name, email')
        .order('legal_entity_name');
      
      setVendors(vendorsData || []);
      setVendorsLoaded(true);
    } catch (error) {
      console.error('❌ Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, Word, Image, and Text files are allowed');
        return;
      }
      
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !vendorId || !documentType || !documentName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendorId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          document_name: documentName,
          document_type: documentType,
          vendor_id: vendorId,
          file_path: uploadData.path,
          file_size: file.size,
          uploaded_by: 'admin',
          status: 'active',
          tags: [documentType],
          metadata: {
            original_name: file.name,
            mime_type: file.type,
            upload_source: 'admin_dashboard'
          }
        });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw dbError;
      }

      // Log the upload action
      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'UPLOAD',
          entity_type: 'document',
          entity_id: documentName,
          new_values: {
            document_name: documentName,
            document_type: documentType,
            file_size: file.size
          },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      // Send notification
      await supabase
        .from('notifications')
        .insert({
          title: 'Document Uploaded',
          message: `Document "${documentName}" has been uploaded for vendor ${vendorId}`,
          notification_type: 'document_upload',
          priority: 'medium',
          vendor_id: vendorId
        });

      toast.success('Document uploaded successfully!');
      
      // Reset form
      setFile(null);
      setVendorId('');
      setDocumentType('');
      setDocumentName('');
      
      // Refresh parent component
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setDocumentName('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendor-select">Select Vendor *</Label>
              <Select value={vendorId} onValueChange={setVendorId} required>
                <SelectTrigger>
                  <SelectValue placeholder={vendorsLoaded ? "Choose a vendor" : "Loading vendors..."} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.legal_entity_name} ({vendor.vendor_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document-type">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="po">Purchase Order</SelectItem>
                  <SelectItem value="compliance">Compliance Document</SelectItem>
                  <SelectItem value="tax_form">Tax Form</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="document-name">Document Name *</Label>
            <Input
              id="document-name"
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              required
            />
          </div>

          <div>
            <Label htmlFor="file-upload">Choose File *</Label>
            <div className="mt-2">
              {!file ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to select a file or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, DOC, DOCX, JPG, PNG, TXT (max 10MB)</p>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFile(null);
                setVendorId('');
                setDocumentType('');
                setDocumentName('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !file || !vendorId || !documentType || !documentName}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
