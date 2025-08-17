import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getTransactions, getClientById } from '@/services/dataService';
import { Transaction, Client } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';
import Button from '@/components/common/Button';
import { exportToXLSX } from '@/utils/fileUtils';
import { Calendar, Download } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReportRow = ({ label, value, isTotal = false, isPositive = false, isNegative = false, colors }: any) => (
  <View style={[styles.row, isTotal && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
    <Text style={[styles.rowLabel, isTotal && styles.rowLabelTotal, { color: colors.text }]}>{label}</Text>
    <Text style={[styles.rowValue, isPositive && { color: colors.success }, isNegative && { color: colors.error }]}>
      ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </Text>
  </View>
);

export default function ProfitAndLossScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

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

  const reportData = useMemo(() => {
    const incomeByCategory: { [key: string]: number } = {};
    const expenseByCategory: { [key: string]: number } = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Math.abs(t.amount);
      }
    });

    const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0);
    const netProfit = totalIncome - totalExpense;

    return { incomeByCategory, expenseByCategory, totalIncome, totalExpense, netProfit };
  }, [transactions]);

  const handleExport = () => {
    const exportData = [
      { Section: 'INCOME' },
      ...Object.entries(reportData.incomeByCategory).map(([key, value]) => ({ Category: key, Amount: value })),
      { Section: 'Total Income', Amount: reportData.totalIncome },
      { Section: ' ' },
      { Section: 'EXPENSES' },
      ...Object.entries(reportData.expenseByCategory).map(([key, value]) => ({ Category: key, Amount: value })),
      { Section: 'Total Expenses', Amount: reportData.totalExpense },
      { Section: ' ' },
      { Section: 'NET PROFIT', Amount: reportData.netProfit },
    ];
    exportToXLSX(exportData, `${client?.name}_Profit_Loss_Report`);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || (showDatePicker === 'start' ? startDate : endDate);
    setShowDatePicker(null);
    if(showDatePicker === 'start') {
        setStartDate(currentDate);
    } else {
        setEndDate(currentDate);
    }
  };

  if (loading) {
    return ( <ScreenContainer><ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} size="large" color={colors.primary} /></ScreenContainer> );
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Profit & Loss Statement' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.clientName, { color: colors.text }]}>{client?.companyName || client?.name}</Text>
          <Text style={[styles.reportTitle, { color: colors.text }]}>Profit & Loss Statement</Text>
          <TouchableOpacity style={styles.dateRange}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>Jan 1, 2025 - Dec 31, 2025</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.reportContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Income</Text>
          {Object.entries(reportData.incomeByCategory).map(([category, amount]) => (
            <ReportRow key={category} label={category} value={amount} colors={colors} />
          ))}
          <ReportRow label="Total Income" value={reportData.totalIncome} isTotal isPositive colors={colors} />

          <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 24 }]}>Expenses</Text>
          {Object.entries(reportData.expenseByCategory).map(([category, amount]) => (
            <ReportRow key={category} label={category} value={amount} colors={colors} />
          ))}
          <ReportRow label="Total Expenses" value={reportData.totalExpense} isTotal isNegative colors={colors} />

          <View style={{ marginTop: 24 }}>
            <ReportRow label="Net Profit" value={reportData.netProfit} isTotal isPositive={reportData.netProfit >= 0} isNegative={reportData.netProfit < 0} colors={colors} />
          </View>
        </View>

        <Button title="Export as XLSX" onPress={handleExport} icon={Download} style={{ marginTop: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24 },
  clientName: { fontSize: 20, fontWeight: 'bold' },
  reportTitle: { fontSize: 16, marginTop: 4 },
  dateRange: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  dateText: { fontSize: 14 },
  reportContainer: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 16 },
  rowLabelTotal: { fontWeight: 'bold' },
  rowValue: { fontSize: 16, fontWeight: '500' },
});