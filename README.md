# NorthFinance: Enterprise-Grade Financial Platform



![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey?style=for-the-badge)



**NorthFinance** is a comprehensive, cross-platform financial management application built for scale. It bridges the gap between personal finance tracking and professional accounting services using a secure, role-based architecture.



This application is **fully functional** and implements complex workflows including AI-powered OCR, real-time budgeting, and secure Client-CPA collaboration.



---



## 🚀 Key Features



### 🏦 Core Banking & Finance

* **Dynamic Dashboard:** Real-time calculation of total balance and financial trends based on live transaction history.

* **Smart Transactions:** Infinite-scrolling transaction list with server-side filtering and search, optimized with `FlashList` for high performance.

* **Live Budgeting:** Full CRUD operations for budgets with real-time progress bars that update automatically as transactions occur.

* **Quick Actions:** Instant fund transfers and peer-to-peer payments.



### 💼 Professional CPA Portal

* **Client Connection:** Dedicated workflows for users to request CPAs and for CPAs to accept clients (`find-cpa.tsx`).

* **Document Vault:** Shared, encrypted storage where CPAs can securely view client documents based on strict RLS policies.

* **Role-Based Dashboards:** Distinct UI experiences for **Members**, **Premium Members**, **CPAs**, and **Admins**.



### 🤖 AI & Automation

* **Gemini-Powered OCR:** Integrated camera workflow to scan receipts. The AI extracts merchant, date, and amount data to automatically create transactions.

* **AI Chat Assistance:** Context-aware financial assistant for user queries.



### 🔐 Enterprise Security

* **Row Level Security (RLS):** Database-level security ensuring users only access their own data.

* **Secure Storage:** Auth tokens and sensitive keys stored via `expo-secure-store`.

* **Session Hardening:** Automatic token refresh, deep-linking for password resets, and session expiry monitoring.



---



## 🛠️ Tech Stack



* **Framework:** React Native with Expo SDK 53 (Managed Workflow)

* **Language:** TypeScript (Strict Mode)

* **Navigation:** Expo Router v3 (File-based routing)

* **Styling:** NativeWind (Tailwind CSS)

* **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)

* **Edge Functions:** Deno-based serverless functions for OCR and Admin tasks

* **State/Data:** Custom Service Layer + React Context



---



## 🏗️ Architecture



The project follows a **Feature-First** and **Service-Layer** architecture. Business logic is abstracted into `services/` to keep UI components clean.



´´´

└── 📁NorthApp

    ├── 📁src

    │   ├── 📁app                 # Expo Router (File-based Navigation)

    │   │   ├── 📁(auth)          # Public Authentication Screens

    │   │   ├── 📁(main)          # Protected Application Routes

    │   │   │   ├── 📁admin       # User Management & System Stats

    │   │   │   ├── 📁cpa         # Professional Accounting Tools

    │   │   │   ├── 📁finances    # Budgets, Reports, Transactions

    │   │   │   ├── 📁messages    # Secure User-to-User Messaging

    │   │   │   ├── 📁settings    # User Profile & Security Settings

    │   │   │   ├── aiChat.tsx    # AI Assistant Interface

    │   │   │   ├── find-cpa.tsx  # Client-CPA Connection Logic

    │   │   │   ├── scan.tsx      # Camera & OCR Logic

    │   │   │   └── ...

    │   ├── 📁lib                 # Infrastructure (Supabase, Storage)

    │   ├── 📁services            # Business Logic Layer (The Brains)

    │   │   ├── budgetService.ts

    │   │   ├── cpaService.ts

    │   │   ├── dataService.ts

    │   │   ├── transactionService.ts

    │   │   └── ...

    │   ├── 📁shared              # Reusable UI & Contexts

    │   ├── 📁types               # Generated TypeScript Definitions

    │   └── ...

    ├── 📁supabase                # Backend Configuration

    │   ├── 📁functions           # Edge Functions (OCR, Admin tasks)

    │   └── 📁migrations          # SQL Database Schema

    └── 

´´´