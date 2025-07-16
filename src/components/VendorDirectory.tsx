
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Building2, MapPin, Globe, Mail, Phone, Star, Download } from "lucide-react";
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
  products_services_description?: string;
  year_established?: string;
  employee_count?: string;
  registration_status: string;
}

const VendorDirectory = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, industryFilter, locationFilter]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('registration_status', 'approved')
        .order('legal_entity_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
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
        vendor.business_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.products_services_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.vendor_type === industryFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.state === locationFilter);
    }

    setFilteredVendors(filtered);
  };

  const calculateProfileScore = (vendor: Vendor) => {
    const fields = [
      vendor.legal_entity_name,
      vendor.email,
      vendor.business_description,
      vendor.products_services_description,
      vendor.website,
      vendor.phone_number,
      vendor.year_established,
      vendor.employee_count
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Vendor ID', 'Company Name', 'Trade Name', 'Email', 'Phone', 'Website', 'Type', 'Location', 'Description'],
      ...filteredVendors.map(vendor => [
        vendor.vendor_id,
        vendor.legal_entity_name,
        vendor.trade_name || '',
        vendor.email,
        vendor.phone_number || '',
        vendor.website || '',
        vendor.vendor_type,
        `${vendor.city}, ${vendor.state}, ${vendor.country}`,
        vendor.business_description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_directory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUniqueStates = () => {
    const states = [...new Set(vendors.map(v => v.state))].sort();
    return states;
  };

  const getUniqueTypes = () => {
    const types = [...new Set(vendors.map(v => v.vendor_type))].sort();
    return types;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge variant="outline">Basic</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vendor Directory</h2>
          <p className="text-gray-600">Browse our verified vendor network</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Directory
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies, services, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
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

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const profileScore = calculateProfileScore(vendor);
          return (
            <Card key={vendor.vendor_id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{profileScore}%</span>
                    </div>
                  </div>
                  {getScoreBadge(profileScore)}
                </div>
                <div>
                  <CardTitle className="text-lg">{vendor.legal_entity_name}</CardTitle>
                  {vendor.trade_name && (
                    <p className="text-sm text-gray-600">DBA: {vendor.trade_name}</p>
                  )}
                  <p className="text-xs text-gray-500 font-mono mt-1">{vendor.vendor_id}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.city}, {vendor.state}</span>
                </div>
                
                <Badge variant="outline" className="capitalize">
                  {vendor.vendor_type}
                </Badge>

                {vendor.business_description && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {vendor.business_description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {vendor.legal_entity_name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Vendor ID</h4>
                            <p className="text-sm font-mono">{vendor.vendor_id}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Profile Completeness</h4>
                            <div className="flex items-center gap-2">
                              {getScoreBadge(profileScore)}
                              <span className="text-sm">{profileScore}%</span>
                            </div>
                          </div>
                        </div>

                        {vendor.trade_name && (
                          <div>
                            <h4 className="font-medium">Trade Name</h4>
                            <p className="text-sm">{vendor.trade_name}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium">Industry</h4>
                            <Badge variant="outline" className="capitalize">
                              {vendor.vendor_type}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium">Location</h4>
                            <p className="text-sm">{vendor.city}, {vendor.state}, {vendor.country}</p>
                          </div>
                        </div>

                        {vendor.business_description && (
                          <div>
                            <h4 className="font-medium">About the Company</h4>
                            <p className="text-sm text-gray-700">{vendor.business_description}</p>
                          </div>
                        )}

                        {vendor.products_services_description && (
                          <div>
                            <h4 className="font-medium">Products & Services</h4>
                            <p className="text-sm text-gray-700">{vendor.products_services_description}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {vendor.year_established && (
                            <div>
                              <h4 className="font-medium">Year Established</h4>
                              <p className="text-sm">{vendor.year_established}</p>
                            </div>
                          )}
                          {vendor.employee_count && (
                            <div>
                              <h4 className="font-medium">Employee Count</h4>
                              <p className="text-sm">{vendor.employee_count}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                          <h4 className="font-medium">Contact Information</h4>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                                {vendor.email}
                              </a>
                            </div>
                            {vendor.phone_number && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${vendor.phone_number}`} className="text-blue-600 hover:underline">
                                  {vendor.phone_number}
                                </a>
                              </div>
                            )}
                            {vendor.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4" />
                                <a 
                                  href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {vendor.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorDirectory;
