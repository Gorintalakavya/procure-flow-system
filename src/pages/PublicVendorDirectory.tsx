
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, Globe, Phone, Mail, Users, Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Vendor {
  vendor_id: string;
  legal_entity_name: string;
  trade_name?: string;
  vendor_type: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone_number?: string;
  website?: string;
  business_description?: string;
  year_established?: string;
  employee_count?: string;
  registration_status: string;
}

const PublicVendorDirectory = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchApprovedVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, selectedCountry, selectedType, selectedStatus]);

  const fetchApprovedVendors = async () => {
    try {
      setIsLoading(true);
      
      // Only fetch vendors with 'approved' registration status
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('registration_status', 'approved')
        .order('legal_entity_name');

      if (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendor directory');
        return;
      }

      console.log('Fetched approved vendors:', vendorData);
      setVendors(vendorData || []);
      
      // Log search activity
      await supabase
        .from('advanced_search_history')
        .insert({
          search_type: 'public_directory_view',
          search_query: { action: 'view_public_directory' },
          executed_by: 'anonymous_user',
          results_count: vendorData?.length || 0
        });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.legal_entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.vendor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.business_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(vendor => vendor.country === selectedCountry);
    }

    if (selectedType) {
      filtered = filtered.filter(vendor => vendor.vendor_type === selectedType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(vendor => vendor.registration_status === selectedStatus);
    }

    setFilteredVendors(filtered);

    // Log search activity
    if (searchTerm || selectedCountry || selectedType || selectedStatus) {
      supabase
        .from('advanced_search_history')
        .insert({
          search_type: 'public_directory_search',
          search_query: {
            searchTerm,
            country: selectedCountry,
            type: selectedType,
            status: selectedStatus
          },
          executed_by: 'anonymous_user',
          results_count: filtered.length
        });
    }
  };

  const getUniqueCountries = () => {
    return [...new Set(vendors.map(vendor => vendor.country))].sort();
  };

  const getUniqueTypes = () => {
    return [...new Set(vendors.map(vendor => vendor.vendor_type))].sort();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedType('');
    setSelectedStatus('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Building2 className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Public Vendor Directory</h1>
                <p className="text-gray-600">Browse our network of approved vendors</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Vendors
            </CardTitle>
            <CardDescription>
              Find vendors by name, location, type, or other criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
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
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getUniqueTypes().map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={resetFilters} variant="outline">
                Clear Filters
              </Button>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredVendors.length} of {vendors.length} approved vendors
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor directory...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredVendors.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vendors Found</h3>
              <p className="text-gray-600">
                {vendors.length === 0 
                  ? "No approved vendors are currently available in the directory."
                  : "No vendors match your search criteria. Try adjusting your filters."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Vendor Grid */}
        {!isLoading && filteredVendors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.vendor_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{vendor.legal_entity_name}</CardTitle>
                      {vendor.trade_name && (
                        <CardDescription className="text-sm text-gray-600">
                          Trading as: {vendor.trade_name}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={getStatusBadgeColor(vendor.registration_status)}>
                      {vendor.registration_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{vendor.vendor_type}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{vendor.city}, {vendor.state}, {vendor.country}</span>
                  </div>

                  {vendor.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span className="truncate">{vendor.website}</span>
                    </div>
                  )}

                  {vendor.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{vendor.phone_number}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{vendor.email}</span>
                  </div>

                  {vendor.employee_count && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{vendor.employee_count} employees</span>
                    </div>
                  )}

                  {vendor.year_established && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Established {vendor.year_established}</span>
                    </div>
                  )}

                  {vendor.business_description && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {vendor.business_description}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Vendor ID: {vendor.vendor_id}
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
