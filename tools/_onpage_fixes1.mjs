// Apply on-page fixes to static HTML pages:
//  (1) trim over-long <title> to <= ~58 chars and meta description to <= 155
//  (2) add `<meta name="robots" content="noindex,nofollow">` to the 5 root
//      duplicate pages whose canonical points to a /blog/:slug post
// Each replacement is exact-string with a found-count assertion (==1).
import { readFileSync, writeFileSync } from 'fs';

const root = 'C:/Users/BELLO IREBAMI/Desktop/Javascript/Apps/web/public/';

// Replacement pairs: [finds, error count accumulator] are pushed per file below.
const fixes = [
  {
    f: 'blog/comparison/index.html',
    finds: [
      ['<title>Ikoyi vs Lekki vs Banana Island — Which Luxury Neighborhood in Lagos Is Best for You? (2026 Comparison)</title>',
       '<title>Ikoyi vs Lekki vs Banana Island: Lagos Comparison (2026)</title>'],
      ['<meta property="og:title" content="Ikoyi vs Lekki vs Banana Island — Luxury Neighborhood Comparison 2026 | Luxury Properties Ltd">',
       '<meta property="og:title" content="Ikoyi vs Lekki vs Banana Island: Lagos Comparison (2026)">'],
    ],
  },
  {
    f: 'blog/listicle/index.html',
    finds: [
      ['<title>Top 10 Luxury Homes for Sale in Lagos (2026) — From ₦80M Penthouses to ₦5B Waterfront Villas</title>',
       '<title>Top 10 Luxury Homes for Sale in Lagos (2026)</title>'],
      ['<meta property="og:title" content="Top 10 Luxury Homes for Sale in Lagos (2026) | Luxury Properties Ltd">',
       '<meta property="og:title" content="Top 10 Luxury Homes for Sale in Lagos (2026)">'],
    ],
  },
  {
    f: 'blog/best-areas-lagos-expats.html',
    finds: [
      ['<title>Best Areas to Live in Lagos for Expats and High-Net-Worth Individuals 2026</title>',
       '<title>Best Areas to Live in Lagos for Expats (2026)</title>'],
    ],
  },
  {
    f: 'blog/certificate-of-occupancy-vs-governors-consent.html',
    finds: [
      ["<title>Certificate of Occupancy vs Governor's Consent: Key Differences Explained</title>",
       "<title>Certificate of Occupancy vs Governor's Consent (Nigeria)</title>"],
    ],
  },
];
export { fixes, root };