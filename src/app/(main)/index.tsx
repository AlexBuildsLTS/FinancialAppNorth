import React, { useState, useCallback, useMemo } from 'react';
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
import AddTransactionModal from '@/features/transactions/AddTransactionModal';

// Helper function for consistent currency formatting
const formatCurrency = (value: number | undefined | null, locale: string = 'en-US', currency: string = 'USD'): string => {
    if (value == null) {
        return '0.00';
    }
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch (error) {
        console.error("Error formatting currency:", error);
        return value.toFixed(2); // Fallback
    }
};

export default function DashboardScreen() {
    const { theme: { colors } } = useTheme();
    const { profile } = useAuth();
    const { metrics, loading, refreshData } = useDashboardData();
    const router = useRouter();
    const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);

    // Memoize dashboard metrics to prevent unnecessary re-renders
    const dashboardMetrics: DashboardMetricItem[] = useMemo(() => [
        { title: 'Current Balance', value: formatCurrency(metrics?.totalBalance), Icon: Wallet },
        { title: 'Monthly Income', value: formatCurrency(metrics?.monthlyIncome), Icon: TrendingUp },
        { title: 'Monthly Expenses', value: formatCurrency(metrics?.monthlyExpenses), Icon: TrendingDown },
        { title: 'Savings Rate', value: 'N/A', Icon: PiggyBank }, // Placeholder for future calculation
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
                <MetricsGrid metricData={dashboardMetrics} />
                <ChartSection userId={profile?.id} />
                <QuickActions onAddTransaction={handleAddTransaction} />
                <RecentTransactions transactions={metrics?.recentTransactions || []} onAddTransaction={handleAddTransaction} />
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
