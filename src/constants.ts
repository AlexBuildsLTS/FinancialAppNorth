// Assuming your UserRole enum is correctly defined in src/types.ts

// The list below defines which top-level navigation items are visible to each user role.
// NOTE: 'Transactions' maps to the /finances hub route in the layout.
export const ROLE_NAV_ITEMS: Record<string, string[]> = {
  // Members see core financial tools
  'member': [
    'Dashboard',
    'Transactions',
    'Documents',
    'Scan',
    'AI Chat',
    'Find CPA',
    'Settings',
    'Support'
  ],

  // Premium users get all member features + Messages
  'premium': [
    'Dashboard',
    'Transactions',
    'Documents',
    'Scan',
    'AI Chat',
    'Messages',
    'Find CPA',
    'Settings',
    'Support'
  ],

  // FIX: CPA sees all Premium features (minus general Support) + CPA Portal
  'cpa': [
    'Dashboard', 
    'Transactions', 
    'Documents', 
    'Scan', 
    'AI Chat', 
    'Messages', 
    'Settings', 
    'CPA Portal' // Added dedicated CPA management hub
  ],

  // FIX: Support sees ALL Premium features + Admin for user/ticket management
  'support': [
    'Dashboard', 
    'Transactions', 
    'Documents', 
    'Scan', 
    'AI Chat', 
    'Messages', 
    'Settings', 
    'Support', // For viewing/responding to tickets
    'Admin' // For limited admin/user lookup/logs
  ],

  // Admins see every possible feature in the system.
  'admin': [
    'Dashboard', 
    'Transactions', 
    'Documents', 
    'Scan', 
    'CPA Portal',
    'Support', 
    'AI Chat',
    'Messages',
    'Settings',
    'Admin' // The dedicated Admin Control Panel route
  ]
};

// You may also export other constants here if needed