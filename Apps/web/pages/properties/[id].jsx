import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bed, Bath, Square, MapPin, Phone, Mail, 
  ArrowLeft, Share2, Heart, Calendar, Home
} from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/lib/supabaseClient';
import { getFileUrl } from '@/lib/supabaseService';

const PropertyDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Property not found');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyImages = () => {
    if (!property) return [];
    if (property.images && property.images.length > 0) {
      return property.images;
    }
    if (property.image_url) {
      return [property.image_url];
    }
    return [];
  };

  const images = getPropertyImages();

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Property... | Luxury Properties Ltd</title>
        </Head>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading property details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Head>
          <title>Property Not Found | Luxury Properties Ltd</title>
        </Head>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Property Not Found</h1>
            <p className="text-muted-foreground mb-8">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/properties')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{property.title} | Luxury Properties Ltd</title>
        <meta name="description" content={property.description?.slice(0, 160)} />
      </Head>

      <Header />

      <main>
        <section className="py-8 xs:py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/properties')}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-4">
                  {images[selectedImage] ? (
                    <img
                      src={images[selectedImage].startsWith('http') ? images[selectedImage] : getFileUrl('property-images', images[selectedImage])}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={img.startsWith('http') ? img : getFileUrl('property-images', img)}
                          alt={`${property.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      {property.location}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-6">
                  ₦{Number(property.price).toLocaleString()}
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {property.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      <span>{property.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-muted-foreground" />
                      <span>{property.bathrooms} Bathrooms</span>
                    </div>
                  )}
                  {property.area_sqft && (
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-muted-foreground" />
                      <span>{property.area_sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary">{property.property_type}</Badge>
                  <Badge variant="secondary">{property.purpose}</Badge>
                  <Badge variant="outline">{property.status}</Badge>
                </div>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {property.description}
                </p>

                <div className="border-t pt-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-medium">{property.property_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                      <p className="font-medium">{property.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{property.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Listed</p>
                      <p className="font-medium">
                        {new Date(property.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" onClick={() => setShowContactForm(true)}>
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Agent
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1">
                    <Mail className="w-5 h-5 mr-2" />
                    Send Inquiry
                  </Button>
                </div>
              </div>
            </div>

            {showContactForm && (
              <Card className="mb-12">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Interested in this property?</h3>
                  <p className="text-muted-foreground mb-6">
                    Fill out the form below and one of our agents will get back to you within 24 hours.
                  </p>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Your Name" required />
                    <Input placeholder="Your Email" type="email" required />
                    <Input placeholder="Your Phone" type="tel" required />
                    <Input placeholder="Subject" required />
                    <textarea
                      placeholder="I'm interested in this property. Please contact me with more information."
                      className="col-span-1 md:col-span-2 min-h-[100px] px-4 py-2 rounded-md border border-input bg-background"
                      required
                    ></textarea>
                    <div className="md:col-span-2">
                      <Button type="submit" size="lg">Send Inquiry</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PropertyDetailsPage;