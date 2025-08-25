import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { Home, Briefcase, Receipt, Camera, FileText, MessageCircle } from 'lucide-react-native';
import { Platform, View } from 'react-native';

const TabIcon = ({ icon: Icon, color, focused }: { icon: any, color: string, focused: boolean }) => {
    // A subtle visual difference for the focused tab
    return (
        <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderTopColor: focused ? color : 'transparent',
            borderTopWidth: 2,
            paddingTop: 4,
            width: '100%',
        }}>
            <Icon color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
        </View>
    );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const isProfessional = user?.role === 'Professional Accountant' || user?.role === 'Administrator';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false, // Hiding labels for a cleaner, icon-only look
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 20,
          right: 20,
          elevation: 0, // Remove default Android shadow
          backgroundColor: colors.surface,
          borderRadius: 20,
          height: 65,
          borderTopWidth: 0,
          // Custom shadow for a floating effect
          shadowColor: isDark ? '#000' : '#4E5C79',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, focused }) => <TabIcon icon={Home} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="clients"
        options={{ 
          title: 'Clients', 
          tabBarIcon: ({ color, focused }) => <TabIcon icon={Briefcase} color={color} focused={focused} />,
          href: isProfessional ? '/clients' : null, // This hides the tab for non-professional users
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{ title: 'Transactions', tabBarIcon: ({ color, focused }) => <TabIcon icon={Receipt} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="camera"
        options={{ title: 'Scan', tabBarIcon: ({ color, focused }) => <TabIcon icon={Camera} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="documents"
        options={{ title: 'Documents', tabBarIcon: ({ color, focused }) => <TabIcon icon={FileText} color={color} focused={focused} /> }}
      />
       <Tabs.Screen
        name="support"
        options={{ title: 'Support', tabBarIcon: ({ color, focused }) => <TabIcon icon={MessageCircle} color={color} focused={focused} /> }}
      />
    </Tabs>
  );
}
