
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Shield, FileText, BarChart3, Bell, Users, CheckCircle, Globe, Search, Eye, FileSearch, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Vendor Registration",
      description: "Multi-step wizard with draft saving and validation",
      color: "text-blue-600",
      onClick: () => navigate('/vendor-registration')
    },
    {
      icon: Shield,
      title: "Admin Portal",
      description: "Role-based access with workflow management",
      color: "text-red-600",
      onClick: () => navigate('/admin-dashboard')
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Smart validation with expiry alerts",
      color: "text-green-600",
      onClick: () => navigate('/vendor-profile')
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Advanced charts with export capabilities",
      color: "text-purple-600",
      onClick: () => navigate('/analytics-reporting')
    },
    {
      icon: Bell,
      title: "Audit & Notifications",
      description: "Real-time alerts and comprehensive audit trails",
      color: "text-orange-600",
      onClick: () => navigate('/audit-notifications')
    },
    {
      icon: CheckCircle,
      title: "Compliance Tracking",
      description: "Auto-validation and risk scoring",
      color: "text-teal-600",
      onClick: () => navigate('/admin-dashboard')
    },
    {
      icon: Eye,
      title: "Public Vendor Directory",
      description: "Searchable directory of verified vendors",
      color: "text-indigo-600",
      onClick: () => navigate('/vendors-directory')
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Filter by type, country, dates, and risk scores",
      color: "text-pink-600",
      onClick: () => navigate('/admin-dashboard')
    },
    {
      icon: FileSearch,
      title: "Filing History",
      description: "Track submissions with timeline view",
      color: "text-cyan-600",
      onClick: () => navigate('/admin-dashboard')
    },
    {
      icon: AlertTriangle,
      title: "Risk Dashboard",
      description: "Risk scoring with flags and alerts",
      color: "text-yellow-600",
      onClick: () => navigate('/analytics-reporting')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Procurement Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/vendors-directory')}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Public Directory
              </Button>
              <Button
                onClick={() => navigate('/admin-login')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Vendor Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Complete MCA-style procurement portal with multi-step registration, smart validation, 
            risk assessment, role-based workflows, and comprehensive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/vendor-registration')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Register as Vendor
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/vendor-auth')}
              className="px-8 py-3"
            >
              <Users className="h-5 w-5 mr-2" />
              Vendor Login
            </Button>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 bg-white/80 backdrop-blur-sm"
                onClick={feature.onClick}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-sm">
                    {feature.description}
                  </CardDescription>
                  <Button variant="ghost" className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-800 text-sm">
                    Access →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Stats Section */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Registered Vendors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">98%</div>
              <div className="text-gray-600">Compliance Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600">Portal Availability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">85%</div>
              <div className="text-gray-600">Faster Processing</div>
            </div>
          </div>
        </div>

        {/* New Features Highlight */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Enterprise-Grade Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Risk Assessment</h4>
                <p className="text-sm opacity-90">Automated risk scoring and flags</p>
              </div>
              <div className="text-center">
                <FileSearch className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Smart Validation</h4>
                <p className="text-sm opacity-90">Auto-check PAN/GST formats</p>
              </div>
              <div className="text-center">
                <Bell className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Expiry Alerts</h4>
                <p className="text-sm opacity-90">Email reminders for documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to streamline your procurement?</h3>
          <p className="text-gray-600 mb-8">Experience MCA-level functionality with modern UX design.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/vendor-registration')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              Start Registration Process
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/vendors-directory')}
              className="px-8 py-3"
            >
              Browse Vendor Directory
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
