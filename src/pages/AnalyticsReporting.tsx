
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportData {
  vendor_id: string;
  compliance_rate: number | null;
  performance_score: number | null;
  risk_level: string | null;
  report_data: any;
  generated_date: string;
}

interface VendorStatusData {
  name: string;
  value: number;
  color: string;
}

const AnalyticsReporting = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('compliance');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [vendors, setVendors] = useState<{ vendor_id: string; legal_entity_name: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for vendor registration status
  const vendorStatusData: VendorStatusData[] = [
    { name: 'Completed', value: 45, color: '#22c55e' },
    { name: 'In Progress', value: 30, color: '#f97316' },
    { name: 'Pending', value: 20, color: '#ef4444' },
    { name: 'Incomplete', value: 15, color: '#6b7280' }
  ];

  // Mock data for performance trends
  const performanceTrendData = [
    { month: 'Jan', compliance: 85, performance: 78, risk: 12 },
    { month: 'Feb', compliance: 88, performance: 82, risk: 10 },
    { month: 'Mar', compliance: 92, performance: 85, risk: 8 },
    { month: 'Apr', compliance: 89, performance: 80, risk: 11 },
    { month: 'May', compliance: 94, performance: 88, risk: 6 },
    { month: 'Jun', compliance: 96, performance: 90, risk: 4 }
  ];

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedVendor, dateRange, searchTerm]);

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

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('generated_date', dateRange.from.toISOString())
          .lte('generated_date', dateRange.to.toISOString());
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

  const exportData = () => {
    const csvContent = reportData.map(row => 
      `${getVendorName(row.vendor_id)},${row.compliance_rate || 0},${row.performance_score || 0},${row.risk_level || 'N/A'}`
    ).join('\n');
    
    const blob = new Blob([`Vendor,Compliance Rate,Performance Score,Risk Level\n${csvContent}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
          {payload[0].payload && (
            <p className="text-sm text-gray-600">
              Vendor: {getVendorName(payload[0].payload.vendor_id)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Advanced Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

              <div>
                <Label htmlFor="search">Search Vendors</Label>
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={exportData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading analytics data...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Chart 1: Vendor Registration Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Registration Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={vendorStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={160}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {vendorStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: string) => [value, name]}
                          labelFormatter={(label) => `Status: ${label}`}
                        />
                        <Legend 
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Chart 2: Performance Trends Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={performanceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="compliance" 
                          stroke="#22c55e" 
                          strokeWidth={3}
                          name="Compliance %"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="performance" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Performance Score"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="risk" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          name="Risk Level"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Chart 3: Compliance/Performance Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {reportType === 'compliance' && 'Vendor Compliance Rates'}
                      {reportType === 'performance' && 'Vendor Performance Scores'}
                      {reportType === 'risk' && 'Vendor Risk Assessment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-600">No data available for the selected criteria.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        {reportType === 'risk' ? (
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
                                <Cell key={`cell-${index}`} fill={vendorStatusData[index % vendorStatusData.length]?.color || '#8884d8'} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        ) : (
                          <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="vendor_id" 
                              tickFormatter={vendorId => getVendorName(vendorId)} 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis domain={reportType === 'compliance' ? [0, 100] : [0, 'dataMax']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {reportType === 'compliance' && (
                              <Bar 
                                dataKey="compliance_rate" 
                                fill="#22c55e" 
                                name="Compliance Rate (%)" 
                              />
                            )}
                            {reportType === 'performance' && (
                              <Bar 
                                dataKey="performance_score" 
                                fill="#3b82f6" 
                                name="Performance Score" 
                              />
                            )}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-green-600">
                        {vendorStatusData.find(d => d.name === 'Completed')?.value || 0}
                      </div>
                      <p className="text-sm text-gray-600">Completed Registrations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-orange-600">
                        {vendorStatusData.find(d => d.name === 'In Progress')?.value || 0}
                      </div>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-red-600">
                        {vendorStatusData.find(d => d.name === 'Pending')?.value || 0}
                      </div>
                      <p className="text-sm text-gray-600">Pending Reviews</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-gray-600">
                        {vendors.length}
                      </div>
                      <p className="text-sm text-gray-600">Total Vendors</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReporting;
