import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NEW_IMAGE_BASE_URL, OLD_IMAGE_BASE_URL, toCdnUrl } from './imageUrl.js';

test('replaces the legacy property image base URL', () => {
  assert.equal(
    toCdnUrl(`${OLD_IMAGE_BASE_URL}properties/home.webp`),
    `${NEW_IMAGE_BASE_URL}properties/home.webp`,
  );
});

test('leaves empty, non-string, and unrelated URLs unchanged', () => {
  assert.equal(toCdnUrl(''), '');
  assert.equal(toCdnUrl(null), null);
  assert.equal(toCdnUrl(42), 42);
  assert.equal(toCdnUrl('https://example.com/home.webp'), 'https://example.com/home.webp');
});
