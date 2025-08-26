import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { Plus, ArrowRightLeft, Upload, FilePieChart } from 'lucide-react-native';

const actions = [
  { text: 'Add Entry', icon: Plus, color: '#3B82F6', type: 'addTransaction' },
  { text: 'Transfer', icon: ArrowRightLeft, color: '#10B981', type: 'transfer' },
  { text: 'Add Bill', icon: Upload, color: '#F97316', type: 'addBill' },
  { text: 'Reports', icon: FilePieChart, color: '#8B5CF6', type: 'reports' },
];

const ActionButton = ({ action, onPress }: { action: typeof actions[0], onPress?: () => void }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.actionContainer}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: action.color }]} onPress={onPress}>
                <action.icon color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{action.text}</Text>
        </View>
    );
}

export default function QuickActions({ onAddTransaction }: { onAddTransaction: () => void }) {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <ActionButton 
          key={action.text} 
          action={action} 
          onPress={action.type === 'addTransaction' ? onAddTransaction : undefined} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
  },
  actionContainer: {
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    // Adding a subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
