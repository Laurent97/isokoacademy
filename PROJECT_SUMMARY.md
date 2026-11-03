# ISOKO ACADEMY - PROJECT SUMMARY & NEXT STEPS

This document summarizes the artifacts created for Isoko Academy and outlines the next steps for development.

---

## 📦 ARTIFACTS CREATED

### 1. STAGE_0_LEGAL_BRIEF.md
**Purpose**: Legal opinion template for Rwandan lawyer
**Content**:
- AUXX credit classification (security vs virtual asset)
- App classification (education vs financial services)
- Data protection obligations under Rwandan law
- KYC/AML requirements and thresholds
- Price data provider compliance
- Required terms and disclaimers
- Age restrictions
- Advertising/marketing restrictions
- v1 scope definition

**Action Required**: Take to Rwandan lawyer for written opinion before any development

---

### 2. STAGE_1_DESIGN_SPEC.md
**Purpose**: Complete design specification for UI/UX designer
**Content**:
- Design principles (mobile-first, data-saver, accessibility)
- Style guide (colors, typography, spacing, icons, shadows)
- Language switch component specification
- 6 complete user flows (onboarding, lessons, exams, simulator, AUXX wallet, AI coach)
- 20 detailed wireframes (ASCII visual layouts)
- Component specifications (Term, language switch, progress bar, badge, card, etc.)
- Layout system (grid, containers, header heights)
- Accessibility guidelines (touch targets, contrast, screen reader)
- Dark mode specification
- Data-saver mode specification
- Usability testing checklist and success criteria

**Action Required**: UI/UX designer to create Figma prototype and conduct usability testing

---

### 3. DATABASE_SCHEMA.sql
**Purpose**: Complete PostgreSQL/Supabase schema for v1
**Tables Created** (31 tables):
- Users & Auth (users, sandbox_accounts, user_progress, user_levels)
- Content (levels, lessons, lesson_quizzes, glossary)
- Exams (mcq_question_banks, practical_exam_tasks, exam_attempts)
- Simulator (trading_pairs, sandbox_orders, market_replay_datasets, replay_sessions)
- AUXX Economy (auxx_config, auxx_ledger, crypto_deposits, auxx_purchase_limits)
- AI Coach (ai_interactions, ai_daily_costs, ai_config)
- Gamification (user_achievements, user_streaks, leaderboard_entries, certificates)
- Admin & Audit (admin_roles, audit_log, support_tickets, notifications)
- Analytics (daily_analytics)

**Features**:
- Row Level Security (RLS) policies on all user-facing tables
- Server-side role enforcement
- Deterministic readiness score calculation
- Double-entry AUXX ledger
- Immutable audit log
- Indexes for performance

**Action Required**: Review with technical team, run migration in Supabase

---

### 4. LESSONS_L0_L1_SPEC.md
**Purpose**: Detailed content specification for first two levels
**Content**:
- Level 0 (3 lessons): Introduction, Practice-first mindset, Scam awareness
- Level 1 (5 lessons): FOREX basics, Gold trading, Pips, Lots, Currency pairs
- Full English text for all lessons
- Draft Kinyarwanda translations (marked for native speaker review)
- Mini quizzes (3 questions per lesson)
- MCQ question banks (20 questions per level)
- Practical exam tasks with deterministic rubrics
- Glossary term definitions

**Action Required**:
- Review Kinyarwanda translations with native speaker
- Create animations/diagrams for each lesson
- Load content into database via admin content editor

---

### 5. ADMIN_DASHBOARD_WIREFRAME.md
**Purpose**: Complete specification for admin dashboard
**Modules** (10 modules):
1. Users (list, detail, block/unblock, reset)
2. Content (lessons, quizzes, glossary, approval workflow)
3. Levels & Exams (configuration, rubric editor)
4. Market (pairs, data providers, replay datasets)
5. Economy (AUXX pricing, refill limits, promo codes)
6. Payments (crypto deposits, manual review)
7. AI Controls (feature toggles, flagged responses, cost dashboard)
8. Analytics (metrics, retention, content performance)
9. Notifications (push, SMS, email manager)
10. Audit Log (immutable, reversible actions)

**Security**:
- Server-side role enforcement (Super Admin, Finance, Content Admin, Support)
- Role hierarchy and permission checks
- Audit logging for all admin actions
- Reversible action system

**Action Required**: Implement admin dashboard in Stage 8

---

## 🗺️ BUILD STAGES OVERVIEW

### Stage 0 - Legal and Scope (1-2 weeks) ⏳ CURRENT
**Status**: Artifacts ready, awaiting legal opinion
**Deliverable**: Signed legal opinion from Rwandan lawyer
**Approval Gate**: Lawyer's written opinion reviewed and accepted

