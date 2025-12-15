import { UserRole } from './types';

// The list below defines which top-level navigation items are visible to each user role.
// NOTE: 'Transactions' maps to the /finances hub route in the layout.
export const ROLE_NAV_ITEMS: Record<UserRole | string, string[]> = {
  // Members see core financial tools
  'member': [
    'Dashboard',
    'Transactions',
    'Hub',
    'AI Chat',
    'Documents',
    'Scan',
    'Settings',
    'Support'
  ],

  // Premium users get all member features + Messages + CPA Portal
  'premium_member': [
    'Dashboard',
    'Transactions',
     'Hub',
    'Documents',
    'Scan',
    'AI Chat',
    'Messages',
    'Find CPA',
    'CPA Portal',
    'Settings',
    'Support'
  ],

  // CPA sees all Premium features (minus general Support) + CPA Portal
  'cpa': [
    'Dashboard', 
    'Transactions', 
     'Hub',
    'Documents', 
    'Scan', 
    'AI Chat', 
    'Messages', 
    'Settings', 
    'CPA Portal'
  ],

  // Support sees ALL Premium features + Admin for user/ticket management
  'support': [
    'Dashboard',
    'Transactions',
    'Documents',
     'Hub',
    'Scan',
    'AI Chat',
    'Messages',
    'CPA Portal',
    'Settings',
    'Support', // For viewing/responding to tickets
    'Admin'    // For limited admin/user lookup/logs
  ],

  // Admins see every possible feature in the system.
  'admin': [
    'Dashboard', 
    'Transactions', 
    'Documents', 
     'Hub',
    'Scan', 
    'CPA Portal',
    'Support', 
    'AI Chat',
    'Messages', 
    'Settings', 
    'Admin'
  ]
};

// You may also export other constants here if needed
export const APP_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  PAGINATION_LIMIT: 20,
};