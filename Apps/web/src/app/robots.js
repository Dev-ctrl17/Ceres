export default function robots() {
  const baseUrl = 'https://luxurypropertiesltd.com.ng';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api/', '/_next/', '/private/'],
      crawlDelay: 1,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}