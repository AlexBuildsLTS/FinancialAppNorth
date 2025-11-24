import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SettingsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A192F' },
          animation: 'slide_from_right',
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