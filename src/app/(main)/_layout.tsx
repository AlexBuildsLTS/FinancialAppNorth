// src/app/(main)/_layout.tsx
import React from 'react';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { useTheme } from '@/shared/context/ThemeProvider';
import { ROLE_BASED_TABS, TabItem } from '@/shared/constants/navigation';
import TabIcon from '@/shared/components/TabIcon';
import { MainHeader } from '@/shared/components/MainHeader';
import { View, ActivityIndicator, StyleSheet, Platform, Pressable } from 'react-native';
import { ScanEye } from 'lucide-react-native';
import { UserRole } from '@/shared/types/index';

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    customButtonContainer: {
        top: Platform.OS === 'ios' ? -25 : -35,
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 12,
    },
});

export default function MainAppLayout() {
    const { profile, session } = useAuth();
    const { colors } = useTheme();

    // PROTECT THIS ROUTE: If the user is somehow not signed in, kick them out.
    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }
    // While we wait for the user's profile (which contains their role), show a loader.
    if (!profile) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Get the tabs SPECIFICALLY for the logged-in user's role from our config file.
    const tabsToRender: TabItem[] = ROLE_BASED_TABS[profile.role] || [];

    return (
        <Tabs
            screenOptions={{
                header: () => <MainHeader />,
                tabBarShowLabel: false, // Hides text labels, as per your visual guides.

                // --- THIS IS THE FINAL, CORRECTED STYLING FOR THE FLOATING TAB BAR ---
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 30 : 20,
                    left: 20,
                    right: 20,
                    height: 70, // CORRECTED: Uses the semantic token
                    backgroundColor: colors.surface,
                    borderRadius: 25,
                    borderTopWidth: 0,
                    ...styles.shadow
                },
                tabBarActiveTintColor: colors.primary, // CORRECTED
                tabBarInactiveTintColor: colors.textSecondary, // CORRECTED
            }}
        >
            {tabsToRender.map((tab) => (
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
            ))}
        </Tabs>
    );
}
