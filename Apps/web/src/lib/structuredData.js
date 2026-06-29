// Structured Data (JSON-LD) generators for SEO/AEO/GEO
// Automatically generates schema.org markup for property listings

export const generatePropertySchema = (property) => {
  if (!property) return null;

  const images = property.images?.length 
    ? property.images 
    : property.image_url 
      ? [property.image_url] 
      : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Residence",
    "name": property.title,
    "description": property.description || `${property.title} in ${property.location}`,
    "url": `https://luxurypropertiesltd.com.ng/properties/${property.id}`,
    "image": images.map(img => 
      img.startsWith('http') ? img : `https://luxurypropertiesltd.com.ng${img}`
    ),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "NGN",
      "price": property.price,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.address || property.location,
      "addressLocality": property.city || "Lagos",
      "addressRegion": property.state || "Lagos State",
      "addressCountry": "NG",
    },
  };

  // Add optional fields only if they exist
  if (property.bedrooms) {
    schema.numberOfRooms = property.bedrooms;
  }

  if (property.area_sqm) {
    schema.floorSize = {
      "@type": "QuantitativeValue",
      "value": property.area_sqm,
      "unitText": "SQM",
    };
  }

  if (property.latitude && property.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude,
    };
  }

  if (property.year_built) {
    schema.yearBuilt = property.year_built;
  }

  if (property.property_type) {
    schema.additionalProperty = {
      "@type": "Property",
      "name": "Property Type",
      "value": property.property_type,
    };
  }

  if (property.tenure) {
    schema.additionalProperty = {
      ...schema.additionalProperty,
      "name": "Tenure",
      "value": property.tenure,
    };
  }

  // Add amenities as features
  if (property.amenities?.length > 0) {
    const amenities = Array.isArray(property.amenities) 
      ? property.amenities 
      : typeof property.amenities === 'string'
        ? property.amenities.split(',').map(a => a.trim())
        : [];
    
    if (amenities.length > 0) {
      schema.feature = amenities.map(amenity => ({
        "@type": "PropertyFeature",
        "name": amenity,
      }));
    }
  }

  return schema;
};

export const generateBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item,
    })),
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness", "Organization"],
    "name": "Luxury Properties Ltd",
    "description": "Premium luxury real estate agency in Nigeria. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.",
    "url": "https://luxurypropertiesltd.com.ng",
    "logo": "https://luxurypropertiesltd.com.ng/favicon.svg",
    "telephone": "+234-9056201176",
    "email": "info@luxurypropertiesltd.com.ng",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lagos",
      "addressRegion": "Lagos State",
      "addressCountry": "NG",
    },
    "priceRange": "₦50M - ₦5B",
    "areaServed": ["Lagos", "Abuja", "Port Harcourt", "Nigeria"],
    "sameAs": [
      "https://www.instagram.com/luxurypropertiesltd",
      "https://www.linkedin.com/company/luxurypropertiesltd",
      "https://www.facebook.com/luxurypropertiesltd",
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00",
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "16:00",
    },
  };
};

export const generateFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
};

export const generateItemListSchema = (properties, listName) => {
  if (!properties || properties.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "description": `Premium luxury properties in Lagos, Nigeria`,
    "numberOfItems": properties.length,
    "itemListElement": properties.map((property, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": property.title,
        "description": property.description?.substring(0, 160) || `${property.title} in ${property.location}`,
        "brand": {
          "@type": "Brand",
          "name": "Luxury Properties Ltd",
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "NGN",
          "price": property.price,
          "availability": "https://schema.org/InStock",
        },
        "url": `https://luxurypropertiesltd.com.ng/properties/${property.id}`,
      },
    })),
  };
};

// Helper to format price for display
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(price);
};

// Helper to generate AEO-friendly content
export const generateAEOContent = (property) => {
  if (!property) return '';

  const amenities = Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === 'string'
      ? property.amenities.split(',').map(a => a.trim())
      : [];

  return `
## About This Property

**${property.title}** is a ${property.property_type || 'property'} located in ${property.location}, ${property.city || 'Lagos'}, ${property.state || 'Lagos State'}, Nigeria.

### Key Details
- **Price:** ${formatPrice(property.price)}
- **Property Type:** ${property.property_type || 'Not specified'}
- **Bedrooms:** ${property.bedrooms || 'Not specified'}
- **Bathrooms:** ${property.bathrooms || 'Not specified'}
- **Area:** ${property.area_sqm ? `${property.area_sqm} sqm` : 'Not specified'}
- **Tenure:** ${property.tenure || 'Not specified'}
- **Year Built:** ${property.year_built || 'Not specified'}

### Description
${property.description || 'No description available.'}

### Amenities & Features
${amenities.length > 0 ? amenities.map(a => `- ${a}`).join('\n') : 'No amenities listed.'}

### Location
This property is situated in ${property.location}, ${property.city || 'Lagos'}, offering excellent access to local amenities and transportation.

### Frequently Asked Questions

**Q: How many bedrooms does this property have?**
A: This property has ${property.bedrooms || 'multiple'} bedrooms.

**Q: What is the price of this property?**
A: The price is ${formatPrice(property.price)}.

**Q: Where is this property located?**
A: This property is located at ${property.location}, ${property.city || 'Lagos'}, ${property.state || 'Lagos State'}, Nigeria.

**Q: What type of property is this?**
A: This is a ${property.property_type || 'property'} with ${property.bedrooms || 'multiple'} bedrooms and ${property.bathrooms || 'multiple'} bathrooms.

**Q: What amenities are available?**
A: This property features ${amenities.length > 0 ? amenities.slice(0, 5).join(', ') + (amenities.length > 5 ? ', and more' : '') : 'various amenities'}. 
  `.trim();
};