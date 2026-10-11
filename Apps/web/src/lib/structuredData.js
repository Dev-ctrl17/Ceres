// Structured Data (JSON-LD) generators for SEO/AEO/GEO
// Automatically generates schema.org markup for property listings
import { buildAbsoluteUrl, buildImageUrl, getCanonicalUrl } from './siteConfig.js';
import { buildPropertySeo } from './propertySeo.js';
import { company, getInternationalPhoneNumber } from '@/config/company.js';

const ORGANIZATION_ID = `${getCanonicalUrl('/')}#organization`;
const REAL_ESTATE_AGENT_ID = `${getCanonicalUrl('/')}#real-estate-agent`;

export const generatePropertySchema = (property, breadcrumbItems = [], amenities = [], listingImages = null) => {
  if (!property) return null;

  const url = getCanonicalUrl(`/properties/${property.slug}`);
  const title = String(property.title || buildPropertySeo(property).listingName).trim();
  const sourceImages = Array.isArray(listingImages)
    ? listingImages
    : [...(Array.isArray(property.images) ? property.images : []), property.image_url];
  const images = sourceImages
    .filter((image) => typeof image === 'string' && image.trim())
    .map((image) => buildImageUrl(image.trim()));

  const listing = {
    '@type': 'RealEstateListing',
    '@id': `${url}#listing`,
    name: title,
    url,
    seller: { '@id': REAL_ESTATE_AGENT_ID },
    itemOffered: {
      '@type': 'House',
      name: title,
    },
  };
  const description = String(property.description || '').replace(/\s+/g, ' ').trim() || buildPropertySeo(property).description;
  listing.description = description;
  const address = { '@type': 'PostalAddress', addressCountry: 'NG' };
  if (property.address) address.streetAddress = String(property.address).trim();
  if (property.location || property.city) {
    address.addressLocality = String(property.location || property.city).trim();
  }
  if (property.state) address.addressRegion = String(property.state).trim();
  if (Object.keys(address).length > 2) listing.address = address;
  if (images.length) listing.image = [...new Set(images)];

  const bedrooms = Number(property.bedrooms);
  if (Number.isFinite(bedrooms) && bedrooms > 0) {
    listing.itemOffered.numberOfBedrooms = bedrooms;
  }
  const validAmenities = [...new Set(amenities.map((amenity) => String(amenity).trim()).filter(Boolean))];
  if (validAmenities.length) {
    listing.itemOffered.amenityFeature = validAmenities.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    }));
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
      seller: { '@id': REAL_ESTATE_AGENT_ID },
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
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: company.name,
        url: getCanonicalUrl('/'),
        email: company.email,
        telephone: company.phoneNumbers.map(getInternationalPhoneNumber),
        address: {
          '@type': 'PostalAddress',
          streetAddress: company.address.streetAddress,
          addressLocality: company.address.addressLocality,
          addressRegion: company.address.addressRegion,
          addressCountry: company.address.addressCountry,
        },
        sameAs: company.socialLinks.map(({ url }) => url),
      },
      {
        '@type': 'RealEstateAgent',
        '@id': REAL_ESTATE_AGENT_ID,
        name: company.name,
        url: getCanonicalUrl('/'),
        email: company.email,
        telephone: company.phoneNumbers.map(getInternationalPhoneNumber),
        address: {
          '@type': 'PostalAddress',
          streetAddress: company.address.streetAddress,
          addressLocality: company.address.addressLocality,
          addressRegion: company.address.addressRegion,
          addressCountry: company.address.addressCountry,
        },
        areaServed: ['Lagos', 'Abuja', 'Port Harcourt', 'Nigeria'],
        sameAs: company.socialLinks.map(({ url }) => url),
        parentOrganization: { '@id': ORGANIZATION_ID },
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