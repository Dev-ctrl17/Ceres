import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import supabase from '@/lib/supabaseClient';
import { getFileUrl, getOptimizedImageUrl } from '@/lib/supabaseService';
import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';

const TeamMemberCard = ({ member, index, failedPhotos, setFailedPhotos, getMemberBio }) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const memberBio = getMemberBio(member.bio);
  const sentenceEndMatches = memberBio ? [...memberBio.matchAll(/\.(?=\s+[A-Z0-9]|$)/g)] : [];
  const firstFullStopMatch = sentenceEndMatches.find(({ index }) => (
    !/\b(?:Mr|Mrs|Ms|Dr|Prof)\.$/i.test(memberBio.slice(0, index + 1))
  ));
  const firstFullStopIndex = firstFullStopMatch?.index ?? -1;
  const firstSentence = firstFullStopIndex >= 0
    ? memberBio.slice(0, firstFullStopIndex + 1).trim()
    : memberBio;
  const hasLongBio = Boolean(memberBio && firstSentence && firstSentence.length < memberBio.length);
  const visibleBio = hasLongBio && !isBioExpanded
    ? firstSentence
    : memberBio;

  return (
    <Card
      className="group w-full min-w-0 overflow-hidden rounded-[12px] border border-[#E5DFD3] bg-white p-0 text-left shadow-[0_8px_24px_rgba(30,28,25,0.05),0_18px_45px_rgba(30,28,25,0.04)] transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(30,28,25,0.08),0_22px_52px_rgba(30,28,25,0.06)] md:min-h-[400px]"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="grid min-w-0 grid-cols-1 md:min-h-[400px] md:grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative aspect-[4/5] min-w-0 self-stretch overflow-hidden bg-[#f1ece3] md:aspect-auto md:h-full md:min-h-0">
          {member.photo && !failedPhotos.has(member.id) ? (
            <img
              src={getOptimizedImageUrl("team-photos", member.photo, { width: 700, quality: 80, format: 'webp' }) || getFileUrl("team-photos", member.photo) || member.photo}
              alt={`${member.name} - ${member.position || 'Team member'}`}
              className="block h-full w-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              onError={(event) => {
                console.warn('Team member photo failed to load', {
                  memberId: member.id,
                  name: member.name,
                  photo: member.photo,
                  requestedUrl: event.currentTarget.src,
                });
                setFailedPhotos((current) => new Set(current).add(member.id));
              }}
            />
          ) : (
            <img src="/default-team-avatar.svg" alt="" className="block h-full w-full object-cover object-[center_20%]" />
          )}
          <span className="absolute left-6 top-6 h-8 w-8 border-l border-t border-[#A9754B]/80" aria-hidden="true" />
        </div>

        <CardContent className="flex min-w-0 flex-1 flex-col justify-center overflow-visible p-7 sm:p-9 lg:p-12">
          <span className="mb-5 block h-px w-12 bg-[#A9754B]" aria-hidden="true" />
          <h3 className="font-serif text-3xl font-semibold leading-tight text-[#1E1C19] sm:text-4xl lg:text-[2.5rem]">
            {member.name}
          </h3>
          {member.position && (
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-[#A9754B] sm:text-sm">
              {member.position}
            </p>
          )}
          {memberBio && (
            <p className="mt-8 max-w-[55ch] font-sans text-[15px] leading-[1.85] text-[#3A3733] sm:text-base">
              {visibleBio}{' '}
              {hasLongBio && (
                <button
                  type="button"
                  className="font-semibold text-[#A9754B] underline decoration-[#A9754B]/50 underline-offset-4 transition-colors hover:text-[#1E1C19]"
                  onClick={() => setIsBioExpanded((expanded) => !expanded)}
                  aria-expanded={isBioExpanded}
                >
                  {isBioExpanded ? 'See less' : 'See more...'}
                </button>
              )}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [failedPhotos, setFailedPhotos] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const { getBackground } = usePageBackgrounds();

  const getBioText = (bio) => bio
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const getMemberBio = (bio) => getBioText(bio)
      ?.replace(/^At Luxury Properties Ltd[,\s]*/i, '')
      .replace(/Luxury Properties Ltd/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.])/g, '$1')
      .trim();

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
        <title>About Us | Luxury Properties Ltd — Nigeria Luxury Real Estate</title>
        <meta name="description" content="Meet Luxury Properties Ltd — Nigeria's premium luxury real estate agency. 15+ years, 500+ sales, off-market access in Lagos, Abuja & Port Harcourt." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/about" />
        <meta property="og:title" content="About Luxury Properties Ltd | Nigeria's Leading Real Estate Agency" />
        <meta property="og:description" content="Discover why Luxury Properties Ltd is Nigeria's most trusted luxury real estate agency. Premium properties, concierge service, and expert advisory since 2010." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/about" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Luxury Properties Ltd | Nigeria's Leading Real Estate Agency" />
        <meta name="twitter:description" content="Learn about Nigeria's premier luxury real estate agency. 15+ years of excellence in Lagos, Abuja, and Port Harcourt." />

        {/* JSON-LD Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Luxury Properties Ltd",
            "description": "Premium luxury real estate agency in Nigeria. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.",
            "url": "https://luxurypropertiesltd.com.ng",
            "logo": "https://luxurypropertiesltd.com.ng/favicon.svg",
            "telephone": "+234-9056201176",
            "email": "info@luxurypropertiesltd.com.ng",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Pedro, Gbagada",
              "addressLocality": "Lagos",
              "addressRegion": "Lagos State",
              "addressCountry": "NG"
            },
            "sameAs": [
              "https://www.instagram.com/luxurypropertiesltd",
              "https://www.linkedin.com/company/luxurypropertiesltd",
              "https://www.facebook.com/luxurypropertiesltd"
            ],
            "foundingDate": "2010",
            "numberOfEmployees": {
              "@type": "QuantitativeValue",
              "minValue": 50,
              "maxValue": 200
            }
          })}
        </script>

        {/* JSON-LD BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://luxurypropertiesltd.com.ng"},
              {"@type": "ListItem", "position": 2, "name": "About", "item": "https://luxurypropertiesltd.com.ng/about"}
            ]
          })}
        </script>
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
              <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white hero-animate">Nigeria's Leading Luxury Real Estate Advisory Company</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay-1">
            Luxury properties Ltd is Nigeria's trusted real estate ADVISORY firm,  delivering exceptional property solutions to discerning clients, investors, and high-net-worth individuals.
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
            <div className="grid grid-cols-1 gap-6 xs:gap-6 sm:gap-8 md:gap-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="card-hover mission-card h-full border border-border/70 bg-card shadow-[0_8px_24px_rgba(43,43,43,0.05)]">
                <CardContent className="flex flex-col p-8 text-left">
                  <span className="mb-5 h-px w-10 bg-[#A9754B]" aria-hidden="true" />
                  <h3 className="mb-3 text-xl font-semibold">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To deliver world-class luxury real estate solutions through exceptional service, expert market knowledge, and innovative strategies that help our clients buy, sell, and invest with confidence.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover vision-card h-full border border-border/70 bg-card shadow-[0_8px_24px_rgba(43,43,43,0.05)]">
                <CardContent className="flex flex-col p-8 text-left">
                  <span className="mb-5 h-px w-10 bg-[#A9754B]" aria-hidden="true" />
                  <h3 className="mb-3 text-xl font-semibold">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the most trusted and respected luxury real estate company in Nigeria, recognized for delivering outstanding client experiences, exceptional properties, and lasting value.
                  </p>
                </CardContent>
              </Card>
              </div>

              <Card className="card-hover values-card w-full border border-border/70 bg-card shadow-[0_8px_24px_rgba(43,43,43,0.05)]">
                <CardContent className="flex flex-col p-8 text-left">
                  <span className="mb-5 h-px w-10 bg-[#A9754B]" aria-hidden="true" />
                  <h3 className="mb-6 text-xl font-semibold">Our Core Values</h3>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                    <p className="border-t border-[#A9754B]/45 pt-4 text-muted-foreground leading-relaxed">
                      <strong>Integrity</strong> — We conduct every transaction with honesty, transparency, and professionalism.
                    </p>
                    <p className="border-t border-[#A9754B]/45 pt-4 text-muted-foreground leading-relaxed">
                      <strong>Excellence</strong> — We are committed to delivering exceptional service and consistently exceeding client expectations.
                    </p>
                    <p className="border-t border-[#A9754B]/45 pt-4 text-muted-foreground leading-relaxed">
                      <strong>Client-Centric Service</strong> — Every decision we make begins with understanding our clients' needs and delivering personalized solutions.
                    </p>
                    <p className="border-t border-[#A9754B]/45 pt-4 text-muted-foreground leading-relaxed">
                      <strong>Discretion</strong> — We respect our clients' privacy and handle every transaction with the highest level of confidentiality.
                    </p>
                    <p className="border-t border-[#A9754B]/45 pt-4 text-muted-foreground leading-relaxed">
                      <strong>Innovation</strong> — We leverage modern technology, market intelligence, and strategic marketing to create better outcomes for our clients.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-[#fafafa] py-16 xs:py-20 sm:py-24 lg:py-28">
          <div className="mx-auto w-full max-w-[1600px] px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl sm:mb-14 lg:mb-16">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#A9754B]">Our Team</p>
              <h2 className="font-serif text-3xl font-semibold leading-tight text-[#1E1C19] sm:text-4xl lg:text-[2.75rem]">
                Meet the people behind Luxury Properties Ltd.
              </h2>
              <span className="mt-6 block h-px w-12 bg-[#A9754B]" aria-hidden="true" />
            </div>
            {loading ? (
              <div className="grid w-full grid-cols-1 gap-6 animate-pulse md:grid-cols-2 lg:gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-[12px] border border-[#E5DFD3] bg-white md:min-h-[400px] md:grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="aspect-[4/5] bg-muted md:aspect-auto md:h-full md:min-h-0"></div>
                    <div className="space-y-5 p-8 sm:p-12">
                      <div className="h-4 w-24 rounded bg-muted"></div>
                      <div className="h-10 w-3/4 rounded bg-muted"></div>
                      <div className="h-24 w-full rounded bg-muted"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                {teamMembers.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    index={index}
                    failedPhotos={failedPhotos}
                    setFailedPhotos={setFailedPhotos}
                    getMemberBio={getMemberBio}
                  />
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