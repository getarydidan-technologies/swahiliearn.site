# SWAHILI EARN - Master System Prompt & Technical Specification

> **Project Name:** SWAHILI EARN  
> **Tagline:** Lipwa kwa kufundisha wazungu kiswahili na ulipwe (Earn rewards practicing conversational Swahili)  
> **Target Audience:** Swahili speakers across East Africa (Tanzania, Kenya, Uganda, DRC, Rwanda, Burundi) practicing language exchange with foreign learners.  
> **Primary Currency & Region:** Tanzanian Shilling (TZS), East African Mobile Money networks (M-Pesa, Tigo Pesa, Airtel Money, Halopesa).  
> **Official Support WhatsApp Link:** `https://wa.me/message/EP72QM4VJRTIA1`  
> **Sponsor:** ONLINEPAY DIGITAL PLATFORM  

---

## 1. Project Purpose & High-Level Architecture

SWAHILI EARN is a conversational language-learning and micro-reward web application. Native Swahili speakers earn guaranteed rewards per minute by conversing with simulated and actual international learners (tourists, researchers, doctors, exchange students).

The platform features:
- **Client Application:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + PWA offline support.
- **Backend API:** Full-stack Express server (`server.ts`) with PostgreSQL/pg-mem in-memory fallback, JWT authentication, and Gemini AI-powered multilingual chat bots.
- **Firebase Integration:** Firestore database synchronization and Firebase Google Authentication.
- **Static Hosting Resilience:** Relative base paths (`base: './'`) and built-in client-side fallback profiles (`defaultProfiles.ts`) enabling deployment on GitHub Pages or static CDNs without a white blank page.

---

## 2. Core User Personas & Roles

1. **Native Speaker (User):**
   - Registers with Full Name, Phone Number, Password, and Region.
   - Enters active chat sessions with foreign learners (e.g., Eliza, Mark, Sarah, David).
   - Receives automatic second-by-second countdowns and reward disbursements into their digital wallet.
   - Submits mobile money withdrawal requests once their account is activated.

2. **Foreign Learner (Partner Bot/Profile):**
   - Realistic profiles with avatars, countries (USA, UK, Poland, Canada, Sweden), professions (Tourist, Doctor, College Student), and conversational objectives.
   - Converses in simple English mixed with beginner Swahili greetings and vocabulary questions.
   - Powered by `@google/genai` (Gemini 2.5 Flash) with fallback canned responses.

3. **System Administrator (Admin Portal):**
   - Protected by administrative security passcode (`8998admin`).
   - Manages foreign learner profiles (custom names, photos, country, chat rates, status).
   - Monitors user registrations, leads, real-time visitors, and withdrawal requests.
   - Approves or rejects mobile money payout requests and updates global contact links.

---

## 3. Key Pages & Features

### A. Homepage (`/src/pages/HomePage.tsx`)
- High-conversion hero banner with direct CTA buttons (*ANZA KUFUNDISHA SASA* / *INGIA KWENYE AKAUNTI*).
- Floating live WhatsApp customer care notification linking directly to `https://wa.me/message/EP72QM4VJRTIA1`.
- Real-time counter of active online chatters fluctuating between 9,850 and 15,000.
- Live ticker of verified payouts across East Africa (M-Pesa, Halopesa, Airtel Money, MTN MoMo).
- Comprehensive Swahili FAQ addressing legitimacy, payout guarantees, and registration steps.

### B. Foreign Learners Catalog (`/src/pages/DiscoverPage.tsx`)
- Filterable directory by country, profession, and status (e.g., *tourist*, *college student*, *doctor*).
- Displays fixed pay rates (e.g., 80,000 TZS per 10-minute session).
- Direct "ONGEA NAYE SASA" (Chat Now) navigation with instant session launch.

### C. Live Chat Interface (`/src/pages/ChatScreen.tsx`)
- Real-time conversational interface with countdown timer (default 10 minutes / 600 seconds).
- In-chat bilingual translation assistant (Swahili ↔ English).
- Live audio sound effects on incoming messages and milestone completions.
- Automatic session completion modal that instantly credits user balances upon timer expiration.

### D. Wallet & Withdrawals (`/src/pages/WalletPage.tsx` & `/src/pages/WithdrawalPage.tsx`)
- Real-time wallet tracking: Total Earned, Available Balance, Pending Balance, Total Withdrawn.
- Instant mobile money payout form (Vodacom M-Pesa, Tigo Pesa, Airtel Money, Halopesa).
- Account activation checkpoint with clear step-by-step instructions and customer care assistance via WhatsApp.

### E. Admin Portal (`/src/pages/AdminPage.tsx`)
- Passcode gate: `8998admin`.
- Comprehensive tabbed dashboard:
  - **Foreign Learners Management:** Add/edit profiles, upload avatar images directly from the local device without URL hosting, adjust chat rates, and assign status (*tourist*, *college student*, *doctor*).
  - **Leads & Visitors Monitor:** Real-time log of captured visitors, IP timestamps, and registration leads.
  - **Withdrawals Monitor:** Approve, reject, or inspect pending user withdrawal requests.
  - **System Settings:** Centralized management of contact numbers, WhatsApp URLs, social media links, and sponsorship banners.

---

## 4. Design & UI Specifications

- **Color Palette:**
  - Primary Brand Blue: `#0066FF` / Hover: `#0052CC`
  - Secondary Accent Amber/Orange: `#FF7A00` / `#F59E0B`
  - WhatsApp & Success Emerald: `#10B981` / `#059669`
  - Dark Theme Accents: `#0F172A` / `#1E293B` / `#020617`
  - Light Background: `#F8FAFC`
- **Typography:**
  - Headings & Body: `Plus Jakarta Sans`
  - Numbers, Balances, & Timers: `JetBrains Mono`
- **Mobile First:** Fully responsive design optimized for mobile viewports, PWA standalone display, and touch targets.

---

## 5. Deployment Guidelines

### Static Deployment (GitHub Pages):
1. Built with `base: './'` in `vite.config.ts`.
2. Static fallback dataset configured in `src/lib/defaultProfiles.ts` and `src/lib/api.ts` to prevent blank white screens when the backend server is absent.
3. Automated GitHub Actions workflow located at `.github/workflows/deploy-pages.yml`.

### Full-Stack Server Deployment (Cloud Run / Node.js):
1. Start command: `node server.ts` or `tsx server.ts`.
2. Default listening port: `3000` (or injected `PORT` environment variable).
3. Database initialized in `src/server/db.ts` with Postgres table migrations for `users`, `chat_profiles`, `chat_sessions`, `chat_messages`, `transactions`, `withdrawals`, and `admin_settings`.
