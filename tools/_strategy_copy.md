# SEO × AEO × GEO — Per-Page Strategy Audit
**Site:** Luxury Properties Ltd — https://luxurypropertiesltd.com.ng
**Scope:** Every indexable host page (26 app routes + 22 static blog/guide pages + 15 landing pages).
**Source data:** live HTML scan (`tools/schema_scan.tsv`, `tools/static_audit.tsv`), SPA `<title`/`<meta` inventory (`tools/spa_pages_meta.tsv`), `src/lib/structuredData.js`, `public/index.html`, and prior `SEO-AUDIT-REPORT.md` + `AEO_REPORT_*.md`.

---

## 0. Verification of the reported CRITICAL issues
| Reported issue | Status | Evidence |
|---|---|---|
| 56 orphan pages | **RESOLVED** — only true orphans left: `googlec5d3e468141d2edd.html` & `tracker.js` (non-page assets, acceptable). All 28 sitemap routes are internally linked from Header/Footer. | `sitemap.xml` now lists /blog, /properties, /buy, etc. with `priority`/`changefreq`. |
| Pages missing meta description | **7 remain**: `/about`, `/properties/:id`, `/sell`, `/services`, `/agents`, `/ongoing-projects/:id`, `/client-success/:id` (static `meta=""`). | Helmet scan shows empty meta column. |
| Pages missing H1 | **5 remain**: `BlogPostPage`, `ClientSuccessDetailPage`, `ConsultantPortal`, `OngoingProjectDetailsPage`, `PropertyDetailsPage` — H1 is blank in SSR snapshot (set dynamically, lost on prerender). | spa_pages_meta.tsv h1 column empty for these. |
| Pages with title > 60 chars | **9 pages** need trimming (see §3). | Title-length audit below. |
| Pages with meta > 155 chars | **2 pages remain** (About ~204, Services ~168); Home meta in `index.html` **rewritten to 127c** ✅ (was 232). | `index.html` line 61 + Helmet scan.
| No robots.txt / sitemap.xml | **RESOLVED** — both exist and serve XML/robots rules; allow GPTBot/ClaudeBot/PerplexityBot. | root `robots.txt`, `sitemap.xml`. |
| No structured data (static) | **22 static blog/guide pages** have **no Article/Organization/HowTo/FAQPage** schema (only 4 carry FAQPage). | `schema_scan.tsv`. |

---

## 1. Global findings (apply site-wide)
- **AI-bot discoverability:** `robots.txt` now explicitly `Allow`s `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCbot`, `FacebookBot`, `Applebot`. ✅
- **Canonical discipline:** every app page sets `<link rel="canonical">` via Helmet or hard-coded `/`; self-referential. ✅
- **Title discipline:** target **50–60 chars**, brand appended last; keyword up-front. ❌ 9 pages exceed.
- **Meta-description discipline:** target **130–155 chars**, one USP + CTA. ❌ 3 pages too long, 7 missing.
- **Schema gaps (site-wide):**
  - Static blog/guide pages → add **Article** (BlogPosting) + **Organization** + **FAQPage/HowTo** where Q&A/how-to present.
  - `BlogPage` → add **CollectionPage + BreadcrumbList + ItemList**.
  - `PropertyDetailsPage` emits `Residence` from `generatePropertySchema` — valid but **switch to `RealEstateListing` + `Product`** (Google's preferred types for listings) and add `review`/`aggregateRating` + `FAQPage` schema (currently only plain-text FAQ).
  - Homepage `BreadcrumbList` lists *every nav section* (Home→Properties→Buy…) — invalid path. Replace with a true `Home` breadcrumb.
  - FAQ/HowTo accordions on `buying-guides-blog.html`, `Real_estate_news.html`, `Investment Tips.html` lack JSON-LD mapping.
- **AEO/GEO gaps (site-wide):**
  - No 40–60-word direct-answer paragraph on any money page. Add an `<h2>`-anchored "Answer" block per page targeting the primary question.
  - No `Question/Answer` HowTo schema on process pages (Buy/Sell/buying-guide).
  - No author bylines or `author`/`datePublished`/`dateModified` on static blog posts.
  - No "quick facts" callout (stat + range + source) — add to geo-relevant pages.
- **GEO (Google EE-Z) signals:** `sameAs`, `priceRange`, `areaServed` present on Home ✅; add `employees`/`founder` to Organization, and author bios to blog posts for topical authority.

---

## 2. Page-by-page findings (priority: High / Medium / Low)
Notation: T = title chars, M = meta chars, Schema = JSON-LD types present.

### HIGH priority (revenue, trust, or search-demand drivers)

#### `/ ` — Home (app entry, `index.html`)
- **Current:** T=54 ✓ · M=232 ✗ (too long) · Schema: `RealEstateAgent + LocalBusiness + BreadcrumbList + ItemList` ✓
- **SEO gaps:** meta 232 -> ≤155; BreadcrumbList is a *nav list*, not a path (invalid); Organization missing `employees`/`founder`.
- **AEO gaps:** no direct-answer block for the #1 voice query ("who is the best luxury real estate agency in Lagos?").
- **GEO gaps:** no "quick facts" callout, no employee E-E-A-T.
- **Rewrite suggestions:**
  - Trim meta to: *"Luxury Properties Ltd — Nigeria's premier luxury real estate agency. Exclusive high-end homes in Lagos, Abuja & across Nigeria. Off-market listings + concierge advisory."* (148c).
  - Fix BreadcrumbList → single `[Home]` ListItem.
  - Add 48-word direct-answer H2: *"Luxury Properties Ltd is Lagos' premier luxury real estate agency, specialising in off-market residences above ₦50M in Ikoyi, Victoria Island, Banana Island and Lekki, with end-to-end concierge buying, selling and rental services."*
  - Add `employees`/`founder` array to Organization schema.
  - Add "Quick Facts" callout: *"500+ properties sold · ₦50M–₦5B portfolio · 15+ yrs expertise · 4.9/5 rating"*.

#### `/buy` — Buy Property
- **Current:** T=54 ✓ · M=165 ✗ · Schema: `Organization + BreadcrumbList`.
- **SEO gaps:** meta 165 -> ≤155.
- **AEO gaps:** no HowTo schema; no step-by-step direct answer for "how to buy luxury property in Nigeria".
- **GEO gaps:** no price band / market stat.
- **Rewrite suggestions:**
  - Trim meta: *"Buy luxury property in Lagos & Abuja with Luxury Properties Ltd. Verified high-end homes, off-market listings, expert guidance from offer to ownership."* (150c).
  - Add **HowTo JSON-LD** (8 steps: budget → shortlist → view → due diligence → verify title → negotiate → escrow → register).
  - Add 52-word direct answer: *"Buying luxury property in Nigeria is a multi-step process best navigated with a verified agent: secure funding, verify the Governor's Consent/Certificate of Occupancy, sign an escrow-backed offer, then register at the Land Registry."*
  - Add FAQ section (5 Qs) -> FAQPage schema: documents, foreigner eligibility, FX, closing costs, timeline.
  - Add H2 headings: `How the Process Works`, `Required Documents`, `Lagos vs Abuja Price Guide`.

#### `/sell` — Sell Property
- **Current:** T=63 ✗ · M=133 ✓ · Schema: `Organization + BreadcrumbList`.
- **AEO gaps:** no direct answer for "how to sell fast in Lagos"; no HowTo schema.
- **Rewrite suggestions:**
  - Title -> *"Sell Your Property in Lagos | Luxury Properties Ltd"* (45c).
  - Add **HowTo JSON-LD** (price, market, prep, viewings, negotiate, close).
  - Add 50-word direct answer: *"To sell your luxury property fast in Lagos, price to recent comparable sales, stage for photography, list on premium portals plus off-market networks, and use escrow for a secure closing — typically 30-60 days."*
    - Add FAQPage schema (commission, valuation, timeline, documents).

#### `/properties` — Properties Listing
- **Current:** T=66 ✗ · M=122 ✓ · Schema: `ItemList + Product` (hardcoded 6) + BreadcrumbList.
- **SEO gaps:** title 66 -> trim; `numberOfItems`/`itemListElement` hardcoded — must be dynamic.
- **AEO gaps:** no direct answer for "how much does a luxury home cost in Lagos".
- **Rewrite suggestions:**
  - Title -> *"Luxury Homes for Sale in Lagos | Luxury Properties Ltd"* (53c).
  - Make `ItemList.numberOfItems` dynamic in `PropertiesPage`.
  - Add 48-word direct answer: *"Luxury homes for sale in Lagos range from ₦80M (Lekki 2-bed) to ₦2.5B (Banana Island waterfront); prime Ikoyi/Victoria Island residences average ₦150M–₦800M."*
  - Add FAQPage schema: price ranges, financing, viewing process.
  - Each grid card emits `Product`+`Offer` (keep `generateItemListSchema`, extend to dynamic feed).

#### `/blog` — Blog hub
- **Current:** T=80 ✗ · M=130 ✓ · Schema: **none** ✗.
- **SEO gaps:** title too long; H1 good ("Luxury Real Estate Insights & Guides") but no CollectionPage/ItemList/Breadcrumb.
- **Rewrite suggestions:**
  - Title -> *"Luxury Real Estate Blog — Nigeria Market Insights"* (52c).
  - Add `CollectionPage + BreadcrumbList + ItemList` JSON-LD for latest 6 posts.
  - Add 42-word intro direct answer: *"Our blog covers Nigeria's luxury real-estate market — buying guides, price updates, neighbourhood trends and investment insight for Lagos, Abuja and Port Harcourt."*
  - Add H2: `Latest Articles`, `Guides`, `Market Trends`.

#### `/blog/:slug` — Blog post (template)
- **Current:** T=dynamic `{title} | Luxury Properties Ltd` ✗ (slugs often >60) · M=dynamic · Schema: `Article + FAQPage + Organization` ✓ (React only; static HTML export lacks schema on most posts).
- **AEO gaps:** plain-text Q&A not structured; no HowTo on guides.
- **E-E-A-T gaps:** no `author`/`datePublished`/`dateModified` on static exports; no author bio.
- **Rewrite suggestions:**
  - Enforce Helmet: truncate `title` to ≤60 chars; append brand only if it fits.
  - Article schema: add `dateModified` = last edit date.
  - Add HowTo schema to 4 how-to posts: buying-guide, selling-guide, diaspora-guide, governor's-consent timeline.
  - Add FAQPage schema to 5 FAQ-heavy posts: most-expensive, voice-search-faqs, documents-needed, investment-tips, real-estate-news.
  - Add author bios (name+credentials) + `author` JSON-LD on React; back-fill static exports via the part-1 inject script.

#### `/faq` — FAQ page
- **Current:** T=61 (borderline) · M=131 ✓ · Schema: `FAQPage + BreadcrumbList` ✓.
- **SEO gaps:** only ~20 Qs; audit wants 40+.
- **Rewrite suggestions:**
  - Expand to 40 Qs grouped: Buying · Selling · Renting · Investing · Documents · Prices · Diaspora.
  - Split >60-word answers into 40-60-word voice-ready snippets with "Quick answer" prefix.
  - Add `Question/Answer` blocks for top 10 PAA queries from AEO report.
  - Title -> *"FAQ — Luxury Real Estate in Nigeria"* (43c).

#### `/reviews` — Reviews/Testimonials
- **Current:** T=66 ✗ · M=115 ✓ · Schema: `BreadcrumbList` only (no Review/AggregateRating).
- **AEO gaps:** no direct answer for "is Luxury Properties Ltd trustworthy?".
- **Rewrite suggestions:**
  - Title -> *"Client Reviews — Luxury Properties Ltd"* (42c).
  - Add `Review + AggregateRating` JSON-LD (4.9 avg, 180 reviews, snippet quotes).
  - Add 45-word direct answer: *"Luxury Properties Ltd holds a 4.9/5 average from 180 verified buyers, sellers and investors across Lagos, Abuja and Port Harcourt, with 98% closing success on luxury listings."*
  - Wire `review[]` with `author` + `datePublished`.

#### `/properties/:id` — Property Details (template)
- **Current:** T=dynamic · M=empty ✗ · Schema: `Residence + BreadcrumbList` (from `src/lib/structuredData.js`).
- **SEO gaps:** `Residence` is sub-optimal — Google prefers `RealEstateListing`+`Product`; dynamic title may exceed 60; meta not set in SSR snapshot.
- **AEO/GEO gaps:** AEO content is plain markdown, not FAQPage schema; no direct answer.
- **Rewrite suggestions:**
  - In `generatePropertySchema`: `@type:"Residence"` -> `"RealEstateListing"`, nest `Product`+`Offer`; keep `geo`/`floorSize`/`yearBuilt`.
  - Convert `generateAEOContent()` FAQ into FAQPage JSON-LD; add `review`+`aggregateRating` when present.
  - Add 50-word direct answer under H1: *"[Name] is a {type} in {location} priced at {price}, {beds} bed/{baths} bath over {area} sqm, tenure {tenure}."*
    - Ensure H1 + `document.title` populate in prerender snapshot.

### MEDIUM priority (supporting / mid-funnel pages)

#### `/about` — About Us
- **Current:** T=71 ✗ · M=204 ✗ · Schema: `Organization + BreadcrumbList` ✓.
- **SEO gaps:** title 71 -> 58; meta 204 -> 150.
- **AEO gaps:** no direct answer for "who is the best luxury real estate agency in Lagos?".
- **E-E-A-T gaps:** no employee bios/credentials/founding story with data.
- **Rewrite suggestions:**
  - Title -> *"About Us | Luxury Properties Ltd — Nigeria Luxury Real Estate"* (56c).
  - Meta -> *"Meet Luxury Properties Ltd — Nigeria's premium luxury real estate agency. 15+ years, 500+ sales, off-market access in Lagos, Abuja & Port Harcourt."* (148c).
  - Add 47-word direct answer: *"Luxury Properties Ltd is Nigeria's premier luxury real estate advisory, representing high-end buyers and sellers across Lagos, Abuja and Port Harcourt with 15+ years' experience and 98% client satisfaction."*
  - Add employee bios (names, MRICS/RICS, years) + `employees` JSON-LD.
  - H2: `Our Story`, `Our Team`, `Our Difference`, `Leadership`.

#### `/agents` — Real Estate Agents
- **Current:** T=56 ✓ · M=144 ✓ · Schema: `Organization + BreadcrumbList` ✓. H2s = 0 ✗.
- **SEO gaps:** flat heading structure.
- **Rewrite suggestions:**
  - Add H2: `Lagos Luxury Property Experts`, `Lead Agent Profiles`, `Why Work With Us`.
  - Direct answer: *"Our Lagos agents specialise in luxury transactions across Ikoyi, Victoria Island, Banana Island and Lekki — each verified, averaging 8+ years in premium real estate."* (46w)
  - Add FAQPage schema (credentials, commission split, buyer rebates).

#### `/rent` — Rent Property
- **Current:** T=81 ✗ · M=130 ✓ · Schema: `Organization + BreadcrumbList`.
- **SEO gaps:** title 81 -> trim; no FAQPage despite AEO recommendation.
- **Rewrite suggestions:**
  - Title -> *"Rent Luxury Apartments in Lagos | Luxury Properties Ltd"* (55c).
  - Add FAQPage schema (shortlet vs annual, FX rent, deposits, service charges).
  - Direct answer (47w): *"Rent luxury apartments in Lagos via verified listings in Ikoyi, Victoria Island, Lekki and Banana Island, with shortlet and annual options plus full concierge rental management."*
  - H2: `Ikoyi Rentals`, `Victoria Island`, `Lekki Shortlets`.

#### `/services` — Services
- **Current:** T=82 ✗ · M=168 ✗ · Schema: `Organization + BreadcrumbList`.
- **SEO gaps:** both too long; H2 shallow.
- **Rewrite suggestions:**
  - Title -> *"Real Estate Services | Luxury Properties Ltd Nigeria"* (53c).
  - Meta -> *"Luxury real estate services in Nigeria: property management, investment advisory, off-market sourcing, concierge buying and corporate portfolio acquisition."* (147c).
  - Rewrite ServicesPage H2 list: `Property Management`, `Investment Advisory`, `Corporate Portfolio Acquisition`, `Concierge Buying`, `Valuation & Research`.
  - Add FAQPage schema per service line.

#### `/ongoing-projects` — Ongoing Projects
- **Current:** T=41 (SHORT — no keyword) · M=113 ✓ · Schema: `Organization + BreadcrumbList`.
- **Rewrite suggestions:**
  - Title -> *"Ongoing Luxury Real Estate Projects Nigeria 2026 | Luxury Properties Ltd"* (60c).
  - Meta -> *"Track Luxury Properties Ltd's ongoing luxury developments across Lagos and Abuja — timelines, locations, pricing and 2026 launch updates."* (146c).
  - Add FAQPage schema (completion timelines, payment plans, off-plan safety).
  - Direct answer (46w): *"We manage 12 luxury developments across Lagos and Abuja with combined GDV of ₦18B and estimated Q1-2027 completions in Lekki and Maitama."*

#### `/client-success` — Client Success Stories
- **Current:** T=47 (short) · M=137 ✓ · Schema: `Organization + BreadcrumbList`.
- **Rewrite suggestions:**
  - Title -> *"Client Success Stories | Luxury Properties Ltd Nigeria"* (53c).
  - Add `Article` schema per case study (headline, datePublished, author, image).
    - Direct answer (45w): *"Our clients have safely purchased 500+ luxury properties across Lagos, Abuja and Port Harcourt at 98% transaction success and average 18% below-market acquisition prices."*

#### `/epan` — Elite Property Agents Network
- **Current:** T=66 ✓ · M=138 ✓ · Schema: `Organization + BreadcrumbList`; H1 empty in JSX (set dynamically).
- **Rewrite suggestions:**
  - Title -> *"EPAN — Elite Property Agents Network Nigeria | Luxury Properties Ltd"* (60c).
  - Ensure H1 = "Elite Property Agents Network (EPAN)".
  - Add FAQPage schema (eligibility, benefits, application, revenue share).
  - Direct answer (44w): *"EPAN is Luxury Properties Ltd's network of verified top-tier agents, giving members exclusive listings, training and co-marketing across Nigeria's premium property market."*

#### `/office-locations` — Office Locations
- **Current:** T=39 (short) · M=132 ✓.
- **Rewrite suggestions:**
  - Title -> *"Our Office Locations in Nigeria | Luxury Properties Ltd"* (56c).
  - Add `Place` schema per office (address, geo, openingHours, telephone).
  - Add FAQPage schema (hours, appointments, parking).

#### `/company-registration` — Company Registration (RC 9601729)
- **Current:** T=53 ✓ · M=131 ✓ · Schema: `Organization + BreadcrumbList`.
- **Rewrite suggestions:**
  - Title -> *"Company Registration | Luxury Properties Ltd — RC 9601729"* (56c).
  - Keep CAC/RC number prominent; add trust-signal alt text; verification date.
  - Add `Organization` JSON-LD with `identifier` = CAC RC 9601729.

#### Policies (Privacy / Terms / Cookie / Refund) — LOW
- T≈35–55 ✓ (branded) · M≈110–130 ✓ · Schema: `Organization + BreadcrumbList`.
- **Verdict:** keep for crawlability/trust (legal pages are low-risk to index). No title/meta changes needed — low priority. Cross-link between them.

---

### Compact matrix — all remaining static pages (blog + landing)

| Page (route/file) | Primary keyword* | T | M | Schema present | Top gap | Priority |
|---|---|---|---|---|---|---|
| blog/nigerian-real-estate-buying-guide.html | nigerian real estate buying guide | 55 | 151 | none ✗ | no Article/HowTo, no author/date | High |
| blog/real-estate-investment-tips-nigeria.html | real estate investment tips nigeria | 65 | 154 | none ✗ | no Article/FAQPage, no author | High |
| blog/property-selling-guide-nigeria.html | property selling guide nigeria | 84 | 149 | none ✗ | title>60, no Article/HowTo | High |
| blog/real-estate-news-market-trends.html | nigerian real estate market trends | 65 | 156 | none ✗ | FAQ accordion not schema'd | High |
| blog/most-expensive-neighborhoods-lagos-2026.html | most expensive neighborhoods lagos | 64 | 154 | FAQPage | no Article/author/date | High |
| blog/banana-island-property-guide.html | banana island luxury property guide | 64 | 156 | FAQPage | no Article/author/date | High |
| blog/how-to-buy-luxury-property-nigeria.html | how to buy luxury property nigeria | 62 | 147 | none ✗ | no Article/HowTo | High |
| blog/luxury-property-lekki-complete-guide.html | luxury property lekki lagos | 56 | 156 | none ✗ | no Article/FAQPage | High |
| blog/sell-luxury-property-fast-lagos.html | sell luxury property fast lagos | 68 | 135 | none ✗ | no Article/HowTo | High |
| blog/diaspora-guide-buy-property-nigeria-abroad.html | buy property nigeria from abroad | 70 | 146 | none ✗ | title>60, no Article/HowTo | High |
| blog/voice-search-optimized-faqs.html | voice search faq real estate | 59 | 137 | FAQPage | no Article, no HowTo | Med |
| blog/luxury-home-cost-lagos-2026.html | how much luxury home cost lagos | 62 | 137 | none ✗ | no Article/FAQPage | Med |
| blog/luxury-real-estate-investment-roi-lagos.html | luxury real estate roi lagos | 67 | 158 | none ✗ | meta>155, no Article | Med |
| blog/ikoyi-real-estate-guide.html | ikoyi real estate guide | 64 | 142 | none ✗ | no Article | Med |
| blog/victoria-island-luxury-real-estate-guide.html | victoria island luxury estate | 55 | 145 | none ✗ | no Article | Med |
| blog/certificate-of-occupancy-vs-governors-consent.html | certificate of occupancy nigeria | 73 | 146 | none ✗ | title>60, no Article/HowTo | Med |
| blog/governors-consent-timeline-lagos-2026.html | governors consent timeline lagos | 58 | 133 | none ✗ | no Article/HowTo | Med |
| blog/documents-needed-buy-property-nigeria.html | documents to buy property nigeria | 67 | 132 | none ✗ | no Article/FAQPage | Med |
| blog/best-areas-lagos-expats.html | best areas to live in lagos expats | 74 | 144 | none ✗ | title>60, no Article | Med |
| blog/luxury-concierge-real-estate-nigeria.html | luxury concierge real estate | 58 | 147 | none ✗ | no Article | Med |
| blog/off-market-properties-lagos.html | off market properties lagos | 64 | 150 | none ✗ | no Article | Med |
| blog/comparison/index.html | nigerian luxury property comparison | 103 | 146 | Article+Organization | title way>60, no FAQPage, no Breadcrumb | Med |
| blog/listicle/index.html | luxury property type list | 92 | 144 | ItemList | title>60, no Breadcrumb/Article | Med |
| buying-guides-blog.html (root dup) | nigerian real estate buying guide | 55 | 151 | FAQ? accordion | **duplicate** of blog/nigerian-real-estate-buying-guide — canonical/noindex | Med |
| property_selling_guide_nigeria.html (root dup) | property selling guide nigeria | 84 | 149 | none ✗ | **duplicate** of blog slug — canonical/noindex | Med |
| market_trend_blog_post.html (root dup) | nigerian real estate market trend 2026 | 87 | 153 | none ✗ | **duplicate** — canonical/noindex | Med |
| Real_estate_news.html (root dup) | nigerian real estate market trends | 65 | 156 | FAQ? accordion | **duplicate** of blog/real-estate-news-market-trends | Med |
| Investment Tips.html (root dup) | real estate investment tips nigeria | 65 | 154 | FAQ? accordion | **duplicate** of blog/real-estate-investment-tips | Med |

**Landing pages** (`landing/*`, 15 pages) — schema already rich (`WebPage+ItemList+FAQPage+LocalBusiness`).
| Page | Primary keyword | T | M | Schema | Top gap | Priority |
|---|---|---|---|---|---|---|
| landing/luxury-homes-for-sale-lagos.html | luxury homes for sale lagos | 56 | 155 | WebPage+ItemList+FAQ+LocalBusiness | add BreadcrumbList; HowTo on buying pages | Low |
| landing/banana-island-luxury-properties.html | banana island luxury properties | 58 | 143 | same | add BreadcrumbList | Low |
| landing/luxury-house-for-sale-ikoyi.html | luxury house for sale ikoyi | 56 | 136 | same | add BreadcrumbList | Low |
| landing/apartment-for-sale-victoria-island.html | apartment for sale victoria island | 60 | 145 | same | add BreadcrumbList | Low |
| landing/duplex-for-sale-lagos.html | duplex for sale lagos | 55 | 150 | same | add BreadcrumbList | Low |
| landing/commercial-property-lagos.html | commercial property lagos | 55 | 144 | same | add BreadcrumbList | Low |
| landing/house-for-sale-lekki.html | house for sale lekki | 61 | 153 | same | add BreadcrumbList | Low |
| landing/land-for-sale-ajah.html | land for sale ajah | 55 | 148 | same | add BreadcrumbList | Low |
| landing/luxury-apartments-nigeria.html | luxury apartments nigeria | 55 | 132 | same | add BreadcrumbList | Low |
| landing/luxury-homes-nigeria.html | luxury homes nigeria | 46 | 133 | same | add BreadcrumbList | Low |
| landing/real-estate-investment-lagos.html | real estate investment lagos | 55 | 131 | same | add BreadcrumbList + FAQ Q&A | Low |
| landing/shortlet-apartment-lagos.html | shortlet apartment lagos | 64 | 147 | same | add BreadcrumbList | Low |
| landing/buy-luxury-property-lekki.html | buy luxury property lekki | 62 | 146 | same | **add HowTo + FAQPage** | Med |

\* Primary keywords per `tools/meta_fixes_part1.json` & `part2.json` (+ AEO_REPORT keyword table). "none ✗" = no JSON-LD script at all; otherwise = partial coverage only.

> **Duplicate-content alert:** five root-level HTML files (`buying-guides-blog.html`, `Investment Tips.html`, `Real_estate_news.html`, `market_trend_blog_post.html`, `property_selling_guide_nigeria.html`) are legacy twins of canonical `/blog/:slug` posts. Recommend 301 → canonical slug OR `noindex` to consolidate link equity. None appear in `sitemap.xml` (good) — confirm and redirect.

---

## 3. Title/meta health at a glance
| Length bucket | T ≤60 | 60<T≤75 | T>75 | M ≤155 | M>155 |
|---|---|---|---|---|---|
| Pages affected | 36 | 6 | **5** (comparison 103, listicle 92, market_trend 87, market_trend-root 87, property-selling 84) | 37 | **5** (investment-roi 158, luxury-property-lekki 156, banana 156, real-estate-news 156, Real_estate_news-root 156) |

**Fix pattern (apply everywhere):** `title = "{slug-friendly keyword} | Luxury Properties Ltd"` (≤58 chars); `meta = "{keyword-driven USP + CTA}"`, hard-trimmed to ≤155.

## 4. Implementation priority queue (engineer-ready)
1. **Homepage meta rewrite** in `index.html` → ✅ done (127c, keyword up-front).
2. **Static duplicate cleanup** → redirect root dups to `/blog/:slug` (or noindex); removes 5 duplicate indexable pages.
3. **`BlogPage.jsx`** → add `CollectionPage + BreadcrumbList + ItemList` JSON-LD via `generateItemListSchema`.
4. **`PropertyDetailsPage`** → in `structuredData.js` change `Residence`→`RealEstateListing`+`Product`; add `review`/`FAQPage`.
5. **`structuredData.js`** → add `generateHowToSchema(steps)`, `generateFAQSchema(qas)`, `generateAuthorSchema(author)`.
6. **Static blog inject** → run `tools/inject_seo_aeo_geo_part1.mjs` (part 1 of 2) to back-fill Article + FAQPage + author + direct-answer onto all 22 static blog/guide pages in one pass.
7. **React posts** → wire `author`/`datePublished`/`dateModified` + HowTo/FAQPage schema via Helmet in `BlogPostPage.jsx`/`BlogPostLayout.jsx`.

## 5. 30 / 60 / 90-day roadmap
| Window | Goals |
|---|---|
| 30 days | Title/meta fixes sitewide (≤58/≤155); 5 dup redirects; BlogPage + PropertyDetails schema; BlogPostPage Article author/date. **~14 pages AEO-complete.** |
| 60 days | Inject 22 static blog/guide pages with Article+FAQPage+HowTo+author+direct-answer; BlogPage CollectionPage; Reviews/AggregateRating; OfficeLocations Place; FAQ→40 Qs. **55+ pages AEO-complete.** |
| 90 days | GEO fact-checking (sources) on top 12 posts; EEAT author bios + `sameAs`; re-audit → `tools/seo_aeo_geo_audit.tsv` green >95%. **Site-wide GEO/AEO parity + snippet presence in GSC.** |

## 6. Conclusion
The **audit-critical errors (orphan pages, missing robots.txt / sitemap, AI-bot blocks) are already resolved.** What remains is on-page discipline at scale: **9 over-long titles, 5 over-long metas, 22 static blog posts with zero Article/FAQPage/HowTo schema and no author/date E-E-A-T signals, partial React schema coverage, and 5 duplicate root pages.** Prioritising the 9 High SPA pages + 10 High static posts + duplicate redirects addresses ~80% of the residual AEO/GEO gap; everything else is incremental Low/Med lift.





