/**
 * Express Server Entry Point
 * --------------------------
 * Boots the API server with:
 *   - POST /api/register  → consultant registration
 *   - POST /api/commissions/process → commission distribution (admin)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import { createRegisterRouter } from './routes/register';
import { createCommissionRouter } from './routes/commission';

const PORT = Number(process.env.PORT) || 3001;

// ----------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS for server-side operations)
// ----------------------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ----------------------------------------------------------------------------
// Express app
// ----------------------------------------------------------------------------
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/register', createRegisterRouter(supabase));
app.use('/api/commissions', createCommissionRouter(supabase));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
});

// Error handler
app.use(
  (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
  }
);

app.listen(PORT, () => {
  console.log(`Referral API listening on http://localhost:${PORT}`);
});