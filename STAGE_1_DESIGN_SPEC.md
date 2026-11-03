# STAGE 1 - DESIGN SPECIFICATION

This document provides the complete design specification for Isoko Academy. A UI/UX designer should use this to create user flows, wireframes, style guide, and Figma prototype.

---

## 🎨 DESIGN PRINCIPLES

### Core Principles
1. **Mobile-First**: Design for Android phones first (low-end devices, 2 GB RAM)
2. **Data-Saver**: Minimal animations, lightweight assets, <50 MB per session
3. **Accessibility**: Min 16px body text, 44px touch targets, high contrast
4. **Bilingual**: Every screen has EN/RW switch
5. **Simplified English**: Short sentences, no jargon without explanation
6. **Trust-First**: Clear disclaimers, transparent about sandbox nature
7. **Progressive Disclosure**: Show complexity only when needed

### Target Devices
- Primary: Android phones (2 GB RAM, 3G connection)
- Secondary: iOS (later)
- Screen sizes: 360px - 412px width (standard Android)

---

## 🎨 STYLE GUIDE

### Color Palette

#### Primary Colors
```
Brand Blue:      #0066CC  (Primary action, buttons)
Brand Blue Dark: #004C99  (Pressed state)
Brand Blue Light:#E6F0FF  (Background accents)
```

#### Secondary Colors
```
Success Green:   #28A745  (Pass, correct answers, profit)
Warning Orange:   #FD7E14  (Cooldowns, warnings)
Error Red:       #DC3545  (Fail, errors, loss)
Info Blue:       #17A2B8  (Information)
```

#### Neutral Colors
```
Black:           #212529  (Primary text)
Dark Gray:       #495057  (Secondary text)
Medium Gray:     #6C757D  (Disabled text, borders)
Light Gray:      #ADB5BD  (Placeholder text)
White:           #FFFFFF  (Backgrounds)
Off White:       #F8F9FA  (Section backgrounds)
```

#### Dark Mode Colors
```
Background:      #121212
Surface:         #1E1E1E
Primary Text:    #E0E0E0
Secondary Text:  #B0B0B0
Borders:         #333333
```

### Typography

#### Font Family
- Primary: **Inter** or **Roboto** (system fonts preferred for performance)
- Kinyarwanda: Use same font (supports Latin Extended)

#### Font Sizes
```
H1 (Page Title):        24px, Bold, 28px line-height
H2 (Section Title):     20px, Semibold, 24px line-height
H3 (Card Title):        18px, Semibold, 22px line-height
Body (Primary):         16px, Regular, 22px line-height
Body (Secondary):       14px, Regular, 20px line-height
Caption (Small):        12px, Regular, 16px line-height
Button Text:            16px, Semibold, 20px line-height
```

#### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing Scale
```
4px   - Icon padding, tiny gaps
8px   - Small gaps, button padding
12px  - Medium gaps
16px  - Standard spacing between elements
24px  - Section spacing
32px  - Large section spacing
48px  - Page margins
```

### Border Radius
```
4px   - Small elements (tags, badges)
8px   - Buttons, cards
12px  - Large cards, modals
16px  - Full-screen modals
```

### Shadows
```
Subtle:    0 2px 4px rgba(0,0,0,0.1)
Medium:    0 4px 8px rgba(0,0,0,0.12)
Strong:    0 8px 16px rgba(0,0,0,0.15)
```

### Icons
- Use **Material Icons** or **Feather Icons** (lightweight)
- Size: 20px (standard), 24px (large), 16px (small)
- Color: Match text color or use brand colors

### Touch Targets
- Minimum: 44px × 44px
- Recommended: 48px × 48px for primary actions

### Motion/Animation
- Keep animations minimal for data-saver mode
- Duration: 200-300ms for transitions
- Easing: ease-out
- Disable animations in data-saver mode

---

## 🌐 LANGUAGE SWITCH

### Language Switch Component
**Position**: Top-right of every screen (except onboarding)

```
┌──────────────────────────────────────┐
│ [Back]      Page Title        [EN▼]  │
└──────────────────────────────────────┘
```

**Behavior**:
- Tap to toggle between EN and RW
- Persists user preference
- Shows current language in uppercase
- Dropdown: English, Kinyarwanda

---

## 👤 USER FLOWS

### Flow 1: Onboarding & Signup

