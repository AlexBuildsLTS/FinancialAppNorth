import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { LifeBuoy } from 'lucide-react-native';

export default function ClientSupportScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Support Center</Text>
      <View style={styles.emptyContainer}>
        <LifeBuoy size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Help is on the way.
        </Text>
        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
          This support feature is currently under construction.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', paddingTop: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 16 },
  emptyText: { fontSize: 20, fontWeight: 'bold' },
  emptySubText: { fontSize: 14, textAlign: 'center' },
});