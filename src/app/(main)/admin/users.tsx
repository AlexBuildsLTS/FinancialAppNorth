import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, 
  RefreshControl, Alert, Image, SafeAreaView, Modal, Platform 
} from 'react-native';
import { Search, Ban, CheckCircle, MessageSquare, Mail, Shield, Briefcase, X, UserCog, Check, Star, Calendar, Clock } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker'; // Ensure you have this installed
import { supabase, changeUserStatus, changeUserRole, suspendUser, getUsers } from '../../../services/dataService';
import { User, UserRole, UserStatus } from '../../../types'; 

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Suspension State
  const [suspendDate, setSuspendDate] = useState(new Date());

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e: any) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadUsers(); }, []));

  const handleMessage = (userId: string) => {
    router.push(`/(main)/messages/${userId}` as any);
  };

  // --- ROLE MANAGEMENT ---
  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!selectedUser) return;
    setRoleModalVisible(false);
    try {
      await changeUserRole(selectedUser.id, newRole);
      Alert.alert("Success", `Role updated to ${newRole.toUpperCase()}`);
      loadUsers();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // --- BAN TOGGLE ---
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
              await changeUserStatus(user.id); // Toggles backend status
              loadUsers(); // Refresh to get new status
              Alert.alert("Success", `User ${action}d.`);
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

  // --- SUSPENSION ---
  const handleSuspend = async () => {
      if (!selectedUser) return;
      setSuspendModalVisible(false);
      setActionLoading(selectedUser.id);
      try {
          await suspendUser(selectedUser.id, suspendDate);
          Alert.alert("Suspended", `User suspended until ${suspendDate.toLocaleDateString()}`);
          loadUsers();
      } catch (e: any) {
          Alert.alert("Error", e.message);
      } finally {
          setActionLoading(null);
      }
  };

  const renderUserCard = ({ item }: { item: User }) => {
    const isBanned = item.status === 'banned';
    const isSuspended = item.status === 'suspended';

    return (
      <View className={`mb-3 rounded-2xl overflow-hidden border ${isBanned ? 'bg-red-500/5 border-red-500/20' : 'bg-[#112240] border-white/10'}`}>
        <View className="flex-row items-center p-4">
          <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full bg-white/10" />
          
          <View className="flex-1 ml-4 mr-2">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className={`text-base font-bold ${isBanned ? 'text-red-400 line-through' : 'text-white'}`}>{item.name}</Text>
              {isSuspended && <Clock size={14} color="#F59E0B" />}
            </View>
            <View className="flex-row items-center">
              <Mail size={12} color="#8892B0" />
              <Text className="text-[#8892B0] text-xs ml-1 mr-3" numberOfLines={1}>{item.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Message */}
            <TouchableOpacity onPress={() => handleMessage(item.id)} className="items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10">
              <MessageSquare size={18} color="#64FFDA" />
            </TouchableOpacity>

            {/* Role */}
            <TouchableOpacity onPress={() => { setSelectedUser(item); setRoleModalVisible(true); }} className="w-10 h-10 rounded-full items-center justify-center bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
              <UserCog size={18} color="#A78BFA" />
            </TouchableOpacity>

            {/* Ban / Activate Toggle */}
            <TouchableOpacity 
              onPress={() => handleBanToggle(item)}
              onLongPress={() => { setSelectedUser(item); setSuspendModalVisible(true); }} // Long press to suspend
              disabled={!!actionLoading}
              className={`w-10 h-10 rounded-full items-center justify-center border ${isBanned ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
            >
              {actionLoading === item.id ? <ActivityIndicator size="small" color="white" /> : 
               isBanned ? <CheckCircle size={18} color="#4ADE80" /> : <Ban size={18} color="#F87171" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 pt-6 pb-4 border-b border-white/5 bg-[#0A192F]/90">
        <Text className="text-3xl font-bold text-white">Users</Text>
        <Text className="text-[#8892B0] text-sm">Long press Ban icon to Suspend</Text>
      </View>

      <View className="px-6 py-4">
        <View className="flex-row items-center bg-[#112240] rounded-xl px-4 py-3 border border-white/10">
          <Search size={20} color="#8892B0" />
          <TextInput className="flex-1 ml-3 text-white" placeholder="Search users..." placeholderTextColor="#475569" value={search} onChangeText={setSearch}/>
        </View>
      </View>

      <FlatList
        data={users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))}
        renderItem={renderUserCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsers} tintColor="#64FFDA" />}
      />

      {/* SUSPEND MODAL */}
      <Modal visible={suspendModalVisible} transparent animationType="fade" onRequestClose={() => setSuspendModalVisible(false)}>
        <View className="items-center justify-center flex-1 p-6 bg-black/80">
            <View className="bg-[#112240] w-full rounded-3xl border border-white/10 p-6">
                <Text className="mb-2 text-xl font-bold text-white">Suspend User</Text>
                <Text className="text-[#8892B0] mb-6">Select date to auto-reactivate account.</Text>
                
                {Platform.OS === 'ios' && (
                    <DateTimePicker
                        value={suspendDate}
                        mode="date"
                        display="spinner"
                        onChange={(e, date) => date && setSuspendDate(date)}
                        textColor="white"
                        minimumDate={new Date()}
                    />
                )}
                
                <TouchableOpacity onPress={handleSuspend} className="bg-[#F59E0B] p-4 rounded-xl items-center mt-4">
                    <Text className="text-[#0A192F] font-bold">Confirm Suspension</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSuspendModalVisible(false)} className="items-center mt-4"><Text className="text-[#8892B0]">Cancel</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* ROLE MODAL */}
      <Modal visible={roleModalVisible} transparent animationType="fade" onRequestClose={() => setRoleModalVisible(false)}>
         {/* ... (Keep existing Role Modal code here) ... */}
         <View className="items-center justify-center flex-1 px-6 bg-black/80">
          <View className="w-full bg-[#112240] border border-white/10 rounded-3xl p-6 shadow-2xl">
             <Text className="mb-6 text-xl font-bold text-white">Change Role</Text>
             {/* ... Render Role Options ... */}
             <TouchableOpacity onPress={() => handleRoleUpdate('member' as UserRole)} className="p-4 border-b border-white/5"><Text className="text-white">Member</Text></TouchableOpacity>
             <TouchableOpacity onPress={() => handleRoleUpdate('cpa' as UserRole)} className="p-4 border-b border-white/5"><Text className="text-white">CPA</Text></TouchableOpacity>
             <TouchableOpacity onPress={() => handleRoleUpdate('admin' as UserRole)} className="p-4 border-b border-white/5"><Text className="text-white">Admin</Text></TouchableOpacity>
             <TouchableOpacity onPress={() => setRoleModalVisible(false)} className="items-center mt-4"><Text className="text-[#8892B0]">Cancel</Text></TouchableOpacity>
          </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}