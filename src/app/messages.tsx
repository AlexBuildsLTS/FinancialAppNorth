import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Search } from 'lucide-react-native';
import { getConversations } from '@/services/chatService';
import { Conversation } from '@/types';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getConversations(user.id);
      setConversations(data);
      setError(null);
    } catch (e) {
      setError('Failed to load conversations.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  // useFocusEffect will refetch data every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [user])
  );

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={[styles.itemContainer, { backgroundColor: colors.surface }]} onPress={() => router.push(`/chat/${item.id}`)}>
      <Image source={{ uri: item.avatar || 'https://example.com/default-avatar.png' }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.metaContainer}>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.timestamp}</Text>
        {item.unread > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
            <TouchableOpacity>
                <Search color={colors.textSecondary} size={24} />
            </TouchableOpacity>
        </View>
        {loading ? (
            <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />
        ) : error ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        ) : (
            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 50 }}>No conversations yet.</Text>}
            />
        )}
    </ScreenContainer>
  );
}

// STYLES ARE THE SAME AS PREVIOUS RESPONSE
const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    title: { fontSize: 32, fontWeight: 'bold' },
    list: { paddingHorizontal: 16 },
    itemContainer: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
    textContainer: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    message: { fontSize: 14, marginTop: 4 },
    metaContainer: { alignItems: 'flex-end' },
    timestamp: { fontSize: 12, marginBottom: 8 },
    unreadBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    unreadText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});