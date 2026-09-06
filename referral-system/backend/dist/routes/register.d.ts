/**
 * POST /api/register
 * ------------------
 * Express route that accepts new consultant registrations.
 * Delegates to the registrationService which calls the Supabase RPC.
 */
import { Router } from 'express';
import { type SupabaseClient } from '@supabase/supabase-js';
/** Factory that creates the router with a shared Supabase client. */
export declare function createRegisterRouter(supabase: SupabaseClient): Router;
/** Convenience factory for a standalone router with env-based client. */
export declare function createDefaultRegisterRouter(): Router;
