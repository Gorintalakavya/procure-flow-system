
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

  useEffect(() => {
    fetchVerifiedVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, filters]);

  const fetchVerifiedVendors = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching verified vendors from database...');
      
      // Fetch only approved vendors from the database
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('registration_status', 'approved');

      if (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendor directory');
        setVendors([]);
      } else {
        console.log('Fetched vendors:', vendorData);
        // Transform the data to match the expected format
        const transformedVendors = vendorData?.map(vendor => ({
          id: vendor.id,
          vendor_id: vendor.vendor_id,
          legal_entity_name: vendor.legal_entity_name,
          trade_name: vendor.trade_name,
          vendor_type: vendor.vendor_type,
          year_established: vendor.year_established,
          business_description: vendor.business_description,
          products_services_description: vendor.products_services_description,
          city: vendor.city,
          state: vendor.state,
          country: vendor.country,
          website: vendor.website,
          phone_number: vendor.phone_number,
          registration_status: vendor.registration_status
        })) || [];
        
        setVendors(transformedVendors);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendor directory');
      setVendors([]);
      setIsLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(vendor =>
        vendor.legal_entity_name?.toLowerCase().includes(searchLower) ||
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
    const shouldShowNoResults = filtered.length === 0 && hasActiveFilters;
    setNoResults(shouldShowNoResults);

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
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
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
                  <p className="text-sm text-gray-600">Verified registered vendors in our network</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registered vendors found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 
                  `No registered vendors match your search for "${searchTerm}"` : 
                  'No registered vendors match your filter criteria'
                }
              </p>
              <Button onClick={resetFilters} variant="outline">
                Clear filters and show all registered vendors
              </Button>
            </CardContent>
          </Card>
        ) : filteredVendors.length === 0 && vendors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registered vendors yet</h3>
              <p className="text-gray-600 mb-4">
                There are currently no approved vendors in the system.
              </p>
              <Button onClick={() => navigate('/vendor-registration')} variant="outline">
                Register as a Vendor
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
                      {vendor.vendor_type?.charAt(0).toUpperCase() + vendor.vendor_type?.slice(1)}
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
