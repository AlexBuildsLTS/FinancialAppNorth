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
      ***Avatar Logic**: The component displays the user's uploaded `avatar_url`. If no image is present, it automatically generates a temporary avatar with the user's first and last initials (e.g., "JS" for John Smith) against a unique, programmatically generated background color that remains consistent for that user.
      * **Dropdown Menu**: Clicking the avatar opens a role-aware dropdown menu with icons for quick navigation:
        *`Edit Profile` (icon: `UserCog`)
        * `Settings` (icon: `Settings`)
        *`Sign Out` (icon: `LogOut`)
        * `Ticket Management` (icon: `HandHelping`) - **This is an exclusive entry point visible only to `Support` and `Administrator` roles for managing the ticket system.**

### Interactive & Insightful Data Visualization

Data is brought to life through a suite of modern, interactive, and smoothly animated charts, rendered with hardware acceleration for fluid performance.

* **Chart Variety**: The dashboard provides a comprehensive financial overview using Ring & Donut Charts, Line Charts, Bar Charts, and advanced Heat Maps & Tree Maps.
* **Deep Interactivity & Drill-Down**: All charts are fully reactive. Tapping a data point (e.g., the "Software" slice of an expense pie chart) immediately navigates the user to a new, detailed view that breaks down every underlying transaction for that specific category and period.

---

## Feature Suite (Overview)

### For Personal Finance (Member & Premium) - Summary

Core tools designed to empower individuals and small businesses to manage their finances effectively.

* **Intelligent Document Scanning**: The `Scan` tab (`ScanEye` icon) transforms the device's camera into a powerful financial scanner. Using a cloud-based OCR service, it automatically extracts key information—vendor, date, total amount—from physical receipts and invoices, dramatically reducing manual data entry.
* **AI Assistant**: Accessible via the `AI Chat` tab (`BotMessageSquare` icon), this feature provides an integrated assistant with multi-provider support (OpenAI, Gemini, Claude). Users can ask complex financial questions, request summaries of their spending, and gain insights into their data. Requires a user-provided API key.
* **Budgeting & Forecasting**: A comprehensive suite of tools for financial planning. Users can create detailed budgets using various methodologies, including **envelope budgeting**. The system also supports **rollover budgets**, where unused or overspent amounts from one period automatically carry over to the next.
* **Bookkeeping & Reconciliation**: The foundation of the app. Users can accurately record all financial transactions following double-entry principles and manage multiple sets of books (e.g., separating personal and business finances).

#### Premium Member Upgrades (Summary)

Subscribed `Premium` users unlock powerful enhancements within the existing interface, designed for those who need more control and insight.

* **In-depth Analytics & Multi-year Forecasting**: The `Reports` tab is upgraded with advanced analytics tools, allowing users to compare financial data across multiple years and generate sophisticated forecast models.
* **Advanced Tax Preparation Summaries**: Generate detailed, country-specific tax summaries (initially supporting Sweden, UK, US standards) to streamline tax filing.
* **Data Export to CSV/PDF**: An "Export" button is unlocked on the `Transactions` screen, allowing users to download their financial data for use in other applications or for archival purposes.
* **Custom Categorization Rules**: In `Settings`, Premium users can create powerful automation rules (e.g., "All transactions from 'Spotify' are automatically categorized as 'Entertainment'"), saving significant time on manual bookkeeping.
* **Scheduled Reporting**: Automate financial oversight by scheduling core reports (P&L, Balance Sheet) to be automatically generated and emailed on a recurring basis.

### For Professional Accounting (CPA) - Summary

A dedicated suite of tools for accounting professionals, centered around client management.

* **Client Management Dashboard**: The `Clients` tab (`UsersRound` icon) is the central hub for CPAs. It provides a comprehensive overview of all assigned clients, pending requests, and key client alerts.
* **Segregated & Secure Workspaces**: Clicking on a client transports the CPA into a secure, sandboxed environment. This workspace contains only that client's data, eliminating any risk of data contamination. A persistent header always displays the active client's name as a critical safety feature.
* **Brandable Reporting**: CPAs can generate professional reports for their clients that can be customized with the CPA's own firm logo and branding, enhancing their professional image.

### Universal Support Ticket System (Summary)

A comprehensive ticketing system is integrated to handle all user support requests, accessible to everyone via the main `Support` tab.

* **User-Facing View**: The `Support` screen for non-staff users presents two clear options: **`Create New Ticket`** and **`View My Tickets`**. This allows users to easily submit new requests (with Topic and Description) and track the history and status of their existing tickets.
* **Staff-Facing View**: For `Support` and `Administrator` roles, the `Support` tab transforms into a powerful management dashboard. It displays a master list of all tickets from all users, with robust filtering, sorting, and a private section for **Internal Notes** visible only to other staff members.

---

