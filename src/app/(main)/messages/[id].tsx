
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Send, Paperclip, Camera, ArrowLeft, MoreVertical } from 'lucide-react-native';
import { subscribeToChat, sendMessage, getChatHistory } from '../../../services/dataService';
import { useAuth } from '../../../shared/context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
}

export default function PrivateChat() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [avatar, setAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/png?seed=${id}`);

  useEffect(() => {
    if (!user) return;
    const chatId = id as string;

    // Load history
    getChatHistory(chatId).then(setMessages);

    // Subscribe to realtime
    const subscription = subscribeToChat(chatId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id, user]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    const text = inputText;
    setInputText('');
    
    try {
      await sendMessage(id as string, user.id, text);
      // Optimistic update happens via subscription usually, but can do here too if needed
    } catch (e) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
        {!isMe && (
           <Image source={{ uri: avatar }} className="w-8 h-8 rounded-full mr-2 self-end mb-1 bg-white/10" />
        )}
        <View 
          className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm ${
            isMe 
              ? 'bg-[#64FFDA] rounded-tr-none' 
              : 'bg-[#112240] border border-white/10 rounded-tl-none'
          }`}
        >
          <Text className={`text-[15px] leading-5 ${isMe ? 'text-[#0A192F] font-medium' : 'text-white'}`}>
            {item.text}
          </Text>
          <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#0A192F]/60' : 'text-[#8892B0]'}`}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5 bg-[#112240]">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#CCD6F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="relative">
            <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full bg-white/10" />
          </TouchableOpacity>
          <View>
            <Text className="text-white font-bold text-base">User {id}</Text>
            <Text className="text-[#64FFDA] text-xs">Online</Text>
          </View>
        </View>
        <MoreVertical size={24} color="#8892B0" />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
        className="flex-1 bg-[#0A192F]"
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-row items-center px-4 py-3 bg-[#112240] border-t border-white/5 gap-3 pb-6">
          <TouchableOpacity>
            <Paperclip size={24} color="#8892B0" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-[#0A192F] border border-white/10 rounded-2xl px-4 py-2.5 text-white max-h-24"
            placeholder="Type a message..."
            placeholderTextColor="#8892B0"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend}
            className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'}`}
            disabled={!inputText.trim()}
          >
            <Send size={18} color={inputText.trim() ? '#0A192F' : '#8892B0'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
