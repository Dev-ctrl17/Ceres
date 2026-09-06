"use strict";
/**
 * POST /api/commissions/process
 * ----------------------------
 * Express route that triggers commission distribution for a deal.
 * Protected by a simple admin API key check (production: use proper auth).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommissionRouter = createCommissionRouter;
const express_1 = require("express");
const commissionService_1 = require("../services/commissionService");
/** Factory that creates the router with a shared Supabase client. */
function createCommissionRouter(supabase) {
    const router = (0, express_1.Router)();
    router.post('/process', async (req, res) => {
        try {
            // ----------------------------------------------------------------------
            // Admin authorization — require a shared secret header.
            // In production, replace with Supabase Auth + role-based access control.
            // ----------------------------------------------------------------------
            const adminKey = process.env.COMMISSION_ADMIN_KEY;
            const providedKey = req.headers['x-admin-key'];
            if (!adminKey || providedKey !== adminKey) {
                return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
            }
            const { dealId, totalCommissionPool } = req.body ?? {};
            if (!dealId || typeof totalCommissionPool !== 'number' || totalCommissionPool <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_PAYLOAD',
                    message: 'dealId (string) and totalCommissionPool (positive number) are required',
                });
            }
            const result = await (0, commissionService_1.processDealCommission)(dealId, totalCommissionPool, supabase);
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
            // Handle "already processed" style errors
            if (message.includes('already been processed')) {
                return res.status(409).json({ success: false, error: 'ALREADY_PROCESSED' });
            }
            const statusMap = {
                DEAL_NOT_FOUND: 404,
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
//# sourceMappingURL=commission.js.map