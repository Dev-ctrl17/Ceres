/**
 * Commission Distribution Engine
 * -------------------------------
 * Given a completed deal and a total commission pool, this service:
 *   1. Queries the closure table (referral_trees) for all uplines of the
 *      deal closer up to depth 4.
 *   2. Applies the commission breakdown:
 *        Depth 1 (Direct Agent/Closer): 50%
 *        Depth 2 (2nd Gen Upline):      20%
 *        Depth 3 (3rd Gen Upline):      15%
 *        Depth 4 (4th Gen Upline):      15%
 *   3. Inserts pending commission rows into the `commissions` table.
 *
 * The closure table makes this a single indexed query on
 * (descendant_id, depth) — no recursive CTE required.
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { type Commission } from '../lib/types';
/** Result of processing a deal's commission. */
export interface CommissionResult {
    dealId: string;
    totalPool: number;
    commissionsCreated: Commission[];
    totalDistributed: number;
}
/**
 * Process commission distribution for a completed deal.
 *
 * @param dealId               - UUID of the deal that closed.
 * @param totalCommissionPool  - Total commission amount to distribute (e.g. 5% of deal value).
 * @param supabase             - Authenticated Supabase client (service role recommended).
 */
export declare function processDealCommission(dealId: string, totalCommissionPool: number, supabase: SupabaseClient): Promise<CommissionResult>;
