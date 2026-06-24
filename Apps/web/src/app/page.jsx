import React from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import { supabaseServer } from '@/lib/supabaseServer';

export const metadata = {
  title: 'Luxury Properties Ltd — Premium Real Estate in Nigeria',
  description: 'Nigeria\'s premier luxury real estate agency. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Luxury Properties Ltd — Premium Real Estate in Nigeria',
    description: 'Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.',
    url: 'https://luxurypropertiesltd.com.ng',
    siteName: 'Luxury Properties Ltd',
    images: ['https://luxurypropertiesltd.com.ng/og-image.png'],
  },
};

async function getFeaturedProperties() {
  try {
    const { data, error } = await supabaseServer
      .from('properties')
      .select('*')
      .eq('status', 'Available')
      .eq('purpose', 'Buy')
      .limit(6);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}

export default async function HomePage() {
  const properties = await getFeaturedProperties();

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781315484156-19239477-a163-4063-9288-df5a0f6fe1b3.png"
              alt="Luxury Properties" 
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center', transform: 'scale(0.8)', transformOrigin: 'center' }}
              priority
            />
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white">Find Your Dream Luxury Property</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Discover exclusive high-end properties in Lagos, Abuja, and across Nigeria. Your perfect home awaits.
            </p>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">Featured Properties</h2>
            {properties.length === 0 ? (
              <div className="text-center text-muted-foreground">No properties available at the moment.</div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {properties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">Our Services</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
              {[
                { title: 'Property Sales', desc: 'Expert guidance through buying and selling' },
                { title: 'Property Leasing', desc: 'Comprehensive leasing services' },
                { title: 'Property Management', desc: 'Full-service management' },
                { title: 'Investment Advisory', desc: 'Strategic advice for your portfolio' },
              ].map((service, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}