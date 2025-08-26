# NorthFinance: Professional Financial Management

NorthFinance is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. Built with React Native and Expo, it delivers a powerful, cross-platform experience on Android, iOS, and the web.

Our vision is to create an intuitive and powerful financial management platform with a polished user interface, inspired by the "Sigma" application's design principles, making robust financial tools accessible to everyone.

## Project-Structure

```
└── 📁FinanceNorthStarV5
    └── 📁.expo
    └── 📁.vscode
        ├── extensions.json
        ├── settings.json
    └── 📁src
        └── 📁app
            └── 📁(auth)
                ├── _layout.tsx
                ├── login.tsx
                ├── register.tsx
            └── 📁(tabs)
                └── 📁client
                    ├── [id].tsx
                └── 📁profile
                    └── 📁security
                        ├── _layout.tsx
                        ├── change-password.tsx
                        ├── index.tsx
                    ├── _layout.tsx
                    ├── api-keys.tsx
                    ├── edit.tsx
                    ├── index.tsx
                ├── _layout.tsx
                ├── accounts.tsx
                ├── ai-assistant.tsx
                ├── analytics.tsx
                ├── budgets.tsx
                ├── camera.tsx
                ├── clients.tsx
                ├── documents.tsx
                ├── index.tsx
                ├── journal.tsx
                ├── reports.tsx
                ├── settings.tsx
                ├── support.tsx
                ├── transactions.tsx
            └── 📁admin
                ├── _layout.tsx
                ├── index.tsx
                ├── manage-users.tsx
            └── 📁chat
                ├── _layout.tsx
                ├── [id].tsx
            └── 📁client-dashboard
                ├── [id].tsx
            ├── _layout.tsx
            ├── +not-found.tsx
            ├── client-support.tsx
            ├── index.tsx
            ├── messages.tsx
            ├── process-document.tsx
        └── 📁assets
            └── 📁fonts
                └── 📁components
                    └── 📁inter
                        └── 📁tests
                            ├── inter.test.tsx
                        ├── index.ts
                        ├── inter.css
                        ├── inter.stories.tsx
                        ├── inter.tsx
                    ├── index.ts
                ├── Inter
            └── 📁images
                ├── favicon.png
                ├── icon.png
                ├── splash.icon
                ├── splash.png
            └── 📁Inter
                └── 📁static
                    ├── Inter_18pt-Black.ttf
                    ├── Inter_18pt-BlackItalic.ttf
                    ├── Inter_18pt-Bold.ttf
                    ├── Inter_18pt-BoldItalic.ttf
                    ├── Inter_18pt-ExtraBold.ttf
                    ├── Inter_18pt-ExtraBoldItalic.ttf
                    ├── Inter_18pt-ExtraLight.ttf
                    ├── Inter_18pt-ExtraLightItalic.ttf
                    ├── Inter_18pt-Italic.ttf
                    ├── Inter_18pt-Light.ttf
                    ├── Inter_18pt-LightItalic.ttf
                    ├── Inter_18pt-Medium.ttf
                    ├── Inter_18pt-MediumItalic.ttf
                    ├── Inter_18pt-Regular.ttf
                    ├── Inter_18pt-SemiBold.ttf
                    ├── Inter_18pt-SemiBoldItalic.ttf
                    ├── Inter_18pt-Thin.ttf
                    ├── Inter_18pt-ThinItalic.ttf
                    ├── Inter_24pt-Black.ttf
                    ├── Inter_24pt-BlackItalic.ttf
                    ├── Inter_24pt-Bold.ttf
                    ├── Inter_24pt-BoldItalic.ttf
                    ├── Inter_24pt-ExtraBold.ttf
                    ├── Inter_24pt-ExtraBoldItalic.ttf
                    ├── Inter_24pt-ExtraLight.ttf
                    ├── Inter_24pt-ExtraLightItalic.ttf
                    ├── Inter_24pt-Italic.ttf
                    ├── Inter_24pt-Light.ttf
                    ├── Inter_24pt-LightItalic.ttf
                    ├── Inter_24pt-Medium.ttf
                    ├── Inter_24pt-MediumItalic.ttf
                    ├── Inter_24pt-Regular.ttf
                    ├── Inter_24pt-SemiBold.ttf
                    ├── Inter_24pt-SemiBoldItalic.ttf
                    ├── Inter_24pt-Thin.ttf
                    ├── Inter_24pt-ThinItalic.ttf
                    ├── Inter_28pt-Black.ttf
                    ├── Inter_28pt-BlackItalic.ttf
                    ├── Inter_28pt-Bold.ttf
                    ├── Inter_28pt-BoldItalic.ttf
                    ├── Inter_28pt-ExtraBold.ttf
                    ├── Inter_28pt-ExtraBoldItalic.ttf
                    ├── Inter_28pt-ExtraLight.ttf
                    ├── Inter_28pt-ExtraLightItalic.ttf
                    ├── Inter_28pt-Italic.ttf
                    ├── Inter_28pt-Light.ttf
                    ├── Inter_28pt-LightItalic.ttf
                    ├── Inter_28pt-Medium.ttf
                    ├── Inter_28pt-MediumItalic.ttf
                    ├── Inter_28pt-Regular.ttf
                    ├── Inter_28pt-SemiBold.ttf
                    ├── Inter_28pt-SemiBoldItalic.ttf
                    ├── Inter_28pt-Thin.ttf
                    ├── Inter_28pt-ThinItalic.ttf
                ├── Inter-Italic-VariableFont_opsz,wght.ttf
                ├── Inter-VariableFont_opsz,wght.ttf
                ├── OFL.txt
                ├── README.txt
        └── 📁components
            └── 📁admin
                ├── EditUserModal.tsx
            └── 📁common
                ├── AnimatedThemeIcon.tsx
                ├── Button.tsx
                ├── Card.tsx
                ├── index.ts
                ├── Modal.tsx
                ├── NotificationDropdown.tsx
                ├── PasswordStrengthIndicator.tsx
                ├── Toast.tsx
                ├── UserDropdown.tsx
            └── 📁dashboard
                ├── ChartSection.tsx
                ├── DashboardHeader.tsx
                ├── index.ts
                ├── MetricsGrid.tsx
                ├── QuickActions.tsx
                ├── RecentTransactions.tsx
            └── 📁forms
                ├── AddClientModal.tsx
                ├── AddTransactionModal.tsx
                ├── CreateBudgetModal.tsx
                ├── JournalEntryModal.tsx
            └── 📁reports
                ├── BalanceSheet.tsx
                ├── ProfitLossStatement.tsx
            ├── ScreenContainer.tsx
        └── 📁constants
            ├── navigationOptions.ts
        └── 📁context
            ├── AuthContext.tsx
            ├── ThemeProvider.tsx
            ├── ToastProvider.tsx
        └── 📁hooks
            ├── index.ts
            ├── useChartData.ts
            ├── useFrameworkReady.ts
            ├── useNotifications.ts
            ├── useProfile.ts
            ├── useTransactions.ts
        └── 📁lib
            ├── supabase.ts
        └── 📁services
            ├── accountingService.ts
            ├── adminService.ts
            ├── analyticsService.ts
            ├── budgetService.ts
            ├── chatService.ts
            ├── cpaService.ts
            ├── dataService.ts
            ├── documentService.ts
            ├── index.ts
            ├── notificationService.ts
            ├── profileService.ts
            ├── roleService.ts
            ├── settingsService.ts
            ├── transactionService.ts
            ├── userService.tsx
        └── 📁theme
            ├── colors.ts
        └── 📁types
            ├── accounting.ts
            ├── index.ts
        └── 📁utils
            ├── fileUtils.ts
    └── 📁supabase
        └── 📁.temp
            ├── cli-latest
            ├── gotrue-version
            ├── pooler-url
            ├── postgres-version
            ├── rest-version
        └── 📁functions
            └── 📁process-document
                ├── .npmrc
                ├── deno.json
                ├── deno.lock
                ├── index.ts
            ├── import_map.json
        └── 📁migrations
            ├── 20250823085012_plain_swamp.sql
            ├── 20250824132022_restless_sky.sql
        ├── .gitignore
    ├── .env.local
    ├── .gitignore
    ├── .hintrc
    ├── .npmrc
    ├── .prettierrc
    ├── app.json
    ├── babel.config.js
    ├── deno.json
    ├── eas.json
    ├── expo-env.d.ts
    ├── metro.config.js
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── tsconfig.json
```

