// src/app/(tabs)/admin/manage-users.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useFocusEffect } from 'expo-router';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Card, RoleBadge, Avatar } from '@/shared/components';
import { User, UserRole } from '@/shared/types';
import { adminService } from '@/features/admin/services/adminService';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react-native';
import EditUserModal from '@/features/admin/components/EditUserModal';

// Mock data - replace with your actual API call
const fetchUsersFromAPI = async (): Promise<User[]> => {
    console.log("Fetching users...");
    // return await adminService.getUsers();
        return [ 
            { // Fix: Removed extra '}'
                id: '1', email: "test@example.com",
                full_name: '',
                display_name: '',
                avatar_url: null,
                role: UserRole.MEMBER
            }
        ]
}

interface UserListItemProps {
    user: User;
    onEdit: (user: User) => void;
    onToggleStatus: (userId: string, isActive: boolean) => void;
    onDelete: (userId: string) => void;
    colors: any;
}

const UserListItem = ({ user, onEdit, onToggleStatus, onDelete, colors }: UserListItemProps) => {
    const isActive = user.status === 'active';

    return (
        <Card style={styles.userCard}>
            <View style={styles.userInfo}>
                <Avatar
                    avatarUrl={user.avatar_url}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    userId={user.id}
                    size={48}
                />
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
    const { theme } = useTheme();
    const { colors } = theme;
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
        await loadUsers(); // Refresh the list after update
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
                        colors={colors}
                    />
                )}
                ListHeaderComponent={() => (
                    <Text style={[styles.header, { color: colors.text }]}>User Management</Text>
                )}
                contentContainerStyle={{ padding: 16 }}
            />
            {selectedUser && (
                <EditUserModal
                    visible={isModalVisible}
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
