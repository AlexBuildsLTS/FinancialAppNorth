 import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Send, Bot, User } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { getChatbotMessages } from '../../services/aiService';
import { generateAIResponse } from '../../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function AIChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const botResponseText = await generateAIResponse(input);
      const botMessage: Message = { id: Date.now().toString() + 'bot', text: botResponseText, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI response error:", error);
      const errorMessage: Message = { id: Date.now().toString() + 'error', text: "Sorry, I couldn't process that. Please try again.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) =>
    (
    <View className={`flex-row items-end mb-4 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {item.sender === 'bot' && (
        <View className="w-8 h-8 rounded-full bg-[#64FFDA] items-center justify-center mr-2">
          <Bot size={20} color="#0A192F" />
        </View>
      )}
      <View className={`max-w-[80%] p-3 rounded-lg ${item.sender === 'user' ? 'bg-[#64FFDA] rounded-br-none' : 'bg-[#112240] rounded-bl-none'}`}>
        <Text className={`${item.sender === 'user' ? 'text-[#0A192F]' : 'text-white'}`}>{item.text}</Text>
      </View>
      {item.sender === 'user' && (
        <View className="w-8 h-8 rounded-full bg-[#8892B0] items-center justify-center ml-2">
          <User size={20} color="#0A192F" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ headerTitle: 'AI Chat', headerStyle: { backgroundColor: '#0A192F' }, headerTintColor: '#fff' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
        />
        {isTyping && (
          <View className="flex-row items-center justify-start mb-4 px-4">
            <View className="w-8 h-8 rounded-full bg-[#64FFDA] items-center justify-center mr-2">
              <Bot size={20} color="#0A192F" />
            </View>
            <View className="bg-[#112240] p-3 rounded-lg rounded-bl-none">
              <ActivityIndicator size="small" color="#64FFDA" />
            </View>
          </View>
        )}
        <View className="flex-row items-center p-4 border-t border-white/10 bg-[#0A192F]">
          <TextInput
            className="flex-1 bg-[#112240] text-white p-3 rounded-full mr-3 border border-white/10"
            placeholder="Ask me anything..."
            placeholderTextColor="#8892B0"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            className="w-10 h-10 rounded-full bg-[#64FFDA] items-center justify-center"
            disabled={isTyping || input.trim() === ''}
          >
            <Send size={20} color="#0A192F" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}