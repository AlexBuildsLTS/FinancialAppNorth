// src/app/(tabs)/index.tsx

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Wallet, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import {
    DashboardHeader,
    MetricsGrid,
    ChartSection,
    QuickActions,
    RecentTransactions,
} from '@/components/dashboard';
import { useAuth } from '@/context/AuthContext';
import { DashboardMetricItem, Transaction } from '@/types';

export default function DashboardScreen() {
    const { colors } = useTheme();
    const { profile } = useAuth();
    
    // Dummy data - replace with real data from your services
    const metrics: DashboardMetricItem[] = [
        { title: 'Current Balance', value: '$12,545.80', change: 2.5, Icon: Wallet, changeType: 'positive' },
        { title: 'Income', value: '$5,600.00', change: 10, Icon: TrendingUp, changeType: 'positive' },
        { title: 'Expenses', value: '$3,450.12', change: 5, Icon: TrendingDown, changeType: 'negative' },
        { title: 'Savings Rate', value: '25%', change: 1, Icon: PiggyBank, changeType: 'positive' },
    ];
    
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ data: [2000, 4500, 2800, 8000, 9900, 4300] }],
    };

    const transactions: Transaction[] = [
        { 
            id: '1', 
            user_id: profile?.id || 'user-123', 
            account_id: 'account-456', 
            description: 'Grocery Store', 
            amount: -75.50, 
            type: 'expense', 
            date: new Date().toISOString(), 
            transaction_date: new Date().toISOString(), 
            category: 'Food', 
            status: 'cleared', 
            created_at: new Date().toISOString() 
        },
        { 
            id: '2', 
            user_id: profile?.id || 'user-123', 
            account_id: 'account-456', 
            description: 'Paycheck', 
            amount: 2500.00, 
            type: 'income', 
            date: new Date().toISOString(), 
            transaction_date: new Date().toISOString(), 
            category: 'Income', 
            status: 'cleared', 
            created_at: new Date().toISOString() 
        },
        { 
            id: '3', 
            user_id: profile?.id || 'user-123', 
            account_id: 'account-456', 
            description: 'Netflix Subscription', 
            amount: -15.99, 
            type: 'expense', 
            date: new Date().toISOString(), 
            transaction_date: new Date().toISOString(), 
            category: 'Bills', 
            status: 'cleared', 
            created_at: new Date().toISOString() 
        },
    ];

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <DashboardHeader title={profile?.full_name || 'User'} />
                <MetricsGrid metricData={metrics} />
                <ChartSection />
                <QuickActions onAddTransaction={() => {}} />
                <RecentTransactions transactions={transactions} onAddTransaction={() => {}} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});
