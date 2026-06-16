import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Calculator, Home, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const BuyPage = () => {
  const { properties, loading } = useProperties({ status: 'Available' });

  const buyingSteps = [
    { icon: Home, title: 'Browse Properties', description: 'Explore our verified listings and find your dream property' },
    { icon: Calculator, title: 'Calculate Mortgage', description: 'Use our calculator to plan your financing' },
    { icon: FileText, title: 'Submit Inquiry', description: 'Contact us with your requirements' },
    { icon: CheckCircle, title: 'Close Deal', description: 'Complete documentation and move in' },
  ];

  return (
    <>
      <Helmet>
        <title>Buy Property - Luxury Properties Ltd</title>
        <meta name="description" content="Find your dream property with Luxury Properties Ltd. Browse verified listings and expert guidance." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618484006-40ea0e34-24b2-418b-91c4-1f35fdd01ec8.jpeg"
              alt="Find your dream property" 
                 className="w-full h-full object-cover"
    loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>Find Your Dream Property</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Browse our curated selection of verified properties and let our experts guide you through every step of the buying process.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">How to Buy with Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {buyingSteps.map((step, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Featured Properties for Sale</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Request a Consultation</h2>
              <p className="text-muted-foreground leading-relaxed">
                Let us help you find the perfect property. Fill out the form below and our team will contact you.
              </p>
            </div>
            <Card>
              <CardContent className="p-8">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BuyPage;