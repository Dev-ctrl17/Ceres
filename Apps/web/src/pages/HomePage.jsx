import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Shield, TrendingUp, Award, Clock, 
  ArrowRight, Building2, Key, Briefcase, Users,
  Home, CheckCircle
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import HeroSlider from '@/components/HeroSlider.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';

const heroSlides = [
    {
      image: "https://www.image2url.com/r2/default/images/1781791838502-135e9be4-5709-483e-8271-4d1aa9e79fe2.jpeg",
      title: "Find Your Dream Property",
      subtitle: "Discover premium real estate across Nigeria — buy, rent, or invest with confidence.",
      ctaText: "Browse Properties",
      ctaLink: "/properties"
    },
    {
      image: "https://www.image2url.com/r2/default/images/1781791838490-d908b15e-9e31-41e6-88e8-06f7bef05dd2.jpeg",
      title: "Verified Listings Only",
      subtitle: "Every property is vetted and verified by our team of real estate professionals.",
      ctaText: "Browse Properties",
      ctaLink: "/properties"
    },
    {
      image: "https://www.image2url.com/r2/default/images/1781791838479-a916452b-9681-4b5f-8c03-3c48e3557b68.jpeg",
      title: "Expert Guidance",
      subtitle: "From search to signing — our agents are with you every step of the way.",
      ctaText: "Browse Properties",
      ctaLink: "/properties"
    }
];

const propertyCards = [
  { icon: Home, label: "Buy", sublabel: "Own your dream", link: "/buy" },
  { icon: Key, label: "Rent", sublabel: "Find your space", link: "/rent" },
  { icon: Building2, label: "Sell", sublabel: "List your property", link: "/sell" },
  { icon: TrendingUp, label: "Invest", sublabel: "Build your wealth", link: "/properties" },
  { icon: Shield, label: "Let Us Manage", sublabel: "We handle everything", link: "/services" },
];

