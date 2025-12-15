import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function OrganizationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A192F', // Deep Navy
        },
        headerTintColor: '#64FFDA', // Teal Accent
        headerTitleStyle: {
          color: '#E2E8F0', // Slate 200
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false, // Flat design
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: '#112240', // Subtle separator for Desktop
        },
        animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Organization HQ',
          headerLargeTitle: true, // Native iOS large title feel
          headerLargeTitleStyle: { color: 'white' }
        }} 
      />
      <Stack.Screen 
        name="members" 
        options={{ 
          title: 'Team Management',
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Org Settings',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="audit-log" 
        options={{ 
          title: 'Audit Trail',
        }} 
      />
    </Stack>
  );
}