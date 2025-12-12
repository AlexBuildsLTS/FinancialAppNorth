import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  TextInput,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, MessageSquare, Plus } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getConversations } from '../../../services/dataService';

/**
 * Message Inbox Component
 * Displays a list of active conversations.
 */
export default function MessagesListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // --- State ---
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  /**
   * Fetch Chats
   */
  const loadChats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getConversations(user.id);
      // Sort: Unread conversations first
      const sorted = (data || []).sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));
      setConversations(sorted); // Ensure array
    } catch (e) {
      console.error("Load Chats Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  /**
   * Refresh Handler (Pull-to-Refresh)
   */
  const onRefresh = useCallback(() => {
      setRefreshing(true);
      loadChats();
  }, [loadChats]);

  // Load when screen focuses
  useFocusEffect(useCallback(() => { 
      loadChats(); 
  }, [loadChats]));

  // Filter local results
  const filtered = conversations.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      
      {/* Header Section */}
      <View className="px-6 py-4 border-b border-white/5 bg-[#0A192F]">
        <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-3xl font-bold">Messages</Text>
            {/* New Chat Button */}
            <TouchableOpacity 
                onPress={() => router.push('/(main)/find-cpa')} // Or a contact list
                className="w-10 h-10 bg-[#112240] rounded-full items-center justify-center border border-white/10 active:bg-white/10"
            >
                <Plus size={24} color="#64FFDA" />
            </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-[#112240] px-4 py-3 rounded-xl border border-white/10">
            <Search size={20} color="#8892B0" />
            <TextInput 
                className="flex-1 ml-3 text-white text-base h-full"
                placeholder="Search contacts..."
                placeholderTextColor="#475569"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
            />
        </View>
      </View>
      
      {/* List Section */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#64FFDA" />
        </View>
      ) : (
        <FlatList 
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />
            }
            ListEmptyComponent={
                <View className="items-center justify-center py-20 opacity-60">
                    <MessageSquare size={48} color="#112240" />
                    <Text className="text-[#8892B0] mt-4 font-medium">No messages yet.</Text>
                    <Text className="text-[#8892B0] text-xs mt-1">Start a conversation with a CPA.</Text>
                </View>
            }
            renderItem={({ item }) => (
                <TouchableOpacity 
                    onPress={() => router.push(`/(main)/messages/${item.id}`)}
                    className="flex-row items-center p-4 bg-[#112240] rounded-2xl border border-white/5 mb-3 active:border-[#64FFDA]/30"
                >
                    {/* Avatar */}
                    <View className="w-12 h-12 rounded-full bg-[#0A192F] border border-white/10 items-center justify-center overflow-hidden mr-4">
                        {item.avatar ? (
                            <Image source={{ uri: item.avatar }} className="w-full h-full" />
                        ) : (
                            <Text className="text-[#64FFDA] font-bold text-xl">
                                {item.name?.[0]?.toUpperCase() || '?'}
                            </Text>
                        )}
                    </View>

                    {/* Text Content */}
                    <View className="flex-1 justify-center">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-white font-bold text-base">{item.name}</Text>
                            {/* RED DOT BADGE */}
                            {item.unreadCount > 0 && (
                                <View className="bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                                    <Text className="text-white text-[10px] font-bold">{item.unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text className={`text-sm mr-2 ${item.unreadCount > 0 ? 'text-white font-bold' : 'text-[#8892B0]'}`} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
      )}
    </SafeAreaView>
  );
}