```
┌─────────────────────────────────────────────────────────────┐
│ ONBOARDING FLOW                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Welcome Screen                                            │
│    - App logo + tagline                                     │
│    - "Learn to trade safely"                               │
│    - "Practice with virtual money"                         │
│    - [Get Started] button                                   │
│                                                             │
│ 2. Value Proposition (3 screens swipeable)                 │
│    a. "Practice First"                                      │
│       - Icon: Sandbox/shield                                │
│       - "No real money risk"                                │
│    b. "Learn at Your Pace"                                  │
│       - Icon: Book/clock                                    │
│       - "6 levels from beginner to advanced"               │
│    c. "AI Coach"                                            │
│       - Icon: Robot/brain                                   │
│       - "Personal feedback on your trades"                  │
│                                                             │
│ 3. Skill Placement                                          │
│    - "Choose your starting level"                          │
│    - Options: [Level 0] [Level 1] [Take Placement Test]    │
│                                                             │
│ 4. Phone Number Input                                       │
│    - "Enter your phone number"                              │
│    - Country code: +250 (Rwanda) - preselected              │
│    - Phone input field                                      │
│    - [Send OTP] button                                      │
│    - Disclaimer: "Must be 18 or older"                      │
│                                                             │
│ 5. OTP Verification                                         │
│    - "Enter the code sent to +250788..."                   │
│    - 6-digit input fields                                   │
│    - Timer: "Resend in 30s"                                 │
│    - [Verify] button                                        │
│                                                             │
│ 6. Language Preference                                      │
│    - "Choose your preferred language"                       │
│    - [English] [Kinyarwanda] (large cards)                 │
│                                                             │
│ 7. Dashboard (first time)                                  │
│    - Welcome message                                        │
│    - "Start Level 0" card                                   │
│    - Progress: 0/6 levels                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 2: Lesson Completion

```
┌─────────────────────────────────────────────────────────────┐
│ LESSON COMPLETION FLOW                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Level Dashboard                                          │
│    - Level title (e.g., "Level 0 - Introduction")           │
│    - Progress bar (1/3 lessons)                             │
│    - Lesson list:                                           │
│      ✓ L0.01 - What is Trading?                             │
│      → L0.02 - Why We Practice                              │
│      ○ L0.03 - How to Spot Scams                            │
│    - [Continue] button on current lesson                    │
│                                                             │
│ 2. Lesson Screen                                            │
│    - Back button + Lesson title                             │
│    - Language switch [EN▼]                                  │
│    - Progress: 1/4 (text → animation → quiz → try it)      │
│    - Content section (≤200 words)                           │
│    - Animation/diagram                                      │
│    - Glossary terms highlighted                             │
│    - [Next] button                                          │
│                                                             │
│ 3. Mini Quiz (3 questions)                                  │
│    - Question text                                          │
│    - 4 options (radio buttons)                              │
│    - [Submit] button                                        │
│    - Instant feedback: ✓ Correct / ✗ Wrong + explanation   │
│    - [Next Question] button                                 │
│                                                             │
│ 4. Try It (Simulator) - EXCEPT L0                           │
│    - "Open the simulator and try this task"                │
│    - Task description                                       │
│    - [Open Simulator] button                                │
│    - Simulator launches with task overlay                  │
│                                                             │
│ 5. Lesson Complete                                          │
│    - ✓ Celebration animation                                │
│    - "Lesson Complete!"                                     │
│    - XP earned: +50 XP                                      │
│    - [Continue to Next Lesson] button                      │
│    - [Back to Level Dashboard] link                         │
│                                                             │
│ 6. Level Complete (all lessons done)                        │
│    - "Level 0 Complete!"                                    │
│    - Certificate preview                                    │
│    - "Take the Level 0 Exam to unlock Level 1"              │
│    - [Take Exam] button                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 3: Exam Flow

