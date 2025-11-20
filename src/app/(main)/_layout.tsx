import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/shared/context/ThemeProvider';
import { View, StyleSheet, Platform } from 'react-native';
import { LayoutDashboard, CreditCard, QrCode, PieChart, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function MainLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // VISIBLE LABELS ("Spell out the names")
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'transparent', // Glass effect
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 25, 47, 0.95)' }} />
          </View>
        ),
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <LayoutDashboard size={24} color={color} />
          ),
        }}
      />

      {/* 2. MY CARDS */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'My Cards',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <CreditCard size={24} color={color} />
          ),
        }}
      />

      {/* 3. SCAN (Standard Tab) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View style={[styles.scanIcon, focused && styles.scanIconActive]}>
               <QrCode size={24} color={focused ? '#FFF' : color} />
            </View>
          ),
        }}
      />

      {/* 4. STATISTICS */}
      <Tabs.Screen
        name="reports" // Points to Reports/Statistics page
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <PieChart size={24} color={color} />
          ),
        }}
      />

      {/* 5. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <User size={24} color={color} />
          ),
        }}
      />

      {/* HIDDEN TABS */}
      <Tabs.Screen name="clients" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="budgets" options={{ href: null }} />
      <Tabs.Screen name="camera" options={{ href: null }} />
      <Tabs.Screen name="client/[id]" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="ai-chat" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanIcon: {
    padding: 6,
  },
  scanIconActive: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 6,
  }
});