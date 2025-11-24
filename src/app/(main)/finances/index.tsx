import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { getTransactions, createTransaction, deleteTransaction } from '../../../services/dataService';
import { Transaction } from '../../../types';
import { Plus, X, TrendingUp, TrendingDown, Trash2, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsTab() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTransactions(user.id);
      setTransactions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAdd = async () => {
    if (!newAmount || !newDesc || !user) return;
    setSubmitting(true);
    try {
      await createTransaction({
        amount: parseFloat(newAmount) * (newType === 'expense' ? -1 : 1),
        description: newDesc,
        type: newType,
        date: new Date().toISOString(),
        status: 'completed',
        category: 'General'
      }, user.id);
      setModalVisible(false);
      setNewAmount('');
      setNewDesc('');
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete', 'Confirm delete?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTransaction(id); loadData(); } }
    ]);
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View className="bg-[#112240] p-4 rounded-xl border border-[#233554] mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${item.amount >= 0 ? 'bg-[#64FFDA]/10' : 'bg-[#F472B6]/10'}`}>
          {item.amount >= 0 ? <TrendingUp size={20} color="#64FFDA" /> : <TrendingDown size={20} color="#F472B6" />}
        </View>
        <View>
          <Text className="text-white font-bold text-base">{item.description}</Text>
          <View className="flex-row items-center gap-1">
             <Calendar size={12} color="#8892B0" />
             <Text className="text-[#8892B0] text-xs">{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      <View className="items-end">
        <Text className={`text-lg font-bold ${item.amount >= 0 ? 'text-[#64FFDA]' : 'text-white'}`}>
          {item.amount >= 0 ? '+' : ''}{item.amount.toFixed(2)}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} className="mt-1">
           <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]" edges={['top']}>
      <View className="px-6 py-4 border-b border-[#233554] flex-row justify-between items-center">
        <Text className="text-xl font-bold text-white">Transactions</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-[#64FFDA] w-10 h-10 rounded-full items-center justify-center">
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#64FFDA" /></View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 24 }}
          ListEmptyComponent={<Text className="text-[#8892B0] text-center mt-10">No transactions found.</Text>}
        />
      )}

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#112240] rounded-t-3xl p-6 border-t border-[#233554]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">New Entry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#8892B0" /></TouchableOpacity>
            </View>
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity onPress={() => setNewType('expense')} className={`flex-1 p-3 rounded-xl border items-center ${newType === 'expense' ? 'bg-[#F472B6]/20 border-[#F472B6]' : 'bg-[#0A192F] border-[#233554]'}`}>
                <Text className={`${newType === 'expense' ? 'text-[#F472B6]' : 'text-[#8892B0]'} font-bold`}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNewType('income')} className={`flex-1 p-3 rounded-xl border items-center ${newType === 'income' ? 'bg-[#64FFDA]/20 border-[#64FFDA]' : 'bg-[#0A192F] border-[#233554]'}`}>
                <Text className={`${newType === 'income' ? 'text-[#64FFDA]' : 'text-[#8892B0]'} font-bold`}>Income</Text>
              </TouchableOpacity>
            </View>
            <TextInput className="bg-[#0A192F] text-white p-4 rounded-xl border border-[#233554] mb-4 text-lg" placeholder="0.00" placeholderTextColor="#475569" keyboardType="numeric" value={newAmount} onChangeText={setNewAmount} />
            <TextInput className="bg-[#0A192F] text-white p-4 rounded-xl border border-[#233554] mb-6" placeholder="Description" placeholderTextColor="#475569" value={newDesc} onChangeText={setNewDesc} />
            <TouchableOpacity onPress={handleAdd} disabled={submitting} className="bg-[#64FFDA] h-14 rounded-xl items-center justify-center mb-6">
              {submitting ? <ActivityIndicator color="#0A192F" /> : <Text className="text-[#0A192F] font-bold text-lg">Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}