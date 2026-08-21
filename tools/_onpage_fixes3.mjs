// Part 3 fix list: remaining over-limit titles/metas across content pages.
export const fixes3 = [
  {
    f: 'blog/banana-island-property-guide.html',
    finds: [['<title>Banana Island Property Guide: Prices, Listings & Investment 2026</title>',
       '<title>Banana Island Property Guide: Prices & 2026 Guide</title>']],
  },
  {
    f: 'blog/diaspora-guide-buy-property-nigeria-abroad.html',
    finds: [['<title>Diaspora Guide: How to Buy Luxury Property in Nigeria from Abroad 2026</title>',
       '<title>Buy Luxury Property in Nigeria from Abroad</title>']],
  },
  {
    f: 'blog/documents-needed-buy-property-nigeria.html',
    finds: [['<title>What Documents Do I Need to Buy Property in Nigeria? Checklist 2026</title>',
       '<title>Documents Needed to Buy Property in Nigeria</title>']],
  },
  {
    f: 'blog/how-to-buy-luxury-property-nigeria.html',
    finds: [
      ['<title>How to Buy Luxury Property in Nigeria: Step-by-Step Guide 2026</title>',
       '<title>How to Buy Luxury Property in Nigeria</title>'],
      ['<meta property="og:title" content="How to Buy Luxury Property in Nigeria: Step-by-Step Guide 2026">',
       '<meta property="og:title" content="How to Buy Luxury Property in Nigeria">'],
    ],
  },
  {
    f: 'blog/ikoyi-real-estate-guide.html',
    finds: [['<title>Ikoyi Real Estate Guide: Prices, Neighborhoods & Investment 2026</title>',
       '<title>Ikoyi Real Estate Guide: Prices & Investment</title>']],
  },
  {
    f: 'blog/luxury-home-cost-lagos-2026.html',
    finds: [['<title>How Much Does a Luxury Home Cost in Lagos in 2026? Price Guide</title>',
       '<title>How Much Does a Luxury Home Cost in Lagos?</title>']],
  },
  {
    f: 'blog/most-expensive-neighborhoods-lagos-2026.html',
    finds: [
      ['<title>Most Expensive Neighborhoods in Lagos: Complete Price Guide 2026</title>',
       '<title>Most Expensive Neighborhoods in Lagos (2026)</title>'],
      ['<meta property="og:title" content="Most Expensive Neighborhoods in Lagos: Complete Price Guide 2026">',
       '<meta property="og:title" content="Most Expensive Neighborhoods in Lagos (2026)">'],
    ],
  },
  {
    f: 'blog/off-market-properties-lagos.html',
    finds: [['<title>Off-Market Properties in Lagos: How to Access Exclusive Listings</title>',
       '<title>Off-Market Properties in Lagos (2026)</title>']],
  },
  {
    f: 'blog/real-estate-investment-tips-nigeria.html',
    finds: [['<title>10 Real Estate Investment Tips in Nigeria | Luxury Properties Ltd</title>',
       '<title>10 Real Estate Investment Tips for Nigeria</title>']],
  },
  {
    f: 'blog/sell-luxury-property-fast-lagos.html',
    finds: [["<title>How to Sell Your Luxury Property Fast in Lagos 2026 [Seller's Guide]</title>",
       '<title>Sell Your Luxury Property Fast in Lagos</title>']],
  },
  {
    f: 'blog/luxury-property-lekki-complete-guide.html',
    finds: [['<meta name="description" content="Complete guide to luxury properties in Lekki, Lagos. Explore Lekki Phase 1, Chevron Drive, and the best estates with homes, apartments, and investment tips.">',
       '<meta name="description" content="Guide to luxury properties in Lekki, Lagos. Explore Lekki Phase 1, Chevron Drive and the best estates with homes, apartments and investment tips.">']],
  },
  // Landing over-limit titles.
  {
    f: 'landing/buy-luxury-property-lekki.html',
    finds: [['<title>Buy Luxury Property in Lekki | Premium Homes & Apartments 2026</title>',
       '<title>Buy Luxury Property in Lekki, Lagos (2026)</title>']],
  },
  {
    f: 'landing/house-for-sale-lekki.html',
    finds: [['<title>House for Sale in Lekki | Luxury Properties Lekki Phase 1 & 2</title>',
       '<title>House for Sale in Lekki, Lagos (2026)</title>']],
  },
  {
    f: 'landing/shortlet-apartment-lagos.html',
    finds: [['<title>Shortlet Apartment Lagos | Luxury Shortlet & Serviced Apartments</title>',
       '<title>Shortlet Apartments in Lagos | Serviced Apartments</title>']],
  },
];