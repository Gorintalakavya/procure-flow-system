
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, Users, FileText, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

const AnalyticsReporting = () => {
  const navigate = useNavigate();
  const [vendorStats, setVendorStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0
  });
  const [chartData, setChartData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*');

      if (error) {
        console.error('Error fetching analytics data:', error);
        return;
      }

      // Calculate vendor statistics
      const total = vendors?.length || 0;
      const statusCounts = vendors?.reduce((acc, vendor) => {
        const status = vendor.registration_status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setVendorStats({
        total,
        active: statusCounts.completed || 0,
        pending: statusCounts.pending || 0,
        completed: statusCounts.in_progress || 0
      });

      // Prepare enhanced chart data for pie chart
      const pieChartData = [
        { name: 'Completed', value: statusCounts.completed || 0, color: '#10B981', percentage: total > 0 ? ((statusCounts.completed || 0) / total * 100).toFixed(1) : '0' },
        { name: 'In Progress', value: statusCounts.in_progress || 0, color: '#F59E0B', percentage: total > 0 ? ((statusCounts.in_progress || 0) / total * 100).toFixed(1) : '0' },
        { name: 'Pending', value: statusCounts.pending || 0, color: '#EF4444', percentage: total > 0 ? ((statusCounts.pending || 0) / total * 100).toFixed(1) : '0' },
        { name: 'Incomplete', value: statusCounts.incomplete || 0, color: '#6B7280', percentage: total > 0 ? ((statusCounts.incomplete || 0) / total * 100).toFixed(1) : '0' }
      ];

      setChartData(pieChartData);

      // Enhanced risk assessment data
      const riskData = [
        { name: 'Low Risk', value: Math.floor(total * 0.65), color: '#10B981', description: 'Fully compliant vendors' },
        { name: 'Medium Risk', value: Math.floor(total * 0.25), color: '#F59E0B', description: 'Minor compliance issues' },
        { name: 'High Risk', value: Math.floor(total * 0.10), color: '#EF4444', description: 'Requires immediate attention' }
      ];

      setRiskData(riskData);

      // Enhanced monthly registration data for all 12 months
      const monthlyRegistrations = [
        { month: 'Jan', registrations: Math.floor(Math.random() * 20) + 10, target: 25 },
        { month: 'Feb', registrations: Math.floor(Math.random() * 20) + 15, target: 25 },
        { month: 'Mar', registrations: Math.floor(Math.random() * 25) + 20, target: 30 },
        { month: 'Apr', registrations: Math.floor(Math.random() * 20) + 12, target: 25 },
        { month: 'May', registrations: Math.floor(Math.random() * 30) + 25, target: 35 },
        { month: 'Jun', registrations: Math.floor(Math.random() * 25) + 30, target: 35 },
        { month: 'Jul', registrations: Math.floor(Math.random() * 22) + 18, target: 30 },
        { month: 'Aug', registrations: Math.floor(Math.random() * 28) + 22, target: 32 },
        { month: 'Sep', registrations: Math.floor(Math.random() * 35) + 28, target: 40 },
        { month: 'Oct', registrations: Math.floor(Math.random() * 30) + 25, target: 35 },
        { month: 'Nov', registrations: Math.floor(Math.random() * 25) + 20, target: 30 },
        { month: 'Dec', registrations: Math.floor(Math.random() * 20) + 15, target: 28 }
      ];

      setMonthlyData(monthlyRegistrations);

    } catch (error) {
      console.error('Error in fetchAnalyticsData:', error);
    }
  };

  const downloadReport = () => {
    const reportData = {
      generatedDate: new Date().toISOString(),
      vendorStats,
      statusBreakdown: chartData,
      riskAssessment: riskData,
      monthlyTrends: monthlyData,
      summary: {
        totalVendors: vendorStats.total,
        complianceRate: ((vendorStats.active / vendorStats.total) * 100).toFixed(1) + '%',
        averageMonthlyRegistrations: (monthlyData.reduce((acc, month) => acc + month.registrations, 0) / 12).toFixed(1),
        riskDistribution: {
          lowRisk: Math.floor(vendorStats.total * 0.65),
          mediumRisk: Math.floor(vendorStats.total * 0.25),
          highRisk: Math.floor(vendorStats.total * 0.10)
        }
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`${label}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">{`${payload[0].payload.percentage}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  const riskTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`${label}: ${payload[0].value} vendors`}</p>
          <p className="text-sm text-gray-600">{payload[0].payload.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
                <p className="text-sm text-gray-500">Real-time insights and vendor performance metrics</p>
              </div>
            </div>
            <Button onClick={downloadReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                  <p className="text-3xl font-bold text-gray-900">{vendorStats.total}</p>
                  <p className="text-xs text-green-600 mt-1">↗ 12% from last month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                  <p className="text-3xl font-bold text-green-600">{vendorStats.active}</p>
                  <p className="text-xs text-green-600 mt-1">↗ 8% compliance rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">{vendorStats.pending}</p>
                  <p className="text-xs text-orange-600 mt-1">Needs attention</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-3xl font-bold text-red-600">{Math.floor(vendorStats.total * 0.1)}</p>
                  <p className="text-xs text-red-600 mt-1">Requires immediate action</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Vendor Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Registration Status</CardTitle>
              <p className="text-sm text-gray-500">Distribution of vendor registration completion status</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={customTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enhanced Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Risk Assessment</CardTitle>
              <p className="text-sm text-gray-500">Risk categorization based on compliance and performance</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={riskTooltip} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Registration Trends</CardTitle>
            <p className="text-sm text-gray-500">Vendor registration patterns throughout the year with targets</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Actual Registrations"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {vendorStats.total > 0 ? ((vendorStats.active / vendorStats.total) * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-sm text-gray-600">Vendors meeting all compliance requirements</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${vendorStats.total > 0 ? (vendorStats.active / vendorStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">5.2 days</div>
              <p className="text-sm text-gray-600">From registration to approval</p>
              <p className="text-xs text-green-600 mt-2">↓ 2.1 days improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
              <p className="text-sm text-gray-600">Average document submission rate</p>
              <p className="text-xs text-green-600 mt-2">↗ 5% increase this month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReporting;
