import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { UserPlus, Mail, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { inviteClient } from '../../../services/dataService'; 
import { useRouter } from 'expo-router';

export default function InviteClientScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    // 1. Validation
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!user) return;

    setInviting(true);
    try {
      // 2. Service Call
      await inviteClient(user.id, email.trim());
      
      Alert.alert(
        'Invitation Sent', 
        `An invite has been sent to ${email}. They will appear in your "Pending" list.`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
      setEmail('');
    } catch (error: any) {
      Alert.alert('Invitation Failed', error.message || 'Could not send invitation.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0A192F] p-6" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
      
      {/* Header */}
      <View className="mb-8 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-[#112240] rounded-full border border-white/10">
          <ArrowLeft size={20} color="#64FFDA" />
        </TouchableOpacity>
        <View>
          <Text className="text-white font-bold text-3xl">Invite Client</Text>
          <Text className="text-[#8892B0] text-sm font-medium">Grow your portfolio</Text>
        </View>
      </View>

      {/* Form Card */}
      <View className="bg-[#112240] border border-white/5 p-6 rounded-3xl shadow-lg">
        <View className="mb-8">
          <Text className="text-[#8892B0] font-bold text-xs uppercase mb-3 ml-1 tracking-widest">Client Email</Text>
          <View className="bg-[#0A192F] border border-white/10 rounded-2xl flex-row items-center px-5 py-4">
            <Mail size={20} color="#64FFDA" />
            <TextInput
              className="flex-1 text-white ml-4 text-lg font-medium"
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
          className={`p-5 rounded-2xl items-center flex-row justify-center shadow-lg ${
            inviting || !email.trim() ? 'bg-white/5 border border-white/5' : 'bg-[#64FFDA]'
          }`}
        >
          {inviting ? (
            <ActivityIndicator color={email.trim() ? '#0A192F' : 'white'} />
          ) : (
            <>
              <UserPlus size={22} color={email.trim() ? '#0A192F' : '#8892B0'} />
              <Text className={`font-bold ml-3 text-xl ${email.trim() ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>
                Send Invite
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Helper Info */}
      <View className="mt-8 p-5 bg-[#64FFDA]/5 border border-[#64FFDA]/10 rounded-2xl">
        <Text className="text-[#64FFDA] font-bold mb-1">How it works</Text>
        <Text className="text-[#8892B0] text-sm leading-6">
          1. Your client receives a notification inside the app.{'\n'}
          2. Once they accept, you gain read-only access to their transactions.{'\n'}
          3. You can generate tax reports instantly.
        </Text>
      </View>
    </ScrollView>
  );
}