
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, User, Calendar, FileText, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VendorNotification {
  id: string;
  title: string;
  message: string;
  type: 'status_update' | 'compliance_alert' | 'vendor_registration' | 'document_expiry' | 'contract_expiry';
  priority: 'high' | 'medium' | 'low';
  vendor_id: string;
  vendor_name: string;
  created_at: string;
  is_read: boolean;
}

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = async () => {
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const generatedNotifications: VendorNotification[] = [];

      vendors?.forEach(vendor => {
        // Check for new vendor registrations
        const registrationDate = new Date(vendor.created_at);
        const daysSinceRegistration = (new Date().getTime() - registrationDate.getTime()) / (1000 * 3600 * 24);
        
        if (daysSinceRegistration <= 7 && vendor.registration_status === 'pending') {
          generatedNotifications.push({
            id: `reg_${vendor.id}`,
            title: 'New Vendor Registration',
            message: `A new vendor "${vendor.legal_entity_name}" has registered and requires review`,
            type: 'vendor_registration',
            priority: 'medium',
            vendor_id: vendor.vendor_id,
            vendor_name: vendor.legal_entity_name,
            created_at: vendor.created_at,
            is_read: false
          });
        }

        // Check for vendor status updates
        if (vendor.registration_status === 'approved' && daysSinceRegistration <= 1) {
          generatedNotifications.push({
            id: `status_${vendor.id}`,
            title: 'Vendor Status Updated',
            message: `Vendor "${vendor.legal_entity_name}" status has been changed to approved`,
            type: 'status_update',
            priority: 'medium',
            vendor_id: vendor.vendor_id,
            vendor_name: vendor.legal_entity_name,
            created_at: vendor.created_at,
            is_read: false
          });
        }

        // Check for contract expiry
        if (vendor.contract_expiration_date) {
          const expiryDate = new Date(vendor.contract_expiration_date);
          const daysUntilExpiry = (expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            generatedNotifications.push({
              id: `contract_${vendor.id}`,
              title: 'Contract Expiring Soon',
              message: `Contract for vendor "${vendor.legal_entity_name}" expires in ${Math.ceil(daysUntilExpiry)} days`,
              type: 'contract_expiry',
              priority: 'high',
              vendor_id: vendor.vendor_id,
              vendor_name: vendor.legal_entity_name,
              created_at: new Date().toISOString(),
              is_read: false
            });
          }
        }

        // Check for compliance alerts
        if (!vendor.w9_status || vendor.w9_status === 'pending' || vendor.w9_status === 'expired') {
          generatedNotifications.push({
            id: `compliance_${vendor.id}`,
            title: 'Compliance Alert',
            message: `W-9 form for vendor "${vendor.legal_entity_name}" requires attention`,
            type: 'compliance_alert',
            priority: 'high',
            vendor_id: vendor.vendor_id,
            vendor_name: vendor.legal_entity_name,
            created_at: new Date().toISOString(),
            is_read: false
          });
        }

        // Check for missing critical information
        if (!vendor.tax_id || !vendor.bank_account_details) {
          generatedNotifications.push({
            id: `missing_info_${vendor.id}`,
            title: 'Incomplete Vendor Information',
            message: `Vendor "${vendor.legal_entity_name}" has missing critical information (Tax ID or Bank Details)`,
            type: 'compliance_alert',
            priority: 'medium',
            vendor_id: vendor.vendor_id,
            vendor_name: vendor.legal_entity_name,
            created_at: new Date().toISOString(),
            is_read: false
          });
        }
      });

      // Sort notifications by priority and date
      generatedNotifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Error generating notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'compliance_alert':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'status_update':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'vendor_registration':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'contract_expiry':
        return <Calendar className="h-4 w-4 text-red-500" />;
      case 'document_expiry':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-4 border rounded-lg ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
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
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications available</p>
              <p className="text-sm">System notifications will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorNotifications;
