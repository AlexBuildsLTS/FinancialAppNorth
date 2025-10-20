// src/app/(tabs)/admin/index.tsx

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/shared/context/ThemeProvider';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Users, Settings, MessageSquare, BarChart3, ShieldCheck } from 'lucide-react-native';
import { Card } from '@/shared/components';
import type { LucideIcon } from 'lucide-react-native'; // Import LucideIcon type

interface AdminActionButtonProps {
    title: string;
    Icon: LucideIcon; // Use LucideIcon for better type safety
    onPress: () => void;
    description: string;
    colors: any;
}

const AdminActionButton = ({ title, Icon, onPress, description, colors }: AdminActionButtonProps) => {
    return (
        <Card style={styles.card}>
            <Pressable style={styles.button} onPress={onPress}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Icon color={colors.primary} size={24} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
                </View>
            </Pressable>
        </Card>
    );
};

export default function AdminDashboardScreen() {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>Admin Panel</Text>

                <AdminActionButton
                    title="User Management"
                    description="Edit roles, manage access, and view all users."
                    Icon={Users}
                    onPress={() => router.push('/(main)/admin/manage-users')}
                    colors={colors}
                />
                <AdminActionButton
                    title="System Analytics"
                    description="View application usage and health metrics."
                    Icon={BarChart3}
                    onPress={() => { /* Navigate to system analytics */ }}
                    colors={colors}
                />
                <AdminActionButton
                    title="Global Messaging"
                    description="Send announcements to all users."
                    Icon={MessageSquare}
                    onPress={() => { /* Navigate to global messaging */ }}
                    colors={colors}
                />
                <AdminActionButton
                    title="Security & Roles"
                    description="Configure role permissions and security settings."
                    Icon={ShieldCheck}
                    onPress={() => { /* Navigate to roles config */ }}
                    colors={colors}
                />
                 <AdminActionButton
                    title="System Settings"
                    description="Configure application-wide settings and integrations."
                    Icon={Settings}
                    onPress={() => { /* Navigate to system settings */ }}
                    colors={colors}
                />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    card: {
        marginBottom: 16,
        padding: 0, // Remove padding from card to let Pressable handle it
    },
    button: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 12,
        borderRadius: 8,
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        marginTop: 4,
    },
});