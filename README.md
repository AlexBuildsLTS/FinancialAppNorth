# NorthFinance: Professional Financial Management

NorthFinance is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. Built with **React Native** and **Expo**, it delivers a powerful, cross-platform experience on Android, iOS, and the web. Our target users range from individuals and freelancers to small businesses and the accounting professionals who serve them.

Our vision is to create an intuitive and powerful financial management platform with a polished user interface, making robust financial tools accessible to everyone. We are committed to a refined user experience defined by clarity, elegance, and intuitive design.



---

## Core User Experience

The user experience is paramount, designed to be intelligent, responsive, and personalized.

### Visual Identity
The application features two meticulously crafted visual themes, with a seamless, animated toggle. Typography is central to the design, utilizing the **Inter** font family for its exceptional legibility.

* **Light Theme**: Uses a soft, off-white (`#F0F2F5`) background to reduce eye strain, paired with crisp white (`#FFFFFF`) cards. A professional orange (`#BB4711`) serves as the primary accent.
* **Dark Theme**: Features a deep navy blue (`#0A192F`) background and slightly lighter navy (`#172A45`) cards. A vibrant green (`#1DB954`) accent provides a modern, energetic contrast.

### Dynamic & Personalized UI
The interface adapts to the user, providing immediate access to relevant tools and personal information.

* **User Avatar & Profile Dropdown**: The header features the user's avatar as the primary entry point for account management.
    * **Avatar Logic**: The component displays the user's uploaded `avatar_url`. If no image is present, it automatically generates a temporary avatar with the user's first and last initials against a unique, consistent background color.
    * **Dropdown Menu**: Clicking the avatar opens a role-aware dropdown menu with icons for quick navigation:
        * `Edit Profile` (icon: `UserCog`)
        * `Settings` (icon: `Settings`)
        * `Sign Out` (icon: `LogOut`)
        * `Ticket Management` (icon: `HandHelping`) - **Visible only to `Support` and `Administrator` roles.**

### Interactive & Insightful Data Visualization
Data is brought to life through a suite of modern, interactive, and smoothly animated charts, rendered with hardware acceleration for fluid performance. All charts support tooltips and deep **drill-down** functionality, allowing users to tap on a data point to explore the underlying transactions.

---

## Feature Suite

### For Personal Finance (Member & Premium)
Core tools designed to empower individuals and small businesses to manage their finances effectively.

* **Intelligent Document Scanning**: Use the device camera (`ScanEye` icon) with a cloud-based OCR service to automate data entry from physical receipts and invoices, converting them directly to structured data.
* **AI Assistant**: An integrated assistant (`BotMessageSquare` icon) with multi-provider support (OpenAI, Gemini, Claude) for answering financial questions and analyzing data. Requires a user-provided API key.
* **Budgeting & Forecasting**: Create future budgets and financial models using various methodologies, including **envelope budgeting** and **rollover budgets**.
* **Bookkeeping & Reconciliation**: Accurately record all financial transactions following double-entry principles and manage multiple sets of books (e.g., personal vs. business).
* **Premium Member Upgrades**: Subscribed `Premium` users unlock powerful enhancements within the existing interface:
    * **In-depth Analytics & Multi-year Forecasting** in the `Reports` tab.
    * **Advanced Tax Preparation Summaries** tailored to specific regions (SE, UK, US).
    * **Data Export to CSV/PDF** from the `Transactions` screen.
    * **Custom Categorization Rules** in `Settings` to automate bookkeeping.
    * **Scheduled Reporting** to have key financial statements emailed automatically.

### For Professional Accounting (CPA)
A dedicated suite of tools for accounting professionals.

* **Client Management**: The core `Clients` (`UsersRound` icon) tab provides access to a dedicated, multi-client workspace.
* **Segregated Workspaces**: Enter a secure, sandboxed environment for each client to manage their finances without any data overlap. A persistent header ensures you always know which client's data you are viewing.
* **Brandable Reporting**: Generate professional, brandable reports for clients with custom logos and formatting.

