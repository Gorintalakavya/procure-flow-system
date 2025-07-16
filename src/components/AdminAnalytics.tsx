
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Building2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  registrationTrends: Array<{ month: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  companyTypes: Array<{ type: string; count: number }>;
  monthlyApprovals: Array<{ month: string; approved: number; rejected: number }>;
  totalVendors: number;
  pendingReviews: number;
  approvedVendors: number;
  rejectedVendors: number;
  averageProcessingTime: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('vendor_id, registration_status, vendor_type, created_at, updated_at');

      if (error) throw error;

      const processedData = processAnalyticsData(vendors || []);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (vendors: any[]): AnalyticsData => {
    const now = new Date();
    const months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: 0,
        approved: 0,
        rejected: 0
      });
    }

    // Count registrations by month
    const registrationTrends = months.map(month => ({
      ...month,
      count: vendors.filter(v => {
        const created = new Date(v.created_at);
        return created.getMonth() === new Date(month.month + ' 1').getMonth() &&
               created.getFullYear() === new Date(month.month + ' 1').getFullYear();
      }).length
    }));

    // Count approvals/rejections by month
    const monthlyApprovals = months.map(month => ({
      month: month.month,
      approved: vendors.filter(v => {
        const updated = new Date(v.updated_at || v.created_at);
        return v.registration_status === 'approved' &&
               updated.getMonth() === new Date(month.month + ' 1').getMonth() &&
               updated.getFullYear() === new Date(month.month + ' 1').getFullYear();
      }).length,
      rejected: vendors.filter(v => {
        const updated = new Date(v.updated_at || v.created_at);
        return v.registration_status === 'rejected' &&
               updated.getMonth() === new Date(month.month + ' 1').getMonth() &&
               updated.getFullYear() === new Date(month.month + ' 1').getFullYear();
      }).length
    }));

    // Status distribution
    const statusCounts = vendors.reduce((acc, vendor) => {
      acc[vendor.registration_status] = (acc[vendor.registration_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / vendors.length) * 100)
    }));

    // Company types
    const typeCounts = vendors.reduce((acc, vendor) => {
      acc[vendor.vendor_type] = (acc[vendor.vendor_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const companyTypes = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count
    }));

    // Calculate processing time (mock data for now)
    const averageProcessingTime = 2.5; // days

    return {
      registrationTrends,
      statusDistribution,
      companyTypes,
      monthlyApprovals,
      totalVendors: vendors.length,
      pendingReviews: statusCounts.pending || 0,
      approvedVendors: statusCounts.approved || 0,
      rejectedVendors: statusCounts.rejected || 0,
      averageProcessingTime
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last6months">Last 6 Months</SelectItem>
            <SelectItem value="last12months">Last 12 Months</SelectItem>
            <SelectItem value="thisyear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Vendors</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.approvedVendors}</div>
            <p className="text-xs text-muted-foreground">
              Active in directory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">
              Time to approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Types */}
        <Card>
          <CardHeader>
            <CardTitle>Company Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.companyTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Approvals vs Rejections */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Approvals vs Rejections</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyApprovals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="approved" fill="#00C49F" />
                <Bar dataKey="rejected" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
