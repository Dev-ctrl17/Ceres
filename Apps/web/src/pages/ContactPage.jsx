import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - Luxury Properties Ltd | Premium Real Estate Lagos</title>
        <meta name="description" content="Get in touch with Luxury Properties Ltd. Contact our Lagos office for luxury real estate inquiries, property viewings, and expert advisory services." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/contact" />
        <meta property="og:title" content="Contact Us - Luxury Properties Ltd | Premium Real Estate Lagos" />
        <meta property="og:description" content="Get in touch with Luxury Properties Ltd for all your luxury real estate needs in Lagos and across Nigeria." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/contact" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact Us - Luxury Properties Ltd | Premium Real Estate Lagos" />
        <meta name="twitter:description" content="Contact Luxury Properties Ltd for luxury real estate inquiries." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781315550242-096ff39c-0b74-48d1-afcd-d1bccdb33620.png"
              alt="Contact Us" 
              className="w-full h-full object-cover hero-image"
              loading="eager"
              fetchpriority="high"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white hero-animate">Contact Us</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay">
              Have questions? We're here to help. Reach out to us through any of the channels below.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 sm:gap-12">
              <div>
                <h2 className="heading-lg mb-6 xs:mb-6 sm:mb-8">Get in Touch</h2>
                <div className="space-y-4 xs:space-y-4 sm:space-y-5 md:space-y-6 mb-6 xs:mb-6 sm:mb-8">
                  <Card>
                    <CardContent className="p-6 flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Telephone</h3>
                        <p className="text-muted-foreground">+234 703 972 6375</p>
                        <p className="text-muted-foreground">+234 913 798 1102</p>
                        <p className="text-muted-foreground">+234 706 928 6610</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-muted-foreground">info@luxurypropertiesltd.com.ng</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Head Office Address</h3>
                        <p className="text-muted-foreground">
                          9 Alfa Sanni Street, Pedro, Gbagada, Lagos, Nigeria
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">WhatsApp</h3>
                        <a
                          href="https://wa.me/2347039726375"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Chat with us on WhatsApp
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=3.3700%2C6.5400%2C3.3900%2C6.5600&layer=mapnik&marker=6.5500%2C3.3800"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Office Location"
                  ></iframe>
                </div>
              </div>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <ContactForm />
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

export default ContactPage;