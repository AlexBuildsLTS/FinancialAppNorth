---
description: 'Description of the custom chat mode.'
tools: ['codebase', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'terminalSelection', 'terminalLastCommand', 'openSimpleBrowser', 'fetch', 'findTestFiles', 'searchResults', 'githubRepo', 'extensions', 'runTests', 'editFiles', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'dbclient-getDatabases', 'dbclient-getTables', 'dbclient-executeQuery']
---
Define the purpose of this chat mode and how AI should behave: response style, available tools, focus areas, and any mode-specific instructions or constraints.

I understand your frustration and the need for absolute clarity regarding the NorthFinance project. My apologies for any previous misunderstandings. I will now rewrite the project description and rules in an extremely detailed and understandable way, focusing on the project layout, role-based access, and core features, ensuring no more mistakes are made.

The core principle for roles is **hierarchical access for Member/Premium/Admin**, but **distinct, specialized access for CPA and Support**. This means:

*   **Member** has a base set of features and tabs.
*   **Premium Member** has *all* Member features/tabs, *plus* additional advanced features/tabs.
*   **Administrator** has *full system oversight* via a dedicated Admin Panel, and can also access *all* features/tabs available to Members and Premium Members if they were to use the main application interface (though their primary interaction is through the Admin Panel).
*   **Professional (CPA)** has a *specialized set of tabs and features* focused on client management, which are distinct from personal finance features. They do *not* automatically get all Member/Premium features.
*   **Support** has *highly restricted, read-only internal access* and no user-facing tabs.

Let's break down NorthFinance with this understanding.

---

# NorthFinance: A Comprehensive Design and User Experience Audit & Project Definition

## Executive Summary

NorthFinance is envisioned as a cutting-edge, cross-platform financial management application built with React Native and Expo, targeting a diverse user base from individuals to accounting professionals. The application prioritizes a refined user experience through dual themes, interactive data visualization, robust security, and a meticulously designed role-based access control system. This audit aims to thoroughly evaluate the current design vision and provide actionable, prioritized recommendations to ensure NorthFinance delivers on its promise of intuitive, powerful, and accessible financial tools. Key areas of focus include visual consistency, navigation clarity, role-specific user journeys, and the seamless integration of advanced features like AI assistance and real-time data.

---

## Project Vision & Core Principles

**NorthFinance: Professional Financial Management** is a sleek, modern, and feature-rich financial application designed for both personal finance management and professional accounting. It delivers a powerful, cross-platform experience on Android, iOS, and the web, built with React Native and Expo.

**Target Users:** Individuals, freelancers, small businesses, and accounting professionals (CPAs).

**Overarching Vision:** To create an intuitive and powerful financial management platform with a polished user interface, making robust financial tools accessible to everyone. We are committed to a refined user experience defined by clarity, elegance, and intuitive design.

**Core Values & Design Philosophy:**

*   **Clarity & Legibility:** Financial data must be easy to understand at a glance.
*   **Elegance & Modernity:** A professional, visually appealing interface.
*   **Intuitive Design:** Features should be discoverable and easy to use without extensive training.
*   **Security & Trust:** Handling sensitive financial data requires top-tier security and transparent practices.
*   **Performance:** Fluid animations and responsive interactions across all platforms.
*   **Scalability:** Designed to grow with user needs and data complexity.

---

## 1. Visual Design Assessment

### 1.1 Dual Theme Approach (Light/Dark)

