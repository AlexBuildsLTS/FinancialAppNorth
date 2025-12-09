import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Key, Eye, EyeOff, Zap, BrainCircuit } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
// Using the robust settingsService we built to handle multiple provider types
import { settingsService } from '../../../shared/services/settingsService';

export default function AiKeysScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // --- State ---
  const [geminiKey, setGeminiKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- Load Keys on Mount ---
  useEffect(() => {
    let isMounted = true;
    
    const loadKeys = async () => {
        if (!user) return;
        try {
            // Fetch both keys in parallel
            const [gemini, openai] = await Promise.all([
                settingsService.getApiKey(user.id, 'gemini'),
                settingsService.getApiKey(user.id, 'openai')
            ]);

            if (isMounted) {
                if (gemini) setGeminiKey(gemini);
                if (openai) setOpenAIKey(openai);
            }
        } catch (e) {
            console.log("Error fetching API keys:", e);
        } finally {
            if (isMounted) setFetching(false);
        }
    };

    loadKeys();
    return () => { isMounted = false; };
  }, [user]);

  // --- Save Handler ---
  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save Gemini Key
      if (geminiKey.trim()) {
        await settingsService.saveApiKey(user.id, 'gemini', geminiKey.trim());
      }

      // Save OpenAI Key
      if (openAIKey.trim()) {
        await settingsService.saveApiKey(user.id, 'openai', openAIKey.trim());
      }

      Alert.alert("Success", "API Keys updated securely.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save keys.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <View className="px-4 py-4 flex-row items-center border-b border-white/5 bg-[#0A192F]">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-white/10">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">AI Configuration</Text>
        </View>

        <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
          
          <Text className="text-[#8892B0] mb-6 leading-5">
            Configure your AI providers below. Your keys are encrypted and stored locally on your device.
          </Text>

          {fetching ? (
             <View className="py-10 items-center">
                 <ActivityIndicator size="large" color="#64FFDA" />
                 <Text className="text-[#8892B0] text-sm mt-3">Accessing Secure Storage...</Text>
             </View>
          ) : (
            <View className="gap-6">
              
              {/* --- Gemini Section --- */}
              <View className="bg-[#112240] p-5 rounded-2xl border border-white/5">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                    <Zap size={18} color="#60A5FA" />
                  </View>
                  <View>
                    <Text className="text-white text-lg font-bold">Google Gemini</Text>
                    <Text className="text-[#8892B0] text-xs">Fast, efficient, and free-tier available.</Text>
                  </View>
                </View>

                <View className="relative">
                  <TextInput
                    className="bg-[#0A192F] text-white p-4 pr-12 rounded-xl border border-white/10 font-mono text-sm"
                    placeholder="AIzaSy..."
                    placeholderTextColor="#475569"
                    value={geminiKey}
                    onChangeText={setGeminiKey}
                    secureTextEntry={!showGemini}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowGemini(!showGemini)}
                    className="absolute right-4 top-4"
                  >
                    {showGemini ? <EyeOff size={20} color="#8892B0" /> : <Eye size={20} color="#8892B0" />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* --- OpenAI Section --- */}
              <View className="bg-[#112240] p-5 rounded-2xl border border-white/5">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
                    <BrainCircuit size={18} color="#4ADE80" />
                  </View>
                  <View>
                    <Text className="text-white text-lg font-bold">OpenAI (GPT-4)</Text>
                    <Text className="text-[#8892B0] text-xs">High reasoning capability. Paid API.</Text>
                  </View>
                </View>

                <View className="relative">
                  <TextInput
                    className="bg-[#0A192F] text-white p-4 pr-12 rounded-xl border border-white/10 font-mono text-sm"
                    placeholder="sk-..."
                    placeholderTextColor="#475569"
                    value={openAIKey}
                    onChangeText={setOpenAIKey}
                    secureTextEntry={!showOpenAI}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowOpenAI(!showOpenAI)}
                    className="absolute right-4 top-4"
                  >
                    {showOpenAI ? <EyeOff size={20} color="#8892B0" /> : <Eye size={20} color="#8892B0" />}
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          )}

          {/* Spacer */}
          <View className="h-24" />
        </ScrollView>

        {/* Floating Save Button */}
        <View className="absolute bottom-8 left-6 right-6">
          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading || fetching}
            className={`py-4 rounded-xl items-center flex-row justify-center shadow-lg
              ${loading ? 'bg-[#64FFDA]/70' : 'bg-[#64FFDA]'}
            `}
          >
            {loading ? (
              <ActivityIndicator color="#0A192F" />
            ) : (
              <>
                <Save size={20} color="#0A192F" className="mr-2" />
                <Text className="text-[#0A192F] font-bold text-lg">Save Configuration</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}