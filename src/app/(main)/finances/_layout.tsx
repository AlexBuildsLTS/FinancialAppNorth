import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  List, 
  PieChart, 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  Activity
} from 'lucide-react-native';

/**
 * FinancesLayout
 * ------------------------------------------------
 * Fixed TypeScript errors for tabBarIcon props.
 */
export default function FinancesLayout() {
  const insets = useSafeAreaInsets();

  // Dynamic height calculation for modern devices
  const tabBarHeight = Platform.OS === 'ios' ? 85 + insets.bottom / 4 : 70;
  const paddingBottom = Platform.OS === 'ios' ? 25 + insets.bottom / 4 : 10;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#0A192F',
          borderBottomWidth: 1,
          borderBottomColor: '#112240',
        },
        headerTintColor: '#64FFDA',
        headerTitleStyle: {
          fontWeight: '700',
          color: 'white',
          fontSize: 18,
        },
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#64FFDA', 
        tabBarInactiveTintColor: '#8892B0', 
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        animation: 'shift', 
      }}
    >
      {/* 1. Overview Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          headerShown: false,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <LayoutDashboard size={22} color={color} />
            </View>
          ),
        }}
      />
      
      {/* 2. Transactions List */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <List size={22} color={color} />
            </View>
          ),
        }}
      />
      
      {/* 3. Smart Budgets */}
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <Wallet size={22} color={color} />
            </View>
          ),
        }}
      />
      
      {/* 4. Subscription Manager */}
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <CreditCard size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 5. Financial Health (Scorecard) */}
      <Tabs.Screen
        name="scorecard"
        options={{
          title: 'Financial Health',
          headerShown: true,
          tabBarLabel: 'Health',
          headerTitle: 'Financial Health Score',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <Activity size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 6. Analytics Reports */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <PieChart size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}