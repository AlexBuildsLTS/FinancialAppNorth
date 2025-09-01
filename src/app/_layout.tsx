// src/app/_layout.tsx

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View, ActivityIndicator } from 'react-native';
import { UserRole } from '@/types';
import { publishPublicJwkIfNeeded } from '@/lib/e2eeKeys';
import { initDevErrorHandlers } from '@/lib/devErrors';

SplashScreen.preventAutoHideAsync();
initDevErrorHandlers();

// This is the new brain of your app's navigation.
// It decides where a user should go based on their role.
function RootNavigationController() {
    const { profile, isLoading, isAuthenticated } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        if (isLoading || !fontsLoaded) return;

        SplashScreen.hideAsync();

        const inAuthGroup = segments[0] === '(auth)';
        const inApp = segments.length > 0 && !inAuthGroup;

        if (isAuthenticated && profile) {
            const userRole = profile.role;
            const inTabsGroup = segments[0] === '(tabs)';
            const inAdminGroup = segments[0] === 'admin';

            // --- ADDED: publish public JWK to profile on first login/onboarding ---
            // best-effort; does not block navigation
            (async () => {
              try {
                await publishPublicJwkIfNeeded(profile.id);
              } catch (e) {
                console.warn('publishPublicJwkIfNeeded error', e);
              }
            })();

            if (userRole === UserRole.ADMIN && !inAdminGroup) {
                router.replace('/(tabs)/admin'); // admin default can point to admin user management
            } else if (userRole !== UserRole.ADMIN && !inTabsGroup) {
                router.replace('/(tabs)');
            }
        } else if (!isAuthenticated && inApp) {
            router.replace('/login');
        }

    }, [isLoading, fontsLoaded, isAuthenticated, profile, segments]);

    if (isLoading || !fontsLoaded) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
    }

    return <Slot />;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ToastProvider>
                    <RootNavigationController />
                </ToastProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}