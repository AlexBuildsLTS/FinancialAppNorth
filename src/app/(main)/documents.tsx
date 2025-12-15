import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function DocumentsScreen() {
  return (
    <ScrollView className="flex-1 bg-[#020617]">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Documents Vault
        </Text>
        <Text className="text-sm text-gray-400 mb-4">
          Secure, role-based document workspace. This initial screen is a
          placeholder; the full upload, sharing, and CPA workflows will be wired
          here next.
        </Text>
      </View>
    </ScrollView>
  );
}


