import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isSupportedPropertyImage, preparePropertyImage } from './propertyImageProcessing.js';

for (const [name, type] of [
  ['front.jpg', 'image/jpeg'],
  ['front.png', 'image/png'],
  ['front.webp', 'image/webp'],
]) {
  test(`accepts ${name}`, () => assert.equal(isSupportedPropertyImage({ name, type }), true));
}

for (const [name, type] of [
  ['animated.gif', 'image/gif'],
  ['scan.tiff', 'image/tiff'],
]) {
  test(`rejects ${name}`, () => assert.equal(isSupportedPropertyImage({ name, type }), false));
}

test('accepts HEIC for server-side format conversion', () => {
  assert.equal(isSupportedPropertyImage({ name: 'image.heic', type: 'image/heic' }), true);
});

test('does not attempt to convert an unsupported format', async () => {
  await assert.rejects(
    preparePropertyImage({ name: 'animated.gif', type: 'image/gif' }),
    /JPG, PNG, WebP, or HEIC/,
  );
});
