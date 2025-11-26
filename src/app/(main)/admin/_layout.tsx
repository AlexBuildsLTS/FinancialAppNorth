import { Tabs } from 'expo-router';
import { Users, BarChart3, Settings, ShieldAlert } from 'lucide-react-native';
import { View, Platform } from 'react-native';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#112240',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#8892B0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }: { color: string }) => <ShieldAlert size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }: { color: string }) => <Users size={24} color={color} />,
        }}
      />
      {/* If you have reports/settings pages in admin, add them here. 
          For now I'm hiding them if the files don't exist yet to prevent errors. 
          Uncomment when created. */}
      {/* <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
        }}
      />
      */}
    </Tabs>
  );
}