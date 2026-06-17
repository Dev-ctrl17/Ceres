import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { useProperties } from '@/hooks/useProperties.js';

const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-animate { animation: fadeInUp 1s ease-out forwards; }
  .hero-image { animation: fadeIn 1.5s ease-out forwards; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
  .hero-image:hover { transform: scale(1.05); }
  .hero-section { animation: fadeIn 0.5s ease-out; }
  .filter-section { animation: fadeInUp 0.8s ease-out 0.2s forwards; opacity: 0; }
  .property-card { opacity: 0; animation: slideInUp 0.6s ease-out forwards; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease; }
  .property-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.12); }
`;

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

      <style>{animationStyles}</style>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618537376-b115f9d3-7d9d-44a1-b434-f17755a0d94c.jpeg"
              alt="Browse All Properties" 
              className="w-full h-full object-cover hero-image"
              loading="lazy"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 filter-section">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-white hero-animate" style={{ letterSpacing: '-0.02em' }}>Browse All Properties</h1>
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