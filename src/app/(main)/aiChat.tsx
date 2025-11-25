import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { getChatbotMessages, sendUserMessageToAI, clearChatbotMessages } from '../../services/aiService';
import { settingsService } from '../../shared/services/settingsService';
import { ChatbotMessage } from '../../types';

export default function AIChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    loadHistory();
    loadApiKey();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const history = await getChatbotMessages(user.id);
    setMessages(history);
  };

  const loadApiKey = async () => {
    if (!user) return;
    // Try to get key from settings first
    const key = await settingsService.getApiKey(user.id, 'gemini');
    setApiKey(key);
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    // Fallback: Check env var if settings key is missing
    const effectiveKey = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!effectiveKey) {
      Alert.alert('Missing Key', 'Please set your Gemini API Key in Settings.');
      return;
    }

    const userText = input;
    setInput(''); // Clear input immediately
    setLoading(true);

    try {
      // Optimistic update: Show user message immediately
      const tempUserMsg: ChatbotMessage = {
        id: Date.now().toString(),
        user_id: user.id,
        sender: 'user',
        text: userText,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // Send to AI Service (Handles saving both user & AI msg to DB)
      await sendUserMessageToAI(user.id, userText, effectiveKey);
      
      // Refresh history to get the real DB IDs and the new AI message
      await loadHistory();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!user) return;
    setLoading(true);
    await clearChatbotMessages(user.id);
    setMessages([]);
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="px-6 py-4 border-b border-[#233554] flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center">
            <Bot size={24} color="#64FFDA" />
          </View>
          <View>
            <Text className="text-white text-xl font-bold">AI Assistant</Text>
            <Text className="text-[#8892B0] text-xs">Powered by Gemini</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text className="text-[#F87171] text-xs">Clear Chat</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <View className={`flex-row mb-4 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {item.sender === 'ai' && (
                <View className="w-8 h-8 rounded-full bg-[#112240] items-center justify-center mr-2 border border-[#233554]">
                  <Bot size={16} color="#64FFDA" />
                </View>
              )}
              <View className={`max-w-[80%] p-4 rounded-2xl ${item.sender === 'user' ? 'bg-[#64FFDA] rounded-tr-none' : 'bg-[#112240] border border-[#233554] rounded-tl-none'}`}>
                <Text className={item.sender === 'user' ? 'text-[#0A192F] font-medium' : 'text-white'}>{item.text}</Text>
              </View>
            </View>
          )}
        />

        <View className="p-4 bg-[#0A192F] border-t border-[#233554]">
          <View className="flex-row items-center bg-[#112240] rounded-full border border-[#233554] px-4 h-12">
            <TextInput 
              className="flex-1 text-white text-base h-full"
              placeholder={apiKey ? "Ask anything..." : "Set API Key in Settings first"}
              placeholderTextColor="#8892B0"
              value={input}
              onChangeText={setInput}
              editable={!loading}
            />
            <TouchableOpacity onPress={handleSend} disabled={loading}>
              {loading ? <ActivityIndicator color="#64FFDA" /> : <Send size={20} color={input ? '#64FFDA' : '#8892B0'} />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}