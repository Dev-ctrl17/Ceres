import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building2, Key, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

const ServicesPage = () => {
  const services = [
    {
      icon: Building2,
      title: 'Property Sales',
      description: 'Expert guidance through the entire buying and selling process. From property search to closing, we ensure a seamless experience.',
      features: ['Property Search', 'Negotiation', 'Documentation', 'Closing Support']
    },
    {
      icon: Key,
      title: 'Property Leasing',
      description: 'Comprehensive leasing services for residential and commercial spaces. We connect property owners with qualified tenants.',
      features: ['Tenant Screening', 'Lease Management', 'Property Marketing', 'Rent Collection']
    },
    {
      icon: Briefcase,
      title: 'Property Management',
      description: 'Full-service management to protect and enhance your investment. We handle all aspects of property operations.',
      features: ['Maintenance', 'Financial Reporting', 'Tenant Relations', 'Legal Compliance']
    },
    {
      icon: Users,
      title: 'Investment Advisory',
      description: 'Strategic advice to maximize your real estate portfolio returns. Make informed decisions with our expert insights.',
      features: ['Market Analysis', 'Portfolio Planning', 'ROI Optimization', 'Risk Assessment']
    }
  ];

  return (
    <>
      <Head>
        <title>Real Estate Services in Nigeria | Luxury Properties Ltd</title>
        <meta name="description" content="Comprehensive real estate services in Nigeria including property sales, leasing, management, and investment advisory." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="Real Estate Services Nigeria" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Comprehensive real estate solutions tailored to meet your unique needs. From buying and selling to property management and investment advisory.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                End-to-end real estate services designed to deliver exceptional results for our clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <service.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Services</h2>
              <p className="text-lg text-muted-foreground">
                We deliver excellence through professionalism, innovation, and unwavering commitment to client satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">15+</div>
                <p className="text-muted-foreground">Years of Experience</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
                <p className="text-muted-foreground">Happy Clients</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Properties Sold</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let us help you achieve your real estate goals. Contact our team today for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
              <Link href="/agents">
                <Button variant="outline" size="lg">Meet Our Team</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ServicesPage;