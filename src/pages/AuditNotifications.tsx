
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Bell, Activity, User, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuditNotifications = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      setLoading(true);

      // Fetch audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('Error fetching audit logs:', logsError);
      } else {
        setAuditLogs(logsData || []);
      }

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        setNotifications(notificationsData || []);
      }

    } catch (error) {
      console.error('Error in fetchAuditData:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'register':
      case 'create':
        return <User className="h-4 w-4 text-green-600" />;
      case 'update':
      case 'modify':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { variant: 'destructive' as const, icon: AlertCircle },
      medium: { variant: 'default' as const, icon: Clock },
      low: { variant: 'secondary' as const, icon: CheckCircle }
    };

    const config = priorityConfig[priority?.toLowerCase()] || priorityConfig.medium;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit data...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Audit & Notifications</h1>
                <p className="text-sm text-gray-500">Track system activities and manage notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Audit Logs</p>
                  <p className="text-3xl font-bold text-gray-900">{auditLogs.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Notifications</p>
                  <p className="text-3xl font-bold text-orange-600">{notifications.filter(n => !n.is_read).length}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{notifications.filter(n => n.priority === 'high').length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="audit-logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Audit Logs */}
          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>User/Vendor ID</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="font-medium">{log.action}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.entity_type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.vendor_id || log.user_id || 'System'}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {log.new_values ? JSON.stringify(log.new_values).substring(0, 50) + '...' : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            {getPriorityBadge(notification.priority)}
                            {!notification.is_read && (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(notification.created_at).toLocaleString()}</span>
                            {notification.vendor_id && (
                              <span>Vendor: {notification.vendor_id}</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {notification.notification_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuditNotifications;
