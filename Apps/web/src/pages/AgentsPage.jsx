import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useAgents } from '@/hooks/useAgents.js';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Star } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const AgentsPage = () => {
  const { agents, loading } = useAgents();

  return (
    <>
      <Helmet>
        <title>Our Agents - Luxury Properties Ltd</title>
        <meta name="description" content="Meet our team of professional real estate agents ready to help you find your perfect property." />
      </Helmet>

      <Header />

      <main>
        <section className="relative py-32 lg:py-44 min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/rKjnczKk/agent.jpg"
              alt="Our Professional Agents" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-background" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.02em' }}>Our Professional Agents</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
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
                {agents.map((agent) => (
                  <Card key={agent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden bg-muted">
                        {agent.photo ? (
                          <img
                            src={pb.files.getUrl(agent, agent.photo)}
                            alt={agent.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-4xl font-bold text-primary">
                              {agent.name.charAt(0)}
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
                ))}
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