# NorthFinance: Professional Financial Management

NorthFinance is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. Built with **React Native** and **Expo**, it delivers a powerful, cross-platform experience on Android, iOS, and the web. Our target users range from individuals and freelancers to small businesses and the accounting professionals who serve them.

Our vision is to create an intuitive and powerful financial management platform with a polished user interface, making robust financial tools accessible to everyone. We are committed to a refined user experience defined by our three guiding principles: **Clarity**, **Power**, and **Security**.

> This document serves as the single source of truth for the NorthFinance application's vision, features, and architecture.

---

## Core User Experience

The user experience is paramount, designed to be intelligent, responsive, and personalized to each user's specific needs and role.

### Visual Identity
The application's aesthetic is clean, professional, and accessible, featuring two meticulously crafted visual themes with a seamless, animated toggle.

* **Typography**: The entire interface utilizes the **Inter** font family, chosen for its exceptional legibility on screens of all sizes, ensuring a comfortable and clear reading experience during prolonged use.
* **Light Theme**: Engineered for clarity in bright environments. It uses a soft, off-white (`#F0F2F5`) background to reduce eye strain, paired with crisp white (`#FFFFFF`) cards. A professional orange (`#BB4711`) serves as the primary accent, chosen to evoke confidence and decisive action.
* **Dark Theme**: Perfect for low-light conditions. It features a deep navy blue (`#0A192F`) background and slightly lighter navy (`#172A45`) cards for subtle depth. A vibrant green (`#1DB954`) accent provides a modern, energetic contrast against the dark backdrop.

### Dynamic & Personalized UI
The interface adapts to the user, providing immediate access to relevant tools and personal information.

* **User Avatar & Profile Dropdown**: The header features the user's avatar as the primary entry point for account management.
    * **Avatar Logic**: The component displays the user's uploaded `avatar_url`. If no image is present, it automatically generates a temporary avatar with the user's first and last initials (e.g., "JS" for John Smith) against a unique, programmatically generated background color that remains consistent for that user.
    * **Dropdown Menu**: Clicking the avatar opens a role-aware dropdown menu with icons for quick navigation:
        * `Edit Profile` (icon: `UserCog`)
        * `Settings` (icon: `Settings`)
        * `Sign Out` (icon: `LogOut`)
        * `Ticket Management` (icon: `HandHelping`) - **This is an exclusive entry point visible only to `Support` and `Administrator` roles for managing the ticket system.**

### Interactive & Insightful Data Visualization
Data is brought to life through a suite of modern, interactive, and smoothly animated charts, rendered with hardware acceleration for fluid performance.

* **Chart Variety**: The dashboard provides a comprehensive financial overview using Ring & Donut Charts, Line Charts, Bar Charts, and advanced Heat Maps & Tree Maps.
* **Deep Interactivity & Drill-Down**: All charts are fully reactive. Tapping a data point (e.g., the "Software" slice of an expense pie chart) immediately navigates the user to a new, detailed view that breaks down every underlying transaction for that specific category and period.

---

## Feature Suite

### For Personal Finance (Member & Premium)
Core tools designed to empower individuals and small businesses to manage their finances effectively.

* **Intelligent Document Scanning**: The `Scan` tab (`ScanEye` icon) transforms the device's camera into a powerful financial scanner. Using a cloud-based OCR service, it automatically extracts key information—vendor, date, total amount—from physical receipts and invoices, dramatically reducing manual data entry.
* **AI Assistant**: Accessible via the `AI Chat` tab (`BotMessageSquare` icon), this feature provides an integrated assistant with multi-provider support (OpenAI, Gemini, Claude). Users can ask complex financial questions, request summaries of their spending, and gain insights into their data. Requires a user-provided API key.
* **Budgeting & Forecasting**: A comprehensive suite of tools for financial planning. Users can create detailed budgets using various methodologies, including **envelope budgeting**. The system also supports **rollover budgets**, where unused or overspent amounts from one period automatically carry over to the next.
* **Bookkeeping & Reconciliation**: The foundation of the app. Users can accurately record all financial transactions following double-entry principles and manage multiple sets of books (e.g., separating personal and business finances).

