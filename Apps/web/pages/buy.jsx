import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Home, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const BuyPage = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'All our listings are thoroughly verified for legal compliance and quality assurance.'
    },
    {
      icon: TrendingUp,
      title: 'Best Market Prices',
      description: 'Get competitive prices with our market analysis and negotiation expertise.'
    },
    {
      icon: Home,
      title: 'Wide Selection',
      description: 'Access to exclusive luxury properties across Lagos, Abuja, and Port Harcourt.'
    }
  ];

  return (
    <>
      <Head>
        <title>Buy Luxury Properties in Nigeria | Luxury Properties Ltd</title>
        <meta name="description" content="Find your dream luxury property in Nigeria. Browse verified listings of premium homes, apartments, and commercial properties for sale." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="Luxury Properties for Sale in Nigeria" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Buy Your Dream Property
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover premium luxury properties across Nigeria. From waterfront estates to modern penthouses, find the perfect home that matches your lifestyle.
            </p>
            <Link href="/properties">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Browse Properties <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Buy With Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience a seamless property buying journey with Nigeria's leading luxury real estate agency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Properties for Sale</h2>
              <p className="text-lg text-muted-foreground">
                Handpicked luxury properties that represent the finest in Nigerian real estate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg" 
                    alt="Luxury Villa in Ikoyi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Luxury Villa in Ikoyi</h3>
                  <p className="text-muted-foreground mb-4">5 Bedroom Duplex with Pool</p>
                  <p className="text-2xl font-bold text-primary mb-4">₦850,000,000</p>
                  <Link href="/properties">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1781618469713-68bb7539-44b8-46bd-9f07-d4868e145147.jpeg" 
                    alt="Waterfront Estate in Lekki" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Waterfront Estate</h3>
                  <p className="text-muted-foreground mb-4">4 Bedroom Terrace with Ocean View</p>
                  <p className="text-2xl font-bold text-primary mb-4">₦650,000,000</p>
                  <Link href="/properties">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg" 
                    alt="Penthouse in Victoria Island" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Penthouse in VI</h3>
                  <p className="text-muted-foreground mb-4">3 Bedroom Luxury Apartment</p>
                  <p className="text-2xl font-bold text-primary mb-4">₦420,000,000</p>
                  <Link href="/properties">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/properties">
                <Button variant="outline" size="lg">
                  View All Properties <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Dream Home?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let our expert agents guide you through the entire buying process. Schedule a consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
              <Link href="/agents">
                <Button variant="outline" size="lg">Meet Our Agents</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BuyPage;