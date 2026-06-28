import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { useProperties } from '@/hooks/useProperties.js';

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('type') || '',
    bedrooms: searchParams.get('beds') || '',
    status: searchParams.get('status') || '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('type') || '',
    bedrooms: searchParams.get('beds') || '',
    status: searchParams.get('status') || '',
  });
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
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618537376-b115f9d3-7d9d-44a1-b434-f17755a0d94c.jpeg"
              alt="Browse All Properties" 
              className="w-full h-full object-cover hero-image"
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 filter-section">
            <h1 className="heading-lg mb-6 xs:mb-6 sm:mb-8 text-center text-white hero-animate">Browse All Properties</h1>
            <PropertyFilter filters={filters} setFilters={setFilters} onSearch={handleSearch} />
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 xs:mb-6 sm:mb-8">
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base">
                {loading ? 'Loading...' : `${properties.length} properties found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 xs:py-16 sm:py-20">
                <p className="text-base xs:text-base sm:text-xl text-muted-foreground">No properties found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} featured={property.is_featured} className="property-card" />
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