import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { View, Text, ActivityIndicator } from 'react-native';

// This component will protect the admin routes
const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // If the user data has loaded and the user is not an admin, redirect them.
    if (!isLoading && user?.role !== 'Administrator') {
      // You can redirect them to the main dashboard or a 'not found' page.
      router.replace('/(tabs)');
    }
  }, [user, isLoading, router]);

  // While checking the user's role, show a loading indicator.
  if (isLoading || user?.role !== 'Administrator') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text }}>Verifying access...</Text>
      </View>
    );
  }

  // If the user is an administrator, render the admin screens.
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: 'Inter-Bold' },
        }}
      />
      <Stack.Screen
        name="manage-users"
        options={{
          title: 'Manage Users',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: 'Inter-Bold' },
        }}
      />
    </Stack>
  );
};

export default AdminLayout;