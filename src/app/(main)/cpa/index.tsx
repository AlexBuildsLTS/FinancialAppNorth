import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Users, UserPlus, MessageCircle, Check, X, FileText } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../../shared/context/AuthContext';
import { CpaService } from '../../../services/cpaService';
import { useRouter } from 'expo-router';

export default function CpaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    if (!user) return;
    try {
      const data = await CpaService.getCpaClients(user.id);
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [user]);

  const handleAcceptClient = async (clientId: string) => {
    if (!user) return;
    try {
      await CpaService.acceptClient(user.id, clientId);
      await loadClients(); // Refresh the list
      Alert.alert('Success', 'Client request accepted');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept client');
    }
  };

  const handleRejectClient = async (clientId: string) => {
    if (!user) return;
    try {
      await CpaService.removeClient(user.id, clientId);
      await loadClients(); // Refresh the list
      Alert.alert('Success', 'Client request rejected');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject client');
    }
  };

  const activeClients = clients.filter(c => c.status === 'active');
  const pendingClients = clients.filter(c => c.status === 'pending');

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator color="#64FFDA" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-5" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="mb-6 flex-row justify-between items-center">
        <View>
            <Text className="text-white font-bold text-2xl">Client Management</Text>
            <Text className="text-[#8892B0] text-xs">Overview & Requests</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(main)/cpa/invite')}
          className="bg-[#64FFDA] px-4 py-2 rounded-lg flex-row items-center"
        >
            <UserPlus size={16} color="#0A192F" />
            <Text className="text-[#0A192F] font-bold text-sm ml-2">Invite Client</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3 mb-6">
          <View className="bg-[#112240] border border-white/5 p-4 rounded-xl flex-1">
              <Text className="text-[#8892B0] text-xs">Active Clients</Text>
              <Text className="text-white font-bold text-2xl">{activeClients.length}</Text>
          </View>
          <View className="bg-[#112240] border border-white/5 p-4 rounded-xl flex-1">
              <Text className="text-[#8892B0] text-xs">Pending Requests</Text>
              <Text className="text-[#64FFDA] font-bold text-2xl">{pendingClients.length}</Text>
          </View>
      </View>

      {pendingClients.length > 0 && (
        <>
          <Text className="text-white font-bold text-lg mb-3">Pending Requests</Text>
          {pendingClients.map((client, index) => (
            <Animated.View
              key={client.id}
              entering={FadeInDown.delay(index * 100).duration(500)}
              className="bg-[#112240] border border-[#64FFDA]/20 p-4 rounded-xl mb-3 flex-row items-center justify-between"
            >
                <View className="flex-row items-center">
                    <View className="h-10 w-10 bg-[#64FFDA]/10 rounded-full items-center justify-center mr-3 border border-[#64FFDA]/20">
                        <Text className="text-[#64FFDA] font-bold">
                          {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-white font-medium">{client.name}</Text>
                        <Text className="text-[#8892B0] text-xs">Pending approval</Text>
                    </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleAcceptClient(client.id)}
                    className="bg-[#64FFDA]/20 p-2 rounded-lg"
                  >
                      <Check size={18} color="#64FFDA" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRejectClient(client.id)}
                    className="bg-red-500/20 p-2 rounded-lg"
                  >
                      <X size={18} color="#F87171" />
                  </TouchableOpacity>
                </View>
            </Animated.View>
          ))}
        </>
      )}

      <Text className="text-white font-bold text-lg mb-3">Active Clients</Text>
      {activeClients.length === 0 ? (
        <View className="bg-[#112240] border border-white/5 p-8 rounded-xl items-center">
          <Users size={40} color="#112240" />
          <Text className="text-[#8892B0] mt-4 text-center">No active clients yet.</Text>
          <Text className="text-[#8892B0] text-sm text-center">Clients will appear here once they accept your invitation.</Text>
        </View>
      ) : (
        activeClients.map((client, index) => (
          <Animated.View
            key={client.id}
            entering={FadeInDown.delay(index * 100).duration(500)}
            className="bg-[#112240] border border-white/5 p-4 rounded-xl mb-3 flex-row items-center justify-between"
          >
              <View className="flex-row items-center">
                  <View className="h-10 w-10 bg-[#0A192F] rounded-full items-center justify-center mr-3 border border-white/5">
                      <Text className="text-white font-bold">
                        {client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </Text>
                  </View>
                  <View>
                      <Text className="text-white font-medium">{client.name}</Text>
                      <Text className="text-[#8892B0] text-xs">Last active: {client.last_audit ? new Date(client.last_audit).toLocaleDateString() : 'Never'}</Text>
                  </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => router.push(`/(main)/cpa/client-documents?clientId=${client.id}`)}
                  className="bg-[#64FFDA]/10 p-2 rounded-lg"
                >
                  <FileText size={18} color="#64FFDA" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/(main)/messages?user=${client.id}`)}
                  className="bg-white/5 p-2 rounded-lg"
                >
                  <MessageCircle size={18} color="#8892B0" />
                </TouchableOpacity>
              </View>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}