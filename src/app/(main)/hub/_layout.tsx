import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  FileText, 
  Search, 
  LifeBuoy, 
  LayoutGrid 
} from 'lucide-react-native';

export default function HubLayout() {
  const insets = useSafeAreaInsets();
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
        headerTitleStyle: { fontWeight: '700', color: 'white' },
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
        },
      }}
    >
      {/* 1. Documents */}
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <FileText size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 2. Find CPA */}
      <Tabs.Screen
        name="find-cpa"
        options={{
          title: 'Find Expert',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <Search size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 3. Support */}
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          headerShown: true,
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-70'}`}>
              <LifeBuoy size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}