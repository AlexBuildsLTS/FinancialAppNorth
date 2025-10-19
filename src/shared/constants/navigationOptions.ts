// src/shared/constants/navigation.ts
import { UserRole } from '@/shared/types';
import { Home, List, FileText, BotMessageSquare, Calculator, BarChart2, UsersRound, Briefcase, Settings, Landmark, ScanEye, LucideIcon } from 'lucide-react-native';

// This is the definitive type for a tab item. It uses a component for the icon, not a string.
export interface TabItem {
    name: string;
    title: string;
    icon: LucideIcon;
    custom?: boolean; // Flag for special buttons like the scanner
}

// This object is the single source of truth for your navigation.
// It directly implements the table from your project documentation.
export const ROLE_BASED_TABS: Record<UserRole, TabItem[]> = {
  [UserRole.MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: BarChart2 },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'scan', title: 'Scan', icon: ScanEye },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'settings', title: 'Settings', icon: Settings },
    { name: 'support', title: 'Support', icon: Briefcase },
  ],
  [UserRole.PREMIUM_MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
   { name: 'scan', title: 'Scan', icon: ScanEye },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.CPA]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'clients', title: 'Clients', icon: UsersRound },
    { name: 'scan', title: 'Scan', icon: ScanEye },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'support', title: 'Support', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.SUPPORT]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'clients', title: 'Users', icon: UsersRound },
    { name: 'support', title: 'Tickets', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.ADMIN]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'admin', title: 'Admin Panel', icon: Landmark },
    { name: 'clients', title: 'Users', icon: UsersRound },
    { name: 'support', title: 'Tickets', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  // The 'Client' role does not have a main app tab bar.
  [UserRole.CLIENT]: [],
};