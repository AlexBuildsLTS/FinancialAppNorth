# NorthFinance: A Vision for Professional Financial Management

NorthFinance is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. Built with React Native and Expo, it delivers a powerful, cross-platform experience on Android, iOS, and the web. Our target users range from individuals and freelancers to small businesses and the accounting professionals who serve them.

Our vision is to create an intuitive and powerful financial management platform with a polished user interface, making robust financial tools accessible to everyone. We are committed to a refined user experience defined by clarity, elegance, and intuitive design.

---

## Visual Themes & Typography

The application features two meticulously crafted visual themes, with a seamless, animated toggle (sun/moon icons) available on both the login screen and in the settings menu. Typography is central to the design, utilizing the **Inter** font family for its exceptional legibility across all screen sizes and resolutions, ensuring a comfortable reading experience.

* **Light Theme**: Designed for clarity and focus in bright environments. It uses a soft, off-white (`#A5A2A5FF`) background to reduce eye strain, paired with crisp white (`#FFFFFF`) cards for content. Subtle shadows on these cards create a sense of depth and clear visual separation. A professional orange (`#BB4711FF`) serves as the primary accent for interactive elements.
* **Dark Theme**: Perfect for low-light conditions. It features a deep navy blue (`#0A192F`) background and a slightly lighter navy (`#172A45`) for surfaces and cards. A vibrant green (`#1DB954`) accent provides a modern, energetic contrast, while all text is rendered in pure white (`#FFFFFF`) or a light slate gray (`#8892B0`) for maximum readability.

---

## Interactive & Insightful Data Visualization

Data is brought to life through a suite of modern, interactive, and smoothly animated charts, rendered with hardware acceleration to ensure fluid performance.

### Chart Variety

The dashboard provides a comprehensive financial overview at a glance using a mix of visualizations:

* **Ring & Donut Charts**: Ideal for visualizing portfolio composition or expense categories.
* **Line Charts**: Perfectly suited for tracking trends over time, such as net worth growth.
* **Bar Charts**: Used for direct comparisons, like monthly spending or revenue streams.
* **Heat Maps & Tree Maps**: Available for advanced analysis to visualize complex hierarchical data, such as portfolio diversification across multiple market sectors and sub-sectors.

### Deep Interactivity & Drill-Down

All charts are fully reactive and designed for exploration.

* On the web, hovering the mouse over any data point will trigger a sleek, informative tooltip. On mobile, the same is achieved with a gentle tap or long-press.
* Charts support **drill-down** functionality. For example, tapping the "Software" slice of an expense pie chart will navigate the user to a new, detailed view that breaks down every software transaction for that period, complete with its own granular visualization.

---

## Secure & User-Friendly Authentication

The entire authentication process is engineered to be secure, transparent, and convenient, fortified with modern security standards.

* **Multi-Factor Authentication (MFA)**: Users can significantly enhance their account security by enabling MFA. The platform supports both Time-based One-Time Password (TOTP) applications (like Google Authenticator or Authy) and biometric authentication via **WebAuthn/Passkeys**, allowing for passwordless sign-ins using Face ID, Touch ID, or Windows Hello.
* **Password Visibility Toggle**: All password input fields feature an "eye" icon to toggle visibility, helping prevent typos.
* **Terms of Service Agreement**: The registration screen includes a mandatory checkbox requiring users to agree to the Terms of Service and Privacy Policy.
* **"Remember Me" Option**: For convenience, this option securely persists the user's session on a trusted device.
* **Real-time Password Strength Indicator**: A visual indicator provides immediate feedback on password strength during registration, guiding users to create more secure credentials.

---

## Interactive Elements & Contextual UI

* **Smooth Notification Dropdown**: The fluidly animated notification dropdown in the header displays a badge with the unread count. When opened, it reveals a categorized list of messages (e.g., 'System', 'Messages', 'Alerts') with filter tabs, timestamps, and the ability to mark items as read or clear all.
* **Intuitive & Contextual Navigation**: Primary navigation is handled by a clean, icon-driven bottom tab bar. Secondary actions are located in a **contextual header**, which adapts to the current screen. For example, the `Transactions` screen header will display prominent 'Filter' and 'Export' buttons, while the `Budgets` screen header will show a 'Create New Budget' action.

---

## Enhanced Core Features

