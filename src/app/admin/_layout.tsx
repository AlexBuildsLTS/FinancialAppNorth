import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { LayoutDashboard, Users } from 'lucide-react-native';

export default function AdminTabLayout() {
  const { user, initialized } = useAuth();
  const { colors } = useTheme();

  if (!initialized) return null;
  if (user?.role !== 'Administrator') return <Redirect href="/(tabs)" />;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: { backgroundColor: colors.surface },
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: 'User Management',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}