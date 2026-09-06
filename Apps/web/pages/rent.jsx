import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Key, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

const RentPage = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'All rental properties are verified for quality and legal compliance.'
    },
    {
      icon: Clock,
      title: 'Quick Process',
      description: 'Streamlined rental process with fast approvals and move-in ready properties.'
    },
    {
      icon: Key,
      title: 'Wide Range',
      description: 'From luxury apartments to commercial spaces, find the perfect rental.'
    }
  ];

  return (
    <>
      <Head>
        <title>Rent Luxury Properties in Nigeria | Luxury Properties Ltd</title>
        <meta name="description" content="Find premium rental properties in Nigeria. Browse luxury apartments, houses, and commercial spaces for rent." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838490-d908b15e-9e31-41e6-88e8-06f7bef05dd2.jpeg"
              alt="Luxury Properties for Rent in Nigeria" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Rent Your Perfect Space
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover premium rental properties across Nigeria. From luxury apartments to executive offices, find your ideal space.
            </p>
            <Link href="/properties">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Browse Rentals <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Rent With Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience hassle-free property rental with Nigeria's trusted real estate partner.
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Rental Properties</h2>
              <p className="text-lg text-muted-foreground">
                Premium rental properties available now.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg" 
                    alt="Luxury Apartment in Ikoyi" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Luxury Apartment in Ikoyi</h3>
                  <p className="text-muted-foreground mb-4">3 Bedroom Fully Furnished</p>
                  <p className="text-2xl font-bold text-primary mb-4">₦25,000,000/year</p>
                  <Link href="/properties">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1781618469713-68bb7539-44b8-46bd-9f07-d4868e145147.jpeg" 
                    alt="Office Space in Victoria Island" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Executive Office Space</h3>
                  <p className="text-muted-foreground mb-4">Commercial Space in VI</p>
                  <p className="text-2xl font-bold text-primary mb-4">₦45,000,000/year</p>
                  <Link href="/properties">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img 
                    src="https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg" 
                    alt="Shortlet in Lekki" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Lekki Shortlet</h3>
                  <p className="text-muted-foreground mb-4">2 Bedroom Serviced Apartment</p>
                  <p className="text-2xl font-bold text-primary mb-4">₦2,500,000/month</p>
                  <Link href="/properties">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/properties">
                <Button variant="outline" size="lg">
                  View All Rentals <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Rental?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let us help you find the perfect rental property. Contact our team today.
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

export default RentPage;