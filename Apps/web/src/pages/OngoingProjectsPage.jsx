import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { HardHat, Calendar, MapPin, FileText } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { useOngoingProjects } from '@/hooks/useOngoingProjects';

const statusBadgeColor = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700';
    case 'Nearing Completion':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

const OngoingProjectsPage = () => {
  const { projects, loading } = useOngoingProjects();

  return (
    <>
      <Helmet>
        <title>Ongoing Projects — Luxury Properties Ltd</title>
        <meta name="description" content="Explore our ongoing property development projects across Nigeria. Stay updated on estimated delivery dates, locations, and project status." />
        <link rel="canonical" href="https://luxurypropertiesltd.com.ng/ongoing-projects" />
        <meta property="og:title" content="Ongoing Projects — Luxury Properties Ltd" />
        <meta property="og:description" content="Explore our ongoing property development projects across Nigeria. Stay updated on estimated delivery dates, locations, and project status." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://luxurypropertiesltd.com.ng/ongoing-projects" />
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ongoing Projects — Luxury Properties Ltd" />
        <meta name="twitter:description" content="Explore our ongoing property development projects across Nigeria. Stay updated on estimated delivery dates, locations, and project status." />
      </Helmet>

      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-24 bg-primary text-primary-foreground">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Ongoing Projects</h1>
              <p className="text-xl max-w-3xl mx-auto opacity-90">
                Discover our current property development projects across Nigeria. We're building the future of luxury living.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
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
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <HardHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Ongoing Projects</h3>
                <p className="text-muted-foreground">Check back soon for our latest development projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="aspect-video bg-muted rounded-t-xl overflow-hidden relative">
                        {project.image_url ? (
                          <img
                            src={project.image_url.startsWith('http') ? project.image_url : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/ongoing-project-images/${project.image_url}`}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                            <HardHat className="w-16 h-16 text-primary/50" />
                          </div>
                        )}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${statusBadgeColor(project.status)}`}>
                          {project.status}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{project.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Est. {project.estimated_delivery}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

export default OngoingProjectsPage;