// Assuming your UserRole enum is correctly defined in src/types.ts
import { UserRole } from './types';

// The list below defines which top-level navigation items are visible to each user role.
// NOTE: 'Transactions' maps to the /finances hub route in the layout.
export const ROLE_NAV_ITEMS: Record<UserRole | string, string[]> = {
  // Members see core financial tools
  [UserRole.MEMBER]: [
    'Dashboard',
    'Transactions',
    'Documents',
    'Scan',
    'AI Chat',
    'Find CPA',
    'Settings',
    'Support'
  ],

  // Premium users get all member features + Messages + CPA Portal
  [UserRole.PREMIUM]: [
    'Dashboard',
    'Transactions',
    'Documents',
    'Scan',
    'AI Chat',
    'Messages',
    'Find CPA',
    'CPA Portal',
    'Settings',
    'Support'
  ],

  // FIX: CPA sees all Premium features (minus general Support) + CPA Portal
  [UserRole.CPA]: [
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
  [UserRole.SUPPORT]: [
    'Dashboard',
    'Transactions',
    'Documents',
    'Scan',
    'AI Chat',
    'Messages',
    'CPA Portal',
    'Settings',
    'Support', // For viewing/responding to tickets
    'Admin' // For limited admin/user lookup/logs
  ],

  // Admins see every possible feature in the system.
  [UserRole.ADMIN]: [
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
export const APP_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_MIME_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  PAGINATION_LIMIT: 20,
};