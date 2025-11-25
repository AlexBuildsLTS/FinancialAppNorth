import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageSquare, User } from 'lucide-react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { getConversations } from '@/services/dataService';

export default function MessagesListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      try {
      const data = await getConversations(user.id);
      setConversations(data);
      } catch (e) {
      console.error(e);
      } finally {
      setLoading(false);
      }
    };
    fetchChats();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="p-6 border-b border-[#233554]">
        <Text className="text-white text-2xl font-bold">Messages</Text>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#64FFDA" />
        </View>
      ) : (
        <FlatList 
            data={conversations}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 24 }}
            ListEmptyComponent={<Text className="text-[#8892B0] text-center mt-10">No users found to chat with.</Text>}
            renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => router.push(`/(main)/messages/${item.id}`)}
                className="flex-row items-center p-4 bg-[#112240] rounded-xl border border-[#233554] mb-3"
            >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.role === 'support' ? 'bg-[#64FFDA]/10' : 'bg-[#F472B6]/10'}`}>
                {item.role === 'support' ? <MessageSquare size={20} color="#64FFDA" /> : <User size={20} color="#F472B6" />}
                </View>
                <View className="flex-1">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-white font-bold text-base">{item.name}</Text>
                    <Text className="text-[#8892B0] text-xs uppercase">{item.role}</Text>
                </View>
                <Text className="text-[#8892B0] text-sm" numberOfLines={1}>{item.lastMessage}</Text>
                </View>
            </TouchableOpacity>
            )}
        />
      )}
    </SafeAreaView>
  );
}