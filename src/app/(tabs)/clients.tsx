import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider'; // Keep this as default export
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ScreenContainer';
import { Search, UserPlus, ChevronRight } from 'lucide-react-native';
import { getAssignedClients } from '@/services/cpaService';
import { Client } from '@/types'; // Assuming Client is added to types

export default function ClientsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true); // Ensure loading is true before fetch
      const data: Client[] = await getAssignedClients(user.id);
      setClients(data);
    } catch (error) {
      console.error(error);
      // Handle error display
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => { fetchClients(); }, [fetchClients])
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity 
      style={[styles.clientRow, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/client-dashboard/${item.id}`)}
    >
      <Image source={{ uri: item.avatarUrl || `https://i.pravatar.cc/150?u=${item.id}` }} style={styles.avatar} />
      <View style={styles.clientInfo}>
        <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>{item.email}</Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={24} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Clients</Text>
        <TouchableOpacity style={styles.addButton}>
          <UserPlus color={colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={colors.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Search clients..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    You have no clients assigned.
                </Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    addButton: {
        padding: 8,
    },
    searchContainer: {
        padding: 16,
    },
    searchIcon: {
        position: 'absolute',
        top: 32,
        left: 32,
        zIndex: 1,
    },
    searchInput: {
        height: 50,
        borderRadius: 25,
        paddingLeft: 45,
        paddingRight: 20,
        fontSize: 16,
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    clientEmail: {
        fontSize: 14,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
    },
});