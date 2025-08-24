import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Alert } from 'react-native'; // Import Alert from react-native
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Send } from 'lucide-react-native';
import { getMessages, sendMessage, deleteMessage } from '@/services/chatService';
import { Message } from '@/types';

export default function ChatScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id: conversationId } = useLocalSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const data = await getMessages(conversationId as string);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [conversationId])
  );

  const handleSend = async () => {
    if (inputText.trim() && user && conversationId) {
      await sendMessage(conversationId as string, user.id, inputText.trim());
      setInputText('');
      fetchMessages(); // Refetch messages after sending
    }
  };

  const handleDeletePress = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowAlert(true);
  };

  const confirmDelete = async () => {
    if (selectedMessageId) {
      await deleteMessage(selectedMessageId);
      setShowAlert(false);
      setSelectedMessageId(null);
      fetchMessages(); // Refetch messages after deleting
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user_id === user?.id;
    return (
        <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
            <TouchableOpacity onLongPress={() => handleDeletePress(item.id)} style={[
                styles.messageBubble,
                isMe ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface }
            ]}>
                <Text style={{ color: isMe ? '#FFFFFF' : colors.text }}>{item.text}</Text>
            </TouchableOpacity>
        </View>
    );
  };

  if (loading) {
    return <ScreenContainer><ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          inverted // To show latest messages at the bottom
        />
        <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
            <Send color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      
    </ScreenContainer>
  );
}

// STYLES ARE THE SAME AS PREVIOUS RESPONSE
const styles = StyleSheet.create({
    container: { flex: 1 },
    messageList: { paddingHorizontal: 16 },
    messageRow: { flexDirection: 'row', marginVertical: 5 },
    messageBubble: { padding: 12, borderRadius: 18, maxWidth: '80%' },
    inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
    input: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 15, backgroundColor: '#2A2A2A' },
    sendButton: { marginLeft: 10, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});