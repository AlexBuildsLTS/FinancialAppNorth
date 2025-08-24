import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { getClientDashboardData } from '@/services/cpaService';
import { ClientDashboardData } from '@/types';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default function ClientDashboardScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id: clientId } = useLocalSearchParams();
    const [data, setData] = useState<ClientDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchClientData = useCallback(async () => {
        if (!clientId || typeof clientId !== 'string') return;
        try {
            setLoading(true);
            const result = await getClientDashboardData(clientId);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch client dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useFocusEffect(useCallback(() => {
        fetchClientData();
    }, [fetchClientData]));

    if (loading) {
        return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
    }

    if (!data) {
        return <ScreenContainer style={styles.centered}><Text style={{ color: colors.text }}>Could not load client data.</Text></ScreenContainer>;
    }
    
    const metrics = [
        { label: 'Balance', value: `$${data.totalBalance.toFixed(2)}` },
        { label: 'Income', value: `$${data.totalIncome.toFixed(2)}` },
        { label: 'Expenses', value: `$${data.totalExpenses.toFixed(2)}` },
    ];

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: data.profile.avatar_url || `https://i.pravatar.cc/150?u=${data.profile.id}` }} style={styles.headerAvatar} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{data.profile.display_name}'s Workspace</Text>
                </View>
                <View style={{width: 32}} />
            </View>

            <ScrollView>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Overview</Text>
                <MetricsGrid metrics={metrics} />
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Recent Client Transactions</Text>
                <RecentTransactions transactions={data.recentTransactions} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    backButton: { padding: 4 },
    headerInfo: { flexDirection: 'row', alignItems: 'center' },
    headerAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 16 },
});