## Vision & User Experience

We are committed to a refined user experience defined by clarity, elegance, and intuitive design.

#### **Visual Themes**

The application features two meticulously crafted visual themes, with a seamless, animated toggle (sun/moon icons) available on both the login screen and in the settings menu.

* **Light Theme:** Designed for clarity and focus in bright environments. It uses a soft, off-white (`#A5A2A5FF`) background to reduce eye strain, paired with crisp white (`#FFFFFF`) cards for content. Subtle shadows on these cards create a sense of depth and clear visual separation. A professional orange (`#BB4711FF`) serves as the primary accent for interactive elements.
* **Dark Theme:** Perfect for low-light conditions. It features a deep navy blue (`#0A192F`) background and a slightly lighter navy (`#172A45`) for surfaces and cards. A vibrant green (`#1DB954`) accent provides a modern, energetic contrast, while all text is rendered in pure white (`#FFFFFF`) or a light slate gray (`#8892B0`) for maximum readability.

#### **Interactive Data Visualization**

Data is brought to life through a suite of modern, interactive, and smoothly animated charts. The dashboard provides a comprehensive financial overview at a glance using a mix of visualizations:

* **Ring & Donut Charts:** Ideal for visualizing the composition of a portfolio, breaking down expense categories, or showing budget allocation.
* **Line Charts:** Perfectly suited for tracking trends over time, such as net worth growth, income vs. expenses, or account balances.
* **Bar Charts:** Used for direct comparisons, like comparing monthly spending, revenue streams, or performance across different periods.

