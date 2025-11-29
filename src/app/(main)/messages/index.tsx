import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getConversations } from '../../../services/dataService';


export default function MessagesListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadChats = async () => {
    if (!user) return;
    try {
      // This fetches all potential contacts
      const data = await getConversations(user.id);
      setConversations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadChats(); }, [user]));

  const filtered = conversations.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="px-6 py-4 border-b border-white/5">
        <Text className="text-white text-3xl font-bold mb-4">Messages</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-[#112240] px-4 py-3 rounded-xl border border-white/10">
            <Search size={20} color="#8892B0" />
            <TextInput 
                className="flex-1 ml-3 text-white text-base"
                placeholder="Search contacts..."
                placeholderTextColor="#475569"
                value={search}
                onChangeText={setSearch}
            />
        </View>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#64FFDA" />
        </View>
      ) : (
        <FlatList 
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20 }}
            ListEmptyComponent={
                <View className="items-center py-10">
                    <MessageSquare size={40} color="#112240" />
                    <Text className="text-[#8892B0] mt-4">No contacts found.</Text>
                </View>
            }
            renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => router.push(`/(main)/messages/${item.id}`)}
                className="flex-row items-center p-4 bg-[#112240] rounded-2xl border border-white/5 mb-3 active:bg-white/5"
            >
                {/* Avatar */}
                <View className="w-12 h-12 rounded-full bg-[#0A192F] border border-white/10 items-center justify-center overflow-hidden mr-4">
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} className="w-full h-full" />
                    ) : (
                        <Text className="text-[#64FFDA] font-bold text-lg">{item.name[0]}</Text>
                    )}
                </View>

                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-white font-bold text-base">{item.name}</Text>
                        <View className={`px-2 py-0.5 rounded bg-[#0A192F] border border-white/5`}>
                            <Text className="text-[#8892B0] text-[10px] uppercase">{item.role}</Text>
                        </View>
                    </View>
                    <Text className="text-[#8892B0] text-sm" numberOfLines={1}>
                        Tap to start conversation
                    </Text>
                </View>
            </TouchableOpacity>
            )}
        />
      )}
    </SafeAreaView>
  );
}