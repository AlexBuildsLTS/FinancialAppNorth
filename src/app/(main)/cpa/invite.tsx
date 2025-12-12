import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { UserPlus, Mail, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { inviteClient } from '../../../services/dataService'; // Now uses the Unified Service
import { useRouter } from 'expo-router';

export default function InviteClientScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter a client email address');
      return;
    }

    if (!user) return;

    setInviting(true);
    try {
      // Uses the robust inviteClient from dataService
      await inviteClient(user.id, email.trim());
      Alert.alert('Success', 'Client invitation sent successfully!');
      setEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-5" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="mb-6 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 bg-[#112240] rounded-full border border-white/5"
        >
          <ArrowLeft size={20} color="#64FFDA" />
        </TouchableOpacity>
        <View>
          <Text className="text-white font-bold text-2xl">Invite Client</Text>
          <Text className="text-[#8892B0] text-sm">Send an invitation to a potential client</Text>
        </View>
      </View>

      <View className="bg-[#112240] border border-white/5 p-6 rounded-2xl">
        <View className="mb-6">
          <Text className="text-[#8892B0] font-bold text-xs uppercase mb-2 ml-1">Client Email</Text>
          <View className="bg-[#0A192F] border border-white/10 rounded-xl flex-row items-center px-4 py-3">
            <Mail size={20} color="#8892B0" />
            <TextInput
              className="flex-1 text-white ml-3"
              placeholder="client@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!inviting}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleInvite}
          disabled={inviting || !email.trim()}
          className={`p-4 rounded-xl items-center flex-row justify-center ${
            inviting || !email.trim() ? 'bg-white/10' : 'bg-[#64FFDA]'
          }`}
        >
          {inviting ? (
            <ActivityIndicator color={email.trim() ? '#0A192F' : 'white'} />
          ) : (
            <>
              <UserPlus size={20} color={email.trim() ? '#0A192F' : '#8892B0'} />
              <Text className={`font-bold ml-2 ${email.trim() ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>
                Send Invitation
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="mt-6 p-4 bg-[#64FFDA]/10 border border-[#64FFDA]/20 rounded-xl">
          <Text className="text-[#64FFDA] text-sm">
            The client will receive a notification and can accept or decline your invitation.
            Once accepted, you'll be able to view their financial documents and provide accounting services.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}