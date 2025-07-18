
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, FileText, Download, Trash2, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VendorData {
  vendor_id: string;
  legal_entity_name: string;
  email: string;
}

interface VendorDocumentsSectionProps {
  vendor: VendorData;
  onUpdate: (vendor: VendorData) => void;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  document_category: string;
  file_path: string | null;
  file_size: number | null;
  upload_date: string;
  status: string;
  expiry_date: string | null;
  mime_type: string | null;
}

const VendorDocumentsSection: React.FC<VendorDocumentsSectionProps> = ({ vendor, onUpdate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [vendor.vendor_id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_documents')
        .select('*')
        .eq('vendor_id', vendor.vendor_id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      
      // Delete file from storage if it exists
      if (document?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('vendor-documents')
          .remove([document.file_path]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete document record from database
      const { error } = await supabase
        .from('vendor_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document deleted successfully');
      fetchDocuments();
      setDeleteDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      if (!document.file_path) {
        toast.error('File path not found');
        return;
      }

      const { data, error } = await supabase.storage
        .from('vendor-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.document_name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vendor.vendor_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('vendor_documents')
        .insert({
          vendor_id: vendor.vendor_id,
          document_name: file.name,
          document_type: fileExt || 'unknown',
          document_category: 'general',
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: 'vendor',
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      fetchDocuments();
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileText className="h-4 w-4" />;
    
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-600" />;
    if (mimeType.includes('image')) return <Eye className="h-4 w-4 text-blue-600" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-4 w-4 text-blue-600" />;
    
    return <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Verification Documents</h3>
          <p className="text-sm text-gray-600">Upload and manage required verification documents</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
          {showUpload && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </label>
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h4>
            <p className="text-gray-600 text-center mb-4">
              Upload your verification documents to complete your vendor profile
            </p>
            <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(document.mime_type)}
                    <div>
                      <h4 className="font-medium">{document.document_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="capitalize">{document.document_category}</span>
                        <span>•</span>
                        <span>{document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
                        <span>•</span>
                        <span>{new Date(document.upload_date).toLocaleDateString()}</span>
                      </div>
                      {document.expiry_date && (
                        <div className="flex items-center gap-1 text-sm">
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                          <span className="text-orange-600">
                            Expires: {new Date(document.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(document.status)}
                    <div className="flex gap-1">
                      {document.file_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDocument(document)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDocument} onOpenChange={() => setDeleteDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDocument?.document_name}"? 
              This action cannot be undone and the file will be permanently removed from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDocument && handleDeleteDocument(deleteDocument.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorDocumentsSection;
