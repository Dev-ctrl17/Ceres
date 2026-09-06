import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import supabase from '@/lib/supabaseClient';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const featuredReviews = [
    {
      name: "Adebayo Johnson",
      role: "Property Investor",
      image: "https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg",
      rating: 5,
      text: "Luxury Properties Ltd exceeded all my expectations. Their professionalism and attention to detail is unmatched. I've purchased three properties through them and each transaction was seamless."
    },
    {
      name: "Fatima Ibrahim",
      role: "Business Owner",
      image: "https://www.image2url.com/r2/default/images/1781618469713-68bb7539-44b8-46bd-9f07-d4868e145147.jpeg",
      rating: 5,
      text: "The team helped me find the perfect commercial space for my business. Their market knowledge and negotiation skills saved me both time and money. Highly recommended!"
    },
    {
      name: "Chidi Okafor",
      role: "Real Estate Developer",
      image: "https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg",
      rating: 5,
      text: "Working with Luxury Properties Ltd has been a game-changer for my development projects. Their network and expertise in the luxury market is truly exceptional."
    }
  ];

  return (
    <>
      <Head>
        <title>Client Reviews & Testimonials | Luxury Properties Ltd</title>
        <meta name="description" content="Read what our clients say about Luxury Properties Ltd. Real reviews from satisfied customers who found their dream properties with us." />
      </Head>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg"
              alt="Client Reviews - Luxury Properties Ltd" 
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Client Reviews
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about their experience with us.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real testimonials from real clients who trusted us with their real estate needs.
              </p>
            </div>

            {featuredReviews.length > 0 && (
              <div className="relative max-w-4xl mx-auto mb-16">
                <Card className="p-8 md:p-12">
                  <CardContent className="p-0">
                    <Quote className="w-12 h-12 text-primary/20 mb-6" />
                    <div className="mb-6">
                      {renderStars(featuredReviews[currentIndex].rating)}
                    </div>
                    <p className="text-xl md:text-2xl leading-relaxed mb-8 text-muted-foreground">
                      "{featuredReviews[currentIndex].text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                        <img
                          src={featuredReviews[currentIndex].image}
                          alt={featuredReviews[currentIndex].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{featuredReviews[currentIndex].name}</h3>
                        <p className="text-sm text-muted-foreground">{featuredReviews[currentIndex].role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {featuredReviews.length > 1 && (
                  <div className="flex justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevReview}
                      className="rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextReview}
                      className="rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">All Reviews</h2>
              <p className="text-lg text-muted-foreground">
                Browse through all client testimonials and reviews.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="w-5 h-5 bg-muted rounded-full" />
                      ))}
                    </div>
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded mb-2 w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-4">No reviews yet</p>
                <p className="text-muted-foreground">Be the first to leave a review!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                  <Card key={review.id || index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        "{review.text}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                          {review.image_url ? (
                            <img
                              src={review.image_url}
                              alt={review.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-lg font-bold text-primary">
                                {review.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          {review.role && (
                            <p className="text-sm text-muted-foreground">{review.role}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Our Service?</h2>
            <p className="text-lg opacity-90 mb-8">
              Join hundreds of satisfied clients who found their dream properties with Luxury Properties Ltd.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/properties">
                <Button size="lg" variant="secondary">
                  Browse Properties
                </Button>
              </a>
              <a href="/contact">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/10">
                  Contact Us
                </Button>
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