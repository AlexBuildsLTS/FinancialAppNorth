import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <Stack 
        screenOptions={{
          headerShown: false,
          // Force background color to prevent white flashes during transitions
          contentStyle: { backgroundColor: '#0A192F' }, 
          animation: 'slide_from_right',
          // Ensure animations utilize the native driver where possible
          animationDuration: 300, 
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="ai-keys" />
      </Stack>
    </View>
  );
}