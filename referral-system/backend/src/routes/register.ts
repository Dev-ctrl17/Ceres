/**
 * POST /api/register
 * ------------------
 * Express route that accepts new consultant registrations.
 * Delegates to the registrationService which calls the Supabase RPC.
 */

import { Router, type Request, type Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { registerConsultant, type RegisterConsultantInput } from '../services/registrationService';

/** Factory that creates the router with a shared Supabase client. */
export function createRegisterRouter(supabase: SupabaseClient): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    try {
      const body = req.body as RegisterConsultantInput;

      // Basic shape validation
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS' });
      }

      const result = await registerConsultant(body, supabase);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';

      // Map known business errors to HTTP status codes
      const statusMap: Record<string, number> = {
        MISSING_REQUIRED_FIELDS: 400,
        EMAIL_TAKEN: 409,
        PHONE_TAKEN: 409,
        INVALID_REF_CODE: 400,
      };

      const status = statusMap[message] ?? 500;

      return res.status(status).json({
        success: false,
        error: message,
      });
    }
  });

  return router;
}

/** Convenience factory for a standalone router with env-based client. */
export function createDefaultRegisterRouter(): Router {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return createRegisterRouter(supabase);
}