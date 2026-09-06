import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Award, Clock } from 'lucide-react';
import Link from 'next/link';

const SellPage = () => {
  const benefits = [
    {
      icon: Award,
      title: 'Expert Valuation',
      description: 'Get accurate property valuation from our experienced real estate professionals.'
    },
    {
      icon: TrendingUp,
      title: 'Best Market Price',
      description: 'We leverage market insights to ensure you get the best possible price for your property.'
    },
    {
      icon: Clock,
      title: 'Fast Sales',
      description: 'Our extensive network and marketing strategies ensure quick property sales.'
    }
  ];

  return (
    <>
      <Head>
        <title>Sell Your Property in Nigeria | Luxury Properties Ltd</title>
        <meta name="description" content="Sell your luxury property in Nigeria with Luxury Properties Ltd. Get expert valuation, professional marketing, and the best market price for your property." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838479-a916452b-9681-4b5f-8c03-3c48e3557b68.jpeg"
              alt="Sell Your Property in Nigeria" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Sell Your Property
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Get the best value for your property with Nigeria's leading luxury real estate agency. Professional service from valuation to closing.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Selling <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Sell With Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience a seamless property selling process with maximum returns on your investment.
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Selling Process</h2>
              <p className="text-lg text-muted-foreground">
                A simple, transparent process designed to get you the best value.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Consultation</h3>
                <p className="text-muted-foreground">Schedule a free consultation to discuss your property and goals.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Valuation</h3>
                <p className="text-muted-foreground">Get a comprehensive market analysis and property valuation.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Marketing</h3>
                <p className="text-muted-foreground">We market your property across multiple channels to reach qualified buyers.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3">Closing</h3>
                <p className="text-muted-foreground">We handle negotiations and paperwork to ensure a smooth closing.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Sell Your Property?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let our expert team help you get the best value for your property. Contact us today for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">Get Started</Button>
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

export default SellPage;