The user experience is paramount, designed to be intelligent, responsive, and personalized to each user's specific needs and role.

The application's aesthetic is clean, professional, and accessible, featuring two meticulously crafted visual themes with a seamless, animated toggle.

* **Typography**: The entire interface utilizes the **Inter** font family, chosen for its exceptional legibility on screens of all sizes, ensuring a comfortable and clear reading experience during prolonged use.
* **Light Theme**: Engineered for clarity in bright environments. It uses a soft, off-white (`#F0F2F5`) background to reduce eye strain, paired with crisp white (`#FFFFFF`) cards. A professional orange (`#BB4711`) serves as the primary accent, chosen to evoke confidence and decisive action.
* **Dark Theme**: Perfect for low-light conditions. It features a deep navy blue (`#0A192F`) background and slightly lighter navy (`#172A45`) cards for subtle depth. A vibrant green (`#1DB954`) accent provides a modern, energetic contrast against the dark backdrop.

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
| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Member** | The default role for all new users. Designed for personal use. | • Manage own financial data and budgets.  
• Use camera scanning & AI assistant.  
• Generate standard financial reports.  
• Create and manage support tickets.  
• **Initiate connection requests** to a CPA. |
| **Premium Member** | An upgraded role for users who need more powerful tools for their own finances. | • **All Member permissions**, plus:  
• In-depth analytics & multi-year forecasting.  
• Advanced tax preparation summaries.  
• Export data to CSV/PDF.  
• Create custom categorization rules.  
• Set up scheduled, automated reporting. |
| **Professional (CPA)**| A distinct account for accountants managing multiple clients. | • Access the `Clients` tab and dashboard.  
• Enter secure, segregated client workspaces.  
• Perform full financial management for clients.  
• Generate **brandable reports** on behalf of clients.  
• Use secure messaging to communicate with clients. |
| **Support** | An internal role for troubleshooting and user assistance. | • Access the staff-level ticket management system.  
• Read-only access to specific user data *with explicit user consent*.  
• View transaction logs and system diagnostics.  
• **Cannot** modify any user financial data. |
| **Administrator** | The highest-level internal role with full system oversight. | • **Full access to the Admin Panel.**  
• Manage all users, including assigning roles.  
• Access system health and business intelligence dashboards.  
• Manage feature flags and global settings.  
• Oversee all CPA-client connections.  
• Perform system-wide auditing. |

---

1. An `Administrator` navigates to the User Management section in the `Admin Panel`.
2. They select a `Member` or `Premium Member` user to edit.
3. Using a searchable dropdown of all registered CPAs, they assign a professional to the user.
4. The connection is established instantly.

* **2. User-Initiated Request**:

1. A `Member` or `Premium Member` navigates to the "Find an Accountant" section in their `Settings`.
2. They browse or search a public list of available CPAs.
3. The user clicks "Request Connection," which sends a secure notification to the CPA.
4. The request appears in the CPA's `Clients` dashboard as "Pending."
5. The CPA can then review the request and **Accept** or **Decline** it. The user is notified of the outcome.
| `user-pen` | Clients | Access the client management dashboard and workspaces. | CPA, Support, Admin |
| `Briefcase` | Support | Create and view support tickets for help and bug reports. | All (View is upgraded for staff) |
| `Settings` | Settings | Configure application, profile, and security settings. | All |
| `Landmark`| Admin Panel| The central hub for all system and user management tools. | Administrator Only |

---

## Client-to-CPA Connection Workflow

Connecting a user with an accounting professional is a secure and managed process with two distinct pathways:

* **1. Administrator-Led Assignment**:
    1. An `Administrator` navigates to the User Management section in the `Admin Panel`.
    2. They select a `Member` or `Premium Member` user to edit.
    3. Using a searchable dropdown of all registered CPAs, they assign a professional to the user.
    4. The connection is established instantly.

* **2. User-Initiated Request**:
    1. A `Member` or `Premium Member` navigates to the "Find an Accountant" section in their `Settings`.
    2. They browse or search a public list of available CPAs.
    3. The user clicks "Request Connection," which sends a secure notification to the CPA.
    4. The request appears in the CPA's `Clients` dashboard as "Pending."
    5. The CPA can then review the request and **Accept** or **Decline** it. The user is notified of the outcome.

---

## Technical Architecture

* **Frontend**: React Native & Expo (SDK 53) with TypeScript. Navigation is handled by **Expo Router** for a file-based, native-like routing experience.

1) If you prefer Docker bundling (ensure Docker daemon running):
USE_API=false ./scripts/deploy-functions.sh

2) Function secrets (Edge Functions UI): add SERVICE_ROLE_KEY (no SUPABASE_ prefix) → paste your service role key value.

3) Verify:
supabase functions list --project-ref "$SUPABASE_PROJECT_REF"
Use the Supabase CLI. Commands start with `supabase`:

