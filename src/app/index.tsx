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
    const { profile } = useAuth();
    const { colors } = useTheme();
    
    const welcomeMessage = profile?.display_name ? `Welcome back, ${profile.display_name}!` : "Welcome back!";

    return (
        <ScreenContainer>
            <DashboardHeader
                userName={profile?.display_name || 'User'}
                onPressProfile={() => router.push('/(tabs)/profile')}
                onPressSettings={() => router.push('/(tabs)/settings')}
                onPressMessages={() => router.push('/chat/1')}
            />
            <ScrollView contentContainerStyle={styles.container}>
                {/* We will uncomment these one by one */}
                
                {/* <MetricsGrid /> */}
                {/* <ChartSection /> */}
                
                {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text> */}
                {/* <QuickActions /> */}

                {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text> */}
                {/* <RecentTransactions /> */}
                
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
