import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../shared/context/AuthContext';
import { settingsService } from '../../../shared/services/settingsService';
import { ChevronRight, User, Shield, Bell, Globe, DollarSign, Key, LogOut, X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingItem = ({ icon: Icon, label, value, onPress, type = 'link', onToggle }: any) => (
  <TouchableOpacity 
    onPress={type === 'link' ? onPress : undefined}
    activeOpacity={type === 'link' ? 0.7 : 1}
    className="flex-row items-center justify-between p-4 border-b border-[#233554] bg-[#112240]"
  >
    <View className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-lg bg-[#0A192F] items-center justify-center">
        <Icon size={18} color="#64FFDA" />
      </View>
      <Text className="text-white font-medium text-base">{label}</Text>
    </View>
    
    <View className="flex-row items-center gap-2">
      {value && <Text className="text-[#8892B0] text-sm">{value}</Text>}
      {type === 'link' && <ChevronRight size={20} color="#8892B0" />}
      {type === 'toggle' && (
        <Switch
          trackColor={{ false: '#233554', true: '#64FFDA' }}
          thumbColor={value ? '#0A192F' : '#8892B0'}
          onValueChange={onToggle}
          value={value}
        />
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsMenu() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update in DB
      await settingsService.updatePreferences(user.id, { currency: currency as any });
      
      // 2. Refresh local state immediately (this updates the 'user' object in context)
      await refreshUser();
      
      Alert.alert('Success', `Currency updated to ${currency}`);
      setShowCurrencyModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="px-6 py-4 border-b border-[#233554]">
        <Text className="text-2xl font-bold text-white">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text className="px-6 mt-6 mb-2 text-[#64FFDA] text-xs font-bold uppercase tracking-wider">Account</Text>
        <View className="mx-4 rounded-xl overflow-hidden">
          <SettingItem icon={User} label="Profile" value={user?.name} onPress={() => router.push('/(main)/settings/profile')} />
          <SettingItem icon={Shield} label="Security" value="Password & 2FA" onPress={() => router.push('/(main)/settings/security')} />
        </View>

        <Text className="px-6 mt-6 mb-2 text-[#64FFDA] text-xs font-bold uppercase tracking-wider">Configuration</Text>
        <View className="mx-4 rounded-xl overflow-hidden">
          <SettingItem icon={Key} label="AI API Keys" value="Configure" onPress={() => router.push('/(main)/settings/ai-keys')} />
          <SettingItem 
            icon={DollarSign} 
            label="Currency" 
            value={user?.currency || 'USD'} 
            onPress={() => setShowCurrencyModal(true)} 
          />
          <SettingItem icon={Bell} label="Notifications" type="toggle" value={notifications} onToggle={setNotifications} />
        </View>

        <TouchableOpacity onPress={logout} className="mx-4 mt-8 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex-row items-center justify-center gap-2">
          <LogOut size={20} color="#EF4444" />
          <Text className="text-[#EF4444] font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="bg-[#112240] w-full max-w-sm rounded-2xl border border-[#233554] overflow-hidden">
            <View className="p-4 border-b border-[#233554] flex-row justify-between items-center">
              <Text className="text-white text-lg font-bold">Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <X size={20} color="#8892B0" />
              </TouchableOpacity>
            </View>
            {['USD', 'EUR', 'GBP', 'SEK'].map((curr) => (
              <TouchableOpacity 
                key={curr}
                onPress={() => handleCurrencyChange(curr)}
                className="p-4 border-b border-[#233554] flex-row justify-between items-center active:bg-[#0A192F]"
              >
                <Text className="text-white font-medium">{curr}</Text>
                {user?.currency === curr && <Check size={18} color="#64FFDA" />}
              </TouchableOpacity>
            ))}
            {loading && <ActivityIndicator className="p-4" color="#64FFDA" />}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}