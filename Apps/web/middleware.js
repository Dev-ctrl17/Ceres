// Vercel Edge Middleware — optional Prerender.io integration
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
// SETUP (currently disabled by default):
// 1. Place this file at the ROOT of your project (same level as
//    package.json / vercel.json), named exactly `middleware.js`.
// 2. In Vercel dashboard -> Project -> Settings -> Environment Variables,
//    add: PRERENDER_TOKEN = q3Q6RZfgc1h8Oa6cLsF4
//    (Don't hardcode the token in this file for a production deploy —
//    env var keeps it out of your git history.)
// 3. Set PRERENDER_ENABLED=true, then redeploy. Vercel automatically picks up middleware.js with no
//    extra config needed.
// 4. Test: curl -A "Googlebot" https://luxurypropertiesltd.com.ng/buy
//    You should get back full rendered HTML with the real Buy page
//    title/meta, not the generic homepage shell.
// 5. Back in the Prerender.io dashboard, click "Verify Integration".

export const config = {
  // Run on every route except static assets and API routes.
  matcher:
    "/((?!assets|api|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)).*)",
};

// Known search engine + social/link-preview crawler user-agent fragments.
// Matching is case-insensitive substring matching against the request's
// User-Agent header.

const BOT_USER_AGENTS = [
  // --- Traditional search engines (you already have most of these) ---
  "googlebot",
  "bingbot",
  "yandex",
  "baiduspider",
  "duckduckbot",
  "sogou",
  "seznambot",
  "facebookexternalhit",
  "twitterbot",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest",
  "pinterestbot",
  "slackbot",
  "vkshare",
  "w3c_validator",
  "redditbot",
  "applebot",
  "whatsapp",
  "flipboard",
  "tumblr",
  "bitlybot",
  "skypeuripreview",
  "nuzzel",
  "discordbot",
  "google page speed",
  "qwantify",
  "bitrix link preview",
  "xing-contenttabreceiver",
  "chrome-lighthouse",
  "telegrambot",
  "developers.google.com/+/web/snippet",

  // --- AI crawlers / LLM training & retrieval bots (this is what was missing) ---
  "gptbot", // OpenAI training crawler
  "oai-searchbot", // OpenAI ChatGPT search
  "chatgpt-user", // ChatGPT browsing plugin/agent
  "claudebot", // Anthropic training crawler
  "claude-web", // Anthropic web-browsing agent
  "anthropic-ai", // Anthropic (older UA string)
  "perplexitybot", // Perplexity AI
  "perplexity-user", // Perplexity user-triggered fetch
  "ccbot", // Common Crawl (feeds many LLMs' training data)
  "google-extended", // Google's AI-training-specific token (Bard/Gemini)
  "applebot-extended", // Apple's AI-training-specific token
  "bytespider", // ByteDance/TikTok AI crawler
  "diffbot", // Diffbot (used by many AI/data pipelines)
  "youbot", // You.com
  "amazonbot", // Amazon (Alexa/AI training)
  "meta-externalagent", // Meta AI crawler
  "facebookbot", // Meta AI training (distinct from externalhit)
  "cohere-ai", // Cohere
  "mistralai-user", // Mistral
  "timpibot", // Timpi search
  "omgili", // Webz.io / omgili (used in many LLM datasets)
  "ia_archiver", // Internet Archive (feeds some training sets)

  // --- SEO / auditing / monitoring tools worth rendering for (optional but common) ---
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "screaming frog",
];

// Keep the integration available for a later rollback, but never make an
// external prerender request unless it is explicitly enabled.
const PRERENDER_ENABLED = process.env.PRERENDER_ENABLED === "true";

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export default async function middleware(request) {
  if (!PRERENDER_ENABLED) {
    return;
  }

  const userAgent = request.headers.get("user-agent") || "";

  // Not a recognized crawler -> let the normal SPA serve as usual.
  if (!isBot(userAgent)) {
    return; // Returning undefined tells Vercel to continue as normal.
  }

  // Only proxy HTML document requests to Prerender. Skip image/JSON/XML/etc.
  // requests coming from bots — they should hit the origin as normal.
  const accept = request.headers.get("accept") || "";
  if (
    accept &&
    !accept.includes("text/html") &&
    !accept.includes("application/xhtml+xml") &&
    !accept.includes("*/*")
  ) {
    return;
  }

  const url = new URL(request.url);
  const prerenderToken = process.env.PRERENDER_TOKEN;

  if (!prerenderToken) {
    console.error(
      "PRERENDER_TOKEN environment variable is not set — skipping prerender.",
    );
    return;
  }

  // Abort the Prerender.io fetch after 5 seconds so this middleware can
  // NEVER exceed Vercel's edge-function invocation limit. Previously this
  // fetch had no timeout, so a slow/hung Prerender.io response made Vercel
  // kill the edge function and return `FUNCTION_INVOCATION_TIMEOUT` to the
  // crawler for every page request.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const prerenderUrl = `https://service.prerender.io/${url.toString()}`;

    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        "X-Prerender-Token": prerenderToken,
        "User-Agent": userAgent,
      },
      signal: controller.signal,
    });

    const body = await prerenderResponse.text();

    return new Response(body, {
      status: prerenderResponse.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Prerendered": "true",
        // Cache the prerendered HTML on Vercel's CDN for 1 hour so
        // repeated crawls never hit the edge function again.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const isAbort = err && err.name === "AbortError";
    console.error(
      isAbort
        ? "Prerender.io request timed out after 5s — skipping prerender."
        : "Prerender.io request failed:",
      err && err.message ? err.message : err,
    );
    // Fall through to normal SPA rendering rather than showing an error
    // to the crawler.
    return;
  } finally {
    clearTimeout(timer);
  }
}
