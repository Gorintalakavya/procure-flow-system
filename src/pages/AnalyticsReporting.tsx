
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ArrowLeft, Download, Filter, Search, AlertTriangle, TrendingUp, Users, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AnalyticsReporting = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: '30',
    vendorType: 'all',
    country: 'all',
    riskLevel: 'all'
  });

  // Enhanced pie chart colors - more distinct and clear
  const COLORS = {
    'completed': '#10B981', // Green - Clear and vibrant
    'in_progress': '#F59E0B', // Orange - Distinct from others
    'pending': '#EF4444', // Red - Clear warning color
    'incomplete': '#9CA3AF', // Ash grey - Clear neutral
    'draft': '#6B7280' // Darker grey for drafts
  };

  const pieChartData = [
    { name: 'Completed', value: 45, status: 'completed', color: COLORS.completed },
    { name: 'In Progress', value: 25, status: 'in_progress', color: COLORS.in_progress },
    { name: 'Pending', value: 20, status: 'pending', color: COLORS.pending },
    { name: 'Incomplete', value: 10, status: 'incomplete', color: COLORS.incomplete }
  ];

  const monthlyTrendData = [
    { month: 'Jan', registrations: 12, approvals: 8, rejections: 2 },
    { month: 'Feb', registrations: 19, approvals: 15, rejections: 3 },
    { month: 'Mar', registrations: 25, approvals: 20, rejections: 2 },
    { month: 'Apr', registrations: 18, approvals: 14, rejections: 4 },
    { month: 'May', registrations: 32, approvals: 28, rejections: 1 },
    { month: 'Jun', registrations: 28, approvals: 22, rejections: 3 },
    { month: 'Jul', registrations: 35, approvals: 30, rejections: 2 },
    { month: 'Aug', registrations: 29, approvals: 25, rejections: 2 },
    { month: 'Sep', registrations: 22, approvals: 18, rejections: 3 },
    { month: 'Oct', registrations: 27, approvals: 23, rejections: 1 },
    { month: 'Nov', registrations: 31, approvals: 26, rejections: 2 },
    { month: 'Dec', registrations: 24, approvals: 20, rejections: 2 }
  ];

  const riskAssessmentData = [
    { category: 'Financial Risk', lowRisk: 65, mediumRisk: 25, highRisk: 10 },
    { category: 'Compliance Risk', lowRisk: 70, mediumRisk: 20, highRisk: 10 },
    { category: 'Operational Risk', lowRisk: 60, mediumRisk: 30, highRisk: 10 },
    { category: 'Legal Risk', lowRisk: 75, mediumRisk: 20, rejections: 5 },
    { category: 'Reputational Risk', lowRisk: 80, mediumRisk: 15, highRisk: 5 }
  ];

  const vendorPerformanceData = [
    { subject: 'Quality', A: 85, B: 90, fullMark: 100 },
    { subject: 'Delivery', A: 92, B: 85, fullMark: 100 },
    { subject: 'Compliance', A: 78, B: 95, fullMark: 100 },
    { subject: 'Cost', A: 88, B: 82, fullMark: 100 },
    { subject: 'Innovation', A: 75, B: 88, fullMark: 100 },
    { subject: 'Support', A: 90, B: 85, fullMark: 100 }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch vendors data
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*');

      if (vendorsError) throw vendorsError;

      // Fetch compliance data
      const { data: compliance, error: complianceError } = await supabase
        .from('compliance_tracking')
        .select('*');

      if (complianceError) throw complianceError;

      // Fetch audit data
      const { data: audit, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      setVendorData(vendors || []);
      setComplianceData(compliance || []);
      setAuditData(audit || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (type) => {
    try {
      let data = [];
      let filename = '';

      switch (type) {
        case 'vendors':
          data = vendorData;
          filename = 'vendors_report.csv';
          break;
        case 'compliance':
          data = complianceData;
          filename = 'compliance_report.csv';
          break;
        case 'audit':
          data = auditData;
          filename = 'audit_report.csv';
          break;
      }

      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`${type} report exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">{`${((payload[0].value / 100) * 100).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
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
        {`${value}`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => exportData('vendors')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Vendors
              </Button>
              <Button
                onClick={() => exportData('compliance')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Compliance
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters({...filters, dateRange: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Vendor Type</label>
                <Select value={filters.vendorType} onValueChange={(value) => setFilters({...filters, vendorType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Risk Level</label>
                <Select value={filters.riskLevel} onValueChange={(value) => setFilters({...filters, riskLevel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorData.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-green-600 bg-green-50">+12% this month</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorData.filter(v => v.registration_status === 'approved').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-green-600 bg-green-50">+8% this month</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorData.filter(v => v.registration_status === 'pending').length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-orange-600 bg-orange-50">Requires attention</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-red-600 bg-red-50">Monitor closely</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Pie Chart with Clear Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Registration Status</CardTitle>
              <CardDescription>Current status distribution of all vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomPieLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontWeight: 'bold' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Status Legend with Colors */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Risk Assessment Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Risk Assessment</CardTitle>
              <CardDescription>Risk distribution across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={riskAssessmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="lowRisk" stackId="a" fill="#10B981" name="Low Risk" />
                    <Bar dataKey="mediumRisk" stackId="a" fill="#F59E0B" name="Medium Risk" />
                    <Bar dataKey="highRisk" stackId="a" fill="#EF4444" name="High Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Monthly Trends Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Registration Trends</CardTitle>
              <CardDescription>12-month vendor registration activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="New Registrations"
                      dot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="approvals" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Approvals"
                      dot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rejections" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      name="Rejections"
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Performance Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Radar</CardTitle>
              <CardDescription>Multi-dimensional performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <RadarChart data={vendorPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Top Vendor"
                      dataKey="A"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Average Vendor"
                      dataKey="B"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">5 Documents Expiring Soon</p>
                    <p className="text-sm text-red-700">ISO certificates need renewal</p>
                  </div>
                  <Badge variant="destructive">High</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-orange-900">12 Vendors Pending Review</p>
                    <p className="text-sm text-orange-700">Awaiting compliance verification</p>
                  </div>
                  <Badge variant="secondary" className="text-orange-600 bg-orange-100">Medium</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-yellow-900">3 Failed Compliance Checks</p>
                    <p className="text-sm text-yellow-700">Requires immediate attention</p>
                  </div>
                  <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">Low</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditData.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-600">
                        {log.vendor_id && `Vendor: ${log.vendor_id}`} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReporting;
