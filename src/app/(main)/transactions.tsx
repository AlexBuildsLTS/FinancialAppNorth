import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Plus, X, DollarSign, AlignLeft, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { supabase } from '../../lib/supabase'; // Ensure this points to your lib/supabase.ts
import { useAuth } from '../../shared/context/AuthContext';

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Income', 'Business', 'Shopping', 'Healthcare'];

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  user_id: string;
}

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  // FETCH TRANSACTIONS (Real Data)
  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!amount || !description || !user) return;
    
    const val = parseFloat(amount);
    const finalAmount = selectedCategory === 'Income' ? Math.abs(val) : -Math.abs(val);

    const newTx = {
      user_id: user.id,
      amount: finalAmount,
      description,
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTx])
        .select()
        .single();

      if (error) throw error;

      setTransactions([data, ...transactions]);
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add transaction: ' + error.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          const { error } = await supabase.from('transactions').delete().eq('id', id);
          if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
          } else {
            Alert.alert('Error', 'Could not delete transaction');
          }
        } 
      }
    ]);
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity onPress={() => handleDelete(id)} className="bg-red-500 justify-center items-end px-6 mb-3 ml-3 rounded-xl w-24">
      <Trash2 size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">Transactions</Text>
          <Text className="text-[#8892B0]">Your recent activity</Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalOpen(true)} className="w-12 h-12 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg">
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100)} layout={Layout.springify()}>
              <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                <View className="bg-[#112240] p-4 rounded-xl mb-3 flex-row items-center justify-between border border-white/5">
                  <View className="flex-row items-center gap-4">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${item.category === 'Income' ? 'bg-[#64FFDA]/10' : 'bg-white/5'}`}>
                      <Text className={`font-bold ${item.category === 'Income' ? 'text-[#64FFDA]' : 'text-[#8892B0]'}`}>{item.description.charAt(0)}</Text>
                    </View>
                    <View>
                      <Text className="text-white font-bold">{item.description}</Text>
                      <Text className="text-[#8892B0] text-xs">{item.category} • {item.date}</Text>
                    </View>
                  </View>
                  <Text className={`font-bold ${item.amount > 0 ? 'text-[#64FFDA]' : 'text-white'}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)}
                  </Text>
                </View>
              </Swipeable>
            </Animated.View>
          )}
        />
      )}

      {/* MODAL CODE SAME AS BEFORE, JUST KEPT FOR COMPLETENESS */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#112240] rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Add Transaction</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color="#8892B0" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Amount</Text>
              <View className="bg-[#0A192F] rounded-xl flex-row items-center px-4 py-4 mb-4 border border-white/10">
                <DollarSign size={20} color="#64FFDA" />
                <TextInput 
                  className="flex-1 text-white ml-2 text-2xl font-bold" 
                  placeholder="0.00" 
                  placeholderTextColor="#475569" 
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Description</Text>
              <View className="bg-[#0A192F] rounded-xl flex-row items-center px-4 py-3 mb-4 border border-white/10">
                <AlignLeft size={20} color="#8892B0" />
                <TextInput 
                  className="flex-1 text-white ml-2 text-base" 
                  placeholder="e.g. Lunch" 
                  placeholderTextColor="#475569"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
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

              <TouchableOpacity onPress={handleAdd} className="bg-[#64FFDA] py-4 rounded-xl items-center">
                <Text className="text-[#0A192F] font-bold text-lg">Save Transaction</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}