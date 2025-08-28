// src/app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

function RootNavigationController() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    const [fontsLoaded, fontError] = useFonts({
        'Inter-Regular': require('../assets/Inter/Inter-VariableFont_opsz,wght.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) SplashScreen.hideAsync();
    }, [fontsLoaded, fontError]);

    useEffect(() => {
        if (isLoading || !fontsLoaded) return;
        const inApp = segments[0] === '(tabs)';
        if (isAuthenticated && !inApp) {
            router.replace('/(tabs)');
        } else if (!isAuthenticated && inApp) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, fontsLoaded, segments, router]);

    if (!fontsLoaded || isLoading) return null;

    return (
        <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    );
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