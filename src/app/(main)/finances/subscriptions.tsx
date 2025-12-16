import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
  RefreshControl, Modal, TextInput, Alert, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, AlertTriangle, DollarSign, Calendar, TrendingUp, Plus, X, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getSubscriptions, deleteSubscription, addSubscription } from '../../../services/dataService';
import { DetectedSubscription } from '@/types';
import { GestureResponderEvent } from 'react-native/Libraries/Types/CoreEventTypes';


export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Data State
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>([]); // Changed from `Subscription[]` to `DetectedSubscription[]`
  const [loading, setLoading] = useState(true); // Changed from `Subscription[]` to `DetectedSubscription[]`
  const [refreshing, setRefreshing] = useState(false);
  
  // UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // --- DATA LOADING ---
  const loadSubscriptions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getSubscriptions(user.id);
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
  // --- ANIMATIONS ---
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fade in animation for the list items
  useFocusEffect(useCallback(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }
    ).start();
    return () => fadeAnim.setValue(0); // Reset fadeAnim when screen blurs
  }, [fadeAnim]));



  const handleDelete = async (sub: DetectedSubscription) => {
      if (!sub.id) {
          Alert.alert("Cannot Delete", "This is an AI-detected subscription. It will disappear if you stop paying it.");
          return;
      }
      
      Alert.alert("Confirm Delete", `Remove ${sub.name} from tracked subscriptions?`, [
          { text: "Cancel", style: "cancel" },
          { 
              text: "Delete", 
              style: "destructive", 
              onPress: async () => {
                  try {
                      await deleteSubscription(sub.id!);
                      loadSubscriptions();
                  } catch(e) {
                      Alert.alert("Error", "Could not delete.");
                  }
              }
          }
      ]);
  };

  const totalYearlyWaste = subscriptions.reduce((sum, sub) => sum + (sub.amount * 12), 0);

  // --- RENDER ITEM ---
  const renderSubscription = ({ item }: { item: DetectedSubscription }) => {
    const yearlyCost = item.amount * 12;
    const isManual = item.confidence === 1.0;

    return (
      <TouchableOpacity 
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.8}
        className={`bg-[#112240] rounded-xl p-4 mb-3 border ${
          item.status === 'price_hike' ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'
        }`}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{item.name}</Text>
            <View className="flex-row items-center mt-1">
              <DollarSign size={14} color="#64FFDA" />
              <Text className="text-[#64FFDA] font-bold text-base ml-1">
                ${item.amount.toFixed(2)}/mo
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <View className={`px-2 py-1 rounded-full mb-1 ${
              isManual ? 'bg-blue-500/20' : 'bg-purple-500/20'
            }`}>
              <Text className={`text-[10px] font-bold ${
                isManual ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {isManual ? 'MANUAL' : 'AI DETECTED'}
              </Text>
            </View>
            <Text className="text-[#8892B0] text-xs">
               Next: {new Date(item.next_billing_date).getDate()}th
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3 mt-1 border-t border-white/5">
          <Text className="text-[#8892B0] text-xs">
             Frequency: {item.frequency}
          </Text>
          <View className="flex-row items-center">
            <TrendingUp size={14} color="#F59E0B" />
            <Text className="text-[#F59E0B] font-bold text-sm ml-1">
              ${yearlyCost.toFixed(0)}/year
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await addSubscription(user!.id, {
        merchant: newName.trim(),
        amount,
        frequency: 'monthly',
        next_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'stable',
        confidence: 1.0
      });
      setModalVisible(false);
      setNewName('');
      setNewAmount('');
      loadSubscriptions();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* HEADER */}
      <View className="px-6 py-4 border-b border-white/5 bg-[#0A192F] flex-row justify-between items-center">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full">
                <ArrowLeft size={24} color="#64FFDA" />
            </TouchableOpacity>
            <View className="ml-2">
                <Text className="text-xl font-bold text-white">Subscriptions</Text>
                <Text className="text-[#8892B0] text-xs">Recurring Bill Detector</Text>
            </View>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-[#64FFDA] p-2 rounded-full shadow-lg shadow-teal-500/20">
            <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {/* KPI CARD */}
      <View className="mx-6 mt-6 p-5 bg-[#112240] rounded-2xl border border-white/10 shadow-lg mb-4 flex-row justify-between items-center">
        <View>
            <Text className="text-[#8892B0] text-xs font-bold uppercase tracking-wider">Total Yearly Cost</Text>
            <Text className="mt-1 text-3xl font-extrabold text-white">${totalYearlyWaste.toFixed(0)}</Text>
        </View>
        <View className="items-center justify-center w-10 h-10 rounded-full bg-white/5">
            <Calendar size={20} color="#8892B0" />
        </View>
      </View>

      {/* LIST */}
      <View className="flex-1 px-6">
        {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#64FFDA" className="mt-10" />
        ) : (
            <FlatList
                data={subscriptions}
                renderItem={renderSubscription}
                keyExtractor={(item, i) => item.id || `auto-${i}`}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-50">
                        <DollarSign size={48} color="#8892B0" />
                        <Text className="text-[#8892B0] mt-4 font-medium text-lg">No subscriptions found</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        )}
      </View>

      {/* ADD MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setModalVisible(false)} className="justify-end flex-1 bg-black/80">
            <TouchableOpacity activeOpacity={1} className="bg-[#112240] p-6 rounded-t-3xl border-t border-white/10">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-xl font-bold text-white">Add Subscription</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 rounded-full bg-white/5">
                        <X size={20} color="#8892B0" />
                    </TouchableOpacity>
                </View>
                
                <Text className="text-[#8892B0] mb-2 font-medium">Service Name</Text>
                <TextInput 
                    value={newName} onChangeText={setNewName}
                    className="bg-[#0A192F] text-white p-4 rounded-xl mb-4 border border-white/10 text-lg"
                    placeholder="Netflix, Spotify..." placeholderTextColor="#475569"
                    autoFocus
                />

                <Text className="text-[#8892B0] mb-2 font-medium">Monthly Cost</Text>
                <TextInput 
                    value={newAmount} onChangeText={setNewAmount} keyboardType="numeric"
                    className="bg-[#0A192F] text-white p-4 rounded-xl mb-8 border border-white/10 text-lg"
                    placeholder="0.00" placeholderTextColor="#475569"
                />

                <TouchableOpacity 
                    onPress={handleAdd} 
                    disabled={saving}
                    className={`p-4 rounded-xl items-center ${saving ? 'bg-gray-600' : 'bg-[#64FFDA]'}`}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-[#0A192F] font-bold text-lg">Save Subscription</Text>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}