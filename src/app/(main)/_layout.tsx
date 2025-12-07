import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Image, Platform } from 'react-native';
import { Tabs, Redirect, useRouter, usePathname, Slot } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext';
import { ROLE_NAV_ITEMS } from '../../constants';
import { UserRole } from '../../types';
import { MainHeader } from '../../shared/components/MainHeader'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Users,
  LifeBuoy,
  ShieldAlert,
  MessageSquare,
  Settings,
  LogOut,
  Bot,
  ScanLine,
  Search
} from 'lucide-react-native';

// --- 1. NAVIGATION CONFIGURATION ---
// Maps "Friendly Names" to "File Routes"
const NAV_CONFIG: Record<string, { name: string, icon: any, path: string, label: string }> = {
  'Dashboard':    { name: 'index',          icon: LayoutDashboard, path: '/(main)/',             label: 'Home' },
  'Transactions': { name: 'finances',       icon: CreditCard,      path: '/(main)/finances',     label: 'Finances' },
  'Documents':    { name: 'documents',      icon: FileText,        path: '/(main)/documents',    label: 'Docs' },
  'Find CPA':     { name: 'find-cpa',       icon: Search,          path: '/(main)/find-cpa',     label: 'Find CPA' },
  'CPA Portal':   { name: 'cpa',            icon: Users,           path: '/(main)/cpa',          label: 'CPA Portal' },
  'Support':      { name: 'support',        icon: LifeBuoy,        path: '/(main)/support',      label: 'Support' },
  'Admin':        { name: 'admin',          icon: ShieldAlert,     path: '/(main)/admin',        label: 'Admin' },
  'AI Chat':      { name: 'aiChat',         icon: Bot,             path: '/(main)/aiChat',       label: 'AI Chat' },
  'Settings':     { name: 'settings',       icon: Settings,        path: '/(main)/settings',     label: 'Settings' },
  'Messages':     { name: 'messages/index', icon: MessageSquare,   path: '/(main)/messages',     label: 'Messages' },
};

// --- 2. DESKTOP SIDEBAR COMPONENT ---
const RoleBadge = ({ role }: { role: UserRole }) => {
  let bg = 'bg-[#112240]';
  let text = 'text-[#8892B0]';
  switch (role) {
    case UserRole.ADMIN: bg = 'bg-red-500/10'; text = 'text-red-500'; break;
    case UserRole.CPA:   bg = 'bg-purple-500/10'; text = 'text-purple-400'; break;
    case UserRole.PREMIUM: bg = 'bg-[#64FFDA]/10'; text = 'text-[#64FFDA]'; break;
    case UserRole.SUPPORT: bg = 'bg-blue-500/10'; text = 'text-blue-400'; break;
    case UserRole.MEMBER: 
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
  
  const allowedItems = ROLE_NAV_ITEMS[user.role as UserRole] || ROLE_NAV_ITEMS['member'];
  const navItems = allowedItems.map((key: string) => NAV_CONFIG[key]).filter(Boolean);

  return (
    <View className="flex-1 flex-col">
      <View className="p-6 items-center mb-6">
        <View className="w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-3 border border-[#233554]">
          <Text className="text-[#64FFDA] font-bold text-2xl">N</Text>
        </View>
        <Text className="text-white font-bold text-lg">NorthFinance</Text>
      </View>

      <ScrollView className="flex-1 px-3">
        {navItems.map((config: any) => {
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

      <View className="p-4 border-t border-[#233554]">
        <View className="flex-row items-center gap-3 mb-4 px-2">
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
          <View className="flex-1 justify-center">
            <Text className="text-white text-sm font-bold truncate">{user.name}</Text>
            <RoleBadge role={user.role as UserRole} />
          </View>
        </View>
        
        <TouchableOpacity onPress={logout} className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 justify-center">
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
  const isMobile = width < 768;

  if (isLoading) return <View className="flex-1 bg-[#0A192F] items-center justify-center"><Text className="text-[#64FFDA]">Loading...</Text></View>;
  if (!user) return <Redirect href="/(auth)/login" />;

  const allowedItems = ROLE_NAV_ITEMS[user.role as UserRole] || ROLE_NAV_ITEMS['member'];
  const navItems = allowedItems.map((key: string) => NAV_CONFIG[key]).filter(Boolean);

  if (isMobile) {
    // Mobile Navigation: Bottom Tabs
    // Remove 'Messages' from bottom bar (it lives in Header)
    const mobileNavItems = navItems.filter(config => 
        config.name !== 'messages/index' && 
        !config.name.includes('/') // Keep only single-level routes
    ); 

    return (
      <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <MainHeader />
          
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
                href: '/(main)/',
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <LayoutDashboard size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 2. Finances Folder */}
            <Tabs.Screen name="finances" options={{
                href: '/(main)/finances',
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <CreditCard size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 3. Documents */}
            <Tabs.Screen name="documents" options={{
                href: '/(main)/documents',
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <FileText size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 4. AI Chat */}
            <Tabs.Screen name="aiChat" options={{
                href: '/(main)/aiChat',
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <Bot size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 5. Support (NEW VISIBLE TAB) */}
            <Tabs.Screen name="support" options={{
                href: '/(main)/support',
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <LifeBuoy size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* 6. Settings Folder */}
            <Tabs.Screen name="settings" options={{
                href: '/(main)/settings',
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <Settings size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* --- ADMIN / CPA TABS (Conditional) --- */}
            {/* Only show Admin tab if user is Admin */}
            <Tabs.Screen name="admin" options={{
                href: user.role === UserRole.ADMIN ? '/(main)/admin' : null,
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <ShieldAlert size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />
            
            {/* Only show CPA tab if user is CPA */}
            <Tabs.Screen name="cpa" options={{
                href: user.role === UserRole.CPA ? '/(main)/cpa' : null,
                tabBarIcon: ({ color }: { color: string }) => (
                    <View className="items-center justify-center gap-1 w-16">
                        <Users size={24} color={color} />
                        <View className={`w-1 h-1 rounded-full ${color === '#64FFDA' ? 'bg-[#64FFDA]' : 'bg-transparent'} mt-1`} />
                    </View>
                )
            }} />

            {/* --- HIDDEN SCREENS (Registered but No Icon) --- */}
            {/* Messages Folder (Index + Dynamic ID) */}
            <Tabs.Screen name="messages/index" options={{ href: null }} />
            <Tabs.Screen name="messages/[id]" options={{ href: null }} />

            {/* Other Hidden Screens */}
            <Tabs.Screen name="scan" options={{ href: null }} />
            <Tabs.Screen name="find-cpa" options={{ href: null }} />

          </Tabs>
        </SafeAreaView>
      </View>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="flex-1 flex-row">
        {/* Left Sidebar */}
        <View className="w-64 bg-[#0A192F] border-r border-[#233554] h-full">
          <SidebarContent user={user} logout={logout} />
        </View>
        
        {/* Main Content */}
        <View className="flex-1 bg-[#0A192F]">
          {/* Use Slot to render the child route */}
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}