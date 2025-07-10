
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, Filter, AlertCircle } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ vendor_id: string; legal_entity_name: string; }[]>([]);
  const [noSearchResults, setNoSearchResults] = useState(false);

  // Enhanced vendor registration status data
  const vendorStatusData: VendorStatusData[] = [
    { name: 'Approved', value: 65, color: '#22c55e' },
    { name: 'Pending', value: 25, color: '#f97316' },
    { name: 'Under Review', value: 18, color: '#3b82f6' },
    { name: 'Rejected', value: 8, color: '#ef4444' }
  ];

  // Full year performance trends data
  const performanceTrendData = [
    { month: 'Jan', compliance: 85, performance: 78, risk: 12 },
    { month: 'Feb', compliance: 88, performance: 82, risk: 10 },
    { month: 'Mar', compliance: 92, performance: 85, risk: 8 },
    { month: 'Apr', compliance: 89, performance: 80, risk: 11 },
    { month: 'May', compliance: 94, performance: 88, risk: 6 },
    { month: 'Jun', compliance: 96, performance: 90, risk: 4 },
    { month: 'Jul', compliance: 91, performance: 86, risk: 9 },
    { month: 'Aug', compliance: 93, performance: 89, risk: 7 },
    { month: 'Sep', compliance: 97, performance: 92, risk: 3 },
    { month: 'Oct', compliance: 95, performance: 91, risk: 5 },
    { month: 'Nov', compliance: 98, performance: 94, risk: 2 },
    { month: 'Dec', compliance: 99, performance: 96, risk: 1 }
  ];

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedVendor]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, vendors]);

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
      // Generate mock data based on filters
      const mockData = vendors.slice(0, Math.min(vendors.length, 10)).map((vendor, index) => ({
        vendor_id: vendor.vendor_id,
        compliance_rate: reportType === 'compliance' ? 
          Math.floor(Math.random() * 40) + 60 : 
          Math.floor(Math.random() * 30) + 70,
        performance_score: reportType === 'performance' ? 
          Math.floor(Math.random() * 30) + 70 : 
          Math.floor(Math.random() * 40) + 60,
        risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        report_data: {},
        generated_date: new Date().toISOString()
      }));

      // Filter by selected vendor if not 'all'
      const filteredData = selectedVendor === 'all' ? 
        mockData : 
        mockData.filter(item => item.vendor_id === selectedVendor);

      setReportData(filteredData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setNoSearchResults(false);
      return;
    }

    const filtered = vendors.filter(vendor =>
      vendor.legal_entity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filtered);
    setNoSearchResults(filtered.length === 0);

    if (filtered.length === 0) {
      toast.error(`No vendor found matching "${searchTerm}"`);
    }
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.vendor_id === vendorId);
    return vendor ? vendor.legal_entity_name : 'Unknown Vendor';
  };

  const exportData = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

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
          {payload[0].payload && payload[0].payload.vendor_id && (
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting Dashboard</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Advanced Analytics Controls</CardTitle>
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
                {noSearchResults && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>No vendor found matching "{searchTerm}"</span>
                  </div>
                )}
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={exportData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Search Results:</p>
                <div className="flex flex-wrap gap-2">
                  {searchResults.map(vendor => (
                    <span key={vendor.vendor_id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {vendor.legal_entity_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

                {/* Chart 2: Performance Trends Line Chart - Full Year */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends Over Time (Full Year)</CardTitle>
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

                {/* Chart 3: Dynamic Compliance/Performance Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {reportType === 'compliance' && `Vendor Compliance Rates (${reportData.length} vendors)`}
                      {reportType === 'performance' && `Vendor Performance Scores (${reportData.length} vendors)`}
                      {reportType === 'risk' && `Vendor Risk Assessment (${reportData.length} vendors)`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-slate-600">No data available for the selected criteria.</p>
                        <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        {reportType === 'risk' ? (
                          <PieChart>
                            <Pie
                              data={reportData.map((item, index) => ({
                                name: getVendorName(item.vendor_id),
                                value: item.compliance_rate || 50,
                                fill: vendorStatusData[index % vendorStatusData.length]?.color || '#8884d8'
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={160}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {reportData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={vendorStatusData[index % vendorStatusData.length]?.color || '#8884d8'} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        ) : (
                          <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="vendor_id" 
                              tickFormatter={vendorId => {
                                const name = getVendorName(vendorId);
                                return name.length > 15 ? name.substring(0, 15) + '...' : name;
                              }}
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
                        {vendorStatusData.find(d => d.name === 'Approved')?.value || 0}
                      </div>
                      <p className="text-sm text-gray-600">Approved Vendors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-orange-600">
                        {vendorStatusData.find(d => d.name === 'Pending')?.value || 0}
                      </div>
                      <p className="text-sm text-gray-600">Pending Review</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {vendorStatusData.find(d => d.name === 'Under Review')?.value || 0}
                      </div>
                      <p className="text-sm text-gray-600">Under Review</p>
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