**Next Actions**:
1. Take STAGE_0_LEGAL_BRIEF.md to Rwandan lawyer
2. Receive written opinion
3. Adjust v1 scope if any blockers identified
4. Draft Terms of Service and Privacy Policy based on recommendations

---

### Stage 1 - Design (2-3 weeks)
**Deliverables**:
- User flow diagram (Figma)
- 20 wireframes (EN + RW copy side by side)
- Style guide (colors, typography, motion)
- Clickable Figma prototype
- Usability test report (5-10 Rwandan learners)

**Approval Gate**: Prototype passes 8/10 users on "open the app and place a stop-loss order correctly"

**Next Actions**:
- Hire or engage UI/UX designer
- Create Figma design system
- Build interactive prototype
- Conduct usability testing in Rwanda
- Iterate based on feedback

---

### Stage 2 - Foundation (2 weeks)
**Deliverables**:
- Auth (phone + OTP)
- Language switch
- DB schema (use DATABASE_SCHEMA.sql)
- API skeleton
- Admin login + role scaffolding
- Basic admin user list

**Approval Gate**: Sign up, sign in, language switch, and admin login all work

**Next Actions**:
- Set up Supabase project
- Run DATABASE_SCHEMA.sql migration
- Implement phone + OTP auth
- Build language switch component
- Create admin authentication with role claims
- Build basic admin user list page

---

### Stage 3 - Learning Content (3-4 weeks)
**Deliverables**:
- Lesson player
- Glossary pop-up component
- Quiz engine
- Progress tracking
- L0-L2 content written in English
- L0-L2 Kinyarwanda translation reviewed by native speaker
- Admin content editor (draft → review → publish)
- Lost-funds interception flow

**Approval Gate**: L0-L2 complete, bilingual, native-speaker-approved

**Next Actions**:
- Implement lesson player with animation support
- Build `<Term>` glossary pop-up component
- Create quiz engine with randomization
- Implement progress tracking
- Load L0-L2 content from LESSONS_L0_L1_SPEC.md
- Hire native Kinyarwanda speaker for review
- Build admin content editor with approval workflow
- Implement lost-funds interception flow per AUXX rules

---

### Stage 4 - Simulator (4-6 weeks)
**Deliverables**:
- Chart with candles (TradingView Lightweight Charts)
- Market data service (single source of truth)
- Order engine (all order types)
- SL/TP drag interaction
- Live margin/P&L/R:R
- Trade history + equity curve
- Market Replay mode
- Unit tests with ≥95% coverage on P&L and margin math

**Approval Gate**: A test trade with known inputs produces the mathematically correct P&L to the third decimal

**Next Actions**:
- Integrate TradingView Lightweight Charts
- Build single-source market data service (Twelve Data → Polygon → Finnhub)
- Implement order engine (market, limit, stop orders)
- Build SL/TP drag interaction on chart
- Calculate live margin, P&L, and R:R
- Implement trade history and equity curve
- Build Market Replay mode with historical datasets
- Write comprehensive unit tests for P&L calculations
- Verify math correctness with test cases

---

### Stage 5 - Exams and Scoring (3 weeks)
**Deliverables**:
- MCQ engine with randomization + timer
- Practical exam engine with written rubrics
- Deterministic scoring (no AI in pass/fail)
- Correction screens with chart annotations
- Level lock/unlock + cooldowns

**Approval Gate**: Every practical exam task has a rubric; scoring is reproducible

**Next Actions**:
- Build MCQ engine with timer and anti-cheat
- Implement practical exam engine
- Load rubrics from LESSONS_L0_L1_SPEC.md
- Create deterministic scoring engine
- Build correction screens with chart annotations
- Implement level lock/unlock logic
- Add cooldown enforcement
- Test scoring reproducibility

---

### Stage 6 - AI Coach (2-3 weeks)
**Deliverables**:
- Lesson explainer
- Trade reviewer
- Weekly study plan generator
- Question generator with admin approval queue
- Readiness Score (deterministic formula)
- Cost ceiling enforced
- Flagging system for out-of-bounds responses

**Approval Gate**: 100 test prompts → zero promises of profit, zero specific trade signals, 100% flagged correctly

**Next Actions**:
- Set up Claude API integration
- Implement lesson explainer
- Build trade reviewer with feedback
- Create study plan generator
- Build question generator with admin approval
- Implement deterministic Readiness Score calculation (from DATABASE_SCHEMA.sql)
- Enforce 20 calls/day + $0.05/call hard cap
- Build flagging system for prohibited responses
- Test with 100 prompts for compliance

