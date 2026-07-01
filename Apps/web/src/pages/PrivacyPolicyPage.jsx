import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — Luxury Properties Ltd</title>
        <meta name="description" content="Privacy Policy for Luxury Properties Ltd. Learn how we collect, use, and protect your personal data in compliance with NDPA/NDPR." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/privacy-policy" />
        <meta property="og:title" content="Privacy Policy — Luxury Properties Ltd" />
        <meta property="og:description" content="Privacy Policy for Luxury Properties Ltd. Learn how we collect, use, and protect your personal data in compliance with NDPA/NDPR." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/privacy-policy" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Policy — Luxury Properties Ltd" />
        <meta name="twitter:description" content="Privacy Policy for Luxury Properties Ltd. Learn how we collect, use, and protect your personal data." />
      </Helmet>

      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> June 2026<br />
              <strong>Effective Date:</strong> June 2026
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm">
                <strong>DRAFT — REQUIRES LEGAL REVIEW:</strong> This privacy policy is a template drafted for Luxury Properties Ltd and is not legal advice. It should be reviewed and approved by a qualified legal professional familiar with Nigerian data protection law (NDPA/NDPR) before publication.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Luxury Properties Ltd ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website luxurypropertiesltd.com.ng (the "Site") or use our services.
              </p>
              <p className="mb-4">
                This policy complies with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and the <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
              <p className="mb-4">We may collect personally identifiable information such as:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Property preferences and requirements</li>
                <li>Messages and inquiries submitted through forms</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
              <p className="mb-4">When you visit our Site, we may automatically collect:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent on Site</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Respond to your inquiries and provide property information</li>
                <li>Schedule property viewings and consultations</li>
                <li>Send you relevant property listings and market updates (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Legal Basis for Processing (NDPA/NDPR)</h2>
              <p className="mb-4">We process your personal data under the following legal bases:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Consent:</strong> Where you have given clear consent for specific purposes (e.g., marketing emails)</li>
                <li><strong>Contract:</strong> Where processing is necessary to fulfill a contract with you (e.g., property viewing requests)</li>
                <li><strong>Legal Obligation:</strong> Where processing is required by Nigerian law</li>
                <li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate business interests, provided your rights are not overridden</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell or rent your personal information. We may share your data with:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our website, conducting business, or servicing you (e.g., email service providers, analytics platforms)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights, property, or safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security assessments</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Your Rights Under NDPA/NDPR</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
                <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, contact us at: <strong>info@luxurypropertiesltd.com.ng</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
              <p className="mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including satisfying legal, accounting, or reporting requirements. Typically, inquiry data is retained for 3 years unless you request earlier deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Cookies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience. For detailed information about the cookies we use, please see our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. International Data Transfers</h2>
              <p className="mb-4">
                Your data may be transferred to and processed in countries outside Nigeria. We ensure appropriate safeguards are in place to protect your data in accordance with NDPA/NDPR requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically. The "Last Updated" date at the top indicates when changes were made. We encourage you to review this policy regularly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
              <p className="mb-4">
                For questions about this Privacy Policy or to exercise your data protection rights:
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

export default PrivacyPolicyPage;