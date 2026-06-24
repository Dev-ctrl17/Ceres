# Next.js Deployment Guide
## Luxury Properties Ltd — Deploy to Production

**Date:** June 24, 2026  
**Status:** Ready for Deployment

---

## 🚀 Quick Deploy to Vercel (Recommended)

### 1. Push to GitHub
```bash
cd Apps/web
git add .
git commit -m "feat: migrate to Next.js 14 with SSR"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `Apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 3. Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lrmljudwbzjawafuztwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
BREVO_API_KEY=YOUR_SENDINBLUE_API_KEY
VITE_MAILBOXLAYER_ENABLED=true
```

### 4. Deploy
Click "Deploy" — Vercel will build and deploy automatically.

---

## 📋 Pre-Deployment Checklist

### Required
- [ ] Push code to GitHub/GitLab
- [ ] Set all environment variables in hosting platform
- [ ] Configure custom domain (luxurypropertiesltd.com.ng)
- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Test all pages load correctly
- [ ] Test property search/filter functionality
- [ ] Test contact form submission
- [ ] Verify sitemap.xml loads at `/sitemap.xml`
- [ ] Verify robots.txt loads at `/robots.txt`
- [ ] Test mobile responsiveness

### SEO Verification
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify Google Business Profile is linked
- [ ] Test rich snippets with Google Rich Results Test
- [ ] Verify Open Graph tags with Facebook Debugger
- [ ] Check Twitter Card validator

---

## 🏠 Alternative Deployment Options

### Option 2: Netlify

1. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x or 20.x

2. **Environment Variables:**
   - Same as Vercel (NEXT_PUBLIC_* variables)

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option 3: Self-Hosted (VPS/Dedicated)

1. **Build:**
   ```bash
   npm run build
   ```

2. **Start:**
   ```bash
   npm start
   # Runs on http://localhost:3000
   ```

3. **With PM2 (Process Manager):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "luxury-properties" -- start
   pm2 save
   pm2 startup
   ```

4. **With Nginx Reverse Proxy:**
   ```nginx
   server {
       listen 80;
       server_name luxurypropertiesltd.com.ng www.luxurypropertiesltd.com.ng;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔄 Migration Strategy: Running Both Apps

During transition, you can run both the old Vite app and new Next.js app:

### Option A: Subdirectory (Recommended)
- **Old app:** `luxurypropertiesltd.com.ng` (Vite)
- **New app:** `app.luxurypropertiesltd.com.ng` (Next.js)
- Test new app, then switch DNS

### Option B: Parallel Routes
- **Old app:** `/` (Vite)
- **New app:** `/next/*` (Next.js)
- Use Nginx to route based on path

### Option C: Full Cutover
1. Deploy Next.js to staging
2. Test thoroughly
3. Update DNS/domain to point to Next.js
4. Keep Vite app as backup (can revert quickly)

---

## 📊 Performance Optimization

### Image Optimization
Next.js automatically:
- Converts images to WebP/AVIF
- Lazy loads images
- Prevents layout shift (CLS)

### Caching Strategy
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### CDN Configuration
If using Vercel/Netlify, CDN is automatic. For self-hosted:
- Use Cloudflare in front
- Enable "Auto Minify" (JS, CSS, HTML)
- Enable "Brotli" compression
- Set cache rules for static assets

---

## 🔍 Post-Deployment SEO Tasks

### 1. Google Search Console
1. Verify ownership (DNS or HTML file)
2. Submit sitemap: `https://luxurypropertiesltd.com.ng/sitemap.xml`
3. Monitor indexing status
4. Check for crawl errors

### 2. Bing Webmaster Tools
1. Import from Google Search Console (easiest)
2. Or verify manually
3. Submit sitemap

### 3. Google Business Profile
1. Ensure GBP is claimed
2. Link to website
3. Add posts, photos, services
4. Encourage reviews

### 4. Analytics
1. Google Analytics 4 is already integrated (deferred)
2. Set up conversion goals:
   - Contact form submissions
   - Property inquiries
   - Phone calls
   - Newsletter signups

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Restart dev server after changing `.env`
- Check hosting platform env var settings

### Images Not Loading
- Verify domain in `next.config.mjs` → `images.remotePatterns`
- Use `next/image` instead of `<img>`
- Check image URLs are accessible

### Supabase Errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check RLS policies allow read access
- Test connection in Supabase dashboard

---

## 📈 Monitoring

### Uptime Monitoring
- Use UptimeRobot, Pingdom, or similar
- Monitor: `https://luxurypropertiesltd.com.ng`
- Check every 5 minutes

### Performance Monitoring
- Vercel Analytics (if using Vercel)
- Google PageSpeed Insights
- WebPageTest.org

### Error Tracking
- Sentry.io for error tracking
- Or Vercel Error Tracking (built-in)

---

## 🔐 Security

### Headers
Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
}
```

### Rate Limiting
- Use Vercel Edge Middleware or Cloudflare
- Protect API routes from abuse

---

## 📞 Support

If you encounter issues:
1. Check Next.js docs: https://nextjs.org/docs
2. Review deployment logs in hosting platform
3. Check browser console for client-side errors
4. Verify environment variables are set correctly

---

## ✅ Deployment Complete Checklist

After successful deployment:
- [ ] All pages load without errors
- [ ] Property search/filter works
- [ ] Contact form submits successfully
- [ ] Images load correctly
- [ ] Mobile responsive
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Google Search Console verified
- [ ] Analytics tracking working
- [ ] Performance score > 90 (PageSpeed Insights)

---

**Next Steps After Deployment:**
1. Monitor Search Console for indexing
2. Submit sitemap to Bing
3. Update GBP with new website URL
4. Start link building campaign
5. Create blog content consistently
6. Monitor Core Web Vitals