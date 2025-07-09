
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, Mail, Phone, Globe, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const COUNTRIES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AO', name: 'Angola' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AX', name: 'Åland Islands' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BN', name: 'Brunei Darussalam' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CA', name: 'Canada' },
  { code: 'CC', name: 'Cocos (Keeling) Islands' },
  { code: 'CD', name: 'Congo, Democratic Republic of the' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Congo' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands (Malvinas)' },
  { code: 'FM', name: 'Micronesia, Federated States of' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GR', name: 'Greece' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HM', name: 'Heard Island and McDonald Islands' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IN', name: 'India' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran, Islamic Republic of' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'KP', name: "Korea, Democratic People's Republic of" },
  { code: 'KR', name: 'Korea, Republic of' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: "Lao People's Democratic Republic" },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MD', name: 'Moldova, Republic of' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MF', name: 'Saint Martin (French part)' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'Macedonia, the former Yugoslav Republic of' },
  { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macao' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'PN', name: 'Pitcairn' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'PS', name: 'Palestine, State of' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'RU', name: 'Russian Federation' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'SX', name: 'Sint Maarten (Dutch part)' },
  { code: 'SY', name: 'Syrian Arab Republic' },
  { code: 'SZ', name: 'Swaziland' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TD', name: 'Chad' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan, Province of China' },
  { code: 'TZ', name: 'Tanzania, United Republic of' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'United States Minor Outlying Islands' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Holy See (Vatican City State)' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela, Bolivarian Republic of' },
  { code: 'VG', name: 'Virgin Islands, British' },
  { code: 'VI', name: 'Virgin Islands, U.S.' },
  { code: 'VN', name: 'Viet Nam' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' },
  { code: 'YE', name: 'Yemen' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'Other', name: 'Other' }
];

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalEntityName: '',
    tradeName: '',
    vendorType: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    website: '',
    businessDescription: '',
    yearEstablished: '',
    employeeCount: '',
    annualRevenue: '',
    streetAddress: '',
    streetAddressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    customCountry: '',
    productsServicesDescription: ''
  });

  const generateUniqueVendorId = () => {
    // Generate 10-character Vendor ID: VEN + 4 letters + 3 numbers
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = 'VEN';
    
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    for (let i = 0; i < 3; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return result;
  };

  const sendVendorConfirmationEmail = async (email: string, action: string, vendorId?: string) => {
    try {
      console.log('📧 Sending vendor confirmation email...');
      const response = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          vendorId: vendorId || '',
          section: 'vendor',
          action
        }
      });

      if (response.error) {
        console.error('❌ Error sending vendor confirmation email:', response.error);
        toast.error('Failed to send confirmation email');
      } else {
        console.log('✅ Vendor confirmation email sent successfully');
        toast.success('Confirmation email sent to your email address!');
      }
    } catch (error) {
      console.error('❌ Error invoking vendor email function:', error);
      toast.error('Failed to send confirmation email');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Vendor registration attempt...');

      const requiredFields = [
        'legalEntityName', 'vendorType', 'contactName', 'email',
        'streetAddress', 'city', 'state', 'postalCode', 'country'
      ];

      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      // If country is "Other", check for custom country
      if (formData.country === 'Other' && !formData.customCountry) {
        toast.error('Please specify your country name');
        return;
      }

      const vendorId = generateUniqueVendorId();
      console.log('🆔 Generated Vendor ID:', vendorId);

      const { data: existingVendor } = await supabase
        .from('vendors')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingVendor) {
        toast.error('A vendor with this email already exists');
        return;
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          vendor_id: vendorId,
          legal_entity_name: formData.legalEntityName,
          trade_name: formData.tradeName || null,
          vendor_type: formData.vendorType,
          contact_name: formData.contactName,
          email: formData.email,
          phone_number: formData.phoneNumber || null,
          website: formData.website || null,
          business_description: formData.businessDescription || null,
          year_established: formData.yearEstablished || null,
          employee_count: formData.employeeCount || null,
          annual_revenue: formData.annualRevenue || null,
          street_address: formData.streetAddress,
          street_address_line2: formData.streetAddressLine2 || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country === 'Other' ? formData.customCountry : formData.country,
          products_services_description: formData.productsServicesDescription || null,
          registration_status: 'incomplete',
          currency: 'USD'
        })
        .select()
        .single();

      if (vendorError) {
        console.error('❌ Vendor registration error:', vendorError);
        throw vendorError;
      }

      console.log('✅ Vendor registered successfully:', vendorData);

      await supabase
        .from('audit_logs')
        .insert({
          vendor_id: vendorId,
          action: 'REGISTER',
          entity_type: 'vendor',
          entity_id: vendorId,
          new_values: { registration_status: 'incomplete' },
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      await sendVendorConfirmationEmail(formData.email, 'registration', vendorId);

      // Store pending vendor data in localStorage
      localStorage.setItem('pendingVendor', JSON.stringify({
        vendorId: vendorId,
        email: formData.email,
        fromRegistration: true
      }));

      toast.success('Vendor registration submitted successfully!');
      navigate('/vendor-auth');

    } catch (error) {
      console.error('❌ Registration error:', error);
      toast.error('Failed to register vendor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900">Vendor Registration</h1>
            <p className="text-slate-600 mt-2">Complete your vendor profile to join our procurement network</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
              <CardDescription>
                Please provide accurate information for your vendor registration. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="legalEntityName">Legal Entity Name *</Label>
                      <Input
                        id="legalEntityName"
                        value={formData.legalEntityName}
                        onChange={(e) => handleInputChange('legalEntityName', e.target.value)}
                        placeholder="Enter legal entity name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradeName">Trade Name (if different)</Label>
                      <Input
                        id="tradeName"
                        value={formData.tradeName}
                        onChange={(e) => handleInputChange('tradeName', e.target.value)}
                        placeholder="Enter trade name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorType">Vendor Type *</Label>
                      <Select value={formData.vendorType} onValueChange={(value) => handleInputChange('vendorType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="nonprofit">Non-profit</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        value={formData.yearEstablished}
                        onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                        placeholder="e.g., 2010"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessDescription">Business Description</Label>
                    <Textarea
                      id="businessDescription"
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      placeholder="Describe your business and services"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Primary Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Enter contact person's name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="Enter phone number"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                  
                  <div>
                    <Label htmlFor="streetAddress">Street Address *</Label>
                    <div className="relative mb-2">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="streetAddress"
                        value={formData.streetAddress}
                        onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                        placeholder="Enter street address"
                        className="pl-10"
                        required
                      />
                    </div>
                    <Input
                      id="streetAddressLine2"
                      value={formData.streetAddressLine2}
                      onChange={(e) => handleInputChange('streetAddressLine2', e.target.value)}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="Enter postal code"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.country === 'Other' && (
                      <div className="mt-2">
                        <Label htmlFor="customCountry">Enter Country Name *</Label>
                        <Input
                          id="customCountry"
                          value={formData.customCountry}
                          onChange={(e) => handleInputChange('customCountry', e.target.value)}
                          placeholder="Enter your country name"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Select value={formData.employeeCount} onValueChange={(value) => handleInputChange('employeeCount', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="500+">500+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="annualRevenue">Annual Revenue</Label>
                      <Select value={formData.annualRevenue} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select annual revenue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Under $100K">Under $100K</SelectItem>
                          <SelectItem value="$100K - $500K">$100K - $500K</SelectItem>
                          <SelectItem value="$500K - $1M">$500K - $1M</SelectItem>
                          <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                          <SelectItem value="$5M - $10M">$5M - $10M</SelectItem>
                          <SelectItem value="$10M+">$10M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="productsServicesDescription">Products/Services Description</Label>
                    <Textarea
                      id="productsServicesDescription"
                      value={formData.productsServicesDescription}
                      onChange={(e) => handleInputChange('productsServicesDescription', e.target.value)}
                      placeholder="Describe the products or services you offer"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Registration'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
