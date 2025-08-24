import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Users, DollarSign, UserPlus, Star } from 'lucide-react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@/context/ThemeProvider';
import { getSystemStats } from '@/services/adminService';
import Card from '@/components/common/Card';

const StatCard = ({ icon: Icon, label, value, colors }: any) => (
    <Card style={styles.statCard}>
        <Icon color={colors.primary} size={28} />
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Card>
);

export default function AdminDashboardScreen() {
    const { colors } = useTheme();
    const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, newSignups: 0, activeSubscriptions: 0 });
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => {
        getSystemStats().then(setStats).catch(console.error).finally(() => setLoading(false));
    }, []));

    if (loading) {
        return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>
    }

    return (
        <ScreenContainer>
            <ScrollView>
                <Text style={[styles.title, { color: colors.text }]}>System Dashboard</Text>
                <View style={styles.grid}>
                    <StatCard icon={Users} label="Total Users" value={stats.totalUsers} colors={colors} />
                    <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} colors={colors} />
                    <StatCard icon={UserPlus} label="New Signups (24h)" value={stats.newSignups} colors={colors} />
                    <StatCard icon={Star} label="Active Subscriptions" value={stats.activeSubscriptions} colors={colors} />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', padding: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingHorizontal: 8 },
    statCard: { width: '46%', margin: '2%', alignItems: 'center', paddingVertical: 20 },
    statValue: { fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
    statLabel: { fontSize: 14 },
});