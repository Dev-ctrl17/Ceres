// Vercel Edge Function for SSR of property pages
// This enables crawlers to see fully rendered property listings

import { createClient } from '@supabase/supabasejs';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).send('Property ID required');
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    );

    // Fetch property data
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !property) {
      return res.status(404).send('Property not found');
    }

    // Format price
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(price);
    };

    // Parse amenities
    const amenitiesList = property.amenities
      ? (Array.isArray(property.amenities))
          ? property.amenities
          : typeof property.amenities === 'string'
            ? property.amenities.split(',').map(a => a.trim())
            : [])
      : [];

    const images = property.images?.length ? property.images : property.image_url ? [property.image_url] : [];
    const primaryImage = images[0] || 'https://luxurypropertiesltd.com.ng/og-image.png';

    // Build JSON-LD structured data
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Residence",
      "name": property.title,
      "description": property.description || `${property.title} in ${property.location}`,
      "image": images.map(img => img.startsWith('http') ? img : `https://luxurypropertiesltd.com.ng${img}`),
      "url": `https://luxurypropertiesltd.com.ng/properties/${property.id}`,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "NGN",
        "price": property.price,
        "availability": "https://schema.org/InStock"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.address || property.location,
        "addressLocality": property.city || "Lagos",
        "addressRegion": property.state || "Lagos State",
        "addressCountry": "NG"
      },
      "numberOfRooms": property.bedrooms || undefined,
      "floorSize": property.area_sqm ? {
        "@type": "QuantitativeValue",
        "value": property.area_sqm,
        "unitText": "SQM"
      } : undefined,
      "geo": property.latitude && property.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": property.latitude,
        "longitude": property.longitude
      } : undefined
    };

    // Remove undefined values from JSON-LD
    Object.keys(jsonLd).forEach(key => {
      if (jsonLd[key] === undefined) delete jsonLd[key];
    });
    if (jsonLd.offers) {
      Object.keys(jsonLd.offers).forEach(key => {
        if (jsonLd.offers[key] === undefined) delete jsonLd.offers[key];
      });
    }

    // Render HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${property.title} - Luxury Properties Ltd</title>
  <meta name="description" content="${(property.description || `${property.title} in ${property.location}`).substring(0, 160)}" />
  <link rel="canonical" href="https://luxurypropertiesltd.com.ng/properties/${property.id}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${property.title} - Luxury Properties Ltd" />
  <meta property="og:description" content="${(property.description || `${property.title} in ${property.location}`).substring(0, 160)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://luxurypropertiesltd.com.ng/properties/${property.id}" />
  <meta property="og:image" content="${primaryImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${property.title}" />
  <meta property="og:site_name" content="Luxury Properties Ltd" />
  <meta property="og:locale" content="en_NG" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${property.title} - Luxury Properties Ltd" />
  <meta name="twitter:description" content="${(property.description || `${property.title} in ${property.location}`).substring(0, 160)}" />
  <meta name="twitter:image" content="${primaryImage}" />
  <meta name="twitter:image:alt" content="${property.title}" />
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd)}
  </script>
  
  <!-- BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://luxurypropertiesltd.com.ng"},
      {"@type": "ListItem", "position": 2, "name": "Properties", "item": "https://luxurypropertiesltd.com.ng/properties"},
      {"@type": "ListItem", "position": 3, "name": "${property.title.replace(/"/g, '\\"')}", "item": "https://luxurypropertiesltd.com.ng/properties/${property.id}"}
    ]
  }
  </script>
  
  <style>
    body { font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .price { font-size: 2rem; font-weight: bold; color: #2563eb; }
    .badge { display: inline-block; padding: 4px 12px; background: #2563eb; color: white; border-radius: 4px; }
    .amenities { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .amenity { display: flex; align-items: center; gap: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${property.title}</h1>
    <p class="price">${formatPrice(property.price)}</p>
    ${property.property_type ? `<span class="badge">${property.property_type}</span>` : ''}
    ${property.bedrooms ? `<p>${property.bedrooms} Bedrooms</p>` : ''}
    ${property.bathrooms ? `<p>${property.bathrooms} Bathrooms</p>` : ''}
    ${property.area_sqm ? `<p>${property.area_sqm} sqm</p>` : ''}
    <p><strong>Location:</strong> ${property.location}</p>
    ${property.description ? `<div class="description"><h2>Description</h2><p>${property.description}</p></div>` : ''}
    ${amenitiesList.length > 0 ? `
      <div class="amenities">
        <h2>Amenities & Features</h2>
        ${amenitiesList.map(a => `<div class="amenity"><span>✓</span> ${a}</div>`).join('')}
      </div>
    ` : ''}
    <p><em>View full details at <a href="https://luxurypropertiesltd.com.ng/properties/${property.id}">luxurypropertiesltd.com.ng/properties/${property.id}</a></em></p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Robots-Tag', 'index, follow, max-snippet:-1, max-image-preview:large');
    res.status(200).send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  }
}