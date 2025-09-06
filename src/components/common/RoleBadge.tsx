import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { UserRole, UserRoleDisplayNames } from '@/types';
import { Shield, User, Briefcase, LifeBuoy, Star } from 'lucide-react-native';

interface RoleBadgeProps {
  role: UserRole;
}

type IconComponent = React.ComponentType<{ size?: number; color?: string; style?: Record<string, unknown> | undefined }>;
const roleVisuals: Record<string, { Icon: IconComponent; color: string }> = {
  [UserRole.ADMIN]: { Icon: Shield as IconComponent, color: '#ef4444' }, // Red
  [UserRole.CPA]: { Icon: Briefcase as IconComponent, color: '#3b82f6' }, // Blue
  [UserRole.MEMBER]: { Icon: User as IconComponent, color: '#64748b' }, // Slate
  [UserRole.PREMIUM_MEMBER]: { Icon: Star as IconComponent, color: '#8b5cf6' }, // Violet
  [UserRole.SUPPORT]: { Icon: LifeBuoy as IconComponent, color: '#eab308' }, // Yellow
  // fallback
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const visual = roleVisuals[role] || { Icon: User, color: '#64748b' };
  const Icon = visual.Icon;

  return (
    <View style={[styles.badge, { backgroundColor: `${visual.color}20` }]}>
      <Icon size={14} color={visual.color} style={styles.icon} />
      <Text style={[styles.badgeText, { color: visual.color }]}>
        {UserRoleDisplayNames?.[role] ?? String(role)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
});