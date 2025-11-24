import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Image, Platform } from 'react-native';
import { Tabs, Redirect, useRouter, usePathname, Slot } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext';
import { ROLE_NAV_ITEMS } from '../../constants';
import { UserRole } from '../../types';
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
  LogOut,
  ScanLine
} from 'lucide-react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Configuration ---

const NAV_CONFIG: Record<string, { name: string, icon: any, path: string, label: string }> = {
  'Dashboard':    { name: 'index',        icon: LayoutDashboard, path: '/(main)/',             label: 'Home' },
  'Transactions': { name: 'transactions', icon: CreditCard,      path: '/(main)/transactions', label: 'Transactions' },
  'Documents':    { name: 'documents',    icon: FileText,        path: '/(main)/documents',    label: 'Docs' },
  'Reports':      { name: 'reports',      icon: PieChart,        path: '/(main)/reports',      label: 'Reports' },
  'CPA Portal':   { name: 'CpaDashboard', icon: Users,           path: '/(main)/CpaDashboard', label: 'CPA Portal' },
  'Support':      { name: 'support',      icon: LifeBuoy,        path: '/(main)/support',      label: 'Support' },
  'Admin':        { name: 'admin',        icon: ShieldAlert,     path: '/(main)/admin',        label: 'Admin' },
  'AI Chat':      { name: 'aiChat',       icon: MessageSquare,   path: '/(main)/aiChat',       label: 'AI Chat' },
  'Settings':     { name: 'settings',     icon: Settings,        path: '/(main)/settings',     label: 'Settings' },
  'Scan':         { name: 'scan',         icon: ScanLine,        path: '/(main)/scan',         label: 'Scan' },
};

// --- Components ---

const RoleBadge = ({ role }: { role: string }) => {
  let bg = 'bg-[#112240]';
  let text = 'text-[#8892B0]';

  switch (role) {
    case UserRole.ADMIN: bg = 'bg-red-500/10'; text = 'text-red-500'; break;
    case UserRole.CPA:   bg = 'bg-purple-500/10'; text = 'text-purple-400'; break;
    case UserRole.PREMIUM: bg = 'bg-[#64FFDA]/10'; text = 'text-[#64FFDA]'; break;
    case UserRole.SUPPORT: bg = 'bg-blue-500/10'; text = 'text-blue-400'; break;
  }

  return (
    <View className={`px-2 py-0.5 rounded-md ${bg} self-start mt-1`}>
      <Text className={`${text} text-[10px] font-bold uppercase`}>{role}</Text>
    </View>
  );
};

const MobileHeader = ({ user }: { user: any }) => (
  <View className="bg-[#0A192F] px-6 pt-2 pb-4 flex-row items-center justify-between border-b border-[#233554]">
    <View className="flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-full bg-[#112240] overflow-hidden border border-[#233554]">
         {user.avatar ? (
           <Image source={{ uri: user.avatar }} className="w-full h-full" />
         ) : (
           <View className="items-center justify-center h-full w-full">
             <Text className="text-[#64FFDA] font-bold text-lg">{user.name?.[0] || 'U'}</Text>
           </View>
         )}
      </View>
      <View>
        <Text className="text-white font-bold text-base">{user.name || 'User'}</Text>
        <RoleBadge role={user.role} />
      </View>
    </View>
  </View>
);

// --- Main Layout ---

export default function MainLayout() {
  const { user, isLoading, logout } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = width < 768;

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <Text className="text-[#64FFDA]">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const allowedItems = ROLE_NAV_ITEMS[user.role] || ROLE_NAV_ITEMS['member'];
  const navItems = allowedItems.map(key => NAV_CONFIG[key]).filter(Boolean);

  // --- Mobile Layout ---
  if (isMobile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }} edges={['top']}>
        <MobileHeader user={user} />
        
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
          {/* 1. Render tabs for allowed items */}
          {navItems.map(config => (
            <Tabs.Screen
              key={config.name}
              name={config.name}
              options={{
                href: config.path,
                tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
                   const Icon = config.icon;
                   return (
                     <View className="items-center justify-center gap-1 w-16">
                       <Icon size={24} color={color} />
                       {focused && <View className="w-1 h-1 rounded-full bg-[#64FFDA] mt-1" />}
                     </View>
                   );
                },
              }}
            />
          ))}

          {/* 2. Render hidden tabs for screens that exist but shouldn't be in the bar */}
          {/* We MUST filter out screens already rendered above to avoid 'Duplicate Screen Name' error */}
          {Object.values(NAV_CONFIG)
            .filter(config => !navItems.some(item => item.name === config.name))
            .map(config => (
              <Tabs.Screen 
                key={config.name}
                name={config.name} 
                options={{ href: null }} 
              />
          ))}

          {/* 3. Explicitly handle dynamic routes or extras */}
          <Tabs.Screen name="messages/[id]" options={{ href: null }} />
        </Tabs>
      </SafeAreaView>
    );
  }

  // --- Desktop Sidebar Layout ---
  const SidebarContent = () => (
    <View className="flex-1">
      <View className="p-6 items-center mb-6">
        <View className="w-12 h-12 bg-[#112240] rounded-xl items-center justify-center mb-3 border border-[#233554]">
          <Text className="text-[#64FFDA] font-bold text-2xl">N</Text>
        </View>
        <Text className="text-white font-bold text-lg">NorthFinance</Text>
        <RoleBadge role={user.role} />
      </View>

      <ScrollView className="flex-1 px-3">
        {navItems.map(config => {
          const Icon = config.icon;
          const isActive = config.path === '/(main)/' 
            ? pathname === '/' || pathname === '/(main)' || pathname === '/(main)/'
            : pathname.startsWith(config.path);

          return (
            <TouchableOpacity
              key={config.name}
              onPress={() => router.push(config.path as any)}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive ? 'bg-[#112240] border border-[#64FFDA]/30' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Icon size={20} color={isActive ? '#64FFDA' : '#8892B0'} />
              <Text className={`font-medium text-base ${isActive ? 'text-white' : 'text-[#8892B0]'}`}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="p-4 border-t border-[#233554]">
        <View className="flex-row items-center gap-3 mb-4 px-2">
          <View className="w-8 h-8 rounded-full bg-[#112240] overflow-hidden">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <View className="items-center justify-center h-full"><Text className="text-[#64FFDA]">{user.name?.[0]}</Text></View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-medium truncate">{user.name}</Text>
            <Text className="text-[#8892B0] text-xs truncate">{user.email}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={logout}
          className="flex-row items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
        >
          <LogOut size={18} color="#F87171" />
          <Text className="text-[#F87171] font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="flex-1 flex-row">
        <View className="w-64 bg-[#0A192F] border-r border-[#233554] h-full">
          <SidebarContent />
        </View>
        <View className="flex-1 bg-[#0A192F]">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}