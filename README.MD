NorthFinance, A FinTech Website and Application grounded in three core principles:Clarity: An intuitive, sleek interface that makes complex financial data easy to understand.Power: A robust feature suite that serves personal, premium, and professional users.Security: A non-negotiable, enterprise-grade foundation that protects all user data.I. Core Technology Stack & ServicesThis is the complete and final technology stack, selected for stability (LTS/stable versions), performance, and seamless integration.Core Runtime: React Native (via Expo SDK ~50.0.0, a stable LTS release)Language: TypeScript (with strict mode enabled)Backend-as-a-Service (BaaS): SupabaseDatabase: PostgreSQL (for relational data integrity)Authentication: Supabase Auth (handling email/pass, social, and MFA)Security: PostgreSQL Row Level Security (RLS)Realtime: Supabase Realtime (for live updates, e.g., in chat/notifications)Storage: Supabase Storage (for documents, avatars, and receipt scans)Serverless Logic: Supabase Edge Functions (Deno-based, for OCR, AI proxying, etc.)Frontend Architecture:Navigation: Expo Router (v3) (for file-based, native, and web-friendly routing)UI & Animation: React Native Reanimated (v3) (for all 60fps, fluid animations and micro-interactions)Data Fetching & State: TanStack Query (v5) (for server state management, caching, and optimistic updates)Icons: lucide-react-native (for a clean, consistent icon set as specified)Secure Storage (Mobile): expo-secure-store (for hardware-backed storage of auth tokens and E2EE keys)Deployment:Web Application: Vercel (for seamless integration with our Next.js/Expo web build)Mobile Builds: EAS (Expo Application Services) (for building and distributing to Apple App Store & Google Play Store)II. Functional Specification (Features)This is the definitive, de-duplicated feature set, consolidated from all documents.Core Personal Finance (Member Role)Intelligent Document Scanning: Camera-based OCR for receipts/invoices.Secure Document Management: A vault for uploading, viewing, and attaching files to transactions.AI Assistant: Integrated chat (via Supabase Edge Function proxy) for financial questions.Budgeting & Forecasting: Includes envelope budgeting and rollover budget support.Bookkeeping: Double-entry accounting principles for accurate transaction management.Standard Reports: Generation of essential reports (P&L, Balance Sheet).Premium Member EnhancementsIn-Depth Analytics: Multi-year forecasting and comparative data analysis.Advanced Tax Summaries: Country-specific (SE, UK, US) tax preparation reports.Data Export: Export transactions and reports to CSV/PDF.Custom Categorization Rules: Automated transaction categorization.Scheduled Reporting: Automated, recurring email reports.Professional (CPA) SuiteClient Management Dashboard: A central hub to view all assigned clients and pending requests.Segregated & Secure Workspaces: A sandboxed environment for managing each client's data.Brandable Reporting: Generate reports customized with the CPA's firm logo.Universal SystemsSupport Ticket System:User View: Create New Ticket & View My Tickets.Staff View (Support/Admin): A full management dashboard with filtering and private Internal Notes.Secure E2EE Messaging: End-to-end encrypted real-time chat between users and their connected CPAs.III. Security & Data ArchitectureSecurity is the application's foundation. The architecture is designed to be secure by default.Authentication: Managed by Supabase Auth. We will fully support email/password, social logins, and MFA (both TOTP and WebAuthn/Passkeys).Authorization: All data access is governed by PostgreSQL Row Level Security (RLS). No user (including CPAs and Admins) can access data they do not own or have explicit, table-level permission for.Data Privacy:E2EE: All sensitive chat messages will be end-to-end encrypted.Secure Storage: expo-secure-store will be used on mobile to store private keys and auth tokens.Database Schema: The schema will be built on relational principles.A profiles table will store user data (like role, first_name) and will be linked 1:1 with the auth.users table.A cpa_client_map table will manage the connection (and its status: 'pending', 'accepted') between CPAs and Members.A custom PostgreSQL function is_linked_cpa(client_id) will be used within RLS policies to grant CPAs secure access only to their 'accepted' clients' data.An audit_log table will immutably record all sensitive actions (role changes, client connections) via database triggers.IV. User Experience (UX) & Visual Design (UI)The application will look and feel modern, fluid, and trustworthy, directly reflecting the vision in the FinalUIModel.webm video.Visual IdentityTypography: Inter font family for all text.Light Theme:Background: #F0F2F5 (Soft Off-White)Cards: #FFFFFF (Crisp White)Accent: #BB4711 (Professional Orange)Dark Theme:Background: #0A192F (Deep Navy)Cards: #172A45 (Lighter Navy)Accent: #1DB954 (Vibrant Green)A Living Interface: The Philosophy of AnimationAnimations are fundamental to the user experience. All animations will be high-performance (60fps) using React Native Reanimated.Screen Transitions: Native, physics-based slides and fades.Data Loading: Shimmering skeleton loaders that match the content's layout will be displayed first, then gracefully fade out as the real data fades in.Data State Changes: Metric cards and chart values will animate, (e.g., numbers scrolling) from the old value to the new.Micro-interactions:Tactile Feedback: Buttons and tabs will have subtle scale/opacity animations on press.List Manipulation: Deleting an item from a list will animate its height to 0 and fade it out, with surrounding items smoothly animating to fill the gap.Navigational Cues: The active icon in the bottom tab bar will perform a gentle animation (e.g., bounce or slide) to provide clear feedback.Dynamic UI ComponentsUser Avatar: Located in the header, this component will display the user's avatar_url. If null, it will programmatically generate and display the user's initials (e.g., "JD") on a consistent, colored background.Profile Dropdown: Clicking the avatar opens a role-aware menu. A Ticket Management link will only be visible to Support and Administrator roles.V. Role-Based Access Control (RBAC) & NavigationThis is the definitive guide to application roles and the dynamic navigation they control.Role DefinitionsRoleDescriptionKey PermissionsMemberDefault role for personal use.• Manage own financial data, budgets, documents.<br />• Use camera scanning & AI assistant.<br />• Create and manage support tickets.Premium MemberUpgraded role for power users.• All Member permissions, plus:<br />• In-depth analytics & multi-year forecasting.<br />• Advanced tax summaries & CSV/PDF export.<br />• Create custom categorization rules & scheduled reports.Professional (CPA)Distinct account for accountants.• Access the Clients dashboard.<br />• Enter secure, segregated client workspaces.<br />• Perform full financial management for clients.<br />• Generate brandable reports & use E2EE chat.SupportInternal role for user assistance.• Access staff-level ticket management system.<br />• Read-only access to user data with consent.<br />• Cannot modify any user financial data.AdministratorHighest-level internal role.• Full access to the Admin Panel.<br />• Full user management (all roles).<br />• System health dashboards & feature flag management.<br />• Oversee all CPA-client connections.Dynamic Tab Bar NavigationThe bottom tab bar is the primary navigation. It is dynamic, and users only see the tabs available to their role.Icon (lucide-react-native)TitleDescriptionVisible ToHomeDashboardMain financial overview, charts, and metrics.AllListTransactionsDetailed, searchable list of all transactions.Member, Premium, CPA, AdminScanEyeScanScan physical documents with OCR.Member, PremiumFileTextDocumentsSecure vault for uploading and managing files.Member, Premium, CPA, AdminBarChart2ReportsGenerate financial reports (P&L, Balance Sheets).Member, PremiumUsersRoundClientsClient management dashboard.CPA, Support, AdminBriefcaseSupportCreate and view support tickets.All (View is upgraded for staff)SettingsSettingsConfigure profile, security, and app settings.AllNote: AI Chat will be a Floating Action Button (FAB) or Header icon, and Admin Panel is a separate stack.VI. Optimal Codebase StructureThis is the complete, feature-based directory structure. It is designed for maximum scalability, maintainability, and developer clarity./northfinance

