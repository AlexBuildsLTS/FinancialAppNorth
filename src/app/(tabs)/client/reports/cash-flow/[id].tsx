import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getTransactions, getClientById } from '@/services/dataService';
import { Transaction, Client } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';

const ReportRow = ({ label, value, level = 1, isTotal = false, colors }: any) => {
    const valueColor = value >= 0 ? colors.success : colors.error;
    return (
        <View style={[styles.row, isTotal && styles.totalRow, isTotal && { borderTopColor: colors.border }]}>
            <Text style={[styles.rowLabel, { marginLeft: level === 2 ? 16 : 0, fontWeight: isTotal ? 'bold' : 'normal', color: colors.text }]}>{label}</Text>
            <Text style={[styles.rowValue, { fontWeight: isTotal ? 'bold' : 'normal', color: isTotal ? valueColor : colors.text }]}>
                {value < 0 ? `($${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })})` : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </Text>
        </View>
    );
};

export default function CashFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [clientData, transactionData] = await Promise.all([
        getClientById(id),
        getTransactions(id),
      ]);
      setClient(clientData || null);
      setTransactions(transactionData);
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cashFlowData = useMemo(() => {
    const operating: Transaction[] = [];
    const investing: Transaction[] = [];
    const financing: Transaction[] = [];

    transactions.forEach(t => {
      const category = t.category || '';
      if (['Investing', 'Purchase of Equipment', 'Sale of Asset'].includes(category)) {
        investing.push(t);
      } else if (['Financing', 'Loan Repayment', 'Owner Investment'].includes(category)) {
        financing.push(t);
      } else {
        operating.push(t);
      }
    });

    const netFromOperating = operating.reduce((sum, t) => sum + t.amount, 0);
    const netFromInvesting = investing.reduce((sum, t) => sum + t.amount, 0);
    const netFromFinancing = financing.reduce((sum, t) => sum + t.amount, 0);
    const netChangeInCash = netFromOperating + netFromInvesting + netFromFinancing;

    return { operating, investing, financing, netFromOperating, netFromInvesting, netFromFinancing, netChangeInCash };
  }, [transactions]);

  if (loading) {
    return ( <ScreenContainer><ActivityIndicator style={styles.centered} size="large" color={colors.primary} /></ScreenContainer> );
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Cash Flow Statement' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.clientName, { color: colors.text }]}>{client?.companyName || client?.name}</Text>
          <Text style={[styles.reportTitle, { color: colors.textSecondary }]}>Statement of Cash Flows</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>For the period ending {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={[styles.reportContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Cash flow from Operating Activities</Text>
          {cashFlowData.operating.map((t) => <ReportRow key={t.id} label={t.title} value={t.amount} level={2} colors={colors} />)}
          <ReportRow label="Net cash from Operating Activities" value={cashFlowData.netFromOperating} isTotal colors={colors} />
          
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Cash flow from Investing Activities</Text>
          {cashFlowData.investing.map((t) => <ReportRow key={t.id} label={t.title} value={t.amount} level={2} colors={colors} />)}
          <ReportRow label="Net cash from Investing Activities" value={cashFlowData.netFromInvesting} isTotal colors={colors} />
          
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Cash flow from Financing Activities</Text>
          {cashFlowData.financing.map((t) => <ReportRow key={t.id} label={t.title} value={t.amount} level={2} colors={colors} />)}
          <ReportRow label="Net cash from Financing Activities" value={cashFlowData.netFromFinancing} isTotal colors={colors} />

          <ReportRow label="Net Change in Cash" value={cashFlowData.netChangeInCash} isTotal colors={colors} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, paddingBottom: 48 },
  header: { marginBottom: 24, alignItems: 'center' },
  clientName: { fontSize: 24, fontWeight: 'bold' },
  reportTitle: { fontSize: 16, marginTop: 4 },
  dateText: { fontSize: 14, marginTop: 8 },
  reportContainer: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  rowLabel: { fontSize: 16 },
  rowValue: { fontSize: 16, fontVariant: ['tabular-nums'] },
});