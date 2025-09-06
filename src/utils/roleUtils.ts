import { UserRole } from '@/types';

export function normalizeRole(role: string | UserRole): UserRole {
  // Handle various role formats that might come from the database
  const roleStr = String(role).toLowerCase();

  switch (roleStr) {
    case 'member':
    case 'user':
      return UserRole.MEMBER;
    case 'premium':
    case 'premium_member':
    case 'premiummember':
      return UserRole.PREMIUM_MEMBER;
    case 'cpa':
    case 'professional':
      return UserRole.CPA;
    case 'support':
      return UserRole.SUPPORT;
    case 'admin':
    case 'administrator':
      return UserRole.ADMIN;
    default:
      return UserRole.MEMBER;
  }
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.MEMBER:
      return 'Member';
    case UserRole.PREMIUM_MEMBER:
      return 'Premium Member';
    case UserRole.CPA:
      return 'Professional (CPA)';
    case UserRole.SUPPORT:
      return 'Support';
    case UserRole.ADMIN:
      return 'Administrator';
    default:
      return 'Member';
  }
}