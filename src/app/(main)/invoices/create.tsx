import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/shared/context/AuthContext';
import { DollarSign, User, Calendar, Send } from 'lucide-react-native';

export default function CreateInvoice() {
  const router = useRouter();
  const { user } = useAuth();
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!client || !amount) return Alert.alert("Missing Fields", "Please fill in client and amount.");
    
    setLoading(true);
    try {
        // Use the existing 'transactions' table but mark it as 'income' and 'pending'
        // Ideally, you would create a separate 'invoices' table, but we use what we have for now.
        const { error } = await supabase.from('transactions').insert({
            user_id: user?.id,
            amount: parseFloat(amount),
            type: 'income', 
            status: 'pending', // Important: It's not paid yet
            payee: client, // We use Payee field for Client Name
            description: `Invoice: ${description}`,
            date: new Date().toISOString(),
            account_id: (await supabase.from('accounts').select('id').eq('user_id', user?.id).limit(1).single()).data?.id // Auto-select first account
        });

        if (error) throw error;
        Alert.alert("Success", "Invoice Created & Sent!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e) {
        Alert.alert("Error", "Could not create invoice.");
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-slate-900">
      <Stack.Screen options={{ title: "New Invoice", headerBackTitle: "Cancel" }} />
      
      <View className="gap-4 mt-4">
         <View>
            <Text className="mb-2 ml-1 text-slate-400">Client Name</Text>
            <View className="flex-row items-center p-4 border bg-slate-800 rounded-xl border-slate-700">
               <User size={20} color="#94A3B8" />
               <TextInput 
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="e.g. Acme Corp" 
                  placeholderTextColor="#475569"
                  value={client}
                  onChangeText={setClient}
               />
            </View>
         </View>

         <View>
            <Text className="mb-2 ml-1 text-slate-400">Amount</Text>
            <View className="flex-row items-center p-4 border bg-slate-800 rounded-xl border-slate-700">
               <DollarSign size={20} color="#10B981" />
               <TextInput 
                  className="flex-1 ml-3 text-lg font-bold text-white"
                  placeholder="0.00" 
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
               />
            </View>
         </View>

         <View>
            <Text className="mb-2 ml-1 text-slate-400">Description</Text>
            <View className="h-32 p-4 border bg-slate-800 rounded-xl border-slate-700">
               <TextInput 
                  className="flex-1 text-base text-white"
                  placeholder="Services rendered for..." 
                  placeholderTextColor="#475569"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
               />
            </View>
         </View>

         <TouchableOpacity 
            onPress={handleCreate}
            disabled={loading}
            className="bg-[#64FFDA] p-5 rounded-xl flex-row justify-center items-center mt-4"
         >
            <Send size={20} color="#0F172A" />
            <Text className="ml-2 text-lg font-bold text-slate-900">
                {loading ? "Sending..." : "Create & Send Invoice"}
            </Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}