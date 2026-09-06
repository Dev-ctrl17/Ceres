import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PropertyCard from '@/components/PropertyCard';
import { Search, Filter, ArrowRight } from 'lucide-react';
import supabase from '@/lib/supabaseClient';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPurpose, setSelectedPurpose] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, selectedType, selectedPurpose, properties]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'Available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.property_type === selectedType);
    }

    if (selectedPurpose !== 'all') {
      filtered = filtered.filter(p => p.purpose === selectedPurpose);
    }

    setFilteredProperties(filtered);
  };

  const propertyTypes = ['Villa', 'Apartment', 'Shortlet', 'Duplex', 'Semi-Detached', 'Detached', 'Bungalow', 'Terrace'];

  return (
    <>
      <Head>
        <title>Properties for Sale & Rent in Nigeria | Luxury Properties Ltd</title>
        <meta name="description" content="Browse premium properties for sale and rent in Nigeria. Find luxury homes, apartments, and commercial properties in Lagos, Abuja, and Port Harcourt." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="Premium Properties in Nigeria" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Our Properties
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Discover premium properties across Nigeria. From luxury villas to modern apartments, find your perfect property.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="bg-muted p-6 rounded-xl mb-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 rounded-md border border-input bg-background"
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="px-4 py-2 rounded-md border border-input bg-background"
                >
                  <option value="all">All Purposes</option>
                  <option value="Buy">Buy</option>
                  <option value="Rent">Rent</option>
                </select>

                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedPurpose('all');
                  }}
                  variant="outline"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-4">No properties found</p>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PropertiesPage;