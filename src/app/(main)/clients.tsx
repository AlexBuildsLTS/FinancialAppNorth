import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlusCircle, User, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useAuth } from '@/shared/context/AuthContext'; // Keep this line
import { getAssignedClients } from '@/shared/services/cpaService';
import { Profile, UserRole } from '@/shared/types';
import ScreenContainer from '@/shared/components/ScreenContainer';
import AddClientModal from '@/features/client-management/components/AddClientModal';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

const ClientListItem = ({ client, onPress }: { client: Profile, onPress: () => void }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.clientCard}>
                <View style={styles.clientInfo}>
                    <User color={colors.primary} size={24} />
                    <Text style={[styles.clientName, { color: colors.text }]}>{client.display_name}</Text>
                </View>
                <ChevronRight color={colors.textSecondary} size={24} />
            </Card>
        </TouchableOpacity>
    );
};

export default function ClientsScreen() {
    const { colors } = useTheme();
    const { profile } = useAuth();
    const router = useRouter();

    const [clients, setClients] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchClients = useCallback(async () => {
        if (profile?.id) {
            try {
                setLoading(true);
                const clientData = await getAssignedClients(profile.id);
                const profileData: Profile[] = clientData.map((client: any) => ({
                    id: client.id,
                    display_name: client.name,
                    avatar_url: client.avatarUrl,
                    email: client.email,
                    role: UserRole.CLIENT,
                    status: (client.status ?? 'active') as any, // ensure required 'status' exists on Profile
                }));
                setClients(profileData);
            } catch (error) {
                console.error("Failed to fetch clients", error);
            } finally {
                setLoading(false);
            }
        }
    }, [profile]);

    useFocusEffect(useCallback(() => { fetchClients(); }, [fetchClients]));

    if (loading) {
        return <ScreenContainer style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
    }

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>My Clients</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => setIsModalVisible(true)}>
                    <PlusCircle color={colors.primaryContrast} size={20} />
                    <Text style={[styles.addButtonText, { color: colors.primaryContrast }]}>Add Client</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={clients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ClientListItem
                        client={item}
                        onPress={() => router.push(`/client/${item.id}`)}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={{ color: colors.textSecondary }}>You have no clients assigned.</Text>
                    </View>
                }
            />
            <AddClientModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onClientAdded={fetchClients}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 24 },
    title: { fontSize: 32, fontWeight: 'bold' },
    addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, gap: 8 },
    addButtonText: { fontSize: 16, fontWeight: 'bold' },
    listContainer: { paddingHorizontal: 16 },
    clientCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    clientName: { fontSize: 18, fontWeight: '600' },
});
