import React from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import {
  Building2,
  Key,
  TrendingUp,
  Home,
  Briefcase,
  Users,
  Settings,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ServicesPage = () => {
  const services = [
    {
      icon: Building2,
      title: "Real Estate Brokerage",
      description:
        "Professional brokerage services connecting buyers, sellers, and renters with verified properties across Nigeria.",
    },
    {
      icon: Key,
      title: "Property Sales",
      description:
        "Expert guidance through the entire property sales process, from valuation to closing the deal.",
    },
    {
      icon: Home,
      title: "Property Leasing",
      description:
        "Comprehensive leasing services for residential and commercial properties with flexible terms.",
    },
    {
      icon: TrendingUp,
      title: "Luxury Property Marketing",
      description:
        "Specialized marketing strategies for high-end properties to reach premium buyers.",
    },
    {
      icon: Briefcase,
      title: "Shortlet Management",
      description:
        "Full-service management of short-term rental properties with guaranteed returns.",
    },
    {
      icon: Users,
      title: "Investment Advisory",
      description:
        "Strategic real estate investment advice to maximize returns and minimize risks.",
    },
    {
      icon: Settings,
      title: "Property Management",
      description:
        "Complete property management services including maintenance, tenant relations, and rent collection.",
    },
    {
      icon: MapPin,
      title: "Land Sales",
      description:
        "Verified land sales with proper documentation and legal support for secure transactions.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Our Services - Luxury Properties Ltd</title>
        <meta
          name="description"
          content="Comprehensive real estate services including sales, leasing, management, and investment advisory."
        />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781619622358-2b415786-e866-4142-ba9a-0fc97ffe39fb.jpeg"
              alt="Our Services" 
              className="w-full h-full object-cover"
  style={{ objectPosition: 'center', transform: 'scale(0.8)', transformOrigin: 'center' }}
  loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Our Services
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Comprehensive real estate solutions tailored to meet your property
              needs.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-lg mb-8 opacity-90 leading-relaxed">
              Contact us today to discuss how we can help you achieve your real
              estate goals.
            </p>
            <a
              href="/contact"
              className="inline-block bg-background text-foreground px-8 py-3 rounded-lg font-medium hover:bg-background/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ServicesPage;
