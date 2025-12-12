import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, X, Settings, Trash2, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getBudgets, createBudget, deleteBudget } from '../../../services/dataService';
import { supabase } from '../../../lib/supabase';
import { useFocusEffect } from 'expo-router';

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Business', 'Healthcare', 'Shopping'];

export default function BudgetsScreen() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  
  // Form Inputs
  const [newLimit, setNewLimit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [editLimit, setEditLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBudgets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getBudgets(user.id);
      setBudgets(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadBudgets(); }, [user]));

  const handleCreate = async () => {
    if (!newLimit) return Alert.alert("Error", "Enter a limit");
    setSubmitting(true);
    try {
      await createBudget(user!.id, selectedCategory, parseFloat(newLimit));
      setCreateVisible(false);
      setNewLimit('');
      loadBudgets();
    } catch (e: any) { Alert.alert("Error", e.message); } 
    finally { setSubmitting(false); }
  };

  const openEdit = (budget: any) => {
    setSelectedBudget(budget);
    setEditLimit(String(budget.amount));
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedBudget || !editLimit) return;
    setSubmitting(true);
    try {
        await supabase.from('budgets').update({ amount: parseFloat(editLimit) }).eq('id', selectedBudget.id);
        setEditVisible(false);
        loadBudgets();
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selectedBudget) return;
    try {
        await deleteBudget(selectedBudget.id);
        setEditVisible(false);
        loadBudgets();
    } catch (e) { Alert.alert("Error", "Could not delete."); }
  };

  const renderItem = ({ item }: { item: any }) => {
    const progress = Math.min((item.spent / item.amount) * 100, 100);
    const color = progress > 90 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-[#64FFDA]';
    
    return (
        <View className="bg-[#112240] p-5 rounded-2xl mb-4 border border-white/5 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-[#0A192F] border border-white/5">
                        <TrendingUp size={18} color="#8892B0" />
                    </View>
                    <View>
                        <Text className="text-white font-bold text-lg">{item.category_name}</Text>
                        <Text className="text-[#8892B0] text-xs">${item.spent.toFixed(0)} spent</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => openEdit(item)} className="p-2 bg-white/5 rounded-full">
                    <Settings size={18} color="#8892B0" />
                </TouchableOpacity>
            </View>
            
            <View className="h-2 bg-[#0A192F] rounded-full overflow-hidden mb-2">
                <View style={{ width: `${progress}%` }} className={`h-full rounded-full ${color}`} />
            </View>
            
            <View className="flex-row justify-between">
                <Text className="text-[#8892B0] text-[10px] font-bold">{progress.toFixed(0)}% Used</Text>
                <Text className="text-white text-[10px] font-bold">${item.amount.toFixed(0)} Limit</Text>
            </View>
        </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="p-6 pb-0 flex-row justify-between items-center mb-4">
        <Text className="text-white text-3xl font-extrabold tracking-tight">Budgets</Text>
        <TouchableOpacity onPress={() => setCreateVisible(true)} className="bg-[#64FFDA] p-3 rounded-full shadow-lg shadow-[#64FFDA]/20">
            <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={budgets}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 24, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBudgets} tintColor="#64FFDA" />}
        ListEmptyComponent={
            <View className="items-center mt-20 opacity-50">
                <Text className="text-[#8892B0]">No active budgets.</Text>
            </View>
        }
      />

      {/* CREATE MODAL */}
      <Modal visible={createVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#112240] p-6 rounded-t-3xl border-t border-white/10">
                <View className="flex-row justify-between mb-6">
                    <Text className="text-white text-xl font-bold">New Budget</Text>
                    <TouchableOpacity onPress={() => setCreateVisible(false)}><X size={24} color="#8892B0"/></TouchableOpacity>
                </View>
                
                <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    {CATEGORIES.map(c => (
                        <TouchableOpacity key={c} onPress={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-full mr-2 border ${selectedCategory === c ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#0A192F] border-white/10'}`}>
                            <Text className={`font-bold ${selectedCategory === c ? 'text-[#0A192F]' : 'text-white'}`}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Limit</Text>
                <TextInput className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 text-xl font-bold" placeholder="0.00" placeholderTextColor="#475569" keyboardType="decimal-pad" value={newLimit} onChangeText={setNewLimit}/>
                
                <TouchableOpacity onPress={handleCreate} disabled={submitting} className="bg-[#64FFDA] p-4 rounded-xl items-center mb-4">
                    {submitting ? <ActivityIndicator color="#0A192F"/> : <Text className="text-[#0A192F] font-bold text-lg">Create Budget</Text>}
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center p-6">
            <View className="bg-[#112240] w-full rounded-3xl border border-white/10 p-6 shadow-2xl">
                <View className="flex-row justify-between mb-6">
                    <Text className="text-white text-xl font-bold">Edit Budget</Text>
                    <TouchableOpacity onPress={() => setEditVisible(false)}><X size={24} color="#8892B0"/></TouchableOpacity>
                </View>

                <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">New Limit</Text>
                <TextInput className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 text-xl font-bold" keyboardType="decimal-pad" value={editLimit} onChangeText={setEditLimit}/>

                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={handleDelete} className="flex-1 bg-red-500/10 border border-red-500/30 p-4 rounded-xl items-center"><Trash2 size={20} color="#F87171"/></TouchableOpacity>
                    <TouchableOpacity onPress={handleUpdate} disabled={submitting} className="flex-[3] bg-[#64FFDA] p-4 rounded-xl items-center">
                        {submitting ? <ActivityIndicator color="#0A192F"/> : <Text className="text-[#0A192F] font-bold text-lg">Update</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}