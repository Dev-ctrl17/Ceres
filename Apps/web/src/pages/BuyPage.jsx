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
  const { properties, loading } = useProperties({ status: 'Available', purpose: 'Buy' });

  const buyingSteps = [
    { icon: Home, title: 'Browse Properties', description: 'Explore our verified listings and find your dream property' },
    { icon: Calculator, title: 'Calculate Mortgage', description: 'Use our calculator to plan your financing' },
    { icon: FileText, title: 'Submit Inquiry', description: 'Contact us with your requirements' },
    { icon: CheckCircle, title: 'Close Deal', description: 'Complete documentation and move in' },
  ];

  return (
    <>
      <Helmet>
        <title>Buy Property in Lagos & Abuja | Luxury Properties Ltd</title>
        <meta name="description" content="Find your dream property in Lagos, Abuja, and across Nigeria. Browse verified luxury homes, apartments, and land for sale with Luxury Properties Ltd. Expert buying guidance." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/buy" />
        <meta property="og:title" content="Buy Property in Lagos & Abuja | Luxury Properties Ltd" />
        <meta property="og:description" content="Browse our curated selection of verified luxury properties for sale in Lagos, Abuja, and across Nigeria. Expert guidance through every step." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/buy" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Buy Property in Lagos & Abuja | Luxury Properties Ltd" />
        <meta name="twitter:description" content="Browse verified luxury properties for sale across Nigeria. Expert buying guidance from Luxury Properties Ltd." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618484006-40ea0e34-24b2-418b-91c4-1f35fdd01ec8.jpeg"
              alt="Find your dream property" 
              className="w-full h-full object-cover hero-image"
              loading="eager"
              fetchpriority="high"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white hero-animate">Find Your Dream Property</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay">
              Browse our curated selection of verified properties and let our experts guide you through every step of the buying process.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">How to Buy with Us</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
              {buyingSteps.map((step, index) => (
                <Card key={index} className="text-center step-card">
                  <CardContent className="pt-6 xs:pt-6 sm:pt-8 pb-4 xs:pb-4 sm:pb-6">
                    <div className="w-12 xs:w-12 sm:w-14 md:w-16 h-12 xs:h-12 sm:h-14 md:h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 xs:mb-3 sm:mb-4">
                      <step.icon className="w-6 h-6 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h3 className="text-base xs:text-base sm:text-lg font-semibold mb-1 xs:mb-1 sm:mb-2">{step.title}</h3>
                    <p className="text-xs xs:text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center section-fade">Featured Properties for Sale</h2>
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {properties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} className="property-card" />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8 xs:mb-8 sm:mb-10 md:mb-12 section-fade">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Request a Consultation</h2>
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg leading-relaxed">
                Let us help you find the perfect property. Fill out the form below and our team will contact you.
              </p>
            </div>
            <Card className="consult-card">
              <CardContent className="p-4 xs:p-5 sm:p-6 md:p-8">
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