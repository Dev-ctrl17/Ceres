import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import ImageSlider from '@/components/ImageSlider.jsx';
import PropertyEnquiryForm from '@/components/PropertyEnquiryForm.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, CheckCircle, MessageCircle, Phone, Calendar, FileText, X, ChevronLeft, ChevronRight, Banknote, Home } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import { getFileUrl, getOptimizedImageUrl } from '@/lib/supabaseService';
import { generatePropertySchema, generateBreadcrumbSchema, generateAEOContent } from '@/lib/structuredData';
import { isUUID } from '@/lib/slug.js';

const parsePropertyDescription = (description) => {
  const lines = String(description || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const featurePattern = /^(?:✨|⭐|•|-|–)\s*/;
  const locationPattern = /^(?:📍|location\s*:?)\s*/i;
  const pricePattern = /^(?:💰|price\s*:?)\s*/i;
  const contactPattern = /^(?:📞|contact|enquir)/i;
  const appointmentPattern = /^(?:strictly|appointment)/i;
  const features = lines
    .filter((line) => featurePattern.test(line))
    .map((line) => line.replace(featurePattern, '').trim())
    .filter(Boolean);
  const locationLine = lines.find((line) => locationPattern.test(line));
  const priceLine = lines.find((line) => pricePattern.test(line));
  const contactIndex = lines.findIndex((line) => contactPattern.test(line));
  const contactLines = contactIndex >= 0
    ? lines.slice(contactIndex).filter((line) => !appointmentPattern.test(line))
    : [];
  const appointmentLine = lines.find((line) => appointmentPattern.test(line));
  const structured = Boolean(features.length || locationLine || priceLine || contactLines.length);
  const titleLine = lines.find((line) => {
    const letters = line.replace(/[^a-z]/gi, '');
    return letters.length > 8 && line === line.toUpperCase() && !featurePattern.test(line);
  });
  const excluded = new Set([
    ...features.map((feature) => lines.find((line) => line.includes(feature))),
    locationLine,
    priceLine,
    appointmentLine,
    ...contactLines,
  ].filter(Boolean));
  const overview = lines.filter((line) => line !== titleLine && !excluded.has(line));

  return {
    structured,
    titleLine,
    overview,
    features,
    location: locationLine?.replace(locationPattern, '').trim(),
    price: priceLine?.replace(pricePattern, '').trim(),
    contactLines,
    appointmentLine,
  };
};

const PropertyDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSliderIndex, setActiveSliderIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Legacy UUID redirect (edge func /api/propertyRedirect.js on prod;
        // this guard covers local dev + non-Vercel hosts).
        if (isUUID(slug)) {
          const { data: legacy, error: legacyError } = await supabase
            .from('properties')
            .select('slug')
            .eq('id', slug)
            .single();
          if (legacy?.slug) {
            navigate(`/properties/${legacy.slug}`, { replace: true });
            return;
          }
          if (legacyError) {
            console.error('Failed to resolve legacy UUID to slug:', legacyError);
          }
        }

        const { data: record, error } = await supabase
          .from('properties')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;

        setProperty(record);

        // Fetch similar properties
        const { data: similar, error: similarError } = await supabase
          .from('properties')
          .select('*')
          .eq('property_type', record.property_type)
          .neq('id', record.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!similarError) {
          setSimilarProperties(similar || []);
        }
      } catch (error) {
        console.error('Failed to fetch property:', error);
      } finally {
        setLoading(false);
        // Dispatch render-event for prerendering (vite-plugin-prerender / Puppeteer)
        // so the snapshot captures real property content, not the loading state.
        document.dispatchEvent(new Event('render-event'));
      }
    };

    fetchProperty();
  }, [slug, navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property not found</h1>
            <Link to="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getImageUrl = (image, width = 800) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return getOptimizedImageUrl("property-images", image, { width, quality: 75, format: 'webp' }) || getFileUrl("property-images", image) || image;
  };

  const images = property.images?.length ? property.images : property.image_url ? [property.image_url] : [];
  const videoTours = property.video_tour_url?.length
    ? property.video_tour_url
    : property.video_tour
      ? [property.video_tour]
      : [];
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Generate dynamic SEO title and description
  const bedrooms = property.bedrooms ? `${property.bedrooms}-Bed ` : '';
  const propertyType = property.property_type || 'Property';
  const location = property.location || property.city || 'Lagos';
  const seoTitle = `${property.title} | ${location} | Luxury Properties Ltd`;
  const seoDescription = property.description 
    ? `${property.description.substring(0, 155)}...` 
    : `${formatPrice(property.price)} ${propertyType} in ${location}. ${property.bedrooms || 'Multiple'} bedrooms, ${property.bathrooms || 'multiple'} bathrooms. Contact Luxury Properties Ltd for viewing.`;

  const amenitiesList = property.amenities
    ? (Array.isArray(property.amenities)
        ? property.amenities
        : typeof property.amenities === 'string'
          ? property.amenities.split(',').map(a => a.trim())
          : [])
    : [];
  const descriptionSections = parsePropertyDescription(property.description);

  // Generate structured data
  const propertySchema = generatePropertySchema(property);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: 'https://luxurypropertiesltd.com.ng' },
    { name: 'Properties', item: 'https://luxurypropertiesltd.com.ng/properties' },
    { name: property.title, item: `https://luxurypropertiesltd.com.ng/properties/${property.slug}` },
  ]);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={`https://luxurypropertiesltd.com.ng/properties/${property.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://luxurypropertiesltd.com.ng/properties/${property.slug}`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta property="og:site_name" content="Luxury Properties Ltd" />
        <meta property="og:locale" content="en_NG" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {images[0] && <meta name="twitter:image" content={images[0]} />}
        
        {/* JSON-LD Structured Data */}
        {propertySchema && (
          <script type="application/ld+json">
            {JSON.stringify(propertySchema)}
          </script>
        )}
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}
      </Helmet>

      <Header />

      <main className="py-12" data-prerender-ready="true">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {images.length > 0 && (
                <div className="mb-8 relative aspect-video rounded-2xl overflow-hidden">
                  <ImageSlider
                    images={images.map((img) => getImageUrl(img, 1200))}
                    onSlideChange={(index) => setActiveSliderIndex(index)}
                  />
                  {/* Invisible overlay to handle lightbox clicks on the slider */}
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() => { setCurrentImageIndex(activeSliderIndex); setLightboxOpen(true); }}
                  />
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  {property.is_verified && (
                    <Badge className="bg-primary text-primary-foreground">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-6 mb-6">
                  <p className="text-4xl font-bold text-primary">{formatPrice(property.price)}</p>
                  {property.property_type && (
                    <Badge variant="outline" className="text-base px-4 py-2">{property.property_type}</Badge>
                  )}
                </div>

                {(property.bedrooms || property.bathrooms) && (
                  <div className="flex items-center space-x-6 text-muted-foreground mb-8">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="w-5 h-5 mr-2" />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="w-5 h-5 mr-2" />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {property.description && (
                descriptionSections.structured ? (
                  <section className="mb-10 space-y-6" aria-labelledby="property-overview-heading">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                        Private Residence Brief
                      </p>
                      <h2 id="property-overview-heading" className="text-2xl sm:text-3xl font-bold mb-4">
                        A considered home in {location}
                      </h2>
                      {descriptionSections.titleLine && (
                        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-4">
                          {descriptionSections.titleLine}
                        </p>
                      )}
                      <div className="space-y-3 text-muted-foreground leading-8">
                        {descriptionSections.overview.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    {descriptionSections.features.length > 0 && (
                      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Home className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Key features</h3>
                            <p className="text-sm text-muted-foreground">What makes this residence stand out</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {descriptionSections.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm sm:text-base">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(descriptionSections.location || descriptionSections.price) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {descriptionSections.location && (
                          <div className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              Location
                            </div>
                            <p className="font-medium">{descriptionSections.location}</p>
                          </div>
                        )}
                        {descriptionSections.price && (
                          <div className="rounded-xl border bg-card p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                              <Banknote className="h-4 w-4 text-primary" />
                              Asking price
                            </div>
                            <p className="font-semibold text-primary">{descriptionSections.price}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {descriptionSections.contactLines.length > 0 && (
                      <div className="rounded-2xl bg-slate-950 p-5 sm:p-6 text-white">
                        <div className="flex items-start gap-3">
                          <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">Arrange a private inspection</h3>
                            <div className="mt-2 space-y-1 text-sm text-slate-300">
                              {descriptionSections.contactLines.map((line, index) => (
                                <p key={index}>{line.replace(/^📞\s*/, '')}</p>
                              ))}
                            </div>
                            <p className="mt-3 text-sm text-primary">
                              {descriptionSections.appointmentLine || 'Appointments are strictly by arrangement.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                ) : (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Description</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
                  </div>
                )
              )}

              {amenitiesList.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Amenities & Features</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {amenitiesList.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videoTours.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">
                    {videoTours.length > 1 ? 'Video Tours' : 'Video Tour'}
                  </h2>
                  <div className={`grid gap-4 ${videoTours.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    {videoTours.map((tour, index) => (
                      <div key={index} className="aspect-video rounded-2xl overflow-hidden bg-black">
                        {/^https?:\/\/.*\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(tour) ? (
                          <video
                            src={tour}
                            controls
                            className="w-full h-full"
                            preload="metadata"
                          />
                        ) : (
                          <iframe
                            src={tour}
                            width="100%"
                            height="100%"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`Property Video Tour ${index + 1}`}
                          ></iframe>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Property Location"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 mb-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6">Interested in this property?</h3>
                  
                  {/* Primary CTA: Call Now */}
                  <a
                    href="tel:+2349056201176"
                    className="w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground font-bold text-base px-6 py-4 rounded-xl mb-4 transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] shadow-lg"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now — +234 905 620 1176
                  </a>

                  {/* WhatsApp Now */}
                  <a
                    href={`https://wa.me/2347039726375?text=I'm%20interested%20in%20${encodeURIComponent(property.title)}%20in%20${encodeURIComponent(property.location || '')}%20-%20₦${property.price?.toLocaleString() || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-base px-6 py-4 rounded-xl mb-4 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Now
                  </a>

                  {/* Book Inspection */}
                  <Link
                    to={`/contact?property=${encodeURIComponent(property.slug)}&inquiry=inspection`}
                    className="w-full inline-flex items-center justify-center gap-3 bg-transparent border-2 border-primary text-primary font-bold text-base px-6 py-4 rounded-xl mb-4 transition-all duration-300 hover:bg-primary/5 hover:scale-[1.02]"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Inspection
                  </Link>

                  {/* Request Details - opens contact form inline */}
                  <details className="group mb-4">
                    <summary className="w-full inline-flex items-center justify-center gap-3 bg-muted hover:bg-muted/80 text-foreground font-bold text-base px-6 py-4 rounded-xl transition-all duration-300 cursor-pointer list-none hover:scale-[1.02]">
                      <FileText className="w-5 h-5" />
                      Request Details
                    </summary>
                    <div className="mt-4 pt-4 border-t">
                      <ContactForm propertyId={property.id} />
                    </div>
                  </details>
                  <div className="border-t pt-4 text-center">
                    <p className="mb-3 text-sm text-muted-foreground">Know someone looking for a home?</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {similarProperties.length > 0 && (
            <section className="mt-20">
              <h2 className="text-3xl font-bold mb-8">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {similarProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-primary transition-colors bg-black/50 hover:bg-black/70 rounded-full p-3 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          
          <div className="max-w-6xl w-full">
            <img
              src={getImageUrl(images[currentImageIndex], 1200)}
              alt={`${property.title} ${currentImageIndex + 1}`}
              className="w-full h-auto rounded-xl max-h-[80vh] object-contain"
              loading="lazy"
            />
            <div className="flex justify-center space-x-4 mt-6">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-primary' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default PropertyDetailsPage;