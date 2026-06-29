import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const TermsConditionsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions — Luxury Properties Ltd</title>
        <meta name="description" content="Terms and Conditions for using Luxury Properties Ltd services. Read our terms for property listings, enquiries, and website usage." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/terms-conditions" />
      </Helmet>

      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> June 2026<br />
              <strong>Effective Date:</strong> June 2026
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm">
                <strong>DRAFT — REQUIRES LEGAL REVIEW:</strong> These terms and conditions are a template drafted for Luxury Properties Ltd and are not legal advice. They should be reviewed and approved by a qualified legal professional before publication.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                By accessing or using the website luxurypropertiesltd.com.ng (the "Site") and the services provided by Luxury Properties Ltd ("we," "our," or "us"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree to these Terms, please do not use our Site or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Services Description</h2>
              <p className="mb-4">
                Luxury Properties Ltd is a real estate agency providing:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Property listing services for sale and rent</li>
                <li>Property search and matching services</li>
                <li>Real estate advisory and consultation</li>
                <li>Property viewing arrangements</li>
                <li>Concierge real estate services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate and complete information when submitting enquiries</li>
                <li>Use the Site only for lawful purposes</li>
                <li>Not attempt to gain unauthorized access to any part of the Site</li>
                <li>Not interfere with or disrupt the Site's functionality</li>
                <li>Not use the Site to transmit any malicious code or harmful content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Property Listings</h2>
              <p className="mb-4">
                While we strive to provide accurate property information, we do not guarantee the accuracy, completeness, or reliability of any property listing. All properties are subject to availability and price changes. We recommend independent verification of property details before making any financial commitments.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
              <p className="mb-4">
                All content on this Site, including text, graphics, logos, images, and software, is the property of Luxury Properties Ltd or its content suppliers and is protected by Nigerian and international copyright laws. Unauthorized use of this content is prohibited.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="mb-4">
                To the fullest extent permitted by law, Luxury Properties Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site or services. Our total liability shall not exceed the amount paid by you for the specific service giving rise to the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Third-Party Links</h2>
              <p className="mb-4">
                Our Site may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these external sites. We encourage you to review the terms and privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site following any changes indicates your acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms & Conditions:
              </p>
              <address className="not-italic">
                <strong>Luxury Properties Ltd</strong><br />
                Email: <a href="mailto:info@luxurypropertiesltd.com.ng" className="text-primary hover:underline">info@luxurypropertiesltd.com.ng</a><br />
                Phone: <a href="tel:+2349056201176" className="text-primary hover:underline">+234 905 620 1176</a><br />
                Address: Lagos, Nigeria
              </address>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TermsConditionsPage;