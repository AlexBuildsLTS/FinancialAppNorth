import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';

// Matching your exact Supabase Enum types
export type UserRole = 'admin' | 'cpa' | 'support' | 'premium' | 'member';

interface RoleBadgeProps {
  role: string; 
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const { isDark } = useTheme();
  const normalizedRole = (role || 'member').toLowerCase() as UserRole;

  // EXACT COLORS requested: Red Admin, Orange CPA, Gold Premium
  const getRoleStyle = () => {
    switch (normalizedRole) {
      case 'admin':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444', border: '#EF4444' }; // Red
      case 'cpa':
        return { bg: 'rgba(249, 115, 22, 0.2)', text: '#F97316', border: '#F97316' }; // Orange
      case 'support':
        return { bg: 'rgba(56, 189, 248, 0.2)', text: '#38BDF8', border: '#38BDF8' }; // Light Blue
      case 'premium':
        return { bg: 'rgba(234, 179, 8, 0.2)', text: '#EAB308', border: '#EAB308' };  // Gold
      case 'member':
      default:
        return { 
            bg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', 
            text: isDark ? '#9CA3AF' : '#4B5563', 
            border: isDark ? '#4B5563' : '#D1D5DB' 
        };
    }
  };

  const styles = getRoleStyle();

  return (
    <View style={[
      baseStyles.badge, 
      { backgroundColor: styles.bg, borderColor: styles.border }
    ]}>
      <Text style={[baseStyles.text, { color: styles.text }]}>
        {normalizedRole.toUpperCase()}
      </Text>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});