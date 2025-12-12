import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar
} from 'react-native';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Briefcase, 
  ArrowRight, 
  FileText,
  PieChart
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  getCpaClients, 
  acceptCpaClient, 
  rejectCpaClient 
} from '../../../services/dataService'; 
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CpaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = async () => {
    if (!user) return;
    try {
      // Fetch clients using the fixed dataService query
      const data = await getCpaClients(user.id);
      setClients(data);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      // Fail silently for UX, logs catch the real issue (PGRST201 etc)
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
        Alert.alert("Success", "Client added to your portfolio.");
        loadClients();
    } catch (e: any) {
        Alert.alert("Error", e.message);
    }
  };

  const handleReject = async (clientId: string) => {
    if (!user) return;
    Alert.alert("Decline", "Reject this client request?", [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", style: "destructive", onPress: async () => {
            try {
                await rejectCpaClient(user.id, clientId);
                loadClients();
            } catch (e: any) { Alert.alert("Error", e.message); }
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
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadClients(); }} tintColor="#64FFDA" />}
      >
        {/* Header Section */}
        <View className="pt-4 pb-6">
          <Text className="text-white font-extrabold text-3xl">CPA Portal</Text>
          <Text className="text-[#8892B0] text-sm mt-1">Professional Dashboard</Text>
        </View>

        {/* Quick Actions Row */}
        <View className="flex-row gap-3 mb-8">
            <TouchableOpacity
              onPress={() => router.push('/(main)/cpa/tax-reports')}
              className="flex-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 p-4 rounded-xl items-center flex-row justify-center"
            >
                <FileText size={20} color="#8B5CF6" />
                <Text className="text-[#8B5CF6] font-bold ml-2">Tax Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(main)/cpa/invite')}
              className="flex-1 bg-[#64FFDA]/10 border border-[#64FFDA]/30 p-4 rounded-xl items-center flex-row justify-center"
            >
                <UserPlus size={20} color="#64FFDA" />
                <Text className="text-[#64FFDA] font-bold ml-2">Invite Client</Text>
            </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View className="flex-row gap-4 mb-8">
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                <View className="flex-row items-center mb-2">
                    <Users size={16} color="#8892B0" />
                    <Text className="text-[#8892B0] text-xs font-bold uppercase ml-2 tracking-wider">Active</Text>
                </View>
                <Text className="text-white font-bold text-3xl">{activeClients.length}</Text>
            </View>
            <View className="bg-[#112240] border border-white/5 p-5 rounded-2xl flex-1 shadow-sm">
                 <View className="flex-row items-center mb-2">
                    <PieChart size={16} color="#F59E0B" />
                    <Text className="text-[#8892B0] text-xs font-bold uppercase ml-2 tracking-wider">Pending</Text>
                </View>
                <Text className="text-[#F59E0B] font-bold text-3xl">{pendingClients.length}</Text>
            </View>
        </View>

        {/* Pending Requests */}
        {pendingClients.length > 0 && (
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-4">Pending Approvals</Text>
            {pendingClients.map((client, index) => (
              <Animated.View 
                key={client.id} 
                entering={FadeInDown.delay(index * 100)} 
                className="bg-[#112240] border border-[#F59E0B]/30 p-4 rounded-2xl mb-3 flex-row items-center justify-between"
              >
                  <View className="flex-row items-center flex-1 mr-4">
                      <View className="h-10 w-10 bg-[#F59E0B]/10 rounded-full items-center justify-center mr-3 border border-[#F59E0B]/20">
                          <Text className="text-[#F59E0B] font-bold">{client.name?.[0]?.toUpperCase()}</Text>
                      </View>
                      <View>
                          <Text className="text-white font-bold text-base">{client.name}</Text>
                          <Text className="text-[#8892B0] text-xs">{client.email}</Text>
                      </View>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => handleAccept(client.id)} className="bg-[#64FFDA] p-2 rounded-lg">
                        <Check size={18} color="#0A192F" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReject(client.id)} className="bg-red-500/20 p-2 rounded-lg">
                        <X size={18} color="#F87171" />
                    </TouchableOpacity>
                  </View>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Active Clients List */}
        <Text className="text-white font-bold text-lg mb-4">Client Roster</Text>
        {activeClients.length === 0 ? (
          <View className="bg-[#112240] border border-white/5 p-10 rounded-3xl items-center justify-center border-dashed">
            <Briefcase size={40} color="#8892B0" />
            <Text className="text-white font-bold mt-4">No active clients</Text>
            <Text className="text-[#8892B0] text-sm text-center mt-2 px-6">
                Invite clients to start managing their financial documents and reports.
            </Text>
          </View>
        ) : (
          activeClients.map((client, index) => (
            <TouchableOpacity 
                key={client.id} 
                onPress={() => router.push(`/(main)/cpa/client-documents?clientId=${client.id}` as any)} 
                className="bg-[#112240] border border-white/5 p-4 rounded-2xl mb-3 flex-row items-center justify-between active:bg-[#162C52]"
            >
                <View className="flex-row items-center flex-1">
                    <View className="h-10 w-10 bg-[#0A192F] rounded-full items-center justify-center mr-4 border border-white/10">
                        <Text className="text-[#64FFDA] font-bold">{client.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text className="text-white font-bold text-base">{client.name}</Text>
                        <Text className="text-[#8892B0] text-xs">Last audit: {client.last_audit ? new Date(client.last_audit).toLocaleDateString() : 'Never'}</Text>
                    </View>
                </View>
                <ArrowRight size={20} color="#64FFDA" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}