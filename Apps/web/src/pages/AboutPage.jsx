import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Award } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import { getFileUrl, getOptimizedImageUrl } from '@/lib/supabaseService';
import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getBackground } = usePageBackgrounds();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('teammembers')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error('Failed to fetch team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const achievements = [
    '500+ Properties Sold',
    '1,200+ Happy Clients',
    '15+ Years Combined Experience',
    'Award-Winning Service',
  ];

  return (
    <>
      <Helmet>
        <title>Best Luxury Real Estate Agency Nigeria | Luxury Properties Ltd</title>
        <meta name="description" content="Discover why Luxury Properties Ltd is the best luxury real estate agency Nigeria. Exclusive high-end properties, concierge service, and expert advisory in Lagos, Abuja. 15+ years excellence." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/about" />
        <meta property="og:title" content="Best Luxury Real Estate Agency Nigeria | Luxury Properties Ltd" />
        <meta property="og:description" content="Discover why Luxury Properties Ltd is recognized as the best luxury real estate agency Nigeria. Premium properties, concierge service, and unmatched market expertise." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/about" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best Luxury Real Estate Agency Nigeria | Luxury Properties Ltd" />
        <meta name="twitter:description" content="Discover why Luxury Properties Ltd is recognized as the best luxury real estate agency Nigeria." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src={getBackground('about_hero', "https://www.image2url.com/r2/default/images/1781619633951-48ac0036-1929-4e9c-a44e-9ea02995669f.jpeg")}
              alt="Best Luxury Real Estate Agency Nigeria - Luxury Properties Ltd" 
              className="w-full h-full object-cover hero-image"
              style={{ objectPosition: 'center' }}
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white hero-animate">Best Luxury Real Estate Agency Nigeria</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay-1">
              Nigeria's premier luxury real estate agency — trusted by high-net-worth clients for exclusive properties, concierge service, and expert advisory.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 section-title">Where Exceptional Properties Meet Exceptional People</h2>
              <p className="text-muted-foreground leading-relaxed mb-6 content-paragraph">
              At Luxury Properties Ltd, we understand that luxury real estate is more than acquiring a property—it's about embracing a lifestyle, creating a legacy, and making investments that stand the test of time.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 content-paragraph">
              As one of Nigeria's leading luxury real estate companies, we are dedicated to connecting discerning clients with the country's most prestigious residential and investment properties. From the exclusive neighborhoods of Ikoyi, Victoria Island, Lekki, and Banana Island in Lagos to premium developments in Abuja and Port Harcourt, we offer access to exceptional homes and investment opportunities that reflect sophistication, elegance, and enduring value.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 content-paragraph">
              Every client we serve has unique aspirations. That's why we take a personalized approach to every transaction, providing expert guidance, market intelligence, and tailored solutions that align with your lifestyle and financial goals. Whether you're searching for your dream home, expanding your investment portfolio, or selling a premium property, our experienced team is committed to delivering results with professionalism, discretion, and integrity.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 content-paragraph">
              Our carefully cultivated network provides access to exclusive listings, including premium off-market opportunities that are not publicly advertised. Combined with our commitment to transparency and exceptional service, we make every real estate journey seamless, rewarding, and stress-free.
              </p>
              <p className="text-muted-foreground leading-relaxed content-paragraph">
              At Luxury Properties Ltd, we don't simply broker property transactions—we build lasting relationships founded on trust, excellence, and an unwavering commitment to exceeding expectations.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xs:gap-6 sm:gap-8 md:gap-12">
              <Card className="card-hover mission-card">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 icon-wrapper">
                    <Target className="w-8 h-8 text-primary icon-animate" />
                  </div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                    To deliver world-class luxury real estate solutions through exceptional service, expert market knowledge, and innovative strategies that help our clients buy, sell, and invest with confidence.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover vision-card">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 icon-wrapper">
                    <Eye className="w-8 h-8 text-primary icon-animate" />
                  </div>
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                    To be the most trusted and respected luxury real estate company in Nigeria, recognized for delivering outstanding client experiences, exceptional properties, and lasting value.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover values-card">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 icon-wrapper">
                    <Award className="w-8 h-8 text-primary icon-animate" />
                  </div>
              <h3 className="text-xl font-semibold mb-3">Our Core Values</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Integrity</strong> — We conduct every transaction with honesty, transparency, and professionalism.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Excellence</strong> — We are committed to delivering exceptional service and consistently exceeding client expectations.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Client-Centric Service</strong> — Every decision we make begins with understanding our clients' needs and delivering personalized solutions.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Discretion</strong> — We respect our clients' privacy and handle every transaction with the highest level of confidentiality.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Innovation</strong> — We leverage modern technology, market intelligence, and strategic marketing to create better outcomes for our clients.
              </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center section-title">Our Team</h2>
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="w-32 h-32 bg-muted rounded-xl mx-auto mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {teamMembers.map((member, index) => (
                  <Card key={member.id} className="text-center team-card" style={{ animationDelay: `${index * 0.15}s` }}>
                    <CardContent className="pt-8 pb-6">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden bg-muted">
                        {member.photo ? (
                          <img
                            src={getOptimizedImageUrl("team-photos", member.photo, { width: 400, quality: 75, format: 'webp' }) || getFileUrl("team-photos", member.photo) || member.photo}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1 transition-colors duration-300 hover:text-primary">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{member.position}</p>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-8 xs:mb-8 sm:mb-10 md:mb-12 text-center section-title">Our Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center achievement-item">
                  <p className="text-2xl font-bold text-primary mb-2 transition-all duration-300">{achievement.split(' ')[0]}</p>
                  <p className="text-sm text-muted-foreground transition-all duration-300">{achievement.split(' ').slice(1).join(' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 section-title">Why Choose Luxury Properties Ltd?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-4 sm:gap-5 md:gap-6 mb-6 xs:mb-6 sm:mb-8">
              <div className="bg-card rounded-xl p-6 border why-choose-card">
                <h3 className="text-lg font-semibold mb-3">Exclusive Luxury Listings</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access Nigeria's most exclusive portfolio of luxury homes, high-end apartments, and premium commercial 
                  properties. Our off-market network provides opportunities you won't find anywhere else.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border why-choose-card">
                <h3 className="text-lg font-semibold mb-3">Concierge Real Estate Service</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  From property sourcing to legal due diligence, our dedicated concierge team manages every detail of 
                  your real estate journey, ensuring a seamless, stress-free experience.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border why-choose-card">
                <h3 className="text-lg font-semibold mb-3">Off-Market Properties</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Gain privileged access to off-market luxury properties — exclusive high-end homes and investment 
                  opportunities not advertised on public listing platforms.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border why-choose-card">
                <h3 className="text-lg font-semibold mb-3">Expert Property Advisory</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our award-winning team provides comprehensive property advisory services, from market analysis and 
                  property valuation to investment strategy and portfolio management.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20 epan-section">
          <div className="max-w-4xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <h2 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 section-title">EPAN Initiative</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The Estate Professionals Association Network (EPAN) is our commitment to building a collaborative 
              community of real estate professionals. Through EPAN, we provide training, networking opportunities, 
              and resources to help agents and brokers grow their careers while maintaining the highest standards 
              of professionalism.
            </p>
            <a href="/epan" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium epan-button">
              Learn More About EPAN
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;