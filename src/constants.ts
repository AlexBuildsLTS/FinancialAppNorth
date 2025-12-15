import { UserRole } from './types';

// Define navigation item constants for consistency and to avoid typos
export const NAV_ITEMS = {
  DASHBOARD: 'Dashboard',
  TRANSACTIONS: 'Transactions',
  HUB: 'Hub',
  AI_CHAT: 'AI Chat',
  DOCUMENTS: 'Documents',
  SCAN: 'Scan',
  SETTINGS: 'Settings',
  SUPPORT: 'Support',
  MESSAGES: 'Messages',
  FIND_CPA: 'Find CPA',
  CPA_PORTAL: 'CPA Portal',
  ADMIN: 'Admin',
} as const;

// Type for navigation items
export type NavItem = typeof NAV_ITEMS[keyof typeof NAV_ITEMS];

// Base navigation items for member role
const BASE_MEMBER_NAV: NavItem[] = [
  NAV_ITEMS.DASHBOARD,
  NAV_ITEMS.TRANSACTIONS,
  NAV_ITEMS.HUB,
  NAV_ITEMS.AI_CHAT,
  NAV_ITEMS.SCAN,
  NAV_ITEMS.SETTINGS,
  NAV_ITEMS.SUPPORT,
];

// Function to get navigation items for a role, with inheritance to reduce duplication
export function getRoleNavItems(role: UserRole | string): NavItem[] {
  switch (role) {
    case 'member':
      return [...BASE_MEMBER_NAV];

    case 'premium_member':
      return [
        ...BASE_MEMBER_NAV,
        NAV_ITEMS.MESSAGES,
        NAV_ITEMS.FIND_CPA,
        NAV_ITEMS.CPA_PORTAL,
      ];

    case 'cpa':
      // CPA gets premium features minus general Support
      return [
        NAV_ITEMS.DASHBOARD,
        NAV_ITEMS.TRANSACTIONS,
        NAV_ITEMS.HUB,
        NAV_ITEMS.SCAN,
        NAV_ITEMS.AI_CHAT,
        NAV_ITEMS.MESSAGES,
        NAV_ITEMS.SETTINGS,
        NAV_ITEMS.CPA_PORTAL,
      ];

    case 'support':
      // Support gets all premium features plus Admin
      return [
        ...getRoleNavItems('premium_member'),
        NAV_ITEMS.ADMIN,
      ];

    case 'admin':
      // Admins get all features (Documents is accessed via Workspace/Hub)
      return [
        NAV_ITEMS.DASHBOARD,
        NAV_ITEMS.TRANSACTIONS,
        NAV_ITEMS.HUB,
        NAV_ITEMS.SCAN,
        NAV_ITEMS.CPA_PORTAL,
        NAV_ITEMS.SUPPORT,
        NAV_ITEMS.AI_CHAT,
        NAV_ITEMS.MESSAGES,
        NAV_ITEMS.SETTINGS,
        NAV_ITEMS.ADMIN,
      ];

    default:
      // For unknown roles, return empty array or basic items
      return [];
  }
}

// Legacy export for backward compatibility, but frozen for immutability
export const ROLE_NAV_ITEMS: Record<UserRole | string, NavItem[]> = Object.freeze({
  member: getRoleNavItems('member'),
  premium_member: getRoleNavItems('premium_member'),
  cpa: getRoleNavItems('cpa'),
  support: getRoleNavItems('support'),
  admin: getRoleNavItems('admin'),
});

// Define interface for app config for type safety
export interface AppConfig {
  MAX_FILE_SIZE_MB: number;
  SUPPORTED_MIME_TYPES: string[];
  PAGINATION_LIMIT: number;
}

// App configuration constants, frozen for immutability
export const APP_CONFIG: AppConfig = Object.freeze({
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  PAGINATION_LIMIT: 20,
});