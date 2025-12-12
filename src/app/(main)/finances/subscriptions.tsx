import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, AlertTriangle, DollarSign, Calendar, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { detectSubscriptions } from '../../../services/dataService';
import { DetectedSubscription } from '../../../types';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await detectSubscriptions(user.id);
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    loadSubscriptions();
  }, [loadSubscriptions]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSubscriptions();
  }, [loadSubscriptions]);

  const totalYearlyWaste = subscriptions.reduce((sum, sub) => sum + sub.yearly_waste, 0);

  const renderSubscription = ({ item }: { item: DetectedSubscription }) => (
    <View className="bg-[#112240] rounded-xl p-4 mb-3 border border-white/5">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{item.merchant}</Text>
          <View className="flex-row items-center mt-1">
            <DollarSign size={14} color="#64FFDA" />
            <Text className="text-[#64FFDA] font-bold text-base ml-1">
              ${item.amount.toFixed(2)}/{item.frequency.slice(0, -2)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <View className={`px-2 py-1 rounded-full ${
            item.confidence > 0.7 ? 'bg-green-500/20' :
            item.confidence > 0.5 ? 'bg-yellow-500/20' : 'bg-red-500/20'
          }`}>
            <Text className={`text-xs font-bold ${
              item.confidence > 0.7 ? 'text-green-400' :
              item.confidence > 0.5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Calendar size={14} color="#8892B0" />
          <Text className="text-[#8892B0] text-sm ml-1">
            Next: {new Date(item.next_due).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TrendingUp size={14} color="#F59E0B" />
          <Text className="text-[#F59E0B] font-bold text-sm ml-1">
            ${item.yearly_waste.toFixed(0)}/year
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/5 bg-[#0A192F]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#64FFDA" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl">Subscriptions</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Summary Card */}
      <View className="mx-6 mt-4 p-4 bg-[#112240] rounded-xl border border-white/5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[#8892B0] text-sm">Yearly Subscription Waste</Text>
            <Text className="text-white font-bold text-2xl">${totalYearlyWaste.toFixed(0)}</Text>
          </View>
          <View className="bg-red-500/20 p-3 rounded-full">
            <AlertTriangle size={24} color="#F87171" />
          </View>
        </View>
      </View>

      {/* List */}
      <View className="flex-1 px-6 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#64FFDA" />
            <Text className="text-[#8892B0] mt-4">Detecting subscriptions...</Text>
          </View>
        ) : (
          <FlatList
            data={subscriptions}
            renderItem={renderSubscription}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <DollarSign size={48} color="#112240" />
                <Text className="text-[#8892B0] mt-4 font-medium">No subscriptions detected</Text>
                <Text className="text-[#8892B0] text-xs mt-1 text-center">
                  Add more transactions to detect recurring bills
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}