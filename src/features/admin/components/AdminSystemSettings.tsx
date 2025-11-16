import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { RefreshCw, Database, Settings, FileText } from 'lucide-react-native'; // Icons for system actions

interface SystemActionButtonProps {
  title: string;
  Icon: React.ComponentType<any>;
  onPress: () => void;
  colors: any;
}

const SystemActionButton: React.FC<SystemActionButtonProps> = ({ title, Icon, onPress, colors }) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress}>
    <Icon size={24} color={colors.textPrimary} />
    <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>{title}</Text>
  </TouchableOpacity>
);

export const AdminSystemSettings: React.FC = () => {
  const { theme: { colors } } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>System Actions</Text>
      <View style={styles.actionsGrid}>
        <SystemActionButton title="Clear Cache" Icon={RefreshCw} onPress={() => console.log('Clear Cache')} colors={colors} />
        <SystemActionButton title="Backup Database" Icon={Database} onPress={() => console.log('Backup Database')} colors={colors} />
        <SystemActionButton title="Run Maintenance" Icon={Settings} onPress={() => console.log('Run Maintenance')} colors={colors} />
        <SystemActionButton title="View Logs" Icon={FileText} onPress={() => console.log('View Logs')} colors={colors} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%', // Two buttons per row
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
