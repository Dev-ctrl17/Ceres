/**
 * useEmailValidation Hook
 *
 * A reusable React hook for integrating Mailboxlayer email verification
 * into any form with an email field.
 *
 * Usage:
 *   const { verifyEmail, isVerifying, verificationError } = useEmailValidation();
 *   const result = await verifyEmail('user@example.com');
 */

import { useState, useCallback, useRef } from "react";
import { validateEmail, getValidationErrorMessage } from "@/services/emailValidation";

/**
 * Hook for email validation with loading state and error handling
 *
 * @returns {{
 *   verifyEmail: (email: string) => Promise<{valid: boolean, error?: string, details?: object}>,
 *   isVerifying: boolean,
 *   verificationError: string | null,
 *   clearError: () => void
 * }}
 */
export function useEmailValidation() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Verify an email address via the Mailboxlayer API (through Supabase Edge Function)
   *
   * @param {string} email - The email address to verify
   * @returns {Promise<{valid: boolean, error?: string, details?: object}>}
   */
  const verifyEmail = useCallback(async (email) => {
    // Cancel any in-flight verification
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const result = await validateEmail(email);

      if (!result.valid) {
        setVerificationError(getValidationErrorMessage(result));
      } else if (result.serviceUnavailable) {
        // Service unavailable - show warning but allow submission
        console.warn("Email verification service unavailable:", result.error);
      }

      return result;
    } catch (err) {
      console.error("Email verification failed:", err);
      // On unexpected errors, allow the email through
      return {
        valid: true,
        serviceUnavailable: true,
        error: "Email verification is temporarily unavailable. Please try again in a few moments.",
      };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  /**
   * Clear any verification error
   */
  const clearError = useCallback(() => {
    setVerificationError(null);
  }, []);

  return {
    verifyEmail,
    isVerifying,
    verificationError,
    clearError,
  };
}

export default useEmailValidation;