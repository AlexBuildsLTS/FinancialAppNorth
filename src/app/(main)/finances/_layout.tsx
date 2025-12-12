import { Tabs } from 'expo-router';
import { List, PieChart, LayoutDashboard, Wallet } from 'lucide-react-native';
import { Platform } from 'react-native';
import React from 'react';

export default function FinancesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#8892B0',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2
        }
      }}
    >
      {/* 1. Overview */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }: { color: string }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      
      {/* 2. Transactions */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }: { color: string }) => <List size={22} color={color} />,
        }}
      />
      
      {/* 3. Budgets */}
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color }: { color: string }) => <Wallet size={22} color={color} />,
        }}
      />
      
      {/* 4. Reports */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }: { color: string }) => <PieChart size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}