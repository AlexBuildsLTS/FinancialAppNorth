import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Plus, ArrowRightLeft, Upload, FilePieChart } from 'lucide-react-native';
import { Card } from '@/shared/components';

const actions = [
  { text: 'Add Entry', icon: Plus, color: '#3B82F6', type: 'addTransaction' },
  { text: 'Transfer', icon: ArrowRightLeft, color: '#10B981', type: 'transfer' },
  { text: 'Add Bill', icon: Upload, color: '#F97316', type: 'addBill' },
  { text: 'Reports', icon: FilePieChart, color: '#8B5CF6', type: 'reports' },
];

const ActionButton = ({ action, onPress }: { action: typeof actions[0], onPress?: () => void }) => {
    const { theme: { colors } } = useTheme();
    
    return (
        <TouchableOpacity style={styles.actionContainer} onPress={onPress}>
            <View style={[styles.iconButton, { backgroundColor: action.color }]}>
                <action.icon color="#FFFFFF" size={26} />
            </View>
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{action.text}</Text>
        </TouchableOpacity>
    );
}

export default function QuickActions({ onAddTransaction }: { onAddTransaction: () => void }) {
    const { theme: { colors } } = useTheme();
  return (
    <Card style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
            {actions.map((action) => (
                <ActionButton 
                key={action.text} 
                action={action} 
                onPress={action.type === 'addTransaction' ? onAddTransaction : undefined} 
                />
            ))}
        </View>
    </Card>
  );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 20,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter-Bold',
        marginBottom: 20,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    actionContainer: {
        alignItems: 'center',
        gap: 12,
        width: '25%',
        marginBottom: 10,
    },
    iconButton: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        elevation: 5,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Inter-Medium',
    },
});