```
┌─────────────────────────────────────────────────────────────┐
│ EXAM FLOW                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Exam Start Screen                                         │
│    - "Level 0 Exam"                                         │
│    - Icon: Certificate/exam                                 │
│    - Parts:                                                 │
│      ✓ Part 1: MCQ (20 questions, 15 min)                   │
│      ○ Part 2: Practical (3 tasks, 30 min)                  │
│    - Pass mark: 70%                                         │
│    - Attempts remaining: 3/3                                 │
│    - Cooldown: 24 hours if failed                           │
│    - [Start Part 1] button                                  │
│                                                             │
│ 2. MCQ Exam (20 questions)                                  │
│    - Timer: 14:59 (top right)                               │
│    - Progress: 1/20                                         │
│    - Question text                                          │
│    - 4 options (radio buttons)                              │
│    - [Next] button (enabled after selection)                │
│    - No back navigation (anti-cheat)                        │
│                                                             │
│ 3. MCQ Complete                                             │
│    - "Part 1 Complete!"                                     │
│    - Score: 16/20 (80%)                                     │
│    - [Review Answers] button                                │
│    - [Start Part 2] button                                  │
│                                                             │
│ 4. MCQ Review (optional)                                    │
│    - Question 1: ✓ Correct                                   │
│    - Question 2: ✗ Wrong - Correct answer: A               │
│    - Explanation: [Why it's correct]                        │
│    - Mini-lesson link: "Learn more about pips"              │
│                                                             │
│ 5. Practical Exam Start                                     │
│    - "Part 2: Practical Exam"                               │
│    - Task 1/3: "Buy EUR/USD with 0.01 lots..."              │
│    - Time limit: 30 min                                     │
│    - [Open Simulator] button                                │
│                                                             │
│ 6. Practical Task in Simulator                               │
│    - Simulator with task overlay                            │
│    - Task instructions visible                              │
│    - [Submit Task] button when done                         │
│    - Auto-check against rubric                              │
│                                                             │
│ 7. Practical Task Feedback                                  │
│    - "Task 1 Score: 85%"                                    │
│    - ✓ Lot size correct                                     │
│    - ✓ Stop loss set                                        │
│    - ✗ Risk too high (was 3%, should be ≤2%)                │
│    - [Next Task] button                                     │
│                                                             │
│ 8. Exam Complete                                            │
│    - Overall Score: 78%                                     │
│    - MCQ: 80% | Practical: 75%                               │
│    - ✓ PASSED!                                              │
│    - "Level 1 Unlocked"                                     │
│    - Certificate earned                                    │
│    - [View Certificate] button                              │
│    - [Continue to Level 1] button                           │
│                                                             │
│ 9. Exam Failed                                             │
│    - Overall Score: 55%                                     │
│    - ✗ FAILED                                               │
│    - "You need 70% to pass"                                 │
│    - Attempts remaining: 2/3                                 │
│    - Cooldown: Try again in 24 hours                        │
│    - [Review Mistakes] button                               │
│    - [Back to Dashboard] button                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 4: Simulator

```
┌─────────────────────────────────────────────────────────────┐
│ SIMULATOR FLOW                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Simulator Launch                                         │
│    - Full-screen chart (TradingView Lightweight)             │
│    - Top bar:                                               │
│      - Pair selector: [XAU/USD ▼]                           │
│      - Timeframe: [M1 M5 M15 H1 H4 D1]                      │
│      - Language switch [EN▼]                               │
│      - [Exit] button                                        │
│                                                             │
│ 2. Chart Area                                               │
│    - Candlestick chart                                      │
│    - Crosshair with price info                              │
│    - Indicators toggle (MA, RSI, S/R)                       │
│    - Drawing tools (trend lines, S/R)                        │
│                                                             │
│ 3. Order Panel (bottom sheet)                               │
│    - Buy/Sell tabs (green/red)                              │
│    - Order type: [Market ▼] [Limit] [Stop]                  │
│    - Lot size: [0.01] [-] [+]                              │
│    - Risk: shows % of account                               │
│    - SL/TP: [Set Stop Loss] [Set Take Profit]              │
│    - R:R ratio display                                      │
│    - [Place Order] button                                   │
│                                                             │
│ 4. Open Orders Panel (slide-up)                              │
│    - List of open positions                                 │
│    - Each shows: pair, type, lots, entry, P&L              │
│    - Tap to modify/close                                     │
│    - [Close All] button                                     │
│                                                             │
│ 5. Position Detail (tap on order)                           │
│    - Full order details                                     │
│    - Drag SL/TP lines on chart                              │
│    - [Modify] [Close] [Partial Close] buttons               │
│    - Journal entry: "Why did you take this trade?"          │
│    - [Save Journal] button                                  │
│                                                             │
│ 6. Account Info (top-right tap)                             │
│    - Balance: $8,450.00                                     │
│    - Equity: $8,520.00                                      │
│    - Margin: $245.00                                         │
│    - Free Margin: $8,275.00                                 │
│    - Open P&L: +$70.00                                      │
│                                                             │
│ 7. Trade History (tab)                                      │
│    - List of closed trades                                  │
│    - Each shows: pair, type, P&L, closed at                 │
│    - Filter by pair, date                                   │
│                                                             │
│ 8. Market Replay Mode                                       │
│    - Select dataset: [NFP Jan 2024 ▼]                       │
│    - Speed: [1x ▼] [5x] [Step]                              │
│    - Play/Pause controls                                    │
│    - Timeline scrubber                                      │
│    - Practice trading on historical data                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 5: AUXX Wallet

