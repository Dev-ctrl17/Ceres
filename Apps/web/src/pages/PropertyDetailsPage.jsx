import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import HeroSlider from '@/components/HeroSlider.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, CheckCircle, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import supabase from '@/lib/supabaseClient';
import { getFileUrl } from '@/lib/supabaseService';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSliderIndex, setActiveSliderIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data: record, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setProperty(record);

        // Fetch similar properties
        const { data: similar, error: similarError } = await supabase
          .from('properties')
          .select('*')
          .eq('property_type', record.property_type)
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!similarError) {
          setSimilarProperties(similar || []);
        }
      } catch (error) {
        console.error('Failed to fetch property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

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

  const getImageUrl = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return getFileUrl("property-images", image) || image;
  };

  const images = property.images?.length ? property.images : property.image_url ? [property.image_url] : [];
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const amenitiesList = property.amenities
    ? (Array.isArray(property.amenities)
        ? property.amenities
        : typeof property.amenities === 'string'
          ? property.amenities.split(',').map(a => a.trim())
          : [])
    : [];

  return (
    <>
      <Helmet>
        <title>{`${property.title} - Luxury Properties Ltd`}</title>
        <meta name="description" content={property.description || `${property.title} in ${property.location}`} />
      </Helmet>

      <Header />

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {images.length > 0 && (
                <div className="mb-8 relative aspect-video rounded-2xl overflow-hidden">
                  <HeroSlider
                    slides={images.map((img) => ({
                      image: getImageUrl(img),
                      title: '',
                      subtitle: '',
                      ctaText: '',
                      ctaLink: '',
                    }))}
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
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

              {property.video_tour && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Video Tour</h2>
                  <div className="aspect-video rounded-2xl overflow-hidden">
                      <iframe
                        src={property.video_tour}
                      width="100%"
                      height="100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Property Video Tour"
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(property.location)}&layer=mapnik`}
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
                  <ContactForm propertyId={property.id} />
                  <div className="mt-6 pt-6 border-t">
                    <a
                      href={`https://wa.me/2347039726375?text=I'm interested in ${property.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp Us
                      </Button>
                    </a>
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
              src={getImageUrl(images[currentImageIndex])}
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