# Multi-Tier Referral & Consultant Onboarding System

Production-ready referral system for **Luxury Properties Ltd** — captures consultant
registrations via a web form, tracks uplines up to 4 generations deep via URL
query parameters (`?ref=REF-1234`), and distributes multi-tier commissions when
deals close.

---

## 📁 Project Structure

```
referral-system/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql       ← Run this in Supabase SQL Editor
│   └── functions/
│       ├── _shared/cors.ts              ← Shared CORS helper for edge functions
│       └── register-consultant/index.ts ← Edge Function (alternative to Express)
├── backend/                             ← Express + TypeScript API
│   ├── src/
│   │   ├── index.ts                     ← Server entry point
│   │   ├── lib/types.ts                 ← Shared TypeScript types & constants
│   │   ├── routes/
│   │   │   ├── register.ts              ← POST /api/register
│   │   │   └── commission.ts            ← POST /api/commissions/process
│   │   └── services/
│   │       ├── registrationService.ts   ← Registration + closure tree building
│   │       └── commissionService.ts     ← Commission distribution engine
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/                            ← React + Vite + Tailwind CSS
    ├── src/
    │   ├── App.jsx                      ← Router ( /register )
    │   ├── main.jsx                     ← React entry
    │   ├── index.css                    ← Tailwind directives
    │   └── pages/RegisterPage.jsx       ← Registration form + success state
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env.example
```

---

## 🗄️ Database Schema & the 4-Generation Closure Table

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.

### Tables

| Table | Purpose |
|---|---|
| `users` | Consultant profiles with a unique `referral_code` and nullable `parent_id` (direct upline). |
| `referral_trees` | **Closure table** storing every ancestor→descendant relationship up to depth 4. |
| `deals` | Completed property deals with `closing_user_id`. |
| `commissions` | One row per (deal, upline) commission owed. |

### What is a Closure Table?

A **closure table** pre-computes and stores every ancestor↔descendant pair in a
tree. Instead of walking `parent_id` links recursively at query time, you simply
read indexed rows.

For this system, `depth` means:

| depth | Meaning |
|---|---|
| 0 | Self |
| 1 | Direct parent (upline) |
| 2 | Grandparent (2nd gen upline) |
| 3 | Great-grandparent (3rd gen upline) |
| 4 | Great-great-grandparent (4th gen upline) |

### Why Closure Table (vs recursive CTEs)?

1. **Fast 4-generation queries** — "all uplines of user X" is:
   ```sql
   SELECT ancestor_id, depth
   FROM referral_trees
   WHERE descendant_id = X AND depth BETWEEN 1 AND 4;
   ```
   One indexed lookup — no recursion needed.

2. **Fast downline queries** — "all downlines of user X" is:
   ```sql
   SELECT descendant_id, depth
   FROM referral_trees
   WHERE ancestor_id = X;
   ```

3. **Cheap inserts** — Adding a new user copies the parent's ancestor rows
   (max 4 rows) plus self + direct parent. O(depth), never O(tree size).

### Insert Logic (in `register_consultant` RPC)

When a new user `U` registers with parent `P`:

```
1. Insert (U, U, 0)            → self record
2. Insert (P, U, 1)            → direct parent
3. SELECT ancestor_id, depth
   FROM referral_trees
   WHERE descendant_id = P
   AND depth + 1 <= 4          → copy P's ancestors, depth+1
```

**Example tree:**

```
A (root)
└── B (direct child of A)
    └── C (direct child of B)
        └── D (direct child of C)
```

Closure rows for `D`:

| ancestor_id | descendant_id | depth |
|---|---|---|
| D | D | 0 |
| C | D | 1 |
| B | D | 2 |
| A | D | 3 |

If E registers under D, closure rows for `E` would be: `(E,E,0)`, `(D,E,1)`,
`(C,E,2)`, `(B,E,3)`, `(A,E,4)`.

Since depth is capped at 4, F registering under E would **not** propagate past
depth 4 — `(A, F, 5)` is never inserted. This enforces the business rule that
commission only flows 4 generations deep.

---

## 💰 Commission Breakdown

When a deal closes, the `process_deal_commission(dealId, pool)` function
distributes the total commission pool as follows:

