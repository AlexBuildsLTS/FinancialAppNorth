import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, MessageSquare, User as UserIcon, Menu } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur'; // Optional: for glass effect if installed, else View

export const MainHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Dynamic Avatar Logic
  const AvatarComponent = user?.avatar ? (
    <Image
      source={{ uri: user.avatar }}
      style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#64FFDA' }}
    />
  ) : (
    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#112240', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#233554' }}>
      <UserIcon size={18} color="#64FFDA" />
    </View>
  );

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: '#0A192F', borderBottomWidth: 1, borderBottomColor: '#233554' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 }}>

        {/* LEFT: Profile / Menu Trigger */}
        <TouchableOpacity
          onPress={() => router.push('/(main)/settings/profile')}
          activeOpacity={0.7}
        >
          {AvatarComponent}
        </TouchableOpacity>

        {/* CENTER: Screen Title */}
        <Text style={{ color: 'white', fontSize: 17, fontWeight: '600', letterSpacing: 0.5 }}>
          {title}
        </Text>

        {/* RIGHT: Action Icons (Chat & Notifications) */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {/* Encrypted Messages */}
          <TouchableOpacity onPress={() => router.push('/(main)/messages')} activeOpacity={0.7}>
            <View>
              <MessageSquare size={24} color="#8892B0" />
              {/* Mock Unread Badge - Connect to Realtime Context later */}
              <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, backgroundColor: '#64FFDA', borderRadius: 5, borderWidth: 1, borderColor: '#0A192F' }} />
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity onPress={() => router.push('/(main)/settings')} activeOpacity={0.7}>
            <Bell size={24} color="#8892B0" />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};