import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { HardHat, Calendar, MapPin, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useOngoingProject } from '@/hooks/useOngoingProjects';

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

// Detect YouTube / Vimeo links and convert them to an embeddable URL.
// Anything else is treated as a direct video file (e.g. an uploaded
// Supabase Storage URL) and rendered with a native <video> tag.
const getEmbedUrl = (url) => {
  if (!url) return null;

  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null; // not a recognized embed link — treat as a direct video file
};

const resolveImage = (img) =>
  img.startsWith('http')
    ? img
    : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/ongoing-project-images/${img}`;

const OngoingProjectDetailsPage = () => {
  const { id } = useParams();
  const { project, loading, notFound } = useOngoingProject(id);
  const [activeImage, setActiveImage] = useState(0);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading project...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !project) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center bg-background">
          <div className="text-center px-4">
            <HardHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This project may have been removed or the link is incorrect.
            </p>
            <Link
              to="/ongoing-projects"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ongoing Projects
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = project.image_urls?.length
    ? project.image_urls
    : project.image_url
    ? [project.image_url]
    : [];

  const embedUrl = getEmbedUrl(project.video_url);

  return (
    <>
      <Helmet>
        <title>{project.name} — Ongoing Projects — Luxury Properties Ltd</title>
        <meta
          name="description"
          content={project.description || `Details for ${project.name}, an ongoing property development by Luxury Properties Ltd.`}
        />
        <link rel="canonical" href={`https://luxurypropertiesltd.com.ng/ongoing-projects/${project.id}`} />
        <meta property="og:title" content={`${project.name} — Ongoing Projects`} />
        <meta
          property="og:description"
          content={project.description || `Details for ${project.name}, an ongoing property development by Luxury Properties Ltd.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://luxurypropertiesltd.com.ng/ongoing-projects/${project.id}`} />
        {images[0] && <meta property="og:image" content={resolveImage(images[0])} />}
      </Helmet>

      <Header />

      <main>
        <section className="py-8 bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/ongoing-projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ongoing Projects
            </Link>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              {/* Media column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video bg-muted rounded-2xl overflow-hidden relative">
                  {images.length > 0 ? (
                    <img
                      src={resolveImage(images[activeImage])}
                      alt={`${project.name} — image ${activeImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                      <HardHat className="w-20 h-20 text-primary/50" />
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${statusBadgeColor(project.status)}`}>
                    {project.status}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          activeImage === index ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={resolveImage(img)}
                          alt={`${project.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Video section */}
                {project.video_url && (
                  <div className="pt-2">
                    <h2 className="text-lg font-semibold mb-3">Project Video</h2>
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={`${project.name} video`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={project.video_url}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Details column */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-3">{project.name}</h1>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-4 border-t border-b py-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{project.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">{project.estimated_delivery || 'Nil'}</p>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">About This Project</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default OngoingProjectDetailsPage;