#### Premium Member Upgrades
Subscribed `Premium` users unlock powerful enhancements within the existing interface, designed for those who need more control and insight.

* **In-depth Analytics & Multi-year Forecasting**: The `Reports` tab is upgraded with advanced analytics tools, allowing users to compare financial data across multiple years and generate sophisticated forecast models.
* **Advanced Tax Preparation Summaries**: Generate detailed, country-specific tax summaries (initially supporting Sweden, UK, US standards) to streamline tax filing.
* **Data Export to CSV/PDF**: An "Export" button is unlocked on the `Transactions` screen, allowing users to download their financial data for use in other applications or for archival purposes.
* **Custom Categorization Rules**: In `Settings`, Premium users can create powerful automation rules (e.g., "All transactions from 'Spotify' are automatically categorized as 'Entertainment'"), saving significant time on manual bookkeeping.
* **Scheduled Reporting**: Automate financial oversight by scheduling core reports (P&L, Balance Sheet) to be automatically generated and emailed on a recurring basis.

### For Professional Accounting (CPA)
A dedicated suite of tools for accounting professionals, centered around client management.

* **Client Management Dashboard**: The `Clients` tab (`UsersRound` icon) is the central hub for CPAs. It provides a comprehensive overview of all assigned clients, pending requests, and key client alerts.
* **Segregated & Secure Workspaces**: Clicking on a client transports the CPA into a secure, sandboxed environment. This workspace contains only that client's data, eliminating any risk of data contamination. A persistent header always displays the active client's name as a critical safety feature.
* **Brandable Reporting**: CPAs can generate professional reports for their clients that can be customized with the CPA's own firm logo and branding, enhancing their professional image.

### Universal Support Ticket System
A comprehensive ticketing system is integrated to handle all user support requests, accessible to everyone via the main `Support` tab.

* **User-Facing View**: The `Support` screen for non-staff users presents two clear options: **`Create New Ticket`** and **`View My Tickets`**. This allows users to easily submit new requests (with Topic and Description) and track the history and status of their existing tickets.
* **Staff-Facing View**: For `Support` and `Administrator` roles, the `Support` tab transforms into a powerful management dashboard. It displays a master list of all tickets from all users, with robust filtering, sorting, and a private section for **Internal Notes** visible only to other staff members.

---
## Core User Experience

The user experience is paramount, designed to be intelligent, responsive, and personalized to each user's specific needs and role.

### Visual Identity
The application's aesthetic is clean, professional, and accessible, featuring two meticulously crafted visual themes with a seamless, animated toggle.

* **Typography**: The entire interface utilizes the **Inter** font family, chosen for its exceptional legibility on screens of all sizes, ensuring a comfortable and clear reading experience during prolonged use.
* **Light Theme**: Engineered for clarity in bright environments. It uses a soft, off-white (`#F0F2F5`) background to reduce eye strain, paired with crisp white (`#FFFFFF`) cards. A professional orange (`#BB4711`) serves as the primary accent, chosen to evoke confidence and decisive action.
* **Dark Theme**: Perfect for low-light conditions. It features a deep navy blue (`#0A192F`) background and slightly lighter navy (`#172A45`) cards for subtle depth. A vibrant green (`#1DB954`) accent provides a modern, energetic contrast against the dark backdrop.

### Dynamic & Personalized UI
The interface adapts to the user, providing immediate access to relevant tools and personal information.

* **User Avatar & Profile Dropdown**: The header features the user's avatar as the primary entry point for account management.
    * **Avatar Logic**: The component displays the user's uploaded `avatar_url`. If no image is present, it automatically generates a temporary avatar with the user's first and last initials (e.g., "JS" for John Smith) against a unique, programmatically generated background color that remains consistent for that user.
    * **Dropdown Menu**: Clicking the avatar opens a role-aware dropdown menu with icons for quick navigation:
        * `Edit Profile` (icon: `UserCog`)
        * `Settings` (icon: `Settings`)
        * `Sign Out` (icon: `LogOut`)
        * `Ticket Management` (icon: `HandHelping`) - **This is an exclusive entry point visible only to `Support` and `Administrator` roles for managing the ticket system.**

