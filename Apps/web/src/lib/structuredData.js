// Structured Data (JSON-LD) generators for SEO/AEO/GEO
// Automatically generates schema.org markup for property listings
import { buildAbsoluteUrl, buildImageUrl, getCanonicalUrl } from './siteConfig.js';
import { buildPropertySeo } from './propertySeo.js';

const ORGANIZATION_ID = `${getCanonicalUrl('/')}#organization`;

export const generatePropertySchema = (property, breadcrumbItems = []) => {
  if (!property) return null;

  const url = getCanonicalUrl(`/properties/${property.slug}`);
  const title = buildPropertySeo(property).heading;
  const propertyType = String(property.property_type || '').toLowerCase();
  const schemaType = propertyType.includes('apartment')
    ? 'Apartment'
    : /house|duplex|villa|terrace/.test(propertyType)
      ? 'House'
      : 'Residence';
  const sourceImages = Array.isArray(property.images) ? property.images : [];
  const images = [...sourceImages, property.image_url]
    .filter((image) => typeof image === 'string' && image.trim())
    .map((image) => buildImageUrl(image.trim()));
  if (images.length === 0) images.push(getCanonicalUrl('/og-image.png'));

  const listing = {
    '@type': schemaType,
    '@id': `${url}#listing`,
    name: title,
    url,
    image: [...new Set(images)],
    address: {
      '@type': 'PostalAddress',
      addressLocality: String(property.city || property.location || 'Lagos').trim(),
      addressRegion: String(property.state || 'Lagos State').trim(),
      addressCountry: 'NG',
    },
  };
  const description = String(property.description || '').replace(/\s+/g, ' ').trim();
  if (description) listing.description = description;
  if (property.address) listing.address.streetAddress = String(property.address).trim();
  if (Number(property.bedrooms) > 0) listing.numberOfBedrooms = Number(property.bedrooms);
  if (Number(property.bathrooms) > 0) listing.numberOfBathroomsTotal = Number(property.bathrooms);
  if (Number(property.area_sqm) > 0) {
    listing.floorSize = { '@type': 'QuantitativeValue', value: Number(property.area_sqm), unitCode: 'MTK' };
  }

  const graph = [listing];
  const price = Number(String(property.price || '').replace(/[^\d.]/g, ''));
  if (Number.isFinite(price) && price > 0) {
    listing.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'NGN',
      price,
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANIZATION_ID },
    };
  }

  const breadcrumb = generateBreadcrumbSchema(breadcrumbItems);
  if (breadcrumb) {
    const { '@context': context, ...breadcrumbEntity } = breadcrumb;
    graph.push(breadcrumbEntity);
  }

  return { '@context': 'https://schema.org', '@graph': graph };
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
      "item": getCanonicalUrl(item.item),
    })),
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": ORGANIZATION_ID,
    "name": "Luxury Properties Ltd",
    "description": "Premium luxury real estate agency in Nigeria. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.",
    "url": getCanonicalUrl('/'),
    "logo": "https://www.luxurypropertiesltd.com.ng/favicon.svg",
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
      "https://www.instagram.com/dmluxurypropertiesltd/",
      "https://www.linkedin.com/company/luxury-properties-ltd/posts/?feedView=all",
      "https://web.facebook.com/luxurypropertiesLtd",
      "https://www.youtube.com/@luxuryproperties_ltd",
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "16:00",
      },
    ],
  };
};

export const generateFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  const validFaqs = faqs
    .filter((faq) => faq && typeof faq.question === 'string' && typeof faq.answer === 'string')
    .map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    }))
    .filter((faq) => faq.question && faq.answer);

  if (validFaqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": validFaqs.map((faq) => ({
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
        "url": buildAbsoluteUrl(`/properties/${property.slug}`),
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