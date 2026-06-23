import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface MailboxlayerResponse {
  email: string;
  did_you_mean: string;
  user: string;
  domain: string;
  format_valid: boolean;
  mx_found: boolean;
  smtp_check: boolean;
  catch_all: boolean;
  disposable: boolean;
  role: boolean;
  free: boolean;
  score: number;
}

interface ValidationResult {
  valid: boolean;
  score: number;
  format_valid: boolean;
  mx_found: boolean;
  smtp_check: boolean;
  disposable: boolean;
  role: boolean;
  free: boolean;
  catch_all: boolean;
  error?: string;
}

interface VerifyRequest {
  email: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// Simple in-memory cache
const cache = new Map<string, { result: ValidationResult; expiresAt: number }>();
const CACHE_TTL_MS = 300_000; // 5 minutes

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

function getCachedResult(email: string): ValidationResult | null {
  const normalizedEmail = email.toLowerCase().trim();
  const entry = cache.get(normalizedEmail);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.result;
  }
  cache.delete(normalizedEmail);
  return null;
}

function setCachedResult(email: string, result: ValidationResult): void {
  const normalizedEmail = email.toLowerCase().trim();
  cache.set(normalizedEmail, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  // Clean up old cache entries if cache grows too large
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now > value.expiresAt) {
        cache.delete(key);
      }
    }
  }
}

function sanitizeEmail(email: string): string {
  // Basic sanitization: trim, lowercase, remove dangerous characters
  return email.trim().toLowerCase().replace(/[<>"'()]/g, "");
}

function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function callMailboxlayer(
  email: string,
  apiKey: string,
  retries = 1
): Promise<MailboxlayerResponse> {
  const url = new URL("https://apilayer.net/api/check");
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("email", email);
  url.searchParams.set("smtp", "1");
  url.searchParams.set("format", "1");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10 second timeout

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Mailboxlayer API returned status ${response.status}`);
    }

    const data: MailboxlayerResponse = await response.json();
    return data;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.name !== "AbortError") {
      console.warn(
        `Mailboxlayer API call failed, retrying... (${retries} retries left)`,
        error.message
      );
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return callMailboxlayer(email, apiKey, retries - 1);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get API key from environment
    const mailboxlayerApiKey = Deno.env.get("MAILBOXLAYER_API_KEY");
    if (!mailboxlayerApiKey) {
      console.error("MAILBOXLAYER_API_KEY is not set in environment");
      return new Response(
        JSON.stringify({
          error: "Email verification is temporarily unavailable. Please try again later.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body: VerifyRequest = await req.json();

    if (!body.email || typeof body.email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sanitizedEmail = sanitizeEmail(body.email);

    if (!validateEmailFormat(sanitizedEmail)) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Please enter a valid email address.",
          format_valid: false,
          mx_found: false,
          smtp_check: false,
          disposable: false,
          role: false,
          free: false,
          catch_all: false,
          score: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check cache first
    const cachedResult = getCachedResult(sanitizedEmail);
    if (cachedResult) {
      console.log(`Cache hit for email: ${sanitizedEmail}`);
      return new Response(JSON.stringify(cachedResult), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Mailboxlayer API
    let mailboxlayerData: MailboxlayerResponse;
    try {
      mailboxlayerData = await callMailboxlayer(sanitizedEmail, mailboxlayerApiKey);
    } catch (error) {
      console.error("Mailboxlayer API error:", error instanceof Error ? error.message : "Unknown error");

      // If Mailboxlayer is unavailable, allow the email but log it
      return new Response(
        JSON.stringify({
          valid: true, // Allow through on service failure
          score: 0.5,
          format_valid: true,
          mx_found: true,
          smtp_check: true,
          disposable: false,
          role: false,
          free: false,
          catch_all: false,
          error: "Email verification is temporarily unavailable. Please try again in a few moments.",
          service_unavailable: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build validation result
    const result: ValidationResult = {
      valid: true,
      score: mailboxlayerData.score || 0,
      format_valid: mailboxlayerData.format_valid,
      mx_found: mailboxlayerData.mx_found,
      smtp_check: mailboxlayerData.smtp_check,
      disposable: mailboxlayerData.disposable,
      role: mailboxlayerData.role,
      free: mailboxlayerData.free,
      catch_all: mailboxlayerData.catch_all,
    };

    // Determine if email should be rejected
    const rejectReasons: string[] = [];

    if (!mailboxlayerData.format_valid) {
      result.valid = false;
      rejectReasons.push("format_invalid");
    }

    if (!mailboxlayerData.mx_found) {
      result.valid = false;
      rejectReasons.push("mx_not_found");
    }

    if (!mailboxlayerData.smtp_check) {
      result.valid = false;
      rejectReasons.push("smtp_check_failed");
    }

    if (mailboxlayerData.disposable) {
      result.valid = false;
      rejectReasons.push("disposable");
    }

    if (mailboxlayerData.score !== undefined && mailboxlayerData.score < 0.8) {
      result.valid = false;
      rejectReasons.push("low_score");
    }

    // Set appropriate error message
    if (!result.valid) {
      if (mailboxlayerData.disposable) {
        result.error =
          "Temporary email addresses are not accepted. Please use your permanent email address.";
      } else {
        result.error = "Please enter a valid email address.";
      }
    }

    // Cache the result
    setCachedResult(sanitizedEmail, result);

    console.log(
      `Email verification for ${sanitizedEmail}: valid=${result.valid}, score=${result.score}, reasons=${rejectReasons.join(",")}`
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({
        error: "Email verification is temporarily unavailable. Please try again in a few moments.",
        valid: true, // Allow through on internal error
        service_unavailable: true,
      }),
      {
        status: 200, // Return 200 so frontend can handle gracefully
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});