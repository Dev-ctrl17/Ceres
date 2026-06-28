import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RentPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { properties, loading } = useProperties({ status: 'Available', purpose: 'Rent' });

  const filterByType = (type) => {
    if (type === 'all') return properties;
    return properties.filter(p => p.property_type?.toLowerCase().includes(type.toLowerCase()));
  };

  return (
    <>
      <Helmet>
        <title>Rent Property - Luxury Properties Ltd</title>
        <meta name="description" content="Find rental properties including apartments, shortlets, and villas in Lagos." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618476860-202949ba-8ed6-4e3d-ba06-ec71d84c6e04.jpeg"
              alt="Rental Properties" 
              className="w-full h-full object-cover hero-image"
              style={{ objectPosition: 'center' }}
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white hero-animate" style={{ letterSpacing: '-0.02em' }}>Rental Properties</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay-1">
              Discover quality rental properties from apartments to villas and luxury shortlets.
            </p>
          </div>
        </section>

        <section className="py-20 tabs-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12 tabs-list">
                <TabsTrigger value="all" className="tab-trigger">All Rentals</TabsTrigger>
                <TabsTrigger value="Apartment" className="tab-trigger">Apartment</TabsTrigger>
                <TabsTrigger value="Shortlet" className="tab-trigger">Shortlets</TabsTrigger>
                <TabsTrigger value="Villa" className="tab-trigger">Villa</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="tabs-content">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 loading-skeleton">
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
                      <PropertyCard key={property.id} property={property} className="property-card" />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="Apartment" className="tabs-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Apartment').map((property) => (
                    <PropertyCard key={property.id} property={property} className="property-card" />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Shortlet" className="tabs-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Shortlet').map((property) => (
                    <PropertyCard key={property.id} property={property} className="property-card" />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Villa" className="tabs-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Villa').map((property) => (
                    <PropertyCard key={property.id} property={property} className="property-card" />
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