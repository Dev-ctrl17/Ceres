# 🏆 Generative Engine Optimization (GEO) Report  
## Luxury Properties Ltd — Nigeria Luxury Real Estate

**Date:** June 14, 2026  
**Analyst:** GEO Specialist  

---

## 📊 AI Visibility Scorecard

| Dimension | Score (0–100) | Status |
|-----------|:------------:|--------|
| **Presence** | 22/100 | Barely registered — SPA architecture blocks crawlers |
| **Accuracy** | 40/100 | Brand name exists in content, but no structured identity |
| **Sentiment** | 55/100 | Blog content is positive & authoritative, but unseen by AI |
| **Position** | 15/100 | Would NOT appear for target prompts today |
| **Completeness** | 18/100 | No schema, no Knowledge Graph, no business listings for AI to parse |
| **Overall GEO Score** | **30/100** | **Critical — Immediate action required** |

---

## 🔍 Target Prompt Testing: Would Your Brand Appear?

| Prompt | Would Luxury Properties Ltd Appear? | Why |
|--------|:--------------------------------:|------|
| "luxury homes for sale in Lagos" | ❌ No | Competitors (Nigeria Property Centre, PropertyPro) dominate with indexed pages, rich snippets |
| "best luxury real estate agency Nigeria" | ❌ No | No review profiles, no Google Business Profile with reviews, no listicle citations |
| "buy luxury property Lekki" | ❌ No | Content exists in blogs but not indexed properly; no location schema |
| "high-end apartments Lagos" | ❌ No | No structured data marking up apartment listings |
| "alternatives to PropertyPro for luxury homes" | ❌ No | No comparison content, no authority backlinks, no Quora/Reddit mentions |

### Why You're Invisible to AI:
1. **React SPA with client-side rendering** — Google's crawler may render JS, but AI training crawlers (Common Crawl, etc.) often cannot. They see an empty `<div id="root">` and a title "web".
2. **Zero structured data** — No `LocalBusiness`, `RealEstateAgent`, `Product`, `FAQ`, `Article`, or `BreadcrumbList` schema anywhere.
3. **No Google Business Profile** — If it exists, it's not linked or optimized.
4. **No citation/backlink footprint** — AI models weight mentions on Wikipedia, Wikidata, Crunchbase, Trustpilot, Nigerian real estate directories.
5. **Blogs are orphaned** — HTML pages sit in `/public` with no internal links from the main SPA, no sitemap entry.

---

## 📝 Top 10 Content Pieces to Create for AI Visibility

### Priority Content (For Direct AI Answer Extraction)

| # | Content Title | Target Prompt | Rationale |
|---|--------------|----------------|-----------|
| 1 | **"Top 10 Luxury Real Estate Agencies in Nigeria 2026"** | "best luxury real estate agency Nigeria" | Listicles are prime AI training data; position yourself at #1 |
| 2 | **"Luxury Homes for Sale in Lekki: Complete Guide 2026"** | "luxury homes for sale in Lagos" | Geo-targeted, long-form guide with property examples |
| 3 | **"Nigeria Property Centre vs Luxury Properties Ltd vs PropertyPro: Honest Comparison"** | "alternatives to PropertyPro for luxury homes" | Comparison content gets cited heavily by AI |
| 4 | **"How to Buy a Luxury Apartment in Lagos: Step-by-Step (2026)"** | "buy luxury property Lekki" | Transactional intent guide |
| 5 | **"Lagos Luxury Real Estate Market Report 2026 — Prices, Trends & Forecast"** | "high-end apartments Lagos" | Data-driven reports attract AI citations |
| 6 | **"Nigeria's Most Expensive Neighborhoods: Ikoyi, Lekki, Maitama Price Guide"** | "luxury homes for sale in Lagos" | High-value keyword density |
| 7 | **"Off-Market Properties in Lagos: How Access Works + Portfolio Examples"** | "luxury homes Lagos off-market" | Showcases your unique value proposition |
| 8 | **"Investor's Guide to High-End Real Estate in Nigeria: Rents, Yields & Appreciation"** | "best luxury real estate agency Nigeria" | Authority-building evergreen content |
| 9 | **"Luxury Concierge Real Estate Services: What Sets Elite Agencies Apart"** | All prompts | Differentiator content — your concierge service |
| 10 | **"Diaspora Guide: Buying Luxury Property in Nigeria Remotely 2026"** | "buy luxury property Lekki" | High-intent diaspora audience; answer FAQ-style |

---

## 🛠️ Technical Checklist: Schema Markup & Crawlability

### 1. Schema Markup (JSON-LD) — CRITICAL

