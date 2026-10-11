export const company = {
  name: 'Luxury Properties Ltd',
  url: 'https://www.luxurypropertiesltd.com.ng',
  phoneNumbers: ['09056201176', '07069286610'],
  // TODO: Confirm that info@luxurypropertiesltd.com is the correct company email.
  email: 'info@luxurypropertiesltd.com',
  address: {
    streetAddress: 'Pedro, Gbagada',
    addressLocality: 'Lagos',
    addressRegion: 'Lagos',
    addressCountry: 'NG',
    display: 'Pedro, Gbagada, Lagos, Nigeria',
  },
  socialLinks: [
    { platform: 'Instagram', url: 'https://www.instagram.com/luxurypropertiesltd' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/company/luxurypropertiesltd' },
    { platform: 'Facebook', url: 'https://www.facebook.com/luxurypropertiesltd' },
  ],
};

export function getInternationalPhoneNumber(phoneNumber) {
  const digits = String(phoneNumber || '').replace(/\D/g, '');
  return digits.startsWith('0') ? `+234${digits.slice(1)}` : `+${digits}`;
}

export function getWhatsAppUrl(phoneNumber) {
  return `https://wa.me/${getInternationalPhoneNumber(phoneNumber).replace(/\D/g, '')}`;
}
