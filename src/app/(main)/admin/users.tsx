import React, { useState, useCallback } from 'react';
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
import { Search, Ban, CheckCircle, MessageSquare, Mail, Shield, Briefcase, X, UserCog, Check, Star } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase, adminDeactivateUser, adminChangeUserRole } from '../../../lib/supabase';
import { User, UserRole, UserStatus } from '../../../types'; 

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = async () => {
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
        role: (Object.values(UserRole).includes(p.role) ? p.role : UserRole.MEMBER) as UserRole,
        status: (p.status || 'active') as UserStatus,
        avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/png?seed=${p.id}`,
        currency: p.currency,
        country: p.country
      }));

      setUsers(formattedUsers);
    } catch (e: any) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadUsers();
    }, [])
  );

  const handleMessage = (userId: string) => {
    // Explicitly cast to any to avoid strict router typing issues during dev
    router.push(`/(main)/messages/${userId}` as any);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setRoleModalVisible(true);
  };

  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!selectedUser) return;
    
    const originalRole = selectedUser.role;
    
    // Optimistic Update
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id ? { ...u, role: newRole } : u
    ));
    
    setRoleModalVisible(false);

    try {
      await adminChangeUserRole(selectedUser.id, newRole);
      Alert.alert("Success", `User role updated to ${newRole.toUpperCase()}`);
    } catch (error: any) {
      // Revert on failure
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
              // adminDeactivateUser toggles the status logic on backend
              await adminDeactivateUser(user.id);
              
              // Optimistic update
              const newStatus = isBanned ? 'active' : 'banned';
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus as UserStatus } : u));
              
              Alert.alert("Success", `User ${newStatus}.`);
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

  const renderRoleOption = (role: UserRole, label: string, description: string, icon: React.ReactNode, color: string) => (
    <TouchableOpacity 
      onPress={() => handleRoleUpdate(role)}
      className={`flex-row items-center justify-between p-4 rounded-xl border mb-2 ${selectedUser?.role === role ? `bg-[${color}]/10 border-[${color}]` : 'bg-[#0A192F] border-white/5'}`}
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-10 h-10 rounded-full bg-[${color}]/10 items-center justify-center`}>
          {icon}
        </View>
        <View>
          <Text className={`font-bold ${selectedUser?.role === role ? 'text-white' : 'text-[#8892B0]'}`}>{label}</Text>
          <Text className="text-[#8892B0] text-xs">{description}</Text>
        </View>
      </View>
      {selectedUser?.role === role && <Check size={20} color={color} />}
    </TouchableOpacity>
  );

  const renderUserCard = ({ item }: { item: User }) => {
    const isCPA = item.role === UserRole.CPA; 
    const isAdmin = item.role === UserRole.ADMIN;
    const isPremium = item.role === UserRole.PREMIUM;

    return (
      <View className="mb-3 rounded-2xl overflow-hidden bg-[#112240] border border-white/10 shadow-sm relative">
        {/* Role Badges */}
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
        {isPremium && !isAdmin && !isCPA && (
          <View className="absolute top-0 right-0 bg-[#A78BFA] px-3 py-1 rounded-bl-xl z-10">
            <Text className="text-[#0A192F] text-[10px] font-bold">PREMIUM</Text>
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
            <TouchableOpacity 
              onPress={() => openRoleModal(item)}
              className="w-10 h-10 rounded-full items-center justify-center bg-[#8B5CF6]/10 border border-[#8B5CF6]/30"
            >
              <UserCog size={18} color="#A78BFA" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleMessage(item.id)}
              className="w-10 h-10 rounded-full items-center justify-center bg-white/5 border border-white/10"
            >
              <MessageSquare size={18} color="#64FFDA" />
            </TouchableOpacity>

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

      {/* Role Modal */}
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

            <View className="gap-2">
              {renderRoleOption(UserRole.MEMBER, 'Member', 'Standard Access', <Briefcase size={20} color="#8892B0" />, '#8892B0')}
              {renderRoleOption(UserRole.PREMIUM, 'Premium', 'AI & Advanced Features', <Star size={20} color="#A78BFA" />, '#A78BFA')}
              {renderRoleOption(UserRole.CPA, 'CPA Professional', 'Client Management', <Briefcase size={20} color="#60A5FA" />, '#60A5FA')}
              {renderRoleOption(UserRole.ADMIN, 'Administrator', 'Full System Access', <Shield size={20} color="#F59E0B" />, '#F59E0B')}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}