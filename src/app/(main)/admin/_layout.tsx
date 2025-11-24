import { Tabs } from 'expo-router';
import { LayoutDashboard, Users, Server } from 'lucide-react-native';
import React from 'react';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: '#233554',
        },
        tabBarActiveTintColor: '#F87171', // Red tint for Admin area
        tabBarInactiveTintColor: '#8892B0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }: { color: string }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }: { color: string }) => <Users size={20} color={color} />,
        }}
      />
      {/* You can add a system status screen here if needed, or hide it */}
      <Tabs.Screen
        name="system"
        options={{
          title: 'System',
          tabBarIcon: ({ color }: { color: string }) => <Server size={20} color={color} />,
          href: null, // Hide if you don't have the screen yet
        }}
      />
    </Tabs>
  );
}