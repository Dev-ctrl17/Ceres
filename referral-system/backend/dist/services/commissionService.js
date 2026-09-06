"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDealCommission = processDealCommission;
const types_1 = require("../lib/types");
/**
 * Process commission distribution for a completed deal.
 *
 * @param dealId               - UUID of the deal that closed.
 * @param totalCommissionPool  - Total commission amount to distribute (e.g. 5% of deal value).
 * @param supabase             - Authenticated Supabase client (service role recommended).
 */
async function processDealCommission(dealId, totalCommissionPool, supabase) {
    // --------------------------------------------------------------------------
    // 1. Fetch the deal to get the closing user.
    // --------------------------------------------------------------------------
    const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
    if (dealError || !deal) {
        throw new Error(`Deal not found: ${dealId}`);
    }
    if (deal.status === 'verified' || deal.status === 'paid') {
        throw new Error(`Deal ${dealId} has already been processed (status: ${deal.status})`);
    }
    // --------------------------------------------------------------------------
    // 2. Query the closure table for all uplines of the closer up to depth 4.
    //
    //    In the closure table, the closer is the DESCENDANT. Their uplines
    //    (ancestors) are rows where descendant_id = closer.id.
    //    depth 1 = direct parent, depth 2 = grandparent, etc.
    // --------------------------------------------------------------------------
    const { data: treeRows, error: treeError } = await supabase
        .from('referral_trees')
        .select('ancestor_id, descendant_id, depth')
        .eq('descendant_id', deal.closing_user_id)
        .gte('depth', 1)
        .lte('depth', types_1.MAX_TREE_DEPTH)
        .order('depth', { ascending: true })
        .returns();
    if (treeError) {
        throw new Error(`Failed to query referral tree: ${treeError.message}`);
    }
    // --------------------------------------------------------------------------
    // 3. Build commission rows for each eligible upline.
    // --------------------------------------------------------------------------
    const commissionRows = [];
    for (const row of treeRows ?? []) {
        const percentage = types_1.COMMISSION_BREAKDOWN[row.depth];
        if (percentage === undefined)
            continue; // safety: only depths 1-4
        const amount = roundToTwo(totalCommissionPool * percentage);
        commissionRows.push({
            deal_id: dealId,
            user_id: row.ancestor_id,
            generation_level: row.depth,
            amount,
            status: 'pending',
        });
    }
    if (commissionRows.length === 0) {
        // No uplines found — the closer is the root of the tree.
        // In this case, the closer still gets their 50% share.
        commissionRows.push({
            deal_id: dealId,
            user_id: deal.closing_user_id,
            generation_level: 1,
            amount: roundToTwo(totalCommissionPool * types_1.COMMISSION_BREAKDOWN[1]),
            status: 'pending',
        });
    }
    // --------------------------------------------------------------------------
    // 4. Insert commission rows into the `commissions` table.
    // --------------------------------------------------------------------------
    const { data: inserted, error: insertError } = await supabase
        .from('commissions')
        .insert(commissionRows)
        .select()
        .returns();
    if (insertError) {
        throw new Error(`Failed to insert commissions: ${insertError.message}`);
    }
    // --------------------------------------------------------------------------
    // 5. Mark the deal as 'verified' (commissions created).
    // --------------------------------------------------------------------------
    const { error: updateError } = await supabase
        .from('deals')
        .update({ status: 'verified' })
        .eq('id', dealId);
    if (updateError) {
        throw new Error(`Failed to update deal status: ${updateError.message}`);
    }
    const totalDistributed = (inserted ?? []).reduce((sum, c) => sum + Number(c.amount), 0);
    return {
        dealId,
        totalPool: totalCommissionPool,
        commissionsCreated: inserted ?? [],
        totalDistributed,
    };
}
/** Round a number to 2 decimal places (currency-safe). */
function roundToTwo(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
//# sourceMappingURL=commissionService.js.map