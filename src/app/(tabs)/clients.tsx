import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Search,
  Plus,
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalRevenue: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
}

export default function ClientsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const styles = createStyles(isDark);

  const clients: Client[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Innovations LLC',
      email: 'sarah@techinnovations.com',
      phone: '+1 (555) 123-4567',
      totalRevenue: 15750.0,
      lastActivity: '2 hours ago',
      status: 'active',
      avatar: 'SJ',
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Chen Consulting',
      email: 'michael@chenconsulting.com',
      phone: '+1 (555) 987-6543',
      totalRevenue: 22400.0,
      lastActivity: '1 day ago',
      status: 'active',
      avatar: 'MC',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      company: 'Rodriguez & Associates',
      email: 'emily@rodriguezlaw.com',
      phone: '+1 (555) 456-7890',
      totalRevenue: 8900.0,
      lastActivity: '3 days ago',
      status: 'pending',
      avatar: 'ER',
    },
    {
      id: '4',
      name: 'David Thompson',
      company: 'Thompson Enterprises',
      email: 'david@thompsonent.com',
      phone: '+1 (555) 321-0987',
      totalRevenue: 31200.0,
      lastActivity: '1 week ago',
      status: 'active',
      avatar: 'DT',
    },
  ];

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDark ? '#64ffda' : '#10b981';
      case 'pending':
        return isDark ? '#fbbf24' : '#f59e0b';
      case 'inactive':
        return isDark ? '#94a3b8' : '#6b7280';
      default:
        return isDark ? '#94a3b8' : '#6b7280';
    }
  };

  const renderClient = (client: Client, index: number) => (
    <Animated.View
      key={client.id}
      entering={FadeInUp.delay(300 + index * 50).springify()}
    >
      <TouchableOpacity style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{client.avatar}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientCompany}>{client.company}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(client.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(client.status) },
              ]}
            >
              {client.status}
            </Text>
          </View>
        </View>

        <View style={styles.clientDetails}>
          <View style={styles.detailRow}>
            <Mail size={16} color={isDark ? '#64748b' : '#9ca3af'} />
            <Text style={styles.detailText}>{client.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Phone size={16} color={isDark ? '#64748b' : '#9ca3af'} />
            <Text style={styles.detailText}>{client.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <DollarSign size={16} color={isDark ? '#64748b' : '#9ca3af'} />
            <Text style={styles.detailText}>
              Total Revenue: ${client.totalRevenue.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={16} color={isDark ? '#64748b' : '#9ca3af'} />
            <Text style={styles.detailText}>
              Last activity: {client.lastActivity}
            </Text>
          </View>
        </View>

        <View style={styles.clientActions}>
          <TouchableOpacity style={styles.actionButton}>
            <FileText size={16} color={isDark ? '#64ffda' : '#3b82f6'} />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Mail size={16} color={isDark ? '#64ffda' : '#3b82f6'} />
            <Text style={styles.actionButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={isDark ? '#0a192f' : '#ffffff'} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={isDark ? '#64748b' : '#9ca3af'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Stats */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.statsContainer}
      >
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{clients.length}</Text>
          <Text style={styles.statLabel}>Total Clients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {clients.filter((c) => c.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            $
            {clients
              .reduce((sum, c) => sum + c.totalRevenue, 0)
              .toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </Animated.View>

      {/* Clients List */}
      <ScrollView
        style={styles.clientsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredClients.map((client, index) => renderClient(client, index))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a192f' : '#f8fafc',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? '#0a192f' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1e293b' : '#e2e8f0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? '#64ffda' : '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#1f2937',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    statItem: {
      flex: 1,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6b7280',
      fontWeight: '500',
    },
    clientsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    clientCard: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    clientHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? '#64ffda' : '#3b82f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#0a192f' : '#ffffff',
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1f2937',
      marginBottom: 2,
    },
    clientCompany: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    clientDetails: {
      gap: 8,
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    clientActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#334155' : '#f1f5f9',
      borderRadius: 12,
      paddingVertical: 12,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#64ffda' : '#3b82f6',
    },
  });