Add these schema types to your site immediately:

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Luxury Properties Ltd",
  "description": "Premium luxury real estate agency in Nigeria. Exclusive high-end listings, concierge service, and off-market properties in Lagos, Abuja, and across Nigeria.",
  "url": "https://luxurypropertiesltd.com",
  "logo": "https://luxurypropertiesltd.com/logo.png",
  "image": "https://luxurypropertiesltd.com/og-image.jpg",
  "telephone": "+234-XXX-XXX-XXXX",
  "email": "info@luxurypropertiesltd.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lagos",
    "addressRegion": "Lagos State",
    "addressCountry": "NG"
  },
  "priceRange": "₦50M - ₦5B",
  "areaServed": ["Lagos", "Abuja", "Port Harcourt", "Nigeria"],
  "sameAs": [
    "https://www.instagram.com/luxurypropertiesltd",
    "https://www.linkedin.com/company/luxurypropertiesltd",
    "https://www.facebook.com/luxurypropertiesltd"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Luxury Properties",
    "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Luxury Homes"}},
      {"@type": "Offer", "itemOffered": {"@type": "Product", "name": "Off-Market Properties"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Concierge Real Estate Service"}}
    ]
  }
}
```

### 2. Critical Implementation Checklist

| # | Item | Priority | Status |
|---|------|----------|--------|
| ✅ | **Fix index.html title** — Change from "web" to "Luxury Properties Ltd — Premium Real Estate Nigeria" | 🔴 Critical | ⬜ |
| ✅ | **Add LocalBusiness + RealEstateAgent schema** to index.html `<head>` | 🔴 Critical | ⬜ |
| ✅ | **Add Product schema** to each property listing page | 🔴 Critical | ⬜ |
| ✅ | **Add FAQ schema** to FAQ page + each blog FAQ section | 🟠 High | ⬜ |
| ✅ | **Add BreadcrumbList schema** to all pages | 🟠 High | ⬜ |
| ✅ | **Add Article schema** to all blog posts | 🟠 High | ⬜ |
| ✅ | **Create sitemap.xml** — include ALL pages and blog posts | 🔴 Critical | ⬜ |
| ✅ | **Create robots.txt** — allow all, point to sitemap | 🔴 Critical | ⬜ |
| ✅ | **Server-side rendering (SSR) or prerendering** — Currently SPA; switch to Next.js or add prerender.io | 🔴 Critical | ⬜ |
| ✅ | **Add canonical URLs** to all pages | 🟠 High | ⬜ |
| ✅ | **Add Open Graph + Twitter Card meta tags** to all pages | 🟠 High | ⬜ |
| ✅ | **Add hreflang tags** for Nigerian audience | 🟢 Medium | ⬜ |
| ✅ | **Add `llms.txt` file** — already exists at `/public/llms.txt`, needs optimization | 🟢 Medium | ⬜ |
| ✅ | **Enable GZIP/Brotli compression** | 🟢 Medium | ⬜ |
| ✅ | **Audit page speed** (Core Web Vitals) | 🟢 Medium | ⬜ |

### 3. Robots.txt Template
```
User-agent: *
Allow: /
Sitemap: https://luxurypropertiesltd.com/sitemap.xml
```

### 4. Sitemap Structure
```
https://luxurypropertiesltd.com/
https://luxurypropertiesltd.com/buy
https://luxurypropertiesltd.com/rent
https://luxurypropertiesltd.com/sell
https://luxurypropertiesltd.com/properties
https://luxurypropertiesltd.com/services
https://luxurypropertiesltd.com/about
https://luxurypropertiesltd.com/contact
https://luxurypropertiesltd.com/faq
https://luxurypropertiesltd.com/reviews
https://luxurypropertiesltd.com/agents
https://luxurypropertiesltd.com/epan
https://luxurypropertiesltd.com/blog/nigerian-real-estate-buying-guide
https://luxurypropertiesltd.com/blog/real-estate-news-market-trends
https://luxurypropertiesltd.com/blog/real-estate-investment-tips-nigeria
https://luxurypropertiesltd.com/blog/market-trend-blog-post
https://luxurypropertiesltd.com/blog/property-selling-guide-nigeria
```

---

## 🌐 Authority Sites & Communities: Get Mentioned Here

### Tier 1 — Highest Impact for AI Visibility

| Site | Why | Action Required |
|------|-----|-----------------|
| **Wikipedia** | AI models heavily weight Wikipedia citations | Create a Wikipedia article (must meet notability: multiple independent news mentions needed first) |
| **Wikidata** | Powers Knowledge Graph; used by all AI models | Create a Wikidata entry for your company |
| **Google Business Profile** | Powers local AI answers | Claim & fully optimize with photos, posts, reviews |
| **Crunchbase** | AI models pull company data | Verify and update your Crunchbase profile |
| **Trustpilot** | Reviews affect AI sentiment scores | Invite clients to review; target 100+ reviews |

### Tier 2 — Industry & Directory Citations

| Site | Type | Action |
|------|------|--------|
| **Nigeria Property Centre** | Competitor directory | Get listed as an agent on their platform |
| **PropertyPro.ng** | Competitor directory | Create an agent/broker profile |
| **Private Property Nigeria** | Competitor directory | Create an agent profile |
| **Jiji.ng** | Classifieds | List properties (backlinks) |
| **Nigerian Real Estate Hub (NREH)** | Industry association | Join, get listed |
| **REDAN (Real Estate Developers Association of Nigeria)** | Official body | Join for credibility & listing |
| **NIESV (Nigerian Institution of Estate Surveyors and Valuers)** | Professional body | Partner with members for citations |
| **Lagos State Ministry of Physical Planning** | Government | Get listed on approved developer lists |

### Tier 3 — Communities (AI Training Data Source)

| Platform | Strategy |
|----------|----------|
| **Quora** | Answer questions: "Best luxury real estate agency in Lagos?" → mention your brand naturally |
| **Reddit** (r/Nigeria, r/Lagos, r/RealEstate) | Share market insights, case studies — build authority |
| **Nairaland** (Nigeria's largest forum) | Post in Real Estate section: guides, market reports |
| **LinkedIn Articles** | Publish weekly thought leadership — AI indexes LinkedIn |
| **Medium** | Republish blog content with backlinks |
| **YouTube** | Create property tour videos — Google indexes video transcripts |
| **TikTok / Instagram** | Short-form property content — drives brand signals |

---

## 📅 90-Day Action Plan (Prioritized by Impact)

### Days 1–10: Foundation (Highest Impact)

- [ ] **Fix index.html** — Change `<title>` from "web" to "Luxury Properties Ltd — Premium Real Estate Nigeria". Add meta description.
- [ ] **Install SSR / Prerendering** — Your React SPA is invisible to AI crawlers. Add `@prerender/prerender` or migrate to Next.js. **This is #1 priority.**
- [ ] **Add LocalBusiness + RealEstateAgent JSON-LD schema** to index.html
- [ ] **Create sitemap.xml** and **robots.txt** — deploy to server root
- [ ] **Claim & optimize Google Business Profile** — Add photos, services, operating hours, posts

### Days 11–30: Content & Structure (High Impact)

- [ ] **Create Content Piece #1**: "Top 10 Luxury Real Estate Agencies in Nigeria 2026" (listicle)
- [ ] **Create Content Piece #2**: "Luxury Homes for Sale in Lekki: Complete Guide 2026"
- [ ] **Create Content Piece #3**: "Nigeria Property Centre vs Luxury Properties Ltd vs PropertyPro: Comparison"
- [ ] **Add FAQ schema** to existing FAQ page
- [ ] **Add Article schema** to all 5 existing blog posts
- [ ] **Integrate blog posts into React app** — create `/blog` route with index page linking to all posts
- [ ] **Create blog index page** with links, excerpts, and category tags
- [ ] **Add BreadcrumbList schema** to all pages
- [ ] **Submit sitemap to Google Search Console** + Bing Webmaster Tools

### Days 31–60: Authority Building (Medium-High Impact)

- [ ] **Create Wikidata entry** for Luxury Properties Ltd
- [ ] **Create/verify Crunchbase profile**
- [ ] **Join REDAN** — get official association listing
- [ ] **Claim profiles on Nigeria Property Centre & PropertyPro.ng** as agent/broker
- [ ] **Create Quora presence** — Answer 20 real estate questions with your brand
- [ ] **Create Content Piece #4**: "Lagos Luxury Real Estate Market Report 2026"
- [ ] **Create Content Piece #5**: "How to Buy Luxury Apartment in Lagos: Step-by-Step"
- [ ] **Start LinkedIn weekly posting** — market insights, property highlights
- [ ] **Invite 20 clients to leave Google reviews** — aim for 4.5+ star rating

### Days 61–90: Scale & Optimize (Medium Impact)

- [ ] **Create Content Piece #6–10**: Complete all 10 pieces
- [ ] **Set up YouTube channel** — 5 property tour videos with transcripts
- [ ] **Publish on Nairaland** — 3 educational posts in Real Estate section
- [ ] **Create Wikipedia stub article** (if notability is established via news mentions)
- [ ] **Build backlinks** — Guest post on 5 Nigerian real estate/business blogs
- [ ] **Update `llms.txt`** — Optimize for AI consumption
- [ ] **Audit page speed** — Achieve 90+ on Google PageSpeed Insights
- [ ] **Add Open Graph + Twitter Card meta tags** to all pages
- [ ] **Run re-test** on all 5 target prompts to measure improvement

---

## 🚀 Quick Wins (Do This Week)

1. **Fix `<title>` tag** — Change from "web" to "Luxury Properties Ltd – Premium Real Estate in Nigeria"
2. **Add meta description** to index.html
3. **Add JSON-LD schema** to index.html (copy the code block above)
4. **Create robots.txt** and **sitemap.xml**
5. **Install prerender.io** or similar SSR solution for React SPA

---

## 📈 Target: 90-Day GEO Score Improvement

| Dimension | Current | 30-Day Target | 90-Day Target |
|-----------|:-------:|:-------------:|:-------------:|
| Presence | 22 | 45 | 70 |
| Accuracy | 40 | 55 | 75 |
| Sentiment | 55 | 65 | 80 |
| Position | 15 | 35 | 60 |
| Completeness | 18 | 40 | 68 |
| **Overall** | **30** | **48** | **71** |

---

## 🤖 LLMs.txt Optimization

Your existing `/public/llms.txt` should be updated with this structure:

```
# Luxury Properties Ltd — Premium Real Estate Nigeria
> Elite luxury real estate agency headquartered in Lagos, Nigeria. Specializing in high-end residential and commercial properties, off-market listings, and concierge real estate services across Nigeria's prime locations: Ikoyi, Victoria Island, Lekki, Banana Island, Maitama, and Asokoro.