---

### Stage 7 - AUXX Wallet (3-4 weeks)
**Deliverables**:
- Ledger (double-entry, append-only)
- Crypto deposit flow (USDT TRC-20)
- Spend rules with all loss-refill limits enforced server-side
- Receipts
- Finance admin screens
- External security review before launch

**Approval Gate**: Security review signed off; ledger reproduces the exact balance from any point in history

**Next Actions**:
- Implement double-entry AUXX ledger
- Build crypto deposit flow (TRON TRC-20)
- Enforce all loss-refill limits (24h block, daily reset, weekly/monthly caps)
- Generate receipts for all transactions
- Build Finance admin screens
- Hire external security firm for review
- Verify ledger balance calculation from history

---

### Stage 8 - Full Admin Dashboard (2-3 weeks)
**Deliverables**:
- Analytics
- Market controls
- AI controls
- Notifications
- Immutable audit log

**Approval Gate**: Super Admin can reconstruct any user's full event history

**Next Actions**:
- Implement all 10 admin modules from ADMIN_DASHBOARD_WIREFRAME.md
- Build analytics dashboard
- Implement market controls
- Add AI controls and flagged response review
- Build notification manager
- Implement immutable audit log
- Test audit log reconstruction capability

---

### Stage 9 - Polish (2 weeks)
**Deliverables**:
- Animations
- Performance on 2 GB RAM Android
- Data-saver mode
- Offline lessons with sync
- L3-L5 content (bilingual)
- Certificates (QR-verifiable)

**Approval Gate**: 30-minute session on 3G stays under 50 MB

**Next Actions**:
- Add animations throughout app
- Optimize for low-end Android devices
- Implement data-saver mode
- Build offline lesson support with sync
- Write L3-L5 content (bilingual)
- Implement QR-verifiable certificates
- Test data usage on 3G network

---

### Stage 10 - Closed Beta (3-4 weeks)
**Deliverables**:
- 50-100 Rwandan users
- Bug fixes
- Content copy polish (especially Kinyarwanda)
- Exam fairness review

**Approval Gate**: <30% of beta users abandon at any single lesson; pass rate on L1 practicals between 40-70%

**Next Actions**:
- Recruit 50-100 beta testers in Rwanda
- Monitor analytics for drop-off points
- Fix bugs reported by testers
- Polish Kinyarwanda copy based on feedback
- Review exam pass rates for fairness
- Adjust difficulty if needed

---

### Stage 11 - Launch and Grow
**Deliverables**:
- Play Store launch
- iOS launch (later)
- University partnerships
- Youth center partnerships
- Referral rewards
- Monthly content updates

**Next Actions**:
- Submit to Google Play Store
- Partner with University of Rwanda, AUCA, MKU
- Partner with kLab, Norrsken
- Implement referral reward system
- Plan monthly content updates
- Plan iOS version

---

## 📋 IMMEDIATE ACTION ITEMS

### Before Development Starts
1. ✅ **COMPLETED**: Create legal brief template
2. ✅ **COMPLETED**: Create design specification
3. ✅ **COMPLETED**: Create database schema
4. ✅ **COMPLETED**: Create L0-L1 lesson specs
5. ✅ **COMPLETED**: Create admin dashboard wireframe
6. **NEXT**: Take legal brief to Rwandan lawyer
7. **NEXT**: Receive legal opinion
8. **NEXT**: Adjust scope if needed
9. **NEXT**: Draft Terms of Service and Privacy Policy

### After Legal Approval
1. Hire UI/UX designer for Stage 1
2. Set up Supabase project
3. Begin Stage 1 (Design)
4. Plan Stage 2 (Foundation) technical setup

---

## 🔑 KEY DECISIONS TO MAKE

### Technical Stack
The spec recommends:
- **Mobile**: React Native (Expo) OR PWA - decide in Stage 1
- **Backend**: Node.js (NestJS) OR Python (FastAPI)
- **DB**: PostgreSQL + Redis (Supabase for MVP)
- **Auth**: Phone + OTP (email optional)

**Decision needed in Stage 1**

### Price Data Provider
Priority order:
1. Twelve Data (free tier)
2. Polygon (free tier)
3. Finnhub (free tier)

**Decision needed in Stage 2**

### Crypto Payment Provider
Must support:
- Rwanda users
- TRC-20 USDT
- Webhook notifications

**Decision needed in Stage 0 (before Stage 7)**

### Kinyarwanda Native Speaker
Find and engage native speaker for:
- L0-L2 translation review (Stage 3)
- L3-L5 translation (Stage 9)