### A Living Interface: The Philosophy of Animation
Animations are a core component of the user experience, providing feedback, guiding focus, and creating a sense of quality.

* **Component & Screen Transitions**: New screens slide in with native, physics-based transitions. Data-heavy screens first display shimmering skeleton loaders that precisely match the layout of the content, which then gracefully fade out as the real data fades in.
* **Data State Changes**: When a value in a metric card updates, the numbers animate a quick scroll from the old value to the new.
* **Micro-interactions & Tactile Feedback**: Buttons subtly scale down on press. When an item is deleted from a list, it animates its height to zero and fades out, and the surrounding items smoothly animate to fill the empty space.
* **Navigational Cues**: The active icon in the bottom tab bar performs a subtle animation, like a gentle bounce, to clearly indicate the current state.

---

## Security First: A Commitment to Privacy

Security is not an afterthought; it is a foundational pillar of NorthFinance.

* **Authentication & Authorization**: User authentication is managed by Supabase Auth, leveraging modern security standards including optional Multi-Factor Authentication (MFA) via TOTP apps or **WebAuthn/Passkeys**. Access to data is strictly controlled by PostgreSQL's Row Level Security (RLS), ensuring users can only ever access their own information.
* **End-to-End Encryption (E2EE)**: All user-to-user and user-to-CPA communication within the real-time messaging feature is end-to-end encrypted. This means only the sender and intended recipient can read the messages, ensuring absolute privacy for sensitive financial discussions.
* **Secure Storage**: On mobile platforms, sensitive information like cryptographic keys is stored in the device's hardware-backed secure enclave using `expo-secure-store`. This provides the highest level of security for stored credentials.

---

## Feature Suite

### For Personal Finance (Member & Premium)
Core tools designed to empower individuals and small businesses to manage their finances effectively.

* **Intelligent Document Scanning**: The `Scan` tab (`ScanEye` icon) transforms the device's camera into a powerful financial scanner. Using a cloud-based OCR service, it automatically extracts key information from physical receipts and invoices, dramatically reducing manual data entry.
* **Secure Document Management**: A dedicated `Documents` tab provides a secure vault for uploading, storing, and managing important financial documents like bills, invoices, contracts, and bank statements. Files can be attached to specific transactions for easy reference.
* **AI Assistant**: An integrated assistant with multi-provider support (OpenAI, Gemini, Claude) for answering financial questions and analyzing data. Requires a user-provided API key.
* **Budgeting & Forecasting**: A comprehensive suite of tools for financial planning. Users can create detailed budgets using various methodologies, including **envelope budgeting**. The system also supports **rollover budgets**.
* **Bookkeeping & Reconciliation**: The foundation of the app. Users can accurately record all financial transactions following double-entry principles and manage multiple sets of books (e.g., separating personal and business finances).

#### Premium Member Upgrades
Subscribed `Premium` users unlock powerful enhancements within the existing interface, designed for those who need more control and insight.

* **In-depth Analytics & Multi-year Forecasting**: The `Reports` tab is upgraded with advanced analytics tools, allowing users to compare financial data across multiple years and generate sophisticated forecast models.
* **Advanced Tax Preparation Summaries**: Generate detailed, country-specific tax summaries to streamline tax filing.
* **Data Export to CSV/PDF**: An "Export" button is unlocked on the `Transactions` and `Reports` screens, allowing users to download their financial data.
* **Custom Categorization Rules**: In `Settings`, Premium users can create powerful automation rules (e.g., "All transactions from 'Vendor X' are automatically categorized as 'Office Supplies'").
* **Scheduled Reporting**: Automate financial oversight by scheduling core reports to be automatically generated and emailed on a recurring basis.

