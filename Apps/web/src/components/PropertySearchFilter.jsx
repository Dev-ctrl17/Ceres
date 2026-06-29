import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

const PropertySearchFilter = ({ onFilterChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    propertyType: initialFilters.propertyType || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    bedrooms: initialFilters.bedrooms || '',
    bathrooms: initialFilters.bathrooms || '',
    minArea: initialFilters.minArea || '',
    maxArea: initialFilters.maxArea || '',
    tenure: initialFilters.tenure || '',
    amenities: initialFilters.amenities || [],
    ...initialFilters
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'mansion', label: 'Mansion' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const tenureTypes = [
    { value: 'freehold', label: 'Freehold' },
    { value: 'leasehold', label: 'Leasehold' },
    { value: 'customary', label: 'Customary' },
  ];

  const commonAmenities = [
    'Swimming Pool',
    'Gym',
    'Security',
    'Parking',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Furnished',
    'Servant Quarters',
    'CCTV',
    'Internet',
    'Generator',
    'Water Heater',
    'Wardrobe',
    'Store',
  ];

  const priceRanges = [
    { value: '0-10000000', label: 'Under ₦10M', min: 0, max: 10000000 },
    { value: '10000000-50000000', label: '₦10M - ₦50M', min: 10000000, max: 50000000 },
    { value: '50000000-100000000', label: '₦50M - ₦100M', min: 50000000, max: 100000000 },
    { value: '100000000-500000000', label: '₦100M - ₦500M', min: 100000000, max: 500000000 },
    { value: '500000000-999999999999', label: '₦500M+', min: 500000000, max: 999999999999 },
  ];

  useEffect(() => {
    // Debounce filter changes
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleReset = () => {
    setFilters({
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
      tenure: '',
      amenities: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== ''
  );

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by location, property type..."
            value={filters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Property Type */}
              <div>
                <Label>Property Type</Label>
                <Select
                  value={filters.propertyType}
                  onValueChange={(value) => handleInputChange('propertyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label>Price Range</Label>
                <Select
                  value={`${filters.minPrice}-${filters.maxPrice}`}
                  onValueChange={(value) => {
                    const range = priceRanges.find(r => r.value === value);
                    if (range) {
                      handleInputChange('minPrice', range.min);
                      handleInputChange('maxPrice', range.max);
                    } else if (value === '') {
                      handleInputChange('minPrice', '');
                      handleInputChange('maxPrice', '');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Price</SelectItem>
                    {priceRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div>
                <Label>Bedrooms</Label>
                <Select
                  value={filters.bedrooms}
                  onValueChange={(value) => handleInputChange('bedrooms', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div>
                <Label>Bathrooms</Label>
                <Select
                  value={filters.bathrooms}
                  onValueChange={(value) => handleInputChange('bathrooms', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Area Range */}
              <div>
                <Label>Area (sqm)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minArea}
                    onChange={(e) => handleInputChange('minArea', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxArea}
                    onChange={(e) => handleInputChange('maxArea', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Tenure */}
              <div>
                <Label>Tenure</Label>
                <Select
                  value={filters.tenure}
                  onValueChange={(value) => handleInputChange('tenure', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {tenureTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <Label className="mb-3 block">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {commonAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label
                      htmlFor={amenity}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertySearchFilter;