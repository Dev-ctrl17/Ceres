import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const RefundPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy — Luxury Properties Ltd</title>
        <meta name="description" content="Refund Policy for Luxury Properties Ltd. Learn about our refund and cancellation terms for real estate services." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/refund-policy" />
        <meta property="og:title" content="Refund Policy — Luxury Properties Ltd" />
        <meta property="og:description" content="Refund Policy for Luxury Properties Ltd. Learn about our refund and cancellation terms." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/refund-policy" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Refund Policy — Luxury Properties Ltd" />
        <meta name="twitter:description" content="Refund Policy for Luxury Properties Ltd." />
      </Helmet>

      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> June 2026<br />
              <strong>Effective Date:</strong> June 2026
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm">
                <strong>DRAFT — REQUIRES LEGAL REVIEW:</strong> This refund policy is a template drafted for Luxury Properties Ltd and is not legal advice. It should be reviewed and approved by a qualified legal professional before publication.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                This Refund Policy outlines the terms and conditions for refunds related to services provided by Luxury Properties Ltd. We are committed to transparency and fairness in all our financial transactions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Booking and Inspection Fees</h2>
              <p className="mb-4">
                For certain premium properties, we may require a booking or inspection fee to secure a viewing appointment or reserve a property temporarily. These fees are:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Non-refundable if the client fails to attend the scheduled viewing without 24 hours notice</li>
                <li>Refundable if we cancel the viewing with less than 24 hours notice</li>
                <li>Applicable toward transaction fees if the client proceeds with purchasing/renting the property</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Agency/Consultation Fees</h2>
              <p className="mb-4">
                Agency fees are only charged upon successful completion of a property transaction (sale or rental agreement). These fees are:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Non-refundable once the transaction agreement is signed by all parties</li>
                <li>Refundable only if we fail to deliver on explicitly agreed services</li>
                <li>Subject to the specific terms outlined in the agency agreement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Property Purchase Deposits</h2>
              <p className="mb-4">
                Deposits paid toward property purchases are governed by the purchase agreement. Generally:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Deposits are held in trust and applied toward the purchase price</li>
                <li>If the seller fails to deliver clear title, the deposit is fully refundable</li>
                <li>If the buyer withdraws without valid legal grounds, the deposit may be forfeited per the agreement terms</li>
                <li>Disputes will be resolved according to the purchase agreement and applicable Nigerian law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Refund Request Process</h2>
              <p className="mb-4">To request a refund:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Submit a written refund request to info@luxurypropertiesltd.com.ng</li>
                <li>Include your full name, contact details, transaction reference, and reason for refund</li>
                <li>Attach supporting documentation (receipts, agreements, correspondence)</li>
                <li>Allow 10-14 business days for review and processing</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Refund Timeline</h2>
              <p className="mb-4">
                Approved refunds will be processed within 10-14 business days. The time for the refund to appear in your account depends on your bank or payment provider, typically 3-7 additional business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Non-Refundable Items</h2>
              <p className="mb-4">The following are generally non-refundable:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Administrative and processing fees</li>
                <li>Legal fees paid to third-party solicitors</li>
                <li>Survey and inspection costs already incurred</li>
                <li>Marketing and advertising costs for property sellers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Dispute Resolution</h2>
              <p className="mb-4">
                If you are unsatisfied with our refund decision, please contact us to discuss the matter. We aim to resolve all disputes amicably. If a resolution cannot be reached, disputes will be referred to arbitration in accordance with Nigerian arbitration laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
              <p className="mb-4">
                We reserve the right to update this Refund Policy. Changes will be posted on this page with an updated effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
              <p className="mb-4">
                For refund requests or questions about this policy:
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

export default RefundPolicyPage;