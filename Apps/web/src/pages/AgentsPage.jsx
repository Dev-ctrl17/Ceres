import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAgents } from '@/hooks/useAgents.js';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star } from 'lucide-react';
import { getFileUrl } from '@/lib/supabaseService';

const AgentsPage = () => {
  const { agents, loading } = useAgents();

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
      </Helmet>

      <Header />

      <main>
        <section className="relative py-24 xs:py-28 sm:py-32 lg:py-40 xl:py-44 min-h-[60vh] xs:min-h-[65vh] sm:min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/rKjnczKk/agent.jpg"
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
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                    <div className="w-32 h-32 bg-muted rounded-xl mx-auto mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
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
                    <Card key={agent.id} className="overflow-hidden agent-card hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-0">
                        <div className="relative w-full aspect-[4/3] bg-muted">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                              <span className="text-6xl font-bold text-primary/40">
                                {agent.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          {agent.rating && (
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                              <span className="text-xs font-semibold">{agent.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-semibold mb-1">{agent.name}</h3>
                          {agent.position && (
                            <p className="text-sm font-medium text-primary mb-2">{agent.position}</p>
                          )}
                          {agent.specialization && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.specialization}</p>
                          )}
                          {agent.listingscount && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <span>{agent.listingscount} active listings</span>
                            </div>
                          )}
                          {agent.locations && (
                            <p className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5">
                              <span className="text-sm leading-none">📍</span>
                              <span className="line-clamp-1">{agent.locations}</span>
                            </p>
                          )}
                          {agent.bio && (
                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                              {agent.bio}
                            </p>
                          )}
                          <div className="space-y-2 text-xs border-t pt-3">
                            {agent.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{agent.email}</span>
                              </div>
                            )}
                            {agent.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
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