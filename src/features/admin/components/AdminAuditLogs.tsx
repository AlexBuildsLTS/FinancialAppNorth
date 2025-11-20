import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { Cards } from '@/shared/components/Cards';
import { Download } from 'lucide-react-native'; // Icon for Export Logs

interface AuditLogItemProps {
  type: string;
  description: string;
  user: string;
  timestamp: string;
  resource?: string;
  ipAddress?: string;
  colors: any;
}

const AuditLogItem: React.FC<AuditLogItemProps> = ({ type, description, user, timestamp, resource, ipAddress, colors }) => {
  let typeColor = colors.primary; // Default
  if (type.includes('Role Changed')) typeColor = colors.accent;
  if (type.includes('Suspended')) typeColor = colors.error;
  if (type.includes('Feature Flag')) typeColor = colors.success;
  if (type.includes('Ticket Resolved')) typeColor = colors.info;

  return (
    <Cards style={styles.logItem}>
      <View style={[styles.logIconContainer, { backgroundColor: typeColor + '20' }]}>
        <Text style={[styles.logIconText, { color: typeColor }]}>{user.charAt(0)}</Text>
      </View>
      <View style={styles.logDetails}>
        <Text style={[styles.logDescription, { color: colors.textPrimary }]}>{description}</Text>
        <Text style={[styles.logMeta, { color: colors.textSecondary }]}>
          By {user} on {timestamp}
        </Text>
        {resource && <Text style={[styles.logMeta, { color: colors.textSecondary }]}>Resource: {resource}</Text>}
        {ipAddress && <Text style={[styles.logMeta, { color: colors.textSecondary }]}>IP: {ipAddress}</Text>}
      </View>
    </Cards>
  );
};

export const AdminAuditLogs: React.FC = () => {
  const { theme: { colors } } = useTheme();

  // Mock audit logs for now
  const mockAuditLogs = [
    {
      type: 'User Role Changed',
      description: 'User Role Changed from Member to CPA',
      user: 'John Admin',
      timestamp: '2024-09-30 14:30:00',
      resource: 'User: sarah@cpa.com',
      ipAddress: '192.168.1.100',
    },
    {
      type: 'User Suspended',
      description: 'User Suspended',
      user: 'John Admin',
      timestamp: '2024-09-30 12:00:00',
      resource: 'User: lisa@suspended.com',
      ipAddress: '192.168.1.100',
    },
    {
      type: 'Feature Flag Updated',
      description: 'Feature Flag Updated: Advanced Analytics',
      user: 'John Admin',
      timestamp: '2024-09-20 09:00:00',
      resource: 'Feature: Advanced Analytics',
      ipAddress: '192.168.1.100',
    },
    {
      type: 'Ticket Resolved',
      description: 'Ticket Resolved',
      user: 'Emily Support',
      timestamp: '2024-09-20 09:45:00',
      resource: 'Ticket: #1234',
      ipAddress: '192.168.1.100',
    },
    {
      type: 'System Announcement',
      description: 'System Announcement: Maintenance',
      user: 'John Admin',
      timestamp: '2024-09-19 08:00:00',
      resource: 'Scheduled maintenance notification',
      ipAddress: '192.168.1.100',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Audit Logs</Text>
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]} onPress={() => console.log('Export Logs')}>
          <Download size={18} color={colors.surfaceContrast} />
          <Text style={[styles.exportButtonText, { color: colors.surfaceContrast }]}>Export Logs</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {mockAuditLogs.map((log, index) => (
          <AuditLogItem
            key={index}
            type={log.type}
            description={log.description}
            user={log.user}
            timestamp={log.timestamp}
            resource={log.resource}
            ipAddress={log.ipAddress}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    marginLeft: 5,
    fontWeight: '600',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    marginBottom: 10,
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logDetails: {
    flex: 1,
  },
  logDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logMeta: {
    fontSize: 13,
    marginBottom: 2,
  },
});
