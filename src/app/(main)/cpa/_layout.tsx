import React from 'react';
import { Tabs } from 'expo-router';
import { Users, FileText, ClipboardList } from 'lucide-react-native';

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
            fontWeight: '600',
            marginTop: -5
        }
      }}
    >
      {/* Main Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }: { color: string }) => <Users size={24} color={color} />,
        }}
      />
      
      {/* Hidden Route: Invite Screen */}
      <Tabs.Screen
        name="invite"
        options={{
          href: null, // Hides from tab bar
          title: 'Invite Client',
        }}
      />

      {/* Hidden Route: Documents Viewer */}
      <Tabs.Screen
        name="client-documents"
        options={{
          href: null, // Hides from tab bar
          title: 'Documents',
        }}
      />

      {/* Placeholder/Future Tab (Optional) */}
      <Tabs.Screen
        name="requests"
        options={{
          href: null, // Hiding for now as requests are merged into Dashboard
          title: 'Requests',
          tabBarIcon: ({ color }: { color: string }) => <ClipboardList size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}