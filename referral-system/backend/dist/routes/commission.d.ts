/**
 * POST /api/commissions/process
 * ----------------------------
 * Express route that triggers commission distribution for a deal.
 * Protected by a simple admin API key check (production: use proper auth).
 */
import { Router } from 'express';
import { type SupabaseClient } from '@supabase/supabase-js';
/** Factory that creates the router with a shared Supabase client. */
export declare function createCommissionRouter(supabase: SupabaseClient): Router;
