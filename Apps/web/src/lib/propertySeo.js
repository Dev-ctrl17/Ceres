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

function getTitleQualifier(property) {
  const title = getPropertyListingName(property);
  const bq = title.match(/(\d+)\s*[- ]?BEDROOM\s+BQ/i)?.[1];
  const kitchens = title.match(/(\d+)\s*KITCHENS?/i)?.[1];
  if (kitchens) return `${kitchens}K`;
  if (bq) return `${bq}BQ`;
  if (/SWIMMING\s+POOL|\bPOOL\b/i.test(title)) return 'Pool';
  if (/\bSEMI[- ]?DETACHED\b/i.test(title)) return 'Semi';
  if (/\bSMART\b/i.test(title)) return 'Smt';
  if (/\bEXCLUSIVE\b/i.test(title)) return 'Excl';
  if (/\bDUPLEX\b/i.test(title)) return 'Dupl';
  return '';
}

function truncateAtWord(value, maxLength, addEllipsis = true) {
  const cleanValue = addEllipsis
    ? value
    : value.replace(/\.{3,}|…/gu, ' ').replace(/\s+/g, ' ').trim();
  if (cleanValue.length <= maxLength) return cleanValue;
  const suffix = addEllipsis ? '...' : '';
  const limit = Math.max(1, maxLength - suffix.length);
  const prefix = cleanValue.slice(0, limit);
  const boundary = prefix.lastIndexOf(' ');
  return `${prefix.slice(0, boundary > 0 ? boundary : limit).trimEnd()}${suffix}`;
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
  const titleSuffix = ` | ${company.name}`;
  const titleQualifier = getTitleQualifier(property);
  const titleBudget = 60 - titleSuffix.length;
  const titleStart = `${bedroomPrefix}${typeLabel} in `;
  const shortArea = area.toLowerCase() === 'victoria island'
    ? 'VI'
    : area.toLowerCase() === 'banana island'
      ? 'Banana Is.'
      : area;
  const titleEnd = titleQualifier && titleStart.length + shortArea.length + ` +${titleQualifier}`.length <= titleBudget
    ? ` +${titleQualifier}`
    : '';
  const titleArea = truncateAtWord(shortArea || 'Lagos', titleBudget - titleStart.length - titleEnd.length, false);
  const title = `${titleStart}${titleArea}${titleEnd}${titleSuffix}`;
  const price = Number(String(property?.price || '').replace(/[^\d.]/g, ''));
  const rawFeatures = Array.isArray(property?.amenities)
    ? property.amenities
    : typeof property?.amenities === 'string'
      ? property.amenities.split(',')
      : [];
  const descriptionFeatures = String(property?.description || '')
    .split(/\r?\n/)
    .map((line) => line.trim()
      .replace(/^(?:✨|⭐|•|-|–|features?\s*:|amenities\s*:)\s*/i, '')
      .split(/[.!?]/, 1)[0]
      .trim())
    .filter((line) => line && line.length > 3)
    .filter((line) => line !== property?.title);
  const features = [...new Set([
    ...rawFeatures.map((feature) => String(feature).trim()),
    ...descriptionFeatures,
  ].filter(Boolean))].slice(0, 2);
  const concisePrice = Number.isFinite(price) && price > 0
    ? `Price: ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price)}.`
    : 'Price on request.';
  const descriptionLocation = truncateAtWord(area || 'Lagos', 35);
  const descriptionPrefix = `${bedroomPrefix.toLowerCase()}${typeLabel.toLowerCase()} in ${descriptionLocation}, Lagos. ${concisePrice}`;
  const shortContact = ` Contact ${company.name} for private viewings.`;
  const featurePrefix = ' Key features: ';
  const featureBudget = 160 - descriptionPrefix.length - shortContact.length - featurePrefix.length - 1;
  const featureValue = features.length
    ? truncateAtWord(features.join(', '), featureBudget)
    : '';
  const featureSentence = features.length
    ? `${featurePrefix}${featureValue}${featureValue.endsWith('...') ? '' : '.'}`
    : ' Key features are available on request.';
  let description = `${descriptionPrefix}${featureSentence}${shortContact}`;
  if (description.length < 140) {
    description = `${descriptionPrefix}${featureSentence} Contact ${company.name} to confirm availability and book a private viewing.`;
  }
  if (description.length > 160) {
    description = truncateAtWord(description, 160);
  }

  return { area, typeLabel, heading, title, description, listingName };
}
