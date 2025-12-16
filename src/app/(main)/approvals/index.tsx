/**
 * ============================================================================
 * 🏛️ NORTHFINANCE: SPEND CONTROL TOWER (FOS - Financial Operating System)
 * ============================================================================
 * Enterprise-grade expense approval workflow.
 * Enables managers to approve/reject expense requests with automatic
 * transaction creation and comprehensive audit logging.
 * 
 * Fortune 500 Rule: "Money does not leave the building without a signature."
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, CheckCircle, XCircle, Clock, DollarSign, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';
import { approvalService } from '@/services/approvalService';
import { orgService } from '@/services/orgService';
import { supabase } from '@/lib/supabase';
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

  /**
   * Approve expense request (Titan 3 - FOS Feature)
   * Automatically creates transaction and logs to audit trail
   */
  const handleApprove = async (req: ExpenseRequest) => {
    if (!user || !orgId) return;
    try {
        // 1. Update Request Status
        const { error: updateError } = await supabase
          .from('expense_requests')
          .update({ status: 'approved' })
          .eq('id', req.id);

        if (updateError) throw updateError;

        // 2. AUTOMATICALLY Create Transaction (Automation - Titan 2)
        const { data: account } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', req.requester_id)
          .limit(1)
          .single();

        if (account) {
          await supabase.from('transactions').insert({
            user_id: req.requester_id,
            account_id: account.id,
            amount: -Math.abs(req.amount), // Negative for expense
            type: 'expense',
            payee: req.merchant || 'Business Expense',
            description: `Approved Request: ${req.reason || 'No reason provided'}`,
            date: new Date().toISOString(),
            status: 'cleared',
            category: 'Business'
          });
        }

        // 3. Log to Audit Trail (Compliance - Titan 3)
        await supabase.from('audit_logs').insert({
          organization_id: orgId,
          user_id: user.id,
          action: 'request_approved',
          details: {
            request_id: req.id,
            amount: req.amount,
            merchant: req.merchant,
            requester_id: req.requester_id
          },
          ip_address: '127.0.0.1' // In production, get from request headers
        });

        Alert.alert("Success", "Request approved and transaction created.");
        loadRequests();
    } catch (e: any) {
        console.error("Approve failed", e);
        Alert.alert("Error", e.message || "Could not approve request.");
    }
  };

  /**
   * Reject expense request with audit logging
   */
  const handleReject = async (id: string) => {
    if (!user || !orgId) return;
    try {
        await approvalService.rejectRequest(id);
        
        // Log to Audit Trail
        await supabase.from('audit_logs').insert({
          organization_id: orgId,
          user_id: user.id,
          action: 'request_rejected',
          details: { request_id: id },
          ip_address: '127.0.0.1'
        });

        Alert.alert("Success", "Request rejected.");
        loadRequests();
    } catch (e: any) {
        console.error("Reject failed", e);
        Alert.alert("Error", e.message || "Could not reject request.");
    }
  };

  const renderItem = ({ item }: { item: ExpenseRequest }) => (
    <View className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5">
        <View className="flex-row justify-between items-start mb-2">
            <View>
                <Text className="text-white font-bold text-lg">{item.merchant || 'Unknown Merchant'}</Text>
                <Text className="text-[#8892B0] text-xs">{format(new Date(item.created_at), 'MMM dd, yyyy')}</Text>
            </View>
            <View className={`px-2 py-1 rounded-full ${
                item.status === 'approved' ? 'bg-green-500/20' : 
                item.status === 'rejected' ? 'bg-red-500/20' : 'bg-yellow-500/20'
            }`}>
                <Text className={`text-xs capitalize font-bold ${
                    item.status === 'approved' ? 'text-green-400' : 
                    item.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                    {item.status}
                </Text>
            </View>
        </View>

        <Text className="text-white text-2xl font-bold mb-2">${item.amount.toFixed(2)}</Text>
        <Text className="text-[#8892B0] mb-4 italic">"{item.reason || 'No reason provided'}"</Text>

        {/* Manager Actions (Titan 3 - FOS Control) */}
        {activeTab === 'review' && item.status === 'pending' && (
            <View className="flex-row gap-3 mt-2 border-t border-white/10 pt-3">
                <TouchableOpacity 
                    onPress={() => handleReject(item.id)}
                    className="flex-1 py-3 bg-red-500/20 rounded-lg items-center border border-red-500/50"
                >
                    <Text className="text-red-400 font-bold">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleApprove(item)}
                    className="flex-1 py-3 bg-[#64FFDA] rounded-lg items-center"
                >
                    <Text className="text-[#0A192F] font-bold">Approve & Pay</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#0A192F]">
      <Stack.Screen 
        options={{ 
            title: "Spend Control Tower", 
            headerStyle: { backgroundColor: '#0A192F' },
            headerTintColor: '#fff',
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push('/(main)/approvals/request')}>
                    <Plus size={24} color="#64FFDA" />
                </TouchableOpacity>
            )
        }} 
      />

      {/* Header Section */}
      <View className="p-6 pb-2">
        <Text className="text-white text-3xl font-bold">Approvals</Text>
        <Text className="text-[#8892B0]">Spend Control Tower (FOS)</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mt-4 mb-2">
        <TouchableOpacity 
            onPress={() => setActiveTab('my')}
            className={`pb-2 mr-6 ${activeTab === 'my' ? 'border-b-2 border-[#64FFDA]' : ''}`}
        >
            <Text className={`${activeTab === 'my' ? 'text-white' : 'text-[#8892B0]'} font-bold`}>My Requests</Text>
        </TouchableOpacity>
        
        {isManager && (
            <TouchableOpacity 
                onPress={() => setActiveTab('review')}
                className={`pb-2 ${activeTab === 'review' ? 'border-b-2 border-[#64FFDA]' : ''}`}
            >
                <Text className={`${activeTab === 'review' ? 'text-white' : 'text-[#8892B0]'} font-bold`}>To Review (Manager)</Text>
            </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor="#64FFDA" />}
          ListEmptyComponent={
              <View className="items-center mt-10 opacity-50">
                  <DollarSign size={48} color="#8892B0" />
                  <Text className="text-[#8892B0] text-center mt-4">No requests found.</Text>
              </View>
          }
        />
      )}
    </View>
  );
}