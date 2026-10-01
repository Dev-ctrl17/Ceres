import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';
import { getCanonicalUrl } from '@/lib/siteConfig.js';

const featuredListingLinks = [
  ['Certificate of Occupancy properties', '/properties/c-of-o'],
  ['5-bedroom detached home with BQ', '/properties/5-bedroom-fully-detached-with-bq'],
  ['Detached home with swimming pool', '/properties/luxurious-4-bedroom-fully-detached-with-bq-and-massive-swimming-pool'],
  ["Governor's Consent listing", '/properties/governors-consent-2'],
  ['4-bedroom detached duplex with BQ', '/properties/4-bedroom-fully-detached-duplex-1-bedroom-bq'],
  ['Long-lease investment opportunity', '/properties/long-lease-investment-opportunity'],
];

const PropertiesPage = () => {
  const { getBackground } = usePageBackgrounds();
  const { page: pageParam } = useParams();
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
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
  const { properties, loading, total } = useProperties({ ...appliedFilters, page });
  const canonicalUrl = getCanonicalUrl(page > 1 ? `/properties/page/${page}` : '/properties');
  const pageCount = Math.ceil(total / 24);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  return (
    <>
      <Helmet>
        <title>Luxury Homes for Sale in Lagos | Luxury Properties Ltd</title>
        <meta name="description" content="Browse our complete collection of verified luxury properties for sale and rent in Lagos, Abuja, and across Nigeria. Filter by location, type, and budget." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Browse Properties for Sale & Rent in Lagos | Luxury Properties Ltd" />
        <meta property="og:description" content="Browse our complete collection of verified luxury properties for sale and rent across Nigeria. Filter by location, type, and budget." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Browse Properties for Sale & Rent in Lagos | Luxury Properties Ltd" />
        <meta name="twitter:description" content="Browse verified luxury properties for sale and rent across Nigeria." />

        {/* JSON-LD BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.luxurypropertiesltd.com.ng"},
              {"@type": "ListItem", "position": 2, "name": "Properties", "item": "https://www.luxurypropertiesltd.com.ng/properties"}
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main data-prerender-ready={loading ? 'false' : 'true'}>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src={getBackground('properties_hero', "https://www.image2url.com/r2/default/images/1781618537376-b115f9d3-7d9d-44a1-b434-f17755a0d94c.jpeg")}
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
            {pageCount > 1 && (
              <nav aria-label="Property listing pages" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <a
                    key={pageNumber}
                    href={pageNumber === 1 ? '/properties' : `/properties/page/${pageNumber}`}
                    aria-current={pageNumber === page ? 'page' : undefined}
                    className={`min-w-10 rounded-md border px-3 py-2 text-center ${pageNumber === page ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                  >
                    {pageNumber}
                  </a>
                ))}
              </nav>
            )}
            <nav aria-label="Featured property listings" className="mt-14 border-t pt-8">
              <h2 className="text-2xl font-semibold mb-5">Featured Property Listings</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredListingLinks.map(([label, path]) => (
                  <li key={path}>
                    <Link
                      className="block border border-border rounded-md p-4 text-primary hover:bg-muted/40 transition-colors"
                      to={new URL(getCanonicalUrl(path)).pathname}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PropertiesPage;