import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { BarChart3, Calendar, Download } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { generateFinancialStatement, FinancialStatement } from '@/services/accountingService';
import ScreenContainer from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Cards } from '@/components/Cards';
import ProfitLossStatement from '@/features/reports/ProfitLossStatement'; // We will create this
import BalanceSheet from '@/features/reports/BalanceSheet'; // We will create this

type ReportType = 'profit_loss' | 'balance_sheet'; // Cash flow is not supported by generateFinancialStatement

export default function ReportsScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const { session } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('profit_loss');
  const [reportData, setReportData] = useState<FinancialStatement | null>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder dates - a real implementation would use a date picker modal
  const [periodStart, setPeriodStart] = useState('2025-01-01');
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerateReport = async () => {
    if (!session?.user) return;
    setLoading(true);
    setReportData(null);
    try { // Changed to getFinancialStatementData
      const data = await generateFinancialStatement(reportType, session.user.id, periodStart, periodEnd, 'USD');
      setReportData(data);
    } catch (error) {
      console.error(`Failed to generate ${reportType} report:`, error);
      Alert.alert('Error', 'Could not generate the financial report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Financial Reports</Text>
        <TouchableOpacity style={styles.headerButton}><Download color={colors.primary} size={24} /></TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, reportType === 'profit_loss' && styles.activeTab, { backgroundColor: reportType === 'profit_loss' ? colors.primary : colors.surface }]}
            onPress={() => setReportType('profit_loss')}>
            <Text style={[styles.tabText, { color: reportType === 'profit_loss' ? 'white' : colors.text }]}>Profit & Loss</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, reportType === 'balance_sheet' && styles.activeTab, { backgroundColor: reportType === 'balance_sheet' ? colors.primary : colors.surface }]}
            onPress={() => setReportType('balance_sheet')}>
            <Text style={[styles.tabText, { color: reportType === 'balance_sheet' ? 'white' : colors.text }]}>Balance Sheet</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.datePickerButton}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }}>{periodStart} to {periodEnd}</Text>
        </TouchableOpacity>
      </View>

      <Button title="Generate Report" onPress={handleGenerateReport} isLoading={loading} style={{ marginHorizontal: 16, marginBottom: 16 }} />

      <ScrollView contentContainerStyle={styles.reportContainer}>
        {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />}

        {!loading && reportData && (
          reportData.type === 'profit_loss'
            ? <ProfitLossStatement data={reportData.data} />
            : <BalanceSheet data={reportData.data} />
        )}

        {!loading && !reportData && (
          <View style={styles.emptyContainer}>
            <BarChart3 size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Select a report type and generate to view data.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 32, fontWeight: 'bold' },
  headerButton: { padding: 8 },
  controlsContainer: { padding: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#2A2A2A', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  activeTab: {},
  tabText: { fontWeight: 'bold' },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: '#2A2A2A', borderRadius: 8 },
  reportContainer: { paddingHorizontal: 16, paddingBottom: 50 },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
