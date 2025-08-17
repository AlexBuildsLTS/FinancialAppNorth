import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { getClientById } from '@/services/dataService';
import { Client } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';
import Card from '@/components/common/Card';
import { Banknote, FileText, Upload, PlusCircle, AlertCircle, TrendingUp } from 'lucide-react-native';

const MetricCard = ({ label, value, icon: Icon, colors }: any) => (
  <Card style={styles.metricCard}>
    <Icon color={colors.primary} size={24} />
    <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
  </Card>
);

export default function ClientDetailScreen() {
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

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!client) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Client not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: client.name }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.clientHeader}>
          <Image source={{ uri: client.avatarUrl }} style={styles.avatar} />
          <Text style={[styles.clientName, { color: colors.text }]}>{client.name}</Text>
          <Text style={[styles.companyName, { color: colors.textSecondary }]}>{client.companyName}</Text>
        </View>

        <View style={styles.metricsContainer}>
          <MetricCard label="Net Worth" value={`$${(client.netWorth / 1000000).toFixed(2)}M`} icon={TrendingUp} colors={colors} />
          <MetricCard label="Uncategorized" value={client.uncategorized} icon={AlertCircle} colors={colors} />
        </View>

        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
             <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/client/transactions/${client.id}`)}>
                <Banknote color={colors.primary} />
                <Text style={[styles.actionText, {color: colors.text}]}>Transactions</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/client/reports/${client.id}`)}>
                <FileText color={colors.primary} />
                <Text style={[styles.actionText, {color: colors.text}]}>Reports</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "Journal entry feature is under development.")}>
                <PlusCircle color={colors.primary} />
                <Text style={[styles.actionText, {color: colors.text}]}>Journal Entry</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "Document management is under development.")}>
                <Upload color={colors.primary} />
                <Text style={[styles.actionText, {color: colors.text}]}>Documents</Text>
             </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 24 },
  clientHeader: { alignItems: 'center', gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  clientName: { fontSize: 24, fontWeight: 'bold' },
  companyName: { fontSize: 16 },
  metricsContainer: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  metricCard: { flex: 1, alignItems: 'center', padding: 16, gap: 8 },
  metricValue: { fontSize: 20, fontWeight: 'bold' },
  metricLabel: { fontSize: 12, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, marginBottom: 16, backgroundColor: 'rgba(128,128,128,0.1)' },
  actionText: { fontSize: 14, fontWeight: '600' }
});