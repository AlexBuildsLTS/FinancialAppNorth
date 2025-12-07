import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Search, UserPlus, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { CpaService } from '../../services/cpaService';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

interface CpaProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

export default function FindCpaScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cpaList, setCpaList] = useState<CpaProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  const loadCpas = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('role', 'cpa')
        .order('first_name');

      if (error) throw error;
      setCpaList(data || []);
    } catch (error) {
      console.error('Error loading CPAs:', error);
      Alert.alert('Error', 'Failed to load CPA list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCpas();
  }, []);

  const filteredCpas = cpaList.filter(cpa =>
    `${cpa.first_name} ${cpa.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cpa.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestCpa = async (cpaId: string, cpaEmail: string) => {
    if (!user) return;

    setRequesting(cpaId);
    try {
      await CpaService.requestCPA(user.id, cpaEmail);
      Alert.alert('Success', 'CPA request sent successfully!');
      // Optionally refresh the list or update UI
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send request');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator color="#64FFDA" />
        <Text className="text-white mt-4">Loading CPAs...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-5" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="mb-6">
        <Text className="text-white font-bold text-2xl">Find a CPA</Text>
        <Text className="text-[#8892B0] text-sm">Connect with certified public accountants</Text>
      </View>

      {/* Search */}
      <View className="mb-6">
        <View className="bg-[#112240] border border-white/5 rounded-xl flex-row items-center px-4 py-3">
          <Search size={20} color="#8892B0" />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder="Search by name or email..."
            placeholderTextColor="#8892B0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CPA List */}
      <Text className="text-white font-bold text-lg mb-4">Available CPAs</Text>

      {filteredCpas.length === 0 ? (
        <View className="bg-[#112240] border border-white/5 p-8 rounded-xl items-center">
          <Search size={40} color="#112240" />
          <Text className="text-[#8892B0] mt-4 text-center">No CPAs found matching your search.</Text>
        </View>
      ) : (
        filteredCpas.map((cpa, index) => (
          <View
            key={cpa.id}
            className="bg-[#112240] border border-white/5 p-4 rounded-xl mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="h-12 w-12 bg-[#64FFDA]/10 rounded-full items-center justify-center mr-4 border border-[#64FFDA]/20">
                <Text className="text-[#64FFDA] font-bold text-lg">
                  {cpa.first_name?.[0]}{cpa.last_name?.[0]}
                </Text>
              </View>
              <View>
                <Text className="text-white font-medium">
                  {cpa.first_name} {cpa.last_name}
                </Text>
                <Text className="text-[#8892B0] text-sm">{cpa.email}</Text>
                <Text className="text-[#64FFDA] text-xs font-medium">CPA</Text>
              </View>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/(main)/messages?user=${cpa.id}`)}
                className="bg-white/5 p-3 rounded-lg"
              >
                <MessageCircle size={18} color="#8892B0" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRequestCpa(cpa.id, cpa.email)}
                disabled={requesting === cpa.id}
                className="bg-[#64FFDA] px-4 py-3 rounded-lg flex-row items-center"
              >
                {requesting === cpa.id ? (
                  <ActivityIndicator size="small" color="#0A192F" />
                ) : (
                  <>
                    <UserPlus size={16} color="#0A192F" />
                    <Text className="text-[#0A192F] font-bold text-sm ml-2">Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}