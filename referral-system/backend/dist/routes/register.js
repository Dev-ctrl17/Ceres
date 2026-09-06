"use strict";
/**
 * POST /api/register
 * ------------------
 * Express route that accepts new consultant registrations.
 * Delegates to the registrationService which calls the Supabase RPC.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegisterRouter = createRegisterRouter;
exports.createDefaultRegisterRouter = createDefaultRegisterRouter;
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const registrationService_1 = require("../services/registrationService");
/** Factory that creates the router with a shared Supabase client. */
function createRegisterRouter(supabase) {
    const router = (0, express_1.Router)();
    router.post('/', async (req, res) => {
        try {
            const body = req.body;
            // Basic shape validation
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS' });
            }
            const result = await (0, registrationService_1.registerConsultant)(body, supabase);
            return res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result,
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
            // Map known business errors to HTTP status codes
            const statusMap = {
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
function createDefaultRegisterRouter() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
    });
    return createRegisterRouter(supabase);
}
//# sourceMappingURL=register.js.map