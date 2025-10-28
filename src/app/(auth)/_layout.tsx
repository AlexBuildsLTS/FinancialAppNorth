// src/app/(auth)/_layout.tsx
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { View, StyleSheet, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { AuthScreenFooter, ScrollSharedValue } from '@/features/auth/components/info/AuthScreenFooter'; 
import Animated, { useSharedValue, useAnimatedScrollHandler, ScrollEvent, ScrollY } from 'react-native-reanimated'; 
import { Image } from 'expo-image';
// import AnimatedThemeIcon from '@/shared/components/AnimatedThemeIcon'; // REMOVED
import { AppTheme } from '@/shared/theme/theme';

function AuthLayout() { 
  const { session, isLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const styles = createStyles(theme); 

  const isTabletOrWeb = width >= 768;

  const handleScroll = useAnimatedScrollHandler((event: any

  ) => {
    scrollY.value = event.contentOffset.y;
  });

  if (isLoading) {
     return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(main)" />;
  }

  const logoSource = isDark
    ? require('../../assets/images/NFIconDark.png')
    : require('../../assets/images/NFIconLight.png');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* REMOVED the absoluteHeader View that contained the floating logo and theme icon */}
      
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContent}>
          
          <View style={isTabletOrWeb ? styles.formContainerWeb : styles.formContainerNative}>
            {/* ADDED: A logo component *above* the Stack navigator, so it's part of the scrollable form area */}
            <View style={styles.logoContainer}>
              <Image 
                  source={logoSource} 
                  style={styles.headerLogo as any} 
                  contentFit="contain" 
              />
            </View>

            <Stack screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade', // Using 'fade' for now, will be replaced by flip
             }}>
                <Stack.Screen name="login" options={{ title: 'Sign In' }} />
                <Stack.Screen name="register" options={{ title: 'Create Account' }} />
            </Stack>
          </View>
          
          <View style={isTabletOrWeb ? styles.infoContainerWeb : styles.infoContainerNative}>
            <AuthScreenFooter scrollY={scrollY} /> 
          </View>
        </View>
      </Animated.ScrollView>
      
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ 
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    minHeight: Platform.select({ web: '100%', default: '100%' }) as any,
  },
  // REMOVED absoluteHeader style

  headerLogo: {
    width: 150,
    height: 30,
  },
  logoContainer: { // ADDED: Style for the logo container above the form
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingTop: Platform.OS === 'web' ? theme.spacing.xl : theme.spacing.lg,
  },
  mainContent: {
    width: '100%',
    maxWidth: 1200, 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'web' ? theme.spacing.xl : 0, // Removed large top padding
  },
  formContainerNative: {
    width: '100%',
    maxWidth: 450, 
    minHeight: 600, 
    justifyContent: 'flex-start', // Align form to top
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl * 2, 
  },
  formContainerWeb: {
     width: '100%', 
     maxWidth: 450,
     minHeight: 650, 
     padding: theme.spacing.lg, 
     justifyContent: 'flex-start', // Align form to top
     marginBottom: theme.spacing.xl * 3, 
  },
  infoContainerNative: {
    width: '100%',
  },
  infoContainerWeb: {
    width: '100%',
  },
});

export default AuthLayout;