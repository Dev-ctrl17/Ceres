import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPropertySeo, getPropertyArea } from './propertySeo.js';
import { getCurrentPropertySlug } from './slug.js';

const locationCases = [
  ['Banana Island, Ikoyi, Lagos', 'Ikoyi'],
  ['Parkview Estate, Ikoyi', 'Ikoyi'],
  ['Orchid Road, by Orchid Hotel, Lekki-Ajah', 'Lekki-Ajah'],
  ['Ofunwa Vision 8 by Van Daniel Estate, Orchid Road', 'Orchid Road'],
  ['Gbagada Phase 1, Lagos', 'Gbagada Phase 1'],
];

for (const [input, expected] of locationCases) {
  test(`extracts ${expected} from ${input}`, () => {
    assert.equal(getPropertyArea(input), expected);
  });
}

test('uses the city fallback when the address contains only trailing locations', () => {
  assert.equal(getPropertyArea('Lagos, Nigeria', 'Ikoyi'), 'Ikoyi');
});

test('builds a self-consistent heading, title, transaction description and type label', () => {
  const seo = buildPropertySeo({
    title: '5 BEDROOM FULLY DETACHED DUPLEX (2 KITCHENS - WET & DRY) + 2 BEDROOM BQ',
    address: 'Parkview Estate, Ikoyi',
    property_type: 'Detached',
    bedrooms: 5,
    purpose: 'Buy',
    price: 2000000000,
  });

  assert.equal(seo.heading, '5-Bedroom Luxury Home in Ikoyi - 2 Kitchens, 2-Bedroom BQ');
  assert.equal(seo.title, seo.heading);
  assert.match(seo.description, /5-bedroom luxury home for sale in Ikoyi, Lagos\./);
  assert.match(seo.description, /₦2,000,000,000/);
});

test('uses the brand suffix when it fits and falls back to the heading when it does not', () => {
  const short = buildPropertySeo({ title: 'Home', location: 'Ikoyi', property_type: 'Detached' });
  assert.equal(short.title, `${short.heading} | Luxury Properties Ltd`);

  const long = buildPropertySeo({
    title: 'Detached home',
    address: 'A Very Long Enclave, Lagos',
    property_type: 'Detached',
    bedrooms: 5,
  });
  assert.equal(long.title, long.heading);
  assert.ok(long.title.length <= 60);
});

test('distinguishes the current Ikoyi heading collision groups', () => {
  const listings = [
    { title: 'EXQUIISITE 5-BEDROOM FULLY DETACHED SMART LUXURY RESIDENCE', address: 'Parkview Estate, Ikoyi', property_type: 'Detached', bedrooms: 5 },
    { title: '5 BEDROOM FULLY DETACHED DUPLEX (2 KITCHENS - WET & DRY) + 2 BEDROOM BQ', address: 'Parkview Estate, Ikoyi', property_type: 'Detached', bedrooms: 5 },
    { title: 'LUXURY 5-BEDROOM FULLY DETACHED DUPLEX', address: 'PARKVIEW, IKOYI', property_type: 'Detached', bedrooms: 5 },
    { title: 'EXCLUSIVE 5-BEDROOM FULLY DETACHED LUXURY DUPLEX', address: 'Banana Island, Ikoyi, Lagos', property_type: 'Detached', bedrooms: 5 },
    { title: '4 BEDROOM FULLY DETACHED DUPLEX + 1 BEDROOM BQ', address: 'Parkview Estate, Ikoyi', property_type: 'Detached', bedrooms: 4 },
    { title: '4 BEDROOM FULLY DETACHED DUPLEX + 2 BEDROOM BQ', address: 'Parkview Estate, Ikoyi', property_type: 'Detached', bedrooms: 4 },
    { title: '4 BEDROOM SEMI DETACHED DUPLEX (2 KITCHENS + 2 BEDROOM BQ)', address: 'Parkview Estate, Ikoyi', property_type: 'Semi-Detached', bedrooms: 4 },
  ];
  const generated = listings.map(buildPropertySeo);
  assert.equal(new Set(generated.map((seo) => seo.heading)).size, listings.length);
  assert.equal(new Set(generated.map((seo) => seo.title)).size, listings.length);
  assert.ok(generated.every((seo) => seo.title.length <= 60));
});

test('normalizes the misspelled EXQUIISITE slug for internal links', () => {
  assert.equal(
    getCurrentPropertySlug('exquiisite-5-bedroom-fully-detached-smart-luxury-residence'),
    'exquisite-5-bedroom-fully-detached-smart-luxury-residence',
  );
});
