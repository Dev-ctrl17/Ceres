import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RentPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { properties, loading } = useProperties({ status: 'Available' });

  const filterByType = (type) => {
    if (type === 'all') return properties;
    return properties.filter(p => p.propertyType === type);
  };

  return (
    <>
      <Helmet>
        <title>Rent Property - Luxury Properties Ltd</title>
        <meta name="description" content="Find rental properties including residential, commercial, and shortlets in Lagos." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/tTmxcFdS/rent.png"
              alt="Rental Properties" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-background" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>Rental Properties</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Discover quality rental properties from residential apartments to commercial spaces and luxury shortlets.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
                <TabsTrigger value="all">All Rentals</TabsTrigger>
                <TabsTrigger value="Residential">Residential</TabsTrigger>
                <TabsTrigger value="Commercial">Commercial</TabsTrigger>
                <TabsTrigger value="Shortlet">Shortlets</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                        <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                        <div className="h-6 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filterByType('all').map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="Residential">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Residential').map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Commercial">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Commercial').map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Shortlet">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Shortlet').map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default RentPage;