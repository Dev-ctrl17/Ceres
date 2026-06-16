import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Award } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import { getFileUrl } from '@/lib/supabaseService';

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('teamMembers')
          .select('*')
          .order('created', { ascending: true });

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
        <meta name="description" content="Luxury Properties Ltd is the best luxury real estate agency Nigeria has to offer. Exclusive high-end properties, concierge service, off-market listings, and expert advisory in Lagos, Abuja, and across Nigeria. 15+ years of excellence." />
        <meta property="og:title" content="Best Luxury Real Estate Agency Nigeria | Luxury Properties Ltd" />
        <meta property="og:description" content="Discover why Luxury Properties Ltd is recognized as the best luxury real estate agency Nigeria. Premium properties, concierge service, and unmatched market expertise." />
        <meta name="twitter:title" content="Best Luxury Real Estate Agency Nigeria | Luxury Properties Ltd" />
        <meta name="twitter:description" content="Discover why Luxury Properties Ltd is recognized as the best luxury real estate agency Nigeria." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://www.image2url.com/r2/default/images/1781619633951-48ac0036-1929-4e9c-a44e-9ea02995669f.jpeg"
              alt="Best Luxury Real Estate Agency Nigeria - Luxury Properties Ltd" 
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center', transform: 'scale(0.8)', transformOrigin: 'center' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>Best Luxury Real Estate Agency Nigeria</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Nigeria's premier luxury real estate agency — trusted by high-net-worth clients for exclusive properties, concierge service, and expert advisory.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Why We Are the Best Luxury Real Estate Agency in Nigeria</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Luxury Properties Ltd is widely recognized as the <strong>best luxury real estate agency Nigeria</strong> has to offer. 
                Since our establishment, we have dedicated ourselves to providing trusted, professional, and innovative 
                real estate solutions to discerning clients across the country. As the premier luxury real estate agency 
                in Nigeria, we specialize in high-end properties in Lagos, Abuja, and Port Harcourt — from luxury penthouses 
                in Ikoyi to waterfront estates in Lekki and Banana Island.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                What sets us apart as the best luxury real estate agency in Nigeria is our commitment to exclusivity, 
                discretion, and white-glove service. Our clients gain access to off-market luxury properties not listed 
                on public portals, comprehensive concierge real estate services, and expert advisory from a team with 
                over 15 years of combined experience in the Nigerian luxury property market. With a 98% client success 
                rate and over 500 premium properties sold, our track record speaks for itself.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team of experienced luxury property professionals brings together decades of combined expertise in 
                the high-end real estate industry. From the moment you engage with us, you benefit from our deep market 
                intelligence, extensive network of exclusive listings, and unwavering commitment to transparency, 
                integrity, and exceptional customer service. We don't just find properties — we curate bespoke real 
                estate experiences tailored to your unique lifestyle and investment goals.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Card>
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To remain the best luxury real estate agency Nigeria by providing exceptional high-end property services 
                    that exceed client expectations through professionalism, innovation, and unwavering commitment to quality. 
                    We connect discerning buyers with the finest luxury homes, apartments, and investment properties across Nigeria.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be globally recognized as the definitive best luxury real estate agency Nigeria — the undisputed 
                    authority in premium property transactions, known for unparalleled integrity, innovation, and exceptional 
                    results in high-end real estate.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Our Values</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Integrity, transparency, professionalism, and client satisfaction are at the core of everything we do. 
                    As the best luxury real estate agency Nigeria, we uphold the highest standards in every transaction, 
                    ensuring our clients receive nothing less than exceptional service and premium results.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="w-32 h-32 bg-muted rounded-xl mx-auto mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="text-center">
                    <CardContent className="pt-8 pb-6">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden bg-muted">
                        {member.photo ? (
                          <img
                            src={getFileUrl("team-photos", member.photo) || member.photo}
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
                      <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
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

        <section className="py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-primary mb-2">{achievement.split(' ')[0]}</p>
                  <p className="text-sm text-muted-foreground">{achievement.split(' ').slice(1).join(' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">Why Choose Luxury Properties Ltd?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-3">Exclusive Luxury Listings</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access Nigeria's most exclusive portfolio of luxury homes, high-end apartments, and premium commercial 
                  properties. Our off-market network provides opportunities you won't find anywhere else.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-3">Concierge Real Estate Service</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  From property sourcing to legal due diligence, our dedicated concierge team manages every detail of 
                  your real estate journey, ensuring a seamless, stress-free experience.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-3">Off-Market Properties</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Gain privileged access to off-market luxury properties — exclusive high-end homes and investment 
                  opportunities not advertised on public listing platforms.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-lg font-semibold mb-3">Expert Property Advisory</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our award-winning team provides comprehensive property advisory services, from market analysis and 
                  property valuation to investment strategy and portfolio management.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">EPAN Initiative</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The Estate Professionals Association Network (EPAN) is our commitment to building a collaborative 
              community of real estate professionals. Through EPAN, we provide training, networking opportunities, 
              and resources to help agents and brokers grow their careers while maintaining the highest standards 
              of professionalism.
            </p>
            <a href="/epan" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
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