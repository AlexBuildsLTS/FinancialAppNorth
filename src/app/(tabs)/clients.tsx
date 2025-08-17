import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { getClients } from '@/services/dataService';
import { Client } from '@/types';
import { Plus, Search, AlertCircle, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AddClientModal from '@/components/forms/AddClientModal';

const ClientCard = ({ item, colors, onNavigate }: { item: Client; colors: any; onNavigate: () => void }) => {
  const statusColor = item.status === 'active' ? colors.success : item.status === 'pending' ? colors.warning : colors.textSecondary;
  
  return (
    <TouchableOpacity
      style={[styles.clientCard, { backgroundColor: colors.surface }]}
      onPress={onNavigate}
    >
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.companyName, { color: colors.textSecondary }]}>{item.companyName}</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.clientActions}>
        {item.uncategorized > 0 && (
          <View style={styles.alertBadge}>
            <AlertCircle color="#FFFFFF" size={14} />
            <Text style={styles.alertText}>{item.uncategorized}</Text>
          </View>
        )}
        <ChevronRight color={colors.textSecondary} size={24} />
      </View>
    </TouchableOpacity>
  );
};

export default function ClientsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadClients = useCallback(async () => {
    // No need to set loading true here for refetches, only initial load
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadClients();
  }, [loadClients]);

  // FIXED: This function now correctly updates the UI
  const handleClientAdded = (newClient: Client) => {
    // Optimistically update the UI for an instant response
    setClients(prevClients => [newClient, ...prevClients]);
    setIsModalVisible(false);
    // Optionally, you can still call loadClients() to sync with the "server"
    // loadClients(); 
  };

  const filteredClients = useMemo(() =>
    clients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    ), [clients, searchQuery]
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Clients</Text>
        <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsModalVisible(true)}
        >
          <Plus size={24} color={colors.primaryContrast} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.background }]}>
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            placeholder="Search clients..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
            <ClientCard 
              item={item} 
              colors={colors}
              onNavigate={() => router.push(`/client/${item.id}`)}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No clients found.
            </Text>
          </View>
        }
      />

      <AddClientModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={handleClientAdded}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'transparent' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  addButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { padding: 16, borderBottomWidth: 1, borderColor: 'rgba(128, 128, 128, 0.1)' },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16 },
  listContainer: { padding: 16, gap: 16, paddingBottom: 100 },
  clientCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(128, 128, 128, 0.1)' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '600' },
  companyName: { fontSize: 14, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  clientActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertBadge: { backgroundColor: '#EF4444', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyStateText: { fontSize: 16 },
});