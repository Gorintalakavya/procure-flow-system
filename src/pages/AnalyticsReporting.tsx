import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportData {
  vendor_id: string;
  compliance_rate: number | null;
  performance_score: number | null;
  risk_level: string | null;
  report_data: any;
  generated_date: string;
}

const AnalyticsReporting = () => {
  const [reportType, setReportType] = useState('compliance');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [vendors, setVendors] = useState<{ vendor_id: string; legal_entity_name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedVendor]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendor_id, legal_entity_name')
        .order('legal_entity_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('analytics_reports')
        .select('*')
        .eq('report_type', reportType);

      if (selectedVendor !== 'all') {
        query = query.eq('vendor_id', selectedVendor);
      }

      const { data, error } = await query.order('generated_date', { ascending: false });

      if (error) throw error;
      setReportData(data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.vendor_id === vendorId);
    return vendor ? vendor.legal_entity_name : 'Unknown Vendor';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#d88488'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Vendor Analytics & Reporting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="risk">Risk Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor-filter">Vendor Filter</Label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                        {vendor.legal_entity_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading report data...</p>
              </div>
            ) : (
              <div className="mt-8">
                {reportData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No data available for the selected criteria.</p>
                  </div>
                ) : (
                  <>
                    {reportType === 'compliance' && (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="vendor_id" tickFormatter={vendorId => getVendorName(vendorId)} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="compliance_rate" fill="#82ca9d" name="Compliance Rate" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {reportType === 'performance' && (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="vendor_id" tickFormatter={vendorId => getVendorName(vendorId)} />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="performance_score" fill="#FFBB28" name="Performance Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {reportType === 'risk' && (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={reportData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={160}
                            fill="#8884d8"
                            dataKey="compliance_rate"
                          >
                            {reportData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReporting;
