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

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CheckCircle, XCircle, Clock, DollarSign, FileText, Building2, TrendingUp, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { useAuth } from '@/shared/context/AuthContext';
import { approvalService } from '@/services/approvalService';
import { orgService } from '@/services/orgService';
import { supabase } from '@/lib/supabase';
import type { ExpenseRequest } from '@/types';

export default function ApprovalsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'review'>('my');
  const [requests, setRequests] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('');
  const [isManager, setIsManager] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    loadContext();
  }, [user]);

  useEffect(() => {
    if (user) loadRequests();
  }, [activeTab, orgId, user]);

  const loadContext = async () => {
    if (!user) return;
    try {
      const org = await orgService.getMyOrganization(user.id);
      if (org) {
        setOrgId(org.id);
        setOrgName(org.name);
        setIsManager(org.owner_id === user.id);
      }
    } catch (e) {
      console.error('Failed to load organization:', e);
    }
  };

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: ExpenseRequest[] = [];
      
      if (activeTab === 'my') {
        data = await approvalService.getMyRequests(user.id) || [];
      } else {
        if (!orgId) {
          setRequests([]);
          return;
        }
        data = await approvalService.getPendingRequests(orgId) || [];
      }

      setRequests(data);
      
      // Calculate stats for "My Requests" tab
      if (activeTab === 'my') {
        const pending = data.filter(r => r.status === 'pending').length;
        const approved = data.filter(r => r.status === 'approved').length;
        const rejected = data.filter(r => r.status === 'rejected').length;
        setStats({ pending, approved, rejected, total: data.length });
      }
    } catch (e: any) {
      console.error('Failed to load requests:', e);
      Alert.alert("Error", e.message || "Could not load expense requests.");
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeTab, orgId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

  /**
   * Approve expense request (Titan 3 - FOS Feature)
   * Automatically creates transaction and logs to audit trail
   */
  const handleApprove = async (req: ExpenseRequest) => {
    if (!user || !orgId) return;
    
    Alert.alert(
      "Approve Request",
      `Approve expense of $${req.amount.toFixed(2)} for ${req.merchant || 'Unknown'}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
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
                .maybeSingle();

              if (account) {
                await supabase.from('transactions').insert({
                  user_id: req.requester_id,
                  account_id: account.id,
                  amount: -Math.abs(req.amount), // Negative for expense
                  type: 'expense',
                  payee: req.merchant || 'Business Expense',
                  description: `Approved Request: ${req.reason || 'No reason provided'}`,
                  date: new Date().toISOString().split('T')[0],
                  status: 'cleared',
                  category: 'Business'
                });
              }

              // 3. Log to Audit Trail (Compliance - Titan 3)
              await supabase.from('audit_logs').insert({
                organization_id: orgId,
                user_id: user.id,
                action: 'request_approved',
                table_name: 'expense_requests',
                record_id: req.id,
                new_data: {
                  request_id: req.id,
                  amount: req.amount,
                  merchant: req.merchant,
                  requester_id: req.requester_id,
                  status: 'approved'
                },
                ip_address: '127.0.0.1'
              });

              Alert.alert("Success", "Request approved and transaction created.");
              loadRequests();
            } catch (e: any) {
              console.error("Approve failed", e);
              Alert.alert("Error", e.message || "Could not approve request.");
            }
          }
        }
      ]
    );
  };

  /**
   * Reject expense request with audit logging
   */
  const handleReject = async (req: ExpenseRequest) => {
    if (!user || !orgId) return;
    
    Alert.alert(
      "Reject Request",
      `Reject expense of $${req.amount.toFixed(2)} for ${req.merchant || 'Unknown'}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await approvalService.rejectRequest(req.id);
              
              // Log to Audit Trail
              await supabase.from('audit_logs').insert({
                organization_id: orgId,
                user_id: user.id,
                action: 'request_rejected',
                table_name: 'expense_requests',
                record_id: req.id,
                new_data: { request_id: req.id, status: 'rejected' },
                ip_address: '127.0.0.1'
              });

              Alert.alert("Success", "Request rejected.");
              loadRequests();
            } catch (e: any) {
              console.error("Reject failed", e);
              Alert.alert("Error", e.message || "Could not reject request.");
            }
          }
        }
      ]
    );
  };

  const getStatusConfig = (status: string | null) => {
    const statusValue = status || 'pending';
    switch (statusValue) {
      case 'approved':
        return { color: '#10B981', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle };
      case 'rejected':
        return { color: '#EF4444', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: XCircle };
      default:
        return { color: '#F59E0B', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: Clock };
    }
  };

  const renderItem = ({ item }: { item: ExpenseRequest }) => {
    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;

    return (
      <View className="bg-[#112240] p-5 rounded-2xl mb-4 border border-white/5 shadow-lg">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className={`w-10 h-10 ${statusConfig.bg} rounded-xl items-center justify-center mr-3`}>
                <StatusIcon size={20} color={statusConfig.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1">{item.merchant || 'Unknown Merchant'}</Text>
                <Text className="text-[#8892B0] text-xs">
                  {item.created_at ? format(new Date(item.created_at), 'MMM dd, yyyy • h:mm a') : 'Unknown date'}
                </Text>
              </View>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${statusConfig.bg} border ${statusConfig.border}`}>
            <Text className={`text-xs capitalize font-bold`} style={{ color: statusConfig.color }}>
              {item.status}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-[#64FFDA] text-3xl font-extrabold mb-1">${item.amount.toFixed(2)}</Text>
          {item.reason && (
            <View className="mt-3 bg-[#0A192F] p-3 rounded-xl border border-white/5">
              <Text className="text-[#8892B0] text-sm leading-5 italic">"{item.reason}"</Text>
            </View>
          )}
        </View>

        {/* Manager Actions (Titan 3 - FOS Control) */}
        {activeTab === 'review' && item.status === 'pending' && (
          <View className="flex-row gap-3 mt-2 border-t border-white/10 pt-4">
            <TouchableOpacity 
              onPress={() => handleReject(item)}
              className="flex-1 py-4 bg-red-500/10 rounded-xl items-center justify-center border border-red-500/30"
            >
              <XCircle size={20} color="#EF4444" />
              <Text className="text-red-400 font-bold mt-1">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleApprove(item)}
              className="flex-1 py-4 bg-[#64FFDA] rounded-xl items-center justify-center shadow-lg shadow-[#64FFDA]/20"
            >
              <CheckCircle size={20} color="#0A192F" />
              <Text className="text-[#0A192F] font-bold mt-1">Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen 
        options={{ 
          title: "Spend Control Tower",
          headerStyle: { backgroundColor: '#0A192F' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(main)/approvals/request')}
              className="mr-4 p-2 bg-[#64FFDA]/10 rounded-lg"
            >
              <Plus size={24} color="#64FFDA" />
            </TouchableOpacity>
          )
        }} 
      />

      {/* Header Section */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-white text-3xl font-extrabold mb-2">Approvals</Text>
        <Text className="text-[#8892B0] text-base">Spend Control Tower • Financial Operating System</Text>
        
        {orgName && (
          <View className="mt-4 flex-row items-center bg-[#112240] px-4 py-2.5 rounded-xl border border-[#64FFDA]/20 self-start">
            <Building2 size={16} color="#64FFDA" />
            <Text className="text-[#64FFDA] font-semibold ml-2">{orgName}</Text>
          </View>
        )}
      </View>

      {/* Stats Cards (My Requests Tab Only) */}
      {activeTab === 'my' && stats.total > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-6 mb-4"
          contentContainerStyle={{ gap: 12 }}
        >
          <View className="bg-[#112240] px-4 py-3 rounded-xl border border-white/5 min-w-[100]">
            <Text className="text-[#8892B0] text-xs mb-1">Total</Text>
            <Text className="text-white text-2xl font-bold">{stats.total}</Text>
          </View>
          <View className="bg-yellow-500/10 px-4 py-3 rounded-xl border border-yellow-500/20 min-w-[100]">
            <Text className="text-yellow-400 text-xs mb-1">Pending</Text>
            <Text className="text-yellow-400 text-2xl font-bold">{stats.pending}</Text>
          </View>
          <View className="bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20 min-w-[100]">
            <Text className="text-green-400 text-xs mb-1">Approved</Text>
            <Text className="text-green-400 text-2xl font-bold">{stats.approved}</Text>
          </View>
          <View className="bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 min-w-[100]">
            <Text className="text-red-400 text-xs mb-1">Rejected</Text>
            <Text className="text-red-400 text-2xl font-bold">{stats.rejected}</Text>
          </View>
        </ScrollView>
      )}

      {/* Tabs */}
      <View className="flex-row px-6 mt-2 mb-4 border-b border-white/10">
        <TouchableOpacity 
          onPress={() => setActiveTab('my')}
          className={`pb-3 mr-8 ${activeTab === 'my' ? 'border-b-2 border-[#64FFDA]' : ''}`}
        >
          <Text className={`${activeTab === 'my' ? 'text-white' : 'text-[#8892B0]'} font-bold text-base`}>
            My Requests
          </Text>
        </TouchableOpacity>
        
        {isManager && (
          <TouchableOpacity 
            onPress={() => setActiveTab('review')}
            className={`pb-3 ${activeTab === 'review' ? 'border-b-2 border-[#64FFDA]' : ''}`}
          >
            <Text className={`${activeTab === 'review' ? 'text-white' : 'text-[#8892B0]'} font-bold text-base`}>
              To Review
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
          <Text className="text-[#8892B0] mt-4">Loading requests...</Text>
        </View>
      ) : !orgId && activeTab === 'review' ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-[#112240] p-8 rounded-2xl border border-white/5 max-w-md">
            <AlertCircle size={48} color="#F59E0B" className="mb-4 self-center" />
            <Text className="text-white text-xl font-bold mb-2 text-center">No Organization</Text>
            <Text className="text-[#8892B0] text-center mb-6 leading-6">
              You need to be part of an organization to review expense requests.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(main)/organization')}
              className="bg-[#64FFDA] px-6 py-3 rounded-xl self-center"
            >
              <Text className="text-[#0A192F] font-bold">Create Organization</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 24, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />}
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-60">
              <DollarSign size={64} color="#8892B0" />
              <Text className="text-[#8892B0] text-center mt-6 text-lg font-semibold">
                {activeTab === 'my' 
                  ? 'You have no expense requests yet' 
                  : 'No pending requests to review'}
              </Text>
              <Text className="text-[#8892B0]/60 text-center mt-2 text-sm">
                {activeTab === 'my'
                  ? 'Tap the + button to create your first request'
                  : 'All requests have been processed'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
