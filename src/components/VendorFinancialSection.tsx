
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SectionShareDialog from "./SectionShareDialog";

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

const VendorFinancialSection: React.FC<Props> = ({ vendor, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setEditedData({
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_type: '',
      swift_code: '',
      reconciliation_account: '',
      revenue: vendor.annual_revenue || '',
      sales_growth: '',
      net_income_growth: '',
      assets: '',
      fiscal_year_end: '',
      stock_exchange: vendor.stock_symbol || '',
      esg_ranking: '',
      esg_industry_average: ''
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
          annual_revenue: editedData.revenue,
          stock_symbol: editedData.stock_exchange
        })
        .eq('vendor_id', vendor.vendor_id);

      if (error) throw error;

      // Update or insert vendor profile
      const { error: profileError } = await supabase
        .from('vendor_profiles')
        .upsert({
          vendor_id: vendor.vendor_id,
          bank_name: editedData.bank_name,
          account_number: editedData.account_number,
          routing_number: editedData.routing_number,
          account_type: editedData.account_type,
          swift_code: editedData.swift_code,
          reconciliation_account: editedData.reconciliation_account,
          revenue: editedData.revenue,
          sales_growth: editedData.sales_growth,
          net_income_growth: editedData.net_income_growth,
          assets: editedData.assets,
          fiscal_year_end: editedData.fiscal_year_end,
          stock_exchange: editedData.stock_exchange,
          esg_ranking: editedData.esg_ranking,
          esg_industry_average: editedData.esg_industry_average
        });

      if (profileError) throw profileError;

      const updatedVendor = { 
        ...vendor, 
        annual_revenue: editedData.revenue,
        stock_symbol: editedData.stock_exchange
      };
      onUpdate(updatedVendor);
      setIsEditing(false);
      toast.success('Financial information saved successfully');
    } catch (error) {
      console.error('Error saving financial information:', error);
      toast.error('Failed to save financial information');
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
            <CardTitle>Financial Information</CardTitle>
            <p className="text-sm text-gray-600">Banking details and financial metrics</p>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              <SectionShareDialog
                sectionName="Financial Information"
                sectionData={editedData}
                vendorName={vendor.legal_entity_name}
                vendorId={vendor.vendor_id}
              />
              <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Bank Name</Label>
            <Input 
              value={isEditing ? editedData.bank_name || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, bank_name: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter bank name"
            />
          </div>
          
          <div>
            <Label>Account Number</Label>
            <Input 
              value={isEditing ? editedData.account_number || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, account_number: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter account number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Routing Number</Label>
            <Input 
              value={isEditing ? editedData.routing_number || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, routing_number: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter routing number"
            />
          </div>
          
          <div>
            <Label>Account Type</Label>
            {isEditing ? (
              <Select value={editedData.account_type || ''} onValueChange={(value) => setEditedData(prev => ({ ...prev, account_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value="" readOnly className="bg-gray-50" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>SWIFT Code</Label>
            <Input 
              value={isEditing ? editedData.swift_code || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, swift_code: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter SWIFT code"
            />
          </div>
          
          <div>
            <Label>Reconciliation Account</Label>
            <Input 
              value={isEditing ? editedData.reconciliation_account || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, reconciliation_account: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter reconciliation account"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Revenue</Label>
            <Input 
              value={isEditing ? editedData.revenue || '' : vendor.annual_revenue || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, revenue: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter revenue"
            />
          </div>
          
          <div>
            <Label>Sales Growth</Label>
            <Input 
              value={isEditing ? editedData.sales_growth || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, sales_growth: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter sales growth"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Net Income Growth</Label>
            <Input 
              value={isEditing ? editedData.net_income_growth || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, net_income_growth: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter net income growth"
            />
          </div>
          
          <div>
            <Label>Assets</Label>
            <Input 
              value={isEditing ? editedData.assets || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, assets: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter assets"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Fiscal Year End</Label>
            <Input 
              value={isEditing ? editedData.fiscal_year_end || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, fiscal_year_end: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter fiscal year end"
            />
          </div>
          
          <div>
            <Label>Stock Exchange</Label>
            <Input 
              value={isEditing ? editedData.stock_exchange || '' : vendor.stock_symbol || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, stock_exchange: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter stock exchange"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>ESG Ranking</Label>
            <Input 
              value={isEditing ? editedData.esg_ranking || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, esg_ranking: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter ESG ranking"
            />
          </div>
          
          <div>
            <Label>ESG Industry Average</Label>
            <Input 
              value={isEditing ? editedData.esg_industry_average || '' : ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, esg_industry_average: e.target.value }))}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-50" : ""}
              placeholder="Enter ESG industry average"
            />
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
              {isLoading ? 'Saving...' : 'Save Financial Information'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorFinancialSection;
