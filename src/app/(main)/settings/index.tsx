import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, SafeAreaView } from 'react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { useRouter } from 'expo-router';
import { User, Globe, Moon, Bell, Shield, LogOut, ChevronRight, CreditCard, X, Check } from 'lucide-react-native';
import { updateCurrency } from '../../../services/dataService'; // Uses your service

const SECTIONS = [
  { 
    title: 'Account', 
    items: [
      { icon: User, label: 'Profile Information', link: '/(main)/settings/profile', color: '#64FFDA' },
      { icon: Shield, label: 'Security & Keys', link: '/(main)/settings/security', color: '#F472B6' },
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
      // 1. Save to Database
      await updateCurrency(user.id, newCurrency);
      // 2. Refresh App State (Crucial!)
      await refreshProfile();
      
      setCurrencyModal(false);
      Alert.alert("Success", `Currency changed to ${newCurrency}`);
    } catch (error: any) {
      Alert.alert("Error", "Failed to update currency.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <ScrollView className="p-6">
        <Text className="text-white text-3xl font-bold mb-6">Settings</Text>

        {/* Account Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} className="mb-8">
            <Text className="text-[#8892B0] text-xs font-bold uppercase mb-3 ml-1">{section.title}</Text>
            <View className="bg-[#112240] rounded-2xl overflow-hidden border border-white/5">
              {section.items.map((item, index) => (
                <TouchableOpacity 
                  key={item.label}
                  onPress={() => router.push(item.link as any)}
                  className={`flex-row items-center p-4 ${index !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <View className={`w-8 h-8 rounded-lg items-center justify-center`} style={{ backgroundColor: `${item.color}20` }}>
                    <item.icon size={18} color={item.color} />
                  </View>
                  <Text className="text-white flex-1 ml-3 font-medium">{item.label}</Text>
                  <ChevronRight size={20} color="#8892B0" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Preferences Section (Manual for Currency Logic) */}
        <View className="mb-8">
          <Text className="text-[#8892B0] text-xs font-bold uppercase mb-3 ml-1">Preferences</Text>
          <View className="bg-[#112240] rounded-2xl overflow-hidden border border-white/5">
            
            {/* Currency Picker */}
            <TouchableOpacity 
              onPress={() => setCurrencyModal(true)}
              className="flex-row items-center p-4 border-b border-white/5"
            >
              <View className="w-8 h-8 rounded-lg bg-green-500/20 items-center justify-center">
                <DollarSign size={18} color="#4ADE80" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-white font-medium">Currency</Text>
                <Text className="text-[#8892B0] text-xs">{user?.currency || 'USD'}</Text>
              </View>
              <ChevronRight size={20} color="#8892B0" />
            </TouchableOpacity>

            {/* Theme (Visual only for now) */}
            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-8 h-8 rounded-lg bg-purple-500/20 items-center justify-center">
                <Moon size={18} color="#A78BFA" />
              </View>
              <Text className="text-white flex-1 ml-3 font-medium">Dark Mode</Text>
              <View className="w-10 h-6 bg-[#64FFDA] rounded-full justify-center items-end px-1">
                <View className="w-4 h-4 bg-[#0A192F] rounded-full" />
              </View>
            </TouchableOpacity>

          </View>
        </View>

        <TouchableOpacity onPress={logout} className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex-row items-center justify-center mt-4">
          <LogOut size={20} color="#F87171" />
          <Text className="text-[#F87171] font-bold ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={currencyModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <View className="bg-[#112240] w-full max-w-sm rounded-2xl border border-white/10 p-2">
            <View className="p-4 border-b border-white/10 flex-row justify-between items-center">
              <Text className="text-white font-bold text-lg">Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModal(false)}><X size={24} color="#8892B0" /></TouchableOpacity>
            </View>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity 
                key={curr}
                onPress={() => handleCurrencyChange(curr)}
                className={`p-4 flex-row justify-between items-center ${curr === user?.currency ? 'bg-white/5' : ''}`}
              >
                <Text className={`font-bold ${curr === user?.currency ? 'text-[#64FFDA]' : 'text-white'}`}>{curr}</Text>
                {curr === user?.currency && <Check size={20} color="#64FFDA" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { DollarSign } from 'lucide-react-native'; // Added missing import