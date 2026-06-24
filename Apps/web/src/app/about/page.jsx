import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export const metadata = {
  title: 'About Us | Luxury Properties Ltd',
  description: 'Learn about Luxury Properties Ltd, Nigeria\'s premier luxury real estate agency with 15+ years of experience in Lagos, Abuja, and beyond.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">About Luxury Properties Ltd</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Nigeria's premier luxury real estate agency
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="heading-lg mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-6">
                Luxury Properties Ltd is Nigeria's premier luxury real estate agency, specializing in buying, selling, and renting exclusive high-end properties in Lagos, Abuja, and across Nigeria. With over 15 years of experience in the Nigerian real estate market, we have built a reputation for excellence, integrity, and personalized service.
              </p>
              <p className="text-muted-foreground mb-6">
                Our team of expert agents understands the unique nuances of the luxury property market. We provide concierge-level service, from property search and valuation to negotiation and closing. Whether you're buying your dream home, selling a premium property, or looking for the perfect rental, we deliver results that exceed expectations.
              </p>
              <h2 className="heading-lg mb-6 mt-12">Why Choose Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-2">Expertise</h3>
                  <p className="text-muted-foreground">15+ years in luxury real estate across Nigeria's most exclusive neighborhoods</p>
                </div>
                <div className="bg-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-2">Exclusive Access</h3>
                  <p className="text-muted-foreground">Off-market properties and pocket listings not available on public portals</p>
                </div>
                <div className="bg-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-2">Personalized Service</h3>
                  <p className="text-muted-foreground">White-glove concierge service tailored to your unique needs</p>
                </div>
                <div className="bg-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                  <p className="text-muted-foreground">4.8/5 client rating with hundreds of successful transactions</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}