All charts are fully reactive and designed for exploration. On the web, hovering the mouse over any data point—a bar, a point on a line, or a slice of a donut chart—will trigger a sleek, informative tooltip displaying the precise value and label. On the mobile app, the same information is revealed with a gentle tap on the element, ensuring a rich, intuitive experience across all platforms.

#### **Secure & User-Friendly Authentication**

The entire authentication process is engineered to be secure, transparent, and convenient, removing common points of friction for the user.

* **Password Visibility Toggle:** All password input fields (login, registration, change password) feature an "eye" icon that allows users to toggle the visibility of their password. This simple utility helps prevent typos and ensures users can enter their password confidently.
* **Terms of Service Agreement:** The registration screen includes a mandatory checkbox requiring users to agree to the Terms of Service and Privacy Policy. This ensures legal compliance and that users are fully informed before creating an account.
* **"Remember Me" Option:** For convenience, the login screen provides a "Remember Me" checkbox. When selected, the application will keep the user logged in securely for an extended period on their trusted device.
* **Real-time Password Strength Indicator:** As a user types their password during registration, a visual indicator provides immediate feedback on its strength, guiding them to create a more secure password.

#### **Interactive Elements**

* **Smooth Notification Dropdown:** A key highlight is the fluid, animated notification dropdown in the header. It displays a badge with the unread count and, when tapped, smoothly reveals a list of detailed messages with timestamps. Users can mark individual items as read or clear all notifications at once.
* **Intuitive Navigation:** Primary navigation is handled by a clean, icon-driven bottom tab bar, while secondary actions and profile access are located in the header for a consistent and predictable user journey.

## Core Features

* **Bookkeeping & Reconciliation:** Accurately record all financial transactions and reconcile them against bank records.
* **Financial Reporting:** Generate core financial statements (P&L, Balance Sheet, Cash Flow).
* **Client Management:** A dedicated, multi-client workspace for CPAs.
* **Tax Preparation:** Organize data and prepare documentation for tax filings.
* **Budgeting & Forecasting:** Create future budgets and financial models.
* **Auditing & Compliance:** Ensure records adhere to legal standards like GAAP (initially for Sweden, UK, US).
* **Intelligent Document Scanning:** Use the device camera with OCR to automate data entry from receipts.
* **AI Assistant:** Integrated assistant with multi-provider support (OpenAI, Gemini, Claude).
* **Real-time Messaging:** A dedicated chat feature for direct user-to-user communication.
* **Multi-Currency Support:** Manage and convert between currencies with real-time exchange rates.

## Role-Based Access Control (RBAC)

The application is built on a robust, role-based permission system to ensure data security and provide tailored functionality for every type of user.

| Role                 | Description                                                  | Key Permissions                                                                                                                                                    |
| :------------------- | :----------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Member**           | The default role for all new users. Designed for personal use. | • Manage own financial data<br>• Access core bookkeeping & budgeting<br>• Use camera scanning & AI assistant for personal data                                       |
| **Premium Member**   | An upgraded role for users who need more powerful tools.     | • All Member permissions<br>• In-depth analytics & multi-year forecasting<br>• Advanced tax preparation summaries<br>• Export data to CSV                         |
| **Professional (CPA)** | A distinct account for accountants managing multiple clients. | • Access a dashboard of assigned clients<br>• Full financial management within segregated client workspaces<br>• Generate professional reports for clients              |
| **Support**          | An internal role for troubleshooting and user assistance.    | • Read-only access to specific user data for diagnostics<br>• View transaction logs and reports<br>• Cannot modify any financial data                            |
| **Administrator**    | The highest-level internal role with full system oversight.  | • Full access to the Admin Panel<br>• Manage all users and assign roles<br>• Send global messages<br>• Perform system-wide auditing                                |

