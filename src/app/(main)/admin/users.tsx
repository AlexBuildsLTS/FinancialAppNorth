import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, Modal, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Ban, Trash2, Check, X, User as UserIcon, Mail, MoreVertical, Shield } from 'lucide-react-native';
import { User, UserRole } from '../../../types';
import { getAllUsers, updateUserStatus, updateUserRole, deleteUser } from '../../../services/dataService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadUsers = async () => {
    setRefreshing(true);
    try {
        const data = await getAllUsers();
        setUsers(data);
    } catch (e: any) {
        Alert.alert("Error", e.message);
    } finally {
        setRefreshing(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleBan = async (user: User) => {
    Alert.alert('Confirm Ban', `Deactivate ${user.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: async () => {
            try { await updateUserStatus(user.id, 'banned'); loadUsers(); } catch(e: any) { Alert.alert("Error", e.message); }
        }}
    ]);
  };

  const handleDelete = async (user: User) => {
    Alert.alert('Delete User', `Permanently delete ${user.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try { await deleteUser(user.id); loadUsers(); } catch(e: any) { Alert.alert("Error", e.message); }
        }}
    ]);
  };

  const handleMessage = (user: User) => {
    // Navigate to private chat with this user
    router.push(`/(main)/messages/${user.id}`);
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
        await updateUserRole(selectedUser.id, newRole);
        setShowRoleModal(false); setSelectedUser(null); loadUsers();
    } catch (e: any) { Alert.alert("Error", e.message); } finally { setProcessing(false); }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View className="flex-row items-center justify-between p-4 bg-[#112240] border-b border-[#233554] mb-2 rounded-xl mx-4 shadow-sm">
      {/* Left: Avatar & Info */}
      <View className="flex-row items-center gap-4 flex-1">
        <View className="w-12 h-12 bg-[#64FFDA]/10 rounded-full items-center justify-center overflow-hidden border border-[#233554]">
          {item.avatar ? (
            <Image source={{uri: item.avatar}} className="w-full h-full" />
          ) : (
            <UserIcon size={24} color="#64FFDA" />
          )}
        </View>
        <View>
          <Text className="font-bold text-white text-base">{item.name}</Text>
          <Text className="text-[#8892B0] text-xs">{item.email}</Text>
          <View className="flex-row mt-1">
             <View className={`px-2 py-0.5 rounded-md ${item.status === 'banned' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                <Text className={`text-[10px] uppercase font-bold ${item.status === 'banned' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {item.status}
                </Text>
             </View>
          </View>
        </View>
      </View>

      {/* Right: Actions */}
      <View className="flex-row items-center gap-2">
        {/* Role Badge (Click to Edit) */}
        <TouchableOpacity 
            onPress={() => { setSelectedUser(item); setShowRoleModal(true); }}
            className="bg-[#0A192F] px-3 py-2 rounded-lg border border-[#233554] mr-2"
        >
            <Text className="text-[#64FFDA] text-xs font-bold uppercase">{item.role}</Text>
        </TouchableOpacity>
        
        {/* Message */}
        <TouchableOpacity onPress={() => handleMessage(item)} className="p-2 bg-[#233554] rounded-full">
            <Mail size={18} color="#E6F1FF" />
        </TouchableOpacity>

        {/* Ban */}
        <TouchableOpacity onPress={() => handleBan(item)} className="p-2 bg-[#233554] rounded-full">
            <Ban size={18} color="#F87171" />
        </TouchableOpacity>
        
        {/* Delete */}
        <TouchableOpacity onPress={() => handleDelete(item)} className="p-2 bg-red-500/10 rounded-full border border-red-500/20">
            <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      {/* Header */}
      <View className="p-6 border-b border-[#233554] mb-4 bg-[#0A192F]">
        <Text className="text-3xl font-bold text-white mb-4">User Management</Text>
        <View className="bg-[#112240] flex-row items-center px-4 py-3 rounded-xl border border-[#233554]">
            <Search size={20} color="#8892B0" />
            <TextInput 
                className="flex-1 text-white ml-3 font-medium" 
                placeholder="Search users by name or email..." 
                placeholderTextColor="#475569" 
                value={search} 
                onChangeText={setSearch} 
            />
        </View>
      </View>

      {/* List */}
      <FlatList 
        data={users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))} 
        renderItem={renderUser} 
        keyExtractor={item => item.id} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsers} tintColor="#64FFDA" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      
      {/* Role Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
            <View className="bg-[#112240] w-full max-w-sm rounded-2xl border border-[#233554] p-6 shadow-xl">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-xl font-bold">Change Role</Text>
                    <TouchableOpacity onPress={() => setShowRoleModal(false)}><X size={24} color="#8892B0" /></TouchableOpacity>
                </View>
                {[UserRole.MEMBER, UserRole.PREMIUM, UserRole.CPA, UserRole.SUPPORT, UserRole.ADMIN].map((role) => (
                    <TouchableOpacity key={role} onPress={() => handleChangeRole(role)} className="py-4 border-b border-[#233554] flex-row justify-between items-center active:bg-[#0A192F]">
                        <Text className="text-white uppercase font-bold ml-2">{role}</Text>
                        {selectedUser?.role === role && <Check size={20} color="#64FFDA" />}
                    </TouchableOpacity>
                ))}
                {processing && <ActivityIndicator className="mt-4" color="#64FFDA" />}
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}