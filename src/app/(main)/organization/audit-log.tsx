/**
 * ============================================================================
 * 🛡️ NORTHFINANCE: COMPLIANCE VAULT (FOS - Financial Operating System)
 * ============================================================================
 * Enterprise-grade audit log viewer for complete financial transparency.
 * 
 * Fortune 500 Rule: "Trust, but verify. Then verify the verification."
 * 
 * This read-only screen displays immutable audit records for compliance,
 * security audits, and regulatory requirements (SOX, GDPR, etc.).
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, ArrowLeft, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../shared/context/AuthContext';

interface AuditLogEntry {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  details: any; // JSONB field
  ip_address: string | null;
  created_at: string;
}

export default function AuditLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch audit logs (Protected by RLS - Admin/Owner only in production)
   */
  const fetchLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In production, ensure this query is protected by RLS (Admin Only)
      // For now, we fetch logs for the user's organization
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to last 100 entries for performance

      if (error) {
        console.error('Audit log fetch error:', error);
        return;
      }

      if (data) setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  /**
   * Render individual audit log entry
   */
  const renderItem = ({ item }: { item: AuditLogEntry }) => {
    const actionColor = 
      item.action.includes('approved') ? '#10B981' :
      item.action.includes('rejected') ? '#EF4444' :
      item.action.includes('created') ? '#64FFDA' :
      item.action.includes('deleted') ? '#F87171' : '#8892B0';

    return (
      <View className="flex-row items-center py-3 border-b border-white/5 px-6">
        <View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: actionColor }} />
        <ShieldAlert size={16} color="#8892B0" className="mr-3" />
        <View className="flex-1">
          <Text className="text-white font-mono text-xs mb-1">
            <Text className="text-[#64FFDA] uppercase font-bold">{item.action}</Text>
            {' '} • {item.details?.request_id?.substring(0, 8) || item.id.substring(0, 8)}...
          </Text>
          {item.details && typeof item.details === 'object' && (
            <Text className="text-[#8892B0] text-[10px] mt-1" numberOfLines={1}>
              {JSON.stringify(item.details).substring(0, 60)}...
            </Text>
          )}
          <Text className="text-[#8892B0] text-[10px] mt-1">ID: {item.id.substring(0, 8)}...</Text>
        </View>
        <View className="items-end">
          <Text className="text-[#8892B0] text-xs">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
          {item.ip_address && (
            <Text className="text-[#8892B0] text-[10px] mt-1">{item.ip_address}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-white/10">
        <View 
          onTouchEnd={() => router.back()}
          className="p-2 -ml-2 rounded-full active:bg-white/5"
        >
          <ArrowLeft size={24} color="#8892B0" />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-white text-2xl font-bold">System Audit Log</Text>
          <Text className="text-[#8892B0] text-xs">Immutable Record • SOX Compliance Mode</Text>
        </View>
        <View className="w-10 h-10 bg-[#64FFDA]/10 rounded-full items-center justify-center">
          <Filter size={18} color="#64FFDA" />
        </View>
      </View>

      {/* Info Banner */}
      <View className="mx-6 mt-4 p-3 bg-[#64FFDA]/5 rounded-xl border border-[#64FFDA]/20">
        <Text className="text-[#64FFDA] text-xs font-semibold mb-1">🔒 Compliance Notice</Text>
        <Text className="text-[#8892B0] text-[10px] leading-4">
          All financial actions are logged for audit purposes. This log is immutable and cannot be modified.
        </Text>
      </View>

      {/* Log List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64FFDA" />
          <Text className="text-[#8892B0] mt-4">Loading audit trail...</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#64FFDA" />
          }
          ListEmptyComponent={
            <View className="items-center mt-20 opacity-50">
              <ShieldAlert size={64} color="#8892B0" />
              <Text className="text-[#8892B0] mt-4 text-center px-8">
                No audit logs found. Actions will appear here as they occur.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

