# Isoko Academy - Setup Guide

Run the full stack locally with **zero external services** — no Postgres,
Twilio, or API keys required for development.

---

## Project Structure

```
Isoko Academy/
├── backend/     # Express API on http://localhost:3100 (also serves /admin)
├── mobile/      # React Native app (Expo + expo-router)
├── admin/       # Admin dashboard SPA served by the backend
└── DATABASE_SCHEMA.sql
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev        # nodemon, auto-reloads
```

- Runs on `http://localhost:3100`
- **No `DATABASE_URL`?** Boots an in-memory Postgres (pg-mem), runs the
  schema, and seeds demo data: 6 levels, 8 bilingual lessons, 24 quiz
  questions, 40 exam questions, glossary, trading pairs, admin + demo users.
- **`DATABASE_URL` set?** Connects to real Postgres. Run `npm run migrate`
  first to apply `DATABASE_SCHEMA.sql`.

### 2. Admin dashboard

Open `http://localhost:3100/admin` in a browser — served by the backend.

- Admin login: phone `+250700000001`, OTP `123456`
- Modules: Dashboard, Users (block/reset), Content (publish states),
  Deposits, AI flagged, Audit log

### 3. Mobile app

```bash
cd mobile
npm install
npm start          # Expo dev server
```

- Scan the QR code with **Expo Go** (Android/iOS), or press `w` for web.
- Learner login: `+250788000000`, OTP `123456`
- On Android emulator the API resolves to `10.0.2.2:3100` automatically;
  on a physical device it uses your machine's LAN IP via Expo hostUri.

> Note: `npm install` runs `scripts/patch-expo-cli.js`, which fixes a
> `@expo/cli` + Node ≥20 bug (`node:`-prefixed builtin module names crash
> Metro externals mkdir on Windows).

---

## Dev-Mode Shortcuts

| Feature | Behavior without config |
|---|---|
| OTP/SMS | Any phone + code `123456` logs in; real OTP also logged to console + returned as `dev_otp` |
| Database | In-memory pg-mem, reseeded on every restart |
| AI coach | Deterministic offline educational responses |
| Prices | Synthetic random-walk feed for all 5 pairs |
| AUXX purchase | Mock deposit, instantly confirmed |

Set real values in `backend/.env` to enable Twilio SMS, Claude API, or a
real database — no code changes needed.

---

## Test the API

```bash
# health
curl http://localhost:3100/health

# login (returns JWT)
curl -X POST http://localhost:3100/api/auth/send-otp \
  -H "Content-Type: application/json" -d '{"phone_number":"+250788000000"}'
curl -X POST http://localhost:3100/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+250788000000","code":"123456"}'

# authenticated call
curl http://localhost:3100/api/lessons/levels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Route map

```
POST /api/auth/send-otp | verify-otp | refresh | logout
GET  /api/users/profile · PUT /api/users/profile | language
GET  /api/lessons/levels | /level/:id | /glossary | /:id
POST /api/lessons/:id/start | complete
GET  /api/exams/:level/eligibility | attempts | practical
POST /api/exams/:level/start | submit · POST /api/exams/practical/:task/submit
GET  /api/simulator/pairs | price | candles | account | orders | journal
POST /api/simulator/orders · POST /orders/:id/close | cancel
GET  /api/auxx/wallet | ledger · POST /purchase | refill-sandbox
GET  /api/ai/usage · POST /explain | trade-review | study-plan | chat
GET  /api/admin/* (stats, users, content, audit, deposits, ai/flagged, tickets)
```

---

## Troubleshooting

- **Port 3100 busy**: change `PORT` in `backend/.env` and update
  `EXPO_PUBLIC_API_URL` accordingly.
- **Metro `node:sea` mkdir error (Windows)**: fixed by
  `mobile/scripts/patch-expo-cli.js` (runs on postinstall). Re-run it manually
  if you reinstall node_modules without scripts.
- **App can't reach API**: check `EXPO_PUBLIC_API_URL` (e.g.
  `http://192.168.x.x:3100/api`), ensure phone and PC share a network, and
  that the backend shows `[db] Using in-memory PostgreSQL`.
- **Expo stuck**: `npx expo start -c` clears the cache.

---

**Last updated**: Stage 2 build
