import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import { Avatar } from '@/components/common/Avatar'; // use named import
import { getConversations } from '@/services/chatService';
import { Conversation } from '@/types';
import { AlertCircle } from 'lucide-react-native';

const ConversationItem = ({ item }: { item: Conversation }) => {
    const { colors } = useTheme();
    const router = useRouter();
    return (
        <Pressable
            style={({ pressed }) => [styles.itemContainer, { backgroundColor: pressed ? colors.border : 'transparent', borderBottomColor: colors.border }]}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <Avatar url={item.avatar_url} size={50} />
            <View style={styles.textContainer}>
                <View style={styles.row}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>{item.lastMessage}</Text>
                    {item.unread > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.unreadText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export default function ChatLobbyScreen() {
    const { colors } = useTheme();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const result = await getConversations();
            if ((result as any).error) {
                setError(String((result as any).error?.message ?? (result as any).error));
                setConversations([]);
            } else {
                setConversations((result as any).conversations ?? []);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
    }

    if (error) {
        return <View style={styles.centered}><AlertCircle color={colors.error} size={40} /><Text style={[styles.errorText, {color: colors.error}]}>{error}</Text></View>
    }

    return (
        <ScreenContainer>
            <FlatList
                data={conversations}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <ConversationItem item={item} />}
                ListEmptyComponent={<View style={styles.centered}><Text style={{color: colors.textSecondary}}>No conversations yet.</Text></View>}
                style={{ backgroundColor: colors.background }}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { marginTop: 16, fontSize: 16, textAlign: 'center' },
    itemContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, alignItems: 'center' },
    textContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: 'bold' },
    timestamp: { fontSize: 12 },
    lastMessage: { fontSize: 14, flex: 1, paddingTop: 4, marginRight: 10 },
    unreadBadge: {
        minWidth: 22, height: 22, borderRadius: 11,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 6, marginLeft: 8,
    },
    unreadText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});