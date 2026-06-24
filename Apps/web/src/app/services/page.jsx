import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';

export const metadata = {
  title: 'Real Estate Services | Luxury Properties Ltd',
  description: 'Comprehensive real estate services including property sales, leasing, management, and investment advisory in Nigeria.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  const services = [
    { title: 'Property Sales', desc: 'Expert guidance through the entire buying and selling process', icon: '🏠' },
    { title: 'Property Leasing', desc: 'Comprehensive leasing services for residential and commercial spaces', icon: '🔑' },
    { title: 'Property Management', desc: 'Full-service management to protect and enhance your investment', icon: '⚙️' },
    { title: 'Investment Advisory', desc: 'Strategic advice to maximize your real estate portfolio returns', icon: '📈' },
    { title: 'Concierge Service', desc: 'White-glove, end-to-end property acquisition and management', icon: '🤵' },
    { title: 'Off-Market Access', desc: 'Exclusive access to premium properties not listed publicly', icon: '🔒' },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Our Services</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Comprehensive real estate solutions tailored to your needs
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="heading-lg mb-4">Get Started Today</h2>
            <p className="text-muted-foreground mb-8">Contact us to learn more about our services</p>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}