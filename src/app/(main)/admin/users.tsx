import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Image,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Search, Ban, CheckCircle, MessageSquare, Mail, Shield, Briefcase, X, UserCog, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase, adminDeactivateUser, adminChangeUserRole } from '../../../lib/supabase';
import { User, UserRole, UserStatus } from '../../../types'; // Imported strict types

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Role Modal State
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 1. Fetch Real Users
  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedUsers: User[] = (data || []).map((p: any) => ({
        id: p.id,
        email: p.email || 'No Email',
        name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown',
        // Fix: Cast string to UserRole Enum, default to MEMBER if invalid
        role: (Object.values(UserRole).includes(p.role) ? p.role : UserRole.MEMBER) as UserRole,
        status: (p.status || 'active') as UserStatus,
        avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/png?seed=${p.id}`,
      }));

      setUsers(formattedUsers);
    } catch (e: any) {
      console.error('Fetch error:', e);
      Alert.alert("Error", "Failed to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 2. Action Handlers
  const handleMessage = (userId: string) => {
    // Fix: Ensure the path matches your file structure exactly
    router.push(`/(main)/messages/${userId}` as any);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setRoleModalVisible(true);
  };

  // Fix: Argument must be UserRole, not string
  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!selectedUser) return;
    
    const originalRole = selectedUser.role;
    
    // Optimistic Update with strict typing
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id ? { ...u, role: newRole } : u
    ));
    
    setRoleModalVisible(false);

    try {
      await adminChangeUserRole(selectedUser.id, newRole);
      Alert.alert("Success", `User role updated to ${newRole.toUpperCase()}`);
    } catch (error: any) {
      // Revert if failed
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, role: originalRole } : u
      ));
      Alert.alert("Error", "Failed to update role: " + error.message);
    } finally {
      setSelectedUser(null);
    }
  };

  const handleBanToggle = async (user: User) => {
    if (actionLoading) return;
    
    const isBanned = user.status === 'banned';
    const action = isBanned ? 'activate' : 'ban';
    
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: isBanned ? 'Activate' : 'Ban User', 
          style: isBanned ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(user.id);
            try {
              if (!isBanned) {
                 await adminDeactivateUser(user.id);
                 setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'banned' } : u));
                 Alert.alert("Success", "User banned.");
              } else {
                 Alert.alert("Notice", "To activate, please update the database manually.");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderUserCard = ({ item }: { item: User }) => {
    // Fix: Strictly compare against Enum
    const isCPA = item.role === UserRole.CPA; 
    const isAdmin = item.role === UserRole.ADMIN;

    return (
      <View className="mb-3 rounded-2xl overflow-hidden bg-[#112240] border border-white/10 shadow-sm relative">
        {isCPA && (
          <View className="absolute top-0 right-0 bg-[#64FFDA] px-3 py-1 rounded-bl-xl z-10">
            <Text className="text-[#0A192F] text-[10px] font-bold">CPA PROFESSIONAL</Text>
          </View>
        )}
        {isAdmin && !isCPA && (
          <View className="absolute top-0 right-0 bg-[#F59E0B] px-3 py-1 rounded-bl-xl z-10">
            <Text className="text-[#0A192F] text-[10px] font-bold">ADMIN</Text>
          </View>
        )}
        
        <View className="p-4 flex-row items-center">
          <Image 
            source={{ uri: item.avatar }} 
            className="w-12 h-12 rounded-full bg-white/10 border border-white/5"
          />
          
          <View className="flex-1 ml-4 mr-2">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className={`text-base font-bold ${item.status === 'banned' ? 'text-red-400 line-through' : 'text-white'}`}>
                {item.name}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Mail size={12} color="#8892B0" />
              <Text className="text-[#8892B0] text-xs ml-1 mr-3" numberOfLines={1}>{item.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Change Role Button (Purple Shield) */}
            <TouchableOpacity 
              onPress={() => openRoleModal(item)}
              className="w-10 h-10 rounded-full items-center justify-center bg-[#8B5CF6]/10 border border-[#8B5CF6]/30"
            >
              <UserCog size={18} color="#A78BFA" />
            </TouchableOpacity>

            {/* Message Button - Works now */}
            <TouchableOpacity 
              onPress={() => handleMessage(item.id)}
              className="w-10 h-10 rounded-full items-center justify-center bg-white/5 border border-white/10"
            >
              <MessageSquare size={18} color="#64FFDA" />
            </TouchableOpacity>

            {/* Ban Button */}
            <TouchableOpacity 
              onPress={() => handleBanToggle(item)}
              disabled={!!actionLoading}
              className={`w-10 h-10 rounded-full items-center justify-center border ${
                item.status === 'banned' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              {actionLoading === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : item.status === 'banned' ? (
                <CheckCircle size={18} color="#4ADE80" />
              ) : (
                <Ban size={18} color="#F87171" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 pt-6 pb-4 border-b border-white/5 bg-[#0A192F]/90">
        <Text className="text-white text-3xl font-bold tracking-tight">User Management</Text>
        <Text className="text-[#8892B0] text-sm mt-1">Manage Roles, Bans & Messages</Text>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row items-center bg-[#112240] rounded-xl px-4 py-3.5 border border-white/10 shadow-inner">
          <Search size={20} color="#8892B0" />
          <TextInput 
            className="flex-1 ml-3 text-white font-medium text-base"
            placeholder="Search users..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); loadUsers(); }} 
              tintColor="#64FFDA" 
            />
          }
          ListEmptyComponent={
            <View className="items-center py-10 opacity-50">
              <Briefcase size={40} color="#8892B0" />
              <Text className="text-[#8892B0] mt-4 font-medium">No users found.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={roleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="w-full bg-[#112240] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-white text-xl font-bold">Change Role</Text>
                <Text className="text-[#8892B0] text-sm mt-1">For {selectedUser?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setRoleModalVisible(false)}>
                <X size={24} color="#8892B0" />
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {/* Fix: Pass UserRole.MEMBER enum */}
              <TouchableOpacity 
                onPress={() => handleRoleUpdate(UserRole.MEMBER)}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${selectedUser?.role === UserRole.MEMBER ? 'bg-[#64FFDA]/10 border-[#64FFDA]' : 'bg-[#0A192F] border-white/5'}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                    <Briefcase size={20} color={selectedUser?.role === UserRole.MEMBER ? '#64FFDA' : '#8892B0'} />
                  </View>
                  <View>
                    <Text className={`font-bold ${selectedUser?.role === UserRole.MEMBER ? 'text-white' : 'text-[#8892B0]'}`}>Member</Text>
                    <Text className="text-[#8892B0] text-xs">Standard access</Text>
                  </View>
                </View>
                {selectedUser?.role === UserRole.MEMBER && <Check size={20} color="#64FFDA" />}
              </TouchableOpacity>

              {/* Fix: Pass UserRole.CPA enum */}
              <TouchableOpacity 
                onPress={() => handleRoleUpdate(UserRole.CPA)}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${selectedUser?.role === UserRole.CPA ? 'bg-[#64FFDA]/10 border-[#64FFDA]' : 'bg-[#0A192F] border-white/5'}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center">
                    <Briefcase size={20} color="#64FFDA" />
                  </View>
                  <View>
                    <Text className={`font-bold ${selectedUser?.role === UserRole.CPA ? 'text-white' : 'text-[#8892B0]'}`}>CPA Professional</Text>
                    <Text className="text-[#8892B0] text-xs">Client management & tools</Text>
                  </View>
                </View>
                {selectedUser?.role === UserRole.CPA && <Check size={20} color="#64FFDA" />}
              </TouchableOpacity>

              {/* Fix: Pass UserRole.ADMIN enum */}
              <TouchableOpacity 
                onPress={() => handleRoleUpdate(UserRole.ADMIN)}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${selectedUser?.role === UserRole.ADMIN ? 'bg-[#F59E0B]/10 border-[#F59E0B]' : 'bg-[#0A192F] border-white/5'}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-[#F59E0B]/10 items-center justify-center">
                    <Shield size={20} color="#F59E0B" />
                  </View>
                  <View>
                    <Text className={`font-bold ${selectedUser?.role === UserRole.ADMIN ? 'text-white' : 'text-[#8892B0]'}`}>Admin</Text>
                    <Text className="text-[#8892B0] text-xs">Full system control</Text>
                  </View>
                </View>
                {selectedUser?.role === UserRole.ADMIN && <Check size={20} color="#F59E0B" />}
              </TouchableOpacity>
            </View>

            <View className="mt-6 pt-4 border-t border-white/5">
              <Text className="text-[#8892B0] text-xs text-center">
                Changing a role updates permissions immediately.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}