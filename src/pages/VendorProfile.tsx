
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import VendorOverviewSection from "@/components/VendorOverviewSection";
import VendorFinancialSection from "@/components/VendorFinancialSection";
import VendorProcurementSection from "@/components/VendorProcurementSection";
import VendorComplianceSection from "@/components/VendorComplianceSection";
import VendorDocumentsSection from "@/components/VendorDocumentsSection";

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

const VendorProfile = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial Information</TabsTrigger>
            <TabsTrigger value="procurement">Procurement Information</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Audit</TabsTrigger>
            <TabsTrigger value="documents">Verification Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <VendorOverviewSection 
              vendor={vendorData} 
              onUpdate={handleVendorUpdate} 
            />
          </TabsContent>

          <TabsContent value="financial">
            <VendorFinancialSection 
              vendor={vendorData} 
              onUpdate={handleVendorUpdate} 
            />
          </TabsContent>

          <TabsContent value="procurement">
            <VendorProcurementSection 
              vendor={vendorData} 
              onUpdate={handleVendorUpdate} 
            />
          </TabsContent>

          <TabsContent value="compliance">
            <VendorComplianceSection 
              vendor={vendorData} 
              onUpdate={handleVendorUpdate} 
            />
          </TabsContent>

          <TabsContent value="documents">
            <VendorDocumentsSection 
              vendor={vendorData} 
              onUpdate={handleVendorUpdate} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProfile;
