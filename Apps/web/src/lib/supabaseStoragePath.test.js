import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeSupabaseStoragePath } from './supabaseStoragePath.js';

test('decodes encoded spaces before the storage SDK builds a URL', () => {
  const url = `https://project.${'supabase.co'}${'/storage/v1/object/public/'}property-images/properties/WhatsApp%20Image%202026.jpeg`;
  assert.equal(normalizeSupabaseStoragePath(url), 'properties/WhatsApp Image 2026.jpeg');
});

test('decodes encoded path strings and preserves malformed escapes', () => {
  assert.equal(normalizeSupabaseStoragePath('properties/with%20spaces/photo.jpg'), 'properties/with spaces/photo.jpg');
  assert.equal(normalizeSupabaseStoragePath('properties/bad%ZZname.jpg'), 'properties/bad%ZZname.jpg');
});

test('leaves non-storage external URLs unchanged', () => {
  const url = 'https://images.example.com/property%20photo.jpg';
  assert.equal(normalizeSupabaseStoragePath(url), url);
});