### For Professional Accounting (CPA)
A dedicated suite of tools for accounting professionals, centered around client management.

* **Client Management Dashboard**: The `Clients` (`UsersRound` icon) tab is the central hub for CPAs. It provides a comprehensive overview of all assigned clients, pending requests, and key client alerts.
* **Segregated & Secure Workspaces**: Clicking on a client transports the CPA into a secure, sandboxed environment. This workspace contains only that client's data, eliminating any risk of data contamination. A persistent header always displays the active client's name as a critical safety feature.
* **Brandable Reporting**: CPAs can generate professional reports for their clients that can be customized with the CPA's own firm logo and branding.

### Universal Support Ticket System
A comprehensive ticketing system is integrated to handle all user support requests, accessible to everyone via the main `Support` tab.

* **User-Facing View**: The `Support` screen for non-staff users presents two clear options: **`Create New Ticket`** and **`View My Tickets`**. This allows users to easily submit new requests (with Topic and Description) and track the history and status of their existing tickets.
* **Staff-Facing View**: For `Support` and `Administrator` roles, the `Support` tab transforms into a powerful management dashboard, showing a master list of all tickets with filtering, status updates, and a private section for **Internal Notes**.

### Localization & Internationalization
The application is designed for a global user base, with features that adapt to the user's region.

* **Country & Currency Selection**: In `Settings`, users can select their country and preferred currency (initially supporting `SEK`, `EUR`, `GBP`).
* **Adaptive Features**: The chosen country will tailor features like the **Tax Preparation Summaries** to match local standards. The selected currency will become the base currency for all reporting and conversions.

---

## Advanced Role-Based Access Control (RBAC)

The application is built on a robust, role-based permission system. `Premium Member` is a direct upgrade for personal use, while `Professional (CPA)` is a distinct track for client management.

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Member** | The default role for all new users. Designed for personal use. | • Manage own financial data and budgets.<br />• Use camera scanning & AI assistant.<br />• Access the secure document vault.<br />• Generate standard financial reports.<br />• Create and manage support tickets.<br /> |
| **Premium Member** | An upgraded role for users who need more powerful tools for their own finances. | • **All Member permissions**, plus:<br />• In-depth analytics & multi-year forecasting.<br />• Advanced tax preparation summaries.<br />• Export data to CSV/PDF.<br />• Create custom categorization rules.<br />• Set up scheduled, automated reporting. |
| **Professional (CPA)**| A distinct account for accountants managing multiple clients. | • Access the `Clients` tab and dashboard.<br />• Enter secure, segregated client workspaces.<br />• Perform full financial management for clients.<br />• Generate **brandable reports** on behalf of clients.<br />• Use secure, E2EE messaging with clients. |
| **Support** | An internal role for troubleshooting and user assistance. | • Access the staff-level ticket management system.<br />• Read-only access to specific user data *with explicit user consent*. <br />• View transaction logs and system diagnostics.<br />• **Cannot** modify any user financial data. |
| **Administrator** | The highest-level internal role with full system oversight. | • **Full access to the Admin Panel.**<br />• Manage all users, including assigning roles.<br />• Access system health and business intelligence dashboards.<br />• Manage feature flags and global settings.<br />• Oversee all CPA-client connections.<br />• Perform system-wide auditing. |

---

## Dynamic Navigation System

The primary navigation is a dynamic bottom tab bar that adapts based on the user's role, ensuring a clean and relevant interface. Users will **only see the tabs available to their role**.

