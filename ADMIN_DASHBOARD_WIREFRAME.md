# ISOKO ACADEMY - ADMIN DASHBOARD WIREFRAME

This document specifies the admin dashboard structure for all 10 modules. Roles are enforced SERVER-SIDE (via JWT claims or Supabase role claims), not client-side.

---

## ADMIN ROLES (Server-Side Enforced)

**Role Hierarchy**:
1. **Super Admin** - Full access to all modules, can reverse irreversible actions
2. **Content Admin** - Lessons, quizzes, exams, glossary, AI flagged responses
3. **Finance** - AUXX economy, crypto deposits, payments
4. **Support** - User management (view-only), support tickets, notifications

**Security Rules**:
- All role checks happen in backend API
- Frontend only hides UI elements after receiving role from backend
- Audit log records every admin action
- Support role actions touching money/content require Super Admin approval
- No client-side role bypass possible

---

## MODULE 1: USERS

**Access**: Super Admin, Support (view-only), Content Admin (view-only), Finance (view-only)
**Super Admin only**: Block/unblock, reset, view-as-support

### 1.1 User List Page
```
┌─────────────────────────────────────────────────────────────┐
│ Isoko Academy Admin - Users               [Role: Super Admin]│
├─────────────────────────────────────────────────────────────┤
│ Search: [________________]  Filter: [All ▼]  [Export CSV]  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ID        Phone        Email       Level  Status  Actions││
│ ├─────────────────────────────────────────────────────────┤│
│ │ #12345    +250788...   john@...    L2     Active  [View]││
│ │ #12346    +250729...   jane@...    L0     Blocked [View]││
│ │ #12347    +250788...   -           L1     Active  [View]││
│ └─────────────────────────────────────────────────────────┘│
│ Page: [1] [2] [3] ... [Next]  Total: 1,234 users          │
└─────────────────────────────────────────────────────────────┘
```

**Columns**:
- ID (clickable, opens user detail)
- Phone number (masked partially for non-Super Admin)
- Email (optional)
- Current level (L0-L5)
- Status (Active, Blocked, KYC Pending)
- Last active
- Actions (View, Block [Super Admin only], Reset [Super Admin only])

### 1.2 User Detail Page
```
┌─────────────────────────────────────────────────────────────┐
│ User Profile - #12345                  [Role: Super Admin]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Phone: +250788123456          Email: john@example.com       │
│ Level: L2 (Unlock L3)          Readiness: 68/100            │
│ KYC Level: 1 (ID verified)    Status: Active               │
│ Created: 2024-01-15           Last Active: 2 hours ago     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SANDBOX ACCOUNT                                           ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Balance: $8,450.00  Starting: $10,000.00                ││
│ │ Total Trades: 45  Win Rate: 62%  Max Drawdown: 8%       ││
│ │ [Reset Balance] [View Trade History]                     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ AUXX WALLET                                               ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Balance: 5,000 AUXX  Lifetime Purchased: $45.00         ││
│ │ [View Ledger] [View Deposits]                            ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ PROGRESS                                                  ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ L0: ✓ Completed    L1: ✓ Completed    L2: In Progress   ││
│ │ L3: Locked         L4: Locked         L5: Locked         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Block User] [Reset Account] [View As Support] [Back]       │
└─────────────────────────────────────────────────────────────┘
```

**Actions**:
- Block User (Super Admin only) - requires reason
- Reset Account (Super Admin only) - resets sandbox, keeps progress
- View As Support (Super Admin only) - impersonation for debugging

---

## MODULE 2: CONTENT

**Access**: Super Admin (full), Content Admin (full), Support (view-only)

