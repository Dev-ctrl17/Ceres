import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';

const EPANPage = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Higher Earnings',
      description: 'Access premium listings with better commission splits and higher earning potential.'
    },
    {
      icon: Clock,
      title: 'Fast Closings',
      description: 'Streamlined processes to help you close deals faster and more efficiently.'
    },
    {
      icon: Shield,
      title: 'Verified Inventory',
      description: 'Sell with confidence knowing every property is thoroughly vetted and verified.'
    },
    {
      icon: Users,
      title: 'Elite Network',
      description: 'Collaborate with top-performing agents and industry leaders nationwide.'
    }
  ];

  const features = [
    'Access to exclusive off-market listings',
    'Competitive commission structure',
    'Professional training and certification',
    'Marketing and lead generation support',
    'Advanced technology tools',
    'Dedicated mentorship program',
    'Networking events and workshops',
    'Legal and administrative support'
  ];

  return (
    <>
      <Head>
        <title>EPAN - Estate Professionals Association Network | Luxury Properties Ltd</title>
        <meta name="description" content="Join EPAN, the Estate Professionals Association Network. Access exclusive listings, competitive commissions, and professional growth opportunities." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="EPAN - Estate Professionals Association Network" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Join EPAN
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
              The Estate Professionals Association Network - Your gateway to a successful real estate career in Nigeria.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Become a Member <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join EPAN?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elevate your real estate career with Nigeria's most prestigious professional network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get</h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive benefits designed to help you succeed in the real estate industry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                  <p className="text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Career?</h2>
                <p className="text-lg text-muted-foreground">
                  Join hundreds of successful real estate professionals who are part of the EPAN network.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-muted-foreground">Active Members</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">₦2B+</div>
                  <p className="text-muted-foreground">Properties Sold</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">98%</div>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg">Apply Now</Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-secondary text-secondary-foreground">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Membership Requirements</h2>
            <p className="text-lg opacity-80 mb-8">
              We welcome dedicated real estate professionals who are committed to excellence and ethical practices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="font-semibold text-xl mb-3">For Agents</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Valid real estate license or certification</li>
                  <li>• Minimum 1 year of experience</li>
                  <li>• Clean professional record</li>
                  <li>• Commitment to continuing education</li>
                </ul>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="font-semibold text-xl mb-3">For Brokers</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Licensed real estate broker</li>
                  <li>• Minimum 3 years of experience</li>
                  <li>• Active practice in Nigeria</li>
                  <li>• Professional references</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default EPANPage;