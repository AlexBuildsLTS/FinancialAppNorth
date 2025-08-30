# NorthFinance: Professional Financial Management

NorthFinance is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. Built with React Native and Expo, it delivers a powerful, cross-platform experience on Android, iOS, and the webs.

Our vision is to create an intuitive and powerful financial management platform with a polished user interface, inspired by the "Sigma" application's design principles, making robust financial tools accessible to everyone..

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
| **Member**           | The default role for all new users. Designed for personal use. | • Manage own financial data, • Access core bookkeeping & budgeting, • Use camera scanning & AI assistant for personal data                                       |
| **Premium Member**   | An upgraded role for users who need more powerful tools.     | • All Member permissions, • In-depth analytics & multi-year forecasting, • Advanced tax preparation summaries, • Export data to CSV                         |
| **Professional (CPA)** | A distinct account for accountants managing multiple clients. | • Access a dashboard of assigned clients, • Full financial management within segregated client workspaces, • Generate professional reports for clients              |
| **Support**          | An internal role for troubleshooting and user assistance.    | • Read-only access to specific user data for diagnostics, • View transaction logs and reports, • Cannot modify any financial data                            |
| **Administrator**    | The highest-level internal role with full system oversight.  | • Full access to the Admin Panel, • Manage all users and assign roles, • Send global messages, • Perform system-wide auditing                                |

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

*

--------------------------------------------------------------------------------

## Full Project Snapshot SUPABASE

