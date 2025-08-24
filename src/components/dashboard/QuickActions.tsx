import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Plus, Send } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeProvider';
import Card from '@/components/common/Card';

interface QuickActionsProps {
  onAddTransaction: () => void;
}

export default function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const { colors } = useTheme();

  const actions = [
    { label: 'Income', icon: ArrowUpRight, color: colors.success, onPress: onAddTransaction },
    { label: 'Expense', icon: ArrowDownLeft, color: colors.error, onPress: onAddTransaction },
    { label: 'Transfer', icon: Send, color: colors.primary, onPress: () => {} },
    { label: 'Add New', icon: Plus, color: colors.textSecondary, onPress: onAddTransaction },
  ];

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(400)}>
      <Card>
        <Text style={[styles.title, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionButton} onPress={action.onPress}>
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <action.icon color="#FFFFFF" size={24} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  actionButton: { alignItems: 'center', gap: 8 },
  iconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '500' },
});