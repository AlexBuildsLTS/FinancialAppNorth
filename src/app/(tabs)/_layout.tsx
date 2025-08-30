// src/app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { UserRole } from '@/types';


// Import all the necessary icons for your tabs
import { 
    LayoutDashboard, 
    Briefcase, 
    Wallet, 
    Camera, 
    FileText, 
    MessageCircle 
} from 'lucide-react-native';

export default function TabLayout() {
    const { colors } = useTheme();
    const { profile, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null; // Wait for the auth state to be determined
    }

    if (!isAuthenticated || !profile) {
        return <Redirect href="/(auth)/login" />;
    }

    const userRole = profile.role;

    // --- Role-Based Tab Visibility Checks using your exact UserRole enum ---
    const canSeeClientsTab = userRole === UserRole.CPA || userRole === UserRole.ADMIN;
    const isInternalUser = userRole === UserRole.SUPPORT || userRole === UserRole.ADMIN;

    return (
        <Tabs
            screenOptions={{
                headerShown: false, // CRITICAL FIX: Hides the default header to prevent the "double header" issue.
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: { 
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Dashboard', 
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                    href: userRole === UserRole.CPA ? null : '/(tabs)',
                }} 
            />
            
            <Tabs.Screen 
                name="clients" 
                options={{ 
                    title: 'Clients', 
                    tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
                    href: canSeeClientsTab ? '/(tabs)/clients' : null,
                }} 
            />

            <Tabs.Screen 
                name="transactions" 
                options={{ 
                    title: 'Transactions', 
                    tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
                    href: userRole === UserRole.SUPPORT ? null : '/(tabs)/transactions',
                }} 
            />

            <Tabs.Screen 
                name="camera" 
                options={{ 
                    title: 'Scan', 
                    tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
                    href: isInternalUser ? null : '/(tabs)/camera',
                }} 
            />

            <Tabs.Screen 
                name="documents" 
                options={{ 
                    title: 'Documents', 
                    tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
                    href: userRole === UserRole.SUPPORT ? null : '/(tabs)/documents',
                }} 
            />

            <Tabs.Screen 
                name="support" 
                options={{ 
                    title: 'Support', 
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
                }} 
            />

            {/* --- HIDDEN NAVIGABLE ROUTES --- */}
            <Tabs.Screen name="profile" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
            <Tabs.Screen name="reports" options={{ href: null }} />
            <Tabs.Screen name="budgets" options={{ href: null }} />
            <Tabs.Screen name="analytics" options={{ href: null }} />
            <Tabs.Screen name="journal" options={{ href: null }} />
            <Tabs.Screen name="ai-assistant" options={{ href: null }} />
            <Tabs.Screen name="accounts" options={{ href: null }} />
            <Tabs.Screen name="client/[id]" options={{ href: null }} />
        </Tabs>
    );
}