```
┌─────────────────────────────────────────────────────────────┐
│ AUXX WALLET FLOW                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Wallet Home                                              │
│    - Balance: 5,000 AUXX                                    │
│    - ≈ $25.00 USDT                                          │
│    - [Buy AUXX] button                                      │
│    - [Spend AUXX] button                                    │
│    - Recent transactions list                               │
│                                                             │
│ 2. Buy AUXX                                                 │
│    - "Purchase AUXX"                                        │
│    - Rate: 1,000 AUXX = $5.00 USDT                          │
│    - Amount to buy: [5,000] AUXX                           │
│    - Cost: $25.00 USDT                                      │
│    - Payment method: Crypto (USDT TRC-20)                   │
│    - [Continue to Payment] button                           │
│    - Disclaimer: "AUXX is for learning tools only"         │
│                                                             │
│ 3. Crypto Deposit                                           │
│    - Send $25.00 USDT to:                                   │
│    - QR code                                                │
│    - Wallet address: TR7NHqjeKQxGTCi8qJ...                  │
│    - Network: TRON TRC-20                                   │
│    - "Wait for 20 confirmations"                           │
│    - Timer: Confirming... (5/20)                            │
│    - [Check Status] button                                  │
│                                                             │
│ 4. Deposit Confirmation                                    │
│    - ✓ Deposit Confirmed!                                   │
│    - 5,000 AUXX added to your wallet                        │
│    - [Back to Wallet] button                                │
│                                                             │
│ 5. Spend AUXX                                               │
│    - "What would you like to spend AUXX on?"               │
│    - Cards:                                                 │
│      [Extra Sandbox Balance] $10 = 2,000 AUXX               │
│      [Extra Exam Attempt] $5 = 1,000 AUXX                   │
│      [Premium Lessons] $15 = 3,000 AUXX                     │
│      [AI Coach Pack] $10 = 2,000 AUXX                       │
│      [Certificate] $5 = 1,000 AUXX                           │
│    - Tap card to purchase                                   │
│                                                             │
│ 6. Lost-Funds Interception (if balance = 0)                │
│    - ⚠ "Your sandbox balance is $0"                          │
│    - "Before buying more, let's review your mistakes"       │
│    - [Free: Review Your Mistakes] lesson                    │
│    - Button disabled for 24h: [Buy AUXX]                     │
│    - Daily free reset: 2,000 AUXX available                 │
│    - [Claim Daily Reset] button                             │
│                                                             │
│ 7. Transaction History                                      │
│    - List of all AUXX transactions                          │
│    - Type: Purchase/Spend/Refill/Bonus                     │
│    - Amount, date, reference                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 6: AI Coach

```
┌─────────────────────────────────────────────────────────────┐
│ AI COACH FLOW                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. AI Coach Home                                            │
│    - "Your AI Coach"                                        │
│    - Readiness Score: 68/100                               │
│    - "Keep practicing to reach 70"                          │
│    - Calls remaining: 18/20 today                           │
│    - Options:                                              │
│      [Explain a Lesson]                                     │
│      [Review My Trade]                                      │
│      [Get Study Plan]                                       │
│      [Ask a Question]                                       │
│                                                             │
│ 2. Explain a Lesson                                        │
│    - "Which lesson would you like explained?"               │
│    - Level dropdown: [Level 1 ▼]                            │
│    - Lesson dropdown: [L1.03 - What is a Pip? ▼]            │
│    - [Explain] button                                       │
│    - AI response: "A pip is the smallest price move..."    │
│    - Tag: "Educational only - not financial advice"        │
│    - [Ask Follow-up] [New Question] buttons                 │
│                                                             │
│ 3. Review My Trade                                          │
│    - "Select a trade to review"                             │
│    - List of recent trades with P&L                         │
│    - Tap trade                                              │
│    - AI response: "Good risk management at 1%..."          │
│    - Suggestions for improvement                           │
│    - [Ask Follow-up] [New Question] buttons                 │
│                                                             │
│ 4. Get Study Plan                                           │
│    - AI analyzes weak areas                                 │
│    - "Based on your performance, focus on:"                 │
│    - - Risk management (you often risk >2%)                 │
│    - - Support/Resistance drawing                           │
│    - Weekly plan:                                           │
│      - Monday: Review L1.03                                 │
│      - Tuesday: Practice SL/TP on simulator                │
│      - Wednesday: Take L1 quiz                              │
│    - [Save Plan] [Adjust Plan] buttons                      │
│                                                             │
│ 5. Ask a Question                                           │
│    - Chat interface                                         │
│    - User: "Should I buy gold now?"                        │
│    - AI: "I cannot give specific trading advice..."         │
│    - AI: "Here's a lesson on how to decide entry points"    │
│    - [Link to lesson]                                       │
│    - Disclaimer always visible                              │
│                                                             │
│ 6. Cost Limit Reached                                       │
│    - "You've used all 20 AI calls today"                    │
│    - "Come back tomorrow for more"                          │
│    - Resets at midnight                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 WIREFRAMES (20 Screens)