* **Bookkeeping & Reconciliation**: Accurately record all financial transactions following double-entry principles. Users can set up **customizable categorization rules** (e.g., all transactions from "Spotify" are automatically categorized as "Entertainment"). The system supports managing multiple sets of books, ideal for users separating personal and business finances.
* **Financial Reporting**: Generate core financial statements (P&L, Balance Sheet, Cash Flow). `Premium Members` and `CPAs` can create **brandable reports** with custom logos and schedule reports to be automatically generated and emailed on a recurring basis (e.g., weekly, monthly).
* **Client Management**: A dedicated, multi-client workspace for CPAs.
* **Tax Preparation**: Organize data and prepare documentation for tax filings, including the generation of **country-specific tax summaries** to streamline the process (initially supporting Sweden, UK, US standards).
* **Budgeting & Forecasting**: Create future budgets and financial models. The platform supports various methodologies, including **envelope budgeting**, and allows for **rollover budgets**, where unused or overspent amounts from one period automatically carry over to the next.
* **Auditing & Compliance**: Ensure records adhere to legal standards like GAAP. An **immutable audit log** is maintained for every financial transaction, providing a complete, timestamped history of its creation and all subsequent modifications.
* **Intelligent Document Scanning**: Use the device camera with a cloud-based OCR service to automate data entry from receipts and invoices.
* **AI Assistant**: An integrated assistant with multi-provider support (OpenAI, Gemini, Claude). The dedicated screen for API key management will also display **usage metrics** (e.g., token counts), allowing users to monitor their consumption.
* **Real-time Messaging**: A dedicated, end-to-end encrypted chat feature for direct user-to-user communication. The chat supports **@mentions** to notify specific users within a group conversation.
* **Currency Conversion**: A real-time currency exchange rate API will handle conversions between SEK, USD, EUR, and other currencies. The system will also automatically calculate and report on **unrealized gains and losses** for assets held in foreign currencies.

---

## Advanced Role-Based Access Control (RBAC)

The application is built on a robust, role-based permission system to ensure data security and provide tailored functionality for every type of user.

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Member** | The default role for all new users. Designed for personal use. | • Manage own financial data<br />• Access core bookkeeping & budgeting<br />• Use camera scanning & AI assistant for personal data<br />• Initiate CPA connection requests |
| **Premium Member** | An upgraded role for users who need more powerful tools. | • All Member permissions<br />• In-depth analytics & multi-year forecasting<br />• Advanced tax preparation summaries<br />• Export data to CSV/PDF<br />• Create custom categorization rules<br />• Set up scheduled reporting |
| **Professional (CPA)** | A distinct account for accountants managing multiple clients. | • Access a dashboard of assigned clients<br />• Full financial management within segregated client workspaces<br />• Generate professional, brandable reports for clients<br />• Use secure messaging with clients |
| **Support** | An internal role for troubleshooting and user assistance. | • Read-only access to specific user data *with explicit user consent*<br />• View transaction logs and system diagnostics<br />• Cannot modify any financial data |
| **Administrator** | The highest-level internal role with full system oversight. | • Full access to the Admin Panel<br />• Manage all users and assign roles<br />• Access system health dashboards<br />• Manage feature flags<br />• Perform system-wide auditing<br />• Oversee all CPA-client connections |

---

## Comprehensive Workspaces & Panels

### The Professional (CPA) Workspace

When a CPA manages a client, they enter a secure, segregated workspace with the following capabilities and limitations:

#### Full Financial Control

* View Complete Dashboard: See the client's metrics, charts, and transactions exactly as they do.
* Full Bookkeeping: Add, edit, and delete transactions; categorize income/expenses; manage journal entries.
* Generate Reports: Create and export P&L statements, Balance Sheets, and Cash Flow reports on the client's behalf.
* Manage Budgets: View, create, and adjust client budgets for financial planning.
* Access Documents: View all client-uploaded receipts and invoices for bookkeeping and tax preparation.
* Perform Reconciliations: Use integrated tools to reconcile book transactions against bank statements.

#### Strict Privacy Limitations

To maintain client privacy and security, a CPA **cannot**:

* View or change the client's personal profile settings (name, email, password).
* Manage the client's personal API keys or MFA settings.
* See the client's subscription or billing information with NorthFinance.
* Access any other client's data from within an active client workspace.

---

### The Administrator Panel

The Admin Panel is a comprehensive, restricted-access dashboard for full system management, segmented into logical modules:

* **User Management**: View, search, and filter the entire user list. Edit user profiles, manually assign roles, and suspend, unsuspend, or delete user accounts. View detailed, immutable activity logs for any user.
* **System Analytics Dashboard**: Visualize key business and health metrics: new user sign-ups, daily/monthly active users, total transactions, API error rates, and average database query times.
* **Global Messaging System**: Compose and broadcast announcements or critical alerts to all users or specific roles (e.g., "Upcoming maintenance notice to all CPA users").
* **Financial Oversight & Auditing**: Access high-level, anonymized financial aggregates for trend analysis. Review system-wide audit logs for security and compliance checks.
* **Client & CPA Management**: Oversee and manage the assignment and status of all client-to-CPA professional connections.
* **Subscription & Plan Management**: Interface with the payment provider (e.g., Stripe) to view subscription statuses, manage pricing plans, and handle billing issues.
* **Content Management**: Manage static content within the app, such as FAQ articles, tutorials, and onboarding guides.

---

### Client Onboarding & Assignment Workflow

The connection between a client and a CPA is a secure, **client-initiated process** designed to ensure consent and control at every step.

