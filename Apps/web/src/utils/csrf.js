// CSRF Protection utilities for forms and API calls

// Generate CSRF token
export const generateCsrfToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Store CSRF token in session storage
export const setCsrfToken = () => {
  const token = generateCsrfToken();
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
};

// Get CSRF token from session storage
export const getCsrfToken = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
};

// CSRF token middleware for API calls
export const csrfHeaders = () => {
  const token = getCsrfToken();
  return {
    'X-CSRF-Token': token || '',
  };
};

// React hook for CSRF protection
export const useCsrf = () => {
  const getToken = () => getCsrfToken();
  
  const getHeaders = () => {
    const token = getCsrfToken();
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token || '',
    };
  };

  return {
    getToken,
    getHeaders,
    setCsrfToken,
  };
};