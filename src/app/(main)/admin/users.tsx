
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput, Alert, RefreshControl } from 'react-native';
import { Search, MoreVertical, Shield, Ban, Trash2 } from 'lucide-react-native';
import { User } from '../../../types';

// Temporary placeholder for getUsers to resolve compilation errors.
// This function should eventually be properly implemented and exported from '../../../services/dataService'.
const getUsers = async (): Promise<User[]> => {
  console.warn(`[Temporary Placeholder] getUsers called.
  Please implement this function in dataService.ts and then remove this placeholder.`);
  return Promise.resolve([]); // Simulate an async operation returning an empty array
};

// Temporary placeholder for updateUserStatus to resolve compilation errors.
// This function should eventually be properly implemented and exported from '../../../services/dataService'.
const updateUserStatus = async (userId: string, newStatus: string): Promise<void> => {
  console.warn(`[Temporary Placeholder] updateUserStatus called for userId: ${userId}, status: ${newStatus}.
  Please implement this function in dataService.ts and then remove this placeholder.`);
  return Promise.resolve(); // Simulate an async operation
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    setRefreshing(true);
    try {
        const data = await getUsers();
        setUsers(data);
    } catch (e) {
        Alert.alert("Error", "Failed to fetch users");
    } finally {
        setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBan = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    try {
        await updateUserStatus(userId, newStatus);
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
    } catch (e) {
        Alert.alert("Error", "Failed to update user status");
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View className="flex-row items-center justify-between p-4 bg-[#112240] border-b border-white/5 mb-1">
      <View className="flex-row items-center gap-4 flex-1">
        <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Text className="text-white font-bold">{item.name.charAt(0)}</Text>
        </View>
        <View>
          <Text className={`font-bold ${item.status === 'banned' ? 'text-red-400 line-through' : 'text-white'}`}>
            {item.name}
          </Text>
          <Text className="text-[#8892B0] text-xs">{item.email}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="bg-white/5 px-2 py-1 rounded">
            <Text className="text-[#64FFDA] text-xs font-bold uppercase">{item.role}</Text>
        </View>
        <TouchableOpacity onPress={() => handleBan(item.id, item.status)}>
            <Ban size={20} color={item.status === 'banned' ? '#64FFDA' : '#F87171'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="p-4">
        <Text className="text-3xl font-bold text-white mb-4">User Management</Text>
        <View className="bg-[#112240] flex-row items-center px-4 py-3 rounded-xl border border-white/10">
            <Search size={20} color="#8892B0" />
            <TextInput 
                className="flex-1 text-white ml-3"
                placeholder="Search users..."
                placeholderTextColor="#475569"
                value={search}
                onChangeText={setSearch}
            />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsers} tintColor="#64FFDA" />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