### Screen 1: Welcome (Onboarding)
```
┌──────────────────────────────────────┐
│                                      │
│         [LOGO: Isoko Academy]        │
│                                      │
│      Learn to Trade Safely           │
│                                      │
│    Practice with Virtual Money       │
│    Never Risk Real Funds            │
│                                      │
│                                      │
│         [Get Started]                │
│                                      │
│          ✓ I'm 18 or older           │
│                                      │
└──────────────────────────────────────┘
```

### Screen 2: Value Prop 1
```
┌──────────────────────────────────────┐
│              [Back]          [Skip]  │
│                                      │
│         [ICON: Shield]               │
│                                      │
│         Practice First               │
│                                      │
│  Learn with a sandbox simulator     │
│  No real money risk at all          │
│                                      │
│    ● ○ ○ (pagination dots)          │
│                                      │
│           [Next]                     │
│                                      │
└──────────────────────────────────────┘
```

### Screen 3: Value Prop 2
```
┌──────────────────────────────────────┐
│              [Back]          [Skip]  │
│                                      │
│        [ICON: Book + Clock]          │
│                                      │
│        Learn at Your Pace            │
│                                      │
│  6 levels from beginner to          │
│  advanced, at your own speed         │
│                                      │
│    ○ ● ○ (pagination dots)          │
│                                      │
│           [Next]                     │
│                                      │
└──────────────────────────────────────┘
```

### Screen 4: Value Prop 3
```
┌──────────────────────────────────────┐
│              [Back]          [Skip]  │
│                                      │
│        [ICON: Robot/Brain]           │
│                                      │
│          AI Coach                    │
│                                      │
│  Get personal feedback on           │
│  your practice trades               │
│                                      │
│    ○ ○ ● (pagination dots)          │
│                                      │
│           [Next]                     │
│                                      │
└──────────────────────────────────────┘
```

### Screen 5: Skill Placement
```
┌──────────────────────────────────────┐
│           [Back]            [EN▼]     │
│                                      │
│     Choose Your Starting Level       │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Level 0                     │  │
│  │  Introduction to Trading     │  │
│  │  For complete beginners      │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Level 1                     │  │
│  │  Basics of FOREX & Gold      │  │
│  │  If you know what trading is │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Take Placement Test         │  │
│  │  10-minute assessment       │  │
│  └──────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### Screen 6: Phone Input
```
┌──────────────────────────────────────┐
│           [Back]            [EN▼]     │
│                                      │
│      Enter Your Phone Number         │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ 🇷🇼 +250 [___________]       │  │
│  └──────────────────────────────┘  │
│                                      │
│  We'll send a verification code     │
│                                      │
│           [Send OTP]                 │
│                                      │
│  Must be 18 or older to use         │
│  Isoko Academy                      │
│                                      │
└──────────────────────────────────────┘
```

### Screen 7: OTP Verification
```
┌──────────────────────────────────────┐
│           [Back]            [EN▼]     │
│                                      │
│   Enter the code sent to             │
│   +250 788 123 456                   │
│                                      │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│  │  │ │  │ │  │ │  │ │  │ │  │   │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘   │
│                                      │
│         Resend in 30s                │
│                                      │
│           [Verify]                   │
│                                      │
└──────────────────────────────────────┘
```

### Screen 8: Language Preference
```
┌──────────────────────────────────────┐
│           [Back]            [EN▼]     │
│                                      │
│   Choose Your Preferred Language     │
│                                      │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │         English              │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │      Kinyarwanda             │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### Screen 9: Dashboard (Home)
```
┌──────────────────────────────────────┐
│  [Menu]     Dashboard        [EN▼]  │
├──────────────────────────────────────┤
│                                      │
│  Welcome, John!                      │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ Level 0: Introduction       │  │
│  │ Progress: 1/3 lessons        │  │
│  │ ████████░░░░░░░░░░░ 33%      │  │
│  │           [Continue]         │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ Level 1: Basics              │  │
│  │ 🔒 Locked                    │  │
│  │ Complete Level 0 to unlock   │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ Readiness Score: 45/100      │  │
│  │ Keep practicing!             │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ Sandbox Balance: $8,450      │  │
│  │ AUXX Wallet: 5,000           │  │
│  └──────────────────────────────┘  │
│                                      │
│  [Simulator]  [AI Coach]  [Profile] │
│                                      │
└──────────────────────────────────────┘
```

