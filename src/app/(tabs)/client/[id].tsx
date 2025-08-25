import React from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../../context/ThemeProvider';
import { useProfile } from '../../../hooks/useProfile'; // A new hook to fetch profile by ID

// Re-usable dashboard components
import ScreenContainer from '../../../components/ScreenContainer';
import MetricsGrid from '../../../components/dashboard/MetricsGrid';
import ChartSection from '../../../components/dashboard/ChartSection';
import QuickActions from '../../../components/dashboard/QuickActions';
import RecentTransactions from '../../../components/dashboard/RecentTransactions';

export default function ClientDashboardScreen() {
    const { id } = useLocalSearchParams();
    const clientId = Array.isArray(id) ? id[0] : id;
    
    const { colors } = useTheme();
    const { profile: client, loading } = useProfile(clientId);

    if (loading || !client) {
        return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
    }
    
    // NOTE: All child components (MetricsGrid, ChartSection, etc.) would need to be
    // modified to accept an optional `userId` prop to fetch data for that specific user.
    // For now, they will show placeholder/global data.

    return (
        <ScreenContainer>
            <Stack.Screen options={{ title: `Managing: ${client.display_name}` }} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.clientName, { color: colors.text }]}>{client.display_name}</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Client Workspace</Text>
                </View>

                {/* These components would be passed the clientId to fetch specific data */}
                <MetricsGrid />
                <ChartSection />
                
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions for {client.display_name}</Text>
                <QuickActions />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Client Activity</Text>
                <RecentTransactions />
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { paddingBottom: 16 },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    clientName: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
        marginHorizontal: 16,
    },
});
