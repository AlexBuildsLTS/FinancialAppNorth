import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { fetchAssignedClients } from '@/services/cpaService';
import { Profile } from '@/types';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

const ClientItem = ({
  client,
  colors,
  onPress,
}: {
  client: Profile;
  colors: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.itemContainer,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}
  >
    <Image
      source={{
        uri: client.avatar_url || `https://i.pravatar.cc/150?u=${client.id}`,
      }}
      style={styles.avatar}
    />
    <View style={styles.clientInfo}>
      <Text style={[styles.clientName, { color: colors.text }]}>
        {client.display_name}
      </Text>
      <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>
        {client.email}
      </Text>
    </View>
    <View style={styles.statusContainer}>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              client.assignment_status === 'active'
                ? colors.success
                : colors.primary,
          },
        ]}
      >
        <Text style={styles.statusText}>{client.assignment_status}</Text>
      </View>
      <ChevronRight color={colors.textSecondary} size={24} />
    </View>
  </TouchableOpacity>
);

export default function ClientsScreen() {
  const { colors } = useTheme();
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchAssignedClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to load clients on screen', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const handleClientPress = (client: Profile) => {
    // We will build this client workspace in the next step
    router.push(`/client/${client.id}`);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Client Management
      </Text>
      {clients.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You have not been assigned any clients.
          </Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientItem
              client={item}
              colors={colors}
              onPress={() => handleClientPress(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontFamily: 'Inter-Bold', padding: 16 },
  emptyText: { fontSize: 16, fontFamily: 'Inter-Regular' },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontFamily: 'Inter-Bold' },
  clientEmail: { fontSize: 14, fontFamily: 'Inter-Regular', marginTop: 4 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    textTransform: 'capitalize',
  },
});
