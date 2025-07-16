
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, FileText, Upload, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import VendorProfileEditor from "@/components/VendorProfileEditor";

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

interface VerificationDocs {
  ein_verification_letter?: string;
  articles_of_incorporation?: string;
  business_licenses?: string;
  w9_form?: string;
}

const VendorProfile = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [verificationDocs, setVerificationDocs] = useState<VerificationDocs>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const vendorUser = localStorage.getItem('vendorUser');
      if (!vendorUser) {
        toast.error('No vendor data found');
        navigate('/vendor-auth');
        return;
      }

      const { vendorId } = JSON.parse(vendorUser);

      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (vendorError) throw vendorError;

      setVendorData(vendor);

      // Fetch verification documents
      const { data: docs, error: docsError } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('vendor_id', vendorId)
        .single();

      if (!docsError && docs) {
        setVerificationDocs(docs);
      }

    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendorUpdate = (updatedVendor: VendorData) => {
    setVendorData(updatedVendor);
  };

  const handleDocumentUpload = async (field: keyof VerificationDocs, file: File) => {
    if (!vendorData) return;

    try {
      const updatedDocs = {
        ...verificationDocs,
        [field]: file.name
      };

      const { error } = await supabase
        .from('verification_documents')
        .upsert({
          vendor_id: vendorData.vendor_id,
          ...updatedDocs
        });

      if (error) throw error;

      setVerificationDocs(updatedDocs);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'incomplete':
        return <Badge variant="outline">Incomplete</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading vendor profile...</div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Vendor Not Found</h2>
          <Button onClick={() => navigate('/vendor-auth')}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(vendorData.registration_status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VendorProfileEditor 
          vendor={vendorData} 
          onUpdate={handleVendorUpdate} 
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact & Location</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="documents">Verification Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Legal Entity Name</Label>
                    <p className="text-lg font-medium">{vendorData.legal_entity_name}</p>
                  </div>
                  
                  {vendorData.trade_name && (
                    <div>
                      <Label>Trade Name (DBA)</Label>
                      <p>{vendorData.trade_name}</p>
                    </div>
                  )}

                  <div>
                    <Label>Vendor ID</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{vendorData.vendor_id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company Type</Label>
                      <p className="capitalize">{vendorData.vendor_type}</p>
                    </div>
                    <div>
                      <Label>Registration Status</Label>
                      <div className="mt-1">{getStatusBadge(vendorData.registration_status)}</div>
                    </div>
                  </div>

                  {vendorData.business_description && (
                    <div>
                      <Label>About the Company</Label>
                      <p className="text-gray-700">{vendorData.business_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vendorData.year_established && (
                    <div>
                      <Label>Year Established</Label>
                      <p>{vendorData.year_established}</p>
                    </div>
                  )}
                  
                  {vendorData.employee_count && (
                    <div>
                      <Label>Employee Count</Label>
                      <p>{vendorData.employee_count}</p>
                    </div>
                  )}

                  {vendorData.annual_revenue && (
                    <div>
                      <Label>Annual Revenue</Label>
                      <p>{vendorData.annual_revenue}</p>
                    </div>
                  )}

                  {vendorData.operating_status && (
                    <div>
                      <Label>Operating Status</Label>
                      <Badge variant="outline" className="capitalize">
                        {vendorData.operating_status}
                      </Badge>
                    </div>
                  )}

                  {vendorData.stock_symbol && (
                    <div>
                      <Label>Stock Symbol</Label>
                      <p className="font-mono">{vendorData.stock_symbol}</p>
                    </div>
                  )}

                  {vendorData.duns_number && (
                    <div>
                      <Label>D-U-N-S Number</Label>
                      <p className="font-mono">{vendorData.duns_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Location Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Contact Details</h4>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label>Email Address</Label>
                        <p>{vendorData.email}</p>
                      </div>
                    </div>

                    {vendorData.phone_number && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label>Phone Number</Label>
                          <p>{vendorData.phone_number}</p>
                        </div>
                      </div>
                    )}

                    {vendorData.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label>Website</Label>
                          <a 
                            href={vendorData.website.startsWith('http') ? vendorData.website : `https://${vendorData.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {vendorData.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-lg">Address</h4>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <Label>Location</Label>
                        <div className="space-y-1">
                          {vendorData.street_address && <p>{vendorData.street_address}</p>}
                          {vendorData.street_address_line2 && <p>{vendorData.street_address_line2}</p>}
                          <p>{vendorData.city}, {vendorData.state} {vendorData.postal_code}</p>
                          <p className="text-sm text-gray-600">{vendorData.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Industry/Company Type</Label>
                      <Badge variant="outline" className="capitalize">
                        {vendorData.vendor_type}
                      </Badge>
                    </div>

                    {vendorData.employee_count && (
                      <div>
                        <Label>Employee Count</Label>
                        <p>{vendorData.employee_count}</p>
                      </div>
                    )}

                    {vendorData.annual_revenue && (
                      <div>
                        <Label>Annual Revenue</Label>
                        <p>{vendorData.annual_revenue}</p>
                      </div>
                    )}

                    {vendorData.tax_id && (
                      <div>
                        <Label>Tax ID</Label>
                        <p className="font-mono">{vendorData.tax_id}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {vendorData.year_established && (
                      <div>
                        <Label>Year Established</Label>
                        <p>{vendorData.year_established}</p>
                      </div>
                    )}

                    {vendorData.operating_status && (
                      <div>
                        <Label>Operating Status</Label>
                        <Badge variant="outline" className="capitalize">
                          {vendorData.operating_status}
                        </Badge>
                      </div>
                    )}

                    {vendorData.currency && (
                      <div>
                        <Label>Currency</Label>
                        <p>{vendorData.currency}</p>
                      </div>
                    )}
                  </div>
                </div>

                {vendorData.business_description && (
                  <div className="mt-6">
                    <Label>Business Description</Label>
                    <p className="mt-2 text-gray-700 leading-relaxed">
                      {vendorData.business_description}
                    </p>
                  </div>
                )}

                {vendorData.products_services_description && (
                  <div className="mt-6">
                    <Label>Products/Services Description</Label>
                    <p className="mt-2 text-gray-700 leading-relaxed">
                      {vendorData.products_services_description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>EIN Verification Letter (Form SS-4)</Label>
                        {verificationDocs.ein_verification_letter ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {verificationDocs.ein_verification_letter ? (
                        <p className="text-sm text-gray-600">{verificationDocs.ein_verification_letter}</p>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload('ein_verification_letter', file);
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG accepted</p>
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Articles of Incorporation</Label>
                        {verificationDocs.articles_of_incorporation ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {verificationDocs.articles_of_incorporation ? (
                        <p className="text-sm text-gray-600">{verificationDocs.articles_of_incorporation}</p>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload('articles_of_incorporation', file);
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG accepted</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Business Licenses or State Registration</Label>
                        {verificationDocs.business_licenses ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {verificationDocs.business_licenses ? (
                        <p className="text-sm text-gray-600">{verificationDocs.business_licenses}</p>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload('business_licenses', file);
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG accepted</p>
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>W-9 Form Upload</Label>
                        {verificationDocs.w9_form ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {verificationDocs.w9_form ? (
                        <p className="text-sm text-gray-600">{verificationDocs.w9_form}</p>
                      ) : (
                        <div>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload('w9_form', file);
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG accepted</p>
                        </div>
                      )}
                    </div>
                  </div>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProfile;
