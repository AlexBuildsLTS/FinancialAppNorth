import { Tabs } from 'expo-router';
import { Users, FileText, ClipboardList } from 'lucide-react-native';
import React from 'react';

export default function CpaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 10,
          paddingTop: 10
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }: { color: string }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          href: null, // Hiding this tab as requests are now merged into index
          title: 'Requests',
          tabBarIcon: ({ color }: { color: string }) => <ClipboardList size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="client-documents"
        options={{
          href: null, // Hidden tab, accessed via navigation
          title: 'Documents',
        }}
      />
      <Tabs.Screen
        name="invite"
        options={{
          href: null, // Hidden tab, accessed via navigation
          title: 'Invite',
        }}
      />
    </Tabs>
  );
}