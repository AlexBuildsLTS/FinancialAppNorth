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
