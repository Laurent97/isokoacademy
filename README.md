# Isoko Academy

A mobile-first trading education app for Rwandan beginners, teaching FOREX and XAU/USD (gold) through a sandbox simulator, practical exams, and an AI coach. Users never risk real money while learning.

---

## 🎯 Mission

Build a practice-only trading education platform that:
- Teaches risk management first, always
- Never holds, transfers, or manages real trading money
- Uses a closed-loop in-app credit (AUXX) that cannot be cashed out
- Prioritizes discipline over profit on leaderboards
- Is bilingual (English/Kinyarwanda) from day one
- Works on low-cost Android phones with limited data

---

## 🛡️ Non-Negotiable Guardrails

1. **Isoko Academy never holds, transfers, or manages real trading money**
2. **AUXX is a closed-loop, in-app credit** — cannot be cashed out, transferred, or converted back to crypto in v1
3. **The app never gives personal investment advice** — all AI output labeled "educational only"
4. **The AI never promises profit** — teaches risk management first
5. **Users under 18 are refused**
6. **KYC required before any amount crosses $50 in real-value purchases**
7. **Every AI response logged server-side** for compliance audit
8. **No user can trade a real broker account from inside the app in v1**
9. **Discipline is rewarded over profit** — leaderboards rank by rule-following, not P&L
10. **Every screen has an English / Kinyarwanda switch**
11. **Every trading term wrapped in `<Term>` component** with glossary pop-up
12. **Lost-funds interception flow cannot be skipped**
13. **Kinyarwanda for L0-L2 must be reviewed by native speaker** before Stage 3 ships

---

## 📁 Project Structure

```
Isoko Academy/
├── README.md                              # This file
├── SETUP_GUIDE.md                          # Dev environment setup
├── PROJECT_SUMMARY.md                      # Overall project summary & next steps
├── STAGE_0_LEGAL_BRIEF.md                 # Legal opinion template for Rwandan lawyer
├── STAGE_1_DESIGN_SPEC.md                  # Complete design specification (user flows, wireframes, style guide)
├── DATABASE_SCHEMA.sql                     # Complete PostgreSQL/Supabase schema
├── LESSONS_L0_L1_SPEC.md                   # Detailed lesson specifications (L0 & L1)
├── ADMIN_DASHBOARD_WIREFRAME.md            # Admin dashboard specification
├── backend/                                # Node.js + Express API (WORKING)
│   └── src/
│       ├── index.js                        # Server entry (also serves /admin)
│       ├── controllers/                    # auth, users, lessons, exams, simulator, auxx, ai, admin
│       ├── routes/                         # REST route wiring
│       ├── middleware/auth.js              # JWT + role guard
│       ├── services/                       # priceFeed, tradeMath, readiness
│       └── database/                       # db.js (pg or pg-mem dev DB), seed.js, migrate.js
├── mobile/                                 # React Native app (Expo + expo-router, WORKING)
│   ├── app/                                # Routes: (auth), (tabs), lesson, exam, trade, glossary, profile
│   └── src/
│       ├── theme/                          # Design tokens (light/dark)
│       ├── i18n/                           # EN + RW strings
│       ├── context/                        # AuthContext, SettingsContext
│       ├── services/api.js                 # Axios client w/ JWT + emulator-aware base URL
│       └── components/                     # ui.jsx kit, CandleChart
└── admin/                                  # Zero-dep admin SPA served at /admin (WORKING)
```

---

## 📦 Artifacts

### 1. STAGE_0_LEGAL_BRIEF.md
Legal opinion template covering:
- AUXX credit classification (security vs virtual asset)
- App classification (education vs financial services)
- Data protection obligations under Rwandan law
- KYC/AML requirements and thresholds
- Price data provider compliance
- Required terms and disclaimers
- Age restrictions
- Advertising/marketing restrictions

**Status**: Ready for lawyer review

---

### 2. DATABASE_SCHEMA.sql
Complete PostgreSQL/Supabase schema with:
- 31 tables covering all v1 features
- Row Level Security (RLS) policies
- Server-side role enforcement
- Deterministic readiness score calculation
- Double-entry AUXX ledger
- Immutable audit log
- Performance indexes

**Status**: Ready for migration

---

### 3. LESSONS_L0_L1_SPEC.md
Detailed content for first two levels:
- Level 0 (3 lessons): Introduction, Practice-first, Scam awareness
- Level 1 (5 lessons): FOREX basics, Gold trading, Pips, Lots, Currency pairs
- Full English text
- Draft Kinyarwanda translations (needs native speaker review)
- Mini quizzes (3 questions per lesson)
- MCQ question banks (20 questions per level)
- Practical exam tasks with deterministic rubrics