| Icon (`lucide-react-native`) | Title | Description | Visible To |
| :--- | :--- | :--- | :--- |
| `Home` | Dashboard | Main overview of financial health, charts, and metrics. | All |
| `List` | Transactions | A detailed, searchable list of all financial transactions. | Member, Premium, CPA, Admin |
| `ScanEye` | Scan | Scan physical documents with OCR to create new transactions. | Member, Premium |
| `FileText` | Documents | Secure vault for uploading and managing financial documents. | Member, Premium, CPA, Admin |
| `BarChart2` | Reports | Generate and view financial reports like P&L and Balance Sheets. | Member, Premium |
| `UsersRound` | Clients | Access the client management dashboard and workspaces. | CPA, Support, Admin |
| `Briefcase` | Support | Create and view support tickets for help and bug reports. | All (View is upgraded for staff) |
| `Settings` | Settings | Configure application, profile, and security settings. | All |
| `Landmark`| Admin Panel| The central hub for all system and user management tools. | Administrator Only |

---

## Client-to-CPA Connection Workflow

Connecting a user with an accounting professional is a secure and managed process with two distinct pathways:

* **1. Administrator-Led Assignment**:
    1.  An `Administrator` navigates to the User Management section in the `Admin Panel`.
    2.  They select a `Member` or `Premium Member` user to edit.
    3.  Using a searchable dropdown of all registered CPAs, they assign a professional to the user.
    4.  The connection is established instantly.

* **2. User-Initiated Request**:
    1.  A `Member` or `Premium Member` navigates to the "Find an Accountant" section in their `Settings`.
    2.  They browse or search a public list of available CPAs.
    3.  The user clicks "Request Connection," which sends a secure notification to the CPA.
    4.  The request appears in the CPA's `Clients` dashboard as "Pending."
    5.  The CPA can then review the request and **Accept** or **Decline** it. The user is notified of the outcome.

---

## Technical Architecture

* **Frontend**: React Native & Expo (SDK 53) with TypeScript. Navigation is handled by **Expo Router** for a file-based, native-like routing experience.
* **Backend**: **Supabase** was chosen for its integrated suite of tools. We utilize its PostgreSQL database, Auth (with RLS), Realtime capabilities for live data synchronization, and Edge Functions for serverless logic.
* **Deployment**: The web application is deployed to **Vercel** for optimal performance and scalability. Mobile builds for the Apple App Store and Google Play Store are managed and distributed via **EAS (Expo Application Services)**.

---

## Platform Notes

- **Environment Variables**: For web builds, Expo uses the `extra` field in `app.config.js`. Ensure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and other keys are set in your environment before running.
- **Secure Storage**: Mobile builds use `expo-secure-store` for hardware-backed security. Web falls back to `localStorage` for development convenience. Production-grade key storage on the web should consider server-backed solutions.
- **Crypto Polyfill (React Native)**: For native builds, `window.crypto.subtle` is not available by default and requires polyfills like `react-native-get-random-values` and `react-native-quick-crypto`.


