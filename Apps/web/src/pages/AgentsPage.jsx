import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAgents } from '@/hooks/useAgents.js';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star } from 'lucide-react';
import { getFileUrl } from '@/lib/supabaseService';

const animationStyles = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  .hero-animate { animation: fadeInUp 1s ease-out forwards; }
  .hero-animate-delay { animation: fadeInUp 1s ease-out 0.3s forwards; opacity: 0; }
  .hero-image { animation: fadeIn 1.5s ease-out forwards; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
  .hero-image:hover { transform: scale(1.05); }
  .hero-section { animation: fadeIn 0.5s ease-out; }
  .agent-card { opacity: 0; animation: scaleIn 0.6s ease-out forwards; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease; }
  .agent-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.12); }
  .agent-card img { transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
  .agent-card:hover img { transform: scale(1.1); }
`;

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

      <style>{animationStyles}</style>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center hero-section">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/rKjnczKk/agent.jpg"
              alt="Our Professional Agents" 
              className="w-full h-full object-cover hero-image"
              loading="lazy"
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white hero-animate" style={{ letterSpacing: '-0.02em' }}>Our Professional Agents</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed hero-animate-delay">
              Work with experienced professionals who understand the market and your needs.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        {agent.specialization && (
                          <p className="text-sm text-muted-foreground mb-3">{agent.specialization}</p>
                        )}
                        {agent.rating && (
                          <div className="flex items-center justify-center mb-3">
                            <Star className="w-4 h-4 text-primary fill-primary mr-1" />
                            <span className="font-medium">{agent.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {agent.listingsCount && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {agent.listingsCount} active listings
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