´´´
├── .expo/                   # Expo cache files
├── .vscode/                 # VS Code workspace settings
├── assets/                  # Static assets
│   ├── fonts/               # Inter font files (e.g., Inter-Regular.ttf)
│   └── images/              # Logos, splash screen, etc.
├── supabase/                # Supabase project configuration
│   ├── functions/           # Supabase Edge Functions (Deno/TypeScript)
│   │   ├── ocr-scan/        # OCR function for document scanning
│   │   ├── ai-proxy/        # Secure proxy for AI chat providers
│   │   └── ...
│   ├── migrations/          # SQL database migrations (schema, RLS policies)
│   └── config.toml          # Supabase local project config
├── src/                     # Main application source code
│   ├── app/                 # Expo Router (v3) file-based routes
│   │   ├── (auth)/          # Group for unauthenticated users
│   │   │   ├── _layout.tsx  # Stack layout for auth screens
│   │   │   ├── login.tsx    # Login screen
│   │   │   └── register.tsx # Register screen
│   │   ├── (main)/          # Group for authenticated users (the main app)
│   │   │   ├── _layout.tsx  # Main Tabs layout (dynamic, role-based)
│   │   │   ├── index.tsx    # Dashboard screen (Home tab)
│   │   │   ├── transactions.tsx # Transactions screen
│   │   │   ├── scan.tsx     # Scan screen (Member/Premium only)
│   │   │   ├── documents.tsx  # Documents screen
│   │   │   ├── reports.tsx  # Reports screen (Member/Premium only)
│   │   │   ├── clients/     # CPA-only client stack
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── index.tsx      # Client list
│   │   │   │   └── [id].tsx     # Single client workspace
│   │   │   ├── support.tsx  # Support tickets screen
│   │   │   ├── settings.tsx # Settings screen
│   │   │   └── admin/       # Admin-only stack
│   │   │       ├── _layout.tsx
│   │   │       └── index.tsx  # Admin dashboard
│   │   ├── _layout.tsx      # Root layout (manages AuthProvider, ThemeProvider)
│   │   └── +not-found.tsx   # 404 handler
│   ├── assets/              # Re-exported static assets (fonts, images)
│   ├── components/          # **SHARED** UI components (dumb, reusable)
│   │   ├── Animated/        # Reusable animation components
│   │   │   ├── AnimatedFadeIn.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   ├── core/            # Core UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Text.tsx     # Custom Text component using Inter font
│   │   └── Avatar.tsx       # User avatar with initials fallback
│   ├── constants/           # Global constants
│   │   └── theme.ts         # Theme definitions (colors, spacing, typography)
│   ├── context/             # Global React Contexts
│   │   ├── AuthProvider.tsx # Manages auth session and user profile/role
│   │   └── ThemeProvider.tsx# Manages light/dark mode
│   ├── features/            # **BUSINESS LOGIC** (feature-specific code)
│   │   ├── admin/           # Admin panel logic
│   │   ├── ai-chat/         # AI Assistant components, hooks (useChat)
│   │   ├── auth/            # Auth logic (useSignIn, useSignUp)
│   │   ├── budgets/         # Budgeting components, hooks
│   │   ├── client-management/# CPA client hooks, components
│   │   ├── documents/       # Document vault logic, upload component
│   │   ├── reports/         # Chart components, report generation
│   │   ├── scan/            # OCR camera UI, logic
│   │   ├── settings/        # Profile edit, MFA setup components
│   │   ├── support-tickets/ # Support ticket components (user/staff)
│   │   └── transactions/    # Transaction list, filter, edit components
│   ├── hooks/               # **SHARED** React hooks
│   │   ├── useTheme.ts      # Consumes ThemeContext
│   │   ├── useAuth.ts       # Consumes AuthContext
│   │   └── usePermissions.ts# Hook to check user role/permissions
│   ├── lib/                 # Library initialization
│   │   ├── queryClient.ts   # TanStack Query client instance
│   │   └── supabase.ts      # Supabase client instance
│   ├── services/            # **API Layer** (abstracts Supabase calls)
│   │   ├── apiAuth.ts       # All Supabase `auth` calls
│   │   ├── apiDatabase.ts   # All Supabase `database` (PostgREST) calls
│   │   └── apiStorage.ts    # All Supabase `storage` calls
│   └── types/               # TypeScript definitions
│       ├── index.ts         # Custom app-wide types
│       └── supabase.ts      # Auto-generated Supabase types (from schema)
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── app.config.js            # Expo config file (app name, splash, icons)
├── babel.config.js          # Babel config (with reanimated plugin)
├── eas.json                 # EAS build configuration
├── package.json             # Project dependencies and scripts
└── tsconfig.json            # TypeScript configuration
(with strict mode and path aliases)
´´´
VII. Concluding StatementThis blueprint is the definitive strategic and architectural foundation for NorthFinance. It synthesizes all project goals into a single, actionable plan. By adhering to this structure, we will build a secure, powerful, and sleek application that is maintainable, scalable, and fully realizes the project's ambitious vision.