**Status**: Ready for native speaker review

---

### 4. ADMIN_DASHBOARD_WIREFRAME.md
Complete admin dashboard specification with:
- 10 modules (Users, Content, Levels, Market, Economy, Payments, AI, Analytics, Notifications, Audit)
- Server-side role enforcement (Super Admin, Finance, Content Admin, Support)
- Role hierarchy and permission checks
- Audit logging for all admin actions
- Reversible action system

**Status**: Ready for implementation (Stage 8)

---

### 5. PROJECT_SUMMARY.md
Overall project summary including:
- Artifact descriptions
- Build stages overview (11 stages)
- Immediate action items
- Key decisions to make
- Project metrics to track
- Risks and mitigations
- Success criteria per stage
- Contacts to establish

**Status**: Reference document

---

## 🗺️ Build Stages

### Stage 0 - Legal and Scope (1-2 weeks) ⏳ CURRENT
- Deliverable: Signed legal opinion from Rwandan lawyer
- Approval: Lawyer's written opinion reviewed and accepted

### Stage 1 - Design (2-3 weeks)
- Deliverable: User flows, wireframes, style guide, Figma prototype, usability test report
- Approval: 8/10 users complete stop-loss task in prototype

### Stage 2 - Foundation (2 weeks)
- Deliverable: Auth, language switch, DB schema, API skeleton, admin login
- Approval: Sign up, sign in, language switch, admin login all work

### Stage 3 - Learning Content (3-4 weeks)
- Deliverable: Lesson player, glossary, quiz engine, L0-L2 content (bilingual), admin content editor, lost-funds flow
- Approval: L0-L2 complete, bilingual, native-speaker-approved

### Stage 4 - Simulator (4-6 weeks)
- Deliverable: Chart, market data service, order engine, SL/TP drag, P&L, trade history, Market Replay, unit tests (≥95%)
- Approval: Test trade produces mathematically correct P&L to 3rd decimal

### Stage 5 - Exams and Scoring (3 weeks)
- Deliverable: MCQ engine, practical exam engine, deterministic scoring, correction screens, level lock/unlock
- Approval: Every practical exam has rubric; scoring reproducible

### Stage 6 - AI Coach (2-3 weeks)
- Deliverable: Lesson explainer, trade reviewer, study plan, question generator, Readiness Score, cost ceiling, flagging
- Approval: 100 test prompts → zero profit promises, zero signals, 100% flagged correctly

### Stage 7 - AUXX Wallet (3-4 weeks)
- Deliverable: Ledger, crypto deposit flow, spend rules, receipts, finance screens, security review
- Approval: Security review signed off; ledger verifiable from history

### Stage 8 - Full Admin Dashboard (2-3 weeks)
- Deliverable: Analytics, market controls, AI controls, notifications, audit log
- Approval: Super Admin can reconstruct any user's full event history

### Stage 9 - Polish (2 weeks)
- Deliverable: Animations, performance optimization, data-saver mode, offline lessons, L3-L5 content, certificates
- Approval: 30-minute session on 3G stays under 50 MB

### Stage 10 - Closed Beta (3-4 weeks)
- Deliverable: 50-100 Rwandan users, bug fixes, content polish, exam fairness review
- Approval: <30% drop-off at any lesson; L1 practical pass rate 40-70%

### Stage 11 - Launch and Grow
- Deliverable: Play Store launch, iOS launch, university partnerships, youth center partnerships, referral rewards

---

## 🚀 Getting Started

### For Lawyers
Review `STAGE_0_LEGAL_BRIEF.md` and provide written opinion on:
- AUXX classification
- App classification (education vs financial services)
- Required licenses or registrations
- Data protection obligations
- KYC/AML requirements
- Required terms and disclaimers

### For Developers
**The app runs end-to-end today with zero external services.**

```bash
# 1. Backend API (http://localhost:3100)
cd backend && npm install && npm run dev
# Uses an in-memory Postgres (pg-mem) seeded with demo data when
# DATABASE_URL is unset. Set DATABASE_URL + `npm run migrate` for real PG.

# 2. Admin dashboard (http://localhost:3100/admin)
# Served by the backend — just open the URL.
# Admin login: +250700000001, OTP: 123456

# 3. Mobile app (Expo)
cd mobile && npm install && npm start
# Scan QR with Expo Go. Learner login: +250788000000, OTP: 123456
```

Dev shortcuts: OTP `123456` works for any phone when Twilio isn't configured;
AI coach falls back to offline educational responses without `CLAUDE_API_KEY`.