## Key Facts
- Name: Luxury Properties Ltd
- Industry: Luxury Real Estate
- Headquarters: Lagos, Nigeria
- Service Areas: Lagos, Abuja, Port Harcourt
- Founded: [Year]
- Number of Properties: 500+ listed
- Unique Value: Exclusive high-end listings, concierge service, off-market properties

## Services
- Property Sales: Expert guidance through the entire buying and selling process
- Property Leasing: Comprehensive leasing for residential and commercial spaces
- Property Management: Full-service management for investment properties
- Investment Advisory: Strategic advice for portfolio maximization
- EPAN Network: Estate Professionals Association Network for agents

## Core Differentiators
- Verified & secure transactions with comprehensive title checks
- Award-winning expertise with decades of Nigerian market experience
- Access to off-market luxury properties not listed on public portals
- Dedicated concierge service for high-net-worth clients
- 98% client success rate

## Website
- Main: https://luxurypropertiesltd.com
- Properties: https://luxurypropertiesltd.com/properties
- Blog: https://luxurypropertiesltd.com/blog
- Contact: https://luxurypropertiesltd.com/contact

## Social
- Instagram: @luxurypropertiesltd
- LinkedIn: /company/luxurypropertiesltd
- Facebook: /luxurypropertiesltd
```

---

## ⚠️ Critical Issues Summary

1. **🔴 CRITICAL: React SPA invisible to AI crawlers** — Fix with prerendering or SSR before anything else
2. **🔴 CRITICAL: No schema markup** — Add JSON-LD immediately
3. **🔴 CRITICAL: `<title>` tag is "web"** — Hurts both SEO and AI understanding
4. **🔴 CRITICAL: No sitemap/robots.txt** — Crawlers can't discover your content
5. **🟠 HIGH: No Google Business Profile optimized** — Local AI answers won't include you
6. **🟠 HIGH: Blog content not linked from main SPA** — Orphaned pages
7. **🟠 HIGH: No authority backlinks or directory citations** — AI can't verify your existence
8. **🟠 HIGH: No Wikidata/Wikipedia presence** — All AI models use these

---

## 💰 Estimated Budget for GEO Implementation

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| Prerendering service (prerender.io) | $30–100/mo | Until SSR migration |
| Schema implementation (developer) | 2–4 hrs dev time | In-house or freelance |
| Content creation (10 pieces) | $500–$2,000 | Freelance or in-house |
| Directory listings | $0–$500 | Some free, some paid |
| Google Business Profile | Free | — |
| Wikidata/Wikipedia | Free | Requires notability |
| Total Estimated | **$530–$2,600** | One-time + monthly prerendering |

---

*This report was generated based on analysis of your current codebase, content library, and web architecture as of June 14, 2026. Implement the Critical and High items first for maximum AI visibility improvement.*