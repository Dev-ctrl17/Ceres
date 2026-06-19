# 🔍 Comprehensive SEO / GEO / AEO Audit Report
## Luxury Properties Ltd — Nigeria Luxury Real Estate

**Date:** June 19, 2026  
**Auditor:** SEO / GEO / AEO Specialist

---

## 📋 Executive Summary

| Dimension | Previous Score (Jun 14) | Current Score (Jun 19) | Status |
|-----------|:----------------------:|:---------------------:|--------|
| **Technical SEO** | 25/100 | **65/100** | ✅ Major progress |
| **GEO (AI Visibility)** | 30/100 | **50/100** | ✅ Improved |
| **AEO (Answer Engine)** | 20/100 | **55/100** | ✅ Improved |
| **On-Page SEO** | 40/100 | **70/100** | ✅ Improved |
| **Performance** | 55/100 | **60/100** | ⚠️ Needs work |
| **Off-Page / Authority** | 15/100 | **15/100** | ❌ Not started |

**Overall Score: 52/100** — Progress made, critical gaps remain

---

## ✅ What Has Been Fixed Since Last Report

### Technical SEO (Fixed)
- [x] **Title tag** — Changed from "web" to "Luxury Properties Ltd — Premium Real Estate in Nigeria"
- [x] **Meta description** — Added descriptive meta tag to index.html
- [x] **Canonical URL** — Added `<link rel="canonical">` 
- [x] **Open Graph tags** — Complete set (title, description, image, type, url, site_name, locale)
- [x] **Twitter Card tags** — Added summary_large_image card
- [x] **Hreflang tags** — Added en-ng, en, x-default
- [x] **robots.txt** — Updated to allow all AI crawlers (OpenAI, Anthropic, Perplexity, Google, Bing, Meta, Apple, Amazon)
- [x] **sitemap.xml** — Created with all pages, blog posts, and priority levels
- [x] **JSON-LD: RealEstateAgent + LocalBusiness** — Added to index.html
- [x] **JSON-LD: BreadcrumbList** — Added with 9 page items
- [x] **JSON-LD: ItemList (Product listings)** — Added with 6 sample properties
- [x] **JSON-LD: FAQPage** — Added to FAQ page with 10 questions
- [x] **llms.txt** — Created at `/public/llms.txt`
- [x] **Preconnect hints** — Added for fonts, Supabase, image CDNs
- [x] **DNS-Prefetch** — Added for critical origins
- [x] **CSS preload** — Implemented with `onload` trick
- [x] **Font display=swap** — Added to prevent FOIT
- [x] **Code splitting (React.lazy)** — Implemented for all routes except HomePage
- [x] **Brevo migration** — Resend → Brevo for email

### GEO Improvements (Fixed)
- [x] **llms.txt** created for AI crawlers
- [x] **robots.txt** now allows all major AI bots
- [x] **Schema markup** added for AI knowledge extraction
- [x] **Blog pages linked in sitemap** — All 18 blog posts indexed

---

## 🔴 Critical Issues Remaining

### 1. 🔴 CRITICAL: React SPA — No Server-Side Rendering (SSR)
**Impact:** AI training crawlers (Common Crawl, GPTBot, ClaudeBot) and some search engine crawlers see an empty page.
**Evidence:** `index.html` has `<div id="root"></div>` — content is loaded via client-side JavaScript.
**Risk:** 90% of the site content is invisible to AI crawlers and some search bots.
**Fix Options:**
- **Option A (Recommended):** Deploy with `@prerender/prerender-spa-plugin` (~$30-100/mo)
- **Option B:** Migrate to Next.js or Remix for full SSR/SSG
- **Option C:** Use Cloudflare Workers for dynamic prerendering

### 2. 🔴 CRITICAL: No Google Business Profile
**Impact:** Zero presence in Google's Local Pack, Google Maps, and local AI answers.
**Evidence:** No GBP link, no schema `sameAs` for GBP.
**Fix:** Claim and optimize: https://business.google.com — add photos, services, operating hours, posts.

