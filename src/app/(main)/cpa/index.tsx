import React, { useState, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { 
  Users, UserPlus, Check, X, Briefcase, ArrowRight, ClipboardList, Search
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../../shared/context/AuthContext';
import { getCpaClients, acceptCpaClient, rejectCpaClient } from '../../../services/dataService'; 
import { useRouter, useFocusEffect } from 'expo-router';

interface Client {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'pending';
}

export default function CpaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClients = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCpaClients(user.id);
      setClients(data);
    } catch (error: any) {
      console.error('CPA Clients Error:', error);
      Alert.alert("Load Failed", "Could not load clients.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadClients(); }, [user]));

  const handleAccept = async (clientId: string) => {
    if (!user) return;
    try {
        await acceptCpaClient(user.id, clientId);
        Alert.alert("Success", "Client connected.");
        loadClients();
    } catch (e: any) {
        Alert.alert("Error", e.message);
    }
  };

  const handleReject = async (clientId: string) => {
    if (!user) return;
    Alert.alert("Decline", "Reject this request?", [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", style: "destructive", onPress: async () => {
            try { await rejectCpaClient(user.id, clientId); loadClients(); } 
            catch (e: any) { Alert.alert("Error", e.message); }
        }}
    ]);
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeClients = filtered.filter(c => c.status === 'active');
  const pendingClients = filtered.filter(c => c.status === 'pending');

  return (
    <ScrollView 
      className="flex-1 bg-[#0A192F]" 
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadClients} tintColor="#64FFDA" />}
    >
      <View className="px-6 pt-8 pb-4">
        
        {/* Header */}
        <View className="flex-row items-start justify-between mb-6">
          <View>
              <Text className="text-3xl font-extrabold text-white">CPA Portal</Text>
              <Text className="text-[#8892B0] text-sm mt-1 font-medium">Portfolio Management</Text>
          </View>
          <TouchableOpacity 
              onPress={() => router.push('/(main)/cpa/invite')} 
              className="bg-[#64FFDA] px-4 py-3 rounded-full flex-row items-center shadow-lg shadow-[#64FFDA]/20"
          >
              <UserPlus size={16} color="#0A192F" />
              <Text className="text-[#0A192F] font-bold text-xs ml-2">Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="bg-[#112240] rounded-xl flex-row items-center px-4 py-3 border border-white/10 mb-6">
            <Search size={18} color="#8892B0" />
            <TextInput 
                className="flex-1 ml-3 text-base text-white" 
                placeholder="Search clients..." 
                placeholderTextColor="#475569"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* Stats */}
        <View className="flex-row gap-4 mb-8">
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider mb-2">Active</Text>
                <Text className="text-3xl font-bold text-white">{activeClients.length}</Text>
            </View>
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider mb-2">Pending</Text>
                <Text className="text-[#F59E0B] font-bold text-3xl">{pendingClients.length}</Text>
            </View>
        </View>

        {/* Pending Requests */}
        {pendingClients.length > 0 && (
          <View className="mb-8">
            <Text className="pl-1 mb-4 text-lg font-bold text-white">Pending Approvals</Text>
            {pendingClients.map((client, index) => (
              <Animated.View key={client.id} entering={FadeInDown.delay(index * 100)} className="bg-[#112240] border border-[#F59E0B]/30 p-4 rounded-2xl mb-3 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-4">
                      <View className="h-12 w-12 bg-[#F59E0B]/10 rounded-full items-center justify-center mr-3 border border-[#F59E0B]/20">
                          <Text className="text-[#F59E0B] font-bold text-lg">{client.name?.[0]?.toUpperCase()}</Text>
                      </View>
                      <View className="flex-1">
                          <Text className="text-base font-bold text-white" numberOfLines={1}>{client.name}</Text>
                          <Text className="text-[#8892B0] text-xs mt-0.5">{client.email}</Text>
                      </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleAccept(client.id)} className="bg-[#64FFDA]/10 p-3 rounded-xl border border-[#64FFDA]/30"><Check size={20} color="#64FFDA" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReject(client.id)} className="p-3 border bg-red-500/10 rounded-xl border-red-500/30"><X size={20} color="#F87171" /></TouchableOpacity>
                  </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Client Roster */}
        <Text className="pl-1 mb-4 text-lg font-bold text-white">Client Roster</Text>
        {activeClients.length === 0 && !loading ? (
          <View className="bg-[#112240] border border-white/5 p-12 rounded-3xl items-center justify-center border-dashed">
            <Briefcase size={32} color="#8892B0" />
            <Text className="text-[#8892B0] mt-4 font-medium">No active clients</Text>
          </View>
        ) : (
          activeClients.map((client) => (
            <TouchableOpacity 
                key={client.id} 
                onPress={() => router.push({ pathname: '/(main)/cpa/tax-reports', params: { clientId: client.id, clientName: client.name } })} 
                className="bg-[#112240] border border-white/5 p-4 rounded-2xl mb-3 flex-row items-center justify-between active:bg-[#162C52]"
            >
                <View className="flex-row items-center flex-1">
                    <View className="h-12 w-12 bg-[#0A192F] rounded-full items-center justify-center mr-4 border border-white/5">
                        <Text className="text-[#64FFDA] font-bold text-lg">{client.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text className="text-base font-bold text-white">{client.name}</Text>
                        <Text className="text-[#8892B0] text-xs">{client.email}</Text>
                    </View>
                </View>
                <ArrowRight size={20} color="#64FFDA" />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}