import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native'; // Added View, Text, StyleSheet, Image, TouchableOpacity
import { useRouter } from 'expo-router'; // Import useRouter
import {
  LayoutDashboard,
  Briefcase, // Keep Briefcase for now, will change to Users
  ArrowRightLeft,
  Settings, // Keep Settings for now, will change to MessageSquare
  Landmark,
  PiggyBank,
  AreaChart,
  Camera,
  FilePieChart,
  BookOpen,
  Bot,
  User,
  Bell,
  MessageSquare, // Added MessageSquare icon
  Users, // Added Users icon
  Contact
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
const CustomHeader = ({ title, user, colors, router }: any) => (
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
      <TouchableOpacity onPress={() => { /* Handle notifications */ }} style={[headerStyles.iconButton, { backgroundColor: colors.surface }]}>
        <Bell color={colors.text} size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { /* Handle messages */ }} style={[headerStyles.iconButton, { backgroundColor: colors.surface }]}>
        <MessageSquare color={colors.text} size={24} /> {/* Changed to Message icon */}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={[headerStyles.iconButton, { backgroundColor: colors.surface }]}>
        <User color={colors.text} size={24} />
      </TouchableOpacity>
    </View>
  </View>
);

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter(); // Initialize useRouter
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
        tabBarShowLabel: false,
        headerShown: true, // Show header for all tabs
        header: ({ options }) => ( // Custom header component
          <CustomHeader
            title={options.title}
            user={user}
            colors={colors}
            router={router}
          />
        ),
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
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Landmark} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={FilePieChart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={PiggyBank} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={BookOpen} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={AreaChart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Camera} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => <TabBarIcon Icon={Bot} color={color} size={size} />,
        }}
      />
      {/* These screens are part of the stack but not shown in the tab bar */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide this tab from the tab bar
          headerShown: false, // Hide header for nested stack
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide this tab from the tab bar
          headerShown: false, // Hide header for nested stack
        }}
      />
      <Tabs.Screen
        name="client"
        options={{
          href: null, // Hide this tab from the tab bar
          headerShown: false, // Hide header for nested stack
        }}
      />
      <Tabs.Screen
        name="security" // Explicitly hide the security group from tabs
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 10, // Adjust for iOS notch
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
});