```
FinanceNorthStarV5/
├── .expo/
│   ├── types/
│   │   └── router.d.ts
│   ├── web/
│   │   └── cache/
│   │       └── production/
│   │           └── images/
│   │               └── favicon/
│   │                   ├── favicon-8cdb28a4c057e72cbe0f9a186972785ca35b7981fda54c2e3bf54cf3a6ce76df-contain-transparent/
│   │                   │   └── favicon-48.png
│   │                   ├── favicon-bab2107532315e62271a7aac0031dcc961850da341016e97b037cf318af50ac2-contain-transparent/
│   │                   │   └── favicon-48.png
│   │                   └── favicon-c4e80578e6d6bd7049ed62a23e1cf53e545e81cd7fb16c14e6194764a6a8fd79-contain-transparent/
│   │                       └── favicon-48.png
│   ├── devices.json
│   └── README.md
├── .github/
│   ├── chatmodes/
│   │   └── NorthFinance: A Vision for Professional Financial Management.chatmode.md
│   └── workflows/
│       └── deploy-functions.yml
├── .qodo/
├── .vscode/
│   ├── .react/
│   ├── extensions.json
│   └── settings.json
├── dist/
│   ├── _expo/
│   │   └── static/
│   │       └── js/
│   │           └── web/
│   │               └── entry-195554d25d9b6dd3db21f08330d5227a.js
│   ├── (auth)/
│   │   ├── login.html
│   │   └── register.html
│   ├── (tabs)/
│   │   ├── client/
│   │   │   └── [id].html
│   │   ├── profile/
│   │   │   ├── security/
│   │   │   │   ├── change-password.html
│   │   │   │   └── index.html
│   │   │   ├── api-keys.html
│   │   │   ├── edit.html
│   │   │   └── index.html
│   │   ├── accounts.html
│   │   ├── ai-assistant.html
│   │   ├── analytics.html
│   │   ├── budgets.html
│   │   ├── camera.html
│   │   ├── clients.html
│   │   ├── documents.html
│   │   ├── index.html
│   │   ├── journal.html
│   │   ├── reports.html
│   │   ├── settings.html
│   │   ├── support.html
│   │   └── transactions.html
│   ├── admin/
│   │   ├── index.html
│   │   └── manage-users.html
│   ├── assets/
│   │   └── src/
│   │       └── assets/
│   │           ├── images/
│   │           │   └── icon.249d745cf0e1b5732e4fab1e8fbf083c.png
│   │           └── Inter/
│   │               └── Inter-VariableFont_opsz,wght.0a77e23a8fdbe6caefd53cb04c26fabc.ttf
│   ├── chat/
│   │   └── [id].html
│   ├── client/
│   │   └── [id].html
│   ├── profile/
│   │   ├── security/
│   │   │   ├── change-password.html
│   │   │   └── index.html
│   │   ├── api-keys.html
│   │   ├── edit.html
│   │   └── index.html
│   ├── _sitemap.html
│   ├── +not-found.html
│   ├── accounts.html
│   ├── ai-assistant.html
│   ├── analytics.html
│   ├── budgets.html
│   ├── camera.html
│   ├── client-support.html
│   ├── clients.html
│   ├── documents.html
│   ├── favicon.ico
│   ├── index.html
│   ├── journal.html
│   ├── login.html
│   ├── messages.html
│   ├── process-document.html
│   ├── register.html
│   ├── reports.html
│   ├── settings.html
│   ├── support.html
│   └── transactions.html
├── scripts/
│   ├── deploy-functions.sh
│   ├── set-github-secrets.sh
│   └── setup-gh-secrets-repo.sh
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── admin/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── EditUserModal.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── manage-users.tsx
│   │   │   ├── client/
│   │   │   │   └── [id].tsx
│   │   │   ├── profile/
│   │   │   │   ├── security/
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── change-password.tsx
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── api-keys.tsx
│   │   │   │   ├── edit.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── _layout.tsx
│   │   │   ├── accounts.tsx
│   │   │   ├── ai-assistant.tsx
│   │   │   ├── analytics.tsx
│   │   │   ├── budgets.tsx
│   │   │   ├── camera.tsx
│   │   │   ├── clients.tsx
│   │   │   ├── documents.tsx
│   │   │   ├── index.tsx
│   │   │   ├── journal.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── settings.tsx
│   │   │   ├── support.tsx
│   │   │   └── transactions.tsx
│   │   ├── admin/
│   │   │   └── manage-users.tsx
│   │   ├── chat/
│   │   │   ├── _layout.tsx
│   │   │   ├── [id].tsx
│   │   │   └── index.tsx
│   │   ├── dev/
│   │   │   └── diagnostics.tsx
│   │   ├── _layout.tsx
│   │   ├── +not-found.tsx
│   │   ├── client-support.tsx
│   │   ├── messages.tsx
│   │   └── process-document.tsx
│   ├── assets/
│   │   ├── fonts/
│   │   │   ├── components/
│   │   │   │   ├── inter/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── inter.css
│   │   │   │   │   ├── inter.stories.tsx
│   │   │   │   │   └── inter.tsx
│   │   │   │   └── index.ts
│   │   │   └── Inter
│   │   ├── images/
│   │   │   ├── favicon.png
│   │   │   ├── icon.png
│   │   │   ├── NorthFinanceIcon.png
│   │   │   ├── NorthFinancetext.png
│   │   │   ├── NorthFinanceTextdark.png
│   │   │   └── splash.png
│   │   └── Inter/
│   │       ├── static/
│   ├── components/
│   │   ├── admin/
│   │   │   └── EditUserModal.tsx
│   │   ├── common/
│   │   │   ├── AnimatedThemeIcon.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── index.ts
│   │   │   ├── MainHeader.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── PasswordStrengthIndicator.tsx
│   │   │   ├── RoleBadge.tsx
│   │   │   ├── TabIcon.tsx
│   │   │   └── Toast.tsx
│   │   ├── dashboard/
│   │   │   ├── ChartSection.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── index.ts
│   │   │   ├── LineChart.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── MetricsGrid.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── RecentTransactions.tsx
│   │   ├── forms/
│   │   │   ├── AddClientModal.tsx
│   │   │   ├── AddTransactionModal.tsx
│   │   │   ├── CreateBudgetModal.tsx
│   │   │   └── JournalEntryModal.tsx
│   │   ├── reports/
│   │   │   ├── BalanceSheet.tsx
│   │   │   └── ProfitLossStatement.tsx
│   │   └── ScreenContainer.tsx
│   ├── constants/
│   │   └── navigationOptions.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ToastProvider.tsx
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useChartData.ts
│   │   ├── useDashboardData.ts
│   │   ├── useFrameworkReady.ts
│   │   ├── useNotifications.ts
│   │   ├── useProfile.ts
│   │   └── useTransactions.ts
│   ├── lib/
│   │   ├── devErrors.ts
│   │   ├── e2eeKeys.ts
│   │   ├── keyRegistry.ts
│   │   ├── secureStorage.ts
│   │   └── supabase.ts
│   ├── services/
│   │   ├── accountingService.ts
│   │   ├── adminService.ts
│   │   ├── analyticsService.ts
│   │   ├── budgetService.ts
│   │   ├── chatService.ts
│   │   ├── cpaService.ts
│   │   ├── dataService.ts
│   │   ├── documentService.ts
│   │   ├── index.ts
│   │   ├── notificationService.ts
│   │   ├── profileService.ts
│   │   ├── roleService.ts
│   │   ├── settingsService.ts
│   │   ├── transactionService.ts
│   │   └── userService.tsx
│   ├── theme/
│   │   └── colors.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── fileUtils.ts
├── supabase/
│   ├── .temp/
│   │   ├── cli-latest
│   │   ├── gotrue-version
│   │   ├── pooler-url
│   │   ├── postgres-version
│   │   ├── project-ref
│   │   ├── rest-version
│   │   └── storage-version
│   ├── functions/
│   │   ├── admin-change-role/
│   │   │   └── index.ts
│   │   ├── admin-deactivate/
│   │   │   └── index.ts
│   │   ├── admin-delete/
│   │   │   └── index.ts
│   │   ├── ocr-scan/
│   │   │   └── index.ts
│   │   ├── process-document/
│   │   │   ├── .npmrc
│   │   │   ├── deno.json
│   │   │   ├──
│  │  │  └─ index.ts
│  │  ├─ deno.json
│  │  ├─ deno.lock
│  │  └─ import_map.json
│  ├─ migrations/
│  │  └─ 20250827111825_initial_schema.sql
│  └─ .gitignore
├─ .env.local
├─ .gitignore
├─ .hintrc
├─ .npmrc
├─ .prettierrc
├─ .README.md.kate-swp
├─ app.config.js
├─ app.json
├─ babel.config.js
├─ deno.json
├─ eas.json
├─ expo-env.d.ts
├─ Makefile
├─ metro.config.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ tsconfig.json
└─ vercel.json
```
---
## Advanced Role-Based Access Control (RBAC)

