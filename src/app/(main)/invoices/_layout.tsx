import { Stack } from 'expo-router';

export default function InvoicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0A192F' },
        headerTintColor: '#64FFDA',
        headerTitleStyle: { color: 'white', fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0A192F', borderTopWidth: 1, borderTopColor: '#112240' },
      }}
    >
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'New Invoice',
          presentation: 'modal' // Opens as a focused task
        }} 
      />
    </Stack>
  );
}