import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { fetchChannelMessages, sendMessage } from '@/services/chatService';
import { Send } from 'lucide-react-native';

const MessageItem = ({ message, isCurrentUser, colors }: any) => {
  const bubbleStyle = isCurrentUser
    ? styles.currentUserBubble
    : styles.otherUserBubble;
  const textStyle = isCurrentUser
    ? styles.currentUserText
    : styles.otherUserText;
  const bubbleBackgroundColor = isCurrentUser ? colors.primary : colors.surface;

  return (
    <View style={[styles.bubbleContainer, bubbleStyle]}>
      <View style={[styles.bubble, { backgroundColor: bubbleBackgroundColor }]}>
        <Text style={textStyle}>{message.content}</Text>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id: channelId } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!channelId) return;
    try {
      const data = await fetchChannelMessages(parseInt(channelId));
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    loadMessages();

    // Listen for new messages in real-time
    const channel = supabase
      .channel(`public:messages:channel_id=eq.${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Manually fetch the new message with the profile data
          const fetchNewMessage = async () => {
            const { data } = await supabase
              .from('messages')
              .select(`*, profile:profiles(*)`)
              .eq('id', payload.new.id)
              .single();
            if (data) {
              setMessages((currentMessages) => [...currentMessages, data]);
            }
          };
          fetchNewMessage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !channelId) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage(parseInt(channelId), content, user.id);
    } catch (error) {
      console.error('Failed to send message', error);
      setNewMessage(content); // Restore message on failure
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={colors.primary}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            isCurrentUser={item.profile.id === user?.id}
            colors={colors}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 10 },
  bubbleContainer: { flexDirection: 'row', marginBottom: 10 },
  currentUserBubble: { justifyContent: 'flex-end' },
  otherUserBubble: { justifyContent: 'flex-start' },
  bubble: { borderRadius: 20, padding: 12, maxWidth: '80%' },
  currentUserText: { color: '#fff' },
  otherUserText: { color: '#000' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
