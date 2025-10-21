// Configures the primary tab navigation for authenticated users, dynamically rendering tabs based on user role.
// src/app/(main)/_layout.tsx
import React from 'react';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { useTheme } from '@/shared/context/ThemeProvider';
import { ROLE_BASED_TABS, TabItem } from '@/shared/constants/navigation';
import { TabIcon } from '@/shared/components/TabIcon';
import { MainHeader } from '@/shared/components/MainHeader';
import { View, ActivityIndicator, StyleSheet, Platform, Pressable } from 'react-native';
import { ScanEye } from 'lucide-react-native';

// This is the custom circular "Scan" button from your visual guide.
const CustomScanButton = ({ onPress }: { onPress: (e: any) => void }) => {
    const { theme } = useTheme(); // Correctly uses the theme context
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.customButtonContainer,
                // CORRECTED: Uses 'primary' and 'primaryContrast' from YOUR theme file.
                { backgroundColor: theme.colors.accent, opacity: pressed ? 0.8 : 1 }
            ]}
        >
            <ScanEye color={theme.colors.surfaceContrast} size={32} />
        </Pressable>
    );
};

export default function MainAppLayout() {
    const { profile, session } = useAuth();
    const { theme } = useTheme(); // Correctly destructures the full theme object
    const router = useRouter();

    // PROTECT THIS ROUTE: If the user is somehow not signed in, kick them out.
    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }
    
    // While we wait for the user's profile (which contains their role), show a loader.
    if (!profile) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.textPrimary} />
            </View>
        );
    }

    const allPossibleTabs = ['index', 'transactions', 'documents', 'support', 'settings', 'budgets', 'reports', 'clients', 'admin', 'camera', 'scan', 'profile'];
    const visibleTabs: Omit<TabItem, 'custom'>[] = ROLE_BASED_TABS[profile.role] || []; // Dynamically filters tabs based on the user's assigned role.
    const visibleTabNames = visibleTabs.map(tab => tab.name);
    
    const tabsToRender: TabItem[] = [...visibleTabs];

    const renderedTabNames = tabsToRender.map(t => t.name);
    const hiddenTabs = allPossibleTabs.filter(name => !renderedTabNames.includes(name));

    return (
        <Tabs
            screenOptions={{
                header: () => <MainHeader />,
                tabBarShowLabel: false, // Hides text labels, as per your visual guides.

                // --- THIS IS THE FINAL, ERROR-FREE STYLING FOR THE FLOATING TAB BAR ---
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 30 : 20,
                    left: 20,
                    right: 20,
                    height: 70,
                    backgroundColor: theme.colors.surface, // CORRECTED: Uses the semantic token from your theme file.
                    borderRadius: 25,
                    borderTopWidth: 0,
                    ...styles.shadow
                },
                tabBarActiveTintColor: theme.colors.accent,   // CORRECTED: Uses the specific key from your theme file.
                tabBarInactiveTintColor: theme.colors.textSecondary, // CORRECTED: Uses the specific key from your theme file.
            }}
        >
            {tabsToRender.map((tab) => {
                // If this is our custom placeholder tab, render the circular button.
                if (tab.custom) {
                    return (
                        <Tabs.Screen
                            key="scan-action"
                            name="scan" // This file MUST exist at /src/app/(main)/scan.tsx
                            options={{
                                tabBarButton: (props) => (
                                    <CustomScanButton {...props} onPress={() => router.push('/(main)/scan')} />
                                ),
                            }}
                        />
                    );
                }

                // Otherwise, render a standard tab item.
                return (
                    <Tabs.Screen
                        key={tab.name}
                        name={tab.name}
                        options={{
                            title: tab.title,
                            tabBarIcon: ({ color, focused }) => (
                                <TabIcon icon={tab.icon} color={color} focused={focused} />
                            ),
                        }}
                    />
                );
            })}
            {/* Hide tabs that are not for the current role */}
            {hiddenTabs.map(name => (
                <Tabs.Screen key={name} name={name} options={{ href: null }} />
            ))}
            <Tabs.Screen name="client/[id]" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    shadow: {
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        elevation: 10,
    },
    customButtonContainer: {
        top: Platform.OS === 'ios' ? -25 : -35,
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
        elevation: 12,
    },
});