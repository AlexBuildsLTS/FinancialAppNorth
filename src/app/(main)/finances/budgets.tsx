import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0A192F] p-6">
      <Text className="text-white text-2xl font-bold">Budgets</Text>
      <Text className="text-[#8892B0] mt-4">Budget tracking coming soon.</Text>
    </SafeAreaView>
  );
}
