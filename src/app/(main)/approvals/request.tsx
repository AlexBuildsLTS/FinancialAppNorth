import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/shared/context/AuthContext';
import { orgService } from '@/services/orgService';
import { approvalService } from '@/services/approvalService';
import { Send, DollarSign, ShoppingBag, FileText, ArrowLeft, Building2 } from 'lucide-react-native';

export default function RequestFundsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('');
  
  const [form, setForm] = useState({ amount: '', merchant: '', reason: '' });

  useEffect(() => {
    loadOrg();
  }, [user]);

  const loadOrg = async () => {
    if (!user) return;
    setOrgLoading(true);
    try {
      const org = await orgService.getMyOrganization(user.id);
      if (org) {
        setOrgId(org.id);
        setOrgName(org.name);
      }
    } catch (e: any) {
      console.error('Failed to load organization:', e);
    } finally {
      setOrgLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a request.");
      return;
    }
    
    if (!orgId) {
      Alert.alert("No Organization", "You must be part of an organization to request funds.", [
        { text: "Create Org", onPress: () => router.push('/(main)/organization') },
        { text: "Cancel", style: "cancel" }
      ]);
      return;
    }

    if (!form.amount || !form.merchant) {
      Alert.alert("Missing Fields", "Please fill in the amount and merchant/vendor fields.");
      return;
    }

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    try {
      await approvalService.createRequest(orgId, user.id, {
        amount: amount,
        merchant: form.merchant.trim(),
        reason: form.reason.trim() || 'No reason provided'
      });
      Alert.alert("Success", "Your expense request has been submitted and sent to your manager for approval.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e: any) {
      console.error("Submit request error:", e);
      Alert.alert("Error", e.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orgLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A192F]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
          <Text className="text-[#8892B0] mt-4">Loading organization...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen 
        options={{ 
          title: "New Expense Request",
          headerStyle: { backgroundColor: '#0A192F' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <ArrowLeft size={24} color="#64FFDA" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: Platform.OS === 'web' ? 32 : 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold mb-2">Request Funds</Text>
          <Text className="text-[#8892B0] text-base leading-6">
            Submit an expense for approval. Once approved by your manager, it will be automatically logged and processed.
          </Text>
        </View>

        {/* Organization Badge */}
        {orgName && (
          <View className="mb-6 flex-row items-center bg-[#112240] px-4 py-3 rounded-xl border border-[#64FFDA]/20">
            <Building2 size={18} color="#64FFDA" />
            <Text className="text-[#64FFDA] font-semibold ml-2">{orgName}</Text>
          </View>
        )}

        {!orgId && (
          <View className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <Text className="text-yellow-400 font-bold mb-1">No Organization</Text>
            <Text className="text-yellow-200/80 text-sm mb-3">
              You must be part of an organization to submit expense requests.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(main)/organization')}
              className="bg-yellow-500/20 px-4 py-2 rounded-lg self-start"
            >
              <Text className="text-yellow-400 font-bold">Create Organization</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Fields */}
        <View className="gap-6">
          {/* Amount */}
          <View>
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8892B0]">Amount</Text>
            <View className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5">
              <View className="w-12 h-12 bg-[#64FFDA]/10 rounded-xl items-center justify-center mr-4">
                <DollarSign size={24} color="#64FFDA" />
              </View>
              <View className="flex-1">
                <Text className="text-[#8892B0] text-xs mb-1">USD</Text>
                <TextInput 
                  className="text-white text-3xl font-bold"
                  placeholder="0.00" 
                  placeholderTextColor="#475569"
                  keyboardType="decimal-pad"
                  value={form.amount}
                  onChangeText={t => setForm({...form, amount: t.replace(/[^0-9.]/g, '')})}
                  editable={!loading && !!orgId}
                />
              </View>
            </View>
          </View>

          {/* Merchant */}
          <View>
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8892B0]">Merchant / Vendor</Text>
            <View className="flex-row items-center bg-[#112240] p-5 rounded-2xl border border-white/5">
              <View className="w-12 h-12 bg-blue-500/10 rounded-xl items-center justify-center mr-4">
                <ShoppingBag size={24} color="#60A5FA" />
              </View>
              <TextInput 
                className="flex-1 text-white text-lg font-medium"
                placeholder="e.g. Amazon AWS, Office Depot" 
                placeholderTextColor="#475569"
                value={form.merchant}
                onChangeText={t => setForm({...form, merchant: t})}
                editable={!loading && !!orgId}
              />
            </View>
          </View>

          {/* Reason */}
          <View>
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8892B0]">Business Purpose</Text>
            <View className="bg-[#112240] p-5 rounded-2xl border border-white/5 min-h-[140]">
              <View className="flex-row items-start mb-3">
                <View className="w-12 h-12 bg-purple-500/10 rounded-xl items-center justify-center mr-4">
                  <FileText size={24} color="#A78BFA" />
                </View>
                <View className="flex-1">
                  <TextInput 
                    className="text-white text-base leading-6"
                    placeholder="Explain why this expense is necessary for business operations..." 
                    placeholderTextColor="#475569"
                    multiline
                    textAlignVertical="top"
                    value={form.reason}
                    onChangeText={t => setForm({...form, reason: t})}
                    editable={!loading && !!orgId}
                    style={{ minHeight: 100 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading || !orgId || !form.amount || !form.merchant}
            className={`mt-4 p-5 rounded-2xl flex-row justify-center items-center shadow-lg ${
              loading || !orgId || !form.amount || !form.merchant
                ? 'bg-[#112240] border border-white/5' 
                : 'bg-[#64FFDA] shadow-[#64FFDA]/30'
            }`}
            style={{
              opacity: loading || !orgId || !form.amount || !form.merchant ? 0.5 : 1
            }}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#0A192F" size="small" />
                <Text className="ml-3 text-lg font-bold text-[#0A192F]">Submitting...</Text>
              </>
            ) : (
              <>
                <Send size={22} color="#0A192F" />
                <Text className="ml-3 text-lg font-bold text-[#0A192F]">Submit Request</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info Note */}
          <View className="mt-4 bg-[#112240]/50 p-4 rounded-xl border border-white/5">
            <Text className="text-[#8892B0] text-xs leading-5">
              💡 <Text className="font-semibold text-white">Tip:</Text> Your request will be reviewed by your organization's manager. You'll receive a notification once it's approved or rejected.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
