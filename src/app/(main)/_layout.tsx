import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  useWindowDimensions, 
  Image, 
  Platform, 
  LayoutAnimation, 
  UIManager,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { Tabs, Redirect, useRouter, usePathname, Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur'; // Assuming expo-blur is available, else View fallback
import {
  LayoutDashboard,
  CreditCard,
  Briefcase,
  Users,
  ShieldAlert,
  MessageSquare,
  Settings,
  LogOut,
  Bot,
  Search,
  Bell,
  Menu,
  ChevronDown,
  FileText,
  LifeBuoy,
  X,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react-native';

// --- INTERNAL IMPORTS ---
import { useAuth } from '../../shared/context/AuthContext';
import { ROLE_NAV_ITEMS } from '../../constants';
import { getNotifications, subscribeToNotifications, markAllNotificationsRead } from '../../services/dataService';
import { NotificationItem, UserRole } from '../../types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// 1. CONFIGURATION & TYPES
// ============================================================================

type NavItemKey = 
  | 'Dashboard' 
  | 'Transactions' 
  | 'Documents'
  | 'Approvals' 
  | 'Hub' 
  | 'CPA Portal' 
  | 'Admin' 
  | 'AI Chat' 
  | 'Settings' 
  | 'Messages'
  | 'Support'
  | 'Find CPA';

interface NavConfigItem {
  name: string;
  icon: React.ElementType;
  path: string;
  label: string;
  description?: string; // For tooltips or expanded views
}

const NAV_CONFIG: Record<NavItemKey, NavConfigItem> = {
  'Dashboard':    { name: 'index',          icon: LayoutDashboard, path: '/(main)/',             label: 'Dashboard' },
  'Transactions': { name: 'finances',       icon: CreditCard,      path: '/(main)/finances',     label: 'Finances' },
  'Documents':    { name: 'documents',      icon: FileText,        path: '/(main)/documents',    label: 'Documents' },
  'Approvals':    { name: 'approvals',      icon: CheckCircle,     path: '/(main)/approvals',    label: 'Approvals' },
  'Hub':          { name: 'hub',            icon: Building,        path: '/(main)/hub',          label: 'Workspace' },
  'CPA Portal':   { name: 'cpa',            icon: Users,           path: '/(main)/cpa',          label: 'CPA Portal' },
  'Admin':        { name: 'admin',          icon: ShieldAlert,     path: '/(main)/admin',        label: 'Admin Console' },
  'AI Chat':      { name: 'aiChat',         icon: Bot,             path: '/(main)/aiChat',       label: 'AI CFO' },
  'Settings':     { name: 'settings',       icon: Settings,        path: '/(main)/settings',     label: 'Settings' },
  'Messages':     { name: 'messages/index', icon: MessageSquare,   path: '/(main)/messages',     label: 'Messages' },
  'Support':      { name: 'support',        icon: LifeBuoy,        path: '/(main)/support',      label: 'Support' },
  'Find CPA':     { name: 'find-cpa',       icon: Search,          path: '/(main)/find-cpa',     label: 'Find Expert' },
};

// Colors
const THEME = {
  bg: '#0A192F',
  sidebar: '#0A192F', // Or slightly lighter/darker
  card: '#112240',
  border: '#233554',
  text: '#CCD6F6',
  textDim: '#8892B0',
  accent: '#64FFDA',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};

// ============================================================================
// 2. SHARED COMPONENTS (Dropdowns, Badges)
// ============================================================================

const RoleBadge = ({ role }: { role: string }) => {
  const styles = useMemo(() => {
    switch (role) {
      case 'admin': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
      case 'cpa':   return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
      case 'premium': case 'premium_member': return { bg: 'bg-[#64FFDA]/10', text: 'text-[#64FFDA]', border: 'border-[#64FFDA]/20' };
      case 'support': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
      default: return { bg: 'bg-white/5', text: 'text-gray-400', border: 'border-white/10' };
    }
  }, [role]);

  return (
    <View className={`px-2 py-0.5 rounded text-[10px] border ${styles.bg} ${styles.border}`}>
      <Text className={`text-[10px] font-bold uppercase ${styles.text}`}>{role.replace('_', ' ')}</Text>
    </View>
  );
};

// --- Notifications Dropdown ---
const NotificationDropdown = ({ 
  visible, 
  onClose, 
  userId 
}: { 
  visible: boolean; 
  onClose: () => void; 
  userId: string; 
}) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load & Subscribe
  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    getNotifications(userId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Real-time subscription could go here
    const sub = subscribeToNotifications(userId, (newItem) => {
      setItems(prev => [newItem, ...prev]);
    });

    return () => {
      sub.unsubscribe().catch(console.error);
    };
  }, [visible, userId]);

  const handleMarkRead = async () => {
    try {
      await markAllNotificationsRead(userId);
      setItems(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  if (!visible) return null;

  return (
    <View className="absolute top-14 right-16 w-80 bg-[#112240] border border-[#233554] rounded-lg shadow-2xl z-50 overflow-hidden">
      <View className="flex-row justify-between items-center p-4 border-b border-[#233554]">
        <Text className="text-sm font-bold text-white">Notifications</Text>
        <TouchableOpacity onPress={handleMarkRead}>
          <Text className="text-[#64FFDA] text-xs">Mark all read</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="max-h-96">
        {loading ? (
           <View className="p-4"><Text className="text-[#8892B0] text-center">Loading...</Text></View>
        ) : items.length === 0 ? (
           <View className="items-center p-8">
             <Bell size={24} color="#233554" />
             <Text className="text-[#8892B0] mt-2 text-xs">No new notifications</Text>
           </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity key={item.id} className={`p-4 border-b border-[#233554] ${item.is_read ? 'opacity-50' : 'bg-[#1e2f4d]'}`}>
              <View className="flex-row gap-3">
                <View className={`w-2 h-2 mt-1.5 rounded-full ${item.is_read ? 'bg-transparent' : 'bg-[#64FFDA]'}`} />
                <View className="flex-1">
                  <Text className="mb-1 text-xs font-bold text-white">{item.title}</Text>
                  <Text className="text-[#8892B0] text-xs leading-4">{item.message}</Text>
                  <Text className="text-[#233554] text-[10px] mt-2">{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// --- Profile Menu Dropdown (Right Corner) ---
const ProfileMenu = ({ 
  visible, 
  onClose, 
  user, 
  logout 
}: { 
  visible: boolean; 
  onClose: () => void; 
  user: any; 
  logout: () => void; 
}) => {
  const router = useRouter();

  if (!visible) return null;

  const MenuItem = ({ icon: Icon, label, path, color = '#8892B0' }: any) => (
    <TouchableOpacity 
      onPress={() => { onClose(); router.push(path); }}
      className="flex-row items-center px-4 py-3 hover:bg-[#233554] active:bg-[#233554]"
    >
      <Icon size={16} color={color} style={{ marginRight: 12 }} />
      <Text className="text-sm text-white">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="absolute top-14 right-4 w-56 bg-[#112240] border border-[#233554] rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <View className="p-4 border-b border-[#233554] bg-[#0A192F]">
        <Text className="text-sm font-bold text-white truncate">{user.name}</Text>
        <Text className="text-[#8892B0] text-xs truncate">{user.email}</Text>
        <View className="flex-row mt-2">
            <RoleBadge role={user.role} />
        </View>
      </View>

      <ScrollView>
        <MenuItem icon={Settings} label="Settings" path="/(main)/settings" />
        <MenuItem icon={Briefcase} label="Workspace Hub" path="/(main)/hub" />
        
        {['cpa', 'premium', 'premium_member', 'admin', 'support'].includes(user.role) && (
          <MenuItem icon={Users} label="CPA Portal" path="/(main)/cpa" color="#A78BFA" />
        )}

        {user.role === 'admin' && (
          <MenuItem icon={ShieldAlert} label="Admin Console" path="/(main)/admin" color="#F59E0B" />
        )}
        
        <View className="h-[1px] bg-[#233554] my-1" />
        
        <TouchableOpacity 
          onPress={() => { onClose(); logout(); }}
          className="flex-row items-center px-4 py-3 hover:bg-red-500/10"
        >
          <LogOut size={16} color="#EF4444" style={{ marginRight: 12 }} />
          <Text className="text-[#EF4444] text-sm font-bold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// 3. DESKTOP LAYOUT COMPONENTS
// ============================================================================

const DesktopSidebar = ({ user, pathname }: { user: any, pathname: string }) => {
  const router = useRouter();

  const navItems = useMemo(() => {
    const role = user?.role || 'member';
    // Logic to merge standard role items with any extras
    const allowedKeys = (ROLE_NAV_ITEMS as any)[role] || ROLE_NAV_ITEMS['member'];
    
    // Add "Hub" for everyone in this Enterprise View
    const finalKeys = Array.from(new Set([...allowedKeys, 'Hub'])); 

    return finalKeys
      .map(key => NAV_CONFIG[key as NavItemKey])
      .filter(Boolean);
  }, [user?.role]);

  return (
    <View className="w-64 bg-[#0A192F] border-r border-[#233554] h-full flex-col">
      {/* Brand */}
      <View className="h-20 flex-row items-center px-6 border-b border-[#233554]">
        <View className="w-8 h-8 bg-[#64FFDA] rounded-lg items-center justify-center mr-3">
          <Text className="text-[#0A192F] font-extrabold text-lg">N</Text>
        </View>
        <View>
          <Text className="text-lg font-bold tracking-tight text-white">NorthFinance</Text>
          <Text className="text-[#8892B0] text-[10px] tracking-widest uppercase">Enterprise</Text>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView className="flex-1 px-3 py-6">
        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-4 px-3">Main Menu</Text>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(item.path as any)}
              className={`flex-row items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                isActive ? 'bg-[#112240] border-l-4 border-[#64FFDA]' : 'opacity-70 hover:opacity-100 hover:bg-[#112240]/50'
              }`}
            >
              <item.icon size={20} color={isActive ? '#64FFDA' : '#8892B0'} />
              <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#8892B0]'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Support Section */}
        <View className="px-3 mt-8 mb-2">
             <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Help & Legal</Text>
             <TouchableOpacity 
                onPress={() => router.push('/(main)/support')}
                className="flex-row items-center gap-3 px-3 py-2 opacity-70 hover:opacity-100"
             >
                <LifeBuoy size={18} color="#8892B0" />
                <Text className="text-[#8892B0] text-sm">Support Center</Text>
             </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sidebar Footer (Optional quick stats or version) */}
      <View className="p-4 border-t border-[#233554]">
        <View className="bg-[#112240] rounded-lg p-3">
            <Text className="text-[#64FFDA] text-xs font-bold mb-1">System Status</Text>
            <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Text className="text-[#8892B0] text-[10px]">All systems operational</Text>
            </View>
        </View>
      </View>
    </View>
  );
};

const DesktopTopBar = ({ user, logout }: { user: any, logout: () => void }) => {
    const pathname = usePathname();
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Get page title from config
    const currentTitle = Object.values(NAV_CONFIG).find(c => pathname.startsWith(c.path))?.label || 'Dashboard';

    return (
        <View className="h-20 bg-[#0A192F] border-b border-[#233554] flex-row items-center justify-between px-8 z-50">
            {/* Left: Breadcrumbs / Title */}
            <View>
                <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-[#8892B0] text-xs">NorthFinance</Text>
                    <Text className="text-[#233554] text-xs">/</Text>
                    <Text className="text-[#64FFDA] text-xs">{user.role}</Text>
                </View>
                <Text className="text-2xl font-bold text-white">{currentTitle}</Text>
            </View>

            {/* Right: Actions */}
            <View className="flex-row items-center gap-4">
                
                {/* Search Bar (Visual Only) */}
                <View className="hidden lg:flex flex-row items-center bg-[#112240] px-3 py-2 rounded-full border border-[#233554] w-64 mr-4">
                    <Search size={16} color="#8892B0" />
                    <Text className="text-[#8892B0] ml-2 text-sm italic">Type / to search...</Text>
                </View>

                {/* Notifications */}
                <View className="relative">
                    <TouchableOpacity 
                        onPress={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                        className={`p-2 rounded-full ${notifOpen ? 'bg-[#112240]' : 'hover:bg-[#112240]'}`}
                    >
                        <Bell size={20} color={notifOpen ? '#64FFDA' : '#8892B0'} />
                        <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0A192F]" />
                    </TouchableOpacity>
                    <NotificationDropdown visible={notifOpen} onClose={() => setNotifOpen(false)} userId={user.id} />
                </View>

                {/* Vertical Divider */}
                <View className="h-8 w-[1px] bg-[#233554]" />

                {/* Profile */}
                <View className="relative">
                    <TouchableOpacity 
                         onPress={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                         className="flex-row items-center gap-3 hover:bg-[#112240] p-2 rounded-lg transition-colors"
                    >
                        <View className="items-end hidden md:flex">
                            <Text className="text-sm font-bold text-white">{user.name}</Text>
                            <Text className="text-[#8892B0] text-[10px] uppercase">{user.role}</Text>
                        </View>
                        <Image 
                            source={{ uri: user.avatar || 'https://ui-avatars.com/api/?name=' + user.name }} 
                            className="w-10 h-10 rounded-full border border-[#64FFDA]/30" 
                        />
                        <ChevronDown size={14} color="#8892B0" />
                    </TouchableOpacity>
                    <ProfileMenu visible={profileOpen} onClose={() => setProfileOpen(false)} user={user} logout={logout} />
                </View>
            </View>
        </View>
    );
};

// ============================================================================
// 4. MOBILE HEADER COMPONENT
// ============================================================================

type MobileHeaderProps = {
  route: { name: string };
  user: any;
  logout: () => void;
};

const MobileHeader: React.FC<MobileHeaderProps> = ({ route, user, logout }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Safe lookup for title
  const title = Object.values(NAV_CONFIG).find(item => item.name === route.name)?.label || 'NorthFinance';

  return (
    <SafeAreaView edges={['top']} className="bg-[#0A192F] border-b border-[#233554] z-50">
      <View className="flex-row items-center justify-between h-16 px-4">
        {/* Left: Brand + Title */}
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 bg-[#112240] rounded-lg items-center justify-center border border-[#233554]">
            <Text className="text-[#64FFDA] font-bold">N</Text>
          </View>
          <Text className="text-lg font-bold text-white">{title}</Text>
        </View>

        {/* Right: Actions (Messages, Notifs, Profile) */}
        <View className="flex-row items-center gap-4">
            
            {/* Messages Icon */}
            <TouchableOpacity onPress={() => router.push('/(main)/messages')}>
                <MessageSquare size={20} color="#8892B0" />
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity onPress={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}>
                <Bell size={20} color={notifOpen ? '#64FFDA' : '#8892B0'} />
            </TouchableOpacity>

            {/* Profile Avatar */}
            <TouchableOpacity onPress={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}>
                <Image source={{ uri: user.avatar || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full border border-[#64FFDA]/50" />
            </TouchableOpacity>
        </View>
      </View>

      {/* NOTIFICATIONS DROPDOWN (Mobile) */}
      <NotificationDropdown visible={notifOpen} onClose={() => setNotifOpen(false)} userId={user.id} />

      {/* PROFILE DROPDOWN (Mobile, EXACT match to desktop ProfileMenu) */}
      {menuOpen && (
        <View className="absolute top-14 right-4 w-56 bg-[#112240] border border-[#233554] rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Header - EXACT match to desktop */}
          <View className="p-4 border-b border-[#233554] bg-[#0A192F]">
            <Text className="text-sm font-bold text-white truncate">{user.name}</Text>
            <Text className="text-[#8892B0] text-xs truncate">{user.email}</Text>
            <View className="flex-row mt-2">
              <RoleBadge role={user.role} />
            </View>
          </View>

          <ScrollView>
            {/* Settings */}
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push('/(main)/settings');
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Settings size={16} color="#8892B0" style={{ marginRight: 12 }} />
              <Text className="text-sm text-white">Settings</Text>
            </TouchableOpacity>

            {/* Workspace Hub */}
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                router.push('/(main)/hub');
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Briefcase size={16} color="#8892B0" style={{ marginRight: 12 }} />
              <Text className="text-sm text-white">Workspace Hub</Text>
            </TouchableOpacity>

            {/* CPA Portal (role-gated) */}
            {['cpa', 'premium', 'premium_member', 'admin', 'support'].includes(
              user.role,
            ) && (
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(main)/cpa');
                }}
                className="flex-row items-center px-4 py-3"
              >
                <Users size={16} color="#A78BFA" style={{ marginRight: 12 }} />
                <Text className="text-sm text-white">CPA Portal</Text>
              </TouchableOpacity>
            )}

            {/* Admin Console (admin-only) */}
            {user.role === 'admin' && (
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/(main)/admin');
                }}
                className="flex-row items-center px-4 py-3"
              >
                <ShieldAlert size={16} color="#F59E0B" style={{ marginRight: 12 }} />
                <Text className="text-sm text-white">Admin Console</Text>
              </TouchableOpacity>
            )}

            <View className="h-[1px] bg-[#233554] my-1" />

            {/* Sign Out */}
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                logout();
              }}
              className="flex-row items-center px-4 py-3"
            >
              <LogOut size={16} color="#EF4444" style={{ marginRight: 12 }} />
              <Text className="text-[#EF4444] text-sm font-bold">Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
    
  );
};
// ============================================================================
// 5. MAIN LAYOUT ORCHESTRATOR
// ============================================================================

export default function MainLayout() {
  const { user, isLoading, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const pathname = usePathname();

  // --- Safe Area Loading State ---
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <View className="w-16 h-16 bg-[#112240] rounded-2xl items-center justify-center animate-bounce">
            <Text className="text-[#64FFDA] text-2xl font-bold">N</Text>
        </View>
        <Text className="text-[#8892B0] mt-4 font-mono">Initializing Secure Environment...</Text>
      </View>
    );
  }

  // --- Auth Guard ---
  if (!user) return <Redirect href="/(auth)/login" />;

  // ==========================================================================
  // VIEW A: MOBILE LAYOUT (TABS)
  // ==========================================================================
  if (isMobile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
        <Tabs
          screenOptions={{
            headerShown: true,
            header: (props: { route: any }) => <MobileHeader route={props.route} user={user} logout={logout} />,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: '#020C1B',
              borderTopWidth: 1,
              borderTopColor: '#233554',
              height: Platform.OS === 'ios' ? 88 : 65,
              paddingBottom: Platform.OS === 'ios' ? 28 : 10,
              paddingTop: 10,
            },
            tabBarActiveTintColor: '#64FFDA',
            tabBarInactiveTintColor: '#8892B0',
          }}
        >
            {/* 1. Dashboard */}
            <Tabs.Screen
                name="index"
                options={{
                    href: NAV_CONFIG.Dashboard.path,
                    tabBarIcon: ({color}: {color: string}) => <LayoutDashboard color={color} size={24} />
                }}
            />

            {/* 2. Finances */}
            <Tabs.Screen
                name="finances"
                options={{
                    href: NAV_CONFIG.Transactions.path,
                    tabBarIcon: ({color}: {color: string}) => <CreditCard color={color} size={24} />
                }}
            />

            {/* 3. Workspace Hub */}
            <Tabs.Screen
                name="hub"
                options={{
                    href: NAV_CONFIG.Hub.path,
                    tabBarIcon: ({color}: {color: string}) => <Briefcase color={color} size={24} />
                }}
            />

            {/* 4. AI Chat */}
            <Tabs.Screen
                name="aiChat"
                options={{
                    href: NAV_CONFIG['AI Chat'].path,
                    tabBarIcon: ({color}: {color: string}) => (
                      <View className="bg-[#112240] p-2 rounded-full border border-[#64FFDA]/30">
                        <Bot color={'#64FFDA'} size={24} />
                      </View>
                    ),
                }}
            />

            {/* 5. Support */}
            <Tabs.Screen
                name="support"
                options={{
                    href: NAV_CONFIG.Support.path,
                    tabBarIcon: ({color}: {color: string}) => <LifeBuoy color={color} size={24} />
                }}
            />

            {/* 6. Settings */}
            <Tabs.Screen
                name="settings"
                options={{
                    href: NAV_CONFIG.Settings.path,
                    tabBarIcon: ({color}: {color: string}) => <Settings color={color} size={24} />
                }}
            />

            {/* Hidden Routes - href: null hides them from tab bar */}
            <Tabs.Screen name="admin" options={{ href: null }} />
            <Tabs.Screen name="cpa" options={{ href: null }} />
            <Tabs.Screen name="messages/index" options={{ href: null }} />
            <Tabs.Screen name="messages/[id]" options={{ href: null }} />
            <Tabs.Screen name="documents" options={{ href: null }} />
            <Tabs.Screen name="scan" options={{ href: null }} />
            <Tabs.Screen name="find-cpa" options={{ href: null }} />
            <Tabs.Screen name="approvals" options={{ href: null }} />
            <Tabs.Screen name="quick-add" options={{ href: null }} />
            {/* Extra hidden routes to avoid tab bar slots */}
            <Tabs.Screen name="invoices" options={{ href: null }} />
            <Tabs.Screen name="organization" options={{ href: null }} />
        </Tabs>
      </View>
    );
    
  }
  // ==========================================================================
  // VIEW B: DESKTOP LAYOUT (SIDEBAR + TOP HEADER)
  // ==========================================================================
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F', flexDirection: 'row' }}>
        {/* 1. Left Sidebar Navigation */}
        <DesktopSidebar user={user} pathname={pathname} />

        {/* 2. Main Content Area */}
        <View style={{ flex: 1, flexDirection: 'column' }}>
            {/* Top Header (Profile Right Corner) */}
            <DesktopTopBar user={user} logout={logout} />
            
            {/* Content Slot */}
            <View style={{ flex: 1, position: 'relative' }}>
                <Slot />
            </View>
        </View>
    </SafeAreaView>
  );
}

