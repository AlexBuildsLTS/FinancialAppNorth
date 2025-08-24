import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/context/ThemeProvider';
import ScreenContainer from '@/components/ScreenContainer';
import { Search, Edit, UserX, Trash2 } from 'lucide-react-native';
import { getAllUsers, updateUserStatus, deleteUser } from '@/services/adminService';
import { UserProfile } from '@/types';
import EditUserModal from '@/components/admin/EditUserModal';

export default function ManageUsersScreen() {
    const { colors } = useTheme();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const fetchUsers = async () => {
        !loading && setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchUsers();
    }, []));

    const openEditModal = (user: UserProfile) => {
        setSelectedUser(user);
        setEditModalVisible(true);
    };

    const handleDeactivate = (user: UserProfile) => {
        Alert.alert(
            "Confirm Deactivation (Ban)",
            `Are you sure you want to ban ${user.email}? They will lose all access.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Deactivate",
                    onPress: async () => {
                        await updateUserStatus(user.id, 'Inactive');
                        fetchUsers();
                    },
                    style: "destructive",
                },
            ]
        );
    };
    
    const handleDelete = (user: UserProfile) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        await deleteUser(user.id);
                        fetchUsers();
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const renderUser = ({ item }: { item: UserProfile }) => (
        <View style={[styles.userRow, { backgroundColor: colors.surface }]}>
            <View style={styles.userInfo}>
                <Text style={[styles.userEmail, { color: colors.text }]}>{item.email}</Text>
                <Text style={{ color: colors.textSecondary }}>{item.role}</Text>
            </View>
            <View style={styles.userStatus}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#1DB95420' : '#FF450020' }]}>
                    <Text style={{ color: item.status === 'Active' ? '#1DB954' : '#FF4500' }}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
                    <Edit color={colors.textSecondary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeactivate(item)} style={styles.actionButton} disabled={item.status === 'Inactive'}>
                    <UserX color={item.status === 'Inactive' ? '#555' : 'orange'} size={20} />
                </TouchableOpacity>
                 <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                    <Trash2 color={'#FF4500'} size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <ScreenContainer>
            <View style={styles.searchContainer}>
                <Search color={colors.textSecondary} size={20} style={styles.searchIcon} />
                <TextInput style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]} placeholder="Search users..." placeholderTextColor={colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} />
            </View>

            {loading ? <ActivityIndicator size="large" color={colors.primary} /> : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUser}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            <EditUserModal 
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                user={selectedUser}
                onUserUpdate={fetchUsers}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    searchIcon: { position: 'absolute', left: 32, zIndex: 1 },
    searchInput: { flex: 1, height: 44, borderRadius: 22, paddingLeft: 40, paddingRight: 16, fontSize: 16 },
    listContainer: { paddingHorizontal: 16 },
    userRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10 },
    userInfo: { flex: 4 },
    userEmail: { fontSize: 16, fontWeight: '500' },
    userStatus: { flex: 2, alignItems: 'center' },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    userActions: { flex: 2, flexDirection: 'row', justifyContent: 'flex-end' },
    actionButton: { padding: 6, marginLeft: 8 },
});