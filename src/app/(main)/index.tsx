import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Wallet, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import ScreenContainer from '@/shared/components/ScreenContainer';
import {
    MetricsGrid,
    ChartSection,
    QuickActions,
    RecentTransactions,
} from '@/features/dashboard';
import { useAuth } from '@/shared/context/AuthContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { DashboardMetricItem } from '@/shared/types';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
    const { colors } = useTheme();
    const { profile } = useAuth();
    const { metrics, chartData, loading, refreshData } = useDashboardData();
    const router = useRouter();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const dashboardMetrics: DashboardMetricItem[] = [
        { title: 'Current Balance', value: `$${metrics?.totalBalance?.toFixed(2) ?? '0.00'}`, Icon: Wallet },
        { title: 'Monthly Income', value: `$${metrics?.monthlyIncome?.toFixed(2) ?? '0.00'}`, Icon: TrendingUp },
        { title: 'Monthly Expenses', value: `$${metrics?.monthlyExpenses?.toFixed(2) ?? '0.00'}`, Icon: TrendingDown },
        { title: 'Savings Rate', value: 'N/A', Icon: PiggyBank }, // Placeholder
    ];

    const handleAddTransaction = () => {
        router.push('/(main)/camera');
    };

    return (
        <ScreenContainer key={colors.background}>
            <ScrollView contentContainerStyle={styles.container}>
                <MetricsGrid metricData={dashboardMetrics} />
                <ChartSection userId={profile?.id} />
                <QuickActions onAddTransaction={handleAddTransaction} />
                <RecentTransactions transactions={metrics?.recentTransactions || []} onAddTransaction={handleAddTransaction} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 32, // Ensure space at the bottom
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
