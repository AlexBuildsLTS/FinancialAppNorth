import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { orgService } from '@/services/orgService';
import { approvalService } from '@/services/approvalService';
import { Send, DollarSign, ShoppingBag, FileText } from 'lucide-react-native';

export default function RequestFundsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ amount: '', merchant: '', reason: '' });

  useEffect(() => {
    loadOrg();
  }, [user]);

  const loadOrg = async () => {
    if (!user) return;
    try {
      const org = await orgService.getMyOrganization(user.id);
      if (org) {
        setOrgId(org.id);
      } else {
        Alert.alert("No Organization", "You must join an organization to request funds.", [
          { text: "Create Org", onPress: () => router.push('/(main)/organization') },
          { text: "Cancel", style: "cancel" }
        ]);
      }
    } catch (e: any) {
      console.error('Failed to load organization:', e);
      Alert.alert("Error", "Could not load organization. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!orgId || !user) return;
    if (!form.amount || !form.merchant) return Alert.alert("Error", "Please fill required fields");

    setLoading(true);
    try {
      await approvalService.createRequest(orgId, user.id, {
        amount: parseFloat(form.amount),
        merchant: form.merchant,
        reason: form.reason
      });
      Alert.alert("Submitted", "Your request has been sent to your manager.");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 bg-slate-900">
      <Stack.Screen options={{ title: "Request Funds", headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
      
      <Text className="mb-6 text-slate-400">
        Submit an expense for approval. Once approved, it will be reimbursed or logged automatically.
      </Text>

      <View className="gap-4">
        {/* Amount */}
        <View>
            <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Amount</Text>
            <View className="flex-row items-center p-4 border bg-slate-800 rounded-xl border-slate-700">
                <DollarSign size={20} color="#10B981" />
                <TextInput 
                    className="flex-1 ml-3 text-xl font-bold text-white"
                    placeholder="0.00" 
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={form.amount}
                    onChangeText={t => setForm({...form, amount: t})}
                />
            </View>
        </View>

        {/* Merchant */}
        <View>
            <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Merchant / Vendor</Text>
            <View className="flex-row items-center p-4 border bg-slate-800 rounded-xl border-slate-700">
                <ShoppingBag size={20} color="#60A5FA" />
                <TextInput 
                    className="flex-1 ml-3 text-base text-white"
                    placeholder="e.g. Amazon AWS" 
                    placeholderTextColor="#475569"
                    value={form.merchant}
                    onChangeText={t => setForm({...form, merchant: t})}
                />
            </View>
        </View>

        {/* Reason */}
        <View>
            <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Business Purpose</Text>
            <View className="flex-row items-start h-32 p-4 border bg-slate-800 rounded-xl border-slate-700">
                <FileText size={20} color="#94A3B8" style={{ marginTop: 4 }} />
                <TextInput 
                    className="flex-1 ml-3 text-base leading-6 text-white"
                    placeholder="Explain why this expense is necessary..." 
                    placeholderTextColor="#475569"
                    multiline
                    textAlignVertical="top"
                    value={form.reason}
                    onChangeText={t => setForm({...form, reason: t})}
                />
            </View>
        </View>

        <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading || !orgId}
            className={`p-5 rounded-xl flex-row justify-center items-center mt-4 ${loading ? 'bg-slate-700' : 'bg-[#64FFDA]'}`}
        >
            {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                    <Send size={20} color="#0F172A" />
                    <Text className="ml-2 text-lg font-bold text-slate-900">Submit Request</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </View>
  );
}