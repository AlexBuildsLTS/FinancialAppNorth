import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Stack } from 'expo-router';
import { UserPlus, MoreVertical, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { orgService } from '@/services/orgService';

export default function MembersScreen() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    if (!user) return;
    const org = await orgService.getMyOrganization(user.id);
    if (org) {
      const list = await orgService.getMembers(org.id);
      setMembers(list || []);
    }
  };

  const inviteUser = () => {
    Alert.prompt("Invite Member", "Enter email address:", async (email) => {
        // In a real app, you'd fetch the ORG ID properly from state
        // await orgService.inviteMember(orgId, email);
        Alert.alert("Sent", `Invite sent to ${email}`);
    });
  };

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen 
        options={{ 
          title: "Team Members", 
          headerRight: () => (
            <TouchableOpacity onPress={inviteUser}>
               <UserPlus size={24} color="#64FFDA" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <FlatList
        data={members}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between p-4 mb-3 bg-slate-800 rounded-xl">
             <View className="flex-row items-center gap-3">
                <View className="items-center justify-center w-10 h-10 rounded-full bg-slate-700">
                   <Text className="font-bold text-white">{item.profiles?.full_name?.[0] || 'U'}</Text>
                </View>
                <View>
                   <Text className="font-bold text-white">{item.profiles?.full_name || 'Unknown User'}</Text>
                   <Text className="text-xs uppercase text-slate-400">{item.role}</Text>
                </View>
             </View>
             {item.role !== 'owner' && (
               <TouchableOpacity>
                 <Trash2 size={18} color="#EF4444" />
               </TouchableOpacity>
             )}
          </View>
        )}
      />
    </View>
  );
}