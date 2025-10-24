// src/app/(tabs)/admin/manage-users.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { useFocusEffect } from 'expo-router';
import ScreenContainer from '@/shared/components/ScreenContainer';
import { Cards } from '@/shared/components/Cards';
import RoleBadge from '@/shared/components/RoleBadge';
import { Avatar } from '@/shared/components/Avatar';
import { User, UserRole, ThemeColors } from '@/shared/types';
import * as adminService from '@/features/admin/services/adminService';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react-native';
import EditUserModal from '@/features/admin/components/EditUserModal';
import { useToast } from '@/shared/context/ToastProvider';

const fetchUsersFromAPI = async (): Promise<User[]> => {
    // This is a placeholder for actual API call
    // For now, returning mock data
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    // return []
    //     { id: '1', full_name: 'John Admin', display_name: 'John Admin', email: 'john@admin.com', role: UserRole.ADMIN, status: 'active', avatar_url: null, first_name: 'John', last_name: 'Admin' },
    //     { id: '2', full_name: 'Sarah CPA', display_name: 'Sarah CPA', email: 'sarah@cpa.com', role: UserRole.CPA, status: 'active', avatar_url: null, first_name: 'Sarah', last_name: 'CPA' },
    //     { id: '3', full_name: 'Mike Premium', display_name: 'Mike Premium', email: 'mike@premium.com', role: UserRole.PREMIUM_MEMBER, status: 'active', avatar_url: null, first_name: 'Mike', last_name: 'Premium' },
    //     { id: '4', full_name: 'Emily Support', display_name: 'Emily Support', email: 'emily@support.com', role: UserRole.SUPPORT, status: 'active', avatar_url: null, first_name: 'Emily', last_name: 'Support' },
    //     { id: '5', full_name: 'David Member', display_name: 'David Member', email: 'david@member.com', role: UserRole.MEMBER, status: 'active', avatar_url: null, first_name: 'David', last_name: 'Member' },    
    //     { id: '6', full_name: 'Lisa Suspended', display_name: 'Lisa Suspended', email: 'lisa@suspended.com', role: UserRole.MEMBER, status: 'suspended', avatar_url: null, first_name: 'Lisa', last_name: 'Suspended' },
    console.log("Fetching users...");
    return adminService.getUsers();
};
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
        <Cards style={styles.userCards}>
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
            <View style={[styles.actionsContainer, { borderColor: colors.border }]}>
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
        </Cards>
    );
};

export default function ManageUsersScreen() {
    const { theme } = useTheme();
    const { colors } = theme;
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const toast = useToast();

    const borderStyle = { borderColor: colors.border };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await fetchUsersFromAPI();
            setUsers(fetchedUsers);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            toast.show('Error', `Failed to fetch users: ${error.message || 'Unknown error'}`, 'error');
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

    const handleToggleStatus = async (userId: string, isActive: boolean) => {
        const action = isActive ? 'deactivate' : 'activate';
        const newStatus: 'active' | 'suspended' | 'banned' = isActive ? 'suspended' : 'active';

        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: `Yes, ${action}`,
                    onPress: async () => {
                        try {
                            await adminService.toggleUserStatus(userId, newStatus);
                            await loadUsers();
                            toast.show('Success', `User ${action}d successfully.`, 'success');
                        } catch (error: any) {
                            console.error(`Failed to ${action} user:`, error);
                            toast.show('Error', `Failed to ${action} user: ${error.message || 'Unknown error'}`, 'error');
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = (userId: string) => {
        Alert.alert(
            `Confirm Deletion`,
            `This action is irreversible. Are you sure you want to delete this user?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: `Yes, Delete`,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminService.deleteUser(userId);
                            await loadUsers();
                            toast.show('Success', 'User deleted successfully.', 'success');
                        } catch (error: any) {
                            console.error('Failed to delete user:', error);
                            toast.show('Error', `Failed to delete user: ${error.message || 'Unknown error'}`, 'error');
                        }
                    },
                },
            ]
        );
    };

    const handleModalSave = async (updatedUser: User) => {
        try {
            // Pass id and updates object separately
            await adminService.updateUser(updatedUser.id, {
                display_name: updatedUser.display_name,
                role: updatedUser.role,
            });
            setModalVisible(false);
            await loadUsers();
            toast.show('Success', 'User updated successfully.', 'success');
        } catch (error: any) {
            console.error('Failed to update user:', error);
            toast.show('Error', `Failed to update user: ${error.message || 'Unknown error'}`, 'error');
        }
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
                        colors={{ ...colors, secondary: '' }}
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
    userCards: {
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
