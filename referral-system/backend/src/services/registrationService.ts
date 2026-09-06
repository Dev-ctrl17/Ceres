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
import { REFERRAL_BASE_URL, type User } from '../lib/types';

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
export async function registerConsultant(
  input: RegisterConsultantInput,
  supabase: SupabaseClient
): Promise<RegistrationResult> {
  // --------------------------------------------------------------------------
  // 1. Basic input validation (defense in depth — the RPC also validates).
  // --------------------------------------------------------------------------
  const fullName = input.full_name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone_number?.trim();
  const refCode = input.ref?.trim() || null;

  if (!fullName || !email || !phone) {
    throw new Error('MISSING_REQUIRED_FIELDS');
  }

  // --------------------------------------------------------------------------
  // 2. Validate unique email & phone against Supabase.
  // --------------------------------------------------------------------------
  const { data: emailExists } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (emailExists) {
    throw new Error('EMAIL_TAKEN');
  }

  const { data: phoneExists } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', phone)
    .maybeSingle();

  if (phoneExists) {
    throw new Error('PHONE_TAKEN');
  }

  // --------------------------------------------------------------------------
  // 3. Look up the parent user by referral code (if provided).
  //    The RPC also does this, but we do it here to return a friendly
  //    error before hitting the database transaction.
  // --------------------------------------------------------------------------
  let parentId: string | null = null;

  if (refCode) {
    const { data: parent } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', refCode.toUpperCase())
      .maybeSingle();

    if (!parent) {
      throw new Error('INVALID_REF_CODE');
    }
    parentId = parent.id;
  }

  // --------------------------------------------------------------------------
  // 4. Call the RPC which transactionally inserts the user + closure rows.
  //    The RPC generates the unique 8-char referral code internally.
  // --------------------------------------------------------------------------
  const { data: newUserId, error: rpcError } = await supabase.rpc(
    'register_consultant',
    {
      p_full_name: fullName,
      p_email: email,
      p_phone_number: phone,
      p_bank_name: input.bank_name?.trim() ?? null,
      p_account_number: input.account_number?.trim() ?? null,
      p_account_name: input.account_name?.trim() ?? null,
      p_ref_code: refCode,
    }
  );

  if (rpcError) {
    // Map Postgres exception messages to friendly API errors.
    const message = rpcError.message ?? '';
    if (message.includes('EMAIL_TAKEN')) throw new Error('EMAIL_TAKEN');
    if (message.includes('PHONE_TAKEN')) throw new Error('PHONE_TAKEN');
    if (message.includes('INVALID_REF_CODE')) throw new Error('INVALID_REF_CODE');
    throw new Error(`REGISTRATION_FAILED: ${message}`);
  }

  // --------------------------------------------------------------------------
  // 5. Fetch the newly created user to build the response.
  // --------------------------------------------------------------------------
  const { data: newUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', newUserId)
    .single<User>();

  if (fetchError || !newUser) {
    throw new Error(`FAILED_TO_FETCH_NEW_USER: ${fetchError?.message ?? 'unknown'}`);
  }

  // --------------------------------------------------------------------------
  // 6. Build the referral link + WhatsApp share URL.
  // --------------------------------------------------------------------------
  const referralLink = `${REFERRAL_BASE_URL}?ref=${newUser.referral_code}`;

  const whatsappMessage =
    `🏠 *Join Luxury Properties Ltd — Earn on Every Referral!*\n\n` +
    `Hi! I've just joined Luxury Properties Ltd as a consultant and I'm earning ` +
    `commissions on luxury real estate deals. You can too!\n\n` +
    `👉 Register here: ${referralLink}\n\n` +
    `Earn up to 4 generations deep. Let's grow together! 🚀`;

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return {
    user: newUser,
    referralLink,
    whatsappShareUrl,
  };
}