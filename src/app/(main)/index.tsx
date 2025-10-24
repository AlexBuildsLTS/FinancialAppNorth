import React, { useState, useCallback, useMemo } from 'react';

import { ScrollView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Wallet, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import ScreenContainer from '@/shared/components/ScreenContainer';
import {
    MetricsGrid,
    RecentTransactions,
} from '@/features/dashboard';
import { WelcomeHeader } from '@/features/dashboard/WelcomeHeader';
import { useAuth } from '@/shared/context/AuthContext';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { DashboardMetricItem } from '@/shared/types';
import AddTransactionModal from '@/features/transactions/AddTransactionModal';
import { formatCurrency } from '@/shared/utils/formatters';
import { SpendingTrends } from '@/features/dashboard/SpendingTrends';


export default function DashboardScreen() {
    const { theme: { colors } } = useTheme();
    const { profile } = useAuth();
    const { metrics, loading, refreshData } = useDashboardData();
    const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);

    // Memoize dashboard metrics to prevent unnecessary re-renders
    const dashboardMetrics: DashboardMetricItem[] = useMemo(() => [
        { title: 'Total Balance', value: formatCurrency(metrics?.totalBalance), Icon: Wallet, percentage: '+12.5%' },
        { title: 'Income This Month', value: formatCurrency(metrics?.monthlyIncome), Icon: TrendingUp, percentage: '+8.2%' },
        { title: 'Expenses This Month', value: formatCurrency(metrics?.monthlyExpenses), Icon: TrendingDown, percentage: '-3.1%' },
        { title: 'Budget Remaining', value: 'N/A', Icon: PiggyBank, percentage: '+5.4%' }, // Placeholder for future calculation
    ], [metrics]);

    // Memoize event handlers to prevent unnecessary re-renders of child components
    const handleAddTransaction = useCallback(() => {
        setIsAddTransactionModalVisible(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsAddTransactionModalVisible(false);
    }, []);

    const handleTransactionAdded = useCallback(() => {
        refreshData();
        handleModalClose();
    }, [refreshData, handleModalClose]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <ScreenContainer key={colors.background}>
            <ScrollView contentContainerStyle={styles.container}>
                <WelcomeHeader />
                <MetricsGrid metricData={dashboardMetrics} />
                <RecentTransactions transactions={metrics?.recentTransactions || []} />
                <SpendingTrends />
            </ScrollView>
            <AddTransactionModal
                visible={isAddTransactionModalVisible}
                onClose={handleModalClose}
                onSuccess={handleTransactionAdded}
                clientId={profile?.id || null} // Pass actual client ID if available, or null
            />
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