``` Below is a concise, searchable reference of every schema, table, view, storage bucket, extension and RLS policy in the fniujrqxkhepevzvghja Supabase project. Use it as a cheat‑sheet when building UI calls, Edge Functions, or debugging the signup flow.

1️⃣ Schemas & Their Role
Schema What it Holds RLS Default
auth Core Auth objects (users, sessions, identities, mfa_*, refresh_tokens, etc.) ✅ enabled (but most tables have built‑in Supabase policies)
public Your application data – profiles, finances, chat, support, audit, etc. ✅ enabled (policies listed below)
private Internal meta‑tables (e.g. user_roles). No RLS (intended for service‑role use). ❌ disabled
storage Buckets & objects for file storage. ✅ enabled (bucket‑level policies you see below)
vault Encrypted secrets (vault.secrets). ❌ disabled (access via service‑role only)
realtime Internal Realtime replication tables (messages_*). ✅ disabled (used only by Supabase Realtime)
graphql, graphql_public, pgbouncer, extensions, supabase_migrations System‑level infrastructure. Varies (mostly disabled for RLS).
2️⃣ All Tables – Key Columns, PKs & Relationships
Note – Every foreign‑key column already has an index (created in a previous migration).

Table (schema) Primary Key Important Columns RLS ? FK → Target
auth.users id (uuid) email, encrypted_password, role, phone, is_super_admin ✅ –
auth.sessions id (uuid) user_id, created_at, updated_at ✅ user_id → auth.users.id
auth.identities id (uuid) user_id, provider_id, provider, email ✅ user_id → auth.users.id
auth.refresh_tokens id (bigint) user_id, token, revoked ✅ user_id → auth.users.id
auth.mfa_factors id (uuid) user_id, factor_type, status ✅ user_id → auth.users.id
auth.mfa_challenges id (uuid) factor_id, verified_at ✅ factor_id → auth.mfa_factors.id
auth.mfa_amr_claims id (uuid) session_id, authentication_method ✅ session_id → auth.sessions.id
auth.sso_providers, auth.sso_domains, auth.saml_providers, auth.saml_relay_states, auth.flow_state, auth.one_time_tokens various … ✅ Various ↔ auth.users
public.profiles id (uuid) display_name, avatar_url, role (enum: member, premium, cpa, support, admin) ✅ id → auth.users.id
public.accounts id (uuid) user_id, name, type (checking, savings, credit, investment), balance, currency ✅ user_id → public.profiles.id
public.categories id (uuid) user_id, name, type (income, expense) ✅ user_id → public.profiles.id
public.documents id (uuid) user_id, storage_path, file_name, mime_type, status (processing, processed, error) ✅ user_id → public.profiles.id
public.transactions id (uuid) user_id, account_id, category_id, document_id, description, amount, type (income, expense), transaction_date, status (pending, cleared, cancelled) ✅ user_id → profiles.id, account_id → accounts.id, category_id → categories.id, document_id → documents.id
public.cpa_client_assignments id (uuid) cpa_user_id, client_user_id, status (pending, active, terminated), assigned_at ✅ cpa_user_id → profiles.id, client_user_id → profiles.id
public.user_secrets id (uuid) user_id (unique), openai_key, gemini_key, claude_key ✅ user_id → profiles.id
public.channels id (bigint) created_by, created_at ✅ created_by → auth.users.id
public.channel_participants PK (channel_id, user_id) – ✅ channel_id → channels.id, user_id → profiles.id
public.messages id (bigint) channel_id, user_id, content, created_at ✅ channel_id → channels.id, user_id → profiles.id
public.support_tickets id (uuid) user_id, title, status (open, in_progress, resolved, closed), priority (low, medium, high, urgent), assigned_to_id ✅ user_id → profiles.id, assigned_to_id → profiles.id
public.support_messages id (uuid) ticket_id, user_id, message, created_at ✅ ticket_id → support_tickets.id, user_id → profiles.id
public.audit_log id (bigint) actor_id, action, target_id, details, created_at ✅ actor_id → profiles.id
storage.buckets id (text) name, public, owner_id, type (STANDARD, ANALYTICS) ✅ –
storage.objects id (uuid) bucket_id, name, owner_id, metadata, created_at, updated_at ✅ bucket_id → buckets.id
private.user_roles user_id (uuid) (PK) roles (array of text), permissions (jsonb), assigned_at, assigned_by ❌ (no RLS) user_id → auth.users.id
realtime.<messages_*> id (uuid) Realtime log rows – not used by your UI directly. ✅ (disabled) 
supabase_migrations.schema_migrations, supabase_migrations.seed_files – Migration tracking – internal only. ❌ –
vault.secrets id (uuid) Encrypted secret – accessed via Supabase Vault API only. ❌ –
3️⃣ Storage Buckets (visible via Supabase UI)
Bucket Owner Public? RLS ? Typical Use
avatars null false ✅ Users’ profile pictures (policies already listed).
documents null false ✅ Uploaded receipts / invoices (policy Users can manage their own documents).
buckets_analytics null true ✅ Analytics‑only bucket (system).
You can create more buckets with supabase storage create-bucket <name> or via the dashboard.

4️⃣ Extensions Currently Installed
Extension Version What it Provides
uuid-ossp 1.1 UUID generation (uuid_generate_v4()).
pgcrypto 1.3 Cryptographic functions (hashing, encryption).
pg_stat_statements 1.11 Query performance stats.
supabase_vault 0.3.1 Encrypted secret storage.
Many others (PostGIS, pgnet, vector, pgmq, etc.) are available but not installed in this project (their installed_version is null). They can be added via the Extensions UI if you need spatial queries, full‑text search, message queues, etc.  
5️⃣ RLS Policies – What’s Already Enforced
The policies below are generated from list_policies and grouped by table. They are all PERMISSIVE (the typical Supabase style).

5.1 Public‑Schema Core Tables
Table Operation Role(s) Condition
profiles SELECT / UPDATE / ALL public (any authenticated user) auth.uid() = id (owner only)
accounts, categories, transactions, documents, user_secrets, audit_log, support_tickets, support_messages, channels, channel_participants, messages ALL / SELECT public auth.uid() = user_id (owner)
accounts, categories, transactions, documents, support_tickets, support_messages, messages SELECT public AND CPA visibility EXISTS (SELECT 1 FROM cpa_client_assignments ca WHERE ca.client_user_id = <owner_id> AND ca.cpa_user_id = auth.uid() AND ca.status = 'active')
cpa_client_assignments SELECT public cpa_user_id = auth.uid() (CPA can see their own assignments)
cpa_client_assignments SELECT (client view) public client_user_id = auth.uid() (client can see their own assignments)
cpa_client_assignments INSERT public cpa_user_id = auth.uid() AND status = 'pending'
cpa_client_assignments DELETE (client revokes) public client_user_id = auth.uid()
channels INSERT authenticated CHECK true (any authenticated user can create a channel)
channel_participants SELECT / ALL public EXISTS (SELECT 1 FROM channel_participants cp WHERE cp.channel_id = channels.id AND cp.user_id = auth.uid()) (only participants see a channel)
messages ALL public Same as above – participants can read/write messages in their channels.
support_tickets SELECT public profile.role ∈ {admin, support} (staff can view all)
support_tickets ALL public auth.uid() = user_id (owner)
support_messages ALL public Ticket owner, assigned staff, or admin/support can read/write.
audit_log INSERT public actor_id = auth.uid() (users insert their own audit rows)
audit_log SELECT public profile.role ∈ {admin, support} (staff can view).
storage (avatars) SELECT / UPDATE public Owner‑only via storage.foldername(name) check.
storage (avatars) INSERT public Owner‑only via check.
storage (documents) ALL authenticated Owner‑only via folder check.
Missing policies – cpa_client_assignments already has SELECT policies, but no INSERT/UPDATE/DELETE for the “client” side (the client can’t request a CPA). You may want to add a request table later.

5.2 Auth‑Schema (built‑in)
Supabase ships default policies for the auth tables (allow sign‑up, sign‑in, password reset, etc.). No custom changes are needed unless you’ve added triggers.

6️⃣ Why the POST /auth/v1/signup is failing (500 Internal Server Error)
The request you posted is a standard Supabase signup. The server returned:

SQL Query

x-sb-error-code: unexpected_failure

That means Supabase hit an unhandled exception while processing the request. Most common causes:

Possible Cause How to verify & fix
Missing required fields – the body must contain at least { "email": "...", "password": "..." }. Anything else is ignored. Check the exact payload sent from your Expo app. If you’re also sending email_confirm or custom user‑meta, ensure they are valid JSON.
Email already exists – Supabase returns 409 Conflict, but a custom trigger could convert it to 500. Try signing up with a brand‑new email via the Supabase dashboard ➜ Authentication ➜ Users. If it works, the email you used is already taken.
Custom “sign‑up” trigger or Postgres function that raises an exception (e.g., checking a domain whitelist). Run SELECT *FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass; in the SQL editor. If any trigger exists, inspect its definition.
RLS on auth.users (unlikely) – if you changed default policies, sign‑up may be blocked. Verify SELECT* FROM pg_policy WHERE schemaname='auth' AND tablename='users'; – default policies should allow INSERT for anon and authenticated.
Malformed request headers – you sent both apikey and Authorization: Bearer … to the signup endpoint. Supabase expects only apikey (service role not needed). Including a bearer token that is not yet valid can cause the server to attempt a lookup of auth.uid() → NULL → error. Remove the Authorization header on the signup call. Only include apikey (or leave it out entirely – the JS client handles it).
Expired/invalid API key – the API key you posted is a service‑role key (has role=anon). If the key is revoked or malformed, the gateway returns 500. Generate a fresh anon key from the Supabase dashboard ➜ Project Settings ➜ API. Use that for client‑side calls.
Quick Test you can run from the browser console (or Postman)
curl -X POST "<https://fniujrqxkhepevzvghja.supabase.co/auth/v1/signup>" \
  -H "apikey: <YOUR_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"<test1234@example.com>","password":"SuperSecret123!"}'


    If this returns a user object (or a “confirmation email sent” message), the backend is healthy.
*If you still see 500, open the Supabase Logs (Dashboard → Settings → Logs) and look for the request‑ID (0198eb8b-c4d9-...). The log entry will show the exact PostgreSQL error (e.g., duplicate key value violates unique constraint "users_pkey" or a trigger exception).

7️⃣ Immediate Action Items
✅ Done ❌ Pending
✅ All tables listed with columns, PKs, indexes. ❌ Add INSERT/DELETE policies for cpa_client_assignments if you want clients to request a CPA (e.g., a client_requests table).
✅ RLS policies reviewed – most essential policies already exist. ❌ Fix the signup request (remove Authorization header, ensure email & password present, use a fresh anon key).
✅ Storage bucket policies are in place for avatars & documents. ❌ If you need a public bucket (e.g., for marketing assets), create a new bucket with public: true and add a bucket‑level policy if you want finer control.
✅ All required indexes are present (you’ll see them in list_indexes if you run it). ❌ If you add new tables (e.g., client_requests), remember to enable RLS and create indexes on any FK used in policies.
✅ Extensions (uuid-ossp, pgcrypto, `pg_stat`
--
Quick Action Checklist
✅ Done ⬜ Pending
✅ Identify missing policies (RLS enabled, none defined). ⬜ Write CREATE POLICY statements (adjust column/role names).
✅ Decide on access model (client ↔ CPA ↔ admin). ⬜ Apply policies to the table.
✅ (Optional) Add a temporary admin‑bypass policy. ⬜ Create indexes on client_user_id, cpa_user_id, status.
✅ Verify policies via pg_policy. ⬜ Test each role’s ability to SELECT/INSERT/UPDATE/DELETE.
✅ Document the policy purpose. ⬜ Deploy migration and monitor logs for any permission errors.
```