### 3. 🔴 CRITICAL: No Wikipedia / Wikidata Presence
**Impact:** All major AI models heavily weight Wikipedia and Wikidata for brand information.
**Evidence:** No Wikidata entry exists.
**Fix:** Create Wikidata entry first (easy, no notability required), then work toward Wikipedia article.

### 4. 🔴 CRITICAL: No Authority Backlinks
**Impact:** AI models and search engines use backlinks as trust signals. Zero external links = low authority.
**Evidence:** No directory citations, no guest posts, no press mentions.
**Fix:** Get listed on Nigeria Property Centre, PropertyPro.ng, Private Property Nigeria, REDAN, NIESV.

---

## 🟠 High Priority Issues

### 5. No Blog Route in React App
**Impact:** Blog HTML files sit in `/public/blog/` but are NOT linked from the React SPA navigation. They exist as standalone HTML files but users can't discover them from the main site.
**Fix:** Create a `/blog` route in `App.jsx` that links to all blog posts. Add blog links to Header/Footer navigation.

### 6. Missing JSON-LD Schema on Individual Pages
**Impact:** BuyPage, RentPage, SellPage, ServicesPage, AboutPage have no page-specific schema.
**Evidence:** Only index.html and FAQPage have schema markup.
**Fix:** Add `Article` schema to blog pages, `Product` schema to property detail pages, `Service` schema to services page.

### 7. No Analytics / Measurement
**Impact:** Cannot track SEO/GEO improvements, user behavior, or conversion rates.
**Evidence:** No Google Search Console, no Analytics tracking configured beyond basic GTM.
**Fix:** Set up Google Search Console, Google Analytics 4, and Bing Webmaster Tools.

### 8. Performance — Images Not Optimized
**Impact:** Large images slow page load, hurting Core Web Vitals and user experience.
**Evidence:**
- Hero images from unsplash/image2url: ~85-100 KiB each
- No WebP format used
- No srcset for responsive images
- No explicit width/height on many images (causes CLS)

### 9. No Service Worker / PWA Support
**Impact:** No offline support, no caching strategy, slower repeat visits.
**Fix:** Implement a basic service worker to cache static assets.

### 10. No Breadcrumb Navigation on Pages
**Impact:** Users can't see where they are in the site hierarchy. BreadcrumbList schema exists but no visual breadcrumbs.
**Fix:** Add a Breadcrumb component to each page.

---

## 🟡 Medium Priority

### 11. Missing `decoding="async"` on Images
**Fix:** Add `decoding="async"` to all `<img>` tags.

### 12. Google Tag Manager Loads on Page Load
**Impact:** GTM script loads immediately, potentially blocking render.
**Fix:** Defer GTM to load after `window.onload` event.

### 13. No 404 Page
**Impact:** Users hitting broken links get a blank white page.
**Fix:** Create a custom 404 page with site search and navigation.

### 14. No Open Graph on Blog Posts
**Impact:** Blog posts shared to social media show no preview image or description.
**Fix:** Add OG tags to each blog HTML file in `/public/blog/`.

### 15. llms.txt Needs Optimization
**Current:** Basic file exists but could be more structured for AI consumption.
**Fix:** Add sections, bullet points, key statistics, and pricing ranges.

### 16. No Review Schema for Google Stars
**Impact:** Missing aggregate rating in search results.
**Fix:** Add `AggregateRating` schema to Reviews page with review count and average rating.

---

## 🟢 GEO Audit — AI Visibility Assessment

### AI Crawler Compatibility

| Crawler | Status | Issue |
|---------|--------|-------|
| **Googlebot** | ✅ Allowed | Can render JS but may miss dynamic content |
| **GPTBot (OpenAI)** | ✅ Allowed | ✅ Enabled in robots.txt |
| **ClaudeBot (Anthropic)** | ✅ Allowed | ✅ Enabled in robots.txt |
| **CCBot (Common Crawl)** | ✅ Allowed | ❌ Cannot render client-side JS — sees empty page |
| **Google-Extended** | ✅ Allowed | ✅ Enabled but needs SSR for full content |
| **PerplexityBot** | ✅ Allowed | ✅ Enabled in robots.txt |
| **Applebot-Extended** | ✅ Allowed | ✅ Enabled |
| **cohere-ai** | ✅ Allowed | ✅ Enabled |

**GEO Recommendation:**
The biggest gap is **SSR/prerendering**. Without it, Common Crawl (used by GPT, Claude, Gemini training) sees virtually no content. This is the #1 blocker for AI visibility.

### Target Prompt Analysis

| Prompt | Would Appear? | Fix Needed |
|--------|:------------:|------------|
| "luxury homes for sale in Lagos" | ⚠️ Possibly | Need property listing pages with Product schema indexed |
| "best luxury real estate agency Nigeria" | ❌ No | Need listicle content, backlinks, directory citations |
| "buy luxury property Lekki" | ⚠️ Possibly | Blog exists at `/blog/luxury-property-lekki-complete-guide` but may not be indexed |
| "high-end apartments Lagos" | ❌ No | No dedicated page targeting this phrase with schema |
| "alternatives to PropertyPro" | ❌ No | No comparison content exists |

---

## 🟢 AEO Audit — Answer Engine Optimization

### Current AEO Readiness

| Feature | Status | Details |
|---------|--------|---------|
| **FAQ Schema** | ✅ Done | 10 questions on FAQ page covering key topics |
| **Featured Snippet Ready** | ⚠️ Partial | Blog content needs clearer Q&A formatting, bullet points, tables |
| **Voice Search** | ⚠️ Partial | FAQ page has voice-search-optimized Q&As at bottom |
| **"People Also Ask"** | ❌ No | No structured content that triggers PAA boxes |
| **Knowledge Graph** | ❌ No | No Wikidata = no Knowledge Graph panel |
| **Local Pack** | ❌ No | No Google Business Profile |
| **llms.txt for AI** | ✅ Basic | Exists but needs richer data |
| **ChatGPT Plugin Ready** | ❌ No | Need API endpoint or structured data for plugin |

### Voice Search Optimization Score: 45/100

**Issues:**
- FAQ page has conversational questions but they're nested below the fold
- Property details pages don't have speakable schema
- No `SpeakableSpecification` schema for any content
- Page loading speed affects voice search ranking

**Fix:**
- Add `SpeakableSpecification` schema to FAQ page
- Add `speakable` CSS class to key Q&A sections
- Create a dedicated `/sitemap-voice.xml` for voice-optimized pages

---

## 📊 Consolidated Action Plan (90 Days)

### Week 1-2: Critical Foundations
| # | Action | Category | Impact |
|---|--------|----------|--------|
| 1 | **Implement SSR/prerendering** (prerender.io or Cloudflare) | SEO/GEO | 🔴 Critical |
| 2 | **Claim Google Business Profile** + optimize fully | SEO/GEO/AEO | 🔴 Critical |
| 3 | **Create Wikidata entry** | GEO/AEO | 🔴 Critical |
| 4 | **Add Article schema to blog posts** | SEO | 🟠 High |
| 5 | **Add Blog route in React app** + link from navigation | SEO | 🟠 High |

### Week 3-4: Content & Structure
| # | Action | Category | Impact |
|---|--------|----------|--------|
| 6 | **Create comparison page**: "Luxury Properties Ltd vs Nigeria Property Centre vs PropertyPro" | GEO/SEO | 🟠 High |
| 7 | **Create listicle**: "Top 10 Luxury Real Estate Agencies in Nigeria 2026" | GEO/SEO | 🟠 High |
| 8 | **Add visual breadcrumbs** to all pages | SEO/AEO | 🟠 High |
| 9 | **Get listed** on Nigeria Property Centre, PropertyPro.ng, Private Property Nigeria | SEO/GEO | 🟠 High |
| 10 | **Create 404 page** | UX/SEO | 🟡 Medium |

