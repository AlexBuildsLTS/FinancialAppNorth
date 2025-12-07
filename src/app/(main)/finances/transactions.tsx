import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, SafeAreaView, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, X, DollarSign, AlignLeft, Trash2, Filter, Search } from 'lucide-react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { FlashList } from '@shopify/flash-list';
import { TransactionService } from '../../../services/transactionService';
import { useAuth } from '../../../shared/context/AuthContext';
import { Transaction } from '@/types';
import "../../../../global.css";

const CATEGORIES = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Income', 'Business', 'Shopping', 'Healthcare'];
type FilterType = 'All' | 'Income' | 'Expense';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const loadData = useCallback(async (refresh = false, loadMore = false) => {
    if (!user) return;

    if (refresh) setRefreshing(true);
    if (loadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const offset = loadMore ? transactions.length : 0;
      const type = filter === 'All' ? undefined : filter === 'Income' ? 'income' : 'expense';

      const result = await TransactionService.getTransactionsPaginated(user.id, {
        limit: 20,
        offset,
        type,
        search: searchQuery || undefined
      });

      if (loadMore) {
        setTransactions(prev => [...prev, ...result.transactions]);
      } else {
        setTransactions(result.transactions);
      }

      setHasMore(result.transactions.length === 20);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [user, filter, searchQuery, transactions.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadData(false, true);
    }
  }, [hasMore, loadingMore, loadData]);

  // Search input handler with debounce
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);


  const handleAdd = async () => {
    if (!amount || !description || !user) return;
    setLoading(true);
    try {
      const val = parseFloat(amount);
      const finalAmount = selectedCategory === 'Income' ? Math.abs(val) : -Math.abs(val);

      const newTx: Partial<Transaction> = {
        amount: finalAmount,
        description,
        category: selectedCategory,
        date: new Date().toISOString().split('T')[0],
        type: finalAmount >= 0 ? 'income' : 'expense'
      };

      await TransactionService.createTransaction(newTx, user.id);
      loadData(true); // Refresh data
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await TransactionService.deleteTransaction(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete transaction');
          }
      }}
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
          <Text className="text-[#8892B0]">Recent activity</Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalOpen(true)} className="w-12 h-12 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg">
          <Plus size={24} color="#0A192F" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="px-4 mb-4 flex-row gap-3">
        {['All', 'Income', 'Expense'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as FilterType)}
            className={`px-5 py-2 rounded-full border ${filter === f ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-transparent border-white/20'}`}
          >
            <Text className={`font-bold ${filter === f ? 'text-[#0A192F]' : 'text-white'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <View className="bg-[#112240] rounded-xl flex-row items-center px-4 py-3 border border-white/5">
          <Search size={20} color="#8892B0" />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder="Search transactions..."
            placeholderTextColor="#8892B0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlashList
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50)} layout={Layout.springify()}>
            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
              <View className="bg-[#112240] p-4 rounded-xl mb-3 flex-row items-center justify-between border border-white/5">
                <View className="flex-row items-center gap-4">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${Number(item.amount) > 0 ? 'bg-[#64FFDA]/10' : 'bg-white/5'}`}>
                    <Text className={`font-bold ${Number(item.amount) > 0 ? 'text-[#64FFDA]' : 'text-[#8892B0]'}`}>
                      {item.description ? item.description.charAt(0).toUpperCase() : '$'}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold">{item.description}</Text>
                    <Text className="text-[#8892B0] text-xs">{item.date}</Text>
                  </View>
                </View>
                <Text className={`font-bold ${Number(item.amount) > 0 ? 'text-[#64FFDA]' : 'text-white'}`}>
                  {Number(item.amount) > 0 ? '+' : ''}{Number(item.amount).toFixed(2)}
                </Text>
              </View>
            </Swipeable>
          </Animated.View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#64FFDA" style={{ marginTop: 50 }} />
          ) : (
            <View className="mt-20 items-center">
              <Filter size={40} color="#112240" />
              <Text className="text-[#8892B0] mt-4">No transactions found.</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#64FFDA" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#64FFDA" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        estimatedItemSize={80}
      />

      {/* Add Modal */}
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

              <TouchableOpacity onPress={handleAdd} disabled={loading} className="bg-[#64FFDA] py-4 rounded-xl items-center">
                {loading ? <ActivityIndicator color="#0A192F" /> : <Text className="text-[#0A192F] font-bold text-lg">Save Transaction</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}