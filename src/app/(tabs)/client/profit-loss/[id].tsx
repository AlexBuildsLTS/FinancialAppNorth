import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getClientById } from '@/services/dataService';
import { Client } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';
import { PieChart, BarChart2, TrendingUp, ChevronRight, ListChecks, FileText, Users } from 'lucide-react-native';

const ReportCard = ({ title, description, icon: Icon, onPress, colors }: any) => (
    <TouchableOpacity style={[styles.reportCard, { backgroundColor: colors.surface }]} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
            <Icon color={colors.primary} size={28} />
        </View>
        <View style={styles.reportInfo}>
            <Text style={[styles.reportTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.reportDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={24} />
    </TouchableOpacity>
);

export default function ClientReportsHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const clientData = await getClientById(id);
        setClient(clientData || null);
      } catch (error) {
        console.error("Failed to load client data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const reports = [
    { title: "Profit & Loss", description: "View income, expenses, and net profit.", icon: BarChart2, onPress: () => router.push(`/client/reports/profit-loss/${id}`) },
    { title: "Balance Sheet", description: "Assets, liabilities, and equity snapshot.", icon: PieChart, onPress: () => router.push(`/client/reports/balance-sheet/${id}`) },
    { title: "Cash Flow Statement", description: "Inflows and outflows from activities.", icon: TrendingUp, onPress: () => router.push(`/client/reports/cash-flow/${id}`) },
  ];

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Financial Reports' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.clientName, { color: colors.text }]}>{client?.companyName || client?.name}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Select a statement to generate</Text>
        </View>

        <View style={styles.cardList}>
            {reports.map((report, index) => (
                <ReportCard 
                    key={index}
                    title={report.title}
                    description={report.description}
                    icon={report.icon}
                    colors={colors}
                    onPress={report.onPress}
                />
            ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 32 },
  clientName: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 16, marginTop: 4 },
  cardList: { gap: 16 },
  reportCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(128,128,128,0.1)', gap: 16 },
  iconContainer: { padding: 12, borderRadius: 99 },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 18, fontWeight: '600' },
  reportDescription: { fontSize: 14, marginTop: 2 },
});