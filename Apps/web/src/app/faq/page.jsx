import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const metadata = {
  title: 'Frequently Asked Questions | Luxury Properties Ltd',
  description: 'Find answers to common questions about buying, selling, and renting luxury properties in Nigeria.',
  alternates: { canonical: '/faq' },
};

const faqs = [
  {
    question: 'What is the most expensive neighborhood in Lagos?',
    answer: 'Banana Island is the most expensive neighborhood in Lagos, with property prices ranging from ₦200M to ₦5B+. Other premium areas include Ikoyi, Victoria Island, and Lekki Phase 1.',
  },
  {
    question: 'Can foreigners buy property in Nigeria?',
    answer: 'Yes, foreigners can buy property in Nigeria. Requirements include a valid passport, Tax Identification Number (TIN), and a local bank account. We assist diaspora clients with the entire process.',
  },
  {
    question: 'What is the best area for expats in Lagos?',
    answer: 'Victoria Island, Ikoyi, and Lekki Phase 1 are the best areas for expats. These neighborhoods offer excellent security, international schools, healthcare facilities, and modern amenities.',
  },
  {
    question: 'What is the ROI for Lagos luxury real estate?',
    answer: 'Lagos luxury real estate offers 18-35% annual capital appreciation plus 7-9% rental yields. Prime areas like Banana Island and Ikoyi consistently outperform other markets.',
  },
  {
    question: 'How do I access off-market properties?',
    answer: 'Partner with a luxury agency like Luxury Properties Ltd. We have exclusive access to pocket listings and off-market properties not available on public portals. Contact us to learn more.',
  },
  {
    question: 'What documents are needed to buy property in Nigeria?',
    answer: 'Key documents include: Certificate of Occupancy (C of O) or Governor\'s Consent, valid ID, passport photos, tax clearance certificate, and proof of income. We guide you through the entire documentation process.',
  },
  {
    question: 'How long does the property buying process take?',
    answer: 'The typical buying process takes 4-8 weeks from offer acceptance to completion. This includes property inspection, due diligence, document verification, and payment processing.',
  },
  {
    question: 'Do you offer property management services?',
    answer: 'Yes, we offer comprehensive property management services including tenant screening, rent collection, maintenance, and regular property inspections.',
  },
];

function FAQItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <span className="text-lg font-semibold pr-4">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[50vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 text-white">Frequently Asked Questions</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about luxury real estate in Nigeria
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="heading-lg mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}