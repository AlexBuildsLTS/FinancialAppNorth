import { UserRole } from '@/types';

export const APP_NAME = "NorthFinance";

export const ROLE_NAV_ITEMS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['Dashboard', 'Transactions', 'Documents', 'Reports', 'CPA Portal', 'Support', 'Admin', 'AI Chat', 'Settings'],
  [UserRole.CPA]: ['Dashboard', 'CPA Portal', 'Documents', 'Reports', 'AI Chat', 'Settings'],
   [UserRole.SUPPORT]: ['Dashboard','Documents', 'Reports',  'CPA Portal', 'Support', 'AI Chat', 'Settings'],
  [UserRole.PREMIUM]: ['Dashboard', 'CPA Portal', 'Documents', 'Reports', 'AI Chat', 'Settings'],
  [UserRole.MEMBER]: ['Dashboard', 'Transactions', 'Support', 'AI Chat', 'Settings'],
};
