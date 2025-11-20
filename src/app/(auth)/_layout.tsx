import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { View, StyleSheet, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
// We import the component we just fixed
import { AuthScreenFooter } from './components/AuthScreenFooter'
import { Image } from 'expo-image';
import { AppTheme } from '@/shared/theme/theme';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated'; 
  

function AuthLayout() { 
  const { session, isLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const styles = createStyles(theme); 

  const isTabletOrWeb = width >= 768;

  // Using 'any' for the event to prevent type errors
  const handleScroll = useAnimatedScrollHandler((event: any) => {
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
      
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContent}>
          
          <View style={isTabletOrWeb ? styles.formContainerWeb : styles.formContainerNative}>
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
                animation: 'fade',
             }}>
                <Stack.Screen name="login" options={{ title: 'Sign In' }} />
                <Stack.Screen name="register" options={{ title: 'Create Account' }} />
            </Stack>
          </View>
          
          {/* THIS IS THE FOOTER YOU WANTED. It is now connected. */}
        {/* Footer Area */}
          <AuthScreenFooter scrollY={scrollY} />
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
  headerLogo: {
    width: 150,
    height: 30,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingTop: Platform.OS === 'web' ? theme.spacing.xl : theme.spacing.lg,
  },
  mainContent: {
    width: '100%',
    maxWidth: 1200, 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'web' ? theme.spacing.xl : 0,
  },
  formContainerNative: {
    width: '100%',
    maxWidth: 450, 
    minHeight: 600, 
    justifyContent: 'flex-start',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl * 2, 
  },
  formContainerWeb: {
     width: '100%', 
     maxWidth: 450,
     minHeight: 650, 
     padding: theme.spacing.lg, 
     justifyContent: 'flex-start',
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