import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import ChartSection from '@/components/dashboard/ChartSection';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import { useAuth } from '@/context/AuthContext';

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();
    const welcomeMessage = user?.display_name ? `Welcome back, ${user.display_name}!` : "Welcome back!";

    return (
        <ScreenContainer>
            <DashboardHeader
                userName={user?.user_metadata?.display_name || 'User'}
                onPressMessages={() => router.push('/chat/1')}
                onPressProfile={function (): void {
                    throw new Error('Function not implemented.');
                }}
                onPressSettings={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
          {'}'} {'}'}            /{'>'}
            <ScrollView contentContainerStyle={styles.container}>
                <MetricsGrid />
                <ChartSection />
                
                {/* Section Title */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <QuickActions onAddTransaction={function (): void {
            throw new Error('Function not implemented.');
          } } />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                <RecentTransactions />
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
        marginHorizontal: 16,
    },
});