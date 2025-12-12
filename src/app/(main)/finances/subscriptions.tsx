import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, AlertTriangle, DollarSign, Calendar, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
// FIX: Correct import names matching dataService.ts
import { scanForSubscriptions, Subscription } from '../../../services/dataService';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    if (!user?.id) return;
    try {
      // FIX: Correct function call
      const data = await scanForSubscriptions(user.id);
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

  // Logic: Calculate waste on the fly (Monthly * 12)
  const totalYearlyWaste = subscriptions.reduce((sum, sub) => sum + (sub.amount * 12), 0);

  const renderSubscription = ({ item }: { item: Subscription }) => {
    // Helper for yearly cost
    const yearlyCost = item.amount * 12;

    return (
      <View className={`bg-[#112240] rounded-xl p-4 mb-3 border ${
        item.status === 'price_hike' ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'
      }`}>
        {item.status === 'price_hike' && (
          <View className="flex-row items-center mb-3 p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle size={16} color="#F87171" />
            <Text className="text-red-400 font-bold text-sm ml-2">PRICE HIKE DETECTED!</Text>
          </View>
        )}

        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">{item.name}</Text>
            <View className="flex-row items-center mt-1">
              <DollarSign size={14} color="#64FFDA" />
              <Text className="text-[#64FFDA] font-bold text-base ml-1">
                ${item.amount.toFixed(2)}/mo
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <View className={`px-2 py-1 rounded-full mb-1 ${
              item.status === 'price_hike' ? 'bg-red-500/20' : 'bg-green-500/20'
            }`}>
              <Text className={`text-xs font-bold ${
                item.status === 'price_hike' ? 'text-red-400' : 'text-green-400'
              }`}>
                {item.status === 'price_hike' ? 'UNSTABLE' : 'ACTIVE'}
              </Text>
            </View>
            <Text className="text-[#8892B0] text-xs capitalize">
              {item.confidence ? `${Math.round(item.confidence * 100)}% Match` : 'Detected'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center border-t border-white/5 pt-3 mt-1">
          <View className="flex-row items-center">
            <Calendar size={14} color="#8892B0" />
            <Text className="text-[#8892B0] text-sm ml-1">
              {/* FIX: Correct property name */}
              Next: {new Date(item.next_billing_date).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TrendingUp size={14} color="#F59E0B" />
            <Text className="text-[#F59E0B] font-bold text-sm ml-1">
              ${yearlyCost.toFixed(0)}/year
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/5 bg-[#0A192F]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-white/10">
            <ArrowLeft size={24} color="#64FFDA" />
          </TouchableOpacity>
          <View>
             <Text className="text-white font-bold text-xl">Subscriptions</Text>
             <Text className="text-[#8892B0] text-xs">Recurring Bill Detector</Text>
          </View>
          <View className="w-10" />
        </View>
      </View>

      {/* Summary Card */}
      <View className="mx-6 mt-6 p-5 bg-[#112240] rounded-2xl border border-white/10 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider">Total Yearly Cost</Text>
            <Text className="text-white font-extrabold text-3xl mt-1">${totalYearlyWaste.toFixed(0)}</Text>
          </View>
          <View className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
            <AlertTriangle size={24} color="#F87171" />
          </View>
        </View>
      </View>

      {/* List */}
      <View className="flex-1 px-6 pt-6">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#64FFDA" />
            <Text className="text-[#8892B0] mt-4">Scanning transaction history...</Text>
          </View>
        ) : (
          <FlatList
            data={subscriptions}
            renderItem={renderSubscription}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-20 opacity-50">
                <DollarSign size={48} color="#8892B0" />
                <Text className="text-[#8892B0] mt-4 font-medium text-lg">No subscriptions found</Text>
                <Text className="text-[#8892B0] text-sm mt-2 text-center px-10">
                  We couldn't detect any recurring monthly payments in your recent history.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}