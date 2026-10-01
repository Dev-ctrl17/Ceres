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

function getTransactionLabel(property) {
  const detail = `${property?.purpose || ''} ${property?.property_type || ''} ${getPropertyListingName(property)}`.toLowerCase();
  if (/short\s*-?let/.test(detail)) return 'short-let';
  if (/\brent\b|\brented\b|\brental\b/.test(detail)) return 'rent';
  return 'sale';
}

function formatPrice(price) {
  const amount = Number(String(price ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return '';
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function buildPropertySeo(property) {
  const area = getPropertyArea(property?.address || property?.location, property?.city || property?.location);
  const typeLabel = getPropertyTypeLabel(property);
  const bedroomCount = getBedroomCount(property);
  const bedroomPrefix = bedroomCount ? `${bedroomCount}-Bedroom ` : '';
  const qualifier = getHeadingQualifier(property);
  const baseHeading = `${bedroomPrefix}${typeLabel}${area ? ` in ${area}` : ''}`;
  const heading = `${baseHeading}${qualifier ? ` - ${qualifier}` : ''}`;
  const brandedTitle = `${heading} | Luxury Properties Ltd`;
  let title = brandedTitle.length <= 60 ? brandedTitle : heading;
  if (title.length > 60) {
    const shortQualifier = getHeadingQualifier(property)
      .split(', ')
      .sort((left, right) => left.length - right.length)[0];
    const compactTitle = shortQualifier ? `${baseHeading} - ${shortQualifier}` : baseHeading;
    title = compactTitle.length <= 60 ? compactTitle : `${compactTitle.slice(0, 57).trimEnd()}...`;
  }
  const transaction = getTransactionLabel(property);
  const price = formatPrice(property?.price);
  const description = `${bedroomCount ? `${bedroomCount}-bedroom ` : ''}${typeLabel.toLowerCase()} for ${transaction}${area ? ` in ${area}` : ''}, Lagos.${price ? ` ${price}.` : ''} Verified listing with Luxury Properties Ltd.`;

  return { area, typeLabel, heading, title, description, listingName: getPropertyListingName(property) };
}