*   **Evaluation:** The dual theme approach is well-defined, offering distinct visual experiences for different lighting conditions. The animated toggle provides a smooth transition, enhancing the user experience.
*   **Light Theme (`#A5A2A5FF` background, `#FFFFFF` cards, `#BB4711FF` accent):** The choice of a soft off-white background is excellent for reducing eye strain in bright environments. Crisp white cards with subtle shadows provide good visual separation and depth. The professional orange accent (`#BB4711FF`) is a strong, warm color that can effectively highlight interactive elements.
*   **Dark Theme (`#0A192F` background, `#172A45` cards, `#1DB954` accent):** The deep navy background and slightly lighter navy for surfaces create a sophisticated and comfortable experience for low-light conditions. The vibrant green accent (`#1DB954`) offers a modern, energetic contrast, which is a good choice for drawing attention to key actions or data points. Pure white and light slate gray text (`#FFFFFF`, `#8892B0`) ensure maximum readability against the dark backgrounds.
*   **Recommendation:**
    *   **High Priority:** Conduct contrast ratio checks for all text and interactive elements against both background and card colors in both themes to ensure WCAG AA or AAA compliance. Pay particular attention to the light slate gray (`#8892B0`) text on the dark navy background (`#172A45`).
    *   **Medium Priority:** Explore how the accent colors (`#BB4711FF` for light, `#1DB954` for dark) are used consistently across all interactive elements (buttons, links, active states) and data visualizations to maintain a cohesive brand identity.

### 1.2 Color Palette Choices and Accessibility

*   **Evaluation:** The chosen palettes are aesthetically pleasing and generally align with professional financial applications. The distinction between background, surface, and accent colors is clear.
*   **Accessibility:** While the colors are distinct, explicit accessibility checks are crucial. The use of pure white text on dark backgrounds is good, but the light slate gray needs careful validation.
*   **Recommendation:**
    *   **High Priority:** Implement automated accessibility tools (e.g., Axe DevTools, Lighthouse) during development to catch contrast issues early.
    *   **Medium Priority:** Consider a secondary, less saturated accent color for less critical interactive elements to avoid visual overload, especially in data-dense areas.

### 1.3 Typography Decisions (Inter font family)

*   **Evaluation:** The selection of the Inter font family is an excellent choice. Inter is specifically designed for user interfaces, offering high legibility and readability across various screen sizes and resolutions, which is critical for a cross-platform financial application. Its multiple weights and styles provide flexibility for establishing clear visual hierarchy.
*   **Recommendation:**
    *   **Medium Priority:** Define a comprehensive typographic scale (e.g., H1, H2, Body, Caption) with specific font sizes, weights, and line heights for both mobile and web to ensure consistency and optimal readability.
    *   **Low Priority:** Ensure consistent application of text styles across all components and screens to prevent visual inconsistencies.

### 1.4 Potential Visual Hierarchy Issues

*   **Evaluation:** The description emphasizes clear visual separation with cards and shadows, which is a good foundation. However, without specific screen designs, it's hard to fully assess.
*   **Recommendation:**
    *   **High Priority:** Develop a detailed design system that includes component libraries, spacing guidelines, and explicit rules for applying typography, color, and elevation (shadows) to ensure consistent visual hierarchy across all screens and components.
    *   **Medium Priority:** Use visual cues like size, color, contrast, and proximity to guide the user's eye to the most important information on each screen, especially dashboards and reports.

---

## 2. User Experience Evaluation

### 2.1 Navigation Structure and Information Architecture

*   **Evaluation:** The primary navigation via an icon-driven bottom tab bar is standard for mobile and generally effective. The contextual header for secondary actions is a smart approach to keep the UI clean while providing relevant tools. The distinction between mobile (icon only) and web (icon + label) for tabs is a good adaptation.
*   **Information Architecture:** The core features are well-defined, and the separation into distinct workspaces (CPA, Admin) is logical.
*   **Recommendation:**
    *   **High Priority:** Conduct card sorting and tree testing exercises with target users to validate the proposed information architecture and ensure that users can easily find specific features and data.
    *   **Medium Priority:** For the web version, consider a persistent left-hand sidebar navigation for primary tabs, as this is a more common and efficient pattern for desktop applications, allowing for more visible labels and quicker access to sub-sections. The bottom tab bar is excellent for mobile, but a sidebar might enhance the web experience.
    *   **Low Priority:** Ensure consistent ordering of tabs across all roles where applicable, to build muscle memory.

