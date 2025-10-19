// src/app/_layout.tsx
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/shared/context/AuthContext';
import { ThemeProvider } from '@/shared/context/ThemeProvider';
import { ToastProvider } from '@/shared/context/ToastProvider';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


// Prevents the splash screen from hiding until we are ready.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// This component is the new, simple brain of your app.
function RootNavigationController() {
    const { session, isLoading } = useAuth();

    // Load the single, efficient variable font file. All other font files are unnecessary.
    const [fontsLoaded, fontError] = useFonts({
        'Inter': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    });

    useEffect(() => {
        if (fontError) throw fontError;
        // Hide the splash screen ONLY when fonts are loaded AND auth state is known.
        if (fontsLoaded && !isLoading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isLoading, fontError]);

    // While loading, the splash screen remains visible. Return nothing.
    if (!fontsLoaded || isLoading) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {session && session.user ? (
                // USER IS LOGGED IN: Show the main application.
                <Stack.Screen name="(main)" />
            ) : (
                // USER IS LOGGED OUT: Show the authentication screens.
                <Stack.Screen name="(auth)" />
            )}
            <Stack.Screen name="+not-found" />
        </Stack>
    );
}

// This is the root of your entire application. It wraps everything in the necessary providers.
export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeProvider>
                    <ToastProvider>
                        <RootNavigationController />
                    </ToastProvider>
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}