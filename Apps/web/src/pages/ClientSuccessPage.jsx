import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Image, ExternalLink, Filter, Calendar, MapPin, TrendingUp } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { proposalsApi } from '@/lib/supabaseService';
import { toast } from 'sonner';

const ClientSuccessPage = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [propertyTypes, setPropertyTypes] = useState([]);

  useEffect(() => {
    fetchProposals();
  }, [filter]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const filters = { publishedOnly: true };
      if (filter !== 'all') {
        filters.propertyType = filter;
      }
      
      const { data, error } = await proposalsApi.getAll(filters);
      if (error) throw error;
      
      setProposals(data || []);
      
      // Extract unique property types for filter
      const types = [...new Set(data?.map(p => p.propertyType).filter(Boolean) || [])];
      setPropertyTypes(types);
    } catch (error) {
      toast.error('Failed to load proposals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Client Success Stories — Luxury Properties Ltd</title>
        <meta name="description" content="Explore our client success stories and case studies. See how we've helped families and investors achieve their real estate goals across Nigeria." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/client-success" />
        <meta property="og:title" content="Client Success Stories — Luxury Properties Ltd" />
        <meta property="og:description" content="Explore our client success stories and case studies. See how we've helped families and investors achieve their real estate goals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/client-success" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Client Success Stories — Luxury Properties Ltd" />
        <meta name="twitter:description" content="Explore our client success stories and case studies. See how we've helped families and investors achieve their real estate goals." />
      </Helmet>

      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-24 bg-primary text-primary-foreground">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Client Success Stories</h1>
              <p className="text-xl max-w-3xl mx-auto opacity-90">
                Real results for real people. Discover how we've helped our clients achieve their property goals across Nigeria.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        {propertyTypes.length > 0 && (
          <section className="py-6 bg-background border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All Properties
                  </Button>
                  {propertyTypes.map(type => (
                    <Button
                      key={type}
                      variant={filter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Proposals Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border">
                    <div className="aspect-video bg-muted rounded-xl mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Success Stories Yet</h3>
                <p className="text-muted-foreground">Check back soon for our latest client success stories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {proposals.map((proposal, index) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/client-success/${proposal.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        <div className="aspect-video bg-muted rounded-t-xl overflow-hidden relative">
                          {proposal.cover_image_url ? (
                            <img
                              src={proposal.cover_image_url}
                              alt={proposal.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                              <FileText className="w-16 h-16 text-primary/50" />
                            </div>
                          )}
                          {proposal.result_highlight && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                              {proposal.result_highlight}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {proposal.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {proposal.summary}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {proposal.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{proposal.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(proposal.date_completed)}</span>
                            </div>
                            {proposal.property_type && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{proposal.property_type}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
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

export default ClientSuccessPage;