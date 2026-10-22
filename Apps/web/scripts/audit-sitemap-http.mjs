const siteOrigin = 'https://www.luxurypropertiesltd.com.ng';
const auditBaseUrl = new URL(process.env.AUDIT_BASE_URL || siteOrigin);
const sitemapUrl = process.env.SITEMAP_URL || new URL('/sitemap.xml', auditBaseUrl).href;
const concurrency = 8;

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decodeHtml(match?.[1] ?? match?.[2] ?? match?.[3] ?? '');
}

function getMeta(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => getAttribute(tag, 'name').toLowerCase() === name)
    .map((tag) => getAttribute(tag, 'content'));
}

function getCanonicalTags(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => getAttribute(tag, 'rel').toLowerCase() === 'canonical')
    .map((tag) => getAttribute(tag, 'href'));
}

function cleanText(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function collectSchema(value, errors, schemas = []) {
  if (!value || typeof value !== 'object') return schemas;
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchema(item, errors, schemas));
    return schemas;
  }

  const type = value['@type'];
  if (type) {
    const types = Array.isArray(type) ? type : [type];
    schemas.push(...types);
    if (types.includes('BlogPosting')) {
      for (const field of ['headline', 'description', 'image', 'datePublished', 'dateModified', 'author', 'publisher', 'mainEntityOfPage']) {
        if (!value[field]) errors.push(`BlogPosting is missing ${field}`);
      }
      if (!['Person', 'Organization'].includes(value.author?.['@type'])) {
        errors.push('BlogPosting author must be a Person or Organization');
      }
      if (!value.publisher?.logo) errors.push('BlogPosting publisher has no logo');
      if (value.inLanguage !== 'en-NG') errors.push('BlogPosting inLanguage must be en-NG');
      for (const field of ['datePublished', 'dateModified']) {
        if (value[field] && Number.isNaN(Date.parse(value[field]))) errors.push(`BlogPosting has invalid ${field}`);
      }
      if (/\[author name to be added\]/i.test(value.author?.name || '')) {
        errors.push('BlogPosting contains an author placeholder');
      }
    }
    if (types.includes('RealEstateListing')) {
      for (const field of ['name', 'description', 'image', 'address', 'offers', 'seller']) {
        if (!value[field]) errors.push(`RealEstateListing is missing ${field}`);
      }
      if (!value.address?.addressLocality) errors.push('RealEstateListing has no addressLocality');
      if (value.address?.addressRegion !== 'Lagos') errors.push('RealEstateListing addressRegion must be Lagos');
      if (value.address?.addressCountry !== 'NG') errors.push('RealEstateListing addressCountry must be NG');
      if (value.offers?.priceCurrency !== 'NGN') errors.push('RealEstateListing priceCurrency must be NGN');
      if (typeof value.offers?.price !== 'number' || !Number.isFinite(value.offers.price)) {
        errors.push('RealEstateListing price must be a finite number');
      }
      if (value.seller?.['@type'] !== 'RealEstateAgent') errors.push('RealEstateListing seller must be a RealEstateAgent');
      if (!/^https:\/\/schema\.org\/[A-Za-z]+$/.test(value.offers?.availability || '')) {
        errors.push('RealEstateListing availability must be a schema.org value');
      }
    }
  }

  Object.values(value).forEach((child) => collectSchema(child, errors, schemas));
  return schemas;
}

function inspectJsonLd(html, url) {
  const errors = [];
  const schemas = [];
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) errors.push('No JSON-LD blocks found');
  for (const [, json] of blocks) {
    try {
      const root = JSON.parse(json);
      if (!root?.['@context'] && !Array.isArray(root)) errors.push('JSON-LD block has no @context');
      collectSchema(root, errors, schemas);
    } catch (error) {
      errors.push(`Invalid JSON-LD: ${error.message}`);
    }
  }
  const pathname = new URL(url).pathname;
  if (/^\/blog\/[^/]+\/?$/.test(pathname) && !schemas.includes('BlogPosting')) {
    errors.push('Blog page is missing BlogPosting');
  }
  if (/^\/properties\/(?!page\/)[^/]+\/?$/.test(pathname) && !schemas.includes('RealEstateListing')) {
    errors.push('Listing page is missing RealEstateListing');
  }
  if (pathname === '/cookie-policy' && (!schemas.includes('WebPage') || schemas.includes('BlogPosting'))) {
    errors.push('Cookie policy must use WebPage schema, not BlogPosting');
  }
  return { valid: errors.length === 0, count: blocks.length, errors };
}

