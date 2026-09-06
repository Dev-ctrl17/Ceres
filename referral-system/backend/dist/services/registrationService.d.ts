/**
 * Registration Service
 * --------------------
 * Handles new consultant registration:
 *   1. Validates unique email & phone.
 *   2. Resolves the parent user from the `ref` referral code.
 *   3. Calls the `register_consultant` RPC which atomically inserts the
 *      user AND populates the closure table (referral_trees) up to depth 4.
 *   4. Returns the new user's referral link + WhatsApp share payload.
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { type User } from '../lib/types';
/** Payload accepted by POST /api/register. */
export interface RegisterConsultantInput {
    full_name: string;
    email: string;
    phone_number: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    ref?: string | null;
}
/** Successful registration response. */
export interface RegistrationResult {
    user: User;
    referralLink: string;
    whatsappShareUrl: string;
}
/**
 * Register a new consultant and build their referral tree.
 *
 * @param input    - Form data from the registration request.
 * @param supabase - Supabase client (service role recommended for RPC).
 */
export declare function registerConsultant(input: RegisterConsultantInput, supabase: SupabaseClient): Promise<RegistrationResult>;
