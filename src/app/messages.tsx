import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Search, Download } from 'lucide-react-native';
import { getConversations } from '@/services/chatService';
import { Conversation } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      // CALL SERVICE WITH NO ARGS (service may return array or { conversations: [...] })
      const data = await getConversations();
      const rawList: any[] = Array.isArray(data) ? data : (data?.conversations ?? []);
      // Optionally filter to only conversations relevant to current user (defensive)
      const filtered = rawList.filter(c => {
        // conversation can have participants array or owner id; be permissive
        if (!c) return false;
        if (!c.participants) return true;
        return c.participants.includes(session.user.id) || c.owner_id === session.user.id;
      });
      setConversations(filtered as Conversation[]);
      setError(null);
    } catch (e) {
      setError('Failed to load conversations.');
      console.error(e);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // refetch when screen focused
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const exportConversationsCSV = async () => {
    try {
      if (!conversations || conversations.length === 0) return;
      const header = ['id','name','lastMessage','timestamp','unread'];
      const rows = conversations.map(c => {
        const asAny = c as any;
        return ([
          `"${asAny.id ?? ''}"`,
          `"${(asAny.name ?? asAny.title ?? '').replace(/"/g, '""')}"`,
          `"${(asAny.lastMessage ?? '').replace(/"/g, '""')}"`,
          `"${asAny.timestamp ?? ''}"`,
          `${asAny.unread ?? 0}`,
        ].join(','));
      });
      const csv = [header.join(','), ...rows].join('\n');
      const filename = `conversations_export_${new Date().toISOString().slice(0,10)}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri);
      } else {
        // fallback: open file location on platforms that don't support Sharing (rare)
        console.warn('Sharing not available on this platform. File saved to ', fileUri);
      }
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const avatarUrl = (item as any).avatar_url ?? (item as any).participant_avatar_url ?? null;

    return (
      <TouchableOpacity style={[styles.itemContainer, { backgroundColor: colors.surface }]} onPress={() => router.push(`/chat/${item.id}`)}>
        <Image source={{ uri: avatarUrl || 'https://example.com/default-avatar.png' }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{(item as any).name ?? (item as any).title ?? 'Conversation'}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={1}>{(item as any).lastMessage ?? ''}</Text>
        </View>
        <View style={styles.metaContainer}>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{(item as any).timestamp ?? ''}</Text>
          {Number((item as any).unread ?? 0) > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{(item as any).unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => {/* optional search action */}}>
                  <Search color={colors.textSecondary} size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={exportConversationsCSV}>
                  <Download color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
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
