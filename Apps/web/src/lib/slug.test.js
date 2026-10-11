import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPropertyRouteSegment, isUsablePropertySlug } from './slug.js';

test('rejects empty and null-like property slugs', () => {
  for (const slug of [null, undefined, '', '   ', 'null', 'undefined', 'NULL']) {
    assert.equal(isUsablePropertySlug(slug), false);
  }
});

test('only creates a property link when a usable slug exists', () => {
  assert.equal(getPropertyRouteSegment({ slug: 'lekki-home', id: 'property-123' }), 'lekki-home');
  assert.equal(getPropertyRouteSegment({ slug: 'null', id: 'property-123' }), null);
  assert.equal(getPropertyRouteSegment({ slug: undefined, id: 'property-123' }), null);
});
