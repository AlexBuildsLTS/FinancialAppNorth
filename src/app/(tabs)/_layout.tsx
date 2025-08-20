import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications'; // Import the hook
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  LayoutDashboard,
  Briefcase,
  ArrowRightLeft,
  Settings,
  Landmark,
  PiggyBank,
  AreaChart,
  Camera,
  FilePieChart,
  BookOpen,
  User,
  Bell,
  MessageSquare,
  Users,
} from 'lucide-react-native';

interface TabBarIconProps {
  Icon: React.ComponentType<{ color: string; size: number }>;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = React.memo(({ Icon, color, size }) => (
  <Icon color={color} size={size} />
));

// Custom Header Component
const CustomHeader = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(); // Use the hook to get the count
  const router = useRouter();
  
  return (
    <View style={[headerStyles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={headerStyles.userInfo}>
        <Image source={{ uri: user?.avatarUrl || '' }} style={headerStyles.avatar} />
        <View>
          <Text style={[headerStyles.greeting, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[headerStyles.username, { color: colors.text }]}>{user?.displayName || 'User'}</Text>
        </View>
      </View>
      <View style={headerStyles.rightIcons}>
        <TouchableOpacity onPress={() => { /* Handle notifications */ }} style={headerStyles.iconButton}>
          <Bell color={colors.text} size={24} />
          {unreadCount > 0 && (
            <View style={[headerStyles.badgeContainer, { backgroundColor: colors.error }]}>
              <Text style={headerStyles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/ai-assistant' })} style={headerStyles.iconButton}>
          <MessageSquare color={colors.text} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={headerStyles.iconButton}>
          <User color={colors.text} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isProfessional = user?.role === 'Professional Accountant' || user?.role === 'Administrator';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 10,
          display: 'flex',
        },
        header: () => <CustomHeader />, // Use the updated CustomHeader
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={LayoutDashboard} color={color} size={size} />,
        }}
      />
      {isProfessional && (
        <Tabs.Screen
          name="clients"
          options={{
            title: 'Clients',
            tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Briefcase} color={color} size={size} />,
          }}
        />
      )}
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={ArrowRightLeft} color={color} size={size} />,
        }}
      />
      {/* Add other tabs here */}
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={MessageSquare} color={color} size={size} />,
        }}
      />
      
      {/* Screens not in tab bar */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="client" options={{ href: null }}/>
    </Tabs>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  greeting: { fontSize: 14 },
  username: { fontSize: 18, fontWeight: 'bold' },
  rightIcons: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8, borderRadius: 20, position: 'relative' },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});