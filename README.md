# 🏛️ NorthFinance: Active CFO Operating System

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-v0.7x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-SDK%2053-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Enterprise-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey?style=for-the-badge)

**NorthFinance** is a high-performance, cross-platform financial ecosystem designed to transform wealth management from a "rear-view mirror" experience into a "predictive steering wheel."

It is a tri-lateral platform that connects **Members**, **CPAs**, and **Administrators** through a unified, secure infrastructure, creating a single source of truth for financial data.

---

## 🛡️ The 4 Titans (Core Moats)

The strategic foundation of NorthFinance rests on four core pillars that make it market-leading and defensible:

| Titan                            | Technical Focus                     | Marketable Benefit                                                                                                               |
| :------------------------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **1. Hyper-Secure Architecture** | RLS & Supabase Enterprise Standards | **Guaranteed Data Privacy:** Enterprise-grade security and row-level data isolation ensures every user's finances are private.   |
| **2. AI-Powered Automation**     | Gemini OCR & Smart Ledger           | **Zero-Friction Entry:** Eliminates manual data entry via receipt scanning and natural language processing.                      |
| **3. Professional Connectivity** | Cryptographic CPA Bridge            | **Seamless Advisory Access:** Enables secure collaboration with professionals, transforming tax prep from reactive to proactive. |
| **4. Omni-Platform UX**          | 60FPS Responsive Design             | **Uninterrupted Workflow:** High-performance experience that adapts perfectly from mobile phones to desktop sidebars.            |

---

## 🧠 The Intelligence Layer: `FinancialBrain`

The `FinancialBrain` is the coordinator for all data-driven insights. It is not just a chat interface; it is an **Active CFO** that integrates with our core services:

- **`transactionService.ts`**: Feeds live data for cash-flow trend analysis and anomaly detection.
- **`budgetService.ts`**: Provides "Safe-to-Spend" calculations and real-time health metrics.
- **`documentService.ts`**: Extracts data from OCR-scanned receipts for automated tax categorization.
- **`cpaService.ts`**: Manages the secure permission layer for professional audits.
- **`analysisService.ts`**: Performs heavy lifting for P&L summaries and multi-currency reporting.

---

## 🚀 Key Features

### 🏦 Core Banking & Finance

- **Dynamic Dashboard:** Real-time calculation of total balance and trends based on live history.
- **Smart Transactions:** Infinite-scrolling list with server-side filtering, optimized with `FlashList`.
- **Live Budgeting:** CRUD operations with real-time progress bars that update as you spend.

### 💼 Professional CPA Portal

- **Client Connection:** Dedicated workflows for users to request CPAs and for CPAs to manage clients.
- **The Vault:** Shared, encrypted storage where CPAs view client documents based on strict RLS policies.
- **Automated Auditing:** AI-pre-categorized transactions to save accountants hours of billable time.

### 🤖 AI & Automation

- **Gemini-Powered OCR:** Integrated camera workflow to scan receipts and auto-create transactions.
- **Financial Assistant:** Context-aware AI chat that queries live SQL data to answer specific financial questions.

---

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo SDK 53) + Expo Router v3 (File-based navigation).
- **Styling:** NativeWind (Tailwind CSS) + Reanimated for 60fps animations.
- **Language:** Strict-mode TypeScript.
- **Backend:** Supabase (PostgreSQL, Auth, Realtime).
- **Edge Functions:** Deno-based serverless functions for OCR and Admin tasks.
- **Security:** `expo-secure-store` for cryptographic keys and session hardening.

---

## 🏗️ Project Structure

The architecture follows a **Feature-First** and **Service-Layer** pattern.

```text
/src
├── app/                # Expo Router (File-based navigation)
│   ├── (auth)/         # Public Authentication screens
│   └── (main)/         # Protected Application routes
│       ├── admin/      # System Management & System Stats
│       ├── cpa/        # Professional Accounting tools
│       ├── finances/   # Budgets, Reports, Transactions
│       └── settings/   # Profile & Security settings
├── services/           # The Brains: Abstracted business logic
│   ├── aiService.ts
│   ├── budgetService.ts
│   └── transactionService.ts
├── shared/             # Reusable UI components & Contexts
├── types/              # Centralized TypeScript definitions
└── lib/                # Infrastructure (Supabase, Secure Storage)
```

```
## Security & Best Practices

Row Level Security (RLS): Every database query is restricted at the Postgres level.

RBAC Logic: UI and Navigation transform in real-time based on UserRoleEnum.

Secure Storage: Sensitive tokens never touch AsyncStorage; they are stored in hardware-encrypted storage.

Zero-Trust: Every AI interaction queries live data context to provide factual, data-driven insights.
```
