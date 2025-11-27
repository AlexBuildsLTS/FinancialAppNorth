import { Tabs } from 'expo-router';
import { List, PieChart, BarChart4, LayoutDashboard } from 'lucide-react-native';
import { Platform } from 'react-native';
import React from 'react';
// FIX: Go up 4 levels to find global.css in the project root
import "../../../../global.css"; 

export default function FinancesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#8892B0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      {/* 1. Overview (Default Page) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }: { color: string }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      {/* 2. Transactions List */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }: { color: string }) => <List size={24} color={color} />,
        }}
      />
      {/* 3. Budgets */}
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }: { color: string }) => <PieChart size={24} color={color} />,
        }}
      />
      {/* 4. Reports */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }: { color: string }) => <BarChart4 size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}