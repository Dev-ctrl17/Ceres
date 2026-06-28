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
    if (agent.photo) {
      return getFileUrl("agent-photos", agent.photo);
    }
    if (agent.image) {
      return getFileUrl("agent-photos", agent.image);
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Our Agents - Luxury Properties Ltd</title>
        <meta name="description" content="Meet our team of professional real estate agents ready to help you find your perfect property." />
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
                    <Card key={agent.id} className="overflow-hidden agent-card" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-6 text-center">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden bg-muted">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-4xl font-bold text-primary">
                                {agent.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                        {agent.position && (
                          <p className="text-sm font-medium text-primary mb-1">{agent.position}</p>
                        )}
                        {agent.specialization && (
                          <p className="text-sm text-muted-foreground mb-3">{agent.specialization}</p>
                        )}
                        {agent.rating && (
                          <div className="flex items-center justify-center mb-3">
                            <Star className="w-4 h-4 text-primary fill-primary mr-1" />
                            <span className="font-medium">{agent.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {agent.listingscount && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {agent.listingscount} active listings
                          </p>
                        )}
                        {agent.locations && (
                          <p className="text-sm text-muted-foreground mb-4">
                            📍 {agent.locations}
                          </p>
                        )}
                        {agent.bio && (
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {agent.bio}
                          </p>
                        )}
                        <div className="space-y-2 text-sm">
                          {agent.email && (
                            <div className="flex items-center justify-center text-muted-foreground">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>{agent.email}</span>
                            </div>
                          )}
                          {agent.phone && (
                            <div className="flex items-center justify-center text-muted-foreground">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{agent.phone}</span>
                            </div>
                          )}
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