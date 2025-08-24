import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Edit } from 'lucide-react-native';
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
        if (!clientId) return;
        try {
            setLoading(true);
            const result = await getClientDashboardData(clientId as string);
            setData(result);
        } catch (error) {
            console.error('Failed to fetch client dashboard data:', error);
            // Handle error display
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useFocusEffect(fetchClientData);

    if (loading) {
        return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
    }

    if (!data) {
        return <ScreenContainer style={styles.centered}><Text style={{ color: colors.text }}>Could not load client data.</Text></ScreenContainer>;
    }
    
    const metrics = [
        { label: 'Balance', value: `$${data.totalBalance.toFixed(2)}`, currency: 'USD' },
        { label: 'Income', value: `$${data.totalIncome.toFixed(2)}`, currency: 'USD' },
        { label: 'Expenses', value: `$${data.totalExpenses.toFixed(2)}`, currency: 'USD' },
    ];

    return (
        <ScreenContainer>
            {/* Custom Header for the Client Workspace */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: data.profile.avatar_url || `https://i.pravatar.cc/150?u=${data.profile.id}` }} style={styles.headerAvatar} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{data.profile.display_name}'s Workspace</Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                   {/* Placeholder for future actions like 'Start Audit' */}
                </TouchableOpacity>
            </View>

            <ScrollView>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial Overview</Text>
                <MetricsGrid metrics={metrics} />

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Recent Client Transactions</Text>
                <RecentTransactions transactions={data.recentTransactions} />
                
                {/* Professionals can add/edit transactions on behalf of the client */}
                 <View style={styles.actionsContainer}>
                     <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                        <Text style={styles.actionButtonText}>Add Transaction</Text>
                     </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>Generate Report</Text>
                     </TouchableOpacity>
                 </View>

            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 4,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 4,
        opacity: 0, // Hidden for now
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    actionsContainer: {
        padding: 16,
        marginTop: 20,
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});