### Screen 10: Level Dashboard
```
┌──────────────────────────────────────┐
│  [Back]  Level 0        [EN▼]       │
├──────────────────────────────────────┤
│  Introduction to Trading             │
│                                      │
│  Progress: 1/3 lessons               │
│  ████████░░░░░░░░░░░ 33%             │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ ✓ L0.01 What is Trading?    │  │
│  │    Completed  • 50 XP        │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ → L0.02 Why We Practice      │  │
│  │    [Continue]                │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ ○ L0.03 How to Spot Scams    │  │
│  │    Locked                    │  │
│  └──────────────────────────────┘  │
│                                      │
│  All lessons complete → Take Exam   │
│                                      │
└──────────────────────────────────────┘
```

### Screen 11: Lesson Content
```
┌──────────────────────────────────────┐
│ [Back]  L0.02 Why We Practice[EN▼]  │
├──────────────────────────────────────┤
│  Progress: 1/4  ●○○○                 │
│                                      │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │    [ANIMATION:               │  │
│  │     Real vs Sandbox]         │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                      │
│  Many people lose money because     │
│  they start with real money         │
│  before learning. In Isoko           │
│  Academy, you'll use a              │
│  <Term>sandbox</Term> account...    │
│                                      │
│  This way, you can make             │
│  mistakes and learn without         │
│  losing real money.                 │
│                                      │
│                                      │
│           [Next]                     │
│                                      │
└──────────────────────────────────────┘
```

### Screen 12: Mini Quiz
```
┌──────────────────────────────────────┐
│ [Back]  Quiz 1/3          [EN▼]     │
├──────────────────────────────────────┤
│  Progress: 2/4  ●●○○                 │
│                                      │
│  What is a sandbox account?          │
│                                      │
│  ○ A real bank account               │
│  ● A practice account with virtual  │
│    money                             │
│  ○ A gambling account                │
│  ○ A savings account                 │
│                                      │
│                                      │
│           [Submit]                    │
│                                      │
└──────────────────────────────────────┘
```

### Screen 13: Quiz Feedback
```
┌──────────────────────────────────────┐
│ [Back]  Quiz 1/3          [EN▼]     │
├──────────────────────────────────────┤
│  Progress: 2/4  ●●○○                 │
│                                      │
│  ✓ Correct!                          │
│                                      │
│  A sandbox account is for practice   │
│  only and uses virtual money, not    │
│  real money.                         │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ 💡 Learn More:               │  │
│  │ Why sandbox practice is      │  │
│  │ important for risk management│  │
│  └──────────────────────────────┘  │
│                                      │
│           [Next Question]            │
│                                      │
└──────────────────────────────────────┘
```

### Screen 14: Simulator
```
┌──────────────────────────────────────┐
│ [XAU/USD▼] [M1 M5 M15 H1] [EN▼][Exit]│
├──────────────────────────────────────┤
│                                      │
│      [CANDLESTICK CHART]             │
│      (TradingView Lightweight)       │
│                                      │
│      Price: 1,850.50                 │
│      Change: +2.30 (+0.12%)          │
│                                      │
├──────────────────────────────────────┤
│ [Buy|Sell] [Market▼] [0.01][-][+]   │
│ Risk: 1% of account                  │
│ [Set SL] [Set TP]  R:R 1:2           │
│           [Place Order]              │
│                                      │
│ [$8,450] [Equity:$8,520] [Orders ▲] │
└──────────────────────────────────────┘
```

