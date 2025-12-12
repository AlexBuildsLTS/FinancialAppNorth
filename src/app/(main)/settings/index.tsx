import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Alert, Modal, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { useRouter } from 'expo-router';
import { 
  User, Globe, Moon, Shield, LogOut, ChevronRight, X, Check, DollarSign, Key, Palette 
} from 'lucide-react-native';
import { UserService } from '../../../services/userService';

const SECTIONS = [
  { 
    title: 'Account', 
    items: [
      { icon: User, label: 'Profile Information', link: '/(main)/settings/profile', color: '#64FFDA' },
      { icon: Shield, label: 'Security', link: '/(main)/settings/security', color: '#60A5FA' },
    ]
  },
  { 
    title: 'Integration', 
    items: [
      { icon: Key, label: 'AI Configuration', link: '/(main)/settings/ai-keys', color: '#F472B6' },
    ]
  },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SEK', 'JPY'];

export default function SettingsScreen() {
  const { user, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [currencyModal, setCurrencyModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Save to Database using centralized service
      await UserService.updateCurrency(user.id, newCurrency);
      
      // 2. Refresh App State to update dashboard numbers immediately
      await refreshProfile();
      
      setCurrencyModal(false);
      Alert.alert("Success", `Currency changed to ${newCurrency}`);
    } catch (error: any) {
      Alert.alert("Error", "Failed to update currency: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <ScrollView className="p-6">
        <Text className="text-white text-3xl font-bold mb-1">Settings</Text>
        <Text className="text-[#8892B0] mb-8">Manage your preferences</Text>

        {/* Dynamic Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} className="mb-8">
            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-3 ml-1 tracking-wider">{section.title}</Text>
            <View className="bg-[#112240] rounded-2xl overflow-hidden border border-white/5">
              {section.items.map((item, index) => (
                <TouchableOpacity 
                  key={item.label}
                  onPress={() => router.push(item.link as any)}
                  className={`flex-row items-center p-4 ${index !== section.items.length - 1 ? 'border-b border-white/5' : ''} active:bg-[#162C52]`}
                >
                  <View className={`w-8 h-8 rounded-lg items-center justify-center`} style={{ backgroundColor: `${item.color}20` }}>
                    <item.icon size={18} color={item.color} />
                  </View>
                  <Text className="text-white flex-1 ml-3 font-medium text-base">{item.label}</Text>
                  <ChevronRight size={20} color="#8892B0" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Preferences Section */}
        <View className="mb-8">
          <Text className="text-[#8892B0] text-xs font-bold uppercase mb-3 ml-1 tracking-wider">Preferences</Text>
          <View className="bg-[#112240] rounded-2xl overflow-hidden border border-white/5">
            
            {/* Currency Picker */}
            <TouchableOpacity 
              onPress={() => setCurrencyModal(true)}
              className="flex-row items-center p-4 border-b border-white/5 active:bg-[#162C52]"
            >
              <View className="w-8 h-8 rounded-lg bg-green-500/20 items-center justify-center">
                <DollarSign size={18} color="#4ADE80" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-white font-medium text-base">Currency</Text>
                <Text className="text-[#8892B0] text-xs">{user?.currency || 'USD'}</Text>
              </View>
              {saving ? <ActivityIndicator size="small" color="#64FFDA" /> : <ChevronRight size={20} color="#8892B0" />}
            </TouchableOpacity>

            {/* Theme Toggle (Visual only for now) */}
            <TouchableOpacity className="flex-row items-center p-4 active:bg-[#162C52]">
              <View className="w-8 h-8 rounded-lg bg-purple-500/20 items-center justify-center">
                <Palette size={18} color="#A78BFA" />
              </View>
              <Text className="text-white flex-1 ml-3 font-medium text-base">Appearance</Text>
              <View className="flex-row items-center bg-[#0A192F] px-3 py-1 rounded-full border border-white/10">
                 <Moon size={12} color="#8892B0" className="mr-1" />
                 <Text className="text-[#8892B0] text-xs font-bold">Dark</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
            onPress={logout} 
            className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex-row items-center justify-center mt-4 active:bg-red-500/20"
        >
          <LogOut size={20} color="#F87171" />
          <Text className="text-[#F87171] font-bold ml-2 text-lg">Log Out</Text>
        </TouchableOpacity>
        
        <View className="h-10" />
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={currencyModal} transparent animationType="fade" onRequestClose={() => setCurrencyModal(false)}>
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <View className="bg-[#112240] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <View className="p-4 border-b border-white/10 flex-row justify-between items-center bg-[#0D1F3A]">
              <Text className="text-white font-bold text-lg">Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModal(false)} className="p-1 rounded-full active:bg-white/10">
                  <X size={24} color="#8892B0" />
              </TouchableOpacity>
            </View>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity 
                key={curr}
                onPress={() => handleCurrencyChange(curr)}
                className={`p-4 flex-row justify-between items-center border-b border-white/5 active:bg-[#162C52] ${curr === user?.currency ? 'bg-[#64FFDA]/5' : ''}`}
              >
                <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-[#0A192F] items-center justify-center border border-white/10 mr-3">
                        <Text className="text-[#8892B0] font-bold text-xs">{curr}</Text>
                    </View>
                    <Text className={`font-bold text-base ${curr === user?.currency ? 'text-[#64FFDA]' : 'text-white'}`}>{curr}</Text>
                </View>
                {curr === user?.currency && <Check size={20} color="#64FFDA" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}