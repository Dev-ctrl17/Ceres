// Vercel Edge Middleware — Prerender.io integration
//
// Vercel serves this middleware for every matching request BEFORE your
// static SPA files. When a search engine or social-media crawler bot is
// detected (by User-Agent), we proxy the request to Prerender.io, which
// returns fully-rendered HTML (with each page's real title, meta tags,
// and content) instead of the empty <div id="root"></div> shell those
// crawlers would otherwise see.
//
// Regular human visitors are completely unaffected — they still get the
// normal fast client-rendered SPA.
//
// SETUP:
// 1. Place this file at the ROOT of your project (same level as
//    package.json / vercel.json), named exactly `middleware.js`.
// 2. In Vercel dashboard -> Project -> Settings -> Environment Variables,
//    add: PRERENDER_TOKEN = xcFP7j4na15ouZnzje90
//    (Don't hardcode the token in this file for a production deploy —
//    env var keeps it out of your git history.)
// 3. Redeploy. Vercel automatically picks up middleware.js with no
//    extra config needed.
// 4. Test: curl -A "Googlebot" https://luxurypropertiesltd.com.ng/buy
//    You should get back full rendered HTML with the real Buy page
//    title/meta, not the generic homepage shell.
// 5. Back in the Prerender.io dashboard, click "Verify Integration".

export const config = {
  // Run on every route except static assets and API routes.
  matcher: '/((?!assets|api|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)).*)',
};

// Known search engine + social/link-preview crawler user-agent fragments.
// Matching is case-insensitive substring matching against the request's
// User-Agent header.
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'pinterestbot',
  'slackbot',
  'vkshare',
  'w3c_validator',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'bitlybot',
  'skypeuripreview',
  'nuzzel',
  'discordbot',
  'google page speed',
  'qwantify',
  'bitrix link preview',
  'xing-contenttabreceiver',
  'chrome-lighthouse',
  'telegrambot',
  'developers.google.com/+/web/snippet',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // Not a recognized crawler -> let the normal SPA serve as usual.
  if (!isBot(userAgent)) {
    return; // Returning undefined tells Vercel to continue as normal.
  }

  const url = new URL(request.url);
  const prerenderToken = process.env.PRERENDER_TOKEN;

  if (!prerenderToken) {
    console.error('PRERENDER_TOKEN environment variable is not set — skipping prerender.');
    return;
  }

  try {
    const prerenderUrl = `https://service.prerender.io/${url.toString()}`;

    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': prerenderToken,
        'User-Agent': userAgent,
      },
    });

    const body = await prerenderResponse.text();

    return new Response(body, {
      status: prerenderResponse.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Prerendered': 'true',
      },
    });
  } catch (err) {
    console.error('Prerender.io request failed:', err);
    // Fall through to normal SPA rendering rather than showing an error
    // to the crawler.
    return;
  }
}
