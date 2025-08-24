# NorthFinance - Professional Financial Management

NorthFinance is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. Built with React Native and Expo, it delivers a powerful, cross-platform experience on Android, iOS, and the web, ensuring that robust financial tools are accessible to everyone.

## Core Features

This application is a professional-grade tool built to facilitate the following tasks with precision and efficiency:

- **Bookkeeping & Reconciliation:** Accurately record all financial transactions (accounts payable/receivable, payroll) and reconcile them against bank records.
- **Financial Reporting:** Generate core financial statements, including the Profit & Loss (P&L) statement, Balance Sheet, and Cash Flow Statement.
- **Client Management:** A dedicated, multi-client workspace for CPAs to manage the books for multiple clients in a secure, segregated environment.
- **Tax Preparation:** Organize financial data, track deductible expenses, and prepare documentation for tax filings (e.g., Schedule C for businesses).
- **Budgeting & Forecasting:** Analyze historical data to create future budgets and financial models for effective planning.
- **Auditing & Compliance:** Ensure financial records adhere to legal standards like GAAP, with support for region-specific requirements (initially Sweden, UK, US).
- **Intelligent Document Scanning:** Use the device camera with OCR to extract text from receipts and invoices, automating data entry.
- **AI Assistant:** An integrated assistant with multi-provider support (OpenAI, Gemini, Claude) to help with financial queries and data analysis.
- **Multi-Currency Support:** Manage and convert between different currencies (e.g., SEK, EUR, USD) with real-time exchange rates.
// export image
## Role-Based Access Control

The application is built on a robust, role-based permission system to ensure data security and provide tailored functionality for every type of user.

| Role               | Description                                                        | Key Permissions                                                                                                                                              |
| :----------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Member** | The default role for all new users. Designed for personal use.     | • Manage own financial data<br>• Access core bookkeeping & budgeting<br>• Use camera scanning & AI assistant for personal data                                 |
| **Premium Member** | An upgraded role for users who need more powerful tools.           | • All Member permissions<br>• In-depth analytics & multi-year forecasting<br>• Advanced tax preparation summaries<br>• Export data to CSV                   |
| **Professional (CPA)** | A distinct account for accountants managing multiple clients.      | • Access a dashboard of assigned clients<br>• Full financial management within segregated client workspaces<br>• Generate professional reports for clients        |
| **Support** | An internal role for troubleshooting and user assistance.          | • Read-only access to specific user data for diagnostics<br>• View transaction logs and reports<br>• Cannot modify any financial data                      |
| **Administrator** | The highest-level internal role with full system oversight.        | • Full access to the Admin Panel<br>• Manage all users and assign roles<br>• Send global messages<br>• Perform system-wide auditing                          |

## Technical Architecture

The architecture is designed for security, scalability, and a seamless cross-platform experience.

- **Frontend:** Built with React Native and Expo (SDK 53), using TypeScript for type safety. Navigation is handled by Expo Router for a file-based, native feel.
- **Backend:** Powered by Supabase, utilizing a PostgreSQL database. This relational database is the industry standard for financial applications, ensuring data integrity and enabling complex, accurate reporting.
- **Authentication & Security:** User management and role-based access are handled through Supabase Auth, with Row Level Security (RLS) enabled on the database to ensure users and professionals can only access data they are explicitly permitted to see.
- **AI & Data Extraction:**
  - **OCR:** Camera-based document scanning will use a cloud-based OCR service to extract text from images.
  - **AI Providers:** The AI Assistant will connect to user-provided API keys for OpenAI, Google Gemini, and Anthropic Claude to perform analysis and answer questions.
- **Currency Conversion:** A real-time currency exchange rate API will be integrated to handle conversions between SEK, USD, EUR, and other currencies.

## Professional Access: CPA Workspace

When a CPA manages a client, they enter a secure, segregated workspace with the following capabilities and limitations:

#### **Full Financial Control:**

- **View Complete Dashboard:** See the client's metrics, charts, and transactions exactly as they do.
- **Full Bookkeeping:** Add, edit, and delete transactions; categorize income/expenses; manage journal entries.
- **Generate Reports:** Create and export P&L statements, Balance Sheets, and Cash Flow reports on the client's behalf.
- **Manage Budgets:** View, create, and adjust client budgets for financial planning.
- **Access Documents:** View all client-uploaded receipts and invoices for bookkeeping and tax preparation.
- **Perform Reconciliations:** Use integrated tools to reconcile book transactions against bank statements.

#### **Strict Privacy Limitations:**

To maintain client privacy and security, a CPA **cannot**:

- View or change the client's personal profile settings (name, email, password).
- Manage the client's personal API keys.
- See the client's subscription or billing information with NorthFinance.
- Access any other client's data from within an active client workspace.
