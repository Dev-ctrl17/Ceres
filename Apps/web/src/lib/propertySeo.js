import { company } from '../config/company.js';

const trailingLocationSegments = new Set(['lagos', 'lagos state', 'abuja', 'fct', 'nigeria']);
const genericAreaPattern = /^(?:estate|phase\s*\d+|road)$/i;

function normalizeSegment(value) {
  const segment = String(value || '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return segment.toLocaleLowerCase().replace(/\b[\p{L}\p{N}]/gu, (letter) => letter.toLocaleUpperCase());
}

function extractFromString(value) {
  const segments = String(value || '').split(',').map((segment) => segment.trim()).filter(Boolean);
  while (segments.length && trailingLocationSegments.has(segments.at(-1).toLowerCase().replace(/\.$/, ''))) {
    segments.pop();
  }
  if (segments.length === 0) return '';

  let area = segments.at(-1);
  if ((area.length < 4 || genericAreaPattern.test(area)) && segments.length > 1) {
    area = `${segments.at(-2)}, ${area}`;
  }
  return normalizeSegment(area);
}

export function getPropertyArea(addressOrLocation, fallback = '') {
  return extractFromString(addressOrLocation) || extractFromString(fallback);
}

export function getPropertyListingName(property) {
  return String(property?.title || '').trim().replace(/EXQUIISITE/gi, 'EXQUISITE');
}

export function getPropertyTypeLabel(property) {
  const type = String(property?.property_type || '').toLowerCase();
  const title = getPropertyListingName(property).toLowerCase();
  const value = `${type} ${title}`;
  if (/terrace/.test(value)) return 'Luxury Terrace';
  if (/apartment|\bflat\b/.test(value)) return 'Luxury Apartment';
  return 'Luxury Home';
}

function getBedroomCount(property) {
  const count = Number(property?.bedrooms);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function getHeadingQualifier(property) {
  const title = getPropertyListingName(property);
  const bq = title.match(/(\d+)\s*[- ]?BEDROOM\s+BQ/i)?.[1];
  const kitchens = title.match(/(\d+)\s*KITCHENS?/i)?.[1];
  const qualifiers = [];
  if (/\bSEMI[- ]?DETACHED\b/i.test(title)) qualifiers.push('Semi-Detached');
  if (kitchens) qualifiers.push(`${kitchens} Kitchens`);
  if (bq) qualifiers.push(`${bq}-Bedroom BQ`);
  if (qualifiers.length) return qualifiers.join(', ');
  if (/\bSMART\b/i.test(title)) return 'Smart Residence';
  if (/\bEXCLUSIVE\b/i.test(title)) return 'Exclusive Duplex';
  if (/\bCONTEMPORARY\b/i.test(title)) return 'Contemporary Residence';
  if (/\bLUXURY\b/i.test(title) && /\bDUPLEX\b/i.test(title)) return 'Signature Duplex';
  return '';
}

export function buildPropertySeo(property) {
  const area = getPropertyArea(property?.address || property?.location, property?.city || property?.location);
  const typeLabel = getPropertyTypeLabel(property);
  const bedroomCount = getBedroomCount(property);
  const bedroomPrefix = bedroomCount ? `${bedroomCount}-Bedroom ` : '';
  const qualifier = getHeadingQualifier(property);
  const baseHeading = `${bedroomPrefix}${typeLabel}${area ? ` in ${area}` : ''}`;
  const heading = `${baseHeading}${qualifier ? ` - ${qualifier}` : ''}`;
  const listingName = getPropertyListingName(property) || heading;
  const title = `${listingName} | ${company.name}`;
  const region = String(property?.city || property?.state || '').trim();
  const propertyLocation = [area, region]
    .filter((value, index, values) => value && !values.slice(0, index).some((existing) => (
      existing.toLowerCase().includes(value.toLowerCase()) || value.toLowerCase().includes(existing.toLowerCase())
    )))
    .join(', ');
  const descriptionBase = `Explore ${listingName}${propertyLocation ? ` in ${propertyLocation}` : ''}. Contact ${company.name} to arrange an inspection.`;
  const description = descriptionBase.length <= 155
    ? descriptionBase
    : `${descriptionBase.slice(0, 152).trimEnd()}...`;

  return { area, typeLabel, heading, title, description, listingName };
}
