// src/app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/common/Avatar';
import { LayoutDashboard, FileText, Settings, Wallet } from 'lucide-react-native';

const ProfileHeaderIcon = () => {
    const router = useRouter();
    const { profile } = useAuth();
    return (
        <Pressable onPress={() => router.push('/(tabs)/profile')} style={{ marginRight: 24 }}>
            <Avatar profile={profile} size={32} />
        </Pressable>
    );
};

export default function TabLayout() {
    const { colors, isDark } = useTheme();
    const activeTabColor = isDark ? '#1DB954' : '#BB4711';

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: colors.surface, borderBottomWidth: 0, elevation: 0 },
                headerTintColor: colors.text,
                headerRight: () => <ProfileHeaderIcon />,
                tabBarActiveTintColor: activeTabColor,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            }}
        >
            {/* These are the 4 screens that will appear in your bottom tab bar */}
            <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }} />
            <Tabs.Screen name="transactions" options={{ title: 'Transactions', tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} /> }} />
            <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />

            {/*
              EVERY OTHER file inside the (tabs) folder MUST be defined here as a screen,
              but hidden from the tab bar using `href: null`. This is the fix.
            */}
            <Tabs.Screen name="accounts" options={{ href: null }} />
            <Tabs.Screen name="ai-assistant" options={{ href: null }} />
            <Tabs.Screen name="analytics" options={{ href: null }} />
            <Tabs.Screen name="budgets" options={{ href: null }} />
            <Tabs.Screen name="camera" options={{ href: null }} />
            <Tabs.Screen name="clients" options={{ href: null }} />
            <Tabs.Screen name="documents" options={{ href: null }} />
            <Tabs.Screen name="journal" options={{ href: null }} />
            <Tabs.Screen name="support" options={{ href: null }} />
            
            {/* This defines the screens inside the nested directories */}
            <Tabs.Screen name="client/[id]" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
            
        </Tabs>
    );
}