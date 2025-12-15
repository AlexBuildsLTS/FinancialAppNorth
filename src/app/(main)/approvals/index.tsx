import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { approvalService } from '@/services/approvalService';
import { orgService } from '@/services/orgService';
import { ExpenseRequest } from '@/types';

export default function ApprovalsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'review'>('my');
  const [requests, setRequests] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    loadContext();
  }, [user]);

  useEffect(() => {
    if (orgId) loadRequests();
  }, [activeTab, orgId]);

  const loadContext = async () => {
    if (!user) return;
    const org = await orgService.getMyOrganization(user.id);
    if (org) {
        setOrgId(org.id);
        // Check if user is owner/admin (Simplified for MVP)
        setIsManager(org.owner_id === user.id); 
    }
  };

  const loadRequests = async () => {
    if (!user || !orgId) return;
    setLoading(true);
    try {
        if (activeTab === 'my') {
            const data = await approvalService.getMyRequests(user.id);
            setRequests(data || []);
        } else {
            const data = await approvalService.getPendingRequests(orgId);
            setRequests(data || []);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleApprove = async (req: ExpenseRequest) => {
    if (!user) return;
    try {
        await approvalService.approveRequest(req.id, req, user.id);
        loadRequests(); // Refresh
    } catch (e) {
        console.error("Approve failed", e);
    }
  };

  const handleReject = async (id: string) => {
    try {
        await approvalService.rejectRequest(id);
        loadRequests();
    } catch (e) {
        console.error("Reject failed", e);
    }
  };

  const renderItem = ({ item }: { item: ExpenseRequest }) => (
    <View className="p-4 mb-3 border bg-slate-800 rounded-xl border-slate-700">
        <View className="flex-row items-start justify-between mb-2">
            <View>
                <Text className="text-lg font-bold text-white">{item.merchant}</Text>
                <Text className="text-sm text-slate-400">{item.reason}</Text>
            </View>
            <Text className="text-[#64FFDA] font-bold text-lg">${item.amount.toFixed(2)}</Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
            <View className={`px-2 py-1 rounded flex-row items-center gap-1 ${
                item.status === 'approved' ? 'bg-green-500/20' : 
                item.status === 'rejected' ? 'bg-red-500/20' : 'bg-yellow-500/20'
            }`}>
                {item.status === 'approved' && <CheckCircle size={12} color="#4ADE80" />}
                {item.status === 'rejected' && <XCircle size={12} color="#F87171" />}
                {item.status === 'pending' && <Clock size={12} color="#FBBF24" />}
                <Text className={`text-xs font-bold uppercase ${
                    item.status === 'approved' ? 'text-green-400' : 
                    item.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                    {item.status}
                </Text>
            </View>
            <Text className="text-xs text-slate-500">
                {new Date(item.created_at).toLocaleDateString()}
            </Text>
        </View>

        {/* Manager Actions */}
        {activeTab === 'review' && item.status === 'pending' && (
            <View className="flex-row gap-3 pt-3 mt-4 border-t border-slate-700">
                <TouchableOpacity 
                    onPress={() => handleReject(item.id)}
                    className="items-center flex-1 py-3 rounded-lg bg-slate-700"
                >
                    <Text className="font-bold text-white">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleApprove(item)}
                    className="flex-1 bg-[#64FFDA] py-3 rounded-lg items-center"
                >
                    <Text className="font-bold text-slate-900">Approve & Pay</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen 
        options={{ 
            title: "Approvals", 
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push('/(main)/approvals/request')}>
                    <Plus size={24} color="#64FFDA" />
                </TouchableOpacity>
            )
        }} 
      />

      {/* Tabs */}
      <View className="flex-row gap-4 p-4">
        <TouchableOpacity 
            onPress={() => setActiveTab('my')}
            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'my' ? 'bg-slate-700' : 'bg-transparent'}`}
        >
            <Text className={`font-bold ${activeTab === 'my' ? 'text-white' : 'text-slate-500'}`}>My Requests</Text>
        </TouchableOpacity>
        
        {isManager && (
            <TouchableOpacity 
                onPress={() => setActiveTab('review')}
                className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'review' ? 'bg-slate-700' : 'bg-transparent'}`}
            >
                <Text className={`font-bold ${activeTab === 'review' ? 'text-white' : 'text-slate-500'}`}>To Review</Text>
            </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor="#64FFDA" />}
        ListEmptyComponent={
            <View className="items-center mt-10">
                <Text className="text-slate-500">No requests found.</Text>
            </View>
        }
      />
    </View>
  );
}