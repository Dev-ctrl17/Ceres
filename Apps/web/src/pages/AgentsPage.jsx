import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAgents } from '@/hooks/useAgents.js';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star } from 'lucide-react';
import { getFileUrl } from '@/lib/supabaseService';
import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';

const AgentsPage = () => {
  const { agents, loading } = useAgents();
  const { getBackground } = usePageBackgrounds();

  const getAgentPhotoUrl = (agent) => {
    // Admin form saves full public URL in 'photo', so return as-is
    if (agent.photo) {
      return agent.photo.startsWith("http")
        ? agent.photo
        : getFileUrl("agent-photos", agent.photo);
    }
    // Fallback for 'image' field (legacy support)
    if (agent.image) {
      return agent.image.startsWith("http")
        ? agent.image
        : getFileUrl("agent-photos", agent.image);
    }
    return null;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <>
      <Helmet>
        <title>Our Real Estate Agents in Lagos | Luxury Properties Ltd</title>
        <meta name="description" content="Meet our team of professional real estate agents in Lagos. Experienced luxury property experts ready to help you find your perfect property." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/agents" />
        <meta property="og:title" content="Our Real Estate Agents in Lagos | Luxury Properties Ltd" />
        <meta property="og:description" content="Meet our team of professional real estate agents. Experienced luxury property experts ready to help you find your perfect property." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/agents" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Our Real Estate Agents in Lagos | Luxury Properties Ltd" />
        <meta name="twitter:description" content="Meet our team of professional real estate agents in Lagos." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

        {/* JSON-LD BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://luxurypropertiesltd.com.ng"},
              {"@type": "ListItem", "position": 2, "name": "Agents", "item": "https://luxurypropertiesltd.com.ng/agents"}
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src={getBackground('agents_hero', "https://i.ibb.co/rKjnczKk/agent.jpg")}
              alt="Our Professional Agents" 
              className="w-full h-full object-cover hero-image"
              loading="eager"
              fetchpriority="high"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 text-center">
            <h1 className="heading-lg mb-4 xs:mb-4 sm:mb-5 md:mb-6 text-white hero-animate">Our Professional Agents</h1>
            <p className="text-base xs:text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay">
              Work with experienced professionals who understand the market and your needs.
            </p>
          </div>
        </section>

        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#183530] border border-[#c8a24d]/20 rounded-md p-6 animate-pulse">
                    <div className="w-32 h-32 bg-[#12211d] rounded-xl mx-auto mb-4"></div>
                    <div className="h-6 bg-[#12211d] rounded mb-2"></div>
                    <div className="h-4 bg-[#12211d] rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No agents available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                {agents.map((agent, index) => {
                  const photoUrl = getAgentPhotoUrl(agent);
                  return (
                    <Card
                      key={agent.id}
                      className="overflow-hidden agent-card hover:shadow-2xl hover:shadow-black/40 transition-shadow duration-300 rounded-md bg-[#183530] border border-[#c8a24d]/20"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-0">
                        {/* Photo */}
                        <div className="relative w-full aspect-[4/3] bg-[#12211d] overflow-hidden">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                              style={{ filter: 'saturate(0.92) contrast(1.03)' }}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#c8a24d]/20 to-transparent">
                              <span className="font-['Fraunces'] text-6xl font-medium text-[#c8a24d]/50">
                                {agent.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          {/* scrim for legibility of bottom badge */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#12211d]/90 pointer-events-none" />

                          {/* corner brackets — viewfinder / listing-frame motif */}
                          <span className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#c8a24d]/90" />
                          <span className="absolute top-4 right-4 w-6 h-6 border-t border-r border-[#c8a24d]/90" />

                          {/* monogram seal */}
                          <div className="absolute top-16 right-4 w-10 h-10 rounded-full bg-[#12211d] border border-[#c8a24d] flex items-center justify-center font-['Fraunces'] text-sm text-[#c8a24d]">
                            {getInitials(agent.name)}
                          </div>

                          {agent.rating && (
                            <div className="absolute top-16 left-4 bg-[#12211d]/70 backdrop-blur-sm border border-[#c8a24d]/30 px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-[#c8a24d] fill-[#c8a24d]" />
                              <span className="text-xs font-semibold text-[#f3efe4]">{agent.rating.toFixed(1)}</span>
                            </div>
                          )}

                          {/* position badge */}
                          <div className="absolute bottom-3 left-4 z-10 font-['IBM_Plex_Mono'] text-[10px] tracking-widest uppercase text-[#f3efe4] bg-[#12211d]/55 border border-[#c8a24d]/35 px-2.5 py-1 rounded-sm">
                            <span className="text-[#c8a24d]">{agent.position || 'Agent'}</span>
                            {agent.specialization && <> · {agent.specialization}</>}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="relative p-5 pt-6">
                          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-[#c8a24d] to-transparent" />

                          <h3 className="font-['Fraunces'] text-xl font-medium text-[#f3efe4] leading-tight mb-1">
                            {agent.name}
                          </h3>

                          {agent.locations && (
                            <p className="text-[11px] tracking-wider uppercase text-[#9db3a9] mb-3 flex items-center gap-1.5">
                              <span className="text-[#c8a24d]">📍</span>
                              <span className="line-clamp-1">{agent.locations}</span>
                            </p>
                          )}

                          {agent.listingscount && (
                            <div className="flex items-center gap-1.5 text-xs text-[#9db3a9] mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#c8a24d]"></div>
                              <span>{agent.listingscount} active listings</span>
                            </div>
                          )}

                          {agent.bio && (
                            <p className="font-['Fraunces'] italic text-[13px] leading-relaxed text-[#9db3a9] border-l-2 border-[#c8a24d]/30 pl-3 mb-4 line-clamp-2">
                              {agent.bio}
                            </p>
                          )}

                          <div className="space-y-2 text-xs border-t border-[#c8a24d]/20 pt-3 font-['IBM_Plex_Mono']">
                            {agent.email && (
                              <div className="flex items-center gap-2 text-[#f3efe4]">
                                <span className="w-6 h-6 min-w-6 rounded-full border border-[#c8a24d]/30 flex items-center justify-center">
                                  <Mail className="w-3 h-3 text-[#c8a24d]" />
                                </span>
                                <span className="truncate">{agent.email}</span>
                              </div>
                            )}
                            {agent.phone && (
                              <div className="flex items-center gap-2 text-[#f3efe4]">
                                <span className="w-6 h-6 min-w-6 rounded-full border border-[#c8a24d]/30 flex items-center justify-center">
                                  <Phone className="w-3 h-3 text-[#c8a24d]" />
                                </span>
                                <span>{agent.phone}</span>
                              </div>
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
      </main>

      <Footer />
    </>
  );
};

export default AgentsPage;