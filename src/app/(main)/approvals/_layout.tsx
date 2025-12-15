import { Stack } from 'expo-router';

export default function ApprovalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0A192F' },
        headerTintColor: '#64FFDA',
        headerTitleStyle: { color: 'white', fontWeight: 'bold' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0A192F', borderTopWidth: 1, borderTopColor: '#112240' },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Approvals Inbox' 
        }} 
      />
      <Stack.Screen 
        name="request" 
        options={{ 
          title: 'New Expense Request',
          presentation: 'formSheet', // iOS style bottom sheet
          headerStyle: { backgroundColor: '#112240' }, // Slightly lighter for modal contrast
        }} 
      />
      <Stack.Screen 
        name="pay" 
        options={{ 
          title: 'Process Payment',
        }} 
      />
    </Stack>
  );
}