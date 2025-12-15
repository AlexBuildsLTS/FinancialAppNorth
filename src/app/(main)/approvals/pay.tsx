import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function PayApprovalScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-[#0A192F] items-center justify-center p-6">
      <Text className="mb-4 text-xl font-bold text-white">Approval Payment</Text>
      <Text className="text-[#8892B0] text-center mb-8">
        Secure payment processing for approved expense requests.
      </Text>
      <TouchableOpacity 
        onPress={() => router.back()} 
        className="bg-[#112240] p-4 rounded-xl border border-white/10 flex-row items-center"
      >
        <ArrowLeft size={20} color="#64FFDA" />
        <Text className="ml-2 font-bold text-white">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}