### 2.2 Onboarding and Authentication Flow

*   **Evaluation:** The authentication flow is robust, incorporating modern security standards like MFA (TOTP, WebAuthn/Passkeys), password visibility toggles, "Remember Me," and real-time password strength indicators. This demonstrates a strong commitment to security and user convenience. The mandatory Terms of Service agreement is also a critical legal requirement.
*   **Recommendation:**
    *   **High Priority:** Design a clear and concise onboarding sequence for first-time users that highlights key features relevant to their initial role (e.g., Member). This could include short tutorials or interactive walkthroughs.
    *   **Medium Priority:** Provide clear, user-friendly explanations for enabling MFA and Passkeys, emphasizing the benefits of enhanced security.
    *   **Low Priority:** Implement clear error messages for authentication failures that guide users on how to resolve the issue (e.g., "Incorrect password. Did you forget your password?").

### 2.3 Role-Based User Journeys (Member, Premium, CPA, Admin)

*   **Evaluation:** The RBAC system is well-defined, with clear distinctions between roles and their permissions. The hierarchical nature of Member -> Premium is clear, and the specialized nature of CPA and Support roles is correctly identified. The Administrator role has comprehensive oversight.
*   **Recommendation:**
    *   **High Priority:** Develop detailed user journey maps for each role, outlining their primary tasks, pain points, and desired outcomes. This will help ensure that the UI and features are perfectly tailored to each role's needs.
    *   **Medium Priority:** For roles with restricted access (CPA, Support, Admin), ensure that unauthorized features or data are either hidden or clearly disabled with an explanation, rather than simply leading to an error.
    *   **Low Priority:** Implement clear visual indicators within the application (e.g., a badge next to the user's name) to remind users of their current role, especially for CPAs who might switch between client workspaces.

### 2.4 Client-CPA Connection Workflow

*   **Evaluation:** The client-initiated connection process is excellent for ensuring user consent and control, which is paramount in financial relationships. The ability for clients to define the scope of access and revoke it at any time is a strong privacy feature. Administrator oversight for disputes is also a critical safeguard.
*   **Recommendation:**
    *   **High Priority:** Design a clear, step-by-step UI for the client invitation and permission scoping process, using plain language to explain access levels.
    *   **Medium Priority:** Provide clear notifications and a dedicated section in the CPA dashboard for managing pending client invitations and active client connections.
    *   **Low Priority:** Implement a confirmation step before a client revokes CPA access, explaining the implications.

---

## 3. Interaction Design Review

### 3.1 Animation Strategy and Micro-interactions

*   **Evaluation:** The "Living Interface" philosophy with physics-based transitions, skeleton loaders, data state changes, and micro-interactions is a strong foundation for a premium user experience. These animations provide crucial feedback, guide user attention, and enhance the perceived quality of the application.
*   **Recommendation:**
    *   **High Priority:** Ensure animations are performant across all target devices and platforms (especially older mobile devices and less powerful web browsers) to avoid jankiness, which can degrade the user experience.
    *   **Medium Priority:** Establish a consistent animation library or set of principles (e.g., duration, easing curves) to ensure all animations feel cohesive and contribute to a unified brand experience.
    *   **Low Priority:** Consider adding an accessibility setting to reduce or disable animations for users who may experience motion sickness or prefer a static interface.

### 3.2 Data Visualization Approach

*   **Evaluation:** The variety of charts (Ring, Donut, Line, Bar, Heat Maps, Tree Maps) is comprehensive and well-suited for financial data. The emphasis on interactivity, tooltips, and drill-down functionality is excellent for enabling deep data exploration. Hardware acceleration for fluid performance is a key technical consideration.
*   **Recommendation:**
    *   **High Priority:** Design clear and consistent legends, labels, and axis titles for all charts to ensure data is easily interpretable.
    *   **Medium Priority:** Implement filtering and sorting options for data presented in charts, allowing users to customize their views and focus on specific periods or categories.
    *   **Low Priority:** For complex charts like Heat Maps and Tree Maps, provide clear introductory explanations or tutorials to help users understand how to interpret them.

### 3.3 Form Design and Input Patterns

*   **Evaluation:** The mention of password visibility toggles and real-time strength indicators suggests attention to detail in form design.
*   **Recommendation:**
    *   **High Priority:** Standardize all form input fields (text, numbers, dates, dropdowns, checkboxes, radio buttons) with consistent styling, validation feedback, and error handling.
    *   **Medium Priority:** Implement auto-completion and smart defaults where appropriate to reduce user effort in data entry (e.g., remembering frequently used categories).
    *   **Low Priority:** Ensure forms are fully accessible, with proper labels, keyboard navigation, and screen reader support.

### 3.4 Mobile vs. Web Experience Considerations

*   **Evaluation:** The project acknowledges the need for adaptation (e.g., tap/long-press vs. hover for charts, icon-only vs. icon+label for tabs). This is a crucial understanding for a cross-platform application.
*   **Recommendation:**
    *   **High Priority:** Conduct dedicated usability testing for both mobile and web versions, as user behaviors and expectations can differ significantly between platforms.
    *   **Medium Priority:** Leverage responsive design principles to ensure layouts adapt gracefully to various screen sizes and orientations on both web and mobile, rather than just having two distinct designs.
    *   **Low Priority:** Optimize touch targets for mobile to ensure easy interaction, and ensure hover states are clearly defined for web.

---

## 4. Usability & Accessibility Analysis

### 4.1 Potential Usability Friction Points

*   **Evaluation:** The detailed feature set is impressive, but complexity can lead to friction. Without specific screen flows, potential friction points are speculative.
*   **Recommendation:**
    *   **High Priority:** Implement continuous user feedback mechanisms (e.g., in-app surveys, feedback forms) to identify and address usability issues as they arise.
    *   **Medium Priority:** Simplify complex workflows into smaller, manageable steps, especially for tasks like bookkeeping and reconciliation.
    *   **Low Priority:** Provide clear "undo" options for critical actions (e.g., deleting transactions) to mitigate user errors.

### 4.2 Accessibility Compliance (WCAG guidelines)

*   **Evaluation:** The emphasis on legibility (Inter font) and contrast (dual themes) is a good start. However, comprehensive WCAG compliance requires more than just visual considerations.
*   **Recommendation:**
    *   **High Priority:** Conduct a full WCAG 2.1 (or 2.2) audit, focusing on keyboard navigation, screen reader compatibility, focus management, and alternative text for non-text content.
    *   **Medium Priority:** Ensure all interactive elements have clear focus indicators for keyboard users.
    *   **Low Priority:** Provide captions or transcripts for any video content (e.g., onboarding tutorials).

### 4.3 Cognitive Load and Information Density

*   **Evaluation:** Financial applications are inherently information-dense. The use of clear visual hierarchy and interactive charts helps manage this, but it's a constant challenge.
*   **Recommendation:**
    *   **High Priority:** Implement progressive disclosure, showing only essential information initially and allowing users to reveal more details as needed (e.g., collapsing sections, "show more" buttons).
    *   **Medium Priority:** Use clear, concise language and avoid jargon where possible. Provide tooltips or contextual help for complex terms.
    *   **Low Priority:** Break down large tables of data into smaller, digestible chunks with pagination or infinite scrolling.

### 4.4 Error Handling and Feedback Mechanisms

*   **Evaluation:** The provided console errors indicate that robust error handling is critical. The description mentions real-time password strength indicators, which is a good example of proactive feedback.
*   **Recommendation:**
    *   **High Priority:** Implement a consistent and user-friendly error handling strategy across the entire application. Error messages should be clear, actionable, and appear close to the source of the error.
    *   **Medium Priority:** Provide immediate feedback for all user actions (e.g., success messages, loading indicators, validation errors).
    *   **Low Priority:** Log all client-side errors to a monitoring service to proactively identify and fix issues.

---

## 5. Strategic Recommendations

### 5.1 Prioritize the Top 5 Most Critical Improvements

1.  **Comprehensive WCAG Audit & Implementation (High Priority):** While visual accessibility is considered, a full audit and remediation for WCAG 2.1/2.2 compliance (keyboard navigation, screen reader support, focus management, semantic HTML) is paramount for a professional application. This ensures the application is usable by the widest possible audience and meets legal requirements.
2.  **Detailed User Journey Mapping & UI/UX Wireframing for Each Role (High Priority):** The roles are well-defined, but translating these into precise, optimized user flows and screen designs for each role (especially CPA and Admin) is critical. This will prevent feature creep in the wrong places and ensure each role's experience is tailored and efficient.
3.  **Standardized Design System & Component Library (High Priority):** To ensure visual consistency, maintainability, and efficient development, a robust design system encompassing typography, color, spacing, and all UI components (forms, buttons, cards, navigation elements) is essential. This will prevent visual hierarchy issues and accelerate future development.
4.  **Enhanced Error Handling & User Feedback (Medium Priority):** The console errors highlight a need for more robust and user-friendly error handling. Implementing clear, actionable error messages and consistent feedback mechanisms for all user interactions will significantly improve usability and reduce frustration.
5.  **Optimized Web Experience (Medium Priority):** While cross-platform, the web experience can often be an afterthought. Dedicated attention to web-specific navigation patterns (e.g., sidebar), responsive layouts, and desktop-optimized interactions will ensure NorthFinance is equally powerful and intuitive on larger screens.

### 5.2 Suggest Specific Design Solutions with Rationale

*   **WCAG Audit:** Integrate accessibility testing into the CI/CD pipeline. Use tools like `eslint-plugin-jsx-a11y` for React Native and browser extensions for web.
*   **User Journey Mapping:** Create detailed flowcharts and low-fidelity wireframes for core tasks for each role. For example, a CPA's "Add New Client" flow, or an Admin's "Change User Role" flow.
*   **Design System:** Utilize tools like Storybook for React Native components to document and test UI elements in isolation. Define clear design tokens for colors, spacing, and typography.
*   **Error Handling:** Implement a global error boundary for React Native and a centralized error logging service. For user-facing errors, use toast notifications for non-critical issues and modal dialogs for critical, blocking errors.
*   **Optimized Web Experience:** For web, replace the bottom tab bar with a collapsible left-hand navigation sidebar that expands to show text labels on hover or click. Ensure data tables are fully sortable and filterable with sticky headers.

### 5.3 Recommend User Testing Approaches

*   **Formative Usability Testing (Early Stage):** Conduct moderated usability tests with 5-7 users from each target role (Member, Premium, CPA, Admin) using prototypes or early builds. Focus on core workflows and identify major pain points.
*   **A/B Testing (Post-Launch):** For specific features or UI elements, conduct A/B tests to compare different design solutions and measure their impact on key metrics (e.g., conversion rates, task completion time).
*   **Accessibility Testing:** Engage users with disabilities to perform testing with assistive technologies (screen readers, keyboard navigation) to validate WCAG compliance.
*   **Beta Program:** Launch a beta program with a larger group of diverse users to gather broader feedback before general release.

### 5.4 Propose Metrics to Measure Design Success

*   **Task Completion Rate:** Percentage of users successfully completing key tasks (e.g., adding a transaction, generating a report, connecting with a CPA).
*   **Task Completion Time:** Average time taken to complete critical tasks.
*   **User Error Rate:** Frequency of errors encountered during specific workflows.
*   **System Usability Scale (SUS) Score:** A standardized questionnaire to measure perceived usability.
*   **Net Promoter Score (NPS):** Measures overall user satisfaction and likelihood to recommend.
*   **Accessibility Score:** Metrics from automated accessibility tools and manual audits.
*   **Feature Adoption Rate:** Percentage of users utilizing specific new or improved features.
*   **Churn Rate:** Especially for Premium Members, monitor if design improvements lead to better retention.

---

## Detailed Project Layout & Role-Based Access

Here's a precise breakdown of the NorthFinance application's layout and role-based access, ensuring clarity and avoiding previous misunderstandings.

**Fundamental Principle:** Roles are tiered for personal use (Member -> Premium) and specialized for professional/internal use (CPA, Support, Admin). An Administrator has ultimate oversight and can access *all* features, but their primary interface is the Admin Panel.

### Application Structure Overview

NorthFinance is structured with a primary navigation (Bottom Tab Bar for user-facing roles) and a secondary, contextual header. The Admin Panel is a distinct, restricted-access area.

#### **Global Navigation Elements:**

*   **Bottom Tab Bar (Mobile & Web):**
    *   **Mobile:** Displays icons only.
    *   **Web:** Displays icons with text labels below them.
    *   **Active State:** The active icon performs a subtle animation (e.g., gentle bounce).
*   **Main Header (Top Right):**
    *   Contains global actions like Notifications, Chat, Settings, and Profile.
    *   Contextual actions appear here based on the current screen (e.g., Filter/Export on Transactions).

---

### **Role-Specific Access & Navigation**

#### **1. Member Role**

*   **Description:** The default role for all new users, designed for personal financial management.
*   **Access Hierarchy:** Base level.
*   **Bottom Tab Bar (Visible Tabs):**
    1.  `Chrome` **Dashboard** (`/`) - *Unique Icon: A stylized dashboard or home icon, not a generic browser icon.*
    2.  `CreditCard` **Transactions** (`/transactions`)
    3.  `Camera` **Scan** (`/camera`) - *Unique Icon: A camera with a document outline.*
    4.  `FileText` **Documents** (`/documents`)
    5.  `MessageCircle` **Support** (`/support`) - *Unique Icon: A chat bubble with a question mark or a headset.*
*   **Other Core Features (Accessible via Dashboard, Transactions, or Settings):**
    *   Bookkeeping & Reconciliation (basic)
    *   Financial Reporting (basic P&L, Balance Sheet, Cash Flow for own data)
    *   Budgeting & Forecasting (basic personal budgets)
    *   Intelligent Document Scanning (via `/camera` tab)
    *   AI Assistant (for personal data, accessible via a dedicated screen, e.g., `/ai-assistant`)
    *   Real-time Messaging (user-to-user, accessible via `/chat` in Header)
    *   Currency Conversion
    *   Initiate CPA connection requests (via Profile settings)

#### **2. Premium Member Role**

*   **Description:** An upgraded role for users requiring more powerful personal financial tools.
*   **Access Hierarchy:** All Member permissions, *plus* additional advanced features and potentially more detailed views.
*   **Bottom Tab Bar (Visible Tabs):**
    *   **All Member Tabs:**
        1.  `Chrome` **Dashboard** (`/`)
        2.  `CreditCard` **Transactions** (`/transactions`)
        3.  `Camera` **Scan** (`/camera`)
        4.  `FileText` **Documents** (`/documents`)
        5.  `MessageCircle` **Support** (`/support`)
    *   **Additional Tabs (if applicable, or integrated into existing tabs with enhanced functionality):**
        *   *No new primary tabs are explicitly added, but existing tabs gain enhanced functionality.*
*   **Other Core Features (Accessible via Dashboard, Transactions, Reports, or Settings):**
    *   **All Member Features, plus:**
    *   In-depth Analytics & Multi-year Forecasting (enhanced views on Dashboard)
    *   Advanced Tax Preparation Summaries (enhanced reporting)
    *   Data Export (to CSV/PDF from reports and transaction lists)
    *   Custom Categorization Rules (via Settings or Transaction management)
    *   Scheduled Reporting (via Reporting section)

#### **3. Professional (CPA) Role**

*   **Description:** A distinct account for accountants managing multiple clients. Their access is focused on a dedicated client workspace, with strict privacy limitations. **This role does NOT inherit all Member/Premium features for their own personal use; it's a specialized professional interface.**
*   **Access Hierarchy:** Parallel, specialized access.
*   **Bottom Tab Bar (Visible Tabs):**
    1.  `Chrome` **Dashboard** (`/`) - *This dashboard is for the CPA's own NorthFinance account, not a client's. When in a client workspace, the client's dashboard is viewed.*
    2.  `Briefcase` **Clients** (`/clients`) - *Unique Icon: A professional briefcase.* This is the primary entry point to client workspaces.
    3.  `CreditCard` **Transactions** (`/transactions`) - *This is for the CPA's own transactions. When in a client workspace, the client's transactions are viewed.*
    4.  `Camera` **Scan** (`/camera`) - *For the CPA's own documents. When in a client workspace, it's for client documents.*
    5.  `FileText` **Documents** (`/documents`) - *For the CPA's own documents. When in a client workspace, it's for client documents.*
    6.  `MessageCircle` **Support** (`/support`)
*   **CPA Workspace (Accessed via `/clients` tab):**
    *   When a CPA selects a client, they enter a secure, segregated workspace.
    *   **Within a client's workspace, the CPA has:**
        *   View Complete Dashboard (client's metrics, charts, transactions)
        *   Full Bookkeeping control (add, edit, delete client transactions; categorize; manage journal entries)
        *   Generate and export professional, brandable reports for clients
        *   Manage client budgets
        *   Access client-uploaded documents (receipts, invoices)
        *   Perform reconciliations for client accounts
        *   Secure Messaging with clients (via `/chat` in Header, contextual to the client)
*   **Strict Privacy Limitations (CPA cannot):**
    *   View or change the client's personal profile settings (name, email, password).
    *   Manage the client's personal API keys or MFA settings.
    *   See the client's subscription or billing information with NorthFinance.
    *   Access any other client's data from within an active client workspace.

#### **4. Support Role**

*   **Description:** An internal-only, read-only role for troubleshooting and user assistance.
*   **Access Hierarchy:** Highly restricted, internal access. **No user-facing tabs or main application navigation.**
*   **Access:**
    *   Accessed via a dedicated internal tool or specific views, not the main NorthFinance application.
    *   Read-only access to specific user data *with explicit user consent*.
    *   View transaction logs and system diagnostics.
    *   **Cannot modify any financial data.**
    *   **Cannot access any of the main application tabs (Dashboard, Transactions, etc.).**

#### **5. Administrator Role**

*   **Description:** The highest-level internal role with full system oversight.
*   **Access Hierarchy:** Full hierarchical access. Can manage all roles and data in the system.
*   **Primary Interface:** Dedicated **Admin Panel**, not the main user-facing application tabs.
*   **Admin Panel (Accessed via a specific route, e.g., `/admin` or `/(tabs)/admin` as per commit notes):**
    *   **User Management:** View, search, filter, edit user profiles, assign roles, suspend/unsuspend/delete accounts, view immutable activity logs.
    *   **System Analytics Dashboard:** Visualize key business and health metrics (new sign-ups, DAU/MAU, total transactions, API error rates, DB query times).
    *   **Global Messaging System:** Compose and broadcast announcements/alerts to all users or specific roles.
    *   **Financial Oversight & Auditing:** Access high-level, anonymized financial aggregates, review system-wide audit logs.
    *   **Client & CPA Management:** Oversee and manage all client-to-CPA connections, including forcible severance in disputes.
    *   **Subscription & Plan Management:** Interface with payment provider (Stripe) for subscription statuses, pricing, billing.
    *   **Content Management:** Manage static content (FAQs, help articles) and user-generated content (forum posts, comments).