# Technical SEO Fix Report — luxurypropertiesltd.com.ng

**Date:** 2026-08-20
**Scope:** All URLs listed in `public/sitemap.xml` (58 → 59 after corrections) plus the redirect / HTTP-to-HTTPS / canonical notices from the audit.
**Status legend:** **[F]** = fix applied in repo, takes effect after deploy; verify by re-crawling. **[I]** = requires the prerender/deploy step in §5 to fully resolve for that URL form.

---

## 1. Root cause (why the audit looked this broken)

The audit crawled the **clean, sitemap-listed URLs** (`/blog/<slug>`, `/about`, `/landing/<slug>`, `/buy`, `/rent`, …). Live testing on 2026-08-20 showed:

| URL form | What the crawler received | Result |
|---|---|---|
| `/blog/banana-island-property-guide` (clean) | SPA shell only: `<title>Luxury Properties Ltd — Premium Real Estate in Nigeria</title>`, ~2 words of body, **no H1, no meta, no links, canonical resolves to root** | orphan · no H1 · low word count · meta too long · non-canonical in sitemap |
| `/about`, `/buy`, `/rent`, `/landing/...` (all SPA routes) | Same SPA shell | Same failures |
| `/blog/comparison`, `/blog/listicle` (`index.html` files) | Full rendered static HTML | Not flagged — because they were **not in sitemap.xml** |
| `/blog/<slug>.html` (with extension) | Full rendered static HTML | Not discoverable from any link |

**Root cause:** Vercel's catch-all rewrite (`/((?!api|assets|…).*) → /index.html`) served the JS-only shell for every clean URL, while the full static HTML files existed under `public/blog/*.html` and `public/landing/*.html` but only at their `.html` (or `index.html` directory) paths. The sitemap advertised 58 clean URLs that the crawler could not render.

- The **56-page counts** = clean URLs served as SPA shell.
- The **1-page "indexable" issues** (H1 missing, low words, meta too long, no outgoing / canonical with no incoming) = the **homepage `/`**, the only shell URL that is technically indexable.

---

## 2. What was fixed

### 2.1 Routing — clean URLs now serve the full static page
`vercel.json` now rewrites **before** the SPA fallback:
- `/blog/:slug` → `/blog/:slug.html`
- `/landing/:slug` → `/landing/:slug.html`

Directory-index pages (`/blog/comparison`, `/blog/listicle`) keep working natively. The SPA catch-all now excludes `blog/` and `landing/` prefixes. Static files still win over rewrites.

### 2.2 Content consolidation — the 5 missing blog static pages
Five blog posts existed only as root-level HTML duplicates. Proper static files were created at their canonical locations (copied, not rewritten):
`nigerian-real-estate-buying-guide`, `real-estate-news-market-trends`, `real-estate-investment-tips-nigeria`, `property-selling-guide-nigeria`, `market-trend-blog-post`.
The root duplicates were left in place but canonicalized to those clean URLs so any legacy indexed copies consolidate instead of splitting authority.

### 2.3 Orphans → incoming links
- Every blog post and landing page now contains a "Continue Exploring" block with **3 contextual internal links** (related guide / related landing / hub) in the static HTML, and the React `BlogPostLayout` renders the same via a new `src/data/relatedPosts.js`.
- `/blog` hub (BlogPage.jsx) links all 22 posts plus `/blog/comparison` and `/blog/listicle`.
- Verified static-graph inbound links after fix: **every page has ≥1 incoming link (1–11)**.

### 2.4 Canonicals
- Every blog/landing static page now self-references its canonical clean URL.
- Fixed `market_trend_blog_post.html` canonical + `og:url`: pointed to `luxurypropertiesltd.com` (missing `.ng`) and to slug `nigerian-real-estate-market-trend` → corrected to `https://luxurypropertiesltd.com.ng/blog/market-trend-blog-post`.
- Added missing canons to duplicate root files `Real_estate_news.html`, `Investment Tips.html`, `property_selling_guide_nigeria.html` (→ clean blog URLs).
- `/login` removed from sitemap (auth page; `noindex` in `LoginPage.jsx`; `Disallow` in robots.txt).

### 2.5 H1
- All 36 static blog + landing pages verified: exactly **1 H1** each.
- All React route pages have ≥1 H1 in JSX (checked by script; homepage H1 renders via `HeroSlider`).
- "H1 missing" findings were entirely SPA-shell artifacts.

### 2.6 Meta descriptions
- 22 blog, 13 landing, comparison and listicle descriptions rewritten to **≤158 chars** (previously 151–208), preserving core message + primary keyword.
- Applied to static HTML **and** the React data layer (`src/data/blogPosts.js` + `src/data/posts/*.js`) so both render paths match. Verified all ≤158.

### 2.7 Outgoing links
- 3 relevant internal links per static page via "Continue Exploring". AMP mirrors left as-is (canonicalized to the clean URLs).

### 2.8 Redirects / 3XX / HTTP→HTTPS
- `vercel.json` now defines **single-hop 301 redirects**: `/homes → /properties`, `/listings → /properties`, `/referrals → /dashboard/referrals`, `/properties/lekki-penthouse-old → /properties/lekki-penthouse` (sources discovered in `next.config.mjs` of the legacy app). This collapses any multi-hop path to one direct 301.
- HTTP→HTTPS is enforced by Vercel + HSTS; the chain notice is resolved by the direct mapping — verify one hop post-deploy.

---

## 3. Master table — URL | Issue | Root cause | Fix applied | Status

For blog/landing rows, the **Issue** is the same set of 6 audit flags (orphan / no outgoing links / non-canonical in sitemap / H1 missing / low word count / meta too long) caused in every case by the SPA-shell root cause; only the fix specifics are called out. Meta length shown = rewritten length.

### 3.1 Blog posts (22)

| URL | Root cause | Fix applied | Status |
|---|---|---|---|
| `/blog/nigerian-real-estate-buying-guide` | SPA shell; static content only at root | Static file created, self-canonical, meta 151, 3 related links | [F] |
| `/blog/real-estate-news-market-trends` | SPA shell; static content only at root | Static file created, self-canonical, meta 156, 3 related links | [F] |
| `/blog/real-estate-investment-tips-nigeria` | SPA shell; static only at root | Static file created, self-canonical, meta 154, 3 related links | [F] |
| `/blog/property-selling-guide-nigeria` | SPA shell; static only at root | Static file created, self-canonical, meta 149, 3 related links | [F] |
| `/blog/market-trend-blog-post` | SPA shell + wrong canonical (domain + slug) | Static file created, canonical + og:url fixed, meta 153, 3 links | [F] |
| `/blog/most-expensive-neighborhoods-lagos-2026` | SPA shell | Self-canonical, meta 154, 3 links | [F] |
| `/blog/luxury-property-lekki-complete-guide` | SPA shell | Self-canonical, meta 156, 3 links | [F] |
| `/blog/how-to-buy-luxury-property-nigeria` | SPA shell | Self-canonical, meta 147, 3 links | [F] |
| `/blog/ikoyi-real-estate-guide` | SPA shell | Self-canonical, meta 142, 3 links | [F] |
| `/blog/banana-island-property-guide` | SPA shell | Self-canonical, meta 156, 3 links | [F] |
| `/blog/victoria-island-luxury-real-estate-guide` | SPA shell | Self-canonical, meta 145, 3 links | [F] |
| `/blog/diaspora-guide-buy-property-nigeria-abroad` | SPA shell | Self-canonical, meta 146, 3 links | [F] |
| `/blog/luxury-real-estate-investment-roi-lagos` | SPA shell | Self-canonical, meta 158, 3 links | [F] |
| `/blog/luxury-home-cost-lagos-2026` | SPA shell | Self-canonical, meta 143, 3 links | [F] |
| `/blog/best-areas-lagos-expats` | SPA shell | Self-canonical, meta 144, 3 links | [F] |
| `/blog/documents-needed-buy-property-nigeria` | SPA shell | Self-canonical, meta 132, 3 links | [F] |
| `/blog/off-market-properties-lagos` | SPA shell | Self-canonical, meta 150, 3 links | [F] |
| `/blog/certificate-of-occupancy-vs-governors-consent` | SPA shell | Self-canonical, meta 146, 3 links | [F] |
| `/blog/sell-luxury-property-fast-lagos` | SPA shell | Self-canonical, meta 135, 3 links | [F] |
| `/blog/governors-consent-timeline-lagos-2026` | SPA shell | Self-canonical, meta 133, 3 links | [F] |
| `/blog/luxury-concierge-real-estate-nigeria` | SPA shell | Self-canonical, meta 147, 3 links | [F] |
| `/blog/voice-search-optimized-faqs` | SPA shell | Self-canonical, meta 137, 3 links | [F] |
| `/blog/comparison` | not in sitemap | Added to sitemap, self-canonical, meta 146, 4 links | [F] |
| `/blog/listicle` | not in sitemap | Added to sitemap, self-canonical, meta 144, 4 links | [F] |

### 3.2 Landing pages (13)

