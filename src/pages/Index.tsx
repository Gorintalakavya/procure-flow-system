
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, Shield, BarChart3, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      title: "Vendor Registration",
      description: "Self-service vendor onboarding with document verification",
      action: () => navigate('/vendor-registration')
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Vendor Management",
      description: "Comprehensive vendor profile and data management",
      action: () => navigate('/vendor-auth')
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Admin Dashboard",
      description: "Approve vendors, manage permissions, and oversight",
      action: () => navigate('/admin-login')
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "Document Management",
      description: "Secure document storage and compliance tracking",
      action: () => navigate('/documents')
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-red-600" />,
      title: "Analytics & Reporting",
      description: "Performance metrics and compliance reports",
      action: () => navigate('/analytics')
    },
    {
      icon: <Bell className="h-8 w-8 text-yellow-600" />,
      title: "Audit & Notifications",
      description: "Real-time alerts and comprehensive audit trails",
      action: () => navigate('/audit')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Procurement Portal</h1>
                <p className="text-gray-600">Vendor Management & Compliance Platform</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate('/admin-login')}>
                Admin Login
              </Button>
              <Button onClick={() => navigate('/vendor-registration')}>
                Register as Vendor
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your <span className="text-blue-600">Procurement Process</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform for vendor management, compliance tracking, and procurement operations. 
            Secure, scalable, and designed for modern organizations.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => navigate('/vendor-registration')} className="px-8 py-3">
              Start Vendor Registration
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/admin-login')} className="px-8 py-3">
              Admin Access
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h3>
            <p className="text-gray-600">Everything you need for comprehensive vendor management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={feature.action}>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Platform Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
              <div className="text-gray-600">Vendors Onboarded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600">Compliance Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Procurement Portal</span>
              </div>
              <p className="text-gray-400">
                Streamlining vendor management and procurement operations for modern organizations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Vendor Registration</li>
                <li>Document Management</li>
                <li>Compliance Tracking</li>
                <li>Analytics & Reporting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>API Documentation</li>
                <li>Training Resources</li>
                <li>Contact Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Data Protection</li>
                <li>Audit Logs</li>
                <li>Compliance</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Procurement Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
