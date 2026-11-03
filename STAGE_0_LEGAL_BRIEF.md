# STAGE 0 LEGAL BRIEF — Isoko Academy

**Date**: [To be filled]
**Client**: [Your name/company]
**Jurisdiction**: Rwanda
**Document Purpose**: Legal opinion required before any development work begins

---

## EXECUTIVE SUMMARY

Isoko Academy is a mobile application that teaches Rwandan beginners to trade FOREX and XAU/USD (gold) using a **sandbox simulator only**. The app never holds, transfers, or manages real trading money. Users practice with virtual sandbox funds and may purchase in-app credits (AUXX) for learning tools. AUXX cannot be cashed out or converted to real money in v1.

**We require a written legal opinion on the questions below before proceeding.**

---

## QUESTION 1: AUXX CREDIT CLASSIFICATION

**What is AUXX?**
- AUXX is a closed-loop, in-app credit
- Users purchase AUXX with USDT (TRC-20) via crypto wallet
- Rate: 1,000 AUXX = 5 USDT (admin-configurable)
- AUXX can be spent on: extra sandbox balance, extra exam attempts, premium lessons, AI coach packs, certificates
- AUXX **cannot** be cashed out, transferred between users, or converted back to crypto in v1
- No user can trade a real broker account from inside the app

**Questions for the lawyer:**

1. Does selling AUXX for USDT constitute issuing a "security" under Rwandan law?
2. Does this arrangement fall under any financial services regulation (e.g., Capital Markets Authority, National Bank of Rwanda)?
3. Is the "closed-loop, non-cash-out" nature of AUXX sufficient to avoid classification as a virtual asset or financial instrument?
4. What additional safeguards or disclosures would you recommend to strengthen this position?

---

## QUESTION 2: APP CLASSIFICATION — EDUCATION VS FINANCIAL SERVICES

**What does the app do?**
- Teaches trading concepts through lessons, quizzes, and practical exams
- Provides a sandbox simulator with virtual funds (10,000 USD sandbox balance)
- Offers an AI coach that explains lessons and reviews practice trades
- Shows users' performance metrics (practice-only, never real money)
- Never gives personal investment advice — all AI output labeled "educational only"
- Never promises profit — teaches risk management first
- Leaderboards rank by discipline (rule-following), not by profit
- At graduation (L5 + Readiness Score ≥ 70), app may recommend licensed brokers — user must leave the app to open a real account

**Questions for the lawyer:**

1. Is Isoko Academy classified as "financial education" or "financial services" under Rwandan law?
2. Does the app require any license from the Capital Markets Authority (CMA) or other regulator?
3. Does the AI coach feature (which reviews practice trades and gives feedback) change the classification?
4. What disclaimers and user agreements are required to maintain the "education-only" position?
5. Are there any specific requirements for the broker recommendation feature (at graduation)?

---

## QUESTION 3: DATA PROTECTION OBLIGATIONS

**What user data does the app collect?**
- Phone number (for auth)
- Optional email
- Name (optional, may be required for certificates)
- Sandbox trading history (practice-only, no real money)
- Quiz and exam results
- Journal entries (why user took each trade)
- AI coach interactions (logged server-side with hash of input/output)
- AUXX purchase history (crypto deposits, not KYC-linked until $50 threshold)

**Questions for the lawyer:**

1. What are the data protection obligations under Rwandan law (NCSA/RURA)?
2. Is registration with any data protection authority required?
3. What user consent and privacy policy elements are mandatory?
4. Are there any restrictions on cross-border data transfer (e.g., to Claude API for AI features)?
5. What data retention policies are required for logs, AI interactions, and trading history?
6. For users under 18: the app refuses them entirely. Is this sufficient, or are additional protections required?

---

## QUESTION 4: KYC AND AML OBLIGATIONS

**Current KYC plan:**
- No KYC required for AUXX purchases under $50 equivalent
- KYC required before any amount crosses $50 in real-value purchases
- AUXX purchase limits keep most users under threshold until v2
- KYC via phone + OTP initially; document upload at $50 threshold

**Questions for the lawyer:**

