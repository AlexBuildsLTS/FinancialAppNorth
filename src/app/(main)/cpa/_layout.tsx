import { Tabs } from 'expo-router';
import { Users, Calculator, ClipboardList } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

export default function CpaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }: { color?: string }) => <Users size={22} color={color} />,
        }}
      />
      
      {/* Renamed route for clarity. 
         Using 'Calculator' as the icon for Tax/Variable data.
      */}
      <Tabs.Screen
        name="tax-reports"
        options={{
          title: 'Tax Reports',
          tabBarIcon: ({ color }: { color?: string }) => <Calculator size={22} color={color} />,
        }}
      />

      {/* Hidden Utility Routes */}
      <Tabs.Screen
        name="invite"
        options={{
          href: null,
          title: 'Invite Client',
        }}
      />

      <Tabs.Screen
        name="client-documents"
        options={{
          href: null,
          title: 'Documents',
        }}
      />

    </Tabs>
  );
}