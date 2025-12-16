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
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, ArrowLeft, Filter, Download, FileText, X, Calendar, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../shared/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface AuditLogEntry {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  details: any; // JSONB field
  ip_address: string | null;
  created_at: string;
}

type FilterType = 'all' | 'create' | 'update' | 'delete' | 'approve' | 'reject';

export default function AuditLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

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

      if (data) {
        setLogs(data);
        applyFilter(data, selectedFilter);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (logData: AuditLogEntry[], filter: FilterType) => {
    if (filter === 'all') {
      setFilteredLogs(logData);
      return;
    }

    const filtered = logData.filter(item => {
      const actionLower = item.action.toLowerCase();
      switch (filter) {
        case 'create':
          return actionLower.includes('create') || actionLower.includes('insert');
        case 'update':
          return actionLower.includes('update') || actionLower.includes('modify');
        case 'delete':
          return actionLower.includes('delete') || actionLower.includes('remove');
        case 'approve':
          return actionLower.includes('approve') || actionLower.includes('accept');
        case 'reject':
          return actionLower.includes('reject') || actionLower.includes('deny');
        default:
          return true;
      }
    });
    setFilteredLogs(filtered);
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  useEffect(() => {
    applyFilter(logs, selectedFilter);
  }, [selectedFilter, logs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const exportToCSV = async () => {
    try {
      const headers = ['ID', 'Action', 'User ID', 'Organization ID', 'IP Address', 'Details', 'Timestamp'];
      const rows = filteredLogs.map(log => [
        log.id,
        log.action,
        log.user_id || '',
        log.organization_id || '',
        log.ip_address || '',
        JSON.stringify(log.details || {}),
        log.created_at
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      if (Platform.OS === 'web') {
        // Web: Download via blob
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Audit log exported to CSV');
      } else {
        // Native: Use FileSystem and Sharing
        const fileName = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `File saved to: ${fileUri}`);
        }
      }
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export audit log: ' + (error.message || 'Unknown error'));
    }
  };

  const exportToPDF = async () => {
    // For now, export as formatted text that can be converted to PDF
    // In production, use a library like react-native-pdf or @react-pdf/renderer
    try {
      const pdfContent = [
        'NORTHFINANCE AUDIT LOG REPORT',
        `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
        `Total Entries: ${filteredLogs.length}`,
        '',
        '='.repeat(80),
        '',
        ...filteredLogs.map(log => [
          `Action: ${log.action.toUpperCase()}`,
          `ID: ${log.id}`,
          `User: ${log.user_id || 'N/A'}`,
          `Organization: ${log.organization_id || 'N/A'}`,
          `Timestamp: ${format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}`,
          `IP: ${log.ip_address || 'N/A'}`,
          `Details: ${JSON.stringify(log.details || {}, null, 2)}`,
          '-'.repeat(80)
        ].join('\n'))
      ].join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Audit log exported (TXT format - can be converted to PDF)');
      } else {
        const fileName = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.txt`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, pdfContent, { encoding: FileSystem.EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `File saved to: ${fileUri}`);
        }
      }
    } catch (error: any) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export audit log: ' + (error.message || 'Unknown error'));
    }
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
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={exportToCSV}
            className="w-10 h-10 bg-[#64FFDA]/10 rounded-full items-center justify-center"
            style={{ elevation: 2, shadowColor: '#64FFDA', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }}
          >
            <Download size={18} color="#64FFDA" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilterVisible(true)}
            className={`w-10 h-10 rounded-full items-center justify-center ${selectedFilter !== 'all' ? 'bg-[#64FFDA]/20' : 'bg-[#64FFDA]/10'}`}
            style={{ elevation: 2, shadowColor: '#64FFDA', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }}
          >
            <Filter size={18} color="#64FFDA" />
          </TouchableOpacity>
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
        <>
          <FlatList
            data={filteredLogs}
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
                  {selectedFilter !== 'all' 
                    ? `No ${selectedFilter} actions found.` 
                    : 'No audit logs found. Actions will appear here as they occur.'}
                </Text>
              </View>
            }
          />

          {/* Filter Modal */}
          <Modal
            visible={filterVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setFilterVisible(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <TouchableOpacity 
                className="flex-1" 
                activeOpacity={1} 
                onPress={() => setFilterVisible(false)}
              />
              <View className="bg-[#112240] rounded-t-3xl p-6 border-t border-white/10">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-white text-xl font-bold">Filter Audit Log</Text>
                  <TouchableOpacity onPress={() => setFilterVisible(false)}>
                    <X size={24} color="#8892B0" />
                  </TouchableOpacity>
                </View>

                <View className="gap-3">
                  {(['all', 'create', 'update', 'delete', 'approve', 'reject'] as FilterType[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => {
                        setSelectedFilter(filter);
                        setFilterVisible(false);
                      }}
                      className={`flex-row items-center justify-between p-4 rounded-xl border ${
                        selectedFilter === filter
                          ? 'bg-[#64FFDA]/10 border-[#64FFDA]/30'
                          : 'bg-[#0A192F] border-white/5'
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <Text className="text-white font-semibold capitalize">{filter}</Text>
                        {filter !== 'all' && (
                          <Text className="text-[#8892B0] text-xs">
                            ({logs.filter(l => {
                              const a = l.action.toLowerCase();
                              return filter === 'create' ? (a.includes('create') || a.includes('insert')) :
                                     filter === 'update' ? (a.includes('update') || a.includes('modify')) :
                                     filter === 'delete' ? (a.includes('delete') || a.includes('remove')) :
                                     filter === 'approve' ? (a.includes('approve') || a.includes('accept')) :
                                     filter === 'reject' ? (a.includes('reject') || a.includes('deny')) : false;
                            }).length})
                          </Text>
                        )}
                      </View>
                      {selectedFilter === filter && (
                        <Check size={20} color="#64FFDA" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    onPress={exportToCSV}
                    className="flex-1 bg-[#64FFDA]/10 border border-[#64FFDA]/30 rounded-xl p-4 flex-row items-center justify-center gap-2"
                  >
                    <FileText size={18} color="#64FFDA" />
                    <Text className="text-[#64FFDA] font-semibold">Export CSV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={exportToPDF}
                    className="flex-1 bg-[#64FFDA]/10 border border-[#64FFDA]/30 rounded-xl p-4 flex-row items-center justify-center gap-2"
                  >
                    <FileText size={18} color="#64FFDA" />
                    <Text className="text-[#64FFDA] font-semibold">Export TXT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

