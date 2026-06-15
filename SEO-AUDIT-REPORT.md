# SEO Audit Report: Luxury Properties Ltd
## https://luxurypropertiesltd.com.ng

**Report Date:** June 15, 2026  
**Prepared by:** SEO Audit Team  
**Industry:** Luxury Real Estate — Nigeria

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [SEO Performance Score (0–100)](#2-seo-performance-score-0-100)
3. [Keyword Ranking Analysis](#3-keyword-ranking-analysis)
4. [Competitor Analysis](#4-competitor-analysis)
5. [Content Strategy — Top 10 SEO Pages](#5-content-strategy--top-10-seo-pages)
6. [Technical SEO Checklist](#6-technical-seo-checklist)
7. [Authority Building Strategy](#7-authority-building-strategy)
8. [90-Day SEO Action Plan](#8-90-day-seo-action-plan)

---

## 1. Executive Summary

Luxury Properties Ltd is a premium real estate agency operating in Nigeria's high-end property market. The website demonstrates a solid foundational SEO setup — including proper meta tags, structured data, and Open Graph implementation — but suffers from **critical technical SEO deficiencies** that are severely limiting organic visibility. The site is built as a **client-side rendered React SPA on Vercel**, which means Googlebot may struggle to index key pages, including property listings. The absence of a robots.txt file, XML sitemap, and server-side rendering (SSR) are the most urgent issues to resolve.

**Overall SEO Score: 48/100**

---

## 2. SEO Performance Score (0–100)

### Overall Score: 48/100

| Category | Score | Weight | Weighted Score | Status |
|---|---|---|---|---|
| On-Page SEO | 72/100 | 20% | 14.4 | 🟡 Good |
| Technical SEO | 25/100 | 25% | 6.25 | 🔴 Critical |
| Content Quality | 50/100 | 20% | 10.0 | 🟡 Needs Work |
| Keyword Targeting | 55/100 | 15% | 8.25 | 🟡 Moderate |
| Backlink Authority | 30/100 | 10% | 3.0 | 🔴 Weak |
| User Experience | 65/100 | 10% | 6.5 | 🟡 Moderate |
| **TOTAL** | | **100%** | **48.4** | **🔴 Below Average** |

### Detailed Breakdown

#### On-Page SEO — 72/100 ✅ Strengths
- ✅ Well-crafted `<title>` tag: "Luxury Properties Ltd — Premium Real Estate in Nigeria"
- ✅ Strong meta description (155 characters, includes brand + location + CTA)
- ✅ Meta keywords tag present (though Google ignores it, it shows intent)
- ✅ Canonical tag properly set to root domain
- ✅ Open Graph tags fully implemented (title, description, type, url, image)
- ✅ Twitter Card tags implemented (summary_large_image)
- ✅ JSON-LD structured data for RealEstateAgent + LocalBusiness
- ✅ BreadcrumbList schema implemented
- ✅ llms.txt file present (forward-thinking for AI/LLM SEO)

#### On-Page SEO — ❌ Gaps
- ❌ Meta keywords tag is outdated and provides no SEO value
- ❌ No `hreflang` tags (relevant if targeting international luxury buyers)
- ❌ Twitter image tag missing (`twitter:image` not set)
- ❌ OG image URL (`og-image.jpg`) may not exist or may not be optimized

#### Technical SEO — 25/100 🔴 Critical Issues
- ❌ **No robots.txt file** — `/robots.txt` returns SPA HTML (200 status with HTML content). This means crawlers have no crawl directives, which is a fundamental SEO failure.
- ❌ **No XML sitemap** — `/sitemap.xml` returns SPA HTML. Google cannot discover all pages efficiently.
- ❌ **Client-side rendering (CSR)** — The site is a React SPA (`<div id="root"></div>`). Without SSR or pre-rendering, Googlebot may not fully render and index page content, especially dynamic property listings.
- ❌ **No server-side rendering (SSR) or static site generation (SSG)** — Content is loaded via JavaScript after initial HTML load.
- ❌ **No pre-rendering fallback** for crawlers
- ❌ **Missing `X-Robots-Tag` headers** for programmatic pages
- ❌ **No AMP implementation** (optional but beneficial for mobile search)
- ⚠️ `Cache-Control: public, max-age=0, must-revalidate` — aggressive no-cache may slow down repeat visits

#### Content Quality — 50/100 🟡 Needs Work
- ✅ Blog section exists with 5 indexed articles
- ✅ Content topics are relevant (buying guide, investment tips, market trends)
- ✅ FAQ page exists (potential for featured snippets)
- ✅ Reviews/testimonials section exists
- ❌ Only 5 blog posts — severely insufficient for competitive SEO
- ❌ Blog content appears thin (likely short articles)
- ❌ No video content or virtual tours
- ❌ No neighborhood/location landing pages
- ❌ No case studies or client success stories
- ❌ No downloadable resources (guides, reports) for lead generation

#### Keyword Targeting — 55/100 🟡 Moderate
- ✅ Primary keyword in title tag
- ✅ Primary keyword in meta description
- ✅ Keywords in structured data
- ❌ Only one page optimized for the homepage — no dedicated landing pages per keyword
- ❌ No location-specific landing pages (e.g., /luxury-homes-lekki)
- ❌ Limited keyword variety in content
- ❌ No long-tail keyword strategy visible

#### Backlink Authority — 30/100 🔴 Weak
- ❌ No visible high-authority backlinks
- ❌ Not listed on major Nigerian business directories
- ❌ No PR/media mentions
- ❌ No guest post or industry blog contributions
- ❌ No .edu or .gov backlinks
- ✅ Google Reviews widget present (Elfsight) — social proof, not direct backlinks

#### User Experience — 65/100 🟡 Moderate
- ✅ Mobile viewport meta tag present
- ✅ SSL/HTTPS enforced (HSTS enabled, max-age=63072000)
- ✅ Vercel CDN for fast static asset delivery
- ✅ Responsive design (React SPA)
- ❌ SPA routing may cause slow initial load on 3G connections
- ❌ No visible breadcrumbs in UI (only in schema)
- ❌ No clear site search functionality visible
- ❌ Elfsight third-party scripts may slow page load

---

## 3. Keyword Ranking Analysis

| # | Target Keyword | Monthly Search (Est.) | Likelihood of Page 1 | Current Position (Est.) | What's Missing | Difficulty |
|---|---|---|---|---|---|---|
| 1 | luxury homes for sale in Lagos | 300–700 | **Medium** | Not ranked (page 3+) | Dedicated landing page, 10+ supporting blog posts, backlinks, SSR | Medium-High |
| 2 | best luxury real estate agency Nigeria | 200–500 | **Medium** | Not ranked (page 3+) | About page optimization, authority signals, media mentions, backlinks | Medium |
| 3 | buy luxury property Lekki | 100–300 | **High** | Not ranked (page 3+) | Dedicated Lekki property page, local SEO signals, Google Business Profile | Medium |
| 4 | high-end apartments Lagos | 200–600 | **Medium** | Not ranked (page 3+) | Property listing page with on-page optimization, location content | Medium-High |
| 5 | luxury real estate Nigeria | 500–1,500 | **Low** | Not ranked (page 3+) | Domain authority, comprehensive content hub, extensive backlink profile | High |

### Keyword-Specific Recommendations

#### "luxury homes for sale in Lagos"
- **Current:** No dedicated page targeting this phrase
- **Action:** Create a pillar page at `/luxury-homes-for-sale-lagos/`
- **Supporting content:** Blog posts about neighborhoods (Ikoyi, Victoria Island, Banana Island)
- **Target:** 2,000+ words, rich media, property listings, neighborhood guides
- **Backlinks needed:** 15–25 quality backlinks from real estate directories and Nigerian blogs

#### "best luxury real estate agency Nigeria"
- **Current:** Homepage targets brand name more than this keyword
- **Action:** Optimize `/about` page for this keyword
- **Add:** Awards, certifications, team credentials, case studies
- **Backlinks needed:** 20–30 from business directories, news sites

#### "buy luxury property Lekki"
- **Current:** No Lekki-specific page
- **Action:** Create `/luxury-properties-lekki/` with listings and neighborhood guide
- **Local SEO:** Create/optimize Google Business Profile for Lekki office
- **Easiest win** — location-specific pages have lower competition

#### "high-end apartments Lagos"
- **Current:** General property listing page likely not optimized
- **Action:** Create filtered landing page for high-end apartments
- **Add:** Price range filters, virtual tours, detailed descriptions
- **Schema:** Add Product schema for individual listings

#### "luxury real estate Nigeria"
- **Current:** Most competitive keyword — no single page optimized enough
- **Action:** Create comprehensive content hub (20+ pages)
- **Long-term play:** Requires significant domain authority investment
- **Timeline:** 6–12 months to rank on page 1

---

## 4. Competitor Analysis

### Competitive Landscape Overview

| Metric | Luxury Properties Ltd | Nigeria Property Centre | PropertyPro.ng | Private Property Nigeria |
|---|---|---|---|---|
| **Est. Domain Authority** | 12–18 | 45–55 | 40–50 | 45–55 |
| **Est. Backlinks** | 200–500 | 50,000+ | 30,000+ | 40,000+ |
| **Indexed Pages** | ~15–20 | 100,000+ | 50,000+ | 80,000+ |
| **Blog Content** | 5 posts | 200+ articles | 150+ articles | 300+ articles |
| **SSL/HTTPS** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Mobile Friendly** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Structured Data** | ✅ Good | ✅ Good | ✅ Moderate | ✅ Good |
| **SSR/Pre-rendering** | ❌ CSR Only | ✅ Yes | ✅ Yes | ✅ Yes |
| **Sitemap** | ❌ Missing | ✅ Yes | ✅ Yes | ✅ Yes |
| **Robots.txt** | ❌ Missing | ✅ Yes | ✅ Yes | ✅ Yes |
| **Google Business** | ❓ Unknown | ✅ Yes | ✅ Yes | ✅ Yes |

### Competitor Deep Dive

#### Nigeria Property Centre (nigeriapropertycentre.com)
- **Content Strategy:** Extensive property listings (100K+), robust blog with market insights, investment guides, and area guides
- **SEO Strength:** Strong domain authority built over years, thousands of quality backlinks from Nigerian news sites, government portals, and international real estate platforms
- **Technical:** Fully server-rendered, proper crawl infrastructure, fast loading
- **Keyword Dominance:** Dominates "property in Nigeria," "houses for sale in Lagos," and hundreds of long-tail property queries
- **Weakness:** Not specifically luxury-focused — more general market

#### PropertyPro.ng
- **Content Strategy:** Strong editorial content, property listings, market reports
- **SEO Authority:** Well-established domain with diverse backlink profile
- **Technical:** Server-rendered, proper SEO infrastructure
- **Keyword Dominance:** Strong for "property for sale in Nigeria," "apartment rental Lagos"
- **Weakness:** Limited luxury positioning — primarily mid-market focus

#### Private Property Nigeria (privateproperty.com.ng)
- **Content Strategy:** Massive listing database, area guides, investment content
- **SEO Authority:** One of Nigeria's oldest property portals with strong link equity
- **Technical:** Well-optimized with proper SSR and crawl architecture
- **Keyword Dominance:** Dominates brand search and general property queries
- **Weakness:** Generic positioning — not luxury niche

### Luxury Properties Ltd Competitive Advantages
1. **Luxury niche specialization** — None of the competitors are exclusively luxury-focused
2. **Concierge service** — Unique service offering competitors don't provide
3. **Off-market properties** — Exclusive inventory that won't appear on competitor platforms
4. **15+ years experience** — Strong credibility story
5. **98% client success rate** — Powerful social proof metric
6. **EPAN Network** — Industry network advantage

### Luxury Properties Ltd Competitive Weaknesses
1. **Domain authority gap** — Massive gap vs. established portals (12–18 DA vs. 45–55 DA)
2. **Content volume** — 5 blog posts vs. 150–300+ on competitor sites
3. **Indexed page count** — ~15–20 pages vs. 50K–100K+ on competitors
4. **Technical infrastructure** — CSR-only vs. competitor SSR/SSG
5. **Backlink profile** — Minimal vs. tens of thousands for competitors
6. **Marketplace model** — Competitors aggregate listings from thousands of agents, creating massive content

---

## 5. Content Strategy — Top 10 SEO Pages

### Page 1: Ultimate Guide to Buying Luxury Homes in Lagos (2026)

| Attribute | Detail |
|---|---|
| **URL** | `/blog/buying-luxury-homes-lagos-guide` |
| **Target Keyword** | luxury homes for sale in Lagos |
| **Secondary Keywords** | buy luxury house Lagos, Lagos luxury property market, high-end homes Victoria Island |
| **Search Intent** | Informational / Commercial Investigation |
| **SEO Impact** | 🔴 **HIGH** |
| **Word Count** | 3,000–4,000 words |
| **Content Type** | Comprehensive guide with property listings, neighborhood breakdowns, price comparisons, buying process steps |
| **Internal Links** | Link to property listings, buying page, neighborhood pages, contact page |

---

### Page 2: Top 10 Most Expensive Neighborhoods in Lagos

| Attribute | Detail |
|---|---|
| **URL** | `/blog/most-expensive-neighborhoods-lagos` |
| **Target Keyword** | most expensive areas in Lagos |
| **Secondary Keywords** | luxury neighborhoods Lagos, Banana Island properties, Ikoyi luxury homes, Victoria Island real estate |
| **Search Intent** | Informational |
| **SEO Impact** | 🔴 **HIGH** |
| **Word Count** | 2,500–3,500 words |
| **Content Type** | Listicle with photos, price ranges, amenities, lifestyle descriptions for each neighborhood |
| **Internal Links** | Link to neighborhood-specific property listings |

---

### Page 3: Luxury Properties for Sale in Lekki — Complete Buyer's Guide

| Attribute | Detail |
|---|---|
| **URL** | `/luxury-properties-lekki` |
| **Target Keyword** | buy luxury property Lekki |
| **Secondary Keywords** | Lekki luxury apartments, Lekki Phase 1 homes, Lekki estate prices, high-end Lekki properties |
| **Search Intent** | Commercial / Transactional |
| **SEO Impact** | 🔴 **HIGH** |
| **Word Count** | 2,000–3,000 words + dynamic listings |
| **Content Type** | Location landing page with featured listings, neighborhood info, price guide, contact CTA |
| **Schema** | Product schema for individual listings, FAQ schema, LocalBusiness |

---

### Page 4: Real Estate Investment in Nigeria — 2026 Market Report

| Attribute | Detail |
|---|---|
| **URL** | `/blog/nigeria-real-estate-market-report-2026` |
| **Target Keyword** | real estate investment Nigeria |
| **Secondary Keywords** | Nigeria property market 2026, Lagos real estate trends, property investment returns Nigeria |
| **Search Intent** | Informational |
| **SEO Impact** | 🔴 **HIGH** |
| **Word Count** | 4,000–5,000 words |
| **Content Type** | Data-driven market report with charts, statistics, expert commentary, forecasts |
| **Backlinks Potential** | Very high — shareable data content attracts natural links from news sites and blogs |

---

### Page 5: How Much Does a Luxury Apartment Cost in Lagos? (2026 Price Guide)

| Attribute | Detail |
|---|---|
| **URL** | `/blog/luxury-apartment-prices-lagos` |
| **Target Keyword** | luxury apartment prices Lagos |
| **Secondary Keywords** | how much is luxury apartment Lagos, Lekki apartment prices, Ikoyi property cost, Banana Island rent |
| **Search Intent** | Informational / Commercial |
| **SEO Impact** | 🔴 **HIGH** |
| **Word Count** | 2,500–3,000 words |
| **Content Type** | Price guide with tables, comparisons by area, property type, and size |
| **Internal Links** | Link to listings, buy page, contact page |

---

### Page 6: Best Real Estate Agency in Nigeria — Why Choose Luxury Properties Ltd

| Attribute | Detail |
|---|---|
| **URL** | `/about` (optimize existing page) |
| **Target Keyword** | best luxury real estate agency Nigeria |
| **Secondary Keywords** | top real estate company Lagos, award-winning agency Nigeria, luxury property agents |
| **Search Intent** | Commercial / Navigational |
| **SEO Impact** | 🟡 **MEDIUM-HIGH** |
| **Word Count** | 2,500–3,000 words (expand from current) |
| **Content Type** | Company story, team profiles, awards, certifications, client testimonials, case studies, stats |
| **Schema** | Organization schema, Team schema, AggregateRating schema |

---

### Page 7: Off-Market Luxury Properties in Nigeria — The Insider's Guide

| Attribute | Detail |
|---|---|
| **URL** | `/blog/off-market-luxury-properties-nigeria` |
| **Target Keyword** | off-market luxury properties Nigeria |
| **Secondary Keywords** | off-plan luxury homes, exclusive listings Lagos, pre-market property deals, pocket listings |
| **Search Intent** | Informational / Commercial |
| **SEO Impact** | 🟡 **MEDIUM** |
| **Word Count** | 2,000–2,500 words |
| **Content Type** | Thought leadership piece explaining off-market benefits, how to access them, Luxury Properties Ltd positioning |
| **Backlinks Potential** | High — unique content angle competitors don't offer |

---

### Page 8: Luxury Apartment Rentals in Lagos — Complete Guide

| Attribute | Detail |
|---|---|
| **URL** | `/luxury-apartment-rentals-lagos` |
| **Target Keyword** | luxury apartment rental Lagos |
| **Secondary Keywords** | high-end rent Lagos, luxury flat rent Victoria Island, serviced apartments Ikoyi |
| **Search Intent** | Commercial / Transactional |
| **SEO Impact** | 🟡 **MEDIUM** |
| **Word Count** | 2,000–3,000 words + dynamic rental listings |
| **Content Type** | Location landing page with rental listings, price guide, area information |
| **Schema** | Product/Service schema, FAQ schema |

---

### Page 9: How to Sell Your Luxury Property in Nigeria — Expert Guide

| Attribute | Detail |
|---|---|
| **URL** | `/blog/sell-luxury-property-nigeria` |
| **Target Keyword** | sell luxury property Nigeria |
| **Secondary Keywords** | how to sell house Lagos, selling high-end property, best way to sell luxury home Nigeria |
| **Search Intent** | Informational / Commercial |
| **SEO Impact** | 🟡 **MEDIUM** |
| **Word Count** | 2,000–2,500 words |
| **Content Type** | Step-by-step selling guide, pricing tips, staging advice, CTA for free valuation |
| **Internal Links** | Link to sell page, property management, contact page |

---

### Page 10: Banana Island Lagos — Nigeria's Most Exclusive Address

| Attribute | Detail |
|---|---|
| **URL** | `/blog/banana-island-lagos-guide` |
| **Target Keyword** | Banana Island Lagos properties |
| **Secondary Keywords** | Banana Island homes for sale, Banana Island rent prices, most expensive area Lagos |
| **Search Intent** | Informational |
| **SEO Impact** | 🟡 **MEDIUM** |
| **Word Count** | 2,000–2,500 words |
| **Content Type** | Neighborhood deep-dive with history, lifestyle, property listings, price ranges, amenities |
| **Schema** | FAQ schema, LocalBusiness schema |
| **Internal Links** | Link to Banana Island listings, other neighborhood pages |

---

## 6. Technical SEO Checklist

### 🔴 CRITICAL — Fix Immediately

| # | Issue | Current State | Recommendation | Priority |
|---|---|---|---|---|
| 1 | **No robots.txt** | Returns SPA HTML at `/robots.txt` | Create a proper `robots.txt` file at the root: `User-agent: * Allow: / Disallow: /api/ Sitemap: https://luxurypropertiesltd.com.ng/sitemap.xml` | 🔴 P0 |
| 2 | **No XML Sitemap** | Returns SPA HTML at `/sitemap.xml` | Generate and serve a dynamic XML sitemap that includes all property pages, blog posts, and static pages. Use a sitemap index if 50K+ URLs. | 🔴 P0 |
| 3 | **Client-Side Rendering** | React SPA with `<div id="root"></div>` — no SSR | Implement Server-Side Rendering (SSR) using Next.js or Remix, or use pre-rendering (e.g., `react-snap`, Prerender.io) to ensure crawlers receive fully rendered HTML. | 🔴 P0 |
| 4 | **SPA Routing** | Client-side routing may not generate unique URLs | Ensure all routes are accessible via direct URL access and return unique, fully-rendered HTML content. | 🔴 P0 |

### 🟡 HIGH PRIORITY — Fix Within 30 Days

| # | Issue | Current State | Recommendation | Priority |
|---|---|---|---|---|
| 5 | **Missing Twitter Image** | `twitter:image` tag not present | Add `<meta name="twitter:image" content="...">` with a compelling, branded OG image | 🟡 P1 |
| 6 | **OG Image Verification** | `og-image.jpg` referenced but may not be optimized | Verify OG image exists, is 1200×630px, <300KB, and contains brand/logo | 🟡 P1 |
| 7 | **Cache-Control Headers** | `max-age=0, must-revalidate` | Increase to `max-age=300, stale-while-revalidate=600` for static assets. Keep `must-revalidate` for HTML pages. | 🟡 P1 |
| 8 | **Internal Linking** | No visible internal linking structure beyond navigation | Implement contextual internal links within content, breadcrumbs in UI, and a related listings section on each property page | 🟡 P1 |
| 9 | **Alt Text for Images** | Unknown — SPA renders images dynamically | Audit all images for descriptive, keyword-rich alt text | 🟡 P1 |
| 10 | **Page Speed Optimization** | Large JS bundle, Elfsight third-party scripts | Code-split bundles, lazy-load images/videos, defer non-critical scripts, audit Elfsight impact with Lighthouse | 🟡 P1 |

### 🟢 MODERATE PRIORITY — Fix Within 60 Days

| # | Issue | Current State | Recommendation | Priority |
|---|---|---|---|---|
| 11 | **Breadcrumb Navigation** | Schema exists but not visible in UI | Add visual breadcrumbs to all pages for UX and potential rich snippet display | 🟢 P2 |
| 12 | **hreflang Tags** | Not implemented | If targeting international buyers (UK, US, South Africa), add `hreflang` tags | 🟢 P2 |
| 13 | **404 Error Page** | Unknown | Create a custom 404 page with navigation and search functionality | 🟢 P2 |
| 14 | **SSL Certificate** | ✅ HSTS enforced (good) | Already good — ensure HSTS preload list submission | 🟢 P2 |
| 15 | **Site Search** | No visible search | Implement site search with URL-based results (e.g., `/search?q=luxury+lekki`) for crawlability | 🟢 P2 |

### 🔵 NICE TO HAVE — Optimize Within 90 Days

| # | Issue | Recommendation | Priority |
|---|---|---|---|
| 16 | **AMP Pages** | Consider AMP for blog articles to improve mobile search visibility | 🔵 P3 |
| 17 | **Pagination** | Implement proper pagination (`rel=next/prev` or infinite scroll with crawlable URLs) for property listings | 🔵 P3 |
| 18 | **Canonical Tags on All Pages** | Ensure every page has a self-referencing canonical tag | 🔵 P3 |
| 19 | **Open Graph Profile** | Add `og:see_also` linking to social profiles | 🔵 P3 |
| 20 | **Web Vitals Monitoring** | Set up continuous Core Web Vitals monitoring via CrUX or Lighthouse CI | 🔵 P3 |

### Structured Data Audit

| Schema Type | Present | Status | Recommendation |
|---|---|---|---|
| RealEstateAgent | ✅ Yes | Good | ✅ Keep — ensure all fields are populated |
| LocalBusiness | ✅ Yes | Good | ✅ Keep — add `geo` coordinates, `openingHours` |
| BreadcrumbList | ✅ Yes | Good | ✅ Keep — ensure UI breadcrumbs match |
| Product (Listings) | ❌ No | Missing | Add `Product` schema to individual property listings |
| FAQPage | ❌ No | Missing | Add to FAQ page and any page with FAQ sections |
| Article | ❌ No | Missing | Add `Article` schema to all blog posts |
| Organization | ❌ No | Missing | Add to About page with full company details |
| Review/AggregateRating | ❌ No | Missing | Add with Google Reviews data |
| HowTo | ❌ No | Missing | Add to buying/selling guide articles |

---

## 7. Authority Building Strategy

### Tier 1: High-Priority Backlink Sources (Days 1–30)

#### Real Estate Directories
| Platform | DA | Type | Action |
|---|---|---|---|
| Nigeria Property Centre | 50+ | Listing | Create optimized agency profile with link |
| PropertyPro.ng | 45+ | Listing | Register as verified agent |
| Private Property Nigeria | 50+ | Listing | Create agency listing with backlink |
| Jumia House / HouseJinja | 35+ | Directory | Register agency profile |
| ToLet.com.ng | 40+ | Directory | Create agent profile |
| PropertyGate.ng | 30+ | Directory | Register for listing |
| Real Estate Republic | 25+ | Directory | Submit agency profile |

#### Nigerian Business Listings
| Platform | DA | Type | Action |
|---|---|---|---|
| Google Business Profile | 100 | Business Listing | ✅ Create & optimize with photos, posts, reviews |
| LinkedIn Company Page | 98 | Business Profile | ✅ Create optimized company page |
| Crunchbase | 92 | Business Directory | Submit company profile |
| Yellow Pages Nigeria | 35 | Business Directory | Register business |
| VConnect | 40 | Business Directory | List business with details |
| Connect Nigeria | 38 | Business Directory | Submit business profile |
| Nigeria Business Directory | 25 | Business Directory | Register business |

### Tier 2: Medium-Priority Backlink Sources (Days 31–60)

#### News & Media Websites
| Platform | DA | Type | Action |
|---|---|---|---|
| BusinessDay Nigeria | 65+ | News | Contribute expert quotes on real estate trends |
| ThisDay Nigeria | 60+ | News | Pitch stories about luxury property market |
| The Guardian Nigeria | 60+ | News | Submit op-eds on property investment |
| Vanguard Nigeria | 55+ | News | Pitch luxury real estate content |
| Punch Nigeria | 55+ | News | Contribute market analysis articles |
| Nairametrics | 50+ | Finance | Guest posts on real estate investment |
| TechCabal | 50+ | Tech/Business | Position as proptech leader |
| BellaNaija | 60+ | Lifestyle | Feature luxury property showcases |
| StyleVitae | 30+ | Lifestyle | Luxury lifestyle content features |

#### Industry & Investment Platforms
| Platform | DA | Type | Action |
|---|---|---|---|
| Nigerian Investment Promotion Commission | 40+ | Government | Register as investment facilitator |
| Lagos Chamber of Commerce | 35+ | Industry | Join and get listed |
| Nigerian Institution of Estate Surveyors | 30+ | Industry | Ensure membership and listing |
| Estate Developers Association of Nigeria | 25+ | Industry | Join and get listed |

### Tier 3: Long-Term Authority Building (Days 61–90+)

#### Content-Driven Backlink Strategies
| Strategy | Description | Expected Links/Month |
|---|---|---|
| **Original Research** | Publish Nigeria Luxury Property Index (quarterly data report) | 10–20 natural links |
| **Expert Roundups** | Interview 10 Nigerian real estate experts for a comprehensive guide | 5–10 links from participants |
| **Data Journalism** | Create shareable infographics about Lagos property prices | 5–15 social/news links |
| **HARO / Qwoted** | Respond to journalist queries about Nigerian real estate | 2–5 media mentions/month |
| **Guest Posting** | Publish 4 guest posts/month on Nigerian business and property blogs | 4–8 quality links/month |
| **Podcast Appearances** | Appear on Nigerian business and investment podcasts | 2–3 links per appearance |
| **University Partnerships** | Collaborate with Nigerian universities for real estate research | 2–3 .edu links |
| **YouTube Channel** | Create property tour videos (links in descriptions) | Referral traffic + brand searches |

#### Social Media SEO Strategy
| Platform | Strategy | SEO Benefit |
|---|---|---|
| **Instagram** | Property showcase reels, stories with location tags | Brand searches, social signals |
| **LinkedIn** | Thought leadership articles, company updates | High-DA backlinks, professional authority |
| **YouTube** | Virtual property tours, market commentary | YouTube SEO, Google video carousel |
| **Facebook** | Property listings, community engagement | Social signals, local SEO |
| **Twitter/X** | Market commentary, property highlights | Social signals, brand visibility |
| **TikTok** | Property tours for younger investors | Emerging search platform |

---

## 8. 90-Day SEO Action Plan

### Phase 1: Quick Wins (Days 1–30) 🎯
**Focus:** Fix critical technical issues and establish basic SEO infrastructure

| # | Action Item | Category | Expected Impact | Effort | Priority |
|---|---|---|---|---|---|
| 1 | **Create robots.txt** — Add proper robots.txt with crawl directives and sitemap reference | Technical | 🔴 HIGH | Low | 🔴 P0 |
| 2 | **Generate XML Sitemap** — Create dynamic sitemap.xml covering all pages | Technical | 🔴 HIGH | Medium | 🔴 P0 |
| 3 | **Implement pre-rendering or SSR** — Use Next.js, Remix, or Prerender.io to ensure crawlers get fully rendered HTML | Technical | 🔴 HIGH | High | 🔴 P0 |
| 4 | **Set up Google Search Console** — Submit sitemap, verify ownership, monitor indexing | Analytics | 🔴 HIGH | Low | 🔴 P0 |
| 5 | **Set up Google Analytics 4** — Install GA4 with proper event tracking | Analytics | 🟡 HIGH | Low | 🔴 P0 |
| 6 | **Create Google Business Profile** — Full profile with photos, services, posts, Q&A | Local SEO | 🔴 HIGH | Medium | 🔴 P0 |
| 7 | **Optimize About page** — Target "best luxury real estate agency Nigeria" keyword | On-Page | 🟡 MEDIUM | Medium | 🟡 P1 |
| 8 | **Add Twitter image tag** and verify OG image exists and is optimized | On-Page | 🟡 MEDIUM | Low | 🟡 P1 |
| 9 | **Register on 10+ business directories** — Google, LinkedIn, VConnect, Yellow Pages Nigeria | Authority | 🟡 MEDIUM | Medium | 🟡 P1 |
| 10 | **Submit to 5 real estate directories** — Nigeria Property Centre, PropertyPro, ToLet | Authority | 🟡 MEDIUM | Medium | 🟡 P1 |

**Expected Phase 1 Impact:**
- Googlebot will begin properly crawling and indexing all pages
- Search Console visibility within 2–3 weeks
- Google Business Profile appearing in local searches within 1–2 weeks
- Foundation for all future SEO growth

---

### Phase 2: Growth Improvements (Days 31–60) 📈
**Focus:** Create targeted content and optimize existing pages for target keywords

| # | Action Item | Category | Expected Impact | Effort | Priority |
|---|---|---|---|---|---|
| 11 | **Publish 5 new SEO-optimized blog posts** — Guides targeting priority keywords | Content | 🔴 HIGH | High | 🔴 P0 |
| 12 | **Create Lekki property landing page** — Target "buy luxury property Lekki" | Content/On-Page | 🔴 HIGH | Medium | 🔴 P0 |
| 13 | **Create Lagos luxury homes landing page** — Target "luxury homes for sale in Lagos" | Content/On-Page | 🔴 HIGH | Medium | 🔴 P0 |
| 14 | **Add Product schema to property listings** — Enable rich snippets in search results | Technical | 🟡 MEDIUM | Medium | 🟡 P1 |
| 15 | **Add FAQ schema to FAQ page** — Target featured snippets | Technical | 🟡 MEDIUM | Low | 🟡 P1 |
| 16 | **Add Article schema to all blog posts** — Improve blog SEO | Technical | 🟡 MEDIUM | Low | 🟡 P1 |
| 17 | **Implement internal linking strategy** — Contextual links within content, related properties | Technical | 🟡 MEDIUM | Medium | 🟡 P1 |
| 18 | **Optimize all blog posts for target keywords** — Update existing 5 posts with keyword optimization | On-Page | 🟡 MEDIUM | Medium | 🟡 P1 |
| 19 | **Create virtual tour / video content** for 3 premium listings | Content | 🟡 MEDIUM | High | 🟡 P1 |
| 20 | **Implement site search functionality** with crawlable results | Technical | 🟡 MEDIUM | Medium | 🟡 P1 |
| 21 | **Pitch 5 guest posts** to Nigerian business and property blogs | Authority | 🟡 MEDIUM | Medium | 🟡 P1 |
| 22 | **Respond to 10 HARO queries** about Nigerian real estate | Authority | 🟡 MEDIUM | Low | 🟡 P1 |

**Expected Phase 2 Impact:**
- 8–12 new pages indexed and targeting specific keywords
- Featured snippet opportunities for FAQ and price guide queries
- 10–20 new backlinks from directory listings, guest posts, and HARO
- Improved page 2–3 rankings for medium-competition keywords
- Rich snippets appearing in search results for optimized listings

---

### Phase 3: Authority Building (Days 61–90) 🏗️
**Focus:** Build domain authority, earn quality backlinks, and establish thought leadership

| # | Action Item | Category | Expected Impact | Effort | Priority |
|---|---|---|---|---|---|
| 23 | **Publish Nigeria Luxury Property Index Q3 2026** — Original data report | Content/Authority | 🔴 HIGH | High | 🔴 P0 |
| 24 | **Create 5 more neighborhood guide pages** — Banana Island, Ikoyi, VI, Maitama, Asokoro | Content | 🔴 HIGH | High | 🔴 P0 |
| 25 | **Pitch 3 Nigerian news publications** — BusinessDay, ThisDay, Guardian Nigeria | Authority | 🔴 HIGH | Medium | 🔴 P0 |
| 26 | **Launch YouTube property tour series** — 10 luxury property videos | Content | 🟡 HIGH | High | 🟡 P1 |
| 27 | **Publish 5 more SEO blog posts** — Investment guides, price comparisons, market analysis | Content | 🟡 MEDIUM | Medium | 🟡 P1 |
| 28 | **Create downloadable luxury property brochure** — Gated content for lead gen | Content | 🟡 MEDIUM | Medium | 🟡 P1 |
| 29 | **Join Lagos Chamber of Commerce and NIESV** — Earn .org/.edu backlinks | Authority | 🟡 MEDIUM | Low | 🟡 P1 |
| 30 | **Create expert roundup article** — 10 Nigerian Real Estate Experts on 2026 Market | Content/Authority | 🟡 MEDIUM | Medium | 🟡 P1 |
| 31 | **Optimize Core Web Vitals** — Improve LCP, FID, CLS scores | Technical | 🟡 MEDIUM | Medium | 🟡 P1 |
| 32 | **Set up backlink monitoring** — Track new and lost links monthly | Analytics | 🟢 LOW | Low | 🟢 P2 |

**Expected Phase 3 Impact:**
- Domain authority increase of 5–10 points
- 30–50 quality backlinks from news sites, directories, and content
- 20–30 new indexed pages targeting long-tail keywords
- Top 10 rankings for at least 1–2 low-competition keywords
- Top 20 rankings for 2–3 medium-competition keywords
- Brand search volume increase of 50–100%
- Organic traffic increase of 200–400% from baseline

---

## Summary & Key Metrics to Track

### Monthly KPIs
| Metric | Baseline (Est.) | 30-Day Target | 60-Day Target | 90-Day Target |
|---|---|---|---|---|
| Organic Traffic | ~500 visits/mo | 750 | 1,500 | 2,500+ |
| Indexed Pages | ~15–20 | 30 | 45 | 65+ |
| Domain Authority | ~12–18 | 18 | 22 | 25+ |
| Backlinks (total) | ~200–500 | 700 | 1,200 | 2,000+ |
| Keywords in Top 100 | ~20–30 | 50 | 100 | 200+ |
| Keywords in Top 10 | ~0–1 | 2 | 5 | 8+ |
| Avg. Position (target KWs) | Not ranked | 30–50 | 15–30 | 8–20 |
| Core Web Vitals | Unknown | Baseline | Pass (all green) | Pass (all green) |

### Recommended Tools
| Tool | Purpose | Cost |
|---|---|---|
| Google Search Console | Indexing, performance, errors | Free |
| Google Analytics 4 | Traffic, conversions, behavior | Free |
| Google Business Profile | Local SEO visibility | Free |
| Ahrefs / Semrush | Keyword tracking, backlink monitoring, competitor analysis | $99–199/mo |
| Screaming Frog | Technical SEO audits, crawl analysis | Free (500 URLs) / £199/yr |
| PageSpeed Insights / Lighthouse | Core Web Vitals, performance | Free |
| SurferSEO / Clearscope | Content optimization | $59–170/mo |
| BrightLocal | Local SEO tracking | $29–79/mo |
| HARO / Qwoted | Journalist query responses | Free |

---

## Final Recommendations Summary

### Top 5 Priority Actions (Do This Week)
1. 🛠️ **Create robots.txt and sitemap.xml** — These are missing and are fundamental SEO requirements
2. 🛠️ **Implement pre-rendering or SSR** — The SPA architecture is the #1 technical barrier to ranking
3. 📊 **Set up Google Search Console + Analytics** — You can't improve what you can't measure
4. 📍 **Create Google Business Profile** — Instant local SEO visibility
5. 📝 **Publish 1 comprehensive blog post** targeting "luxury homes for sale in Lagos"

### Top 5 Strategic Priorities (Next 90 Days)
1. **Migrate to SSR/SSG** (Next.js recommended) — This single change will unlock indexing of all pages
2. **Create 10 dedicated landing pages** for target keywords and locations
3. **Build 200+ backlinks** through directories, guest posts, and PR
4. **Publish 15+ blog posts** targeting long-tail keywords in the luxury real estate niche
5. **Implement all structured data** types (Product, FAQ, Article, Review) for rich snippets

### Competitive Positioning
Luxury Properties Ltd has a **unique positioning advantage** that none of its competitors share: **exclusive luxury specialization**. While Nigeria Property Centre, PropertyPro, and Private Property are generalist platforms, Luxury Properties Ltd can own the "luxury" keyword space in Nigerian real estate. The strategy should focus on becoming **THE authority for luxury real estate content in Nigeria**, which will naturally earn backlinks and rankings that generalist competitors cannot match in this niche.

---

*This report was generated on June 15, 2026, based on live website analysis and competitive intelligence. SEO recommendations should be reviewed quarterly and updated based on algorithm changes, competitive movements, and business priorities.*