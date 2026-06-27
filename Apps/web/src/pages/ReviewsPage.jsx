import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import { getFileUrl } from '@/lib/supabaseService';

const ReviewsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-primary fill-primary' : 'text-muted'}`}
      />
    ));
  };

  return (
    <>
      <Helmet>
        <title>Customer Reviews - Luxury Properties Ltd</title>
        <meta name="description" content="Read what our clients say about their experience with Luxury Properties Ltd." />
      </Helmet>

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
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="flex justify-center mb-8">
                <div className="elfsight-app-98519e75-89d7-45fb-9b51-d92e3821c04f" data-elfsight-app-lazy></div>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {testimonials.map((testimonial) => {
                  const photoUrl = testimonial.clientPhoto
                    ? getFileUrl("agent-photos", testimonial.clientPhoto)
                    : null;
                  return (
                    <Card key={testimonial.id} className="break-inside-avoid">
                      <CardContent className="p-6">
                        <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {testimonial.testimonialText}
                        </p>
                        <div className="flex items-center space-x-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={testimonial.clientName}
                              className="w-12 h-12 rounded-xl object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="text-lg font-bold text-primary">
                                {testimonial.clientName?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{testimonial.clientName}</p>
                            {testimonial.serviceType && (
                              <p className="text-sm text-muted-foreground">{testimonial.serviceType}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center">Google Reviews</h2>
            <div className="text-center">
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We value your feedback. Leave us a review on Google to help others make informed decisions.
              </p>
              <a
                href="https://www.google.com/maps/place/Luxury+properties+in+Ikoyi,+Lekki,+Lagos+Nigeria/@6.4422253,3.5328417,16z/data=!3m1!4b1!4m6!3m5!1s0x103bf71d683acdff:0xaa778c495125f698!8m2!3d6.44222!4d3.5354166!16s%2Fg%2F11y0q23298?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Leave a Google Review
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ReviewsPage;