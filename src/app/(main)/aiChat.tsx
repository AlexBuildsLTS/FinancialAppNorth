import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon, Settings, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { sendUserMessageToAI, getChatbotMessages } from '../../services/aiService';
import { ChatbotMessage } from '../../types';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function AIChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // --- State ---
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- Refs ---
  const flatListRef = useRef<FlatList>(null);

  // --- Initial Load ---
  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const history = await getChatbotMessages(user.id);
      setMessages(history || []);
    } catch (e) {
      console.warn("Failed to load chat history");
    }
  };

  // --- Handlers ---
  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    const textToSend = input.trim();
    setInput(''); // Clear immediately
    setLoading(true);

    // 1. Optimistic Update (Show user message immediately)
    const tempUserMsg: ChatbotMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      sender: 'user',
      text: textToSend,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // 2. Call API
      const aiResponseText = await sendUserMessageToAI(user.id, textToSend);
      
      // 3. Update with AI Response
      const aiMsg: ChatbotMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        sender: 'ai',
        text: aiResponseText,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("AI Error:", error);
      
      if (error.message?.includes("API Key")) {
        Alert.alert(
          "Configuration Missing", 
          "You haven't saved an API Key yet. Please configure it in settings.", 
          [
            { text: "Configure", onPress: () => router.push('/(main)/settings/ai-keys') },
            { text: "Cancel", style: "cancel" }
          ]
        );
      } else {
        Alert.alert("Error", error.message || "The AI could not respond.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Render Item ---
  const renderItem = ({ item }: { item: ChatbotMessage }) => {
    const isUser = item.sender === 'user';
    const timeString = new Date(item.created_at || Date.now()).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    });

    return (
      <Animated.View 
        entering={FadeInUp.duration(300)} 
        className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#64FFDA]/20 items-center justify-center mr-2 mt-1 border border-[#64FFDA]/30">
            <Bot size={16} color="#64FFDA" />
          </View>
        )}
        
        <View 
          className={`max-w-[85%] p-4 rounded-2xl ${
            isUser 
              ? 'bg-[#64FFDA] rounded-tr-sm' 
              : 'bg-[#112240] border border-white/10 rounded-tl-sm'
          }`}
        >
          <Text className={`${isUser ? 'text-[#0A192F] font-bold' : 'text-white'} text-base leading-6`}>
            {item.text}
          </Text>
          <Text className={`text-[10px] mt-1 text-right ${isUser ? 'text-[#0A192F]/60' : 'text-gray-500'}`}>
             {timeString}
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
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-white/5 flex-row justify-between items-center bg-[#0A192F]">
        <View className="flex-row items-center gap-3">
            <View className="bg-[#112240] p-2 rounded-xl border border-white/10">
                <Sparkles size={20} color="#64FFDA" />
            </View>
            <View>
                <Text className="text-white text-xl font-bold">Financial AI</Text>
                <Text className="text-[#64FFDA] text-xs">Online • Gemini</Text>
            </View>
        </View>
        
        <TouchableOpacity 
            onPress={() => router.push('/(main)/settings/ai-keys')} 
            className="p-2 bg-[#112240] rounded-full border border-white/10 active:bg-white/10"
        >
            <Settings size={20} color="#8892B0" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        className="flex-1"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View className="p-4 bg-[#0A192F] border-t border-white/5 flex-row items-end gap-3 pb-6">
          <TextInput
            className="flex-1 bg-[#112240] text-white p-4 rounded-2xl border border-white/10 max-h-32 min-h-[56px]"
            placeholder="Ask about your spending..."
            placeholderTextColor="#8892B0"
            value={input}
            onChangeText={setInput}
            multiline
            textAlignVertical="center"
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={loading || !input.trim()}
            className={`w-14 h-14 rounded-full items-center justify-center mb-1 ${
                loading || !input.trim() ? 'bg-white/10' : 'bg-[#64FFDA]'
            }`}
          >
            {loading ? (
                <ActivityIndicator color="#0A192F" /> 
            ) : (
                <Send size={24} color={input.trim() ? '#0A192F' : '#8892B0'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}