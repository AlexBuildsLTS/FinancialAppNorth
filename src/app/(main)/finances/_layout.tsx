import { Tabs } from 'expo-router';
import { List, PieChart, BarChart4, LayoutDashboard } from 'lucide-react-native';
import { Platform } from 'react-native';
import React from 'react';
import "../../../../global.css"; // FIX: Corrected CSS path

export default function FinancesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#64FFDA', // Teal indicator line
          height: 3,
          borderRadius: 1.5,
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#8892B0',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        }
      }}
    >
      {/* 1. Overview (Default Page - The AI/Chart Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview (AI)',
          tabBarIcon: ({ color }: { color: string }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      {/* 2. Transactions List */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }: { color: string }) => <List size={20} color={color} />,
        }}
      />
      {/* 3. Budgets */}
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }: { color: string }) => <PieChart size={20} color={color} />,
        }}
      />
      {/* 4. Reports */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }: { color: string }) => <BarChart4 size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}