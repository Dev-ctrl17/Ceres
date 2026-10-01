import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const failures = [];
let pageCount = 0;
let blockCount = 0;

function getHtmlFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory()
      ? getHtmlFiles(path)
      : path.endsWith('.html') ? [path] : [];
  });
}

function visit(value, file, context = '') {
  if (value === null || value === undefined) {
    failures.push(`${file}: null JSON-LD value at ${context || '(root)'}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, file, `${context}[${index}]`));
    return;
  }
  if (typeof value === 'object') {
    const type = value['@type'];
    const label = `${file}${type ? ` (${type})` : ''}`;
    for (const [key, child] of Object.entries(value)) {
      if (child === null || child === undefined || child === '') {
        failures.push(`${label}: empty ${key} at ${context || '(root)'}`);
        continue;
      }
      if (['url', 'image', 'logo', 'sameAs', 'mainEntityOfPage'].includes(key)) {
        const values = Array.isArray(child) ? child : [child];
        for (const item of values) {
          const url = typeof item === 'string' ? item : item?.url || item?.['@id'];
          if (url && typeof url === 'string' && !/^https:\/\//i.test(url)) {
            failures.push(`${label}: non-absolute ${key} URL ${url}`);
          }
        }
      }
      if (key === 'price' && (typeof child !== 'number' || !Number.isFinite(child))) {
        failures.push(`${label}: Offer.price must be a finite number`);
      }
      if ((key === 'datePublished' || key === 'dateModified') && Number.isNaN(Date.parse(child))) {
        failures.push(`${label}: invalid ${key} ${child}`);
      }
      visit(child, file, context ? `${context}.${key}` : key);
    }

    if (['Article', 'BlogPosting', 'NewsArticle'].includes(type)) {
      for (const required of ['headline', 'image', 'datePublished', 'author', 'publisher']) {
        if (value[required] === undefined || value[required] === '') {
          failures.push(`${label}: missing ${required}`);
        }
      }
    }
    if (type === 'Offer' && (!value.priceCurrency || value.priceCurrency !== 'NGN')) {
      failures.push(`${label}: Offer.priceCurrency must be NGN`);
    }
    if (['Residence', 'House', 'Apartment', 'RealEstateListing'].includes(type) && !value.name) {
      failures.push(`${label}: missing name`);
    }
    return;
  }
}

for (const path of getHtmlFiles(distDir)) {
  const file = relative(distDir, path).replaceAll('\\', '/');
  const html = readFileSync(path, 'utf8');
  if (!/<h1\b/i.test(html)) continue;
  pageCount++;
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    blockCount++;
    try {
      visit(JSON.parse(match[1]), file);
    } catch (error) {
      failures.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

if (failures.length) {
  console.error(`[validate-structured-data] ${failures.length} issue(s) across ${blockCount} JSON-LD blocks on ${pageCount} pages:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`[validate-structured-data] Passed: ${blockCount} JSON-LD blocks on ${pageCount} prerendered pages.`);