The application is built on a robust, role-based permission system. `Premium Member` is a direct upgrade for personal use, while `Professional (CPA)` is a distinct track for client management.

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Member** | The default role for all new users. Designed for personal use. | • Manage own financial data and budgets.<br />• Use camera scanning & AI assistant.<br />• Generate standard financial reports.<br />• Create and manage support tickets.<br />• **Initiate connection requests** to a CPA. |
| **Premium Member** | An upgraded role for users who need more powerful tools for their own finances. | • **All Member permissions**, plus:<br />• In-depth analytics & multi-year forecasting.<br />• Advanced tax preparation summaries.<br />• Export data to CSV/PDF.<br />• Create custom categorization rules.<br />• Set up scheduled, automated reporting. |
| **Professional (CPA)**| A distinct account for accountants managing multiple clients. | • Access the `Clients` tab and dashboard.<br />• Enter secure, segregated client workspaces.<br />• Perform full financial management for clients.<br />• Generate **brandable reports** on behalf of clients.<br />• Use secure messaging to communicate with clients. |
| **Support** | An internal role for troubleshooting and user assistance. | • Access the staff-level ticket management system.<br />• Read-only access to specific user data *with explicit user consent*. <br />• View transaction logs and system diagnostics.<br />• **Cannot** modify any user financial data. |
| **Administrator** | The highest-level internal role with full system oversight. | • **Full access to the Admin Panel.**<br />• Manage all users, including assigning roles.<br />• Access system health and business intelligence dashboards.<br />• Manage feature flags and global settings.<br />• Oversee all CPA-client connections.<br />• Perform system-wide auditing. |

