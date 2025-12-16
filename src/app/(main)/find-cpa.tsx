import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, UserCheck, Star, Shield, Lock } from 'lucide-react-native';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../shared/context/AuthContext';

export default function FindCPAScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [cpas, setCpas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // --- ROLE GUARD ---
  const allowedRoles = ['premium', 'admin', 'support', 'cpa'];
  const hasAccess = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (hasAccess) {
        loadCPAs();
    } else {
        setLoading(false);
    }
  }, [user]);

  const loadCPAs = async () => {
    try {
        const users = await dataService.getUsers();
        // Filter strictly for CPAs
        const proUsers = users.filter(u => u.role === 'cpa' && u.id !== user?.id);
        setCpas(proUsers);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleConnect = async (cpaId: string, name: string) => {
      try {
          await dataService.requestCPA(user!.id, cpaId); 
          Alert.alert("Request Sent", `A connection request has been sent to ${name}.`);
      } catch (e: any) {
          Alert.alert("Notice", e.message || "Request already pending or connected.");
      }
  };

  const renderCPA = ({ item }: { item: any }) => (
    <View className="bg-[#112240] p-5 rounded-2xl mb-4 border border-white/5">
        <View className="flex-row items-start justify-between mb-4">
            <View className="flex-row items-center">
                <View className="items-center justify-center w-12 h-12 mr-3 border rounded-full bg-purple-500/10 border-purple-500/20">
                    <Text className="text-lg font-bold text-purple-400">{item.name[0]}</Text>
                </View>
                <View>
                    <Text className="text-lg font-bold text-white">{item.name}</Text>
                    <Text className="text-[#8892B0] text-xs">Certified Public Accountant</Text>
                </View>
            </View>
            <View className="flex-row items-center px-2 py-1 border rounded bg-green-500/10 border-green-500/20">
                <Shield size={10} color="#4ADE80" />
                <Text className="text-green-400 text-[10px] font-bold ml-1">VERIFIED</Text>
            </View>
        </View>
        
        <View className="flex-row items-center gap-4 mb-4">
            <View className="flex-row items-center">
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text className="ml-1 font-bold text-white">5.0</Text>
            </View>
            <Text className="text-[#8892B0] text-xs">• Tax Specialist</Text>
            <Text className="text-[#8892B0] text-xs">• Audit Ready</Text>
        </View>

        <TouchableOpacity 
            onPress={() => handleConnect(item.id, item.name)}
            className="bg-[#64FFDA] py-3 rounded-xl items-center flex-row justify-center shadow-lg shadow-[#64FFDA]/20"
        >
            <UserCheck size={18} color="#0A192F" />
            <Text className="text-[#0A192F] font-bold ml-2">Connect Now</Text>
        </TouchableOpacity>
    </View>
  );

  if (!hasAccess) {
      return (
        <SafeAreaView className="flex-1 bg-[#0A192F] items-center justify-center p-6">
            <View className="w-20 h-20 bg-[#112240] rounded-full items-center justify-center mb-6 border border-white/5">
                <Lock size={40} color="#F87171" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-center text-white">Premium Feature</Text>
            <Text className="text-[#8892B0] text-center mb-8 leading-6">
                Connecting with top-tier CPAs is reserved for Premium members. Upgrade today to unlock professional financial guidance.
            </Text>
            <TouchableOpacity 
                onPress={() => Alert.alert("Upgrade", "Redirecting to subscription page...")}
                className="bg-[#64FFDA] py-4 px-8 rounded-full shadow-lg"
            >
                <Text className="text-[#0A192F] font-bold text-lg">Upgrade to Premium</Text>
            </TouchableOpacity>
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="p-6">
        <Text className="mb-2 text-3xl font-bold text-white">Find a Pro</Text>
        <Text className="text-[#8892B0] mb-6">Connect with verified financial experts.</Text>

        <View className="bg-[#112240] p-3 rounded-xl border border-white/10 flex-row items-center mb-6">
            <Search size={20} color="#8892B0" />
            <TextInput 
                className="flex-1 ml-3 text-base text-white"
                placeholder="Search by name..."
                placeholderTextColor="#475569"
                value={query}
                onChangeText={setQuery}
            />
        </View>

        {loading ? (
            <ActivityIndicator color="#64FFDA" className="mt-10" />
        ) : (
            <FlatList 
                data={cpas.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))}
                renderItem={renderCPA}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={
                    <Text className="text-[#8892B0] text-center mt-10">No CPAs found matching your search.</Text>
                }
            />
        )}
      </View>
    </SafeAreaView>
  );
}