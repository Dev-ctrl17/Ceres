// Security utilities: CSP, XSS protection, input sanitization

// Content Security Policy configuration
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React/Vite development
    "'unsafe-eval'", // Required for some dev tools
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://elfsightcdn.com",
    "https://i.ibb.co",
    "https://lrmljudwbzjawafuztwp.supabase.co",
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "https://www.image2url.com",
    "https://images.unsplash.com",
    "https://i.ibb.co",
    "https://lrmljudwbzjawafuztwp.supabase.co",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  'connect-src': [
    "'self'",
    "https://lrmljudwbzjawafuztwp.supabase.co",
    "https://www.google-analytics.com",
    "https://vitals.vercel-insights.com",
  ],
  'frame-src': [
    "'self'",
    "https://www.google.com",
    "https://www.youtube.com",
    "https://player.vimeo.com",
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Generate CSP header value
export const generateCSP = (directives = cspDirectives) => {
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
};

// XSS Protection utilities
export const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return '';
  
  const map = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, char => map[char]);
};

// Sanitize object for safe rendering
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeHtml(String(obj));
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeHtml(key)] = sanitizeObject(value);
  }
  
  return sanitized;
};

// Validate and sanitize URL
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  // Only allow http, https, and relative URLs
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || 
      trimmed.startsWith('http://') || 
      trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  return '';
};

// Input validation helpers
export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  phone: (phone) => {
    // Nigerian phone numbers: +234XXXXXXXXXX or 0XXXXXXXXXX
    const re = /^(\+234|0)[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ''));
  },
  
  name: (name) => {
    // Allow letters, spaces, hyphens, apostrophes (2-100 chars)
    const re = /^[a-zA-Z\s\-']{2,100}$/;
    return re.test(name);
  },
  
  message: (message) => {
    // 10-5000 characters
    return typeof message === 'string' && message.length >= 10 && message.length <= 5000;
  },
  
  price: (price) => {
    const num = Number(price);
    return !isNaN(num) && num > 0 && num <= 100000000000; // Max 100 billion Naira
  },
  
  bedrooms: (num) => {
    const n = Number(num);
    return Number.isInteger(n) && n >= 0 && n <= 50;
  },
  
  bathrooms: (num) => {
    const n = Number(num);
    return Number.isInteger(n) && n >= 0 && n <= 50;
  },
  
  area: (area) => {
    const num = Number(area);
    return !isNaN(num) && num > 0 && num <= 100000; // Max 100,000 sqm
  },
};

// Sanitize form data
export const sanitizeFormData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value.trim());
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeHtml(item.trim()) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Prevent clickjacking
export const xFrameOptions = {
  SAMEORIGIN: 'SAMEORIGIN',
  DENY: 'DENY',
};

// X-XSS-Protection header (legacy browsers)
export const xssProtectionHeader = '1; mode=block';

// Referrer policy
export const referrerPolicy = {
  STRICT_ORIGIN_WHEN_CROSS_ORIGIN: 'strict-origin-when-cross-origin',
  NO_REFERRER: 'no-referrer',
  ORIGIN: 'origin',
};

// Permissions policy (formerly Feature-Policy)
export const permissionsPolicy = {
  geolocation: "'self'",
  microphone: "'none'",
  camera: "'self'",
  payment: "'self'",
  usb: "'none'",
};