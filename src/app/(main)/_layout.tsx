import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Image, Platform } from 'react-native';
import { Tabs, Redirect, useRouter, usePathname, Slot } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext';
// FIX: We need ROLE_NAV_ITEMS to determine what the sidebar shows
import { ROLE_NAV_ITEMS } from '../../constants'; 
import { MainHeader } from '../../shared/components/MainHeader'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  CreditCard,
  Briefcase, // The Hub Icon
  Users,
  ShieldAlert,
  MessageSquare,
  Settings,
  LogOut,
  Bot,
  ArrowRight
} from 'lucide-react-native';

// --- 1. NAVIGATION CONFIGURATION (Source of Truth) ---
const NAV_CONFIG: Record<string, { name: string, icon: any, path: string, label: string }> = {
  'Dashboard':    { name: 'index',          icon: LayoutDashboard, path: '/(main)/',             label: 'Home' },
  'Transactions': { name: 'finances',       icon: CreditCard,      path: '/(main)/finances',     label: 'Finances' },
  'Approvals':    { name: 'approvals',      icon: Briefcase,       path: '/(main)/approvals',    label: 'Approvals' },
  // HUB ITEM: Placed after Transactions/Finances (Order is determined by ROLE_NAV_ITEMS array)
  'Hub':          { name: 'hub',            icon: Briefcase,       path: '/(main)/hub',          label: 'Hub' }, 
  'CPA Portal':   { name: 'cpa',            icon: Users,           path: '/(main)/cpa',          label: 'CPA Portal' },
  'Admin':        { name: 'admin',          icon: ShieldAlert,     path: '/(main)/admin',        label: 'Admin' },
  'AI Chat':      { name: 'aiChat',         icon: Bot,             path: '/(main)/aiChat',       label: 'AI Chat' },
  'Settings':     { name: 'settings',       icon: Settings,        path: '/(main)/settings',     label: 'Settings' },
  'Messages':     { name: 'messages/index', icon: MessageSquare,   path: '/(main)/messages',     label: 'Messages' },
};

// --- 2. DESKTOP SIDEBAR COMPONENT (GENERATED NAVIGATION) ---
const RoleBadge = ({ role }: { role: string }) => {
  let bg = 'bg-white/5';
  let text = 'text-[#8892B0]';
  
  switch (role) {
    case 'admin': bg = 'bg-red-500/10'; text = 'text-red-500'; break;
    case 'cpa':   bg = 'bg-purple-500/10'; text = 'text-purple-400'; break;
    case 'premium': bg = 'bg-[#64FFDA]/10'; text = 'text-[#64FFDA]'; break;
    case 'support': bg = 'bg-blue-500/10'; text = 'text-blue-400'; break;
    default:
        bg = 'bg-white/5'; text = 'text-[#8892B0]';
  }
  return (
    <View className={`px-2 py-0.5 rounded-md ${bg} self-start mt-1`}>
      <Text className={`${text} text-[10px] font-bold uppercase`}>{role}</Text>
    </View>
  );
};

