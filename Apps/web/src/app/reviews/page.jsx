import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Star } from 'lucide-react';

export const metadata = {
  title: 'Customer Reviews | Luxury Properties Ltd',
  description: 'Read what our clients say about their experience with Luxury Properties Ltd. 4.8/5 rating from 50+ reviews.',
  alternates: { canonical: '/reviews' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Luxury Properties Ltd',
  description: 'Premium luxury real estate agency in Nigeria',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    ratingCount: '50',
    reviewCount: '50',
  },
};

const testimonials = [
  { name: 'Adebayo Johnson', rating: 5, text: 'Exceptional service! They helped me find my dream home in Banana Island. Highly recommended.', service: 'Property Purchase' },
  { name: 'Fatima Ibrahim', rating: 5, text: 'Professional, responsive, and truly understood our needs. Sold our property in 3 weeks!', service: 'Property Sale' },
  { name: 'Chidi Okafor', rating: 5, text: 'The best real estate agency in Lagos. Their off-market access is unmatched.', service: 'Investment Advisory' },
  { name: 'Sarah Williams', rating: 5, text: 'As a diaspora client, they made the entire process seamless. Excellent communication.', service: 'Diaspora Service' },
  { name: 'Emeka Nwosu', rating: 5, text: 'Found the perfect rental in Victoria Island. Very professional team.', service: 'Property Rental' },
  { name: 'Aisha Bello', rating: 5, text: 'Their market knowledge is incredible. Got a great price for my property.', service: 'Property Sale' },
];

export default function ReviewsPage() {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-primary fill-primary' : 'text-muted'}`} />
    ));
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781315484156-19239477-a163-4063-9288-df5a0f6fe1b3.png"
              alt="Customer Reviews" 
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center', transform: 'scale(0.8)', transformOrigin: 'center' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white">Customer Reviews</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              See what our satisfied clients have to say about their experience with us.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                {renderStars(5)}
              </div>
              <p className="text-2xl font-bold">4.8/5</p>
              <p className="text-muted-foreground">Based on 50+ reviews</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-card p-6 rounded-2xl">
                  <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-3xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="heading-lg mb-4">Leave a Google Review</h2>
            <p className="text-muted-foreground mb-6">
              We value your feedback. Leave us a review on Google to help others make informed decisions.
            </p>
            <a
              href="https://www.google.com/maps/search/Luxury+Properties+Ltd/@6.535036,2.8772119,9z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Leave a Google Review
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}