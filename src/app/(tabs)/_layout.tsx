import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Chrome as Home, Briefcase, CreditCard, Camera, FileText, MessageCircle, User } from 'lucide-react-native';

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
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          paddingTop: 8,
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

      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="client" options={{ href: null }} />
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
    </Tabs>
  );
}
