import { UserRole } from '@/types';

export const APP_NAME = "NorthFinance";

export const ROLE_NAV_ITEMS: Record<UserRole, string[]> = {
  // Admin: Admin Portal, Documents, Reports, Support, Chat, Settings
  [UserRole.ADMIN]: ['Dashboard', 'Admin', 'Documents', 'Reports', 'CPA Portal', 'Support', 'AI Chat', 'Settings'],
  
  // CPA: Dashboard, Portal, Documents, Reports, Chat, Settings
  [UserRole.CPA]: ['Dashboard', 'CPA Portal', 'Documents', 'Reports', 'AI Chat', 'Settings'],
  
  // Support: Dashboard, Support, Documents, Reports, Portal, Chat, Settings
  [UserRole.SUPPORT]: ['Dashboard', 'Support', 'Documents', 'Reports', 'CPA Portal', 'AI Chat', 'Settings'],
  
  // Premium: Dashboard, Transactions (Tabs), Support, Chat, Portal, Settings
  [UserRole.PREMIUM]: ['Dashboard', 'Transactions', 'Support', 'AI Chat', 'CPA Portal', 'Settings'],
  
  // Member: Dashboard, Transactions (Tabs), Support, Chat, Settings
  [UserRole.MEMBER]: ['Dashboard', 'Transactions', 'Support', 'AI Chat', 'Settings'],
};