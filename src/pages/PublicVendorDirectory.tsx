
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, MapPin, Globe, Mail, Phone, ArrowLeft, Filter, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PublicVendorDirectory = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [noResults, setNoResults] = useState(false);
  const [filters, setFilters] = useState({
    country: 'all',
    vendorType: 'all',
    yearEstablished: 'all'
  });

  // Extended mock data with more diverse vendors
  const mockVendors = [
    {
      id: '1',
      vendor_id: 'VND-001',
      legal_entity_name: 'TechCorp Solutions',
      trade_name: 'TechCorp',
      vendor_type: 'technology',
      year_established: '2015',
      business_description: 'Leading provider of enterprise software solutions and digital transformation services.',
      products_services_description: 'Custom software development, cloud migration, AI/ML consulting, cybersecurity services',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      website: 'www.techcorp.com',
      phone_number: '+91-9876543210',
      registration_status: 'approved'
    },
    {
      id: '2',
      vendor_id: 'VND-002',
      legal_entity_name: 'Global Manufacturing Inc',
      trade_name: null,
      vendor_type: 'manufacturing',
      year_established: '2008',
      business_description: 'International manufacturing company specializing in automotive parts and components.',
      products_services_description: 'Automotive parts manufacturing, quality assurance, supply chain management',
      city: 'Detroit',
      state: 'Michigan',
      country: 'USA',
      website: 'www.globalmanufacturing.com',
      phone_number: '+1-555-123-4567',
      registration_status: 'approved'
    },
    {
      id: '3',
      vendor_id: 'VND-003',
      legal_entity_name: 'EcoGreen Services',
      trade_name: 'EcoGreen',
      vendor_type: 'services',
      year_established: '2020',
      business_description: 'Environmental consulting and sustainability services provider.',
      products_services_description: 'Environmental impact assessment, sustainability consulting, waste management',
      city: 'London',
      state: 'England',
      country: 'UK',
      website: 'www.ecogreen.co.uk',
      phone_number: '+44-20-7123-4567',
      registration_status: 'approved'
    },
    {
      id: '4',
      vendor_id: 'VND-004',
      legal_entity_name: 'Healthcare Innovations Ltd',
      trade_name: 'HealthTech',
      vendor_type: 'healthcare',
      year_established: '2018',
      business_description: 'Medical device manufacturer and healthcare technology solutions provider.',
      products_services_description: 'Medical devices, healthcare software, telemedicine solutions, clinical research',
      city: 'Toronto',
      state: 'Ontario',
      country: 'Canada',
      website: 'www.healthtech.ca',
      phone_number: '+1-416-555-9876',
      registration_status: 'approved'
    },
    {
      id: '5',
      vendor_id: 'VND-005',
      legal_entity_name: 'Digital Marketing Pro',
      trade_name: 'DigiPro',
      vendor_type: 'marketing',
      year_established: '2019',
      business_description: 'Full-service digital marketing agency specializing in online brand development.',
      products_services_description: 'SEO services, social media marketing, content creation, PPC advertising',
      city: 'Sydney',
      state: 'NSW',
      country: 'Australia',
      website: 'www.digipro.com.au',
      phone_number: '+61-2-9876-5432',
      registration_status: 'approved'
    },
    {
      id: '6',
      vendor_id: 'VND-006',
      legal_entity_name: 'Financial Consultants Group',
      trade_name: 'FinCon',
      vendor_type: 'consulting',
      year_established: '2012',
      business_description: 'Premier financial advisory and consulting services for businesses and individuals.',
      products_services_description: 'Financial planning, tax consulting, audit services, investment advisory',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      website: 'www.fincon.in',
      phone_number: '+91-22-1234-5678',
      registration_status: 'approved'
    },
    {
      id: '7',
      vendor_id: 'VND-007',
      legal_entity_name: 'Construction Masters Ltd',
      trade_name: 'BuildPro',
      vendor_type: 'construction',
      year_established: '2010',
      business_description: 'Large-scale construction and infrastructure development company.',
      products_services_description: 'Commercial construction, residential projects, infrastructure development',
      city: 'Dubai',
      state: 'Dubai',
      country: 'UAE',
      website: 'www.buildpro.ae',
      phone_number: '+971-4-123-4567',
      registration_status: 'approved'
    },
    {
      id: '8',
      vendor_id: 'VND-008',
      legal_entity_name: 'Food & Beverage Solutions',
      trade_name: 'FoodTech',
      vendor_type: 'food',
      year_established: '2016',
      business_description: 'Food processing and beverage manufacturing solutions provider.',
      products_services_description: 'Food processing equipment, beverage systems, quality control solutions',
      city: 'Singapore',
      state: 'Singapore',
      country: 'Singapore',
      website: 'www.foodtech.sg',
      phone_number: '+65-6123-4567',
      registration_status: 'approved'
    },
    {
      id: '9',
      vendor_id: 'VND-009',
      legal_entity_name: 'Logistics Excellence Corp',
      trade_name: 'LogiEx',
      vendor_type: 'logistics',
      year_established: '2013',
      business_description: 'Comprehensive logistics and supply chain management services.',
      products_services_description: 'Freight forwarding, warehousing, distribution, supply chain optimization',
      city: 'Rotterdam',
      state: 'South Holland',
      country: 'Netherlands',
      website: 'www.logiex.nl',
      phone_number: '+31-10-123-4567',
      registration_status: 'approved'
    },
    {
      id: '10',
      vendor_id: 'VND-010',
      legal_entity_name: 'Education Technology Hub',
      trade_name: 'EduTech',
      vendor_type: 'education',
      year_established: '2021',
      business_description: 'Educational technology solutions and e-learning platform provider.',
      products_services_description: 'E-learning platforms, educational software, virtual classroom solutions',
      city: 'Berlin',
      state: 'Berlin',
      country: 'Germany',
      website: 'www.edutech.de',
      phone_number: '+49-30-123-4567',
      registration_status: 'approved'
    },
    {
      id: '11',
      vendor_id: 'VND-011',
      legal_entity_name: 'Renewable Energy Systems',
      trade_name: 'GreenPower',
      vendor_type: 'energy',
      year_established: '2017',
      business_description: 'Solar and wind energy solutions for commercial and residential projects.',
      products_services_description: 'Solar panel installation, wind turbines, energy storage systems',
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      website: 'www.greenpower.com',
      phone_number: '+1-415-555-7890',
      registration_status: 'approved'
    },
    {
      id: '12',
      vendor_id: 'VND-012',
      legal_entity_name: 'Security Solutions International',
      trade_name: 'SecureGuard',
      vendor_type: 'security',
      year_established: '2014',
      business_description: 'Comprehensive security solutions for enterprises and government organizations.',
      products_services_description: 'Security systems, surveillance equipment, access control, cybersecurity',
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'Japan',
      website: 'www.secureguard.jp',
      phone_number: '+81-3-1234-5678',
      registration_status: 'approved'
    }
  ];

  useEffect(() => {
    fetchVerifiedVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, filters]);

  const fetchVerifiedVendors = async () => {
    try {
      setIsLoading(true);
      // For now, use mock data since we need more diverse vendor data
      setTimeout(() => {
        setVendors(mockVendors);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendor directory');
      setIsLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(vendor =>
        vendor.legal_entity_name.toLowerCase().includes(searchLower) ||
        vendor.trade_name?.toLowerCase().includes(searchLower) ||
        vendor.business_description?.toLowerCase().includes(searchLower) ||
        vendor.products_services_description?.toLowerCase().includes(searchLower) ||
        vendor.vendor_type?.toLowerCase().includes(searchLower) ||
        vendor.city?.toLowerCase().includes(searchLower) ||
        vendor.country?.toLowerCase().includes(searchLower)
      );
    }

    // Country filter
    if (filters.country !== 'all') {
      filtered = filtered.filter(vendor => vendor.country === filters.country);
    }

    // Vendor type filter
    if (filters.vendorType !== 'all') {
      filtered = filtered.filter(vendor => vendor.vendor_type === filters.vendorType);
    }

    // Year established filter
    if (filters.yearEstablished !== 'all') {
      const currentYear = new Date().getFullYear();
      const yearsAgo = parseInt(filters.yearEstablished);
      const cutoffYear = currentYear - yearsAgo;
      filtered = filtered.filter(vendor => 
        vendor.year_established && parseInt(vendor.year_established) >= cutoffYear
      );
    }

    setFilteredVendors(filtered);
    
    // Check if no results found with active filters or search
    const hasActiveFilters = searchTerm.trim() || filters.country !== 'all' || filters.vendorType !== 'all' || filters.yearEstablished !== 'all';
    setNoResults(filtered.length === 0 && hasActiveFilters);

    // Show toast for search with no results
    if (searchTerm.trim() && filtered.length === 0) {
      toast.error(`No vendors found matching "${searchTerm}"`);
    }
  };

  const getUniqueCountries = () => {
    const countries = [...new Set(vendors.map(v => v.country))].filter(Boolean);
    return countries.sort();
  };

  const getUniqueVendorTypes = () => {
    const types = [...new Set(vendors.map(v => v.vendor_type))].filter(Boolean);
    return types.sort();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      country: 'all',
      vendorType: 'all',
      yearEstablished: 'all'
    });
    setNoResults(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading vendor directory...</p>
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
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Public Vendor Directory</h1>
                  <p className="text-sm text-gray-600">Verified vendors in our network</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600">{filteredVendors.length}</p>
              <p className="text-sm text-gray-600">Verified Vendors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vendors by name, description, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Country</label>
                  <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {getUniqueCountries().map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
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
                      {getUniqueVendorTypes().map(type => (
                        <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Years in Business</label>
                  <Select value={filters.yearEstablished} onValueChange={(value) => setFilters({...filters, yearEstablished: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="5">Last 5 years</SelectItem>
                      <SelectItem value="10">Last 10 years</SelectItem>
                      <SelectItem value="20">Last 20 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchTerm || filters.country !== 'all' || filters.vendorType !== 'all' || filters.yearEstablished !== 'all') && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
                  <span className="text-sm text-gray-600">
                    {filteredVendors.length} of {vendors.length} vendors shown
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* No Results Message */}
        {noResults ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 
                  `No vendors match your search for "${searchTerm}"` : 
                  'No vendors match your filter criteria'
                }
              </p>
              <Button onClick={resetFilters} variant="outline">
                Clear filters and show all vendors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{vendor.legal_entity_name}</CardTitle>
                        {vendor.trade_name && (
                          <p className="text-sm text-gray-600">d/b/a {vendor.trade_name}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {vendor.vendor_type.charAt(0).toUpperCase() + vendor.vendor_type.slice(1)}
                    </Badge>
                    {vendor.year_established && (
                      <Badge variant="outline" className="ml-2">
                        Est. {vendor.year_established}
                      </Badge>
                    )}
                  </div>

                  {vendor.business_description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {vendor.business_description}
                    </p>
                  )}

                  {vendor.products_services_description && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Services:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {vendor.products_services_description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.city}, {vendor.state}, {vendor.country}</span>
                    </div>
                    
                    {vendor.website && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>Contact available</span>
                    </div>
                    
                    {vendor.phone_number && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{vendor.phone_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Vendor ID: {vendor.vendor_id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicVendorDirectory;
