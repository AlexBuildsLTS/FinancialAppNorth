import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { ActivityIndicator, View, Platform, useWindowDimensions } from 'react-native';
import { 
    Home, Briefcase, CreditCard, Camera, ShieldCheck, 
    PiggyBank, PieChart, FileText, BookCopy, BarChart3, MessageCircle 
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';

export default function TabLayout() {
  const { colors } = useTheme();
  const { user, initialized } = useAuth();
  const { width } = useWindowDimensions();
  
  if (!initialized) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }
  
  const isProfessional = user?.role === 'Professional (CPA)' || user?.role === 'Administrator';
  const isAdmin = user?.role === 'Administrator';

  // --- RESPONSIVE LOGIC IMPLEMENTED ---
  // Labels are shown only on web and when the screen is wider than 768px.
  // On mobile (Android/iOS) or small web windows, only icons are shown.
  const showLabels = Platform.OS === 'web' && width > 768;

  type TabHref = React.ComponentProps<typeof Redirect>['href'];

  interface TabConfig {
    name: string;
    title: string;
    icon: any; // You might want to refine this type if possible
    condition?: boolean;
    href?: TabHref;
  }

  const tabs: TabConfig[] = [
    { name: 'index', title: 'Dashboard', icon: Home },
    { name: 'transactions', title: 'Transactions', icon: CreditCard },
    { name: 'analytics', title: 'Analytics', icon: PieChart },
    { name: 'budgets', title: 'Budgets', icon: PiggyBank },
    { name: 'camera', title: 'Scan', icon: Camera },
    { name: 'clients', title: 'Clients', icon: Briefcase, condition: isProfessional },
    { name: 'admin', title: 'Admin', href: '/admin', icon: ShieldCheck, condition: isAdmin },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { 
            backgroundColor: colors.surface, 
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
        },
        headerShown: false,
        tabBarShowLabel: showLabels, // <-- THE RESPONSIVE LOGIC IS APPLIED HERE
      }}>
      {tabs.map(tab => {
        if (tab.condition === false) return null;
        return (
          <Tabs.Screen 
            key={tab.name}
            name={tab.name} 
            options={{ 
              title: tab.title, 
              ...(tab.href ? { href: tab.href } : {}),
              tabBarIcon: ({ color, size }) => <tab.icon color={color} size={24} /> 
            }} 
          />
        );
      })}

      {/* HIDDEN ROUTES */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="ai-assistant" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ href: null }} />
      <Tabs.Screen name="client" options={{ href: null }} />
      <Tabs.Screen name="accounts" options={{ href: null }} />
    </Tabs>
  );
}