const SidebarContent = ({ user, logout }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine allowed navigation items based on user role
  const userRole = user.role || 'member';
  // Fallback to member if role is missing or invalid
  const allowedKeys = ROLE_NAV_ITEMS[userRole] || ROLE_NAV_ITEMS['member']; 
  const navItems = allowedKeys.map((key: string) => NAV_CONFIG[key]).filter(Boolean);

  return (
    <View className="flex-col flex-1">
      
      {/* App Logo/Branding */}
      <View className="items-center p-6 mb-6">
        <View className="w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-3 border border-[#233554]">
          <Text className="text-[#64FFDA] font-bold text-2xl">N</Text>
        </View>
        <Text className="text-lg font-bold text-white">NorthFinance</Text>
      </View>

      {/* Navigation List */}
      <ScrollView className="flex-1 px-3">
        {navItems.map((config: any) => {
          // Check if current path starts with the navigation path (e.g., /finances/reports)
          const isActive = pathname.startsWith(config.path); 
          return (
            <TouchableOpacity
              key={config.name}
              onPress={() => router.push(config.path as any)}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive ? 'bg-[#112240] border border-[#64FFDA]/30' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <config.icon size={20} color={isActive ? '#64FFDA' : '#8892B0'} />
              <Text className={`font-medium text-base ${isActive ? 'text-white' : 'text-[#8892B0]'}`}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* User Profile Footer */}
      <View className="p-4 border-t border-[#233554]">
        <View className="flex-row items-center gap-3 px-2 mb-4">
          <TouchableOpacity 
            onPress={() => router.push('/(main)/settings/profile')}
            className="w-10 h-10 rounded-full bg-[#112240] overflow-hidden border border-[#233554]"
          >
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" /> 
            ) : (
              <View className="items-center justify-center h-full"><Text className="text-[#64FFDA] font-bold">{user.name?.[0]}</Text></View>
            )}
          </TouchableOpacity>
          <View className="justify-center flex-1">
            <Text className="text-sm font-bold text-white truncate">{user.name}</Text>
            <RoleBadge role={user.role} />
          </View>
        </View>
        
        <TouchableOpacity onPress={logout} className="flex-row items-center justify-center gap-3 px-4 py-3 border rounded-xl bg-red-500/10 border-red-500/20">
          <LogOut size={18} color="#F87171" />
          <Text className="text-[#F87171] font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- 3. MAIN LAYOUT (RESPONSIVE SWITCHER) ---
export default function MainLayout() {
  const { user, isLoading, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Desktop sidebar breakpoint

  if (isLoading) return <View className="flex-1 bg-[#0A192F] items-center justify-center"><Text className="text-[#64FFDA]">Loading...</Text></View>;
  if (!user) return <Redirect href="/(auth)/login" />;

  // Mobile Tabs Logic
  if (isMobile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* We only render MainHeader inside the individual screens to save space on mobile */}
          
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false, 
              tabBarStyle: { 
                backgroundColor: '#020C1B',
                borderTopWidth: 1,
                borderTopColor: '#233554',
                height: Platform.OS === 'ios' ? 85 : 65,
                paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                paddingTop: 10,
              },
              tabBarActiveTintColor: '#64FFDA',
              tabBarInactiveTintColor: '#8892B0',
            }}
          >
            {/* 1. Dashboard */}
            <Tabs.Screen name="index" options={{
                href: NAV_CONFIG.Dashboard.path,
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center w-16 gap-1">
                        <LayoutDashboard size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 2. Finances */}
            <Tabs.Screen name="finances" options={{
                href: NAV_CONFIG.Transactions.path,
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center w-16 gap-1">
                        <CreditCard size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 3. Hub (Briefcase) */}
            <Tabs.Screen
                name="hub" 
                options={{
                    title: NAV_CONFIG.Hub.label,
                    href: NAV_CONFIG.Hub.path,
                    tabBarIcon: ({ color }: { color: string }) => (
                        <View className="items-center justify-center w-16 gap-1">
                            <Briefcase size={24} color={color} />
                            <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                        </View>
                    )
                }}
            />

            {/* 4. AI Chat */}
            <Tabs.Screen name="aiChat" options={{
                href: NAV_CONFIG['AI Chat'].path,
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center w-16 gap-1">
                        <Bot size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 5. Settings */}
            <Tabs.Screen name="settings" options={{
                href: NAV_CONFIG.Settings.path, 
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center w-16 gap-1">
                        <Settings size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* Conditional and Hidden Tabs (Must remain listed for routing but set href: null if unauthorized) */}
            <Tabs.Screen name="admin" options={{ href: user.role === 'admin' ? NAV_CONFIG.Admin.path : null }} />
            <Tabs.Screen name="cpa" options={{ href: user.role === 'cpa' ? NAV_CONFIG['CPA Portal'].path : null }} />
            
            {/* HIDE ALL SUB-ROUTES that are managed by Stacks */}
            <Tabs.Screen name="documents" options={{ href: null }} />
            <Tabs.Screen name="find-cpa" options={{ href: null }} />
            <Tabs.Screen name="support" options={{ href: null }} />
            <Tabs.Screen name="messages/index" options={{ href: null }} />
            <Tabs.Screen name="messages/[id]" options={{ href: null }} />
            <Tabs.Screen name="scan" options={{ href: null }} />
            <Tabs.Screen name="quick-add" options={{ href: null }} />
            <Tabs.Screen name="organization" options={{ href: null }} />
            <Tabs.Screen name="approvals" options={{ href: null }} />
            <Tabs.Screen name="invoices" options={{ href: null }} />
            
          </Tabs>
        </SafeAreaView>
      </View>
    );
  }

  // Desktop Layout
  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="flex-row flex-1">
        <View className="w-64 bg-[#0A192F] border-r border-[#233554] h-full">
          {/* SidebarContent handles the dynamic generation of navigation items */}
          <SidebarContent user={user} logout={logout} />
        </View>
        <View className="flex-1 bg-[#0A192F]">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}