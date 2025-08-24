import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Search, User, Shield, ChevronRight } from 'lucide-react-native';

interface ClientUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string;
  role: string;
  client_mode_enabled: boolean;
  last_active: string;
}

export default function ClientSupportScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has permission to access this screen
    if (!user || !['Administrator', 'Professional Accountant', 'Support'].includes(user.role)) {
      Alert.alert('Access Denied', 'You do not have permission to access this feature.');
      router.back();
      return;
    }

    loadClients();
  }, [user]);

  const loadClients = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .in('role', ['Member', 'Premium Member'])
        .eq('client_mode_enabled', true)
        .order('display_name');

      if (searchQuery.trim()) {
        query = query.or(`display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClients();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const accessClientAccount = (client: ClientUser) => {
    Alert.alert(
      'Access Client Account',
      `You are about to access ${client.display_name}'s account. This action will be logged for security purposes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Access Account',
          onPress: () => {
            // Log the access attempt
            logClientAccess(client.id);
            // Navigate to client's dashboard with special context
            router.push(`/client-dashboard/${client.id}`);
          },
        },
      ]
    );
  };

  const logClientAccess = async (clientId: string) => {
    try {
      await supabase
        .from('audit_trails')
        .insert({
          user_id: user?.id,
          entity_type: 'client_access',
          entity_id: clientId,
          action: 'view',
          changes: { accessed_by: user?.role },
        });
    } catch (error) {
      console.error('Error logging client access:', error);
    }
  };

  const renderClientItem = ({ item }: { item: ClientUser }) => (
    <TouchableOpacity
      style={[styles.clientCard, { backgroundColor: colors.surface }]}
      onPress={() => accessClientAccount(item)}
    >
      <Image
        source={{ uri: item.avatar_url || `https://i.pravatar.cc/150?u=${item.id}` }}
        style={styles.avatar}
      />
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, { color: colors.text }]}>
          {item.display_name}
        </Text>
        <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>
          {item.email}
        </Text>
        <View style={styles.clientMeta}>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          <Text style={[styles.lastActive, { color: colors.textSecondary }]}>
            Last active: {new Date(item.last_active || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <ChevronRight color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Client Support Access' }} />
        <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Client Support Access' }} />
      
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.searchContainer}>
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search clients..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Shield color={colors.warning} size={20} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Only clients who have enabled "Professional Help" mode are shown here.
          All access attempts are logged for security.
        </Text>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientItem}
        contentContainerStyle={styles.clientsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <User size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Clients Available
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {searchQuery 
                ? 'No clients match your search criteria'
                : 'No clients have enabled professional help mode yet'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  searchInput: { flex: 1, fontSize: 16 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  infoText: { flex: 1, fontSize: 14 },
  clientsList: { padding: 16 },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '600' },
  clientEmail: { fontSize: 14, marginTop: 2 },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lastActive: { fontSize: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});