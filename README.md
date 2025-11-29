# NorthFinance: Enterprise-Grade Financial Management

NorthFinance is a sophisticated, cross-platform financial application architected with **React Native** and **Expo**, backed by **Supabase**. Designed for scalability and security, it bridges the gap between personal wealth tracking and professional accounting needs.

Our core philosophy centers on **Data Ownership**, **Intelligent Automation**, and **Secure Collaboration**.

> **Current Version:** 1.0
> **Status:** Not ready

---

## 🚀 Key Features

### 📊 Interactive Financial Dashboard
* **Real-Time Analytics:** Visualizes cash flow, spending trends, and budget utilization using high-performance charts (`react-native-gifted-charts`).
* **Smart Insights:** Dynamic cards display net balance, monthly expenses, and active budget status at a glance.
* **Currency Aware:** Multi-currency support (USD, EUR, GBP, SEK, JPY) with instant global conversion updates.

### 🤖 AI-Powered Document Intelligence
* **OCR & Scanning:** Integrated camera module captures receipts and invoices.
* **Gemini AI Extraction:** Automatically extracts merchant, date, and amount data from images using Google's Gemini 1.5 Flash model via Edge Functions.
* **One-Tap Digitization:** Converts physical paper trails into digital transactions instantly.

### 📂 Comprehensive Document Hub
* **Secure Storage:** Encrypted storage for receipts, contracts, and tax documents.
* **Universal Upload:** Supports PDF and Image uploads from the device file system.
* **Data Portability:** One-click export of all financial records to CSV for external accounting software.

### 🔐 Robust Security & Admin Control
* **Row Level Security (RLS):** Strict database policies ensure users can only access their own data.
* **Role-Based Access Control (RBAC):** Granular roles (Member, Premium, CPA, Admin) determine feature visibility.
* **Admin Portal:** Dedicated interface for user management, banning/unbanning, and role assignment.

---

## 🛠️ Tech Stack

* **Frontend:** React Native, Expo Router (v3), NativeWind (Tailwind CSS)
* **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
* **AI Engine:** Supports Gemini API, OPENAI API. 
* **Charting:** React Native Gifted Charts
* **Security:** Expo SecureStore (local), RLS (cloud)

---

## 🏗️ Architecture

The project follows a modular, feature-first directory structure for maintainability: ´´´src/

├── app/                 # Expo Router pages (File-based routing)

│   ├── (auth)/          # Authentication screens (Login, Register)

│   └── (main)/          # Protected app screens

│       ├── finances/    # Budgeting & Reporting modules

│       ├── admin/       # Administration panels

│       ├── settings/    # User configuration & AI Keys

│       └── documents/   # Document management & Scanning

├── services/            # Backend logic (DataService, AIService)

├── shared/              # Reusable UI components & Contexts

└── lib/                # Core infrastructure (Supabase client)
´´´


## ⚡ Getting Started

1.  **Clone & Install**
    ```bash
    git clone [https://github.com/your-repo/northfinance.git](https://github.com/AlexBuildsLTS/northfinance.git)
    cd northfinance
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

3.  **Run the App**
    ```bash
    npx expo start -c
    ```

---