1. **Client Invitation**: A `Member` or `Premium Member` navigates to the "My Accountant" section in their profile to search for a registered CPA by name, firm, or verified email.
2. **Permission Scoping**: The client defines the **scope of access** by choosing from predefined levels (e.g., "Full Management Access," "Tax Season Read-Only"), ensuring the CPA receives only the necessary permissions.
3. **CPA Notification & Review**: The CPA receives a secure notification and a pending invitation appears in their "Client Management" dashboard for review.
4. **Acceptance & Connection**: If accepted, the connection is established. The client is added to the CPA's active client list, and the CPA can access the client's workspace.
5. **Access Revocation**: **The client retains ultimate control**. They can modify permissions or revoke access entirely with a single click. The CPA can also terminate the relationship.
6. **Administrator Oversight**: An `Administrator` can view and, in cases of disputes, forcibly sever any professional-client connection.

---

### A Living Interface: The Philosophy of Animation

Animations are a core component of the user experience, providing feedback, guiding focus, and creating a sense of quality.

* **Component & Screen Transitions**: New screens slide in with native, physics-based transitions. Data-heavy screens first display shimmering skeleton loaders that precisely match the layout of the content, which then gracefully fade out as the real data fades in.
* **Data State Changes**: When a value in a metric card updates, the numbers animate a quick scroll from the old value to the new.
* **Micro-interactions & Tactile Feedback**: Buttons subtly scale down on press. When an item is deleted from a list, it animates its height to zero and fades out, and the surrounding items smoothly animate to fill the empty space.
* **Navigational Cues**: The active icon in the bottom tab bar performs a subtle animation, like a gentle bounce, to clearly indicate the current state.
* **Chart Animations on Load**: When a chart widget comes into view, it animates in: bars grow up from the X-axis, line charts are "drawn" across the screen, and donut slices expand radially from the center.

---

### Bottom Tab Bar Navigation

| Icon (lucide-react-native) | Route | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `Chrome` | `/` | Navigates to the main dashboard screen. | All |
| `Briefcase` | `/clients` | Access client management workspace. | CPA, Administrator |
| `CreditCard` | `/transactions` | Manage all financial transactions. | All |
| `Camera` | `/camera` | Open document scanner with OCR. | All |
| `FileText` | `/documents` | View and manage uploaded documents. | All |
| `MessageCircle` | `/support` | Access the user support center. | All |

### Header Navigation (Top Right)

| Icon (lucide-react-native) | Action / Route | Description | Access Roles |
| :--- | :--- | :--- | :--- |
| `Bell` | (Component) | Opens the interactive Notification Dropdown. | All |
| `MessageCircle` | `/chat` | Navigates to the real-time messaging/chat interface lobby. | All |
| `Settings` | `/settings` | Navigates to the application settings screen. | All |
| `User` | `/profile` | Navigates to the user's personal profile and account settings. | All |

---

## Refined Technical Architecture

* **Frontend**: Built with React Native and Expo (SDK 53), using TypeScript for type safety. Navigation is handled by Expo Router for a file-based, native feel.
* **Backend**: Powered by Supabase, utilizing a PostgreSQL database. This relational database is the industry standard for financial applications, ensuring data integrity and enabling complex, accurate reporting.
* **Authentication & Security**: User management and role-based access are handled through Supabase Auth, with Row Level Security (RLS) enabled on the database.
* **Real-time Capabilities**: The platform heavily utilizes **Supabase Realtime**. When one user (e.g., a CPA) modifies data, the changes are pushed instantly to all other subscribed clients (e.g., the business owner's dashboard), ensuring all views are always in sync without needing manual refreshes.
* **AI & Data Extraction**:
  * **OCR**: Camera-based document scanning will use a cloud-based OCR service, invoked by a Supabase Edge Function.
  * **AI Providers**: The AI Assistant will connect to user-provided API keys for OpenAI, Google Gemini, and Anthropic Claude.
* **Currency Conversion**: A real-time currency exchange rate API will be integrated to handle conversions.
* **Deployment**: The web application will be deployed to **Vercel** for optimal performance and scalability. Mobile builds will be managed and distributed via **EAS (Expo Application Services)** to the Apple App Store and Google Play Store.

---

## Platform notes (important for E2EE & secure storage)

- Web: Expo web uses the config in app.config.js (extra) — ensure SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_FUNCTIONS_URL and ADMIN_API_KEY are set in your environment before running (the project uses app.config.js to expose them during dev/build).
- Secure storage: mobile uses expo-secure-store. Web falls back to localStorage (a best-effort fallback only). For production-grade key storage on web consider a server-backed key escrow or browser platform features (WebAuthn).
- Crypto polyfill (React Native): window.crypto.subtle is available in browsers but not in React Native by default. For native builds you should install a polyfill:
  - react-native-get-random-values
  - react-native-quick-crypto or react-native-webcrypto
  Then follow their setup instructions and add globalThis.crypto polyfill before any crypto usage.
