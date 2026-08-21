// Part 2 fix list: remaining title/meta trims + root duplicate noindex.
export const fixes2 = [
  {
    f: 'blog/luxury-real-estate-investment-roi-lagos.html',
    finds: [
      ['<title>Is Luxury Real Estate in Lagos a Good Investment? ROI Analysis 2026</title>',
       '<title>Luxury Real Estate ROI in Lagos (2026)</title>'],
      ['<meta name="description" content="Calculate luxury real estate investment ROI in Lagos. Real appreciation rates, rental yields, and returns for properties in Ikoyi, Victoria Island, and Lekki.">',
       '<meta name="description" content="Calculate luxury real estate ROI in Lagos. Real appreciation, rental yields and returns across Ikoyi, Victoria Island and Lekki.">'],
    ],
  },
  {
    f: 'blog/market-trend-blog-post.html',
    finds: [
      ["<title>Navigating the Nigerian Real Estate Market Trend: A 2026 Comprehensive Investor's Guide</title>",
       '<title>Nigerian Real Estate Market Trend (2026)</title>'],
    ],
  },
  {
    f: 'blog/property-selling-guide-nigeria.html',
    finds: [
      ['<title>The Ultimate Nigerian Property Selling Guide: Maximize Value | Luxury Properties Ltd</title>',
       '<title>How to Sell Property in Nigeria | Luxury Properties</title>'],
    ],
  },
  {
    f: 'blog/real-estate-news-market-trends.html',
    finds: [
      ['<title>Nigerian Real Estate News &amp; Market Trends | Luxury Properties</title>',
       '<title>Nigerian Real Estate News (2026)</title>'],
      ['<meta name="description" content="Stay ahead with the latest Nigerian Real Estate News. Discover property market trends, luxury housing updates, and commercial development insights for 2026.">',
       '<meta name="description" content="Stay ahead with the latest Nigerian real estate news. Property market trends, luxury updates and commercial insights for 2026.">'],
    ],
  },
  // Root duplicates -> noindex (identical content to canonical /blog/:slug; keep canonical).
  { f: 'buying-guides-blog.html', finds: [['</title>', '</title>\n    <meta name="robots" content="noindex,nofollow" />']] },
  { f: 'property_selling_guide_nigeria.html', finds: [['</title>', '</title>\n    <meta name="robots" content="noindex,nofollow" />']] },
  { f: 'Real_estate_news.html', finds: [['</title>', '</title>\n    <meta name="robots" content="noindex,nofollow" />']] },
  { f: 'market_trend_blog_post.html', finds: [['</title>', '</title>\n    <meta name="robots" content="noindex,nofollow" />']] },
  { f: 'Investment Tips.html', finds: [['</title>', '</title>\n    <meta name="robots" content="noindex,nofollow" />']] },
];