
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Building2, MapPin, Calendar, Globe, Phone, Mail, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Vendor {
  vendor_id: string;
  legal_entity_name: string;
  trade_name?: string;
  email: string;
  phone_number?: string;
  website?: string;
  business_description?: string;
  vendor_type: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
  year_established?: string;
  employee_count?: string;
  annual_revenue?: string;
  registration_status: string;
  products_services_description?: string;
}

const VendorDirectory = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, typeFilter, locationFilter]);

  const fetchVendors = async () => {
    try {
      // Only fetch approved vendors for public directory
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('registration_status', 'approved')
        .order('legal_entity_name', { ascending: true });

      if (error) throw error;
      
      // Remove duplicates based on vendor_id
      const uniqueVendors = data?.filter((vendor, index, self) => 
        index === self.findIndex(v => v.vendor_id === vendor.vendor_id)
      ) || [];
      
      setVendors(uniqueVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendor directory');
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
        vendor.business_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.products_services_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.vendor_type === typeFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(vendor => 
        vendor.state.toLowerCase() === locationFilter.toLowerCase() ||
        vendor.country.toLowerCase() === locationFilter.toLowerCase()
      );
    }

    setFilteredVendors(filtered);
  };

  const getUniqueStates = () => {
    const states = vendors.map(v => v.state).filter(Boolean);
    return [...new Set(states)].sort();
  };

  const getUniqueTypes = () => {
    const types = vendors.map(v => v.vendor_type).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading vendor directory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Vendor Directory</h2>
        <p className="text-gray-600">Browse our network of approved vendors</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getUniqueTypes().map(type => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {getUniqueStates().map(state => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.vendor_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <Badge variant="outline" className="capitalize">
                      {vendor.vendor_type}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="line-clamp-2">
                  {vendor.trade_name || vendor.legal_entity_name}
                </CardTitle>
                {vendor.trade_name && (
                  <p className="text-sm text-gray-600">{vendor.legal_entity_name}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.city}, {vendor.state}</span>
                </div>

                {vendor.business_description && (
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {vendor.business_description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {vendor.year_established && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Est. {vendor.year_established}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(vendor)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedVendor?.trade_name || selectedVendor?.legal_entity_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Legal Entity Name</h4>
                  <p className="text-gray-600">{selectedVendor.legal_entity_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Vendor Type</h4>
                  <Badge variant="outline" className="capitalize">
                    {selectedVendor.vendor_type}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{selectedVendor.city}, {selectedVendor.state}, {selectedVendor.country}</span>
                  </div>
                  {selectedVendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${selectedVendor.email}`} className="text-blue-600 hover:underline">
                        {selectedVendor.email}
                      </a>
                    </div>
                  )}
                  {selectedVendor.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${selectedVendor.phone_number}`} className="text-blue-600 hover:underline">
                        {selectedVendor.phone_number}
                      </a>
                    </div>
                  )}
                  {selectedVendor.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a 
                        href={selectedVendor.website.startsWith('http') ? selectedVendor.website : `https://${selectedVendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {selectedVendor.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Description */}
              {selectedVendor.business_description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600">{selectedVendor.business_description}</p>
                </div>
              )}

              {/* Products/Services */}
              {selectedVendor.products_services_description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Products & Services</h4>
                  <p className="text-gray-600">{selectedVendor.products_services_description}</p>
                </div>
              )}

              {/* Company Details */}
              <div className="grid grid-cols-2 gap-4">
                {selectedVendor.year_established && (
                  <div>
                    <h4 className="font-medium text-gray-900">Year Established</h4>
                    <p className="text-gray-600">{selectedVendor.year_established}</p>
                  </div>
                )}
                {selectedVendor.employee_count && (
                  <div>
                    <h4 className="font-medium text-gray-900">Employee Count</h4>
                    <p className="text-gray-600">{selectedVendor.employee_count}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDirectory;