---

## Dynamic Navigation System

The primary navigation is a dynamic bottom tab bar that adapts based on the user's role, ensuring a clean and relevant interface. Users will **only see the tabs available to their role**.

| Icon (`lucide-react-native`) | Title | Description | Visible To |
| :--- | :--- | :--- | :--- |
| `Home` | Dashboard | Main overview of financial health, charts, and metrics. | All |
| `List` | Transactions | A detailed, searchable list of all financial transactions. | Member, Premium, CPA, Admin |
| `ScanEye` | Scan | Scan physical documents with OCR to create new transactions. | Member, Premium, CPA |
| `BotMessageSquare`| AI Chat | Interact with the AI financial assistant for insights. | Member, Premium, CPA |
| `BarChart2` | Reports | Generate and view financial reports like P&L and Balance Sheets. | Member, Premium, CPA |
| `user-pen` | Clients | Access the client management dashboard and workspaces. | CPA, Support, Admin |
| `Briefcase` | Support | Create and view support tickets for help and bug reports. | All (View is upgraded for staff) |
| `Settings` | Settings | Configure application, profile, and security settings. | All |
| `Landmark`| Admin Panel| The central hub for all system and user management tools. | Administrator Only |

---

## Client-to-CPA Connection Workflow

Connecting a user with an accounting professional is a secure and managed process with two distinct pathways:

* **1. Administrator-Led Assignment**:
    1.  An `Administrator` navigates to the User Management section in the `Admin Panel`.
    2.  They select a `Member` or `Premium Member` user to edit.
    3.  Using a searchable dropdown of all registered CPAs, they assign a professional to the user.
    4.  The connection is established instantly.

* **2. User-Initiated Request**:
    1.  A `Member` or `Premium Member` navigates to the "Find an Accountant" section in their `Settings`.
    2.  They browse or search a public list of available CPAs.
    3.  The user clicks "Request Connection," which sends a secure notification to the CPA.
    4.  The request appears in the CPA's `Clients` dashboard as "Pending."
    5.  The CPA can then review the request and **Accept** or **Decline** it. The user is notified of the outcome.

---

## Technical Architecture

* **Frontend**: React Native & Expo (SDK 53) with TypeScript. Navigation is handled by **Expo Router** for a file-based, native-like routing experience.
* **Backend**: **Supabase** was chosen for its integrated suite of tools. We utilize its PostgreSQL database, Auth (with RLS), Realtime capabilities for live data synchronization, and Edge Functions for serverless logic.
* **Deployment**: The web application is deployed to **Vercel** for optimal performance and scalability. Mobile builds for the Apple App Store and Google Play Store are managed and distributed via **EAS (Expo Application Services)**.
