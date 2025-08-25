import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronRight, KeyRound, Bell, Palette, LogOut, Shield, FileKey } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { getProfile } from '@/services/profileService';
import { Profile } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';

const ProfileMenuItem = ({ icon: Icon, text, onPress, colors }: any) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]} onPress={onPress}>
        <Icon color={colors.primary} size={22} />
        <Text style={[styles.menuItemText, { color: colors.text }]}>{text}</Text>
        <ChevronRight color={colors.textSecondary} size={22} />
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const { user, signOut, session } = useAuth();
    const { colors, isDark, setColorScheme } = useTheme();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfileData = useCallback(async () => {
        if (session?.user.id) {
            setRefreshing(true);
            try {
                const profileData = await getProfile(session.user.id);
                setProfile(profileData);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setRefreshing(false);
            }
        }
    }, [session]);

    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
        }, [fetchProfileData])
    );
    
    const menuItems = [
        { icon: KeyRound, text: 'Edit Profile', path: '/profile/edit' },
        { icon: Shield, text: 'Security', path: '/profile/security' },
        { icon: FileKey, text: 'AI Provider API Keys', path: '/profile/api-keys' },
        { icon: Bell, text: 'Notifications', path: '/settings' }, // Placeholder
        { icon: Palette, text: 'Appearance', path: '/settings' }, // Placeholder
    ];

    return (
        <ScreenContainer>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProfileData} tintColor={colors.primary} />}
            >
                <View style={styles.header}>
                    <Image
                        source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@/assets/images/icon.png')}
                        style={[styles.avatar, { borderColor: colors.primary }]}
                    />
                    <Text style={[styles.name, { color: colors.text }]}>{profile?.display_name || 'User'}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
                </View>

                <View style={[styles.menuSection, { borderColor: colors.border }]}>
                    {menuItems.map((item) => (
                        <ProfileMenuItem key={item.text} icon={item.icon} text={item.text} onPress={() => router.push(item.path as any)} colors={colors} />
                    ))}
                </View>

                <View style={[styles.menuSection, { borderColor: colors.border }]}>
                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomWidth: 0 }]} onPress={signOut}>
                        <LogOut color={colors.error} size={22} />
                        <Text style={[styles.menuItemText, { color: colors.error }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        marginTop: 4,
    },
    menuSection: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
        fontWeight: '500',
    },
});