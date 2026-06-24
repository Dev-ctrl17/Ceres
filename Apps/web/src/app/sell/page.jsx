import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';

export const metadata = {
  title: 'Sell Your Property in Nigeria | Luxury Properties Ltd',
  description: 'Sell your luxury property in Lagos, Nigeria with Luxury Properties Ltd. Expert valuation, marketing, and negotiation to get you the best price.',
  alternates: {
    canonical: '/sell',
  },
  openGraph: {
    title: 'Sell Your Property | Luxury Properties Ltd',
    description: 'Expert guidance to sell your luxury property in Lagos, Abuja, and across Nigeria.',
    url: 'https://luxurypropertiesltd.com.ng/sell',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Sell Your Property in Nigeria',
  description: 'Expert guidance to sell your luxury property in Lagos, Nigeria',
  url: 'https://luxurypropertiesltd.com.ng/sell',
  provider: {
    '@type': 'RealEstateAgent',
    name: 'Luxury Properties Ltd',
    url: 'https://luxurypropertiesltd.com.ng',
  },
};

export default async function SellPage() {
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Sell Your Property</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Get the best value for your property with our expert guidance and marketing
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">How We Sell Your Property</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
              {[
                { title: 'Free Valuation', desc: 'Get a professional, no-obligation valuation of your property' },
                { title: 'Marketing', desc: 'Professional photography, listings, and targeted marketing' },
                { title: 'Viewings', desc: 'We coordinate and conduct all viewings with qualified buyers' },
                { title: 'Close Sale', desc: 'Expert negotiation and smooth closing process' },
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
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8 xs:mb-8 sm:mb-10 md:mb-12">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Request a Free Valuation</h2>
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg leading-relaxed">
                Fill out the form below and our team will contact you to schedule a free property valuation.
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