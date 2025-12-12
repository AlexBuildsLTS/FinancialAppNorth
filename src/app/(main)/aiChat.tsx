import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, StatusBar 
} from 'react-native';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../shared/context/AuthContext'; // Keep this import
import { generateContent } from '../../services/aiService'; // Corrected import path

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'model', 
      text: `Hello ${user?.name || 'there'}! I am NorthAI, your financial assistant. I can analyze your spending, suggest budgets, or answer accounting questions.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await generateContent(userText, user?.id);
      
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: `⚠️ Error: ${error.message}` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-[#64FFDA]/10 items-center justify-center mr-2 border border-[#64FFDA]/20">
            <Bot size={16} color="#64FFDA" />
          </View>
        )}
        
        <View 
          className={`max-w-[80%] p-4 rounded-2xl ${
            isUser 
              ? 'bg-[#64FFDA] rounded-tr-sm' 
              : 'bg-[#112240] rounded-tl-sm border border-white/5'
          }`}
        >
          <Text className={`text-base ${isUser ? 'text-[#0A192F] font-bold' : 'text-white'}`}>
            {item.text}
          </Text>
        </View>

        {isUser && (
          <View className="w-8 h-8 rounded-full bg-[#112240] items-center justify-center ml-2 border border-white/10">
            <User size={16} color="#8892B0" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      
      <View className="flex-row items-center p-4 border-b border-white/5 bg-[#0A192F]">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 -ml-2 rounded-full active:bg-white/10">
          <ArrowLeft size={24} color="#8892B0" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-lg font-bold flex-row items-center">
            North AI <Sparkles size={14} color="#64FFDA" />
          </Text>
          <Text className="text-[#8892B0] text-xs">Financial Intelligence</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        className="flex-1"
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="p-4 bg-[#112240] border-t border-white/5 flex-row items-end">
          <TextInput
            className="flex-1 bg-[#0A192F] text-white p-4 rounded-2xl border border-white/10 text-base max-h-32"
            placeholder="Ask about your finances..."
            placeholderTextColor="#475569"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!isTyping}
          />
          <TouchableOpacity 
            onPress={handleSend} 
            disabled={!input.trim() || isTyping}
            className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
              input.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'
            }`}
          >
            {isTyping ? (
              <ActivityIndicator color="#0A192F" />
            ) : (
              <Send size={20} color={input.trim() ? '#0A192F' : '#8892B0'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}