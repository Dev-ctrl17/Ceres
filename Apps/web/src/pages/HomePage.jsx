import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Shield, TrendingUp, Award, Clock, 
  ArrowRight, Building2, Key, Briefcase, Users 
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestProperties, setLatestProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const [featuredResult, latestResult] = await Promise.all([
          supabase
            .from('properties')
            .select('*')
            .eq('isFeatured', true)
            .eq('status', 'Available')
            .order('created', { ascending: false })
            .limit(3),
          supabase
            .from('properties')
            .select('*')
            .eq('status', 'Available')
            .order('created', { ascending: false })
            .limit(6)
        ]);
        
        setFeaturedProperties(featuredResult.data || []);
        setLatestProperties(latestResult.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (filters.location) searchParams.append('location', filters.location);
    if (filters.propertyType && filters.propertyType !== 'all') searchParams.append('type', filters.propertyType);
    if (filters.bedrooms && filters.bedrooms !== 'all') searchParams.append('beds', filters.bedrooms);
    if (filters.status && filters.status !== 'all') searchParams.append('status', filters.status);
    
    navigate(`/properties?${searchParams.toString()}`);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already subscribed.');
        } else {
          toast.error('Failed to subscribe. Please try again.');
        }
        return;
      }

      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const stats = [
    { value: '500+', label: 'Properties Listed' },
    { value: '1.2k', label: 'Happy Clients' },
    { value: '15+', label: 'Years Experience' },
    { value: '98%', label: 'Success Rate' },
  ];

  const services = [
    { icon: Building2, title: 'Property Sales', desc: 'Expert guidance through the entire buying and selling process.' },
    { icon: Key, title: 'Property Leasing', desc: 'Comprehensive leasing services for residential and commercial spaces.' },
    { icon: Briefcase, title: 'Property Management', desc: 'Full-service management to protect and enhance your investment.' },
    { icon: Users, title: 'Investment Advisory', desc: 'Strategic advice to maximize your real estate portfolio returns.' },
  ];

  return (
    <>
      <Helmet>
        <title>Luxury Properties Ltd - Premium Real Estate in Nigeria</title>
        <meta name="description" content="Discover premium real estate properties across Nigeria. Buy, sell, or rent luxury homes, commercial spaces, and land with Luxury Properties Ltd." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90dvh] flex items-center justify-center pt-20 pb-32">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781618469672-f363452b-534b-451c-9b4e-1f1b7efd15b8.jpeg" 
              alt="Luxury modern home exterior" 
              className="w-full h-full object-cover"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-slate-950/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                Discover Your Next <span className="text-primary">Premium</span> Property
              </h1>
              <p className="text-xl text-slate-200 mb-10 max-w-2xl leading-relaxed">
                Explore our exclusive collection of luxury homes, commercial spaces, and prime land across Nigeria's most sought-after locations.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8"
            >
              <PropertyFilter filters={filters} setFilters={setFilters} onSearch={handleSearch} />
            </motion.div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Properties</h2>
                <p className="text-muted-foreground text-lg max-w-2xl">Handpicked premium listings that represent the pinnacle of luxury living and exceptional investment opportunities.</p>
              </div>
              <Link to="/properties" aria-label="View all properties">
                <Button variant="outline" className="group">
                  View All Properties 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : featuredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} featured={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-2xl">
                <p className="text-muted-foreground">No featured properties available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us - Zig Zag Layout */}
        <section className="py-24 bg-secondary text-secondary-foreground overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Luxury Properties</h2>
              <p className="text-lg opacity-80 max-w-2xl mx-auto">We deliver excellence through our commitment to transparency, market expertise, and personalized service.</p>
            </div>

            <div className="space-y-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Verified & Secure Transactions</h3>
                  <p className="text-lg opacity-80 leading-relaxed mb-6">
                    Every property in our portfolio undergoes rigorous legal and physical verification. We ensure that your investment is secure, titles are clear, and transactions are completely transparent.
                  </p>
                  <ul className="space-y-3 opacity-90">
                    <li className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-3" /> Comprehensive title checks</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-3" /> Physical property inspection</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-3" /> Secure payment processing</li>
                  </ul>
                </div>
                <div className="order-1 md:order-2 relative">
                  <div className="aspect-square rounded-3xl overflow-hidden">
                    <img src="https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg" alt="Secure real estate transaction" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden">
                    <img src="https://www.image2url.com/r2/default/images/1781618469713-68bb7539-44b8-46bd-9f07-d4868e145147.jpeg" alt="Expert real estate consultation" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute -top-6 -right-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
                </div>
                <div>
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Award-Winning Expertise</h3>
                  <p className="text-lg opacity-80 leading-relaxed mb-6">
                    Our team of seasoned professionals brings decades of combined experience in the Nigerian real estate market. We leverage deep market insights to negotiate the best deals for our clients.
                  </p>
                  <ul className="space-y-3 opacity-90">
                    <li className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-3" /> Expert market analysis</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-3" /> Professional negotiation</li>
                    <li className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-3" /> Dedicated account managers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-4xl md:text-5xl font-bold tabular-nums tracking-tight text-white">{stat.value}</p>
                  <p className="text-sm md:text-base font-medium uppercase tracking-wider text-white">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Bento Grid */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Services</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">End-to-end real estate solutions designed to meet your specific needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="bg-muted border-none shadow-none hover:bg-secondary transition-colors duration-300">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mb-6 shadow-sm">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">{service.desc}</p>
                    <Link to="/services" className="text-primary font-medium hover:underline inline-flex items-center mt-auto" aria-label={`Learn more about ${service.title}`}>
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* EPAN CTA */}
        <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Estate Professionals Association Network (EPAN)</h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                  Are you a real estate professional looking to grow your career? Join our exclusive network to access verified listings, earn competitive commissions, and connect with industry leaders.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/epan" aria-label="Become an EPAN member">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Become a Member
                    </Button>
                  </Link>
                  <Link to="/about" aria-label="Learn more about EPAN">
                    <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                    <TrendingUp className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Higher Earnings</h3>
                    <p className="text-sm text-slate-400">Access premium listings with better commission splits.</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                    <Clock className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Fast Closings</h3>
                    <p className="text-sm text-slate-400">Streamlined processes to help you close deals faster.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                    <Shield className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Verified Inventory</h3>
                    <p className="text-sm text-slate-400">Sell with confidence knowing every property is vetted.</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                    <Users className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Elite Network</h3>
                    <p className="text-sm text-slate-400">Collaborate with top-performing agents nationwide.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-background border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Ahead of the Market</h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive property alerts, market insights, and investment opportunities delivered straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
                aria-label="Email address for newsletter subscription"
              />
              <Button type="submit" size="lg" disabled={subscribing} className="h-12 px-8" aria-label="Subscribe to newsletter">
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;