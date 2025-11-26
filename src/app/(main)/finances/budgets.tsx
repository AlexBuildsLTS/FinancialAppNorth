import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Plus, X, BarChart, TrendingUp, DollarSign, Target, Settings } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../lib/supabase';
import "../../../global.css"; // FIX: Corrected path to go up three levels (app -> main -> finances -> global.css)

// --- Mock Data & Types for UI Visualization ---
interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string; // e.g., 'Monthly'
}

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Business', 'Healthcare'];
const MOCK_BUDGETS: Budget[] = [
  { id: '1', category: 'Food', limit: 800, spent: 720.50, period: 'Monthly' },
  { id: '2', category: 'Entertainment', limit: 250, spent: 280.00, period: 'Monthly' },
  { id: '3', category: 'Travel', limit: 1000, spent: 300.00, period: 'Monthly' },
  { id: '4', category: 'Utilities', limit: 300, spent: 298.99, period: 'Monthly' },
];
// --- End Mock Data ---


const BudgetCard = ({ budget }: { budget: Budget }) => {
  const progress = Math.round((budget.spent / budget.limit) * 100);
  let progressBarColor = 'bg-[#64FFDA]'; // Teal (good)
  if (progress > 90) {
    progressBarColor = 'bg-red-500'; // Red (over budget)
  } else if (progress > 70) {
    progressBarColor = 'bg-yellow-500'; // Yellow (caution)
  }

  const statusText = progress > 100 ? 'OVER BUDGET' : `${budget.limit - budget.spent >= 0 ? 'Remaining' : 'Overage'}: $${Math.abs(budget.limit - budget.spent).toFixed(2)}`;

  return (
    <View className="bg-[#112240] p-4 rounded-xl border border-white/10 mb-4 shadow-md">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <Target size={20} color="#8892B0" />
          <Text className="text-white font-bold text-lg">{budget.category}</Text>
        </View>
        <Text className="text-[#8892B0] text-xs uppercase">{budget.period}</Text>
      </View>

      {/* Progress Bar */}
      <View className="w-full bg-[#0A192F] h-2 rounded-full mb-2 overflow-hidden">
        <View 
          className={`${progressBarColor} h-full`} 
          style={{ width: `${Math.min(100, progress)}%` }} 
        />
      </View>

      {/* Details */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-base font-bold">${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</Text>
          <Text className={`text-xs font-medium ${progress > 100 ? 'text-red-400' : 'text-[#8892B0]'}`}>{statusText}</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Settings size={18} color="#8892B0" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default function BudgetsScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [newLimit, setNewLimit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  // FUTURE: Logic to fetch and integrate real transaction data 
  // (e.g., fetch all 'Food' transactions and calculate 'spent' value)
  
  const handleSetBudget = () => {
    if (!newLimit) return;
    const newBudget: Budget = {
        id: Date.now().toString(),
        category: selectedCategory,
        limit: parseFloat(newLimit),
        spent: 0, // Should be fetched from transactions
        period: 'Monthly'
    };
    setBudgets([newBudget, ...budgets.filter(b => b.category !== selectedCategory)]);
    setIsModalOpen(false);
    setNewLimit('');
  };


  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center border-b border-[#233554]">
        <View>
          <Text className="text-white text-3xl font-bold">Budgets</Text>
          <Text className="text-[#64FFDA] text-sm">AI Integrated</Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalOpen(true)} className="w-12 h-12 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg">
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <BudgetCard budget={item} />}
        contentContainerStyle={{ padding: 24 }}
        ListHeaderComponent={() => (
            <View className="bg-[#112240] p-4 rounded-xl border border-[#64FFDA]/30 mb-6">
                <Text className="text-white font-bold text-base mb-1">AI Smart Recommendations</Text>
                <Text className="text-[#8892B0] text-sm">Based on last 3 months, your suggested Food limit is $750.</Text>
                <TouchableOpacity className="mt-2 self-end">
                    <Text className="text-[#64FFDA] text-xs font-bold">Apply Suggestion</Text>
                </TouchableOpacity>
            </View>
        )}
        ListEmptyComponent={
            <View className="mt-20 items-center">
                <BarChart size={40} color="#112240" />
                <Text className="text-[#8892B0] mt-4">No budgets set. Tap + to start.</Text>
            </View>
        }
      />

      {/* Add Budget Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#112240] rounded-t-3xl p-6 h-[70%] border-t border-[#233554]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">New Budget Limit</Text>
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
                <DollarSign size={20} color="#64FFDA" />
                <TextInput 
                  className="flex-1 text-white ml-2 text-2xl font-bold" 
                  placeholder="0.00" 
                  placeholderTextColor="#475569" 
                  keyboardType="numeric"
                  value={newLimit}
                  onChangeText={setNewLimit}
                />
              </View>

              <TouchableOpacity onPress={handleSetBudget} className="bg-[#64FFDA] py-4 rounded-xl items-center">
                <Text className="text-[#0A192F] font-bold text-lg">Create Budget</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}