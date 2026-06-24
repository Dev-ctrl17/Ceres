import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import { supabaseServer } from '@/lib/supabaseServer';

export const metadata = {
  title: 'Buy Luxury Property in Nigeria | Luxury Properties Ltd',
  description: 'Find your dream luxury property in Lagos, Nigeria. Browse verified listings in Ikoyi, Victoria Island, Banana Island, and Lekki. Expert guidance through every step.',
  alternates: {
    canonical: '/buy',
  },
  openGraph: {
    title: 'Buy Luxury Property in Nigeria',
    description: 'Find your dream luxury property in Lagos. Browse verified listings across Nigeria\'s most exclusive neighborhoods.',
    url: 'https://luxurypropertiesltd.com.ng/buy',
  },
};

async function getPropertiesForSale() {
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Buy Luxury Property in Nigeria',
  description: 'Browse and buy luxury properties in Lagos, Nigeria',
  url: 'https://luxurypropertiesltd.com.ng/buy',
  provider: {
    '@type': 'RealEstateAgent',
    name: 'Luxury Properties Ltd',
    url: 'https://luxurypropertiesltd.com.ng',
  },
};

export default async function BuyPage() {
  const properties = await getPropertiesForSale();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618484006-40ea0e34-24b2-418b-91c4-1f35fdd01ec8.jpeg"
              alt="Find your dream property" 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white">Find Your Dream Property</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Browse our curated selection of verified properties and let our experts guide you through every step of the buying process.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">How to Buy with Us</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
              {[
                { title: 'Browse Properties', desc: 'Explore our verified listings and find your dream property' },
                { title: 'Schedule Viewing', desc: 'Book a viewing at your convenience' },
                { title: 'Make an Offer', desc: 'We help you negotiate the best price' },
                { title: 'Close Deal', desc: 'Complete documentation and move in' },
              ].map((step, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl text-center">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">Featured Properties for Sale</h2>
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

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8 xs:mb-8 sm:mb-10 md:mb-12">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Request a Consultation</h2>
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg leading-relaxed">
                Let us help you find the perfect property. Fill out the form below and our team will contact you.
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