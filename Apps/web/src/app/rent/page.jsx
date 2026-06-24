import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import { supabaseServer } from '@/lib/supabaseServer';

export const metadata = {
  title: 'Rent Luxury Property in Nigeria | Luxury Properties Ltd',
  description: 'Find premium rental properties in Lagos, Abuja, and across Nigeria. Browse luxury apartments, duplexes, and houses for rent.',
  alternates: {
    canonical: '/rent',
  },
  openGraph: {
    title: 'Rent Luxury Property in Nigeria',
    description: 'Premium rental properties in Lagos, Abuja, and across Nigeria.',
    url: 'https://luxurypropertiesltd.com.ng/rent',
  },
};

async function getPropertiesForRent() {
  try {
    const { data, error } = await supabaseServer
      .from('properties')
      .select('*')
      .eq('status', 'Available')
      .eq('purpose', 'Rent')
      .limit(6);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}

export default async function RentPage() {
  const properties = await getPropertiesForRent();

  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Rent Luxury Property</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Discover premium rental properties in Lagos, Abuja, and across Nigeria
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">Featured Rental Properties</h2>
            {properties.length === 0 ? (
              <div className="text-center text-muted-foreground">No rental properties available at the moment.</div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {properties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8 xs:mb-8 sm:mb-10 md:mb-12">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Request Rental Assistance</h2>
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg leading-relaxed">
                Let us help you find the perfect rental property. Fill out the form below and our team will contact you.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}