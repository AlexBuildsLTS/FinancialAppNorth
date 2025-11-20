import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { GlassCard } from '@/shared/components/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, ShieldCheck, Activity, FileText } from 'lucide-react-native';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}>
        
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Admin Panel</Text>

        {/* Stats Grid */}
        <View style={styles.grid}>
          <GlassCard style={styles.card}>
            <Users size={24} color="#3B82F6" />
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>1,240</Text>
            <Text style={styles.label}>Users</Text>
          </GlassCard>
          
          <GlassCard style={styles.card}>
            <ShieldCheck size={24} color="#10B981" />
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>System</Text>
            <Text style={styles.label}>Healthy</Text>
          </GlassCard>
        </View>

        <GlassCard style={{ padding: 20, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
             <Activity size={20} color="#F59E0B" />
             <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Recent Activity</Text>
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
            • New user registration (alex@example.com)
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
            • System backup completed
          </Text>
        </GlassCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  grid: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, padding: 20, alignItems: 'center', borderRadius: 20 },
  value: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  label: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
});