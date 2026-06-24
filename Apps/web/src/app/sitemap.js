import { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function sitemap() {
  const baseUrl = 'https://luxurypropertiesltd.com.ng';
  
  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1, changeFrequency: 'daily' },
    { url: `${baseUrl}/buy`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${baseUrl}/rent`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${baseUrl}/sell`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${baseUrl}/properties`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${baseUrl}/services`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/agents`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/reviews`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${baseUrl}/faq`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${baseUrl}/contact`, priority: 0.8, changeFrequency: 'monthly' },
  ];

  // Fetch dynamic properties
  let propertyPages = [];
  try {
    const { data: properties } = await supabaseServer
      .from('properties')
      .select('id, updated_at')
      .eq('status', 'Available')
      .limit(100);

    propertyPages = (properties || []).map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: new Date(property.updated_at),
      priority: 0.7,
      changeFrequency: 'weekly',
    }));
  } catch (error) {
    console.error('Failed to fetch properties for sitemap:', error);
  }

  // Blog posts (static list for now - will be dynamic when blog is migrated)
  const blogPosts = [
    { slug: 'most-expensive-neighborhoods-lagos-2026', date: '2026-06-16' },
    { slug: 'luxury-property-lekki-complete-guide', date: '2026-06-16' },
    { slug: 'how-to-buy-luxury-property-nigeria', date: '2026-06-16' },
    { slug: 'ikoyi-real-estate-guide', date: '2026-06-16' },
    { slug: 'banana-island-property-guide', date: '2026-06-16' },
    { slug: 'victoria-island-luxury-real-estate-guide', date: '2026-06-16' },
    { slug: 'diaspora-guide-buy-property-nigeria-abroad', date: '2026-06-16' },
    { slug: 'luxury-real-estate-investment-roi-lagos', date: '2026-06-16' },
    { slug: 'luxury-home-cost-lagos-2026', date: '2026-06-16' },
    { slug: 'best-areas-lagos-expats', date: '2026-06-16' },
    { slug: 'documents-needed-buy-property-nigeria', date: '2026-06-16' },
    { slug: 'off-market-properties-lagos', date: '2026-06-16' },
    { slug: 'certificate-of-occupancy-vs-governors-consent', date: '2026-06-16' },
    { slug: 'sell-luxury-property-fast-lagos', date: '2026-06-16' },
    { slug: 'governors-consent-timeline-lagos-2026', date: '2026-06-16' },
    { slug: 'luxury-concierge-real-estate-nigeria', date: '2026-06-16' },
    { slug: 'voice-search-optimized-faqs', date: '2026-06-16' },
  ];

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    priority: 0.7,
    changeFrequency: 'monthly',
  }));

  return [...staticPages, ...propertyPages, ...blogPages];
}