import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Image, ExternalLink, Calendar, MapPin, TrendingUp, ArrowLeft, Download } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { proposalsApi } from '@/lib/supabaseService';
import { toast } from 'sonner';

const ClientSuccessDetailPage = () => {
  const { slug } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposal();
  }, [slug]);

  const fetchProposal = async () => {
    setLoading(true);
    try {
      const { data, error } = await proposalsApi.getBySlug(slug);
      if (error) throw error;
      
      if (!data) {
        toast.error('Proposal not found');
        return;
      }
      
      setProposal(data);
    } catch (error) {
      toast.error('Failed to load proposal');
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

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... — Luxury Properties Ltd</title>
        </Helmet>
        <Header />
        <main className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-muted rounded-xl mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!proposal) {
    return (
      <>
        <Helmet>
          <title>Proposal Not Found — Luxury Properties Ltd</title>
        </Helmet>
        <Header />
        <main className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Proposal Not Found</h1>
            <p className="text-muted-foreground mb-8">The proposal you're looking for doesn't exist or has been removed.</p>
            <Link to="/client-success">
              <Button>Back to Client Success</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = proposal.gallery?.length > 0 
    ? proposal.gallery 
    : proposal.cover_image_url 
      ? [proposal.cover_image_url] 
      : [];

  return (
    <>
      <Helmet>
        <title>{proposal.title} — Luxury Properties Ltd</title>
        <meta name="description" content={proposal.summary} />
        <link rel="canonical" href={`https://luxurypropertiesltd.com.ng/client-success/${proposal.slug}`} />
        <meta property="og:title" content={proposal.title} />
        <meta property="og:description" content={proposal.summary} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://luxurypropertiesltd.com.ng/client-success/${proposal.slug}`} />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        {proposal.cover_image_url && (
          <>
            <meta property="og:image" content={proposal.cover_image_url} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={proposal.title} />
            <meta name="twitter:image" content={proposal.cover_image_url} />
            <meta name="twitter:image:alt" content={proposal.title} />
          </>
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={proposal.title} />
        <meta name="twitter:description" content={proposal.summary} />
      </Helmet>

      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 bg-primary text-primary-foreground">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link to="/client-success" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Client Success
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{proposal.title}</h1>
            {proposal.client_name && (
              <p className="text-xl opacity-90">Client: {proposal.client_name}</p>
            )}
          </div>
        </section>

        {/* Result Highlight Badge */}
        {proposal.result_highlight && (
          <section className="py-8 bg-green-50 border-b border-green-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Result Highlight</p>
                  <p className="text-2xl font-bold text-green-900">{proposal.result_highlight}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
              {proposal.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{proposal.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Completed: {formatDate(proposal.date_completed)}</span>
              </div>
              {proposal.property_type && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{proposal.property_type}</span>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="aspect-video rounded-xl overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`${proposal.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="text-2xl font-bold mb-4">Case Study</h2>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {proposal.description}
              </div>
            </div>

            {/* Document Download */}
            {proposal.document_url && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Full Proposal Document</h3>
                        <p className="text-sm text-muted-foreground">Download or view the complete proposal PDF</p>
                      </div>
                    </div>
                    <a
                      href={proposal.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        View PDF
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Let us help you achieve your real estate goals. Contact us today for a consultation.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg">Contact Us</Button>
                </Link>
                <Link to="/properties">
                  <Button size="lg" variant="outline">Browse Properties</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ClientSuccessDetailPage;