### Week 5-8: Authority & Reach
| # | Action | Category | Impact |
|---|--------|----------|--------|
| 11 | **Join REDAN** — get official association listing | SEO/GEO | 🟠 High |
| 12 | **Start Quora presence** — answer 20 real estate questions with brand mention | GEO | 🟡 Medium |
| 13 | **Publish market report**: "Lagos Luxury Real Estate Market Report 2026" | GEO/AEO | 🟡 Medium |
| 14 | **Create YouTube channel** — 5 property tour videos with transcripts | GEO | 🟡 Medium |
| 15 | **Optimize images**: Convert to WebP, add srcset, add dimensions | Performance | 🟡 Medium |

### Week 9-12: Scale & Optimize
| # | Action | Category | Impact |
|---|--------|----------|--------|
| 16 | **Implement service worker** for caching | Performance | 🟡 Medium |
| 17 | **Submit to Google Search Console** + Bing Webmaster Tools | SEO | 🟠 High |
| 18 | **Set up Google Analytics 4** + conversion tracking | Analytics | 🟡 Medium |
| 19 | **Add AggregateRating schema** to Reviews page | SEO/AEO | 🟡 Medium |
| 20 | **Optimize llms.txt** with richer structured data | GEO | 🟢 Low |
| 21 | **Add SpeakableSpecification schema** for voice search | AEO | 🟢 Low |
| 22 | **Defer GTM and Elfsight scripts** to improve LCP | Performance | 🟡 Medium |
| 23 | **Run re-test** on all target prompts and measure improvement | All | 📊 |

---

## 📈 Target Score Improvement

| Dimension | Current | 30-Day Target | 90-Day Target |
|-----------|:-------:|:-------------:|:-------------:|
| Technical SEO | 65 | 80 | 92 |
| GEO (AI Visibility) | 50 | 65 | 80 |
| AEO (Answer Engine) | 55 | 70 | 85 |
| On-Page SEO | 70 | 82 | 90 |
| Performance | 60 | 75 | 88 |
| Off-Page / Authority | 15 | 35 | 60 |
| **Overall** | **52** | **68** | **83** |

---

## 🚀 Quick Wins (Do This Week — High Impact, Low Effort)

1. **Add Blog link in Header** — Link to `/blog` from the main navigation
2. **Add `decoding="async"`** to all `<img>` tags site-wide
3. **Defer GTM and Elfsight** to load after page becomes interactive
4. **Create Wikidata entry** for Luxury Properties Ltd (takes 15 minutes)
5. **Claim Google Business Profile** if not already done
6. **Add AggregateRating schema** to ReviewsPage.jsx
7. **Add Article schema** to each blog HTML file in `/public/blog/`
8. **Add visual breadcrumbs** — Small CSS component, big UX win

---

## 📋 Files That Need Updates

| File | Issue | Priority |
|------|-------|----------|
| `src/App.jsx` | No `/blog` route | 🟠 High |
| `src/components/Header.jsx` | No blog link in navigation | 🟠 High |
| `src/pages/BuyPage.jsx` | No page-specific schema | 🟠 High |
| `src/pages/RentPage.jsx` | No page-specific schema | 🟠 High |
| `src/pages/PropertiesPage.jsx` | No page-specific schema | 🟠 High |
| `src/pages/PropertyDetailsPage.jsx` | No Product schema | 🟠 High |
| `src/pages/ServicesPage.jsx` | No Service schema | 🟠 High |
| `src/pages/ReviewsPage.jsx` | No AggregateRating schema | 🟡 Medium |
| `index.html` | GTM loads immediately, no service worker | 🟡 Medium |
| All blog HTML files | No OG tags, no Article schema | 🟡 Medium |
| `public/llms.txt` | Needs richer data | 🟢 Low |

---

## 🔗 Key Links & Resources

- **Google Search Console:** https://search.google.com/search-console
- **Google Business Profile:** https://business.google.com
- **Wikidata:** https://www.wikidata.org
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
- **Schema.org:** https://schema.org/RealEstateAgent
- **PageSpeed Insights:** https://pagespeed.web.dev
- **Prerender.io:** https://prerender.io
- **Brevo (email):** https://www.brevo.com

---

*This report reflects the current state of the codebase as of June 19, 2026. Previous GEO report (Jun 14) items have been partially addressed. Focus on Critical and High items for maximum impact on search visibility, AI presence, and answer engine performance.*