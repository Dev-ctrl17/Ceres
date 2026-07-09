// Lightweight index - only metadata. Full content loaded from individual post files.
export const blogPostsData = [
  {
    title: "The Ultimate Real Estate Buying Guide: Navigating Property Ownership in Nigeria",
    slug: "nigerian-real-estate-buying-guide",
    date: "2026-06-15",
    readTime: "12 min read",
    category: "Buying Guide",
    excerpt: "Complete guide to buying luxury property in Nigeria. Learn about legal requirements, documentation, and the entire purchasing process from expert real estate advisors.",
    metaDescription: "Master the Nigerian property market with our definitive Buying Guide. Learn about titles, budgeting, and luxury investments from Luxury Properties Ltd.",
    ogImage: "https://www.image2url.com/r2/default/images/1781317508584-4922cb5a-da2f-48f4-960b-a7e54f993113.png",
    datePublished: "2026-06-12",
    dateModified: "2026-06-15"
  },
  {
    title: "Nigerian Real Estate News: The Ultimate Guide to Property Market Trends and Wealth Opportunities",
    slug: "real-estate-news-market-trends",
    date: "2026-06-15",
    readTime: "10 min read",
    category: "Market Analysis",
    excerpt: "Stay updated with the latest real estate market trends in Nigeria. Analysis of property prices, investment opportunities, and market forecasts for 2026.",
    metaDescription: "Stay ahead with the latest Nigerian Real Estate News. Discover property market trends, luxury housing updates, and commercial development insights for 2026.",
    ogImage: "https://www.image2url.com/r2/default/images/1781343192829-bba8453f-73c0-4266-8a8f-6f521887ad7b.png",
    datePublished: "2026-06-12",
    dateModified: "2026-06-15"
  },
  {
    title: "The Ultimate Blueprint for Wealth Creation: Elite Real Estate Investment Tips in Nigeria",
    slug: "real-estate-investment-tips-nigeria",
    date: "2026-06-15",
    readTime: "15 min read",
    category: "Investment",
    excerpt: "Expert investment strategies for Nigerian real estate. Learn how to maximize returns, identify profitable opportunities, and build a successful property portfolio.",
    metaDescription: "Discover elite real estate Investment Tips for the Nigerian market. Learn to scale property portfolios, secure passive income, and build long-term wealth.",
    ogImage: "https://www.image2url.com/r2/default/images/1781345566990-0bcfee71-8e6a-4bc3-a930-d44b522d6cd3.jpg",
    datePublished: "2026-06-12",
    dateModified: "2026-06-15"
  },
  {
    title: "The Ultimate Nigerian Property Selling Guide: Maximize Value and Close Faster",
    slug: "property-selling-guide-nigeria",
    date: "2026-06-15",
    readTime: "11 min read",
    category: "Selling Guide",
    excerpt: "Master the art of selling luxury property in Nigeria. From pricing strategies to staging tips, learn how to sell your property faster and at the best price.",
    metaDescription: "Unlock the secrets to a profitable sale with our comprehensive Selling Guide. Learn property valuation, staging, marketing, and legalities in the Nigerian real estate market.",
    ogImage: "https://www.image2url.com/r2/default/images/1781344578807-295c3506-ddda-4374-a3bd-f1625512e731.jpg",
    datePublished: "2026-06-12",
    dateModified: "2026-06-15"
  },
  {
    title: "Navigating the Nigerian Real Estate Market Trend: A 2026 Comprehensive Investor's Guide",
    slug: "market-trend-blog-post",
    date: "2026-06-15",
    readTime: "9 min read",
    category: "Market Analysis",
    excerpt: "In-depth analysis of current real estate market trends in Lagos, Abuja, and Port Harcourt. Expert forecasts and investment recommendations for 2026-2027.",
    metaDescription: "Discover how the latest real estate Market Trend in Nigeria shapes residential, commercial, and luxury property investments amidst economic shifts and PropTech growth.",
    ogImage: "https://www.image2url.com/r2/default/images/1781319914887-2e78908f-915f-4cd3-b493-7beb9216678a.jpg",
    datePublished: "2026-06-12",
    dateModified: "2026-06-15"
  },
  {
    title: "Diaspora Guide: How to Buy Luxury Property in Nigeria from Abroad 2026",
    slug: "diaspora-guide-buy-property-nigeria-abroad",
    date: "2026-06-16",
    readTime: "15 min read",
    category: "Buying Guide",
    excerpt: "Complete guide for diaspora Nigerians looking to invest in property back home. Remote buying process, legal requirements, and trusted agencies explained.",
    metaDescription: "Complete guide for diaspora Nigerians and foreigners on how to buy luxury property in Nigeria from abroad. Remote purchase process, virtual tours, escrow payments, and legal requirements.",
    ogImage: "",
    datePublished: "2026-06-16",
    dateModified: "2026-06-16"
  }
];

// Lazy load full post content
export async function loadPostContent(slug) {
  try {
    const module = await import(`./posts/${slug}.js`);
    return module.post;
  } catch {
    return null;
  }
}