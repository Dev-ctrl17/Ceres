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
        <title>Contact Us - Luxury Properties Ltd</title>
        <meta name="description" content="Get in touch with Luxury Properties Ltd. We're here to help with all your real estate needs." />
      </Helmet>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        .hero-animate { animation: fadeInUp 1s ease-out forwards; }
        .hero-animate-delay { animation: fadeInUp 1s ease-out 0.3s forwards; opacity: 0; }
        .hero-image { animation: fadeIn 1.5s ease-out forwards; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
        .hero-image:hover { transform: scale(1.05); }
        .hero-section { animation: fadeIn 0.5s ease-out; }
        .contact-card { opacity: 0; animation: slideInLeft 0.6s ease-out forwards; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease; }
        .contact-card:hover { transform: translateX(8px) scale(1.02); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        .contact-card:nth-child(1) { animation-delay: 0.1s; }
        .contact-card:nth-child(2) { animation-delay: 0.2s; }
        .contact-card:nth-child(3) { animation-delay: 0.3s; }
        .contact-card:nth-child(4) { animation-delay: 0.4s; }
        .form-card { animation: scaleIn 0.8s ease-out forwards; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease; }
        .form-card:hover { transform: translateY(-10px) scale(1.01); box-shadow: 0 25px 50px rgba(0,0,0,0.12); }
        .section-fade { opacity: 0; animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781315550242-096ff39c-0b74-48d1-afcd-d1bccdb33620.png"
              alt="Contact Us" 
              className="w-full h-full object-cover hero-image"
              loading="lazy"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white hero-animate" style={{ letterSpacing: '-0.02em' }}>Contact Us</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay">
              Have questions? We're here to help. Reach out to us through any of the channels below.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                <div className="space-y-6 mb-8">
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
                        <p className="text-muted-foreground">info@luxurypropertiesltd.com</p>
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