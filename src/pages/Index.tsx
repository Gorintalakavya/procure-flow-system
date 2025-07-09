
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Shield, FileText, BarChart3, Bell, Users, CheckCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Vendor Registration",
      description: "Complete vendor onboarding with automated workflow",
      color: "text-blue-600",
      onClick: () => navigate('/vendor-registration')
    },
    {
      icon: Shield,
      title: "Admin Portal",
      description: "Comprehensive admin dashboard with role-based access",
      color: "text-red-600",
      onClick: () => navigate('/admin-dashboard')
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Secure document upload and compliance tracking",
      color: "text-green-600",
      onClick: () => navigate('/vendor-profile')
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Real-time insights and downloadable reports",
      color: "text-purple-600",
      onClick: () => navigate('/analytics-reporting')
    },
    {
      icon: Bell,
      title: "Audit & Notifications",
      description: "Automated alerts and comprehensive audit trails",
      color: "text-orange-600",
      onClick: () => navigate('/audit-notifications')
    },
    {
      icon: CheckCircle,
      title: "Compliance Tracking",
      description: "Monitor certifications and regulatory requirements",
      color: "text-teal-600",
      onClick: () => navigate('/admin-dashboard')
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
            Streamline Your Vendor Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Complete procurement portal solution with vendor registration, compliance tracking, 
            document management, and real-time analytics.
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                  <Button variant="ghost" className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-800">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
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
              <div className="text-3xl font-bold text-orange-600">50%</div>
              <div className="text-gray-600">Faster Processing</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
          <p className="text-gray-600 mb-8">Join hundreds of vendors and streamline your procurement process today.</p>
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
              onClick={() => navigate('/analytics-reporting')}
              className="px-8 py-3"
            >
              View Demo Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
