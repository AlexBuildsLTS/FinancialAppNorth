import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send, Lock, Paperclip, Smile } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  getOrCreateConversation, 
  sendMessage, 
  subscribeToChat, 
  getConversationMessages, 
  getUserDetails 
} from '../../../services/dataService';
import { encryptMessage, decryptMessage } from '../../../lib/crypto';
import { Message } from '../../../types'; // Ensure this type exists in your types.ts

/**
 * Chat Screen Component
 * Handles real-time encrypted messaging between two users.
 */
export default function ChatScreen() {
  // --- Navigation Params ---
  const { id } = useLocalSearchParams(); 
  const targetUserId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  
  // --- Context ---
  const { user } = useAuth();

  // --- State ---
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // Typed messages
  const [input, setInput] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null); // Ideally Typed User
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // --- Refs ---
  const flatListRef = useRef<FlatList>(null);

  /**
   * Initialize Chat Session
   * Fetches target user details and loads conversation history.
   */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
        if (!user || !targetUserId) return;

        try {
            // 1. Fetch User Details
            const userDetails = await getUserDetails(targetUserId);
            if (mounted) setTargetUser(userDetails);

            // 2. Get/Create Conversation
            const convId = await getOrCreateConversation(user.id, targetUserId);
            if (mounted) setConversationId(convId);

            // 3. Load History
            const history = await getConversationMessages(convId);
            if (mounted) {
                setMessages(history);
                setLoading(false);
            }

            // 4. Realtime Subscription
            const subscription = subscribeToChat(convId, (newMsg) => {
                // Only add if it's from the other person (we add ours optimistically)
                if (newMsg.sender_id !== user.id) {
                    setMessages(prev => {
                        // Prevent duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                }
            });

            return () => { subscription.unsubscribe(); };

        } catch (e) {
            console.error("Chat Init Error:", e);
            if (mounted) setLoading(false);
            Alert.alert("Error", "Failed to load chat conversation.");
        }
    };

    const cleanup = init();
    return () => { mounted = false; };
  }, [user, targetUserId]);

  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
      if (messages.length > 0) {
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
  }, [messages]);

  /**
   * Handle Sending Messages
   * Encrypts content, updates UI optimistically, then saves to DB.
   */
  const handleSend = async () => {
      if (!input.trim() || !conversationId || !user) return;

      const textToSend = input.trim();
      setInput(''); // Clear input immediately
      setSending(true);

      // Encrypt
      let encryptedContent: string;
      try {
        encryptedContent = encryptMessage(textToSend);
      } catch (cryptoError) {
        console.error("Encryption Failed:", cryptoError);
        Alert.alert("Security Error", "Failed to encrypt message. Not sent.");
        setSending(false);
        return;
      }

      // Optimistic ID
      const tempId = `temp-${Date.now()}`;
      
      // Add to List (Optimistic UI)
      const newMessage: Message = {
          id: tempId,
          conversation_id: conversationId,
          sender_id: user.id,
          content_encrypted: encryptedContent,
          created_at: new Date().toISOString(),
          is_system_message: false,
          read_by: [],
          iv: '' // Assuming IV is handled inside encryptMessage or packed string
      } as Message;

      setMessages(prev => [...prev, newMessage]);

      try {
          // Send to DB
          await sendMessage(conversationId, user.id, encryptedContent);
      } catch (e) {
          console.error("Send Failed:", e);
          Alert.alert("Delivery Failed", "Message could not be sent. Check connection.");
          
          // Rollback Optimistic Update
          setMessages(prev => prev.filter(m => m.id !== tempId));
          setInput(textToSend); // Restore text so user can try again
      } finally {
          setSending(false);
      }
  };

  const handleEmojiSelect = (emoji: string) => {
      setInput(prev => prev + emoji);
      setShowEmoji(false);
  };

  const handleAttachFile = async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({
              type: ['image/*', 'application/pdf', 'text/*'],
              copyToCacheDirectory: true
          });

          if (result.canceled) return;

          const asset = result.assets[0];
          // For now, just add a message with file name
          // In full implementation, upload to storage and send link
          setInput(prev => prev + `[File: ${asset.name}]`);
      } catch (error) {
          Alert.alert('Error', 'Failed to attach file');
      }
  };

  const handleAttachImage = async () => {
      try {
          const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8
          });

          if (result.canceled) return;

          const asset = result.assets[0];
          // For now, just add a message with image name
          setInput(prev => prev + `[Image: ${asset.fileName || 'image'}]`);
      } catch (error) {
          Alert.alert('Error', 'Failed to attach image');
      }
  };

  // --- Render Loading State ---
  if (loading) {
      return (
        <View className="flex-1 bg-[#0A192F] justify-center items-center">
            <ActivityIndicator size="large" color="#64FFDA"/>
        </View>
      );
  }

  // --- Render Main Chat ---
  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      
      {/* Header Bar */}
      <View className="flex-row items-center p-4 border-b border-white/5 bg-[#112240] shadow-sm">
        <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-3 p-1 rounded-full active:bg-white/10"
        >
            <ArrowLeft size={24} color="#8892B0" />
        </TouchableOpacity>
        
        {/* Target Avatar */}
        <View className="w-10 h-10 rounded-full bg-[#0A192F] overflow-hidden border border-white/10 mr-3 justify-center items-center">
            {targetUser?.avatar_url ? (
                <Image source={{ uri: targetUser.avatar_url }} className="w-full h-full" />
            ) : (
                <Text className="text-[#64FFDA] font-bold text-lg">
                    {targetUser?.first_name?.[0] || targetUser?.email?.[0] || '?'}
                </Text>
            )}
        </View>
        
        {/* Target Name & Status */}
        <View>
            <Text className="text-white font-bold text-lg">
                {targetUser?.first_name ? `${targetUser.first_name} ${targetUser.last_name || ''}` : 'Unknown User'}
            </Text>
            <View className="flex-row items-center opacity-70">
                <Lock size={12} color="#64FFDA" />
                <Text className="text-[#64FFDA] text-xs ml-1 font-medium">End-to-End Encrypted</Text>
            </View>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id;
            let decryptedText = "Message Unavailable";
            
            try {
                decryptedText = decryptMessage(item.content_encrypted);
            } catch (err) {
                console.warn(`Decryption failed for msg ${item.id}`);
            }
            
            return (
                <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <View 
                        className={`max-w-[80%] p-3 rounded-2xl shadow-sm
                        ${isMe 
                            ? 'bg-[#64FFDA] rounded-tr-sm' 
                            : 'bg-[#112240] border border-white/10 rounded-tl-sm'
                        }`}
                    >
                        <Text className={`text-base ${isMe ? 'text-[#0A192F] font-medium' : 'text-white'}`}>
                            {decryptedText}
                        </Text>
                        <Text 
                            className={`text-[10px] mt-1 text-right 
                            ${isMe ? 'text-[#0A192F]/60' : 'text-gray-400'}`}
                        >
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            );
        }}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Emoji Picker */}
        {showEmoji && (
            <View className="bg-[#112240] border-t border-white/5 p-3">
                <View className="flex-row flex-wrap gap-2">
                    {['😀', '😂', '❤️', '👍', '🔥', '👋', '🙏', '🎉', '💯', '🚀'].map(emoji => (
                        <TouchableOpacity
                            key={emoji}
                            onPress={() => handleEmojiSelect(emoji)}
                            className="w-10 h-10 items-center justify-center rounded-lg bg-[#0A192F] border border-white/5"
                        >
                            <Text className="text-xl">{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        )}

        <View className="p-3 bg-[#112240] border-t border-white/5 flex-row items-end gap-2 pb-6">
            {/* Attach Buttons */}
            <View className="flex-row gap-1 mb-1">
                <TouchableOpacity
                    onPress={() => setShowEmoji(!showEmoji)}
                    className="p-2 rounded-full bg-white/5"
                >
                    <Smile size={18} color="#8892B0" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleAttachFile}
                    className="p-2 rounded-full bg-white/5"
                >
                    <Paperclip size={18} color="#8892B0" />
                </TouchableOpacity>
            </View>

            <TextInput
                className="flex-1 bg-[#0A192F] text-white p-3 rounded-xl border border-white/10 max-h-32 min-h-[48px]"
                placeholder="Type a secure message..."
                placeholderTextColor="#8892B0"
                value={input}
                onChangeText={setInput}
                multiline
                textAlignVertical="center"
            />
            <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim() || sending}
                className={`p-3 rounded-full mb-1 items-center justify-center
                    ${input.trim() ? 'bg-[#64FFDA]' : 'bg-white/5'}`}
            >
                {sending ? (
                    <ActivityIndicator size="small" color="#0A192F" />
                ) : (
                    <Send size={20} color={input.trim() ? '#0A192F' : '#8892B0'} />
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}