### 2.1 Content Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Content Management                    [Role: Content Admin]  │
├─────────────────────────────────────────────────────────────┤
│ Tabs: [Lessons] [Quizzes] [Glossary] [Question Banks]       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Level 0 - Introduction              [3 lessons]          ││
│ │ L0.01 - What is Trading?          [Published] [Edit]     ││
│ │ L0.02 - Why We Practice           [Published] [Edit]     ││
│ │ L0.03 - How to Spot Scams         [Published] [Edit]     ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Level 1 - Basics                  [5 lessons]          ││
│ │ L1.01 - What is FOREX?            [Published] [Edit]     ││
│ │ L1.02 - Gold Trading              [Draft] [Edit]         ││
│ │ ...                                                        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [+ New Lesson] [+ New Quiz] [+ New Glossary Term]          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Lesson Editor
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Lesson - L1.02                   [Role: Content Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Level: [Level 1 ▼]    Lesson Number: [02]                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ENGLISH                                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Title: [What is Gold Trading?]                           ││
│ │ Content: [______________________________]                ││
│ │          [______________________________]                ││
│ │          (Max 200 words)                                 ││
│ │ Animation URL: [https://...] [Upload]                    ││
│ │ Diagram URL:   [https://...] [Upload]                    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ KINYARWANDA (Draft - Needs Review)                      ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Title: [Trading ya Zahabu ni iki?]                      ││
│ │ Content: [______________________________]                ││
│ │          [______________________________]                ││
│ │ [Request Native Review] [Mark Reviewed]                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ MINI QUIZ (3 questions)                                  ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Q1: [What is the symbol for gold?]                       ││
│ │     Options: [XAU] [GOLD] [GLD] [AU]                     ││
│ │     Correct: [XAU ▼]                                     ││
│ │     [+ Add Question]                                     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ State: [Draft ▼]  Trust Score: [85/100]                    │
│                                                             │
│ [Save Draft] [Submit for Review] [Publish] [Preview]       │
└─────────────────────────────────────────────────────────────┘
```

**States**:
- Draft (Content Admin only)
- Review (Content Admin + Super Admin can view)
- Published (Live to users)

**Approval Flow**:
1. Content Admin creates draft
2. Submit for Review
3. Super Admin approves or rejects
4. Published to users

---

## MODULE 3: LEVELS & EXAMS

**Access**: Super Admin (full), Content Admin (full)

### 3.1 Level Configuration
```
┌─────────────────────────────────────────────────────────────┐
│ Level Configuration                    [Role: Content Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ LEVEL 0 - Introduction                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Pass Mark:          [70%]                                ││
│ │ Time Limit:         [15] minutes                         ││
│ │ Cooldown:           [24] hours                            ││
│ │ Max Attempts:       [3]                                  ││
│ │ Question Bank:      [20 questions] [Manage]             ││
│ │ Practical Tasks:    [0 tasks] [Manage]                   ││
│ │ [Save] [Test Exam]                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ LEVEL 1 - Basics                                         ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Pass Mark:          [70%]                                ││
│ │ Time Limit:         [15] minutes                         ││
│ │ Cooldown:           [24] hours                            ││
│ │ Max Attempts:       [3]                                  ││
│ │ Question Bank:      [20 questions] [Manage]             ││
│ │ Practical Tasks:    [3 tasks] [Manage]                   ││
│ │ [Save] [Test Exam]                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Add New Level]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Practical Exam Rubric Editor
```
┌─────────────────────────────────────────────────────────────┐
│ Practical Task - practical_L1_01         [Role: Content Admin]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Level: [Level 1 ▼]    Task Number: [01]                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ PROMPT                                                    ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ English: [Buy EUR/USD with 0.01 lots. Set a stop loss.]  ││
│ │ Kinyarwanda: [Tenga EUR/USD n'amasosiyete 0.01...]      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ RUBRIC (Deterministic Scoring)                           ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Check 1:                                                  ││
│ │   Type: [equals_value ▼]                                 ││
│ │   Field: [lot_size ▼]                                    ││
│ │   Value: [0.01]                                          ││
│ │   Weight: [0.3]                                          ││
│ │                                                           ││
│ │ Check 2:                                                  ││
│ │   Type: [has_field ▼]                                    ││
│ │   Field: [stop_loss_price ▼]                             ││
│ │   Weight: [0.3]                                          ││
│ │                                                           ││
│ │ [+ Add Check]                                             ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Pass Threshold: [0.7] (70%)                                │
│ Time Limit: [30] minutes                                    │
│                                                             │
│ [Save] [Test with Sample Data]                              │
└─────────────────────────────────────────────────────────────┘
```

**Rubric Check Types**:
- `equals_value` - Field must equal exact value
- `has_field` - Field must not be null
- `risk_within` - Risk percent must be ≤ max
- `rr_gte` - Risk:reward ratio must be ≥ value
- `pips_moved` - Price must move ≥ min pips

---

## MODULE 4: MARKET

**Access**: Super Admin (full), Content Admin (view-only)

### 4.1 Market Configuration
```
┌─────────────────────────────────────────────────────────────┐
│ Market Configuration                     [Role: Super Admin] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ TRADING PAIRS                                             ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Symbol    Base    Quote    Pip Loc   Spread   Status    ││
│ │ XAU/USD   XAU     USD      2         0.5      Active   ││
│ │ EUR/USD   EUR     USD      4         1.0      Active   ││
│ │ GBP/USD   GBP     USD      4         1.5      Active   ││
│ │ USD/JPY   USD     JPY      2         1.0      Active   ││
│ │ USD/RWF   USD     RWF      0         50.0     Active   ││
│ │ [Edit Pair] [+ Add Pair]                                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ DATA PROVIDERS                                            ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Provider: [Twelve Data ▼]    Status: [Active]            ││
│ │ API Key: [••••••••••••••••••] [Rotate Key]               ││
│ │ Requests: [1,234 / 10,000] this month                    ││
│ │ Priority: [1] (Primary)                                  ││
│ │                                                           ││
│ │ Provider: [Polygon ▼]           Status: [Standby]        ││
│ │ API Key: [••••••••••••••••••] [Rotate Key]               ││
│ │ Requests: [0 / 5,000] this month                         ││
│ │ Priority: [2] (Fallback)                                 ││
│ │ [Test Connection]                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ MARKET REPLAY DATASETS                                    ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ NFP January 2024        [Active]  [Edit] [Download]      ││
│ │ Gold Flash Crash 2023   [Active]  [Edit] [Download]      ││
│ │ Fed Rate Decision 2024  [Draft]   [Edit] [Upload]        ││
│ │ [+ Upload Dataset]                                        ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## MODULE 5: ECONOMY (AUXX)

**Access**: Super Admin (full), Finance (full), Support (view-only)

### 5.1 AUXX Configuration
```
┌─────────────────────────────────────────────────────────────┐
│ AUXX Economy Configuration              [Role: Finance]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ PRICING                                                  ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Rate: 1,000 AUXX = [5.00] USDT                           ││
│ │ This means 1 AUXX = 0.005 USDT                           ││
│ │ [Update Rate] (Requires Super Admin approval)            ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SANDBOX STARTING BALANCE                                  ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Default: [$10,000.00]                                    ││
│ │ [Update] (Requires Super Admin approval)                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ REFILL LIMITS                                             ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Daily Free Reset:    [2,000] AUXX equivalent             ││
│ │ Max Paid/Week:       [2] refills                         ││
│ │ Max Paid/Month:      [3] refills                         ││
│ │ Cooldown:            [48] hours                          ││
│ │ [Update] (Requires Super Admin approval)                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ PROMO CODES                                               ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Code: WELCOME2024    Bonus: [500] AUXX   Uses: [234/1000]│
│ │ Code: STUDENT50       Bonus: [1000] AUXX  Uses: [89/500]  ││
│ │ [+ Create Promo Code]                                     ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Ledger View
```
┌─────────────────────────────────────────────────────────────┐
│ AUXX Ledger                            [Role: Finance]       │
├─────────────────────────────────────────────────────────────┤
│ Search User: [________________]  Date Range: [▼]  [Export]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Time        User      Type      Amount   Balance   Ref   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 10:23:45    #12345    Purchase  +5,000   5,000    #789  ││
│ │ 10:25:12    #12345    Spend     -1,000   4,000    #456  ││
│ │ 11:00:00    #12346    Bonus     +500     500      #790  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Verify Balance] [Reverse Transaction] [Super Admin only]   │
└─────────────────────────────────────────────────────────────┘
```

**Double-Entry Verification**:
- Verify Balance button recalculates balance from ledger history
- Should match current balance exactly
- Any discrepancy triggers alert

---

## MODULE 6: PAYMENTS

**Access**: Super Admin (full), Finance (full)

### 6.1 Crypto Deposits
```
┌─────────────────────────────────────────────────────────────┐
│ Crypto Deposits                         [Role: Finance]      │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All ▼]  Status: [Pending ▼]  [Export CSV]          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ID      User      Amount    Confirmations Status  Action ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ #789    #12345    $5.00     20/20         Confirmed [View]││
│ │ #790    #12346    $10.00    15/20         Pending  [View]││
│ │ #791    #12347    $25.00    0/20          Pending  [View]││
│ │ #792    #12348    $50.00    20/20         Manual   [View]││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Total This Month: $1,234.56  Pending: $125.00               │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Deposit Detail
```
┌─────────────────────────────────────────────────────────────┐
│ Deposit #790                           [Role: Finance]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ User: #12346 (john@example.com)                             │
│ Amount: $10.00 USDT                                         │
│ AUXX Credited: 2,000 AUXX                                   │
│                                                             │
│ Transaction Hash: 0x1234...abcd                             │
│ Wallet Address: TR7NHqjeKQxGTCi8qJ...                      │
│ Network: TRON TRC-20                                        │
│                                                             │
│ Confirmations: 15/20                                        │
│ Status: Pending                                             │
│ Created: 2024-01-15 10:25:12                               │
│                                                             │
│ [Force Confirm] [Mark Failed] [Request Manual Review]       │
└─────────────────────────────────────────────────────────────┘
```

**Manual Review Flow**:
- Finance marks as "Manual Review"
- Super Admin reviews blockchain transaction
- Super Admin approves or rejects
- Action logged in audit log

---

## MODULE 7: AI CONTROLS

**Access**: Super Admin (full), Content Admin (flagged responses only)

### 7.1 AI Feature Controls
```
┌─────────────────────────────────────────────────────────────┐
│ AI Controls                             [Role: Super Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ FEATURE TOGGLES                                           ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Lesson Explainer    [ON]  [Edit Prompt]                  ││
│ │ Trade Reviewer      [ON]  [Edit Prompt]                  ││
│ │ Study Plan          [ON]  [Edit Prompt]                  ││
│ │ Question Generator  [ON]  [Edit Prompt]                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ RATE LIMITS & COSTS                                       ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Max Calls/User/Day:    [20]                              ││
│ │ Max Cost/Call:         [$0.05]                           ││
│ │ Hard Stop Enabled:     [✓]                               ││
│ │ [Update Limits]                                           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SYSTEM PROMPT (View Only - v1 Locked)                     ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ You are an educational AI assistant for Isoko Academy... ││
│ │ [View Full Prompt]                                        ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Flagged Responses Review
```
┌─────────────────────────────────────────────────────────────┐
│ Flagged AI Responses                  [Role: Content Admin]  │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All ▼]  Status: [Needs Review ▼]                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ID     User    Feature    Flag Reason        Action      ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ #1234  #12345  Trade Rev  "Buy gold now"    [Review]     ││
│ │ #1235  #12346  Lesson     Specific price     [Review]     ││
│ │ #1236  #12347  Study Plan "You should"       [Review]     ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Daily Cost Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ AI Cost Dashboard                       [Role: Super Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Today: 2024-01-15                                          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SUMMARY                                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Total Calls:        1,234                                ││
│ │ Total Cost:         $12.45                               ││
│ │ Budget Remaining:   $37.55 (of $50 daily)                ││
│ │ Users Hitting Limit: 23                                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ TOP USERS BY COST                                         ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ #12345  45 calls  $2.25                                  ││
│ │ #12346  38 calls  $1.90                                  ││
│ │ #12347  32 calls  $1.60                                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [View Full Logs] [Set Daily Budget]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## MODULE 8: ANALYTICS

**Access**: Super Admin (full), Content Admin (view-only), Finance (view-only)

### 8.1 Dashboard Overview
```
┌─────────────────────────────────────────────────────────────┐
│ Analytics Dashboard                    [Role: Super Admin]  │
├─────────────────────────────────────────────────────────────┤
│ Period: [Last 30 Days ▼]                                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ KEY METRICS                                               ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ New Signups:        234                                  ││
│ │ Active Users:       1,456                                ││
│ │ Lessons Completed:  3,421                                ││
│ │ Exams Passed:       456                                  ││
│ │ AUXX Revenue:       $1,234.56                            ││
│ │ AI Cost:            $45.67                               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ RETENTION FUNNEL                                          ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Signups      ████████████████████ 100% (234)             ││
│ │ L0 Complete  ████████████████     85% (199)              ││
│ │ L1 Complete  ██████████          60% (140)              ││
│ │ L2 Complete  ██████             40% (94)               ││
│ │ L3 Complete  ████               25% (59)               ││
│ │ L4 Complete  ██                 15% (35)               ││
│ │ L5 Complete  █                  8%  (19)               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [View Detailed Reports]                                     │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Content Performance
```
┌─────────────────────────────────────────────────────────────┐
│ Content Performance                   [Role: Content Admin]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ LESSON COMPLETION RATES                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ L0.01 - What is Trading?     98% completed              ││
│ │ L0.02 - Why We Practice       95% completed              ││
│ │ L0.03 - Spot Scams            92% completed              ││
│ │ L1.01 - What is FOREX?        88% completed              ││
│ │ L1.02 - Gold Trading         45% completed [Drop-off]    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ HARDEST QUIZ QUESTIONS                                    ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ "What is a pip?" - 65% correct                           ││
│ │ "Standard lot size?" - 58% correct                       ││
│ │ "Base currency in EUR/USD?" - 72% correct                ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ COMMON MISTAKES (Practical Exams)                        ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 1. No stop loss set (45% of failures)                    ││
│ │ 2. Lot size too large (32% of failures)                  ││
│ │ 3. R:R ratio < 1:2 (23% of failures)                     ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## MODULE 9: NOTIFICATIONS

**Access**: Super Admin (full), Support (full)

### 9.1 Notification Manager
```
┌─────────────────────────────────────────────────────────────┐
│ Notification Manager                    [Role: Support]     │
├─────────────────────────────────────────────────────────────┤
│ Type: [Push ▼]  Target: [All Users ▼]  Language: [Both ▼]   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ CONTENT                                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Title (EN): [New lesson available!]                      ││
│ │ Title (RW): [Igishusho gishya kirikeho!]                ││
│ │                                                           ││
│ │ Body (EN): [Level 2 is now ready. Start learning...]     ││
│ │ Body (RW): [Level 2 rigeze imyitozo. Tangira...]         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ SCHEDULING                                                ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Send: [Now ▼]                                            ││
│ │ OR Schedule: [2024-01-20 09:00]                          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Preview] [Send] [Schedule]                                  │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Notification History
```
┌─────────────────────────────────────────────────────────────┐
│ Notification History                  [Role: Support]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Time      Type    Target    Sent    Opened   Title     ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 10:00     Push   All       1,234   890      New lesson ││
│ │ 09:00     SMS    Blocked   5       5        Account... ││
│ │ Yesterday Push   L2 users  456     312      Exam ready ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## MODULE 10: AUDIT LOG

**Access**: Super Admin only (read-only, immutable)

### 10.1 Audit Log Viewer
```
┌─────────────────────────────────────────────────────────────┐
│ Audit Log                              [Role: Super Admin]   │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All Actions ▼]  Admin: [All ▼]  Date: [▼]  [Export]│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Time      Admin      Role    Action      Table    Details││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 10:23:45  #10001     Super   Update      users    Block  ││
│ │           @john             user #12345                  ││
│ │           IP: 192.168.1.1                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 10:15:30  #10002     Finance Approve    deposits #790   ││
│ │           @jane             manual review               ││
│ │           IP: 192.168.1.2                                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 09:45:12  #10001     Super   Create      lessons  L1.02 ││
│ │           @john             Draft                        ││
│ │           IP: 192.168.1.1                                   ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [View Full Details] [Export to CSV]                          │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Audit Detail
```
┌─────────────────────────────────────────────────────────────┐
│ Audit Entry #45678                      [Role: Super Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Time: 2024-01-15 10:23:45 UTC                               │
│ Admin: #10001 (john@isoko.academy)                          │
│ Role: Super Admin                                           │
│ Action: Update                                              │
│ Table: users                                                │
│ Record ID: #12345                                           │
│                                                             │
│ IP Address: 192.168.1.1                                     │
│ User Agent: Mozilla/5.0...                                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ OLD VALUES                                                ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ is_blocked: false                                        ││
│ │ blocked_reason: null                                     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ NEW VALUES                                                ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ is_blocked: true                                         ││
│ │ blocked_reason: "Fraud investigation - ticket #1234"     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Reason: User reported for suspicious trading patterns       │
│                                                             │
│ Is Reversible: Yes                                          │
│ [Reverse Action] [Print] [Back]                              │
└─────────────────────────────────────────────────────────────┘
```

**Reversal Rules**:
- Only Super Admin can reverse
- Reversal creates new audit entry
- Some actions (like delete) are not reversible
- Reason required for reversal

---

## SECURITY IMPLEMENTATION NOTES

### Backend Role Enforcement (Pseudo-code)

```typescript
// Middleware: Check role before allowing action
async function requireRole(requiredRole: UserRole) {
  const user = await getCurrentUser();
  const adminRole = await getAdminRole(user.id);

  if (!adminRole || !adminRole.is_active) {
    throw new ForbiddenError("Not an admin");
  }

  // Role hierarchy check
  const roleHierarchy = {
    super_admin: 4,
    finance: 3,
    content_admin: 2,
    support: 1
  };

  if (roleHierarchy[adminRole.role] < roleHierarchy[requiredRole]) {
    throw new ForbiddenError("Insufficient permissions");
  }

  return user;
}

// Example: Blocking a user
app.post('/admin/users/:id/block', async (req, res) => {
  await requireRole('super_admin'); // Only Super Admin

  const { reason } = req.body;
  if (!reason) {
    throw new BadRequestError("Reason required");
  }

  // Log to audit
  await auditLog.create({
    admin_user_id: req.user.id,
    role: 'super_admin',
    action: 'update',
    table_name: 'users',
    record_id: req.params.id,
    old_values: { is_blocked: false },
    new_values: { is_blocked: true, blocked_reason: reason },
    reason
  });

  // Perform action
  await users.update(req.params.id, {
    is_blocked: true,
    blocked_reason: reason
  });

  res.json({ success: true });
});
```

### Frontend UI Hiding (After Backend Verification)

```typescript
// Component: User Actions
function UserActions({ user }) {
  const { role } = useAdminRole(); // Fetched from backend

  return (
    <div>
      <Button onClick={() => viewUser(user.id)}>View</Button>

      {role === 'super_admin' && (
        <>
          <Button onClick={() => blockUser(user.id)}>Block</Button>
          <Button onClick={() => resetUser(user.id)}>Reset</Button>
        </>
      )}

      {(role === 'support' || role === 'super_admin') && (
        <Button onClick={() => viewAsSupport(user.id)}>View As Support</Button>
      )}
    </div>
  );
}
```

---

## END OF ADMIN DASHBOARD WIREFRAME
