import { Tabs } from 'expo-router';
import { CreditCard, PieChart, FileText } from 'lucide-react-native';
import React from 'react';

export default function FinancesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#020C1B', // Matched to main layout
          borderTopWidth: 1,
          borderTopColor: '#233554',
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#8892B0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <CreditCard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <PieChart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}