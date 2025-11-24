import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch, Modal, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Globe, CreditCard, Bell, Shield, Key, LogOut, X, Check, Save } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [currency, setCurrency] = useState('USD ($)');
  const [region, setRegion] = useState('United States');
  const [notifications, setNotifications] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'currency' | 'region'>('currency');

  const currencies = ['USD ($)', 'GBP (£)', 'EUR (€)', 'SEK (kr)'];
  const regions = ['United States', 'United Kingdom', 'Sweden', 'Germany', 'Spain'];

  const REGION_CURRENCY_MAP: Record<string, string> = {
    'United States': 'USD ($)',
    'United Kingdom': 'GBP (£)',
    'Sweden': 'SEK (kr)',
    'Germany': 'EUR (€)',
    'Spain': 'EUR (€)'
  };

  const openModal = (type: 'currency' | 'region') => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleSelect = (value: string) => {
    if (modalType === 'region') {
        setRegion(value);
        // Auto update currency based on region
        if (REGION_CURRENCY_MAP[value]) {
            setCurrency(REGION_CURRENCY_MAP[value]);
        }
    } else {
        setCurrency(value);
    }
    setModalVisible(false);
  };

  const handleSave = () => {
    Alert.alert("Success", "Settings saved successfully.");
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, type = 'link' }: any) => (
    <TouchableOpacity 
        onPress={onPress}
        disabled={type === 'switch'}
        className="flex-row items-center justify-between p-4 bg-[#112240] border-b border-white/5 first:rounded-t-xl last:rounded-b-xl last:border-0 active:bg-white/5"
    >
      <View className="flex-row items-center gap-3">
        <Icon size={20} color="#8892B0" />
        <Text className="text-white font-medium">{label}</Text>
      </View>
      
      <View className="flex-row items-center gap-2">
        {type === 'value' && (
            <Text className="text-[#64FFDA] text-sm font-medium">{value}</Text>
        )}
        {type === 'switch' && (
            <Switch 
                value={value} 
                onValueChange={onPress}
                trackColor={{ false: '#0A192F', true: '#64FFDA' }}
                thumbColor={value ? '#112240' : '#8892B0'}
            />
        )}
        {type !== 'switch' && <ChevronRight size={16} color="#8892B0" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ 
        headerTitle: 'Settings',
        headerStyle: { backgroundColor: '#0A192F' },
        headerTintColor: '#fff',
        headerShadowVisible: false
      }} />

      <ScrollView className="flex-1 px-4 pt-2">
        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2 mt-4 ml-2">Preferences</Text>
        <View className="mb-6 rounded-xl overflow-hidden">
            <SettingItem 
                icon={Globe} 
                label="Region" 
                value={region} 
                type="value" 
                onPress={() => openModal('region')} 
            />
            <SettingItem 
                icon={CreditCard} 
                label="Currency" 
                value={currency} 
                type="value" 
                onPress={() => openModal('currency')} 
            />
            <SettingItem 
                icon={Bell} 
                label="Push Notifications" 
                value={notifications} 
                type="switch" 
                onPress={() => setNotifications(!notifications)} 
            />
        </View>

        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2 ml-2">Security & AI</Text>
        <View className="mb-6 rounded-xl overflow-hidden">
            <SettingItem 
                icon={Key} 
                label="AI API Keys" 
                type="link"
                onPress={() => router.push('/(main)/settings/ai-keys' as any)}
            />
            <SettingItem 
                icon={Shield} 
                label="Change Password" 
                type="link" 
                onPress={() => console.log('Change Pass')} 
            />
        </View>

        {/* Save Button */}
        <TouchableOpacity 
            onPress={handleSave}
            className="w-full bg-[#64FFDA] py-4 rounded-xl items-center flex-row justify-center mb-4"
        >
            <Save size={20} color="#0A192F" />
            <Text className="text-[#0A192F] font-bold ml-2">Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={logout}
            className="flex-row items-center justify-center gap-2 p-4 bg-red-500/10 rounded-xl border border-red-500/20 mt-2"
        >
            <LogOut size={18} color="#F87171" />
            <Text className="text-[#F87171] font-bold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setModalVisible(false)}>
            <View className="bg-[#112240] rounded-t-3xl p-6 max-h-[50%]">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white font-bold text-xl">Select {modalType === 'currency' ? 'Currency' : 'Region'}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <X size={24} color="#8892B0" />
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    {(modalType === 'currency' ? currencies : regions).map(item => (
                        <TouchableOpacity 
                            key={item} 
                            onPress={() => handleSelect(item)}
                            className="flex-row items-center justify-between py-4 border-b border-white/5"
                        >
                            <Text className={`font-medium text-base ${
                                (modalType === 'currency' ? currency : region) === item ? 'text-[#64FFDA]' : 'text-white'
                            }`}>
                                {item}
                            </Text>
                            {(modalType === 'currency' ? currency : region) === item && (
                                <Check size={20} color="#64FFDA" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}