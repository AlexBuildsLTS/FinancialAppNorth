import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { Platform } from 'react-native';
import {
  LayoutDashboard,
  Briefcase,
  ArrowRightLeft,
  Settings,
  Landmark,
  PiggyBank,
  AreaChart,
  Camera,
  FilePieChart,
  BookOpen,
  Bot,
} from 'lucide-react-native';

interface TabBarIconProps {
  Icon: React.ComponentType<{ color: string; size: number }>;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = React.memo(({ Icon, color, size }) => (
  <Icon color={color} size={size} />
));

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isProfessional = user?.role === 'Accountant' || user?.role === 'Administrator';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 10,
          display: 'flex',
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={LayoutDashboard} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Briefcase} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={ArrowRightLeft} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={FilePieChart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Landmark} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={AreaChart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Camera} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={PiggyBank} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={BookOpen} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Bot} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Settings} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}