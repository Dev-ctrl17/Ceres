import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQPage = () => {
  const faqs = [
    {
      question: 'How do I schedule a property viewing?',
      answer: 'You can schedule a viewing by contacting us through our contact form, calling our office, or reaching out to one of our agents directly. We typically schedule viewings within 24-48 hours.'
    },
    {
      question: 'What documents do I need to buy a property?',
      answer: 'Required documents typically include: valid ID (international passport or national ID), proof of income, bank statements, and tax clearance certificate. For corporate buyers, additional documents like certificate of incorporation may be required.'
    },
    {
      question: 'Do you offer property management services?',
      answer: 'Yes, we offer comprehensive property management services including tenant screening, rent collection, maintenance, financial reporting, and legal compliance. Our team ensures your investment is well-maintained and profitable.'
    },
    {
      question: 'What areas do you cover in Nigeria?',
      answer: 'We primarily operate in Lagos (Ikoyi, Victoria Island, Lekki, Banana Island), Abuja (Asokoro, Maitama, Wuse), and Port Harcourt. We also have properties in other major cities across Nigeria.'
    },
    {
      question: 'How do I list my property with Luxury Properties Ltd?',
      answer: 'You can list your property by contacting us through our website, calling our office, or submitting a property submission form. Our team will guide you through the entire process from valuation to closing.'
    },
    {
      question: 'What are your commission rates?',
      answer: 'Our commission rates vary depending on the type of property and service required. For sales, we typically charge 5-10% of the sale price. For rentals, it\'s usually 1-2 months\' rent. Contact us for a detailed quote.'
    },
    {
      question: 'Are all your properties verified?',
      answer: 'Yes, all our properties undergo rigorous verification including legal title checks, physical inspections, and documentation review. We ensure all properties meet our quality and compliance standards.'
    },
    {
      question: 'Do you assist with mortgage arrangements?',
      answer: 'Yes, we work with several financial institutions to help our clients secure mortgage financing. Our team can guide you through the mortgage application process and connect you with trusted lenders.'
    }
  ];

  return (
    <>
      <Head>
        <title>FAQ - Frequently Asked Questions | Luxury Properties Ltd</title>
        <meta name="description" content="Find answers to frequently asked questions about buying, selling, and renting properties in Nigeria with Luxury Properties Ltd." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="FAQ - Luxury Properties Ltd" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Find answers to common questions about our real estate services.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 text-center bg-muted p-8 md:p-12 rounded-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Please contact our friendly team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                  <Button size="lg">Contact Us</Button>
                </a>
                <a href="tel:+2348012345678">
                  <Button variant="outline" size="lg">Call Us</Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQPage;