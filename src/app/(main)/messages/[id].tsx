import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Lock } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getOrCreateConversation, sendMessage, subscribeToChat, getConversationMessages, getUserDetails } from '../../../services/dataService';
import { encryptMessage, decryptMessage } from '../../../lib/crypto';



export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // Target User ID
  const targetUserId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const router = useRouter();
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user && targetUserId) {
        initChat();
        fetchTargetUser();
    }
  }, [user, targetUserId]);

  const fetchTargetUser = async () => {
      const details = await getUserDetails(targetUserId);
      setTargetUser(details);
  };

  const initChat = async () => {
      try {
          // 1. Find/Create Conversation
          const convId = await getOrCreateConversation(user!.id, targetUserId);
          setConversationId(convId);

          // 2. Load History
          const history = await getConversationMessages(convId);
          setMessages(history);
          setLoading(false);

          // 3. Subscribe to Realtime
          const subscription = subscribeToChat(convId, (newMsg) => {
             // Add if not mine (mine adds optimistic)
             if (newMsg.sender_id !== user!.id) {
                 setMessages(prev => [...prev, newMsg]);
             }
          });

          return () => { subscription.unsubscribe(); }

      } catch (e) {
          console.error("Chat Init Error", e);
          setLoading(false);
      }
  };

  const handleSend = async () => {
      if (!input.trim() || !conversationId) return;

      const textToSend = input.trim();
      setInput(''); // Clear immediately

      // Encrypt
      const encryptedContent = encryptMessage(textToSend);

      try {
          // Optimistic Update
          const tempId = Date.now().toString();
          setMessages(prev => [...prev, {
              id: tempId,
              content_encrypted: encryptedContent,
              sender_id: user!.id,
              created_at: new Date().toISOString()
          }]);

          // Send to DB
          await sendMessage(targetUserId, user!.id, encryptedContent);
          
      } catch (e) {
          console.error("Send Failed", e);
          // Could add retry logic here
      }
  };

  if (loading) return <View className="flex-1 bg-[#0A192F] justify-center items-center"><ActivityIndicator color="#64FFDA"/></View>;

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-white/5 bg-[#112240]">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#8892B0" />
        </TouchableOpacity>
        
        <View className="w-10 h-10 rounded-full bg-[#0A192F] overflow-hidden border border-white/10 mr-3">
            {targetUser?.avatar_url ? (
                <Image source={{ uri: targetUser.avatar_url }} className="w-full h-full" />
            ) : (
                <View className="w-full h-full items-center justify-center"><Text className="text-white font-bold">{targetUser?.first_name?.[0] || '?'}</Text></View>
            )}
        </View>
        
        <View>
            <Text className="text-white font-bold text-lg">{targetUser?.first_name || 'User'} {targetUser?.last_name || ''}</Text>
            <View className="flex-row items-center">
                <Lock size={12} color="#64FFDA" />
                <Text className="text-[#64FFDA] text-xs ml-1">End-to-End Encrypted</Text>
            </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
            const isMe = item.sender_id === user!.id;
            // Decrypt for display
            const decrypted = decryptMessage(item.content_encrypted);
            
            return (
                <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <View className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-[#64FFDA] rounded-tr-sm' : 'bg-[#112240] border border-white/10 rounded-tl-sm'}`}>
                        <Text className={`text-base ${isMe ? 'text-[#0A192F]' : 'text-white'}`}>{decrypted}</Text>
                        <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#0A192F]/60' : 'text-gray-500'}`}>
                            {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Text>
                    </View>
                </View>
            );
        }}
      />

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="p-3 bg-[#112240] border-t border-white/5 flex-row items-center gap-2">
            <TextInput
                className="flex-1 bg-[#0A192F] text-white p-3 rounded-xl border border-white/10 max-h-24"
                placeholder="Type a secure message..."
                placeholderTextColor="#8892B0"
                value={input}
                onChangeText={setInput}
                multiline
            />
            <TouchableOpacity 
                onPress={handleSend} 
                disabled={!input.trim()}
                className={`p-3 rounded-full ${input.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'}`}
            >
                <Send size={20} color={input.trim() ? '#0A192F' : '#8892B0'} />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}