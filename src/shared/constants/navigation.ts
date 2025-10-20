// src/shared/constants/navigation.ts
import { UserRole } from '@/shared/types';
import { Home, List, FileText, ScanEyeIcon, Calculator, BarChart2, UsersRound, Briefcase, Settings, Landmark, LucideIcon, EyeIcon } from 'lucide-react-native';

export interface TabItem {
    name: string;
    title: string;
    icon: LucideIcon;
    custom?: boolean;
}

export const ROLE_BASED_TABS: Record<UserRole, Omit<TabItem, 'custom'>[]> = {
  [UserRole.MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'support', title: 'Support', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.PREMIUM_MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.CPA]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'clients', title: 'Clients', icon: UsersRound },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'support', title: 'Support', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.SUPPORT]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'clients', title: 'Users', icon: UsersRound },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'support', title: 'Tickets', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.ADMIN]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'admin', title: 'Admin Panel', icon: Landmark },
    { name: 'clients', title: 'Users', icon: UsersRound },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'support', title: 'Tickets', icon: Briefcase },
    { name: 'settings', title: 'Settings', icon: Settings },
  ],
  [UserRole.CLIENT]: [],
};