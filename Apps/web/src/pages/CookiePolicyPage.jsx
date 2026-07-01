import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const CookiePolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy — Luxury Properties Ltd</title>
        <meta name="description" content="Cookie Policy for Luxury Properties Ltd. Learn about how we use cookies and tracking technologies on our website." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/cookie-policy" />
        <meta property="og:title" content="Cookie Policy — Luxury Properties Ltd" />
        <meta property="og:description" content="Cookie Policy for Luxury Properties Ltd. Learn about how we use cookies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/cookie-policy" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cookie Policy — Luxury Properties Ltd" />
        <meta name="twitter:description" content="Cookie Policy for Luxury Properties Ltd." />
      </Helmet>

      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> June 2026<br />
              <strong>Effective Date:</strong> June 2026
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm">
                <strong>DRAFT — REQUIRES LEGAL REVIEW:</strong> This cookie policy is a template drafted for Luxury Properties Ltd and is not legal advice. It should be reviewed and approved by a qualified legal professional familiar with Nigerian and EU/UK data protection laws before publication.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. What Are Cookies</h2>
              <p className="mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, as well as to provide reporting information to the website owners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
              <p className="mb-4">
                We use cookies for several purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Ensuring the website functions properly</li>
                <li>Remembering your preferences and settings</li>
                <li>Understanding how you use our website</li>
                <li>Improving our website and services</li>
                <li>Personalizing your experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold mb-3">3.1 Strictly Necessary Cookies</h3>
              <p className="mb-4">These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and account access. The website cannot operate properly without these cookies.</p>
              <table className="w-full mb-6 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
                    <th className="border border-gray-300 p-2 text-left">Purpose</th>
                    <th className="border border-gray-300 p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">session_id</td>
                    <td className="border border-gray-300 p-2">Maintains user session state</td>
                    <td className="border border-gray-300 p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">csrf_token</td>
                    <td className="border border-gray-300 p-2">Security - prevents CSRF attacks</td>
                    <td className="border border-gray-300 p-2">Session</td>
                  </tr>
                </tbody>
              </table>

              <h3 className="text-xl font-semibold mb-3">3.2 Performance and Analytics Cookies</h3>
              <p className="mb-4">These cookies collect information about how visitors use our website, such as which pages are visited most often and if visitors receive error messages. All information collected is aggregated and anonymous.</p>
              <table className="w-full mb-6 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Cookie Name</th>
                    <th className="border border-gray-300 p-2 text-left">Purpose</th>
                    <th className="border border-gray-300 p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">_ga, _gid, _gat</td>
                    <td className="border border-gray-300 p-2">Google Analytics - distinguishes users and throttles request rate</td>
                    <td className="border border-gray-300 p-2">2 years / 24 hours</td>
                  </tr>
                </tbody>
              </table>

              <h3 className="text-xl font-semibold mb-3">3.3 Functionality Cookies</h3>
              <p className="mb-4">These cookies allow the website to remember choices you make (such as your language preference or the region you are in) and provide enhanced, more personalized features.</p>

              <h3 className="text-xl font-semibold mb-3">3.4 Targeting/Advertising Cookies</h3>
              <p className="mb-4">These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and to measure the effectiveness of advertising campaigns.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
              <p className="mb-4">
                Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. These may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> For website traffic analysis</li>
                <li><strong>Google Maps:</strong> For property location displays</li>
                <li><strong>Social Media Platforms:</strong> For social sharing and integration</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Managing Your Cookie Preferences</h2>
              <p className="mb-4">
                You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Using our cookie consent banner (when available)</li>
                <li>Updating your browser settings to refuse or delete cookies</li>
                <li>Using browser extensions that block cookies</li>
              </ul>
              <p className="mb-4">
                Please note that disabling certain cookies may impact the functionality of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Browser Instructions</h2>
              <p className="mb-4">To manage cookies in your browser:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Updates to This Policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business operations. Any changes will be posted on this page with an updated effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
              <p className="mb-4">
                If you have questions about our use of cookies or this policy:
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

export default CookiePolicyPage;