1. At what AUXX purchase threshold (in USDT equivalent) is KYC mandatory under Rwandan AML law?
2. What level of KYC is required (e.g., ID only, or ID + proof of address)?
3. Are there any reporting obligations for crypto deposits or AUXX purchases?
4. Does the $50 threshold align with regulatory expectations, or should it be lower?
5. Are there any restrictions on accepting crypto payments from Rwandan users?

---

## QUESTION 5: PRICE DATA PROVIDER COMPLIANCE

**Plan:**
- Use free-tier market data providers (Twelve Data, Polygon, Finnhub)
- Providers have terms requiring attribution
- No real trading occurs in the app — data is for sandbox simulation only

**Questions for the lawyer:**

1. Are there any legal obligations when using third-party market data for educational/simulation purposes?
2. What attribution or notices are required to users?
3. Are there any restrictions on redistributing or caching market data?

---

## QUESTION 6: TERMS OF SERVICE AND USER AGREEMENT

**Key terms we plan to include:**
- AUXX is non-refundable, non-transferable, non-cash-out
- Sandbox funds are not real money
- App provides education only, not financial advice
- Users under 18 are prohibited
- App reserves right to block users for abuse
- Rwanda law governs disputes

**Questions for the lawyer:**

1. What additional terms are legally required?
2. Are there any terms that would be unenforceable under Rwandan law?
3. What dispute resolution mechanism is recommended (court, arbitration, etc.)?
4. Should we include a liability cap, and what would be reasonable?

---

## QUESTION 7: AGE RESTRICTIONS

**Current plan:**
- Users under 18 are refused at signup
- No parental consent mechanism — simply block under-18

**Questions for the lawyer:**

1. Is a hard block on under-18 users sufficient, or is parental consent required for any educational content?
2. What age verification method is acceptable (self-declaration, or more)?
3. Are there any specific protections for users 18-21 (young adults)?

---

## QUESTION 8: ADVERTISING AND MARKETING RESTRICTIONS

**Planned approach:**
- Never advertise AUXX as an investment
- Never promise profit
- Emphasize "practice-only, never real money"
- No "get rich quick" messaging
- Target Rwandan learners aged 18-35

**Questions for the lawyer:**

1. Are there any restrictions on marketing financial education in Rwanda?
2. What disclosures are required in advertising materials?
3. Are there any restrictions on targeting university students or youth centers?
4. What would constitute "misleading advertising" in this context?

---

## V1 SCOPE — FOR LAWYER'S REFERENCE

**What v1 will NOT include:**
- No real trading accounts
- No cash-out of AUXX
- No P2P transfers between users
- No mobile money payments (MTN MoMo / Airtel Money) — crypto only
- No broker integration (app only recommends licensed brokers at graduation)
- No real-money deposits or withdrawals
- No margin lending or leverage on real funds

**What v1 WILL include:**
- Sandbox simulator with virtual funds
- Lessons, quizzes, and exams (L0–L5)
- AI coach for educational feedback
- AUXX credits (closed-loop, non-cash-out)
- Crypto deposits for AUXX purchase (USDT TRC-20)
- Broker recommendation list at graduation (neutral comparison, no referral kickbacks)

---

## DELIVERABLE REQUIRED

**Please provide a written legal opinion addressing:**

1. Classification of AUXX under Rwandan law (security, virtual asset, or neither)
2. Classification of the app (financial education or financial services)
3. Required licenses or registrations (CMA, NBR, NCSA/RURA, or none)
4. Data protection obligations and required compliance steps
5. KYC/AML obligations and recommended thresholds
6. Required terms, disclaimers, and user agreement elements
7. Any regulatory blockers to v1 launch
8. Recommended changes to v1 scope to reduce legal risk

**Format**: Plain English, 1-2 pages, signed by the lawyer or law firm.

---

## NEXT STEPS AFTER LEGAL OPINION

Once we receive the legal opinion, we will:

1. Update the v1 scope if any blockers are identified
2. Draft the Terms of Service and Privacy Policy based on your recommendations
3. Implement any required compliance features (e.g., KYC threshold, disclosures)
4. Proceed to Stage 1 (Design) only after legal sign-off

---

## CONTACT INFORMATION

**For questions or clarification:**
[Your name]
[Your email]
[Your phone]

**Legal counsel:**
[Lawyer/firm name]
[Email]
[Phone]

---

*This document is intended for legal review only and does not constitute legal advice.*
