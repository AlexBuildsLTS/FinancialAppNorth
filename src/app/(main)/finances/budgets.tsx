import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, X, BarChart, Target, Settings } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { BudgetService } from '../../../services/budgetService';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import "../../../../global.css";

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Business', 'Healthcare'];

// Updated Card to accept onDelete prop
const BudgetCard = ({ budget, onDelete }: { budget: any, onDelete: (id: string) => void }) => {
  const spent = Number(budget.spent) || 0;
  const limit = Number(budget.amount) || 0; 
  const progress = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  
  let progressBarColor = 'bg-[#64FFDA]'; 
  if (progress > 90) progressBarColor = 'bg-red-500';
  else if (progress > 70) progressBarColor = 'bg-yellow-500';

  const remaining = limit - spent;
  const statusText = remaining >= 0 ? `Remaining: ${remaining.toFixed(2)}` : `Overage: ${Math.abs(remaining).toFixed(2)}`;

  const handleSettingsPress = () => {
    Alert.alert(
      "Manage Budget",
      `Options for ${budget.category_name}`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => onDelete(budget.id) 
        }
      ]
    );
  };

  return (
    <View className="bg-[#112240] p-4 rounded-xl border border-white/10 mb-4 shadow-md">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <Target size={20} color="#8892B0" />
          <Text className="text-white font-bold text-lg">{budget.category_name || 'General'}</Text>
        </View>
        <Text className="text-[#8892B0] text-xs uppercase">{budget.period}</Text>
      </View>

      <View className="w-full bg-[#0A192F] h-2 rounded-full mb-2 overflow-hidden">
        <View className={`${progressBarColor} h-full`} style={{ width: `${Math.min(100, progress)}%` }} />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-base font-bold">{spent.toFixed(2)} / {limit.toFixed(2)}</Text>
          <Text className={`text-xs font-medium ${progress > 100 ? 'text-red-400' : 'text-[#8892B0]'}`}>{statusText}</Text>
        </View>
        
        {/* Settings Icon with Action */}
        <TouchableOpacity 
          onPress={handleSettingsPress}
          className="p-2 rounded-lg bg-white/5 border border-white/10"
        >
            <Settings size={18} color="#8892B0" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function BudgetsScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [newLimit, setNewLimit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const loadBudgets = async () => {
    if (!user) return;
    try {
      const data = await BudgetService.getBudgets(user.id);
      setBudgets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();

    // Set up real-time subscription for transactions that affect budgets
    if (user) {
      const subscription = supabase
        .channel('budget-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh budgets when new transactions are added
            loadBudgets();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh budgets when transactions are updated
            loadBudgets();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => { loadBudgets(); }, [user])
  );

  const handleCreateBudget = async () => {
    if (!newLimit || !user) return;
    setSubmitting(true);
    try {
        await BudgetService.createBudget(user.id, selectedCategory, parseFloat(newLimit));
        await loadBudgets();
        setIsModalOpen(false);
        setNewLimit('');
    } catch (e: any) {
        Alert.alert("Error", "Failed to create budget: " + e.message);
    } finally {
        setSubmitting(false);
    }
  };

  // Added Delete Function
  const handleDeleteBudget = async (budgetId: string) => {
    try {
        await BudgetService.deleteBudget(budgetId);
        // Optimistic update
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
    } catch (e: any) {
        Alert.alert("Error", "Failed to delete budget");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center border-b border-[#233554]">
        <View>
          <Text className="text-white text-3xl font-bold">Budgets</Text>
          <Text className="text-[#64FFDA] text-sm">Real-Time Tracking</Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalOpen(true)} className="w-12 h-12 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg">
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BudgetCard budget={item} onDelete={handleDeleteBudget} />}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); loadBudgets(); }} tintColor="#64FFDA" />}
        ListEmptyComponent={
            <View className="mt-20 items-center">
                <BarChart size={40} color="#112240" />
                <Text className="text-[#8892B0] mt-4">No active budgets. Create one!</Text>
            </View>
        }
      />

      <Modal visible={isModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#112240] rounded-t-3xl p-6 h-[70%] border-t border-[#233554]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Set Budget Limit</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}><X size={24} color="#8892B0" /></TouchableOpacity>
            </View>

            <ScrollView>
              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    onPress={() => setSelectedCategory(cat)}
                    className={`mr-3 px-4 py-3 rounded-xl border ${selectedCategory === cat ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#0A192F] border-white/10'}`}
                  >
                    <Text className={`font-bold ${selectedCategory === cat ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Monthly Limit</Text>
              <View className="bg-[#0A192F] rounded-xl flex-row items-center px-4 py-4 mb-8 border border-white/10">
                <TextInput 
                  className="flex-1 text-white ml-2 text-2xl font-bold" 
                  placeholder="0.00" 
                  placeholderTextColor="#475569" 
                  keyboardType="numeric"
                  value={newLimit}
                  onChangeText={setNewLimit}
                />
              </View>

              <TouchableOpacity onPress={handleCreateBudget} disabled={submitting} className="bg-[#64FFDA] py-4 rounded-xl items-center">
                {submitting ? <ActivityIndicator color="#0A192F" /> : <Text className="text-[#0A192F] font-bold text-lg">Create Budget</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}