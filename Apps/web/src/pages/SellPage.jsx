import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertySubmissionForm from '@/components/PropertySubmissionForm.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const animationStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 50% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  .hero-animate { animation: fadeInUp 1s ease-out forwards; }
  .hero-animate-delay-1 { animation: fadeInUp 1s ease-out 0.3s forwards; opacity: 0; }
  .hero-image { animation: fadeIn 1.5s ease-out forwards; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); will-change: transform; image-rendering: -webkit-optimize-contrast; }
  .hero-image:hover { transform: scale(1.02); }
  .benefit-item { opacity: 0; animation: slideInLeft 0.6s ease-out forwards; transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .benefit-item:hover { transform: translateX(8px); }
  .benefit-item:nth-child(1) { animation-delay: 0.1s; }
  .benefit-item:nth-child(2) { animation-delay: 0.2s; }
  .benefit-item:nth-child(3) { animation-delay: 0.3s; }
  .benefit-item:nth-child(4) { animation-delay: 0.4s; }
  .benefit-item:nth-child(5) { animation-delay: 0.5s; }
  .benefit-item:nth-child(6) { animation-delay: 0.6s; }
  .card-hover { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease; }
  .card-hover:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
  .how-it-works-item { opacity: 0; animation: scaleIn 0.5s ease-out forwards; transition: transform 0.3s ease, background-color 0.3s ease; }
  .how-it-works-item:hover { transform: scale(1.03); background-color: rgba(59, 130, 246, 0.08); border-radius: 8px; }
  .how-it-works-item:nth-child(1) { animation-delay: 0.2s; }
  .how-it-works-item:nth-child(2) { animation-delay: 0.4s; }
  .how-it-works-item:nth-child(3) { animation-delay: 0.6s; }
  .how-it-works-item:nth-child(4) { animation-delay: 0.8s; }
  .how-it-works-item:nth-child(5) { animation-delay: 1s; }
  .submit-card { animation: scaleIn 0.8s ease-out forwards; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease; }
  .submit-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 25px 50px rgba(0,0,0,0.12); }
  .hero-section { animation: fadeIn 0.5s ease-out; transition: background-color 0.5s ease; }
`;

const SellPage = () => {
  const benefits = [
    'Professional property valuation',
    'Wide network of verified buyers',
    'Expert marketing and promotion',
    'Legal documentation support',
    'Fast and secure transactions',
    'No hidden fees',
  ];

  const howItWorks = [
    'Submit your property details using the form',
    'Our team reviews and verifies your listing',
    'We market your property to our network',
    'Connect with interested buyers',
    'Close the deal with our support',
  ];

  return (
    <>
      <Helmet>
        <title>Sell Your Property - Luxury Properties Ltd</title>
        <meta name="description" content="List your property with Luxury Properties Ltd and reach thousands of verified buyers." />
      </Helmet>

      <style>{animationStyles}</style>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618476695-08c4ab99-6c9e-4700-9de5-ed819f7d85bb.jpeg"
              alt="Sell Your Property" 
              className="w-full h-full object-cover hero-image"
              style={{ objectPosition: 'center' }}
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white hero-animate">Sell Your Property</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay-1">
              List your property with us and connect with thousands of verified buyers across Nigeria.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 items-start">
              <div>
                <h2 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6">Why sell with us?</h2>
                <div className="space-y-3 xs:space-y-3 sm:space-y-4 mb-6 xs:mb-6 sm:mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2 xs:space-x-2 sm:space-x-3 benefit-item">
                      <CheckCircle className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5 transition-transform duration-300 hover:rotate-12 hover:scale-110" />
                      <p className="text-sm xs:text-sm sm:text-base md:text-lg leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>
                <Card className="bg-primary/5 border-primary/20 card-hover">
                  <CardContent className="p-4 xs:p-5 sm:p-6">
                    <h3 className="text-base xs:text-base sm:text-lg font-semibold mb-2 xs:mb-2 sm:mb-3">How it works</h3>
                    <ol className="space-y-2 xs:space-y-2 sm:space-y-3 text-xs xs:text-xs sm:text-sm leading-relaxed">
                      {howItWorks.map((step, index) => (
                        <li key={index} className="how-it-works-item p-1.5 xs:p-1.5 sm:p-2 transition-all duration-300" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                          {index + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>

              <Card className="submit-card">
                <CardContent className="p-4 xs:p-5 sm:p-6 md:p-8">
                  <h2 className="text-xl xs:text-xl sm:text-2xl font-bold mb-4 xs:mb-4 sm:mb-5 md:mb-6">Submit Your Property</h2>
                  <PropertySubmissionForm />
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

export default SellPage;