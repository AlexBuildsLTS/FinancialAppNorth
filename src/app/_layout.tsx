import "../../global.css";
import { LogBox, Platform } from 'react-native';
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { AuthProvider, useAuth } from "../shared/context/AuthContext";
import { View, ActivityIndicator } from "react-native";

SplashScreen.preventAutoHideAsync();

// AGGRESSIVE LOG SUPPRESSION
LogBox.ignoreLogs([
  'onStartShouldSetResponder',
  'onResponderGrant',
  'onResponderRelease',
  'onResponderTerminate',
  'onResponderMove',
  'onResponderTerminationRequest',
  'onPressOut'
]);

if (Platform.OS === 'web') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && 
       (/onStartShouldSetResponder|onResponder|onPressOut/.test(args[0]))) {
      return;
    }
    originalError(...args);
  };
}

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, isLoading, segments, isMounted]);

  if (isLoading || !isMounted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A192F" }}>
        <ActivityIndicator size="large" color="#64FFDA" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A192F' } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}