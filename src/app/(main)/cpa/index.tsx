import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Check, 
  X, 
  Briefcase, 
  ArrowRight,
  ClipboardList
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  getCpaClients, 
  acceptCpaClient, 
  rejectCpaClient 
} from '../../../services/dataService'; // Unified Service
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
      Alert.alert('Error', 'Could not sync client list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [user])
  );

  const handleAccept = async (clientId: string) => {
    if (!user) return;
    try {
        await acceptCpaClient(user.id, clientId);
        Alert.alert("Success", "Client connected successfully.");
        loadClients();
    } catch (e: any) {
        Alert.alert("Error", e.message);
    }
  };

  const handleReject = async (clientId: string) => {
    if (!user) return;
    Alert.alert("Decline Request", "Are you sure you want to decline this client?", [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive", onPress: async () => {
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
        <Text className="text-[#8892B0] mt-4 font-medium">Syncing Portfolio...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-[#0A192F]" 
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => { setRefreshing(true); loadClients(); }} 
          tintColor="#64FFDA" 
        />
      }
    >
      <View className="px-6 pt-8 pb-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-8">
          <View>
              <Text className="text-white font-extrabold text-3xl">CPA Portal</Text>
              <Text className="text-[#8892B0] text-sm mt-1 font-medium">Manage your client portfolio</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(main)/cpa/invite')}
            className="bg-[#64FFDA] px-5 py-3 rounded-full flex-row items-center shadow-lg shadow-[#64FFDA]/20"
            activeOpacity={0.8}
          >
              <UserPlus size={18} color="#0A192F" />
              <Text className="text-[#0A192F] font-bold text-sm ml-2">Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Stats */}
        <View className="flex-row gap-4 mb-8">
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <Users size={20} color="#64FFDA" />
                    <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider">Active</Text>
                </View>
                <Text className="text-white font-bold text-3xl">{activeClients.length}</Text>
            </View>
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <ClipboardList size={20} color="#F59E0B" />
                    <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider">Requests</Text>
                </View>
                <Text className="text-[#F59E0B] font-bold text-3xl">{pendingClients.length}</Text>
            </View>
        </View>

        {/* Pending Requests Section */}
        {pendingClients.length > 0 && (
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-4 flex-row items-center pl-1">
              Pending Approvals
              <View className="bg-[#F59E0B] px-2 py-0.5 rounded-full ml-2">
                <Text className="text-[#0A192F] text-[10px] font-bold">{pendingClients.length}</Text>
              </View>
            </Text>
            
            {pendingClients.map((client, index) => (
              <Animated.View
                key={client.id}
                entering={FadeInDown.delay(index * 100)}
                className="bg-[#112240] border border-[#F59E0B]/30 p-4 rounded-2xl mb-3 flex-row items-center justify-between"
              >
                  <View className="flex-row items-center flex-1 mr-4">
                      <View className="h-12 w-12 bg-[#F59E0B]/10 rounded-full items-center justify-center mr-3 border border-[#F59E0B]/20">
                          <Text className="text-[#F59E0B] font-bold text-lg">
                            {client.name?.[0]?.toUpperCase() || '?'}
                          </Text>
                      </View>
                      <View className="flex-1">
                          <Text className="text-white font-bold text-base" numberOfLines={1}>{client.name}</Text>
                          <Text className="text-[#8892B0] text-xs mt-0.5" numberOfLines={1}>{client.email}</Text>
                      </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                        onPress={() => handleAccept(client.id)} 
                        className="bg-[#64FFDA]/10 p-3 rounded-xl border border-[#64FFDA]/30"
                    >
                        <Check size={20} color="#64FFDA" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleReject(client.id)} 
                        className="bg-red-500/10 p-3 rounded-xl border border-red-500/30"
                    >
                        <X size={20} color="#F87171" />
                    </TouchableOpacity>
                  </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Active Clients List */}
        <Text className="text-white font-bold text-lg mb-4 pl-1">Client Roster</Text>
        
        {activeClients.length === 0 ? (
          <View className="bg-[#112240] border border-white/5 p-12 rounded-3xl items-center justify-center border-dashed">
            <View className="bg-[#0A192F] p-4 rounded-full mb-4">
                <Briefcase size={32} color="#8892B0" />
            </View>
            <Text className="text-white font-bold text-lg text-center">No active clients</Text>
            <Text className="text-[#8892B0] text-sm text-center mt-2 px-8 leading-5">
                Invite clients using their email address to start managing their portfolio.
            </Text>
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
                        <View className="flex-row items-center mt-0.5">
                            <View className={`w-2 h-2 rounded-full mr-1.5 ${client.last_audit ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <Text className="text-[#8892B0] text-xs">
                              {client.last_audit ? `Active: ${new Date(client.last_audit).toLocaleDateString()}` : 'No activity'}
                            </Text>
                        </View>
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