### Screen 15: Open Orders
```
┌──────────────────────────────────────┐
│       Open Orders (2)          [↓]   │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │ XAU/USD  Buy  0.01 lots       │  │
│  │ Entry: 1,848.00              │  │
│  │ SL: 1,845.00  TP: 1,854.00   │  │
│  │ P&L: +$25.00 ✓               │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ EUR/USD  Sell  0.01 lots     │  │
│  │ Entry: 1.1000               │  │
│  │ SL: 1.1020  TP: 1.0960      │  │
│  │ P&L: -$12.00 ✗              │  │
│  └──────────────────────────────┘  │
│                                      │
│              [Close All]             │
│                                      │
└──────────────────────────────────────┘
```

### Screen 16: Exam Start
```
┌──────────────────────────────────────┐
│  [Back]  Level 0 Exam      [EN▼]     │
├──────────────────────────────────────┤
│                                      │
│         [📜 CERTIFICATE ICON]         │
│                                      │
│  Level 0 Exam                        │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ ✓ Part 1: MCQ                │  │
│  │    20 questions, 15 minutes   │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ ○ Part 2: Practical          │  │
│  │    3 tasks, 30 minutes        │  │
│  └──────────────────────────────┘  │
│                                      │
│  Pass mark: 70%                     │
│  Attempts remaining: 3/3             │
│  Cooldown: 24 hours if failed       │
│                                      │
│        [Start Part 1]               │
│                                      │
└──────────────────────────────────────┘
```

### Screen 17: MCQ Exam
```
┌──────────────────────────────────────┐
│  Question 1/20          14:59 [EN▼]  │
├──────────────────────────────────────┤
│  Progress: ░░░░░░░░░░░░░░░░░░░░ 5%    │
│                                      │
│  What does FOREX mean?               │
│                                      │
│  ○ Fast exchange                     │
│  ● Foreign exchange                 │
│  ○ Foreign market                    │
│  ○ Future trading                    │
│                                      │
│                                      │
│           [Next]                     │
│                                      │
└──────────────────────────────────────┘
```

### Screen 18: AUXX Wallet
```
┌──────────────────────────────────────┐
│  [Back]  AUXX Wallet        [EN▼]   │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │       5,000 AUXX             │  │
│  │    ≈ $25.00 USDT             │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────┐  ┌──────────┐       │
│  │ Buy AUXX │  │Spend AUXX│       │
│  └──────────┘  └──────────┘       │
│                                      │
│  Recent Transactions                 │
│  ─────────────────────              │
│  • Purchase +5,000 AUXX  Today      │
│  • Spend -1,000 AUXX    Yesterday  │
│  • Bonus +500 AUXX      2 days ago │
│                                      │
│  [View All Transactions]            │
│                                      │
└──────────────────────────────────────┘
```

