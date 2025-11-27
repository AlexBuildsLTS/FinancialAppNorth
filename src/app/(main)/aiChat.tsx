import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, SafeAreaView } from 'react-native';
import { Send, Bot, User as UserIcon, Settings } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { sendUserMessageToAI, getChatbotMessages } from '../../services/aiService';
import { ChatbotMessage } from '../../types';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function AIChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const history = await getChatbotMessages(user.id);
    setMessages(history);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    const userMsg: ChatbotMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      sender: 'user',
      text: input.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // This calls Gemini via your aiService
      const aiResponseText = await sendUserMessageToAI(user.id, userMsg.text);
      
      const aiMsg: ChatbotMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        sender: 'ai',
        text: aiResponseText,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      if (error.message.includes("API Key")) {
        Alert.alert("Setup Required", "Please save your Gemini API Key in Settings first.", [
          { text: "Go to Settings", onPress: () => router.push('/(main)/settings/ai-keys') },
          { text: "Cancel", style: "cancel" }
        ]);
      } else {
        Alert.alert("Error", "AI failed to respond. Please try again.");
      }
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderItem = ({ item }: { item: ChatbotMessage }) => {
    const isUser = item.sender === 'user';
    return (
      <Animated.View entering={FadeInUp.duration(300)} className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#64FFDA]/20 items-center justify-center mr-2 mt-1">
            <Bot size={16} color="#64FFDA" />
          </View>
        )}
        
        <View className={`max-w-[80%] p-4 rounded-2xl ${
          isUser ? 'bg-[#64FFDA] rounded-tr-none' : 'bg-[#112240] border border-white/10 rounded-tl-none'
        }`}>
          <Text className={`${isUser ? 'text-[#0A192F] font-bold' : 'text-white'} text-base leading-6`}>
            {item.text}
          </Text>
        </View>

        {isUser && (
          <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center ml-2 mt-1">
            <UserIcon size={16} color="white" />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center">
        <View>
            <Text className="text-white text-xl font-bold">AI Financial Assistant</Text>
            <Text className="text-[#64FFDA] text-xs">Powered by Gemini</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(main)/settings/ai-keys')} className="p-2 bg-white/5 rounded-full">
            <Settings size={20} color="#8892B0" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        className="flex-1"
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="p-4 bg-[#0A192F] border-t border-white/5 flex-row items-center gap-3">
          <TextInput
            className="flex-1 bg-[#112240] text-white p-4 rounded-2xl border border-white/10 max-h-32"
            placeholder="Ask about your spending..."
            placeholderTextColor="#8892B0"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={loading || !input.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${loading || !input.trim() ? 'bg-white/10' : 'bg-[#64FFDA]'}`}
          >
            {loading ? <ActivityIndicator color="#0A192F" /> : <Send size={20} color={input.trim() ? '#0A192F' : '#8892B0'} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}