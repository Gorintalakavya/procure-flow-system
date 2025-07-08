
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, Bell, AlertTriangle, CheckCircle, Clock, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  vendor_id: string;
  timestamp: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  vendor_id: string;
  user_id: string;
}

const AuditNotifications = () => {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    activeNotifications: 0,
    highPriorityAlerts: 0
  });

  useEffect(() => {
    fetchAuditLogs();
    fetchNotifications();
    generateSampleData();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      
      // Calculate stats
      const activeNotifications = data?.filter(n => !n.is_read).length || 0;
      const highPriorityAlerts = data?.filter(n => n.priority === 'high' && !n.is_read).length || 0;
      
      setStats(prev => ({
        ...prev,
        activeNotifications,
        highPriorityAlerts
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const generateSampleData = async () => {
    try {
      // Generate sample audit logs
      const sampleAuditLogs = [
        {
          action: 'CREATE',
          entity_type: 'vendor',
          entity_id: '12345',
          user_id: null,
          vendor_id: 'VEN001',
          old_values: null,
          new_values: { status: 'pending' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0'
        },
        {
          action: 'UPDATE',
          entity_type: 'vendor',
          entity_id: '12345',
          user_id: null,
          vendor_id: 'VEN001',
          old_values: { status: 'pending' },
          new_values: { status: 'approved' },
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0'
        }
      ];

      // Generate sample notifications
      const sampleNotifications = [
        {
          title: 'Vendor Status Updated',
          message: 'Vendor VEN001 status has been changed to approved',
          notification_type: 'status_update',
          priority: 'medium',
          is_read: false,
          vendor_id: 'VEN001',
          user_id: null
        },
        {
          title: 'Document Expiring Soon',
          message: 'ISO certificate for vendor VEN002 expires in 30 days',
          notification_type: 'compliance_alert',
          priority: 'high',
          is_read: false,
          vendor_id: 'VEN002',
          user_id: null
        },
        {
          title: 'New Vendor Registration',
          message: 'A new vendor has registered and requires review',
          notification_type: 'vendor_registration',
          priority: 'medium',
          is_read: true,
          vendor_id: 'VEN003',
          user_id: null
        }
      ];

      // Insert sample data if tables are empty
      const { data: existingLogs } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1);

      if (!existingLogs || existingLogs.length === 0) {
        await supabase.from('audit_logs').insert(sampleAuditLogs);
      }

      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (!existingNotifications || existingNotifications.length === 0) {
        await supabase.from('notifications').insert(sampleNotifications);
      }

      // Update stats
      setStats({
        totalLogs: 50,
        activeNotifications: 2,
        highPriorityAlerts: 1
      });

      // Refetch data
      setTimeout(() => {
        fetchAuditLogs();
        fetchNotifications();
      }, 1000);

    } catch (error) {
      console.error('Error generating sample data:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'compliance_alert': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'status_update': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'vendor_registration': return <User className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
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
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
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
                  <p className="text-3xl font-bold text-orange-600">{stats.activeNotifications}</p>
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
                  <p className="text-3xl font-bold text-red-600">{stats.highPriorityAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Audit Logs and Notifications */}
        <Tabs defaultValue="audit-logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit-logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {log.action} {log.entity_type}
                            </div>
                            <div className="text-sm text-gray-600">
                              Entity: {log.entity_id} | Vendor: {log.vendor_id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString()} | IP: {log.ip_address}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{log.action}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No audit logs available</p>
                      <p className="text-sm">System activities will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>System Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className={`flex items-start justify-between p-4 border rounded-lg ${
                        notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.notification_type)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                              {notification.vendor_id && ` | Vendor: ${notification.vendor_id}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No notifications available</p>
                      <p className="text-sm">System notifications will appear here</p>
                    </div>
                  )}
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
