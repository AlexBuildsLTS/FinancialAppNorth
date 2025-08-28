// src/app/chat/[id].tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Send, Trash2 } from 'lucide-react-native';
import { getMessages, sendMessage, deleteMessage } from '@/services/chatService';
import { Message } from '@/types';
import { supabase } from '@/lib/supabase';

export default function ChatScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const { id: conversationId } = useLocalSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  
  // State for the custom delete confirmation modal
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = useCallback(async () => {
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
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();

    // *** UPGRADE: Subscribe to real-time messages ***
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${conversationId}` 
        },
        (payload) => {
          // Refetch messages when any change occurs in this conversation
          fetchMessages();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  const handleSend = async () => {
    if (inputText.trim() && session?.user && conversationId) {
      await sendMessage(conversationId as string, session.user.id, inputText.trim());
      setInputText('');
      // No need to manually refetch, the realtime subscription will handle it
    }
  };

  const handleDeletePress = (message: Message) => {
    // Only allow deleting your own messages
    if (message.user_id === session?.user?.id) {
        setSelectedMessage(message);
        setDeleteModalVisible(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedMessage) {
      await deleteMessage(selectedMessage.id);
      setDeleteModalVisible(false);
      setSelectedMessage(null);
      // Realtime subscription will update the UI
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user_id === session?.user?.id;
    return (
        <View style={[styles.messageRow, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
            <TouchableOpacity onLongPress={() => handleDeletePress(item)} style={[
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
          inverted
        />
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
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

      {/* *** UPGRADE: Custom Confirmation Modal instead of Alert *** */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Message</Text>
                <Text style={[styles.modalText, { color: colors.textSecondary }]}>Are you sure you want to permanently delete this message?</Text>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalButton} onPress={() => setDeleteModalVisible(false)}>
                        <Text style={{ color: colors.text, fontWeight: '500' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={confirmDelete}>
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    messageList: { paddingHorizontal: 16 },
    messageRow: { flexDirection: 'row', marginVertical: 5 },
    messageBubble: { padding: 12, borderRadius: 18, maxWidth: '80%' },
    inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1 },
    input: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 15 },
    sendButton: { marginLeft: 10, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { width: '85%', padding: 20, borderRadius: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    modalText: { fontSize: 16, marginBottom: 20, lineHeight: 22 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    deleteButton: { backgroundColor: '#E53E3E', marginLeft: 10 },
});