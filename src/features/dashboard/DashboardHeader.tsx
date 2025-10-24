// src/components/dashboard/DashboardHeader.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { useTheme } from '@/shared/context/ThemeProvider';
import { UserRole, Conversation, Notification } from '@/shared/types'; // FIX: Corrected imports
import { Avatar } from '@/shared/components/Avatar';
import { DropdownMenu } from '@/shared/components/DropdownMenu';

import { MessageCircle, Bell, Shield, User, Settings, LogOut } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MenuItem = ({ text, icon: Icon, onPress, color }: { text: string, icon: React.ElementType, onPress: () => void, color: string }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <Icon color={color} size={18} />
    <Text style={[styles.menuText, { color }]}>{text}</Text>
  </Pressable>
);

export const DashboardHeader = ({ title = "Dashboard" }: { title?: string }) => {
    const { theme: { colors } } = useTheme();
    const router = useRouter();
    const { profile, signOut } = useAuth();
    
    const [messages, setMessages] = useState<Conversation[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Fetch real data here
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.surface }} edges={['top']}>
            <View style={[styles.container, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                
                <View style={styles.rightContainer}>
                    <DropdownMenu trigger={<MessageCircle color={colors.textSecondary} size={24} />}>
                        <View style={styles.dropdownContent}>
                            {messages.length > 0 ? messages.map(msg => (
                                <MenuItem key={msg.id} text={`${msg.name}: ${msg.lastMessage}`} icon={MessageCircle} color={colors.textPrimary} onPress={() => router.push({ pathname: '/(main)/support', params: { conversationId: msg.id }})} />
                            )) : <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No new messages</Text>}
                        </View>
                    </DropdownMenu>

                    <DropdownMenu trigger={<Bell color={colors.textSecondary} size={24} />}>
                         <View style={styles.dropdownContent}>
                            {notifications.length > 0 ? notifications.map(notif => (
                                <MenuItem key={notif.id} text={notif.message} icon={Bell} color={colors.textPrimary} onPress={() => { /* Handle notification click */ }} />
                            )) : <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No new notifications</Text>}
                        </View>
                    </DropdownMenu>

                    <DropdownMenu trigger={<Avatar avatarUrl={profile?.avatar_url} size={32} userId={profile?.id || ''} />}>
                            <MenuItem text="Edit Profile" icon={User} color={colors.textPrimary} onPress={() => router.push('/(main)/profile/edit')} />
                            <MenuItem text="Settings" icon={Settings} color={colors.textPrimary} onPress={() => router.push('/(main)/settings')} />
                        {profile?.role === UserRole.ADMIN && ( // FIX: Using correct uppercase enum value
                            <MenuItem text="Admin Panel" icon={Shield} color={colors.textPrimary} onPress={() => router.push('/admin')} />
                        )}
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <MenuItem text="Sign Out" icon={LogOut} color={colors.error} onPress={handleSignOut} />
                    </DropdownMenu>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 60, borderBottomWidth: 1 },
    title: { fontSize: 24, fontWeight: 'bold' },
    rightContainer: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    dropdownContent: { minWidth: 240, paddingVertical: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 12 },
    menuText: { fontSize: 16 },
    divider: { height: 1, marginVertical: 8, opacity: 0.5 },
    emptyText: { padding: 16, fontStyle: 'italic' },
});
