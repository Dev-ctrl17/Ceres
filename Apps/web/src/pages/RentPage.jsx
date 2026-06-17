import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero-animate {
    animation: fadeInUp 1s ease-out forwards;
  }

  .hero-animate-delay-1 {
    animation: fadeInUp 1s ease-out 0.3s forwards;
    opacity: 0;
  }

  .hero-image {
    animation: fadeIn 1.5s ease-out forwards;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-image:hover {
    transform: scale(1.05);
  }

  .hero-section {
    animation: fadeIn 0.5s ease-out;
  }

  .tabs-section {
    animation: fadeInUp 0.8s ease-out 0.2s forwards;
    opacity: 0;
  }

  .tab-trigger {
    transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  }

  .tab-trigger:hover {
    transform: translateY(-2px);
  }

  .tab-trigger[data-state="active"] {
    animation: scaleIn 0.3s ease-out;
  }

  .property-card {
    opacity: 0;
    animation: slideInUp 0.6s ease-out forwards;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
    transform-origin: center bottom;
  }

  .property-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
  }

  .property-card:nth-child(1) { animation-delay: 0.05s; }
  .property-card:nth-child(2) { animation-delay: 0.1s; }
  .property-card:nth-child(3) { animation-delay: 0.15s; }
  .property-card:nth-child(4) { animation-delay: 0.2s; }
  .property-card:nth-child(5) { animation-delay: 0.25s; }
  .property-card:nth-child(6) { animation-delay: 0.3s; }

  .loading-skeleton {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .tabs-content {
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .tabs-list {
    animation: scaleIn 0.6s ease-out forwards;
  }
`;

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

      <style>{animationStyles}</style>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618476860-202949ba-8ed6-4e3d-ba06-ec71d84c6e04.jpeg"
              alt="Rental Properties" 
              className="w-full h-full object-cover hero-image"
              style={{ objectPosition: 'center' }}
              loading="lazy"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white hero-animate" style={{ letterSpacing: '-0.02em' }}>Rental Properties</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay-1">
              Discover quality rental properties from residential apartments to commercial spaces and luxury shortlets.
            </p>
          </div>
        </section>

        <section className="py-20 tabs-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12 tabs-list">
                <TabsTrigger value="all" className="tab-trigger">All Rentals</TabsTrigger>
                <TabsTrigger value="Residential" className="tab-trigger">Residential</TabsTrigger>
                <TabsTrigger value="Commercial" className="tab-trigger">Commercial</TabsTrigger>
                <TabsTrigger value="Shortlet" className="tab-trigger">Shortlets</TabsTrigger>
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

              <TabsContent value="Residential" className="tabs-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Residential').map((property) => (
                    <PropertyCard key={property.id} property={property} className="property-card" />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="Commercial" className="tabs-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filterByType('Commercial').map((property) => (
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
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default RentPage;