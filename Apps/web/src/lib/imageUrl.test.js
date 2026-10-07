import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toCdnUrl } from './imageUrl.js';
import { resolveMediaUrl, rewriteMediaContent } from './mediaUrls.js';

const oldStorageUrl = (path) =>
  `https://project.${'supabase.co'}${'/storage/v1/object/public/'}${path}`;

test('resolves a migrated Supabase object through the Cloudinary migration map', () => {
  const resolved = resolveMediaUrl(
    oldStorageUrl('property-images/properties/1782078361400.jpg'),
  );
  assert.match(resolved, /^https:\/\/res\.cloudinary\.com\//);
});

test('does not return an unmapped Supabase object URL', () => {
  assert.equal(
    resolveMediaUrl(oldStorageUrl('property-images/properties/not-migrated.jpg')),
    null,
  );
  assert.equal(
    toCdnUrl(oldStorageUrl('property-images/properties/not-migrated.jpg')),
    null,
  );
});

test('rewrites mapped embedded URLs and removes unmapped storage references', () => {
  const mapped = oldStorageUrl('property-images/properties/1782078361400.jpg');
  const missing = oldStorageUrl('property-images/properties/not-migrated.jpg');
  const result = rewriteMediaContent(`<p>${mapped}</p><img src="${missing}">`);
  assert.match(result, /res\.cloudinary\.com/);
  assert.doesNotMatch(result, /supabase\.co/);
  assert.doesNotMatch(result, /<img/i);
});

test('preserves local and unrelated external URLs', () => {
  assert.equal(toCdnUrl('/og-image.png'), '/og-image.png');
  assert.equal(toCdnUrl('https://example.com/home.webp'), 'https://example.com/home.webp');
  assert.equal(toCdnUrl(''), null);
  assert.equal(toCdnUrl(42), null);
});