async function loadUrls() {
  const response = await fetch(sitemapUrl, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Sitemap request returned ${response.status}: ${sitemapUrl}`);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map(([, value]) => decodeHtml(value.trim()));
  if (!urls.length) throw new Error(`No URLs found in sitemap: ${sitemapUrl}`);
  if (new Set(urls).size !== urls.length) throw new Error(`Duplicate URLs found in sitemap: ${sitemapUrl}`);
  for (const url of urls) {
    const parsed = new URL(url);
    if (parsed.origin !== siteOrigin || parsed.search || parsed.hash) {
      throw new Error(`Non-canonical sitemap URL: ${url}`);
    }
  }
  return urls;
}

async function auditUrl(url) {
  try {
    const canonicalUrl = new URL(url);
    const targetUrl = new URL(`${canonicalUrl.pathname}${canonicalUrl.search}`, auditBaseUrl).href;
    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)]
      .map(([, title]) => cleanText(title));
    const descriptions = getMeta(html, 'description');
    const canonicals = getCanonicalTags(html);
    const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
    const title = titles[0] || '';
    const description = descriptions[0] || '';
    const jsonLd = inspectJsonLd(html, url);
    const checks = [
      response.status === 200,
      !response.redirected && response.url === targetUrl,
      titles.length === 1 && Boolean(title),
      !title.includes('...') && !title.includes('…'),
      canonicals.length === 1 && canonicals[0] === url,
      descriptions.length === 1 && description.length >= 70 && description.length <= 160,
      h1Count === 1,
      jsonLd.valid,
    ];
    const errors = [...jsonLd.errors];
    if (response.status !== 200) errors.push(`HTTP status ${response.status}`);
    if (response.redirected || response.url !== targetUrl) errors.push(`Unexpected redirect to ${response.url}`);
    if (titles.length !== 1 || !title) errors.push(`Expected one non-empty title; found ${titles.length}`);
    if (title.includes('...') || title.includes('…')) errors.push('Title contains an ellipsis');
    if (canonicals.length !== 1 || canonicals[0] !== url) errors.push(`Expected one self-canonical; found ${canonicals.length}`);
    if (descriptions.length !== 1 || description.length < 70 || description.length > 160) {
      errors.push(`Expected one 70-160 character meta description; found ${description.length}`);
    }
    if (h1Count !== 1) errors.push(`Expected one H1; found ${h1Count}`);
    return {
      url,
      status: response.status,
      canonical: canonicals.length === 1 && canonicals[0] === url ? 'self' : `${canonicals.length} / mismatch`,
      title,
      descriptionLength: description.length,
      h1Count,
      jsonLd: jsonLd.valid ? `valid (${jsonLd.count})` : `invalid (${jsonLd.count})`,
      checks,
      titleKey: title.toLocaleLowerCase(),
      descriptionKey: description.toLocaleLowerCase(),
      errors,
    };
  } catch (error) {
    return {
      url,
      status: 'ERR',
      canonical: 'ERR',
      title: '',
      descriptionLength: 0,
      h1Count: 0,
      jsonLd: 'ERR',
      checks: [false, false, false, false, false, false, false, false],
      titleKey: '',
      descriptionKey: '',
      errors: [error.message],
    };
  }
}

const urls = await loadUrls();
const rows = new Array(urls.length);
let cursor = 0;
await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
  while (cursor < urls.length) {
    const index = cursor++;
    rows[index] = await auditUrl(urls[index]);
  }
}));

for (const [field, label] of [['titleKey', 'duplicate title'], ['descriptionKey', 'duplicate description']]) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field];
    if (key) groups.set(key, [...(groups.get(key) || []), row]);
  }
  for (const [key, matches] of groups) {
    if (matches.length > 1) {
      for (const row of matches) {
        row.checks.push(false);
        row.errors.push(`${label}: ${matches.map((item) => item.url).join(', ')}`);
      }
    }
  }
}

const columns = ['Result', 'HTTP', 'Redirect', 'Canonical', 'Title', 'Description', 'H1', 'JSON-LD', 'URL'];
const data = rows.map((row) => [
  row.checks.every(Boolean) ? 'PASS' : 'FAIL',
  String(row.status),
  row.checks[1] ? 'no' : 'yes/unknown',
  row.canonical,
  row.title,
  String(row.descriptionLength),
  String(row.h1Count),
  row.jsonLd,
  row.url,
]);
const widths = columns.map((column, index) => Math.max(column.length, ...data.map((line) => line[index].length)));
const formatLine = (line) => line.map((value, index) => value.padEnd(widths[index])).join(' | ');
console.log(formatLine(columns));
console.log(widths.map((width) => '-'.repeat(width)).join('-|-'));
for (const row of data) console.log(formatLine(row));

const failures = rows.filter((row) => !row.checks.every(Boolean));
for (const row of failures) {
  for (const error of row.errors) console.error(`[FAIL] ${row.url}: ${error}`);
}
console.log(`\n[sitemap-http-audit] ${rows.length - failures.length}/${rows.length} URLs passed without JavaScript.`);
if (failures.length) process.exitCode = 1;