**Decision needed in Stage 1**

---

## 📊 PROJECT METRICS TO TRACK

### Development Metrics
- Stage completion time vs. estimated
- Bug count per stage
- Test coverage percentage
- Code review completion rate

### Content Metrics
- Lessons completed per level
- Translation review status
- Quiz question pass rates
- Practical exam fairness

### User Metrics (Stage 10+)
- Signups per week
- Active users (DAU/MAU)
- Lesson completion rate
- Exam pass rate
- Retention at each level
- AUXX purchase rate
- AI usage per user
- Readiness Score distribution

---

## ⚠️ RISKS AND MITIGATIONS

### Legal Risk
**Risk**: AUXX classified as security or financial service
**Mitigation**: Stage 0 legal opinion, conservative design (closed-loop, non-cash-out)

### Content Risk
**Risk**: Poor Kinyarwanda translation
**Mitigation**: Native speaker review, Stage 3 gate requiring approval

### Technical Risk
**Risk**: Single source of truth for price data fails
**Mitigation**: Fallback providers (Twelve Data → Polygon → Finnhub), freeze chart on failure

### Security Risk
**Risk**: AUXX ledger manipulation
**Mitigation**: Double-entry ledger, immutable audit log, external security review

### AI Risk
**Risk**: AI gives financial advice
**Mitigation**: Locked system prompt, flagging system, cost ceiling, 100-prompt compliance test

### Performance Risk
**Risk**: App too heavy for low-end Android
**Mitigation**: Data-saver mode, offline lessons, <50 MB target, Stage 9 performance testing

---

## 📞 CONTACTS TO ESTABLISH

### Legal
- Rwandan lawyer for financial law
- Contact needed in Stage 0

### Technical
- Supabase support (if using)
- TradingView support (for Lightweight Charts)
- Claude API support

### Content
- Native Kinyarwanda speaker
- Contact needed in Stage 1

### Payments
- Crypto payment gateway
- Contact needed in Stage 0

### Security
- External security review firm
- Contact needed in Stage 7

---

## 🎯 SUCCESS CRITERIA

### Stage 0
- Legal opinion received
- No regulatory blockers identified

### Stage 1
- Usability test: 8/10 users complete stop-loss task
- Design approved

### Stage 2
- Auth, language switch, admin login all working
- Database schema deployed

### Stage 3
- L0-L2 complete in EN and RW
- Native speaker approves translations
- Lost-funds flow implemented

### Stage 4
- P&L math correct to 3 decimal places
- Unit tests ≥95% coverage
- Market Replay working

### Stage 5
- All practical exams have rubrics
- Scoring reproducible
- Level lock/unlock working

### Stage 6
- 100/100 prompts pass compliance test
- Readiness Score deterministic
- Cost ceiling enforced

### Stage 7
- Security review signed off
- Ledger balance verifiable from history
- All refill limits enforced

### Stage 8
- All 10 admin modules working
- Audit log reconstructs full history
- Role enforcement server-side

### Stage 9
- <50 MB data per 30-min session on 3G
- L3-L5 content complete
- Certificates QR-verifiable

### Stage 10
- <30% drop-off at any lesson
- L1 practical pass rate 40-70%
- Major bugs fixed

### Stage 11
- Play Store launch
- 1,000+ users in first month
- University partnerships established

---

## 📝 DOCUMENTATION STANDARDS

### Code Documentation
- All functions documented with JSDoc/Docstrings
- README for each major module
- API documentation (OpenAPI/Swagger)

### User Documentation
- In-app help (EN + RW)
- Video tutorials (EN + RW)
- FAQ (EN + RW)

### Admin Documentation
- Admin dashboard user guide
- Audit log interpretation guide
- Troubleshooting guide

---

## 🔄 ITERATION PROCESS

### Content Iteration
1. Draft in English
2. Translate to Kinyarwanda (machine)
3. Native speaker review
4. Admin approval
5. Publish
6. User feedback
7. Iterate

### Feature Iteration
1. Spec and design
2. Implementation
3. Unit tests
4. Integration tests
5. User testing (beta)
6. Bug fixes
7. Launch
8. Monitor analytics
9. Iterate

---

## END OF PROJECT SUMMARY

**Current Status**: Artifacts complete, awaiting Stage 0 legal opinion

**Next Milestone**: Receive legal opinion and proceed to Stage 1 (Design)

**Estimated Timeline to Launch**: 26-37 weeks (6-9 months) from legal approval

**Key Dependencies**: Legal opinion, native Kinyarwanda speaker, crypto payment provider, security review firm
