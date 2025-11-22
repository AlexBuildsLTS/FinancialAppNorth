import { UserRole } from '@/shared/types';
import { 
  LayoutDashboard, 
  CreditCard, 
  ScanEye, 
  PieChart, 
  User, 
  Briefcase, 
  UsersRound, 
  Landmark, 
  FileText, 
  Calculator, 
  LucideIcon 
} from 'lucide-react-native';

export interface TabItem {
  name: string;
  title: string;
  icon: LucideIcon;
  custom?: boolean;
}

export const ROLE_BASED_TABS: Record<UserRole, TabItem[]> = {
  [UserRole.MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: LayoutDashboard },
    { name: 'transactions', title: 'Transactions', icon: CreditCard },
    { name: 'scan', title: 'Scan', icon: ScanEye, custom: true },
    { name: 'reports', title: 'Reports', icon: PieChart },
    { name: 'profile', title: 'Profile', icon: User },
  ],
  [UserRole.PREMIUM_MEMBER]: [
    { name: 'index', title: 'Dashboard', icon: LayoutDashboard },
    { name: 'transactions', title: 'Transactions', icon: CreditCard },
    { name: 'scan', title: 'Scan', icon: ScanEye, custom: true },
    { name: 'reports', title: 'Reports', icon: PieChart },
    { name: 'profile', title: 'Profile', icon: User },
  ],
  [UserRole.CPA]: [
    { name: 'index', title: 'Dashboard', icon: LayoutDashboard },
    { name: 'transactions', title: 'Transactions', icon: CreditCard },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: PieChart },
    { name: 'clients', title: 'Clients', icon: UsersRound },
    { name: 'scan', title: 'Scan', icon: ScanEye, custom: true },
    { name: 'support', title: 'Support', icon: Briefcase },
    { name: 'profile', title: 'Profile', icon: User },
  ],
  [UserRole.SUPPORT]: [
    { name: 'index', title: 'Dashboard', icon: LayoutDashboard },
    { name: 'transactions', title: 'Transactions', icon: CreditCard },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: PieChart },
    { name: 'clients', title: 'Clients', icon: UsersRound },
    { name: 'scan', title: 'Scan', icon: ScanEye, custom: true },
    { name: 'support', title: 'Support', icon: Briefcase },
    { name: 'profile', title: 'Profile', icon: User },
  ],
  [UserRole.ADMIN]: [
    { name: 'index', title: 'Dashboard', icon: LayoutDashboard },
    { name: 'transactions', title: 'Transactions', icon: CreditCard },
    { name: 'documents', title: 'Documents', icon: FileText },
    { name: 'budgets', title: 'Budgets', icon: Calculator },
    { name: 'reports', title: 'Reports', icon: PieChart },
    { name: 'clients', title: 'Users', icon: UsersRound },
    { name: 'scan', title: 'Scan', icon: ScanEye, custom: true },
    { name: 'admin', title: 'Admin', icon: Landmark },
    { name: 'support', title: 'Tickets', icon: Briefcase },
    { name: 'profile', title: 'Profile', icon: User },
  ],
  [UserRole.CLIENT]: [],
};