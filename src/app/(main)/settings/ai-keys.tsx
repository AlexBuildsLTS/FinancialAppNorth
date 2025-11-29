import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Key } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
// Import from aiService (Single Source of Truth)
import { saveGeminiKey, getGeminiKey } from '../../../services/aiService'; 

export default function AiKeysScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadKey = async () => {
        if (!user) return;
        try {
            // Timeout protection: Stop waiting after 3 seconds
            const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
            const fetch = getGeminiKey(user.id);
            
            const key = await Promise.race([fetch, timeout]);

            if (typeof key === 'string' && isMounted) {
                setApiKey(key);
            }
        } catch (e) {
            console.log("Key fetch skipped.");
        } finally {
            if (isMounted) setFetching(false);
        }
    };

    loadKey();
    return () => { isMounted = false; };
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
      Alert.alert("Error", error.message || "Failed to save key.");
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
            Enter your Google Gemini API key to enable AI chat and financial analysis.
          </Text>

          {fetching ? (
             <View className="py-4 items-center">
                 <ActivityIndicator color="#64FFDA" />
                 <Text className="text-[#8892B0] text-xs mt-2">Checking secure storage...</Text>
             </View>
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