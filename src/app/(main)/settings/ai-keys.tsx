import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../shared/context/AuthContext';
import { settingsService } from '../../../shared/services/settingsService';
import { ArrowLeft, Key, Save, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AiKeysSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (service: 'gemini' | 'openai', key: string) => {
    if (!user || !key) return;
    setLoading(true);
    try {
      await settingsService.saveApiKey(user.id, service, key);
      Alert.alert('Success', `${service.toUpperCase()} API Key saved.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 py-4 border-b border-[#233554] flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">AI Configuration</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-[#8892B0] mb-6">
          Manage your API keys to power the AI Chat assistant. Your keys are stored securely.
        </Text>

        {/* Gemini Section */}
        <View className="bg-[#112240] p-5 rounded-2xl border border-[#233554] mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center">
              <Key size={20} color="#64FFDA" />
            </View>
            <Text className="text-white font-bold text-lg">Google Gemini</Text>
          </View>
          
          <TextInput 
            className="bg-[#0A192F] text-white p-4 rounded-xl border border-[#233554] mb-4"
            placeholder="Paste Gemini API Key"
            placeholderTextColor="#475569"
            value={geminiKey}
            onChangeText={setGeminiKey}
            secureTextEntry
          />
          
          <TouchableOpacity 
            onPress={() => handleSave('gemini', geminiKey)}
            disabled={loading || !geminiKey}
            className="bg-[#64FFDA] h-12 rounded-xl items-center justify-center"
          >
            {loading ? <ActivityIndicator color="#0A192F" /> : <Text className="text-[#0A192F] font-bold">Save Key</Text>}
          </TouchableOpacity>
        </View>

        {/* OpenAI Section */}
        <View className="bg-[#112240] p-5 rounded-2xl border border-[#233554]">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-[#60A5FA]/10 items-center justify-center">
              <Key size={20} color="#60A5FA" />
            </View>
            <Text className="text-white font-bold text-lg">OpenAI (GPT-4)</Text>
          </View>
          
          <TextInput 
            className="bg-[#0A192F] text-white p-4 rounded-xl border border-[#233554] mb-4"
            placeholder="Paste OpenAI API Key"
            placeholderTextColor="#475569"
            value={openaiKey}
            onChangeText={setOpenaiKey}
            secureTextEntry
          />
          
          <TouchableOpacity 
            onPress={() => handleSave('openai', openaiKey)}
            disabled={loading || !openaiKey}
            className="bg-[#60A5FA] h-12 rounded-xl items-center justify-center"
          >
             <Text className="text-[#0A192F] font-bold">Save Key</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}