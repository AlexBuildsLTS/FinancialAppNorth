import { Tabs } from 'expo-router';
import { Users, FileText, ClipboardList } from 'lucide-react-native';

export default function CpaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopWidth: 1,
          borderTopColor: '#233554',
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#64FFDA',
        tabBarInactiveTintColor: '#8892B0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }: { color: string }) => <Users size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }: { color: string }) => <ClipboardList size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="audits"
        options={{
          title: 'Audits',
          tabBarIcon: ({ color }: { color: string }) => <FileText size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}