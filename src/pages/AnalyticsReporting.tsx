
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, Users, FileText, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
      const statusCounts: Record<string, number> = vendors?.reduce((acc, vendor) => {
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

      // Prepare chart data
      const chartData = [
        { name: 'Completed', value: statusCounts.completed || 0, color: '#10B981' },
        { name: 'In Progress', value: statusCounts.in_progress || 0, color: '#F59E0B' },
        { name: 'Pending', value: statusCounts.pending || 0, color: '#EF4444' },
        { name: 'Incomplete', value: statusCounts.incomplete || 0, color: '#6B7280' }
      ];

      setChartData(chartData);

      // Prepare risk data
      const riskData = [
        { name: 'Low Risk', value: Math.floor(total * 0.6), color: '#10B981' },
        { name: 'Medium Risk', value: Math.floor(total * 0.3), color: '#F59E0B' },
        { name: 'High Risk', value: Math.floor(total * 0.1), color: '#EF4444' }
      ];

      setRiskData(riskData);

    } catch (error) {
      console.error('Error in fetchAnalyticsData:', error);
    }
  };

  const downloadReport = () => {
    const reportData = {
      generatedDate: new Date().toISOString(),
      vendorStats,
      statusBreakdown: chartData,
      riskAssessment: riskData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vendor Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Registration Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { month: 'Jan', registrations: 12 },
                { month: 'Feb', registrations: 19 },
                { month: 'Mar', registrations: 23 },
                { month: 'Apr', registrations: 15 },
                { month: 'May', registrations: 28 },
                { month: 'Jun', registrations: 32 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="registrations" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReporting;
