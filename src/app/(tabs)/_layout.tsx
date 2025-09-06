import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Chrome as Home, List, PieChart, Camera, MessageSquare, UsersRound, LifeBuoy, Settings, Shield } from 'lucide-react-native';
import MainHeader from '@/components/common/MainHeader';
import { View } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  const { profile } = useAuth();

  // Define which tabs each role can see
  const getVisibleTabs = () => {
    if (!profile) return ['index', 'transactions', 'analytics', 'settings'];

    const baseTabs = ['index', 'transactions', 'analytics', 'camera', 'settings'];
    
    switch (profile.role) {
      case UserRole.ADMIN:
        return [...baseTabs, 'clients', 'chat', 'support', 'admin'];
      case UserRole.CPA:
        return [...baseTabs, 'clients', 'chat', 'support'];
      case UserRole.SUPPORT:
        return [...baseTabs, 'chat', 'support'];
      case UserRole.PREMIUM_MEMBER:
        return [...baseTabs, 'chat'];
      case UserRole.MEMBER:
      default:
        return baseTabs;
    }
  };

  const visibleTabs = getVisibleTabs();

  return (
    <View style={{ flex: 1 }}>
      <MainHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
            href: visibleTabs.includes('index') ? '/(tabs)' : null,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color }) => <List color={color} size={24} />,
            href: visibleTabs.includes('transactions') ? '/(tabs)/transactions' : null,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <PieChart color={color} size={24} />,
            href: visibleTabs.includes('analytics') ? '/(tabs)/analytics' : null,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => <Camera color={color} size={24} />,
            href: visibleTabs.includes('camera') ? '/(tabs)/camera' : null,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />,
            href: visibleTabs.includes('chat') ? '/(tabs)/chat' : null,
          }}
        />
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clients',
            tabBarIcon: ({ color }) => <UsersRound color={color} size={24} />,
            href: visibleTabs.includes('clients') ? '/(tabs)/clients' : null,
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: 'Support',
            tabBarIcon: ({ color }) => <LifeBuoy color={color} size={24} />,
            href: visibleTabs.includes('support') ? '/(tabs)/support' : null,
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color }) => <Shield color={color} size={24} />,
            href: visibleTabs.includes('admin') ? '/(tabs)/admin' : null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
            href: visibleTabs.includes('settings') ? '/(tabs)/settings' : null,
          }}
        />
        
        {/* Hidden screens that don't appear in tabs */}
        <Tabs.Screen
          name="investments"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // Hide from tabs
          }}
        />
      </Tabs>
    </View>
  );
}