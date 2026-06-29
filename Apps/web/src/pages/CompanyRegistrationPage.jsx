import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const CompanyRegistrationPage = () => {
  return (
    <>
      <Helmet>
        <title>Company Registration — Luxury Properties Ltd</title>
        <meta name="description" content="Luxury Properties Ltd company registration details, CAC number, and official business information." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/company-registration" />
      </Helmet>

      <Header />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-8">Company Registration Details</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> June 2026
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-sm">
                <strong>Verified Registration:</strong> Luxury Properties Ltd is a legally registered company under the Companies and Allied Matters Act 2020, Nigeria.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Company Information</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 font-semibold">Company Name</td>
                      <td className="py-3">Luxury Properties Ltd</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Registration Number</td>
                      <td className="py-3">9601729</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Date of Incorporation</td>
                      <td className="py-3">9 June 2026</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Legal Status</td>
                      <td className="py-3">Incorporated under the Companies and Allied Matters Act 2020, Nigeria</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Company Type</td>
                      <td className="py-3">Private Limited Liability Company</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Phone</td>
                      <td className="py-3">+234 905 620 1176</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">Email</td>
                      <td className="py-3">info@luxurypropertiesltd.com.ng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
              <p className="mb-4">
                Luxury Properties Ltd is a registered real estate company specializing in premium property marketing, long-lease investment opportunities, property acquisition, sales, leasing, and advisory services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Vision & Mission</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary">Vision</h3>
                  <p className="text-muted-foreground">
                    To become one of Nigeria's most trusted and innovative real estate companies.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary">Mission</h3>
                  <p className="text-muted-foreground">
                    To provide reliable, profitable, and stress-free real estate solutions through integrity, innovation, and excellent customer service.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Property Sales</h3>
                  <p className="text-sm text-muted-foreground">Premium property sales across Lagos, Abuja, and Port Harcourt</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Long-Lease Investments</h3>
                  <p className="text-sm text-muted-foreground">Lucrative long-lease investment opportunities</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Property Marketing</h3>
                  <p className="text-sm text-muted-foreground">Strategic marketing for property sellers</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Leasing & Placement</h3>
                  <p className="text-sm text-muted-foreground">Tenant placement and property leasing services</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Real Estate Consultancy</h3>
                  <p className="text-sm text-muted-foreground">Expert advice on property investments</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Property Sourcing</h3>
                  <p className="text-sm text-muted-foreground">Finding the perfect property for your needs</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Transaction Management</h3>
                  <p className="text-sm text-muted-foreground">End-to-end transaction handling</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Investment Advisory</h3>
                  <p className="text-sm text-muted-foreground">Strategic investment guidance</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Registered and legally incorporated company</li>
                <li>Professional and transparent transactions</li>
                <li>Carefully selected investment opportunities</li>
                <li>Client-focused service delivery</li>
                <li>Strong commitment to integrity and excellence</li>
                <li>Dedicated support from inquiry to completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Core Values</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary">I</span>
                  </div>
                  <p className="font-semibold">Integrity</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary">E</span>
                  </div>
                  <p className="font-semibold">Excellence</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary">P</span>
                  </div>
                  <p className="font-semibold">Professionalism</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary">I</span>
                  </div>
                  <p className="font-semibold">Innovation</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary">C</span>
                  </div>
                  <p className="font-semibold">Customer Satisfaction</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Verification</h2>
              <p className="mb-4">
                You can verify our company registration by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Visiting the <a href="https://www.cac.gov.ng" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Corporate Affairs Commission website</a></li>
                <li>Contacting us at <a href="mailto:info@luxurypropertiesltd.com.ng" className="text-primary hover:underline">info@luxurypropertiesltd.com.ng</a> for a copy of our CAC certificate</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="mb-4">
                For verification or official correspondence:
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

export default CompanyRegistrationPage;