---

## Detailed Workspaces & Panels

### The Administrator Panel

The Admin Panel is a comprehensive, restricted-access dashboard for full system management.

* **User Management:**
  * View, search, and filter the entire user list.
  * Edit user profiles and assign roles (Member, Premium, CPA, Support, Admin).
  * Suspend, unsuspend, or delete user accounts.
  * View detailed activity logs for each user.
* **System Analytics Dashboard:**
  * Visualize key metrics: new user sign-ups, daily/monthly active users, total transactions.
  * Monitor system health and performance.
* **Global Messaging System:**
  * Compose and broadcast announcements or critical alerts to all users or specific roles.
* **Financial Oversight & Auditing:**
  * Access high-level, anonymized financial aggregates for trend analysis.
  * Review system-wide audit logs for security and compliance checks.
* **Client & CPA Management:**
  * Oversee and manage the assignment of clients to CPA professionals.

### The Professional (CPA) Workspace

When a CPA manages a client, they enter a secure, segregated workspace with the following capabilities and limitations:

#### **Full Financial Control:**

    -   **View Complete Dashboard:** See the client's metrics, charts, and transactions exactly as they do.

* **Full Bookkeeping:** Add, edit, and delete transactions; categorize income/expenses; manage journal entries.
* **Generate Reports:** Create and export P&L statements, Balance Sheets, and Cash Flow reports on the client's behalf.
* **Manage Budgets:** View, create, and adjust client budgets for financial planning.
* **Access Documents:** View all client-uploaded receipts and invoices for bookkeeping and tax preparation.
* **Perform Reconciliations:** Use integrated tools to reconcile book transactions against bank statements.

#### **Strict Privacy Limitations:**

To maintain client privacy and security, a CPA **cannot**:

* View or change the client's personal profile settings (name, email, password).
* Manage the client's personal API keys.
* See the client's subscription or billing information with NorthFinance.
* Access any other client's data from within an active client workspace.

---

## Application Navigation Map

### Bottom Tab Bar Navigation

| Icon (lucide-react-native) | Route          | Description                                                              | Access Roles      |
| :------------------------- | :------------- | :----------------------------------------------------------------------- | :---------------- |
| `Chrome`                   | `/`            | Navigates to the main dashboard screen.                                  | All               |
| `Briefcase`                | `/clients`     | Access client management workspace.                                      | CPA, Administrator |
| `CreditCard`               | `/transactions`| Manage all financial transactions.                                       | All               |
| `Camera`                   | `/camera`      | Open document scanner with OCR.                                          | All               |
| `FileText`                 | `/documents`   | View and manage uploaded documents.                                      | All               |
| `MessageCircle`            | `/support`     | Access the user support center.                                          | All               |

### Header Navigation (Top Right)

| Icon (lucide-react-native) | Action / Route | Description                                                              | Access Roles      |
| :------------------------- | :------------- | :----------------------------------------------------------------------- | :---------------- |
| `Bell`                     | (Component)    | Opens the interactive Notification Dropdown.                             | All               |
| `MessageCircle`            | `/chat/1`      | Navigates directly to the real-time messaging/chat interface.            | All               |
| `Settings`                 | `/settings`    | Navigates to the application settings screen.                            | All               |
| `User`                     | `/profile`     | Navigates to the user's personal profile and account settings.           | All               |

---

## Technical Architecture

* **Frontend:** Built with React Native and Expo (SDK 53), using TypeScript for type safety. Navigation is handled by Expo Router for a file-based, native feel.
* **Backend:** Powered by Supabase, utilizing a PostgreSQL database. This relational database is the industry standard for financial applications, ensuring data integrity and enabling complex, accurate reporting.
* **Authentication & Security:** User management and role-based access are handled through Supabase Auth, with Row Level Security (RLS) enabled on the database. The front-end ensures a secure and usable authentication experience with features like password visibility toggles, a 'Remember Me' option, mandatory password confirmation, real-time strength indicators, and a required terms of service agreement during registration.
* **AI & Data Extraction:**
  * **OCR:** Camera-based document scanning will use a cloud-based OCR service to extract text from images.
  * **AI Providers:** The AI Assistant will connect to user-provided API keys for OpenAI, Google Gemini, and Anthropic Claude, with a dedicated screen for key management and connection testing.
* **Currency Conversion:** A real-time currency exchange rate API will be integrated to handle conversions between SEK, USD, EUR, and other currencies.
