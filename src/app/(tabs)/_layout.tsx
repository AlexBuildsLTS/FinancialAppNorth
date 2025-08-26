import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { Platform } from 'react-native';
import {
  Home,
  Briefcase,
  CreditCard,
  Camera,
  FileText,
  MessageCircle,
  User,
} from 'lucide-react-native';

interface TabBarIconProps {
  Icon: React.ComponentType<{ color: string; size: number }>;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = React.memo(
  ({ Icon, color, size }) => <Icon color={color} size={size} />
);

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isProfessional =
    user?.role === 'Professional Accountant' || user?.role === 'Administrator';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={Home} color={color} size={size} />
          ),
        }}
      />
      {isProfessional && (
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clients',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon Icon={Briefcase} color={color} size={size} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={CreditCard} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={Camera} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={FileText} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={MessageCircle} color={color} size={size} />
          ),
        }}
      />

      {/* Hidden screens that don't appear in tabs */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="client" options={{ href: null }} />
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
      <Tabs.Screen name="budgets" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="accounts" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}