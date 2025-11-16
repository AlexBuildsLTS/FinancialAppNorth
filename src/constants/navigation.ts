// src/shared/constants/navigation.ts
import { UserRole } from '@/types';
import { Home, List, FileText, ScanEyeIcon, Calculator, BarChart2, UsersRound, Briefcase, Settings, Landmark, LucideIcon, EyeIcon, User } from 'lucide-react-native';

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
  ],
  [UserRole.PREMIUM_MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'clients', title: 'Clients', icon: UsersRound },
  ],
  [UserRole.CPA]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'clients', title: 'Clients', icon: UsersRound },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'profile', title: 'Profile', icon: User },
    { name: 'support', title: 'Support', icon: Briefcase },
  ],
  [UserRole.SUPPORT]: [
     { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'clients', title: 'Clients', icon: UsersRound },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'profile', title: 'Profile', icon: User },
    { name: 'support', title: 'Support', icon: Briefcase },
  ],
  [UserRole.ADMIN]: [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: List },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: BarChart2 },
    { name: 'clients', title: 'Users', icon: UsersRound },
    { name: 'camera', title: 'Scan', icon: ScanEyeIcon },
    { name: 'admin', title: 'Admin Panel', icon: Landmark },
    { name: 'support', title: 'Tickets', icon: Briefcase },
  ],
  [UserRole.CLIENT]: [],
};
