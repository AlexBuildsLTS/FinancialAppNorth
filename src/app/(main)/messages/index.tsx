/**
 * ============================================================================
 * 💎 NORTHFINANCE: TITAN INBOX (NEW CHAT MODAL ADDED)
 * ============================================================================
 * * FEATURES:
 * - Direct + Group Support
 * - "New Chat" Modal searches all profiles
 * - No more CPA Dashboard redirect
 * ============================================================================
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, StatusBar, Modal, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, Plus, ChevronRight, Search, X } from 'lucide-react-native';
import { formatDistanceToNow, isToday, format } from 'date-fns';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';

// --- TYPES ---
interface InboxItem {
  conversation_id: string;
  type: 'direct' | 'group';
  last_message_at: string | null;
  last_message_preview: string | null;
  other_user_id: string | null;
  other_first_name: string | null;
  other_last_name: string | null;
  other_email: string | null;
  other_avatar_url: string | null;
}

interface UserResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

export default function MessagesInbox() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [inboxData, setInboxData] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // New Chat Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  // --- FETCH INBOX ---
  const fetchInbox = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_user_conversations');
      if (error) throw error;
      const unique = data ? Array.from(new Map(data.map((item: InboxItem) => [item.conversation_id, item])).values()) : [];
      setInboxData(unique as InboxItem[]);
    } catch (e) {
      console.error('Inbox Fetch Error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchInbox(); }, [fetchInbox]));

  // --- SEARCH USERS LOGIC ---
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
        setSearchResults([]);
        return;
    }
    setSearching(true);
    try {
        const { data } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, avatar_url')
            .or(`email.ilike.%${text}%,first_name.ilike.%${text}%,last_name.ilike.%${text}%`)
            .neq('id', user?.id)
            .limit(10);
        
        setSearchResults(data || []);
    } catch (error) {
        console.error(error);
    } finally {
        setSearching(false);
    }
  };

  const startChat = (userId: string) => {
    setIsModalOpen(false);
    router.push({ pathname: '/(main)/messages/[id]', params: { id: userId } });
  };

  // --- RENDER HELPERS ---
  const getDisplayName = (item: InboxItem) => {
    if (item.type === 'group') return 'Group Chat';
    if (item.other_first_name) return `${item.other_first_name} ${item.other_last_name || ''}`.trim();
    return item.other_email || 'Unknown User';
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const renderItem = ({ item }: { item: InboxItem }) => {
    const name = getDisplayName(item);
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/(main)/messages/[id]', params: { id: item.conversation_id } })}
        className="flex-row items-center p-4 bg-[#112240] mb-3 rounded-2xl border border-white/5 shadow-sm"
      >
        <View className="w-14 h-14 rounded-full bg-[#0A192F] items-center justify-center mr-4 border border-white/10 overflow-hidden">
          {item.other_avatar_url ? (
            <Image source={{ uri: item.other_avatar_url }} className="w-full h-full" />
          ) : (
            <Text className="text-[#64FFDA] font-bold text-lg">{getInitials(name)}</Text>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-bold text-white" numberOfLines={1}>{name}</Text>
            {item.last_message_at && (
              <Text className="text-[#8892B0] text-[11px] font-medium">
                {isToday(new Date(item.last_message_at)) ? format(new Date(item.last_message_at), 'h:mm a') : formatDistanceToNow(new Date(item.last_message_at), { addSuffix: false }) + ' ago'}
              </Text>
            )}
          </View>
          <Text className="text-[#8892B0] text-sm" numberOfLines={1}>{item.last_message_preview || 'No messages yet'}</Text>
        </View>
        <ChevronRight size={16} color="#8892B0" className="ml-2 opacity-50" />
      </TouchableOpacity>
    );
  };

  // --- MAIN RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/5 bg-[#0A192F] z-10">
        <View>
          <Text className="text-3xl font-bold tracking-tight text-white">Messages</Text>
          <Text className="text-[#64FFDA] text-xs font-bold tracking-widest uppercase mt-1">Secure Inbox</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setIsModalOpen(true)} 
          className="w-12 h-12 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20"
        >
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={inboxData}
        keyExtractor={(item) => item.conversation_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInbox(); }} tintColor="#64FFDA" />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-60">
            <MessageSquare size={64} color="#8892B0" />
            <Text className="mt-6 text-xl font-bold text-white">No Chats Yet</Text>
            <Text className="text-[#8892B0] text-center mt-2 px-10 leading-6">Tap the + button to start a new secure conversation.</Text>
          </View>
        }
      />

      {/* NEW CHAT MODAL */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalOpen(false)}>
        <View className="flex-1 bg-[#0A192F] pt-6">
            <View className="flex-row items-center justify-between px-6 mb-6">
                <Text className="text-2xl font-bold text-white">New Message</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} className="p-2 rounded-full bg-white/10">
                    <X size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View className="px-6 mb-4">
                <View className="flex-row items-center bg-[#112240] px-4 py-3 rounded-xl border border-white/10">
                    <Search size={18} color="#8892B0" />
                    <TextInput 
                        className="flex-1 ml-3 text-base text-white"
                        placeholder="Search users by name or email..."
                        placeholderTextColor="#8892B0"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                </View>
            </View>

            <FlatList 
                data={searchResults}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => startChat(item.id)} className="flex-row items-center p-4 border-b border-white/5 active:bg-white/5">
                        <View className="w-12 h-12 rounded-full bg-[#64FFDA] items-center justify-center mr-4">
                            {item.avatar_url ? (
                                <Image source={{ uri: item.avatar_url }} className="w-full h-full rounded-full" />
                            ) : (
                                <Text className="text-[#0A192F] font-bold text-lg">{item.first_name?.[0] || item.email[0].toUpperCase()}</Text>
                            )}
                        </View>
                        <View>
                            <Text className="text-base font-bold text-white">{item.first_name ? `${item.first_name} ${item.last_name}` : item.email}</Text>
                            <Text className="text-[#8892B0] text-sm">{item.email}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
      </Modal>
    </SafeAreaView>
  );
}