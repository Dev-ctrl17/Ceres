import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const OfficeLocationsPage = () => {
  return (
    <>
      <Helmet>
        <title>Office Locations — Luxury Properties Ltd</title>
        <meta name="description" content="Visit our offices across Nigeria. Find Luxury Properties Ltd locations, contact details, and office hours in Lagos, Abuja, and Port Harcourt." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/office-locations" />
      </Helmet>

      <Header />
      
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Our Office Locations</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-muted-foreground">
              Visit us at any of our office locations across Nigeria. Our team is ready to assist you with all your real estate needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Lagos Office */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Lagos Head Office</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start">
                    <span className="font-semibold text-foreground mr-2">Address:</span>
                    <span>Segun Olusesi Close, Lekki Conservation Centre Road, Lekki, Lagos</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-2">Phone:</span>
                    <a href="tel:+2349056201176" className="text-primary hover:underline">+234 905 620 1176</a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-2">Email:</span>
                    <a href="mailto:lagos@luxurypropertiesltd.com.ng" className="text-primary hover:underline">lagos@luxurypropertiesltd.com.ng</a>
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold text-foreground mr-2">Hours:</span>
                    <span>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 4:00 PM<br />Sunday: Closed</span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7298!2d3.5354166!3d6.44222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf71d683acdff%3A0xaa778c495125f698!5e0!3m2!1sen!2sng!4v1710000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Lagos Office Location"
                ></iframe>
              </div>
            </div>

            {/* Abuja Office */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Abuja Office</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start">
                    <span className="font-semibold text-foreground mr-2">Address:</span>
                    <span>[Abuja office address - to be updated]</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-2">Phone:</span>
                    <a href="tel:+2349056201177" className="text-primary hover:underline">+234 905 620 1177</a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-2">Email:</span>
                    <a href="mailto:abuja@luxurypropertiesltd.com.ng" className="text-primary hover:underline">abuja@luxurypropertiesltd.com.ng</a>
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold text-foreground mr-2">Hours:</span>
                    <span>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 4:00 PM<br />Sunday: Closed</span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.1234!2d7.4898!3d9.0765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMzUnMjguMyJOIDPCsDM0JzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Abuja Office Location"
                ></iframe>
              </div>
            </div>

            {/* Port Harcourt Office */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Port Harcourt Office</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start">
                    <span className="font-semibold text-foreground mr-2">Address:</span>
                    <span>[Port Harcourt office address - to be updated]</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-2">Phone:</span>
                    <a href="tel:+2349056201178" className="text-primary hover:underline">+234 905 620 1178</a>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-2">Email:</span>
                    <a href="mailto:ph@luxurypropertiesltd.com.ng" className="text-primary hover:underline">ph@luxurypropertiesltd.com.ng</a>
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold text-foreground mr-2">Hours:</span>
                    <span>Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 4:00 PM<br />Sunday: Closed</span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.5678!2d7.0123!3d4.8156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNCDCbDQ1JzE4LjMiRiA3wrAyNyc0MC4wIlc!5e0!3m2!1sen!2sng!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Port Harcourt Office Location"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-4">
              Can't visit us in person? We're here to help online. Contact us through any of the following channels:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a href="tel:+2349056201176" className="text-primary hover:underline">+234 905 620 1176</a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:info@luxurypropertiesltd.com.ng" className="text-primary hover:underline">info@luxurypropertiesltd.com.ng</a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <a href="https://wa.me/2347039726375" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+234 703 972 6375</a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Find Us on Google</h2>
            <p className="mb-4">
              Visit our Google Business Profile for reviews, photos, and more information:
            </p>
            <a 
              href="https://www.google.com/maps/place/Luxury+Properties+Ltd,+Segun+Olusesi+Close,+Lekki+Conservation+Centre+Road,+Lekki/@6.5150915,3.1679267,11z/data=!4m5!3m4!1s0x103bf71d683acdff:0xaa778c495125f698!8m2!3d6.44222!4d3.5354166?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              View on Google Maps
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OfficeLocationsPage;