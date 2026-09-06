"use strict";
/**
 * Express Server Entry Point
 * --------------------------
 * Boots the API server with:
 *   - POST /api/register  → consultant registration
 *   - POST /api/commissions/process → commission distribution (admin)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const supabase_js_1 = require("@supabase/supabase-js");
const register_1 = require("./routes/register");
const commission_1 = require("./routes/commission");
const PORT = Number(process.env.PORT) || 3001;
// ----------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS for server-side operations)
// ----------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
});
// ----------------------------------------------------------------------------
// Express app
// ----------------------------------------------------------------------------
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express_1.default.json({ limit: '1mb' }));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/register', (0, register_1.createRegisterRouter)(supabase));
app.use('/api/commissions', (0, commission_1.createCommissionRouter)(supabase));
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'NOT_FOUND' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
});
app.listen(PORT, () => {
    console.log(`Referral API listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map