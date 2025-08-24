import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { getConversations } from '@/services/chatService';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/types'; // Assuming Conversation type is available

interface ChannelItemProps {
  channel: Conversation;
  currentUser: { id: string } | null;
  onPress: () => void;
}

const ChannelItem = ({ channel, currentUser, onPress }: ChannelItemProps) => {
  const { colors } = useTheme();
  // In the current chatService, the 'name' and 'avatar' are already processed for the other participant.
  // So we can directly use channel.name and channel.avatar.
  const displayName = channel.name || 'Chat';
  const avatarUrl = channel.avatar || 'https://i.pravatar.cc/150';

  return (
    <TouchableOpacity onPress={onPress} style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={[styles.channelName, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
          {channel.lastMessage || 'No new messages'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [channels, setChannels] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadChannels = async () => {
      try {
        if (user?.id) {
          const data = await getConversations(user.id);
          setChannels(data);
        }
      } catch (error) {
        console.error("Failed to load channels", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        loadChannels();
    }
  }, [user]);
  
  const handleChannelPress = (channelId: string) => { // channelId should be string based on Conversation type
      router.push(`/chat/${channelId}` as any);
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
            <ChannelItem channel={item} currentUser={user} onPress={() => handleChannelPress(item.id)} />
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, {color: colors.textSecondary}]}>You have no conversations.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontFamily: 'Inter-Bold', padding: 16 },
  itemContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  textContainer: { flex: 1, justifyContent: 'center' },
  channelName: { fontSize: 16, fontFamily: 'Inter-Bold' },
  lastMessage: { fontSize: 14, fontFamily: 'Inter-Regular', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});
