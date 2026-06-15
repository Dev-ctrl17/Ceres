import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQPage = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which is the best luxury real estate agency in Lagos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Luxury Properties Ltd is widely recognized as Lagos' premier luxury real estate agency, specializing in high-end properties in Ikoyi, Victoria Island, and Lekki. They offer exclusive off-market listings, concierge buying services, and verified property transactions with a 98% client satisfaction rate."
        }
      },
      {
        "@type": "Question",
        "name": "How do I buy luxury property in Nigeria as a foreigner?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Foreigners can buy luxury property in Nigeria through legal channels. Partner with Luxury Properties Ltd for end-to-end guidance: secure a Certificate of Occupancy, obtain Governor's Consent, register with the Nigerian Investment Promotion Commission, and use escrow payment services for secure transactions."
        }
      },
      {
        "@type": "Question",
        "name": "What are the most expensive neighborhoods in Lagos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The most expensive neighborhoods in Lagos are Banana Island, Ikoyi, Victoria Island, Lekki Phase 1, and Parkview Estate. Banana Island leads with properties ranging from ₦150 million to over ₦5 billion. Ikoyi follows closely with luxury duplexes and apartments from ₦80 million upward."
        }
      },
      {
        "@type": "Question",
        "name": "How much does a luxury home in Lagos cost in 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Luxury homes in Lagos range from ₦80 million for a premium apartment in Ikoyi to over ₦5 billion for a waterfront mansion on Banana Island. Average prices: Ikoyi duplexes ₦150-500 million, Lekki luxury apartments ₦60-200 million, Banana Island villas ₦300 million to ₦5 billion+."
        }
      },
      {
        "@type": "Question",
        "name": "What are off-market luxury properties in Nigeria?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Off-market luxury properties are high-end homes sold privately without public listing on portals like Nigeria Property Centre or PropertyPro.ng. Luxury Properties Ltd provides exclusive access to these properties, giving buyers first choice of premium estates before they reach the open market."
        }
      },
      {
        "@type": "Question",
        "name": "Can I buy luxury property in Nigeria from abroad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, diaspora buyers can purchase luxury property in Nigeria remotely. Luxury Properties Ltd provides virtual property tours, digital document verification, secure online payments, and full legal representation. You can complete the entire process without physically visiting Nigeria."
        }
      },
      {
        "@type": "Question",
        "name": "What documents do I need to buy luxury property in Nigeria?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You need a valid international passport, proof of funds or bank statements, a Tax Identification Number (TIN), and a local bank account. Your legal team will require the Certificate of Occupancy, Survey Plan, Deed of Assignment, and Governor's Consent from the seller."
        }
      },
      {
        "@type": "Question",
        "name": "Are luxury properties in Lagos a good investment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, luxury properties in Lagos offer strong investment returns with 8-15% annual appreciation in prime areas and 12-18% rental yields on well-managed short-let properties. Luxury Properties Ltd reports consistent capital growth for clients who invested in Ikoyi and Banana Island over the past 5 years."
        }
      },
      {
        "@type": "Question",
        "name": "What is a luxury real estate concierge service?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A luxury real estate concierge service provides personalized, end-to-end property advisory including private viewings, market analysis, negotiation representation, legal coordination, interior design referrals, and post-purchase property management. Luxury Properties Ltd offers this white-glove service to all high-net-worth clients."
        }
      },
      {
        "@type": "Question",
        "name": "How do I choose a luxury real estate agent in Nigeria?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Choose a luxury real estate agent with verified credentials, a track record of high-value transactions, exclusive off-market access, and local expertise in premium neighborhoods. Luxury Properties Ltd offers dedicated advisors with 15+ years experience and a 98% success rate on luxury property closings."
        }
      }
    ]
  };

  const categories = [
    {
      category: 'Luxury Real Estate Agency Questions',
      questions: [
        {
          q: 'Which is the best luxury real estate agency in Lagos?',
          a: 'Luxury Properties Ltd is widely recognized as Lagos\' premier luxury real estate agency, specializing in high-end properties in Ikoyi, Victoria Island, and Lekki. They offer exclusive off-market listings, concierge buying services, and verified property transactions with a 98% client satisfaction rate.'
        },
        {
          q: 'How do I choose a luxury real estate agent in Nigeria?',
          a: 'Choose a luxury real estate agent with verified credentials, a track record of high-value transactions, exclusive off-market access, and local expertise in premium neighborhoods. Luxury Properties Ltd offers dedicated advisors with 15+ years experience and a 98% success rate on luxury property closings.'
        },
        {
          q: 'What makes a real estate agency a luxury agency?',
          a: 'A luxury real estate agency like Luxury Properties Ltd provides exclusive off-market listings, personalized concierge service, verified high-end properties above ₦50 million, dedicated relationship managers, and deep expertise in premium neighborhoods such as Ikoyi, Banana Island, and Maitama.'
        },
      ],
    },
    {
      category: 'Buying Luxury Property',
      questions: [
        {
          q: 'How do I buy luxury property in Nigeria as a foreigner?',
          a: 'Foreigners can buy luxury property in Nigeria through legal channels. Partner with Luxury Properties Ltd for end-to-end guidance: secure a Certificate of Occupancy, obtain Governor\'s Consent, register with the Nigerian Investment Promotion Commission, and use escrow payment services for secure transactions.'
        },
        {
          q: 'Can I buy luxury property in Nigeria from abroad?',
          a: 'Yes, diaspora buyers can purchase luxury property in Nigeria remotely. Luxury Properties Ltd provides virtual property tours, digital document verification, secure online payments, and full legal representation. You can complete the entire process without physically visiting Nigeria.'
        },
        {
          q: 'What documents do I need to buy luxury property in Nigeria?',
          a: 'You need a valid international passport, proof of funds or bank statements, a Tax Identification Number (TIN), and a local bank account. Your legal team will require the Certificate of Occupancy, Survey Plan, Deed of Assignment, and Governor\'s Consent from the seller.'
        },
      ],
    },
    {
      category: 'Property Costs & Neighborhoods',
      questions: [
        {
          q: 'What are the most expensive neighborhoods in Lagos?',
          a: 'The most expensive neighborhoods in Lagos are Banana Island, Ikoyi, Victoria Island, Lekki Phase 1, and Parkview Estate. Banana Island leads with properties ranging from ₦150 million to over ₦5 billion. Ikoyi follows closely with luxury duplexes and apartments from ₦80 million upward.'
        },
        {
          q: 'How much does a luxury home in Lagos cost in 2026?',
          a: 'Luxury homes in Lagos range from ₦80 million for a premium apartment in Ikoyi to over ₦5 billion for a waterfront mansion on Banana Island. Average prices: Ikoyi duplexes ₦150-500 million, Lekki luxury apartments ₦60-200 million, Banana Island villas ₦300 million to ₦5 billion+.'
        },
        {
          q: 'Are luxury properties in Lagos a good investment?',
          a: 'Yes, luxury properties in Lagos offer strong investment returns with 8-15% annual appreciation in prime areas and 12-18% rental yields on well-managed short-let properties. Luxury Properties Ltd reports consistent capital growth for clients who invested in Ikoyi and Banana Island over the past 5 years.'
        },
      ],
    },
    {
      category: 'Off-Market & Concierge Services',
      questions: [
        {
          q: 'What are off-market luxury properties in Nigeria?',
          a: 'Off-market luxury properties are high-end homes sold privately without public listing on portals like Nigeria Property Centre or PropertyPro.ng. Luxury Properties Ltd provides exclusive access to these properties, giving buyers first choice of premium estates before they reach the open market.'
        },
        {
          q: 'What is a luxury real estate concierge service?',
          a: 'A luxury real estate concierge service provides personalized, end-to-end property advisory including private viewings, market analysis, negotiation representation, legal coordination, interior design referrals, and post-purchase property management. Luxury Properties Ltd offers this white-glove service to all high-net-worth clients.'
        },
        {
          q: 'How do I sell my luxury property privately in Lagos?',
          a: 'Sell your luxury property privately through Luxury Properties Ltd\'s off-market program. Your property is discreetly marketed to a curated database of pre-qualified high-net-worth buyers. This approach ensures privacy, faster closings, and premium pricing without public exposure.'
        },
      ],
    },
    {
      category: 'Buying Process',
      questions: [
        {
          q: 'How do I start the property buying process?',
          a: 'Start by browsing our verified listings, then contact us to schedule viewings. Our agents will guide you through financing options, negotiations, and documentation.'
        },
        {
          q: 'How long does the buying process take?',
          a: 'The timeline varies but typically takes 4-8 weeks from offer acceptance to closing, depending on financing and documentation requirements.'
        },
      ],
    },
    {
      category: 'Selling Property',
      questions: [
        {
          q: 'How do I list my property for sale?',
          a: 'Use our property submission form to provide details about your property. Our team will review, verify, and list it on our platform with professional marketing.'
        },
        {
          q: 'How is my property valued?',
          a: 'We conduct a comprehensive market analysis considering location, property condition, recent sales, and current market trends to determine fair market value.'
        },
      ],
    },
    {
      category: 'Property Verification',
      questions: [
        {
          q: 'How do you verify properties?',
          a: 'We conduct thorough due diligence including title verification, physical inspection, ownership confirmation, and legal documentation review.'
        },
        {
          q: 'What does the verification badge mean?',
          a: 'Properties with a verification badge have passed our comprehensive checks and are confirmed to have clear titles and accurate information.'
        },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>FAQ - Luxury Properties Ltd | Premium Real Estate Nigeria</title>
        <meta name="description" content="Find answers about buying luxury property in Lagos, off-market listings, concierge services, property costs, and more. Expert guidance from Luxury Properties Ltd." />
        <meta name="keywords" content="luxury real estate FAQ, buy property Lagos, off-market properties, concierge real estate, luxury home costs Nigeria" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main>
        <section className="bg-secondary py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.02em' }}>Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Expert answers about luxury real estate in Nigeria, from buying and selling to off-market properties and concierge services.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="border rounded-xl px-6">
                      <AccordionTrigger className="text-left font-semibold hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Can't find the answer you're looking for? Our team of luxury real estate experts is here to help.
            </p>
            <a href="/contact" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQPage;