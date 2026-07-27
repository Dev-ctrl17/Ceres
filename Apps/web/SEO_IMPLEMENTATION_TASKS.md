# SEO Implementation Tasks - Luxury Properties Ltd

## Task Progress Checklist

### 1. Google Search Console Setup
- [x] Verify domain ownership file exists (googlec5d3e468141d2edd.html)
- [x] Confirm sitemap.xml exists with correct Content-Type header
- [ ] Update sitemap.xml with all routes (missing: company-registration, ongoing-projects, client-success, investment-brief, login)
- [ ] Ensure sitemap.xml is NOT blocked by robots.txt (currently has noindex header - NEEDS FIX)
- [ ] Add auto-update mechanism for dynamic property listing URLs

### 2. Unique Title + Meta Description Per Page
- [x] HomePage - has unique title/description ✓
- [x] BuyPage - has unique title/description ✓
- [x] SellPage - has unique title/description ✓
- [x] PropertiesPage - has unique title/description ✓
- [x] BlogPage - has unique title/description ✓
- [x] BlogPostPage - has unique title/description ✓
- [x] AboutPage - has unique title/description ✓
- [x] ContactPage - has unique title/description ✓
- [ ] PropertyDetailsPage - needs dynamic title format: "{bedrooms}-Bed {propertyType} in {location} | Luxury Properties Ltd"
- [ ] RentPage - check and update if needed
- [ ] ServicesPage - check and update if needed
- [ ] FAQPage - check and update if needed
- [ ] AgentsPage - check and update if needed
- [ ] ReviewsPage - check and update if needed
- [ ] EPANPage - check and update if needed
- [ ] Other pages - audit remaining pages

### 3. Proper Heading Structure (H1/H2)
- [ ] HomePage - verify single H1
- [ ] AboutPage - FIX: Currently has no H1 (uses styled div with heading-lg class)
- [ ] BuyPage - verify single H1
- [ ] SellPage - verify single H1
- [ ] PropertiesPage - verify single H1
- [ ] PropertyDetailsPage - verify single H1
- [ ] BlogPage - verify single H1
- [ ] BlogPostPage - verify single H1
- [ ] ContactPage - verify single H1
- [ ] All other pages - audit and fix

### 4. Structured Data (Schema.org JSON-LD)
- [x] Organization schema in index.html ✓
- [x] BreadcrumbList schema in index.html ✓
- [x] PropertyDetailsPage has RealEstateListing schema ✓
- [x] BlogPostPage has Article schema ✓
- [ ] Add Organization schema to AboutPage
- [ ] Add BreadcrumbList to all major pages
- [ ] Validate all schemas against schema.org validator

### 5. Alt Text on All Images
- [ ] PropertyCard - improve alt text from generic "Property image" to descriptive
- [ ] ImageSlider - add alt text to images
- [ ] HeroSlider - audit and improve alt text
- [ ] AboutPage team photos - verify alt text uses agent names
- [ ] All page hero images - improve alt text
- [ ] Decorative images - ensure alt="" (empty)
- [ ] Ensure alt text is required field in Supabase data model

### 6. PageSpeed Insights Fixes
- [ ] Run PageSpeed Insights on homepage
- [ ] Run PageSpeed Insights on property listing page
- [ ] Run PageSpeed Insights on blog page
- [ ] Fix unoptimized images (WebP/AVIF conversion)
- [ ] Add width/height attributes to prevent CLS
- [ ] Implement lazy loading for below-the-fold images
- [ ] Check render-blocking JS/CSS
- [ ] Add preconnect/dns-prefetch hints for third-party origins
- [ ] Code-split vendor bundles if needed
- [ ] Show before/after bundle size comparison

## Implementation Priority
1. Fix sitemap.xml and robots.txt (critical for indexing)
2. Fix heading structure (critical for SEO)
3. Improve meta titles/descriptions
4. Enhance structured data
5. Fix alt text
6. Performance optimizations