import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertySubmissionForm from '@/components/PropertySubmissionForm.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const SellPage = () => {
  const benefits = [
    'Professional property valuation',
    'Wide network of verified buyers',
    'Expert marketing and promotion',
    'Legal documentation support',
    'Fast and secure transactions',
    'No hidden fees',
  ];

  return (
    <>
      <Helmet>
        <title>Sell Your Property - Luxury Properties Ltd</title>
        <meta name="description" content="List your property with Luxury Properties Ltd and reach thousands of verified buyers." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618476695-08c4ab99-6c9e-4700-9de5-ed819f7d85bb.jpeg"
              alt="Sell Your Property" 
              className="w-full h-full object-cover"
  style={{ objectPosition: 'center', transform: 'scale(0.8)', transformOrigin: 'center' }}
  loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>Sell Your Property</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              List your property with us and connect with thousands of verified buyers across Nigeria.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why sell with us?</h2>
                <div className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-lg leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">How it works</h3>
                    <ol className="space-y-3 text-sm leading-relaxed">
                      <li>1. Submit your property details using the form</li>
                      <li>2. Our team reviews and verifies your listing</li>
                      <li>3. We market your property to our network</li>
                      <li>4. Connect with interested buyers</li>
                      <li>5. Close the deal with our support</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Submit Your Property</h2>
                  <PropertySubmissionForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default SellPage;