import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { useProperties } from '@/hooks/useProperties.js';

const PropertiesPage = () => {
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const { properties, loading } = useProperties(appliedFilters);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  return (
    <>
      <Helmet>
        <title>Browse Properties - Luxury Properties Ltd</title>
        <meta name="description" content="Browse our complete collection of verified properties for sale and rent in Lagos." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/Qv7JsQ8d/properties.png"
              alt="Browse All Properties" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-background" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-white" style={{ letterSpacing: '-0.02em' }}>Browse All Properties</h1>
            <PropertyFilter filters={filters} setFilters={setFilters} onSearch={handleSearch} />
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `${properties.length} properties found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No properties found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} featured={property.isFeatured} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PropertiesPage;