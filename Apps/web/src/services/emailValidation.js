/**
 * Email Validation Service
 *
 * Provides a reusable interface for validating email addresses
 * via the Supabase Edge Function that wraps Mailboxlayer API.
 *
 * Features:
 * - Async email validation with loading states
 * - Caching of validation results
 * - Graceful error handling when service is unavailable
 * - Sanitized inputs
 */

import supabase from "@/lib/supabaseClient";

// Cache for validation results to avoid duplicate API calls
const validationCache = new Map();
const CACHE_TTL = 300_000; // 5 minutes

/**
 * Normalize an email address for caching purposes
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * Get a cached validation result if available and not expired
 * @param {string} email - Normalized email address
 * @returns {object|null} - Cached result or null
 */
function getCachedValidation(email) {
  const normalized = normalizeEmail(email);
  const entry = validationCache.get(normalized);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.result;
  }
  validationCache.delete(normalized);
  return null;
}

/**
 * Store a validation result in the cache
 * @param {string} email - Normalized email address
 * @param {object} result - Validation result object
 */
function setCachedValidation(email, result) {
  const normalized = normalizeEmail(email);
  validationCache.set(normalized, {
    result,
    expiresAt: Date.now() + CACHE_TTL,
  });

  // Clean up old entries if cache exceeds 500 items
  if (validationCache.size > 500) {
    const now = Date.now();
    for (const [key, value] of validationCache.entries()) {
      if (now > value.expiresAt) {
        validationCache.delete(key);
      }
    }
  }
}

/**
 * Validate an email address via the Supabase Edge Function
 *
 * @param {string} email - The email address to validate
 * @returns {Promise<{valid: boolean, error?: string, details?: object}>}
 */
export async function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return {
      valid: false,
      error: "Please enter a valid email address.",
    };
  }

  const trimmedEmail = email.trim();

  // Basic client-side format validation first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      valid: false,
      error: "Please enter a valid email address.",
    };
  }

  // Check cache first
  const cached = getCachedValidation(trimmedEmail);
  if (cached) {
    return cached;
  }

  try {
    const { data, error } = await supabase.functions.invoke("verify-email", {
      body: { email: trimmedEmail },
    });

    if (error) {
      console.error("Email verification function error:", error);

      // If the service is unavailable, allow the email through
      const fallbackResult = {
        valid: true,
        serviceUnavailable: true,
        error: "Email verification is temporarily unavailable. Please try again in a few moments.",
      };
      setCachedValidation(trimmedEmail, fallbackResult);
      return fallbackResult;
    }

    // Handle service unavailable response
    if (data.service_unavailable) {
      const fallbackResult = {
        valid: true,
        serviceUnavailable: true,
        error: data.error || "Email verification is temporarily unavailable. Please try again in a few moments.",
      };
      setCachedValidation(trimmedEmail, fallbackResult);
      return fallbackResult;
    }

    // Build the result
    const result = {
      valid: data.valid,
      error: data.error || null,
      details: {
        formatValid: data.format_valid,
        mxFound: data.mx_found,
        smtpCheck: data.smtp_check,
        disposable: data.disposable,
        role: data.role,
        free: data.free,
        catchAll: data.catch_all,
        score: data.score,
      },
    };

    // Cache the result
    setCachedValidation(trimmedEmail, result);

    return result;
  } catch (err) {
    console.error("Email validation request failed:", err);

    // If the request fails entirely, allow the email through
    return {
      valid: true,
      serviceUnavailable: true,
      error: "Email verification is temporarily unavailable. Please try again in a few moments.",
    };
  }
}

/**
 * Check if an email is a role-based email (admin@, info@, etc.)
 * @param {string} email
 * @returns {boolean}
 */
export function isRoleEmail(email) {
  if (!email) return false;
  const localPart = email.split("@")[0]?.toLowerCase();
  const rolePrefixes = [
    "admin",
    "info",
    "support",
    "sales",
    "contact",
    "help",
    "enquiries",
    "enquiry",
    "inquiries",
    "inquiry",
    "webmaster",
    "postmaster",
    "hostmaster",
    "noreply",
    "no-reply",
    "mailer-daemon",
    "mailer",
  ];
  return rolePrefixes.includes(localPart);
}

/**
 * Get a user-friendly error message from a validation result
 * @param {object} validationResult
 * @returns {string}
 */
export function getValidationErrorMessage(validationResult) {
  if (!validationResult) return "";

  if (validationResult.serviceUnavailable) {
    return validationResult.error ||
      "Email verification is temporarily unavailable. Please try again in a few moments.";
  }

  if (validationResult.valid) return "";

  return validationResult.error || "Please enter a valid email address.";
}

export default validateEmail;