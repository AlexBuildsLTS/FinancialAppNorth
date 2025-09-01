// src/app/(tabs)/admin/manage-users.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { useFocusEffect } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import { Card, RoleBadge, Avatar } from '@/components/common';
import { User, UserRole } from '@/types';
import { adminService } from '@/services'; // Assuming you have this service
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react-native';
import EditUserModal from '@/components/admin/EditUserModal';

// Mock data - replace with your actual API call
const fetchUsersFromAPI = async (): Promise<User[]> => {
    console.log("Fetching users...");
    // return await adminService.getUsers();
    return new Promise(resolve => setTimeout(() => resolve([
        { id: '1', display_name: 'Admin User', full_name: 'Admin User', email: 'admin@northfinance.io', role: UserRole.ADMIN, avatar_url: 'https://i.pravatar.cc/150?u=1', status: 'active' },
        { id: '2', display_name: 'CPA Professional', full_name: 'CPA Professional', email: 'cpa@accountants.com', role: UserRole.CPA, avatar_url: 'https://i.pravatar.cc/150?u=2', status: 'active' },
        { id: '3', display_name: 'Premium Client', full_name: 'Premium Client', email: 'premium@example.com', role: UserRole.PREMIUM_MEMBER, avatar_url: 'https://i.pravatar.cc/150?u=3', status: 'banned' },
        { id: '4', display_name: 'John Doe', full_name: 'John Doe', email: 'john.doe@example.com', role: UserRole.MEMBER, avatar_url: 'https://i.pravatar.cc/150?u=4', status: 'active' },
    ]), 1000));
};


interface UserListItemProps {
    user: User;
    onEdit: (user: User) => void;
    onToggleStatus: (userId: string, isActive: boolean) => void;
    onDelete: (userId: string) => void;
}

const UserListItem = ({ user, onEdit, onToggleStatus, onDelete }: UserListItemProps) => {
    const { colors } = useTheme();
    const isActive = user.status === 'active';

    return (
        <Card style={styles.userCard}>
            <View style={styles.userInfo}>
                <Avatar url={user.avatar_url} size={48} />
                <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.full_name || user.display_name}</Text>
                    <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                </View>
            </View>
            <View style={styles.roleContainer}>
                <RoleBadge role={user.role} />
            </View>
            <View style={styles.actionsContainer}>
                <Pressable onPress={() => onEdit(user)} style={styles.actionButton}>
                    <Edit size={20} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => onToggleStatus(user.id, isActive)} style={styles.actionButton}>
                    {isActive ? <UserX size={20} color={colors.warning} /> : <UserCheck size={20} color={colors.success} />}
                </Pressable>
                <Pressable onPress={() => onDelete(user.id)} style={styles.actionButton}>
                    <Trash2 size={20} color={colors.error} />
                </Pressable>
            </View>
        </Card>
    );
};

export default function ManageUsersScreen() {
    const { colors } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await fetchUsersFromAPI();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            // Add toast notification here
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUsers();
        }, [])
    );

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleToggleStatus = (userId: string, isActive: boolean) => {
        const action = isActive ? 'deactivate' : 'activate';
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: `Yes, ${action}`, onPress: () => console.log(`TODO: ${action} user ${userId}`) }
            ]
        );
    };

    const handleDelete = (userId: string) => {
         Alert.alert(
            `Confirm Deletion`,
            `This action is irreversible. Are you sure you want to delete this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: `Yes, Delete`, style: 'destructive', onPress: () => console.log(`TODO: Delete user ${userId}`) }
            ]
        );
    };
    
    const handleModalSave = async (updatedUser: User) => {
        // Here you would call your service to update the user in the database
        console.log("Saving user:", updatedUser);
        setModalVisible(false);
        loadUsers(); // Refresh the list
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <ScreenContainer>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <UserListItem 
                        user={item} 
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                    />
                )}
                ListHeaderComponent={() => (
                    <Text style={[styles.header, { color: colors.text }]}>User Management</Text>
                )}
                contentContainerStyle={{ padding: 16 }}
            />
            {selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    onClose={() => setModalVisible(false)}
                    onUserUpdated={handleModalSave}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    userCard: {
        padding: 16,
        marginBottom: 12,
        flexDirection: 'column',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
    },
    roleContainer: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderColor: '#eee', // Consider using colors.border
        paddingTop: 12,
        marginTop: 4,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});