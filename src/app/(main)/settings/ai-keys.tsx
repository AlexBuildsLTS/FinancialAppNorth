import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Key } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
// FIX: Import from aiService, NOT settingsService
import { saveGeminiKey, getGeminiKey } from '../../../services/aiService'; 

export default function AiKeysScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      getGeminiKey(user.id).then((key) => {
        if (key) setApiKey(key);
        setFetching(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter a valid API Key");
      return;
    }

    setLoading(true);
    try {
      await saveGeminiKey(user.id, apiKey);
      Alert.alert("Success", "Gemini API Key saved securely.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-4 py-4 flex-row items-center border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">AI Configuration</Text>
      </View>

      <View className="p-6">
        <View className="bg-[#112240] p-6 rounded-2xl border border-white/5 mb-6">
          <View className="flex-row items-center mb-4">
            <Key size={24} color="#64FFDA" className="mr-3" />
            <Text className="text-white text-lg font-bold">Gemini API Key</Text>
          </View>
          <Text className="text-[#8892B0] mb-4 leading-5">
            Enter your Google Gemini API key to enable AI chat and financial analysis features. 
            Your key is stored securely.
          </Text>

          {fetching ? (
             <ActivityIndicator color="#64FFDA" />
          ) : (
            <TextInput
              className="bg-[#0A192F] text-white p-4 rounded-xl border border-white/10 mb-4 font-mono"
              placeholder="AIzaSy..."
              placeholderTextColor="#475569"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />
          )}

          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            className="bg-[#64FFDA] py-4 rounded-xl items-center flex-row justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#0A192F" />
            ) : (
              <>
                <Save size={20} color="#0A192F" className="mr-2" />
                <Text className="text-[#0A192F] font-bold text-lg">Save Key</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}