| Generation | Recipient | Share |
|---|---|---|
| Depth 1 | Direct Agent / Closer | 50% |
| Depth 2 | 2nd Gen Upline | 20% |
| Depth 3 | 3rd Gen Upline | 15% |
| Depth 4 | 4th Gen Upline | 15% |
| **Total** | | **100%** |

If the closer has fewer than 4 uplines, only the existing uplines get paid
(e.g. a root closer with no upline gets the full 50% closer share).

---

## 🚀 Quick Start

### 1. Database Setup (Supabase)

1. Create a Supabase project.
2. Open **SQL Editor** and run the entire contents of:
   `supabase/migrations/001_initial_schema.sql`
3. This creates the tables, RLS policies, and two RPC functions:
   - `register_consultant(...)` — transactional user insert + closure tree build
   - `process_deal_commission(...)` — commission distribution

### 2. Backend (Express + TypeScript)

```bash
cd backend
cp .env.example .env      # fill in your Supabase URL + service role key
npm install
npm run dev               # starts API on http://localhost:3001
```

### 3. Frontend (React + Vite + Tailwind)

```bash
cd frontend
cp .env.example .env      # set VITE_API_BASE_URL=http://localhost:3001
npm install
npm run dev               # starts Vite on http://localhost:5173
```

Visit: `http://localhost:5173/register?ref=YOUR_CODE`

### 4. Supabase Edge Function (Alternative to Express)

The Edge Function at `supabase/functions/register-consultant/index.ts` is a
drop-in replacement for the Express `POST /api/register` endpoint.

```bash
cd supabase
supabase functions deploy register-consultant
```

Then point `VITE_API_BASE_URL` at:
`https://YOUR_PROJECT.supabase.co/functions/v1/register-consultant`

---

## 🔌 API Reference

### `POST /api/register`

**Request body:**

```json
{
  "full_name": "Adaeze Okafor",
  "email": "adaeze@example.com",
  "phone_number": "+2348000000000",
  "bank_name": "GTBank",
  "account_number": "0123456789",
  "account_name": "Adaeze Okafor",
  "ref": "ABC12345"
}
```

**Success (201):**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "referral_code": "XK9FQ2MN", "...": "..." },
    "referralLink": "https://luxurypropertiesltd.com.ng/register?ref=XK9FQ2MN",
    "whatsappShareUrl": "https://wa.me/?text=..."
  }
}
```

**Error codes:**

| Code | HTTP | Meaning |
|---|---|---|
| `MISSING_REQUIRED_FIELDS` | 400 | `full_name`, `email`, `phone_number` required |
| `EMAIL_TAKEN` | 409 | Email already registered |
| `PHONE_TAKEN` | 409 | Phone already registered |
| `INVALID_REF_CODE` | 400 | Referral code doesn't exist |

### `POST /api/commissions/process`

Protected by `x-admin-key` header (set `COMMISSION_ADMIN_KEY` in `.env`).

```json
{
  "dealId": "uuid-of-deal",
  "totalCommissionPool": 100000
}
```

Inserts `commissions` rows and flips the deal to `verified`.

---

## 🎨 Frontend Details

`RegisterPage.jsx`:

- Extracts `ref` from `useSearchParams` (works with React Router).
- Validates required fields + sends `POST` to the API.
- On success renders:
  - Success card with the user's unique referral link
    (`https://luxurypropertiesltd.com.ng/register?ref=YOUR_CODE`)
  - **Copy** button for the referral link
  - **Share to WhatsApp** button pre-loaded with an enticing invitation message
    via `https://wa.me/?text=...`

---

## 🔒 Production Notes

1. **RLS is enabled** on all tables. The service-role key bypasses RLS for
   server-side operations; the anon key only sees what policies allow.
2. **Commission engine** should run server-side only (service role). Never call
   `process_deal_commission` from the browser.
3. Replace the `x-admin-key` header check in `commission.ts` with proper
   Supabase Auth role-based access control for stronger security.
4. Add a rate limiter (e.g. `express-rate-limit`) in front of `/api/register`
   to prevent abuse.
5. Always use `npm audit fix` / `npm audit` before deploying to production.