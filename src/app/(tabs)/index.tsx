import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
// CORRECTED IMPORTS:
import {
    DashboardHeader,
    MetricsGrid,
    ChartSection,
    QuickActions,
    RecentTransactions
} from '@/components/dashboard';

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();
    
    const welcomeMessage = user?.display_name ? `Welcome back, ${user.display_name}!` : "Welcome back!";

    return (
        <ScreenContainer>
            <DashboardHeader
                userName={user?.display_name || 'User'}
                onPressMessages={() => router.push('/chat/1')}
                onPressProfile={() => router.push('/(tabs)/profile')}
                onPressSettings={() => router.push('/(tabs)/settings')}
            />
            <ScrollView contentContainerStyle={styles.container}>
                <MetricsGrid />
                <ChartSection />
                
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <QuickActions />

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                <RecentTransactions />
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 24, marginBottom: 8, marginHorizontal: 16 },
});
