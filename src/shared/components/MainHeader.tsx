import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Bell, Mail } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MainHeader = () => {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'cpa': return 'text-purple-400';
      case 'premium': return 'text-[#64FFDA]';
      case 'support': return 'text-blue-400';
      default: return 'text-[#8892B0]';
    }
  };

  return (
    <View 
      className="bg-[#0A192F] border-b border-[#233554] px-6 pb-4 flex-row items-center justify-between"
      style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 10 }}
    >
      {/* LEFT: Profile */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.push('/(main)/settings')}>
          <View className="w-10 h-10 rounded-full bg-[#112240] overflow-hidden border border-[#233554] items-center justify-center">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-full h-full" />
            ) : (
              <Text className="text-[#64FFDA] font-bold text-lg">{user.name?.[0] || 'U'}</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <View>
          <Text className="text-white font-bold text-base leading-tight">
            {user.name || 'User'}
          </Text>
          <Text className={`text-[10px] uppercase font-bold tracking-wider ${getRoleColor(user.role)}`}>
            {user.role}
          </Text>
        </View>
      </View>

      {/* RIGHT: Actions */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
          className="w-10 h-10 bg-[#112240] rounded-full items-center justify-center border border-[#233554]"
          onPress={() => router.push('/(main)/messages')} 
        >
          {/* Mail Icon -> Private Messages List */}
          <Mail size={20} color="#E6F1FF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="w-10 h-10 bg-[#112240] rounded-full items-center justify-center border border-[#233554]"
          onPress={() => console.log('Notifications')}
        >
          <Bell size={20} color="#E6F1FF" />
          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF4444] rounded-full border border-[#112240]" />
        </TouchableOpacity>
      </View>
    </View>
  );
};