import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { UserPlus, MessageCircle, Check, X, FileText, Briefcase, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../../shared/context/AuthContext';
import { getCpaClients, acceptCpaClient, rejectCpaClient } from '../../../services/dataService'; // Unified Service
import { useRouter, useFocusEffect } from 'expo-router';

export default function CpaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = async () => {
    if (!user) return;
    try {
      const data = await getCpaClients(user.id);
      setClients(data);
    } catch (error: any) {
      console.error('Error loading clients:', error);
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
        Alert.alert("Success", "Client accepted.");
        loadClients();
    } catch (e: any) {
        Alert.alert("Error", e.message);
    }
  };

  const handleReject = async (clientId: string) => {
    if (!user) return;
    Alert.alert("Reject Client", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", style: "destructive", onPress: async () => {
            try {
                await rejectCpaClient(user.id, clientId);
                loadClients();
            } catch (e: any) {
                Alert.alert("Error", e.message);
            }
        }}
    ]);
  };

  const activeClients = clients.filter(c => c.status === 'active');
  const pendingClients = clients.filter(c => c.status === 'pending');

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator size="large" color="#64FFDA" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-[#0A192F]" 
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadClients(); }} tintColor="#64FFDA" />}
    >
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row justify-between items-start mb-6">
          <View>
              <Text className="text-white font-bold text-3xl">CPA Portal</Text>
              <Text className="text-[#8892B0] text-sm mt-1">Manage your clients securely</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(main)/cpa/invite')}
            className="bg-[#64FFDA] px-4 py-2.5 rounded-full flex-row items-center shadow-lg shadow-[#64FFDA]/20"
          >
              <UserPlus size={18} color="#0A192F" />
              <Text className="text-[#0A192F] font-bold text-sm ml-2">Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-4 mb-8">
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider mb-1">Active</Text>
                <Text className="text-white font-bold text-3xl">{activeClients.length}</Text>
            </View>
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider mb-1">Pending</Text>
                <Text className="text-[#F59E0B] font-bold text-3xl">{pendingClients.length}</Text>
            </View>
        </View>

        {/* Pending Requests Section */}
        {pendingClients.length > 0 && (
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-4 flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2" />
              Pending Requests
            </Text>
            {pendingClients.map((client, index) => (
              <Animated.View
                key={client.id}
                entering={FadeInDown.delay(index * 100)}
                className="bg-[#112240] border border-[#F59E0B]/30 p-4 rounded-xl mb-3 flex-row items-center justify-between"
              >
                  <View className="flex-row items-center">
                      <View className="h-10 w-10 bg-[#F59E0B]/10 rounded-full items-center justify-center mr-3 border border-[#F59E0B]/20">
                          <Text className="text-[#F59E0B] font-bold">
                            {client.name?.[0]?.toUpperCase() || '?'}
                          </Text>
                      </View>
                      <View>
                          <Text className="text-white font-bold">{client.name}</Text>
                          <Text className="text-[#8892B0] text-xs">{client.email}</Text>
                      </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleAccept(client.id)} className="bg-[#64FFDA]/10 p-2 rounded-full border border-[#64FFDA]/30">
                        <Check size={18} color="#64FFDA" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReject(client.id)} className="bg-red-500/10 p-2 rounded-full border border-red-500/30">
                        <X size={18} color="#F87171" />
                    </TouchableOpacity>
                  </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Active Clients List */}
        <Text className="text-white font-bold text-lg mb-4 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-[#64FFDA] mr-2" />
          Active Clients
        </Text>
        
        {activeClients.length === 0 ? (
          <View className="bg-[#112240] border border-white/5 p-10 rounded-3xl items-center justify-center border-dashed">
            <Briefcase size={48} color="#1E293B" />
            <Text className="text-[#8892B0] mt-4 text-center font-medium">No active clients.</Text>
            <Text className="text-[#64748B] text-sm text-center mt-1">Invite clients to get started.</Text>
          </View>
        ) : (
          activeClients.map((client, index) => (
            <Animated.View
              key={client.id}
              entering={FadeInDown.delay(index * 100)}
              className="bg-[#112240] border border-white/5 p-4 rounded-2xl mb-3 flex-row items-center justify-between shadow-sm active:bg-[#162C52]"
            >
                <TouchableOpacity 
                  className="flex-row items-center flex-1"
                  onPress={() => router.push(`/(main)/cpa/client-documents?clientId=${client.id}` as any)}
                >
                    <View className="h-12 w-12 bg-[#0A192F] rounded-full items-center justify-center mr-4 border border-white/5">
                        <Text className="text-[#64FFDA] font-bold text-lg">
                          {client.name?.[0]?.toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-white font-bold text-base">{client.name}</Text>
                        <Text className="text-[#8892B0] text-xs">
                          Last active: {client.last_audit ? new Date(client.last_audit).toLocaleDateString() : 'Never'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => router.push(`/(main)/messages/${client.id}` as any)}
                    className="bg-white/5 p-2.5 rounded-xl border border-white/5"
                  >
                    <MessageCircle size={20} color="#8892B0" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push(`/(main)/cpa/client-documents?clientId=${client.id}` as any)}
                    className="bg-[#64FFDA]/10 p-2.5 rounded-xl border border-[#64FFDA]/20"
                  >
                    <ArrowRight size={20} color="#64FFDA" />
                  </TouchableOpacity>
                </View>
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}