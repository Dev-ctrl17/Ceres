// Rate limiting middleware for Vercel Edge Functions
// Prevents abuse of auth, search, and form endpoints

const rateLimitMap = new Map();

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // max requests per window
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  return (req) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this IP + endpoint
    const requests = rateLimitMap.get(key) || [];
    
    // Filter out requests outside the current window
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= max) {
      return new Response(JSON.stringify({ 
        error: message,
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(windowMs / 1000)),
        },
      });
    }
    
    // Add current request
    validRequests.push(now);
    rateLimitMap.set(key, validRequests);
    
    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, times] of rateLimitMap.entries()) {
        const recent = times.filter(t => t > windowStart);
        if (recent.length === 0) {
          rateLimitMap.delete(k);
        } else {
          rateLimitMap.set(k, recent);
        }
      }
    }
    
    return null; // No error, continue
  };
};

// Preset configurations for different endpoint types
export const rateLimitPresets = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  
  // Moderate limits for form submissions
  forms: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions
    message: 'Too many form submissions. Please try again in 1 hour.',
  },
  
  // Generous limits for search/API endpoints
  search: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests
    message: 'Too many search requests. Please try again later.',
  },
  
  // Very strict for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts
    message: 'Too many password reset attempts. Please try again in 1 hour.',
  },
};