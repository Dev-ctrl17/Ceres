import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSeoDescription, buildSeoTitle } from './siteConfig.js';

test('decodes apostrophes and HTML entities before formatting a title', () => {
  const title = buildSeoTitle('Governor&#39;s Consent &amp; Ikoyi (2026)');
  assert.match(title, /Governor's Consent & Ikoyi \(2026\)/);
  assert.doesNotMatch(title, /&amp;|&#39;/);
});

test('truncates long titles at a word boundary before adding the brand suffix', () => {
  const title = buildSeoTitle('Luxury Governor’s Consent and Property Investment Opportunities Across Lagos (2026)');
  assert.ok(title.length <= 60);
  assert.ok(title.endsWith(' | Luxury Properties Ltd'));
  assert.ok(!title.endsWith('...'));
  const titleText = title.slice(0, -' | Luxury Properties Ltd'.length);
  const source = 'Luxury Governor’s Consent and Property Investment Opportunities Across Lagos (2026)';
  assert.ok(source.startsWith(titleText));
  assert.ok(source[titleText.length] === ' ' || titleText === source);
});

test('does not leave a dangling ampersand when truncating a title', () => {
  const title = buildSeoTitle('Ikoyi Real Estate Guide: Prices & Investment');
  assert.ok(!title.includes('& |'));
  assert.ok(!title.endsWith('...'));
});

test('decodes and word-truncates long descriptions without a trailing ellipsis', () => {
  const description = buildSeoDescription(`Governor&#39;s Consent &amp; Lagos ${'property due diligence '.repeat(20)}`);
  assert.ok(description.length <= 155);
  assert.match(description, /^Governor's Consent & Lagos /);
  assert.ok(!description.endsWith('...'));
  assert.doesNotMatch(description, /&amp;|&#39;/);
});