### Screen 19: AI Coach
```
┌──────────────────────────────────────┐
│  [Back]  AI Coach           [EN▼]   │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │    Readiness Score: 68/100   │  │
│  │    Keep practicing!          │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                      │
│  Calls remaining: 18/20 today        │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ 📖 Explain a Lesson          │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ 📊 Review My Trade           │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ 📅 Get Study Plan            │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ ❓ Ask a Question            │  │
│  └──────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

### Screen 20: Profile
```
┌──────────────────────────────────────┐
│  [Back]  Profile            [EN▼]   │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐  │
│  │        [USER AVATAR]         │  │
│  │                              │  │
│  │  John Doe                    │  │
│  │  +250 788 123 456            │  │
│  └──────────────────────────────┘  │
│                                      │
│  Level: L2 (3/6 complete)            │
│  XP: 1,250                          │
│  Streak: 7 days 🔥                   │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ My Certificates              │  │
│  │ • Level 0 ✓                  │  │
│  │ • Level 1 ✓                  │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ Settings                     │  │
│  │ • Language                   │  │
│  │ • Notifications              │  │
│  │ • Data Saver Mode            │  │
│  │ • Dark Mode                  │  │
│  └──────────────────────────────┘  │
│                                      │
│  [Log Out]                          │
│                                      │
└──────────────────────────────────────┘
```

---

## 🔲 COMPONENTS

### Term Component (Glossary Pop-up)
```typescript
<Term term="pip">pip</Term>
```
- Renders term with underline/dotted style
- Tap opens modal with definition
- Shows definition in current language (EN/RW)
- "Learn more" link to related lesson

### Language Switch
- Top-right position
- Badge-style dropdown
- Shows current language code (EN/RW)
- Persists preference

### Progress Bar
- Horizontal bar with percentage
- Color-coded: green (complete), blue (in progress), gray (locked)
- Animated fill

### Badge
- Small rounded tag
- Colors: success (green), warning (orange), error (red), info (blue)
- Uses: status, skill level, notification count

### Card
- Rounded container (8px border radius)
- Subtle shadow
- White/off-white background
- Used for: lessons, features, stats

### Bottom Sheet
- Slides up from bottom
- Used for: order panel, open orders, filters
- Drag handle at top
- Dismiss on tap outside

### Modal
- Full-screen or centered
- Overlay with backdrop blur
- Used for: exams, confirmations, forms

---

## 📐 LAYOUT SYSTEM

### Grid System
- 4-column grid for content
- 8px gutters
- Responsive: 2 columns on small screens

### Container Padding
- Mobile: 16px sides
- Tablet: 24px sides
- Desktop: 32px sides

### Header Height
- Mobile: 56px
- Standard: 64px

### Bottom Navigation Height
- Mobile: 56px

---

## ♿ ACCESSIBILITY

### Touch Targets
- Minimum: 44px × 44px
- Recommended: 48px × 48px

### Text Contrast
- WCAG AA compliant (4.5:1 for normal text)
- WCAG AAA compliant (7:1 for large text)

### Screen Reader Support
- All images have alt text
- Buttons have descriptive labels
- Form fields have labels
- Focus indicators visible

### Color Blindness
- Don't rely on color alone
- Use icons + text
- Patterns for charts (not just colors)

---

## 🌙 DARK MODE

### Theme Toggle
- In Settings
- Manual toggle
- Follow system preference option

### Dark Mode Colors
- Background: #121212
- Surface: #1E1E1E
- Primary text: #E0E0E0
- Secondary text: #B0B0B0
- Borders: #333333

### Automatic Switching
- Respect system setting
- Smooth transition (300ms)

---

## 📊 DATA-SAVER MODE

### Features to Disable
- Animations
- Auto-play videos
- High-res images
- Background sync

### Features to Keep
- Essential images (compressed)
- Text content
- Core functionality

### User Control
- Toggle in Settings
- On by default for 3G detection
- Show data usage indicator

---

## 🎯 USABILITY TESTING CHECKLIST

### Task 1: Sign Up
- [ ] User can complete onboarding in <5 minutes
- [ ] User understands sandbox vs real money
- [ ] User successfully verifies phone number

### Task 2: Complete a Lesson
- [ ] User can navigate to lesson
- [ ] User completes quiz successfully
- [ ] User understands glossary terms

### Task 3: Place a Stop-Loss Order
- [ ] User opens simulator
- [ ] User places order with SL
- [ ] User drags SL line on chart
- [ ] User understands P&L display

### Task 4: Take an Exam
- [ ] User starts MCQ exam
- [ ] User completes all questions
- [ ] User reviews mistakes
- [ ] User takes practical exam

### Success Criteria
- 8/10 users complete Task 3 (stop-loss) without help
- <10% drop-off during onboarding
- Average task completion time <3 minutes

---

## 📦 DELIVERABLES FOR STAGE 1

### Required
1. ✅ User flow diagrams (this document)
2. ✅ 20 wireframes (this document)
3. ✅ Style guide (this document)
4. ⏳ Figma prototype (designer to create)
5. ⏳ Usability test report (designer to conduct)

### Figma Prototype Requirements
- Clickable prototype
- All 20 screens
- EN and RW versions
- Interactive language switch
- Simulator chart placeholder
- Dark mode variant
- Data-saver mode variant

### Usability Test Requirements
- 5-10 Rwandan learners
- Test tasks: sign up, complete lesson, place stop-loss
- Record: completion rate, time, errors, feedback
- Report: findings, recommendations, iterations

---

## 🔄 NEXT STEPS

### For Designer
1. Create Figma file with style guide
2. Build all 20 screens as wireframes
3. Create interactive prototype
4. Conduct usability testing in Rwanda
5. Iterate based on feedback
6. Export assets for developers

### For Developer
1. Review this design spec
2. Set up component library
3. Implement design tokens (colors, typography, spacing)
4. Build reusable components
5. Wait for Stage 0 legal approval
6. Begin Stage 2 (Foundation)

---

## 📝 NOTES

- All screens must have EN/RW language switch
- Glossary terms must use `<Term>` component
- Disclaimers must be visible on AUXX purchase screens
- Sandbox nature must be clear on all money-related screens
- Dark mode and data-saver mode must be designed
- All touch targets ≥44px
- All text ≥16px body, ≥20px for headings

---

**End of Stage 1 Design Specification**