const trustSignals = [
  { icon: Shield, text: "100% Verified Listings" },
  { icon: CheckCircle, text: "No Hidden Fees" },
  { icon: Clock, text: "24/7 Support" },
  { icon: Award, text: "15+ Years Experience" },
  { icon: Users, text: "1,200+ Happy Clients" },
];

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestProperties, setLatestProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const [featuredResult, latestResult] = await Promise.allSettled([
          supabase
            .from('properties')
            .select('*')
            .eq('is_featured', true)
            .eq('status', 'Available')
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('properties')
            .select('*')
            .eq('status', 'Available')
            .order('created_at', { ascending: false })
            .limit(10)
        ]);
        
        if (featuredResult.status === 'fulfilled') {
          setFeaturedProperties(featuredResult.value.data || []);
        } else {
          console.error('Error fetching featured properties:', featuredResult.reason);
          try {
            const { data } = await supabase
              .from('properties')
              .select('*')
              .eq('status', 'Available')
              .order('created_at', { ascending: false })
              .limit(3);
            setFeaturedProperties(data || []);
          } catch (fallbackErr) {
            console.error('Fallback fetch failed:', fallbackErr);
          }
        }
        
        if (latestResult.status === 'fulfilled') {
          setLatestProperties(latestResult.value.data || []);
        } else {
          console.error('Error fetching latest properties:', latestResult.reason);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

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
        <section className="relative min-h-[90dvh] xs:min-h-[95dvh] sm:min-h-[100dvh] flex items-center justify-center pt-20 pb-32 xs:pb-36 sm:pb-40 md:pb-44 lg:pb-48">
          <div className="absolute inset-0 z-0">
            <HeroSlider slides={heroSlides} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 w-full mt-8 xs:mt-10 sm:mt-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
            </motion.div>
          </div>

          {/* Floating Property Type Cards */}
          <motion.div
            className="absolute bottom-8 xs:bottom-10 sm:bottom-12 left-0 right-0 px-4 xs:px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10"
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 xs:gap-3 sm:gap-4">
              {propertyCards.map((card) => (
                <motion.button
                  key={card.label}
                  variants={cardItemVariants}
                  onClick={() => navigate(card.link)}
                  className="flex flex-col items-center justify-center p-3 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <card.icon className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 mb-2 xs:mb-2.5 sm:mb-3" />
                  <span className="text-sm xs:text-base sm:text-lg font-semibold">{card.label}</span>
                  <span className="text-xs xs:text-xs sm:text-sm text-white/70 mt-0.5 xs:mt-1">{card.sublabel}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Trust Bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary text-primary-foreground py-4 xs:py-5 sm:py-6"
        >
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center flex-wrap gap-3 xs:gap-4 sm:gap-6">
              {trustSignals.map((signal, index) => (
                <div key={index} className="flex items-center gap-1.5 xs:gap-2">
                  <signal.icon className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="font-medium text-xs xs:text-xs sm:text-sm whitespace-nowrap">{signal.text}</span>
                  {index < trustSignals.length - 1 && (
                    <div className="w-px h-4 xs:h-5 sm:h-6 bg-white/30 hidden xs:hidden sm:block md:block ml-2 xs:ml-2 sm:ml-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Featured Properties */}
        <section className="py-16 xs:py-18 sm:py-20 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col xs:flex-col sm:flex-row md:flex-row md:items-end justify-between mb-8 xs:mb-10 sm:mb-12 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <h2 className="heading-lg mb-2 xs:mb-3 sm:mb-4">Featured Properties</h2>
                <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg max-w-2xl">Handpicked premium listings that represent the pinnacle of luxury living and exceptional investment opportunities.</p>
              </div>
              <Link to="/properties" aria-label="View all properties">
                <Button variant="outline" className="group w-full xs:w-full sm:w-auto">
                  View All Properties 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} featured={true} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Latest Properties */}
        <section className="py-16 xs:py-18 sm:py-20 md:py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col xs:flex-col sm:flex-row md:flex-row md:items-end justify-between mb-8 xs:mb-10 sm:mb-12 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <h2 className="heading-lg mb-2 xs:mb-3 sm:mb-4">Latest Properties</h2>
                <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg max-w-2xl">Fresh listings just added to our portfolio. Be the first to explore these new opportunities.</p>
              </div>
              <Link to="/properties" aria-label="View all latest properties">
                <Button variant="outline" className="group w-full xs:w-full sm:w-auto">
                  View All Properties 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {latestProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us - Zig Zag Layout */}
        <section className="section-padding bg-secondary text-secondary-foreground overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12 xs:mb-14 sm:mb-16 md:mb-20">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Why Choose Luxury Properties</h2>
              <p className="text-base xs:text-base sm:text-lg opacity-80 max-w-2xl mx-auto">We deliver excellence through our commitment to transparency, market expertise, and personalized service.</p>
            </div>

            <div className="space-y-16 xs:space-y-18 sm:space-y-20 md:space-y-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="w-12 xs:w-12 sm:w-14 md:w-16 h-12 xs:h-12 sm:h-14 md:h-16 bg-primary/20 rounded-xl xs:rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 xs:mb-4 sm:mb-5 md:mb-6">
                    <Shield className="w-6 h-6 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl xs:text-xl sm:text-2xl md:text-2xl font-bold mb-3 xs:mb-3 sm:mb-4">Verified & Secure Transactions</h3>
                  <p className="text-sm xs:text-sm sm:text-base md:text-lg opacity-80 leading-relaxed mb-4 xs:mb-4 sm:mb-5 md:mb-6">
                    Every property in our portfolio undergoes rigorous legal and physical verification. We ensure that your investment is secure, titles are clear, and transactions are completely transparent.
                  </p>
                  <ul className="space-y-2 xs:space-y-2 sm:space-y-3 opacity-90">
                    <li className="flex items-center text-sm xs:text-sm sm:text-base"><div className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 xs:mr-2 sm:mr-3 flex-shrink-0" /> Comprehensive title checks</li>
                    <li className="flex items-center text-sm xs:text-sm sm:text-base"><div className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 xs:mr-2 sm:mr-3 flex-shrink-0" /> Physical property inspection</li>
                    <li className="flex items-center text-sm xs:text-sm sm:text-base"><div className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 xs:mr-2 sm:mr-3 flex-shrink-0" /> Secure payment processing</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="aspect-square rounded-2xl xs:rounded-2xl sm:rounded-3xl overflow-hidden">
                    <img src="https://www.image2url.com/r2/default/images/1781618477582-1005fa15-bd99-4786-bb20-160a0f75d002.jpeg" alt="Secure real estate transaction" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute -bottom-4 xs:-bottom-4 sm:-bottom-6 -left-4 xs:-left-4 sm:-left-6 w-32 xs:w-36 sm:w-40 md:w-48 h-32 xs:h-36 sm:h-40 md:h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 items-center">
                <div className="relative">
                  <div className="aspect-square rounded-2xl xs:rounded-2xl sm:rounded-3xl overflow-hidden">
                    <img src="https://www.image2url.com/r2/default/images/1781618469713-68bb7539-44b8-46bd-9f07-d4868e145147.jpeg" alt="Expert real estate consultation" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute -top-4 xs:-top-4 sm:-top-6 -right-4 xs:-right-4 sm:-right-6 w-32 xs:w-36 sm:w-40 md:w-48 h-32 xs:h-36 sm:h-40 md:h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
                </div>
                <div>
                  <div className="w-12 xs:w-12 sm:w-14 md:w-16 h-12 xs:h-12 sm:h-14 md:h-16 bg-primary/20 rounded-xl xs:rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 xs:mb-4 sm:mb-5 md:mb-6">
                    <Award className="w-6 h-6 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl xs:text-xl sm:text-2xl md:text-2xl font-bold mb-3 xs:mb-3 sm:mb-4">Award-Winning Expertise</h3>
                  <p className="text-sm xs:text-sm sm:text-base md:text-lg opacity-80 leading-relaxed mb-4 xs:mb-4 sm:mb-5 md:mb-6">
                    Our team of seasoned professionals brings decades of combined experience in the Nigerian real estate market. We leverage deep market insights to negotiate the best deals for our clients.
                  </p>
                  <ul className="space-y-2 xs:space-y-2 sm:space-y-3 opacity-90">
                    <li className="flex items-center text-sm xs:text-sm sm:text-base"><div className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 xs:mr-2 sm:mr-3 flex-shrink-0" /> Expert market analysis</li>
                    <li className="flex items-center text-sm xs:text-sm sm:text-base"><div className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 xs:mr-2 sm:mr-3 flex-shrink-0" /> Professional negotiation</li>
                    <li className="flex items-center text-sm xs:text-sm sm:text-base"><div className="w-1.5 h-1.5 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mr-2 xs:mr-2 sm:mr-3 flex-shrink-0" /> Dedicated account managers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 xs:py-18 sm:py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 xs:gap-6 sm:gap-8 md:gap-12 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-1 xs:space-y-1 sm:space-y-2">
                  <p className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums tracking-tight text-white">{stat.value}</p>
                  <p className="text-xs xs:text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider text-white">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Bento Grid */}
        <section className="section-padding bg-background">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12 xs:mb-14 sm:mb-16">
              <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Comprehensive Services</h2>
              <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg max-w-2xl mx-auto">End-to-end real estate solutions designed to meet your specific needs.</p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6">
              {services.map((service, index) => (
                <Card key={index} className="bg-muted border-none shadow-none hover:bg-secondary transition-colors duration-300">
                  <CardContent className="p-6 xs:p-6 sm:p-8 flex flex-col h-full">
                    <div className="w-10 xs:w-10 sm:w-12 h-10 xs:h-10 sm:h-12 bg-background rounded-lg xs:rounded-lg sm:rounded-xl flex items-center justify-center mb-4 xs:mb-4 sm:mb-6 shadow-sm">
                      <service.icon className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-lg xs:text-lg sm:text-xl font-semibold mb-2 xs:mb-2 sm:mb-3">{service.title}</h3>
                    <p className="text-sm xs:text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 xs:mb-4 sm:mb-6 flex-grow">{service.desc}</p>
                    <Link to="/services" className="text-primary font-medium hover:underline inline-flex items-center mt-auto text-sm xs:text-sm sm:text-base">
                      View {service.title} <ArrowRight className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* EPAN CTA */}
        <section className="section-padding bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 items-center">
              <div>
                <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4 md:mb-6">Join the Estate Professionals Association Network (EPAN)</h2>
                <p className="text-sm xs:text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed mb-6 xs:mb-6 sm:mb-8">
                  Are you a real estate professional looking to grow your career? Join our exclusive network to access verified listings, earn competitive commissions, and connect with industry leaders.
                </p>
                <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-3 sm:gap-4">
                  <Link to="/epan" aria-label="Become an EPAN member">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full xs:w-full sm:w-auto">
                      Become a Member
                    </Button>
                  </Link>
                  <Link to="/about" aria-label="Learn more about EPAN">
                    <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 w-full xs:w-full sm:w-auto">
                      About EPAN
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 xs:gap-3 sm:gap-4">
                <div className="space-y-3 xs:space-y-3 sm:space-y-4 mt-4 xs:mt-4 sm:mt-8">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-xl sm:rounded-2xl">
                    <TrendingUp className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mb-2 xs:mb-2 sm:mb-3 md:mb-4" />
                    <h3 className="text-sm xs:text-sm sm:text-base md:text-lg font-semibold mb-1 xs:mb-1 sm:mb-2">Higher Earnings</h3>
                    <p className="text-xs xs:text-xs sm:text-sm text-slate-400">Access premium listings with better commission splits.</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-xl sm:rounded-2xl">
                    <Clock className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mb-2 xs:mb-2 sm:mb-3 md:mb-4" />
                    <h3 className="text-sm xs:text-sm sm:text-base md:text-lg font-semibold mb-1 xs:mb-1 sm:mb-2">Fast Closings</h3>
                    <p className="text-xs xs:text-xs sm:text-sm text-slate-400">Streamlined processes to help you close deals faster.</p>
                  </div>
                </div>
                <div className="space-y-3 xs:space-y-3 sm:space-y-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-xl sm:rounded-2xl">
                    <Shield className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mb-2 xs:mb-2 sm:mb-3 md:mb-4" />
                    <h3 className="text-sm xs:text-sm sm:text-base md:text-lg font-semibold mb-1 xs:mb-1 sm:mb-2">Verified Inventory</h3>
                    <p className="text-xs xs:text-xs sm:text-sm text-slate-400">Sell with confidence knowing every property is vetted.</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-xl sm:rounded-2xl">
                    <Users className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mb-2 xs:mb-2 sm:mb-3 md:mb-4" />
                    <h3 className="text-sm xs:text-sm sm:text-base md:text-lg font-semibold mb-1 xs:mb-1 sm:mb-2">Elite Network</h3>
                    <p className="text-xs xs:text-xs sm:text-sm text-slate-400">Collaborate with top-performing agents nationwide.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="section-padding bg-background border-t">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <div className="w-12 xs:w-12 sm:w-14 md:w-16 h-12 xs:h-12 sm:h-14 md:h-16 bg-primary/10 rounded-xl xs:rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 xs:mb-4 sm:mb-5 md:mb-6">
              <Search className="w-6 h-6 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
            </div>
            <h2 className="heading-lg mb-3 xs:mb-3 sm:mb-4">Stay Ahead of the Market</h2>
            <p className="text-muted-foreground text-sm xs:text-sm sm:text-base md:text-lg mb-6 xs:mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive property alerts, market insights, and investment opportunities delivered straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col xs:flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 xs:h-11 sm:h-12 text-sm xs:text-sm sm:text-base"
                aria-label="Email address for newsletter subscription"
              />
              <Button type="submit" size="lg" disabled={subscribing} className="h-11 xs:h-11 sm:h-12 px-6 xs:px-6 sm:px-8 text-sm xs:text-sm sm:text-base" aria-label="Subscribe to newsletter">
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