### Universal Support Ticket System
A comprehensive ticketing system is integrated to handle all user support requests, accessible to everyone via the main `Support` tab.

* **User-Facing View**: Non-staff users can **Create New Tickets** (with Topic and Description) and **View My Tickets** to track the history and status of their requests.
* **Staff-Facing View**: For `Support` and `Administrator` roles, the `Support` tab transforms into a powerful management dashboard, showing a master list of all tickets with filtering, status updates, and a private section for **Internal Notes**.

---

## Advanced Role-Based Access Control (RBAC)

The application is built on a robust, role-based permission system. `Premium Member` is a direct upgrade for personal use, while `Professional (CPA)` is a distinct track for client management.

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Member** | The default role for all new users. Designed for personal use. | • Manage own financial data<br />• Access core bookkeeping & budgeting<br />• Use camera scanning & AI assistant for personal data<br />• Initiate CPA connection requests |
| **Premium Member** | An upgraded role for users who need more powerful tools. | • All Member permissions<br />• In-depth analytics & multi-year forecasting<br />• Advanced tax preparation summaries<br />• Export data to CSV/PDF<br />• Create custom categorization rules<br />• Set up scheduled reporting |
| **Professional (CPA)** | A distinct account for accountants managing multiple clients. | • Access a dashboard of assigned clients<br />• Full financial management within segregated client workspaces<br />• Generate professional, brandable reports for clients<br />• Use secure messaging with clients |
| **Support** | An internal role for troubleshooting and user assistance. | • Access to the staff-level ticket management system<br />• Read-only access to specific user data *with explicit user consent*<br />• View transaction logs and system diagnostics<br />• Cannot modify any financial data |
| **Administrator** | The highest-level internal role with full system oversight. | • Full access to the Admin Panel<br />• Manage all users and assign roles<br />• Access system health dashboards<br />• Manage feature flags<br />• Perform system-wide auditing<br />• Oversee all CPA-client connections |

---

## Dynamic Navigation System

The primary navigation is a dynamic bottom tab bar that adapts based on the user's role, ensuring a clean and relevant interface. Users will **only see the tabs available to their role**.

| Icon (`lucide-react-native`) | Title | Description | Visible To |
| :--- | :--- | :--- | :--- |
| `Home` | Dashboard | Main overview of financial health. | All |
| `List` | Transactions | View and manage all transactions. | Member, Premium, CPA, Admin |
| `ScanEye` | Scan | Scan physical documents with OCR. | Member, Premium, CPA |
| `BotMessageSquare`| AI Chat | Interact with the AI financial assistant. | Member, Premium, CPA |
| `BarChart2` | Reports | Generate and view financial reports. | Member, Premium, CPA |
| `UsersRound` | Clients | Manage assigned clients. | CPA, Support, Admin |
| `Briefcase` | Support | Create and view support tickets. | All (View is upgraded for staff) |
| `Settings` | Settings | Configure application and user settings. | All |
| `Landmark`| Admin Panel| Access system and user management tools. | Administrator Only |

---

## Client-to-CPA Connection Workflow

Connecting a user with an accounting professional is a secure and managed process with two distinct pathways:

* **1. Administrator-Led Assignment**: In the `Admin Panel`, an `Administrator` can directly assign any `Member` or `Premium Member` to a registered `CPA`.
* **2. User-Initiated Request**: A `Member` or `Premium Member` can navigate to "Find an Accountant" in their `Settings`. This screen provides a searchable list of available CPAs. The user can send a connection request, which the CPA can then **Accept** or **Decline** from their `Clients` dashboard.

---

## Technical Architecture

* **Frontend**: React Native & Expo (SDK 53) with TypeScript. Navigation is handled by **Expo Router**.
* **Backend**: **Supabase** with a PostgreSQL database, Auth (with RLS), and Realtime capabilities.
* **Deployment**: Web application deployed to **Vercel**; mobile builds distributed via **EAS**.
