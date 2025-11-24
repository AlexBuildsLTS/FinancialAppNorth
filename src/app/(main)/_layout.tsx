import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, useWindowDimensions } from 'react-native';
import { Tabs, Redirect, useRouter, usePathname, Slot } from 'expo-router';
import { UserRole } from '@/types';
import { useAuth } from '@/shared/context/AuthContext';
import { ROLE_NAV_ITEMS } from '@/constants';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  PieChart, 
  Users, 
  LifeBuoy, 
  ShieldAlert, 
  MessageSquare, 
  Settings,
  LogOut
} from 'lucide-react-native';
import React from 'react';
import { ScrollView as GestureHandlerRootView } from 'react-native-gesture-handler';    

const NAV_CONFIG: Record<string, { name: string, icon: any, path: string }> = {
  'Dashboard': { name: 'index', icon: LayoutDashboard, path: '/(main)/' },
  'Transactions': { name: 'transactions', icon: CreditCard, path: '/(main)/transactions' },
  'Documents': { name: 'documents', icon: FileText, path: '/(main)/documents' },
  'Scan': { name: 'scan', icon: PieChart, path: '/(main)/scan' },
  'Support': { name: 'support', icon: LifeBuoy, path: '/(main)/support' },
  'Admin': { name: 'admin', icon: ShieldAlert, path: '/(main)/admin' },
  'Settings': { name: 'settings', icon: Settings, path: '/(main)/settings' },
};
const AIChat = { name: 'aiChat', icon: MessageSquare, path: '/(main)/aiChat' };

// Add AIChat to NAV_CONFIG
NAV_CONFIG.AIChat = AIChat;

const ADMIN_NAV_ITEMS = [
  'Dashboard',
  'Transactions',
  'Documents',
  'Scan',
  'AIChat',
  'Support',
  'Admin',
  'Settings',
];

const CPA_NAV_ITEMS = [
  'Dashboard',
  'Transactions',
  'Documents',
  'Scan',
  'AIChat',
  'Support',
  'Settings',
];

const MEMBER_NAV_ITEMS = [
  'Dashboard',
  'Transactions',
  'Documents',
  'Scan',
  'AIChat',
  'Support',
  'Settings',
];

// Update ROLE_NAV_ITEMS with the new AIChat item
ROLE_NAV_ITEMS[UserRole.ADMIN] = ADMIN_NAV_ITEMS;
ROLE_NAV_ITEMS[UserRole.CPA] = CPA_NAV_ITEMS;
ROLE_NAV_ITEMS[UserRole.MEMBER] = MEMBER_NAV_ITEMS;

export default function MainLayout() {
  const { user, isLoading, logout } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = width < 768; // Tailwind's 'lg' breakpoint

  if (isLoading) {
    return <View className="flex-1 bg-[#0A192F] items-center justify-center"><Text className="text-white">Loading...</Text></View>;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const allowedNavItems = ROLE_NAV_ITEMS[user.role] || [];
  const navItemsToDisplay = allowedNavItems.map(item => NAV_CONFIG[item]).filter(Boolean);

  // Mobile Bottom Tab Bar Layout
  if (isMobile) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { 
            backgroundColor: '#112240',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
          },
        }}
      >
        {navItemsToDisplay.map(config => {
          if (!config) return null;
          const Icon = config.icon;
          const isActive = pathname === config.path;
          return (
            <Tabs.Screen
              key={config.name}
              name={config.name}
              options={{
                tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
                  <View className="items-center justify-center gap-1">
                    <Icon size={24} color={focused ? '#64FFDA' : '#8892B0'} />
                    {/* <Text className={`text-xs ${focused ? 'text-[#64FFDA]' : 'text-[#8892B0]'}`}>{config.name}</Text> */}
                  </View>
                ),
              }}
            />
          );
        })}
      </Tabs>
    );
  }

  // Desktop Sidebar Layout
  const SidebarContent = () => (
    <View className="flex-1">
      <View className="p-6 items-center mb-6">
        <View className="w-12 h-12 bg-[#64FFDA] rounded-xl items-center justify-center mb-3">
          <Text className="text-[#0A192F] font-bold text-2xl">N</Text>
        </View>
        <Text className="text-white font-bold text-lg">NorthFinance</Text>
        <Text className="text-[#8892B0] text-xs uppercase tracking-wider mt-1">{user.role}</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {navItemsToDisplay.map(config => {
          if (!config) return null;
          const Icon = config.icon;
          const isActive = pathname.startsWith(config.path);

          return (
            <TouchableOpacity
              key={config.name}
              onPress={() => router.push(config.path as any)}
              className={`flex-row items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all ${
                isActive ? 'bg-[#112240] border border-[#64FFDA]/30' : 'opacity-70'
              }`}
            >
              <Icon size={20} color={isActive ? '#64FFDA' : '#8892B0'} />
              <Text className={`font-medium ${isActive ? 'text-white' : 'text-[#8892B0]'}`}>
                {config.name.charAt(0).toUpperCase() + config.name.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="p-4 border-t border-white/5">
        <TouchableOpacity 
          onPress={logout}
          className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <LogOut size={20} color="#F87171" />
          <Text className="text-[#F87171] font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="flex-1 flex-row">
        <View className="w-64 bg-[#0A192F] border-r border-white/5 h-full">
          <SidebarContent />
        </View>
        <View className="flex-1 bg-[#0A192F]">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}
