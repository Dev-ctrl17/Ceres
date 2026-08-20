import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';

const BlogPage = () => {
  const { getBackground } = usePageBackgrounds();
  const blogPosts = [
    {
      title: "Nigerian Real Estate Buying Guide",
      slug: "nigerian-real-estate-buying-guide",
      excerpt: "Complete guide to buying luxury property in Nigeria. Learn about legal requirements, documentation, and the entire purchasing process from expert real estate advisors.",
      date: "2026-06-15",
      readTime: "12 min read",
      category: "Buying Guide"
    },
    {
      title: "Real Estate News & Market Trends 2026",
      slug: "real-estate-news-market-trends",
      excerpt: "Stay updated with the latest real estate market trends in Nigeria. Analysis of property prices, investment opportunities, and market forecasts for 2026.",
      date: "2026-06-15",
      readTime: "10 min read",
      category: "Market Analysis"
    },
    {
      title: "Real Estate Investment Tips Nigeria",
      slug: "real-estate-investment-tips-nigeria",
      excerpt: "Expert investment strategies for Nigerian real estate. Learn how to maximize returns, identify profitable opportunities, and build a successful property portfolio.",
      date: "2026-06-15",
      readTime: "15 min read",
      category: "Investment"
    },
    {
      title: "Property Selling Guide Nigeria",
      slug: "property-selling-guide-nigeria",
      excerpt: "Master the art of selling luxury property in Nigeria. From pricing strategies to staging tips, learn how to sell your property faster and at the best price.",
      date: "2026-06-15",
      readTime: "11 min read",
      category: "Selling Guide"
    },
    {
      title: "Market Trend Analysis & Forecast",
      slug: "market-trend-blog-post",
      excerpt: "In-depth analysis of current real estate market trends in Lagos, Abuja, and Port Harcourt. Expert forecasts and investment recommendations for 2026-2027.",
      date: "2026-06-15",
      readTime: "9 min read",
      category: "Market Analysis"
    },
    {
      title: "Most Expensive Neighborhoods in Lagos 2026",
      slug: "most-expensive-neighborhoods-lagos-2026",
      excerpt: "Discover Lagos' most prestigious neighborhoods including Banana Island, Ikoyi, and Victoria Island. Complete guide to luxury living in Nigeria's commercial capital.",
      date: "2026-06-16",
      readTime: "13 min read",
      category: "Neighborhood Guide"
    },
    {
      title: "Luxury Property Lekki Complete Guide",
      slug: "luxury-property-lekki-complete-guide",
      excerpt: "Everything you need to know about luxury properties in Lekki. From Lekki Phase 1 to Chevron Drive, explore the best estates, amenities, and investment opportunities.",
      date: "2026-06-16",
      readTime: "14 min read",
      category: "Neighborhood Guide"
    },
    {
      title: "How to Buy Luxury Property in Nigeria",
      slug: "how-to-buy-luxury-property-nigeria",
      excerpt: "Step-by-step guide to purchasing luxury real estate in Nigeria. Covers legal requirements, financing options, due diligence, and working with luxury real estate agents.",
      date: "2026-06-16",
      readTime: "16 min read",
      category: "Buying Guide"
    },
    {
      title: "Ikoyi Real Estate Guide",
      slug: "ikoyi-real-estate-guide",
      excerpt: "Ultimate guide to Ikoyi real estate - Lagos' most prestigious address. Explore luxury apartments, duplexes, and waterfront properties in this elite neighborhood.",
      date: "2026-06-16",
      readTime: "12 min read",
      category: "Neighborhood Guide"
    },
    {
      title: "Banana Island Property Guide",
      slug: "banana-island-property-guide",
      excerpt: "Exclusive guide to Banana Island properties - Nigeria's most luxurious address. Discover waterfront mansions, luxury villas, and investment opportunities on this prestigious island.",
      date: "2026-06-16",
      readTime: "11 min read",
      category: "Neighborhood Guide"
    },
    {
      title: "Victoria Island Luxury Real Estate Guide",
      slug: "victoria-island-luxury-real-estate-guide",
      excerpt: "Comprehensive guide to Victoria Island luxury properties. From high-rise apartments to waterfront estates, find your perfect luxury home in VI.",
      date: "2026-06-16",
      readTime: "13 min read",
      category: "Neighborhood Guide"
    },
    {
      title: "Diaspora Guide: Buy Property in Nigeria from Abroad",
      slug: "diaspora-guide-buy-property-nigeria-abroad",
      excerpt: "Complete guide for diaspora Nigerians looking to invest in property back home. Remote buying process, legal requirements, and trusted agencies explained.",
      date: "2026-06-16",
      readTime: "15 min read",
      category: "Buying Guide"
    },
    {
      title: "Luxury Real Estate Investment ROI Lagos",
      slug: "luxury-real-estate-investment-roi-lagos",
      excerpt: "Calculate your potential returns on luxury real estate investments in Lagos. Real ROI data, appreciation rates, and rental yield analysis for prime neighborhoods.",
      date: "2026-06-16",
      readTime: "14 min read",
      category: "Investment"
    },
    {
      title: "Luxury Home Cost Lagos 2026",
      slug: "luxury-home-cost-lagos-2026",
      excerpt: "Current pricing for luxury homes in Lagos 2026. Detailed breakdown of property prices in Ikoyi, Banana Island, Victoria Island, and Lekki with market trends.",
      date: "2026-06-16",
      readTime: "10 min read",
      category: "Market Analysis"
    },
    {
      title: "Best Areas in Lagos for Expats",
      slug: "best-areas-lagos-expats",
      excerpt: "Top neighborhoods in Lagos for expatriates and international professionals. Safety, amenities, schools, and lifestyle considerations for each area.",
      date: "2026-06-16",
      readTime: "12 min read",
      category: "Neighborhood Guide"
    },
    {
      title: "Documents Needed to Buy Property in Nigeria",
      slug: "documents-needed-buy-property-nigeria",
      excerpt: "Complete checklist of documents required for property purchase in Nigeria. From identification to legal documents, ensure you have everything ready for a smooth transaction.",
      date: "2026-06-16",
      readTime: "8 min read",
      category: "Buying Guide"
    },
    {
      title: "Off-Market Properties Lagos",
      slug: "off-market-properties-lagos",
      excerpt: "Access exclusive off-market luxury properties in Lagos. Learn how to find hidden gems before they hit the public market through Luxury Properties Ltd's exclusive network.",
      date: "2026-06-16",
      readTime: "9 min read",
      category: "Investment"
    },
    {
      title: "Certificate of Occupancy vs Governor's Consent",
      slug: "certificate-of-occupancy-vs-governors-consent",
      excerpt: "Understanding the difference between Certificate of Occupancy and Governor's Consent in Nigerian real estate. Which do you need and how to obtain the right documentation.",
      date: "2026-06-16",
      readTime: "11 min read",
      category: "Legal Guide"
    },
    {
      title: "How to Sell Luxury Property Fast in Lagos",
      slug: "sell-luxury-property-fast-lagos",
      excerpt: "Proven strategies to sell your luxury property quickly in Lagos. Pricing, staging, marketing, and working with the right agency for fast, profitable sales.",
      date: "2026-06-16",
      readTime: "10 min read",
      category: "Selling Guide"
    },
    {
      title: "Governor's Consent Timeline Lagos 2026",
      slug: "governors-consent-timeline-lagos-2026",
      excerpt: "Current processing times for Governor's Consent in Lagos 2026. Understanding the timeline, costs, and how to expedite your property transaction.",
      date: "2026-06-16",
      readTime: "7 min read",
      category: "Legal Guide"
    },
    {
      title: "Luxury Concierge Real Estate Nigeria",
      slug: "luxury-concierge-real-estate-nigeria",
      excerpt: "Experience white-glove luxury real estate service in Nigeria. Our concierge service offers personalized property search, private viewings, and end-to-end transaction management.",
      date: "2026-06-16",
      readTime: "9 min read",
      category: "Services"
    },
    {
      title: "Voice Search Optimized FAQs",
      slug: "voice-search-optimized-faqs",
      excerpt: "Quick answers to common luxury real estate questions optimized for voice search. Find instant answers about property prices, neighborhoods, and buying processes.",
      date: "2026-06-16",
      readTime: "6 min read",
      category: "Quick Answers"
    }
  ];

  const categories = [...new Set(blogPosts.map(post => post.category))];

  return (
    <>
      <Helmet>
        <title>Luxury Real Estate Blog Nigeria | Market Insights & Guides | Luxury Properties Ltd</title>
        <meta name="description" content="Expert insights on luxury real estate in Nigeria. Market trends, buying guides, investment tips, and neighborhood guides for Lagos, Abuja, and Port Harcourt." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/blog" />
        <meta property="og:title" content="Luxury Real Estate Blog Nigeria | Market Insights & Guides" />
        <meta property="og:description" content="Expert insights on luxury real estate in Nigeria. Market trends, buying guides, investment tips, and neighborhood guides." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/blog" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Luxury Real Estate Blog Nigeria | Market Insights & Guides" />
        <meta name="twitter:description" content="Expert insights on luxury real estate in Nigeria. Market trends, buying guides, and investment tips." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={getBackground('blog_hero', "https://www.image2url.com/r2/default/images/1783547801870-2726b84f-3090-4a4f-a8da-526a99604c56.jpg")}
              alt="Luxury real estate insights and guides"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Luxury Real Estate Insights & Guides
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Expert analysis, market trends, and comprehensive guides to help you navigate Nigeria's luxury real estate market with confidence.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h2 className="text-3xl font-bold mb-8">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogPosts
                    .filter(post => post.category === category)
                    .map((post, index) => (
                      <Card key={index} className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.date).toLocaleDateString('en-NG', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                            {post.excerpt}
                          </p>
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center text-primary font-medium hover:underline mt-auto"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Browse our exclusive collection of luxury properties or speak with our expert advisors today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/properties">
                <button className="bg-background text-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Browse Properties
                </button>
              </Link>
              <Link to="/contact">
                <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Explore More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Buying Guide</h3>
                  <p className="text-muted-foreground mb-4">Learn the complete process of buying luxury property in Nigeria.</p>
                  <Link to="/blog/nigerian-real-estate-buying-guide" className="text-primary font-medium hover:underline">
                    Read Guide →
                  </Link>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Investment Tips</h3>
                  <p className="text-muted-foreground mb-4">Expert strategies for maximizing your real estate investment returns.</p>
                  <Link to="/blog/real-estate-investment-tips-nigeria" className="text-primary font-medium hover:underline">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Market Trends</h3>
                  <p className="text-muted-foreground mb-4">Stay updated with the latest luxury real estate market analysis.</p>
                  <Link to="/blog/real-estate-news-market-trends" className="text-primary font-medium hover:underline">
                    View Trends →
                  </Link>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Ikoyi vs Lekki vs Banana Island</h3>
                  <p className="text-muted-foreground mb-4">Head-to-head comparison of Lagos' most exclusive neighborhoods.</p>
                  <Link to="/blog/comparison" className="text-primary font-medium hover:underline">
                    Read the Comparison →
                  </Link>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Top 10 Luxury Homes in Lagos</h3>
                  <p className="text-muted-foreground mb-4">Handpicked luxury properties from ₦80M penthouses to ₦5B waterfront estates.</p>
                  <Link to="/blog/listicle" className="text-primary font-medium hover:underline">
                    View the List →
                  </Link>
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

export default BlogPage;