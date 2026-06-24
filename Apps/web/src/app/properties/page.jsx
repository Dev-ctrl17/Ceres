import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { supabaseServer } from '@/lib/supabaseServer';

export const metadata = {
  title: 'Browse Luxury Properties for Sale & Rent | Luxury Properties Ltd',
  description: 'Explore our exclusive collection of luxury properties for sale and rent in Lagos, Abuja, and across Nigeria. Filter by location, price, and property type.',
  alternates: {
    canonical: '/properties',
  },
  openGraph: {
    title: 'Browse Luxury Properties | Luxury Properties Ltd',
    description: 'Exclusive high-end properties for sale and rent in Lagos, Abuja, and across Nigeria.',
    url: 'https://luxurypropertiesltd.com.ng/properties',
  },
};

async function getProperties() {
  try {
    const { data, error } = await supabaseServer
      .from('properties')
      .select('*')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Our Properties</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Browse our exclusive collection of luxury properties
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="mb-8 xs:mb-10">
              <PropertyFilter />
            </div>
            {properties.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No properties available at the moment. Please check back later.
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}