import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { Search, MoreVertical, Ban, Trash2, Shield, Check, X } from 'lucide-react-native';
import { User, UserRole } from '../../../types';
import { getUsers, updateUserStatus, updateUserRole, removeUser } from '../../../services/dataService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadUsers = async () => {
    setRefreshing(true);
    try {
        const data = await getUsers();
        setUsers(data);
    } catch (e: any) {
        Alert.alert("Error", e.message);
    } finally {
        setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBan = async (user: User) => {
    Alert.alert('Confirm Ban', `Are you sure you want to deactivate ${user.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { 
            text: 'Deactivate', 
            style: 'destructive', 
            onPress: async () => {
                try {
                    await updateUserStatus(user.id, 'banned');
                    loadUsers();
                    Alert.alert("Success", "User deactivated");
                } catch(e: any) {
                    Alert.alert("Error", e.message);
                }
            }
        }
    ]);
  };

  const handleDelete = async (user: User) => {
    Alert.alert('Delete User', `This action cannot be undone. Delete ${user.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: async () => {
                try {
                    await removeUser(user.id);
                    loadUsers();
                } catch(e: any) {
                    Alert.alert("Error", e.message);
                }
            }
        }
    ]);
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
        await updateUserRole(selectedUser.id, newRole);
        setShowRoleModal(false);
        setSelectedUser(null);
        loadUsers();
        Alert.alert("Success", "Role updated");
    } catch (e: any) {
        Alert.alert("Error", e.message);
    } finally {
        setProcessing(false);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View className="flex-row items-center justify-between p-4 bg-[#112240] border-b border-white/5 mb-1">
      <View className="flex-row items-center gap-4 flex-1">
        <View className="w-10 h-10 bg-[#64FFDA]/10 rounded-full items-center justify-center">
            <Text className="text-[#64FFDA] font-bold">{item.name?.charAt(0) || 'U'}</Text>
        </View>
        <View>
          <Text className="font-bold text-white">{item.name}</Text>
          <Text className="text-[#8892B0] text-xs">{item.email}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
            onPress={() => { setSelectedUser(item); setShowRoleModal(true); }}
            className="bg-white/5 px-3 py-1 rounded border border-white/10"
        >
            <Text className="text-[#64FFDA] text-xs font-bold uppercase">{item.role}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => handleBan(item)}>
            <Ban size={20} color="#F87171" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => handleDelete(item)}>
            <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="p-4 border-b border-white/5">
        <Text className="text-2xl font-bold text-white mb-4">User Management</Text>
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

      {/* Role Change Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
            <View className="bg-[#112240] w-full max-w-sm rounded-2xl border border-white/10 p-6">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-xl font-bold">Change Role</Text>
                    <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                        <X size={24} color="#8892B0" />
                    </TouchableOpacity>
                </View>
                
                {[UserRole.MEMBER, UserRole.PREMIUM, UserRole.CPA, UserRole.SUPPORT, UserRole.ADMIN].map((role) => (
                    <TouchableOpacity 
                        key={role}
                        onPress={() => handleChangeRole(role)}
                        className="py-4 border-b border-white/5 flex-row justify-between"
                    >
                        <Text className="text-white uppercase font-bold">{role}</Text>
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