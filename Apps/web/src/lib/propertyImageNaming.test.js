import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugifyFilename } from './propertyImageNaming.js';

test('slugifies a filename and keeps its extension with a unique prefix', () => {
  assert.equal(
    slugifyFilename(
      '1787427017629_WhatsApp Image 2026-08-21 at 3.01.41 PM.jpeg',
      'a12b34cd-1234-5678-abcd-1234567890ef',
    ),
    'a12b34cd-1234-5678-abcd-1234567890ef-1787427017629-whatsapp-image-2026-08-21-at-3-01-41-pm.jpeg',
  );
});

test('uses a safe fallback for empty or non-ASCII filenames', () => {
  assert.equal(slugifyFilename('東京.jpg', 'upload-id'), 'upload-id-upload.jpg');
});

test('generates distinct prefixes when the caller does not provide one', () => {
  assert.notEqual(slugifyFilename('photo.jpeg'), slugifyFilename('photo.jpeg'));
});