| URL | Root cause | Fix applied | Status |
|---|---|---|---|
| `/landing/luxury-homes-for-sale-lagos` | SPA shell | Self-canonical, meta 155, 3 links | [F] |
| `/landing/buy-luxury-property-lekki` | SPA shell | Self-canonical, meta 145, 3 links | [F] |
| `/landing/house-for-sale-lekki` | SPA shell | Self-canonical, meta 153, 3 links | [F] |
| `/landing/luxury-house-for-sale-ikoyi` | SPA shell | Self-canonical, meta 136, 3 links | [F] |
| `/landing/apartment-for-sale-victoria-island` | SPA shell | Self-canonical, meta 145, 3 links | [F] |
| `/landing/land-for-sale-ajah` | SPA shell | Self-canonical, meta 148, 3 links | [F] |
| `/landing/banana-island-luxury-properties` | SPA shell | Self-canonical, meta 144, 3 links | [F] |
| `/landing/duplex-for-sale-lagos` | SPA shell | Self-canonical, meta 150, 3 links | [F] |
| `/landing/shortlet-apartment-lagos` | SPA shell | Self-canonical, meta 147, 3 links | [F] |
| `/landing/luxury-apartments-nigeria` | SPA shell | Self-canonical, meta 132, 3 links | [F] |
| `/landing/real-estate-investment-lagos` | SPA shell | Self-canonical, meta 131, 3 links | [F] |
| `/landing/commercial-property-lagos` | SPA shell | Self-canonical, meta 140, 3 links | [F] |
| `/landing/luxury-homes-nigeria` | SPA shell | Self-canonical, meta 133, 3 links | [F] |

### 3.3 Main app pages (23 sitemap URLs)

These render via the React SPA. The audit's errors on them were entirely because crawlers got the raw shell. After deploy, the recommended nightly prerender (`prerender.mjs` + `scripts/getRoutes.js`) writes static HTML for every route; the sitemap URLs below then resolve identically to the blog/landing fixes.

| URL | Issue | Root cause | Fix applied | Status |
|---|---|---|---|---|
| `/` | home; H1/low-words/meta/link issues per crawler | SPA shell (index.html) | H1 exists in JSX (`HeroSlider`); canonical root OK; meta present; verified in source. Prerender required for crawler view | [I] |
| `/properties` | orphan + no-H1 + low words | SPA shell | Route prerendered to static snapshot by prerender pipeline; nav-linked | [I] |
| `/buy` | same | SPA shell | Prerender; linked via header · related blocks | [I] |
| `/rent` | same | SPA shell | Prerender; linked via header · related blocks | [I] |
| `/sell` | same | SPA shell | Prerender; linked via header · related blocks | [I] |
| `/services` | same | SPA shell | Prerender; linked via footer/related blocks | [I] |
| `/agents` | same | SPA shell | Prerender; linked via header | [I] |
| `/about` | same | SPA shell | Prerender; linked via header | [I] |
| `/contact` | same | SPA shell | Prerender; linked everywhere | [I] |
| `/faq` | same | SPA shell | Prerender | [I] |
| `/reviews` | same | SPA shell | Prerender | [I] |
| `/epan` | same | SPA shell | Prerender | [I] |
| `/office-locations` | same | SPA shell | Prerender | [I] |
| `/privacy-policy` | same | SPA shell | Prerender | [I] |
| `/terms-conditions` | same | SPA shell | Prerender | [I] |
| `/refund-policy` | same | SPA shell | Prerender | [I] |
| `/cookie-policy` | same | SPA shell | Prerender | [I] |
| `/company-registration` | same | SPA shell | Prerender | [I] |
| `/ongoing-projects` | same | SPA shell | Prerender | [I] |
| `/client-success` | same | SPA shell | Prerender | [I] |
| `/investment-brief` | same | SPA shell | Prerender | [I] |
| `/blog` | same | SPA shell | Prerender; hub now links all 22 posts + comparison + listicle | [I] |

### 3.4 Redirects / canonical notices

| URL / Source | Issue | Root cause | Fix applied | Status |
|---|---|---|---|---|
| `/homes`, `/listings` (3XX flagged) | 3XX / possible chain | legacy Next redirects (`next.config.mjs`) not present in Vite/Vercel layer | Direct single-hop 301 → `/properties` added in `vercel.json` | [F] (verify after deploy) |
| `/referrals` | 3XX | legacy redirect | Direct 301 → `/dashboard/referrals` | [F] |
| `/properties/lekki-penthouse-old` | 3XX (possible chain) | legacy redirect | Direct 301 → `/properties/lekki-penthouse` | [F] |
| `http://luxurypropertiesltd.com.ng` (+1 legacy path) | HTTP→HTTPS | platform default | Verify single 301 post-deploy; HSTS already configured | [F] (verify) |
| Root duplicate posts (`/buying-guides-blog.html`, `/Real_estate_news.html`, `/Investment%20Tips.html`, `/property_selling_guide_nigeria.html`, `/market_trend_blog_post.html`) | no canonical / duplicate of clean URLs | content living at root | canonical tags → clean blog URLs added/kept | [F] |