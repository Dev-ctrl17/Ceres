# Next.js Migration Guide — Luxury Properties Ltd

## ✅ Completed (Phase 1-2 Foundation)

### Files Created
- `next.config.mjs` — Next.js configuration with image domains and rewrites
- `src/lib/supabaseServer.js` — Server-side Supabase client for SSR
- `src/app/globals.css` — Migrated from `src/index.css`
- `src/app/layout.jsx` — Root layout with full SEO metadata, JSON-LD schema, hreflang
- `src/app/page.jsx` — Home page with SSR data fetching (fetches properties server-side)
- `src/app/sitemap.js` — Dynamic sitemap with static pages + dynamic properties + blog posts
- `src/app/robots.js` — Dynamic robots.txt
- `package.json` — Updated scripts for Next.js (`next dev`, `next build`, `next start`)

### What Works Now
- **SSR on home page** — Properties are fetched server-side, visible to crawlers
- **Dynamic sitemap** — Auto-generated at `/sitemap.xml` with all pages
- **Dynamic robots.txt** — Auto-generated at `/robots.txt`
- **Full JSON-LD schema** — RealEstateAgent + LocalBusiness in root layout
- **Hreflang tags** — en-ng, en, x-default
- **Open Graph + Twitter Cards** — In root metadata
- **Font optimization** — Next.js font loading with `display=swap`

## 🚀 How to Run

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Then visit `http://localhost:3000`

## 📋 Remaining Migration Steps

### Phase 2: Migrate Remaining Pages (Priority Order)

Create these files in `src/app/`:

```
src/app/
├── buy/page.jsx          # From src/pages/BuyPage.jsx
├── rent/page.jsx         # From src/pages/RentPage.jsx
├── sell/page.jsx         # From src/pages/SellPage.jsx
├── properties/
│   ├── page.jsx          # From src/pages/PropertiesPage.jsx
│   └── [id]/page.jsx     # From src/pages/PropertyDetailsPage.jsx
├── services/page.jsx     # From src/pages/ServicesPage.jsx
├── epan/page.jsx         # From src/pages/EPANPage.jsx
├── agents/page.jsx       # From src/pages/AgentsPage.jsx
├── reviews/page.jsx      # From src/pages/ReviewsPage.jsx
├── about/page.jsx        # From src/pages/AboutPage.jsx
├── contact/page.jsx      # From src/pages/ContactPage.jsx
├── faq/page.jsx          # From src/pages/FAQPage.jsx
├── blog/
│   ├── page.jsx          # Blog index (from BlogPage.jsx)
│   └── [slug]/page.jsx   # Individual blog posts
├── login/page.jsx        # From src/pages/LoginPage.jsx
└── admin/
    └── page.jsx          # From src/pages/AdminDashboard.jsx
```

**Migration Pattern for Each Page:**

```jsx
// Example: src/app/buy/page.jsx
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BuyPageContent from '@/components/BuyPageContent.jsx';

export const metadata = {
  title: 'Buy Property | Luxury Properties Ltd',
  description: 'Find your dream luxury property in Lagos...',
  alternates: { canonical: '/buy' },
};

export default function BuyPage() {
  return (
    <>
      <Header />
      <BuyPageContent />
      <Footer />
    </>
  );
}
```

**Key Changes:**
1. Remove `react-router-dom` — use file-based routing
2. Remove `react-helmet` — use Next.js `metadata` export
3. Move page content to separate component files (e.g., `components/BuyPageContent.jsx`)
4. Replace client-side data fetching with `async/await` in page components
5. Add JSON-LD schema via `<script>` tags or `dangerouslySetInnerHTML`

### Phase 3: Data Fetching Strategy

**SSR (Server-Side Rendering) — Use for:**
- Home page (featured properties)
- Properties listing page
- Property detail pages (with `revalidate = 60` for ISR)
- Blog index

**SSG (Static Site Generation) — Use for:**
- About page
- Services page
