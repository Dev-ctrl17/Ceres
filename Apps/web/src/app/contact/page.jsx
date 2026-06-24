import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';

export const metadata = {
  title: 'Contact Us | Luxury Properties Ltd',
  description: 'Get in touch with Luxury Properties Ltd. Contact our team for property inquiries, consultations, and support.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Contact Us</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Get in touch with our team
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8 xs:mb-8 sm:mb-10 md:mb-12">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Send Us a Message</h2>
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg leading-relaxed">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">Contact Information</h2>
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-card p-6 rounded-2xl text-center">
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">+234 703 972 6375</p>
                <p className="text-muted-foreground">+234 913 798 1102</p>
              </div>
              <div className="bg-card p-6 rounded-2xl text-center">
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">info@luxurypropertiesltd.com.ng</p>
              </div>
              <div className="bg-card p-6 rounded-2xl text-center">
                <h3 className="text-xl font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">9 Alfa Sanni Street, Pedro, Gbagada, Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}