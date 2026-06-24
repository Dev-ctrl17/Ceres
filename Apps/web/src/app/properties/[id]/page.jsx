import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ContactForm from '@/components/ContactForm.jsx';
import { supabaseServer } from '@/lib/supabaseServer';
import { getFileUrl } from '@/lib/supabaseService';

export async function generateMetadata({ params }) {
  const property = await getProperty(params.id);
  
  if (!property) {
    return { title: 'Property Not Found' };
  }

  return {
    title: `${property.title} | Luxury Properties Ltd`,
    description: property.description || `${property.bedrooms} bedroom ${property.property_type} in ${property.location || 'Lagos'}. ₦${property.price?.toLocaleString()}`,
    alternates: {
      canonical: `/properties/${params.id}`,
    },
    openGraph: {
      title: property.title,
      description: property.description || `Luxury property in ${property.location}`,
      url: `https://luxurypropertiesltd.com.ng/properties/${params.id}`,
      images: property.images?.[0] ? [property.images[0]] : [],
    },
  };
}

async function getProperty(id) {
  try {
    const { data, error } = await supabaseServer
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    return null;
  }
}

const jsonLd = (property) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: property.title,
  description: property.description,
  image: property.images?.[0],
  offers: {
    '@type': 'Offer',
    priceCurrency: 'NGN',
    price: property.price,
    availability: 'https://schema.org/InStock',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: property.location || 'Lagos',
    addressCountry: 'NG',
  },
});

export default async function PropertyDetailsPage({ params }) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  const imageUrl = property.images?.[0] 
    ? (property.images[0].startsWith('http') ? property.images[0] : getFileUrl('property-images', property.images[0]))
    : 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(property)) }}
      />
      <Header />
      <main>
        <section className="py-16 xs:py-18 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10">
              {/* Image Gallery */}
              <div>
                <img
                  src={imageUrl}
                  alt={property.title}
                  className="w-full h-[400px] xs:h-[500px] object-cover rounded-2xl"
                  priority
                />
              </div>

              {/* Property Details */}
              <div>
                <h1 className="heading-lg mb-4">{property.title}</h1>
                <p className="text-2xl font-bold text-gold-primary mb-6">
                  ₦{property.price?.toLocaleString()}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {property.bedrooms && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{property.bedrooms}</p>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{property.bathrooms}</p>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                    </div>
                  )}
                  {property.area && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{property.area}</p>
                      <p className="text-sm text-muted-foreground">Sq Meters</p>
                    </div>
                  )}
                  {property.purpose && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-bold">{property.purpose}</p>
                      <p className="text-sm text-muted-foreground">Purpose</p>
                    </div>
                  )}
                </div>

                {property.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {property.location && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Location</h2>
                    <p className="text-muted-foreground">{property.location}</p>
                  </div>
                )}

                <div className="pt-6 border-t">
                  <h2 className="text-xl font-semibold mb-4">Interested in this property?</h2>
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}