### For Content Creators
1. Review `LESSONS_L0_L1_SPEC.md` for content format
2. Follow structure for L3-L5 lessons
3. Ensure all content is bilingual (EN + RW)
4. Hire native Kinyarwanda speaker for translation review

### For Designers
1. Review all lesson content for UI requirements
2. Review ADMIN_DASHBOARD_WIREFRAME.md for admin screens
3. Create mobile-first, data-saver design
4. Design for 2 GB RAM Android devices
4. Support dark + light mode

---

## 🔑 Key Features

### Sandbox Simulator
- Pairs: EUR/USD, GBP/USD, USD/JPY, XAU/USD, USD/RWF (learning only)
- Charts: TradingView Lightweight Charts
- Timeframes: M1, M5, M15, H1, H4, D1
- Order types: Market, Limit, Stop
- SL/TP with drag interaction
- Live P&L, margin, R:R
- Market Replay mode

### Learning Path
- 6 levels (L0-L5)
- Lessons ≤ 5 minutes each
- Mini quizzes (3 questions)
- Practical exams with rubrics
- Automatic scoring and correction
- Level lock/unlock system

### AI Coach
- Lesson explainer
- Trade reviewer
- Weekly study plan
- Question generator
- Readiness Score (deterministic formula)
- Cost ceiling: 20 calls/day, $0.05/call

### AUXX Economy
- Rate: 1,000 AUXX = 5 USDT
- Crypto deposits (USDT TRC-20)
- Spend on: sandbox balance, exam attempts, premium lessons, AI coach, certificates
- Loss-refill rules enforced server-side
- Daily free reset, weekly/monthly caps

### Gamification
- XP, streaks, badges
- Discipline-based leaderboards
- Certificates per level (QR-verifiable)

---

## 📊 Tech Stack (Recommended)

- **Mobile**: React Native (Expo) OR PWA
- **Backend**: Node.js (NestJS) OR Python (FastAPI)
- **DB**: PostgreSQL + Redis (Supabase for MVP)
- **WebSockets**: For live prices
- **Admin**: React web app
- **Auth**: Phone + OTP
- **AI**: Claude API behind own server
- **Payments**: Crypto gateway (TRC-20 USDT)
- **i18n**: `en` and `rw` from day one

---

## 🛡️ Security

- Server-side role enforcement (not client-side)
- Row Level Security (RLS) on database
- Immutable audit log
- Double-entry AUXX ledger
- AI responses logged and flagged
- KYC required at $50 threshold
- External security review before launch

---

## 📱 Non-Functional Requirements

- < 3s first paint on 3G
- < 50 MB data per 30-min session
- Dark + light mode
- Accessibility: min 16px body text, 44px touch targets
- Rwanda data protection law compliance
- Automated tests for scoring, ledger, exam unlocking
- Error monitoring (Sentry or equivalent)

---

## 🤝 Contributing

This project is in pre-development stage. No contributions accepted until Stage 0 legal approval is received.

---

## 📄 License

Proprietary. All rights reserved.

---

## 📞 Contact

For questions about this specification, contact:
[Your name]
[Your email]

For legal inquiries, refer to `STAGE_0_LEGAL_BRIEF.md`.

---

## 📈 Current Status

**Phase**: Stage 2 - Foundation (built and verified end-to-end)
**Status**: Backend API + mobile app + admin dashboard all run locally

**Working now**:
- Phone + OTP auth (dev OTP `123456`), JWT sessions, role enforcement
- 6-level learning path with L0/L1 lessons + quizzes (EN/RW, seeded from spec)
- MCQ exams with per-attempt option shuffling, pass/fail, cooldowns, level unlock + certificates
- Sandbox simulator: 5 pairs, live synthetic prices, market/limit/stop orders, SL/TP, margin, P&L accounting
- AUXX wallet: ledger, welcome bonus, purchase (mock), sandbox refill rules
- AI coach: explain / trade review / study plan / chat with daily limits + cost tracking (Claude API or offline fallback)
- Admin dashboard at `/admin`: stats, users (block/reset), content publish states, deposits, flagged AI, audit log
- Bilingual EN/RW UI, dark mode, data-saver toggle

**Next Milestone**: Stage 3 — L2+ content, native Kinyarwanda review, offline lesson caching

---

## 🎓 Learning Resources

- [TradingView Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- [Supabase Documentation](https://supabase.com/docs)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Twelve Data API](https://twelvedata.com/docs)

---

**Generated**: 2024-01-15
**Version**: 1.0
