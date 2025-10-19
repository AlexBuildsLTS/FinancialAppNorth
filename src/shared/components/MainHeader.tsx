// src/shared/components/MainHeader.tsx

import React, { useMemo } from 'react'; 
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import { router, RelativePathString, ExternalPathString } from 'expo-router'; // These assumed types must match your router setup
import { Bell, MessageSquareText, UserCog, Settings, LogOut, HandHelping, LucideIcon } from 'lucide-react-native';
import AnimatedThemeIcon from './AnimatedThemeIcon';
import { Avatar } from './Avatar';
import { useAuth } from '@/shared/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DropdownMenu } from './DropdownMenu';
import NotificationDropdown from './NotificationDropdown';
import { Text } from 'react-native';
import { UserRole } from '@/shared/types'; 

// Define route constants for better maintainability
const ROUTES = {
    home: '/(tabs)' as RelativePathString,
    messages: '/messages' as RelativePathString,
    profile: {
        edit: '/(tabs)/profile/edit' as RelativePathString,
    },
    settings: '/(tabs)/settings' as RelativePathString,
    support: '/(tabs)/support' as RelativePathString,
};

interface MainHeaderProps {
    title?: string; 
}

interface ProfileMenuItem {
    label: string;
    icon: LucideIcon;
    onSelect: () => void;
    isDestructive?: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ title }) => {
    const { colors, isDark } = useTheme();
    const { profile, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const profileMenuItems = useMemo(() => {
        const items: ProfileMenuItem[] = [
            { label: 'Edit Profile', icon: UserCog, onSelect: () => router.push(ROUTES.profile.edit) },
            { label: 'Settings', icon: Settings, onSelect: () => router.push(ROUTES.settings) },
        ];

        if (profile?.role === UserRole.SUPPORT || profile?.role === UserRole.ADMIN) {
            items.push({ label: 'Ticket Management', icon: HandHelping, onSelect: () => router.push(ROUTES.support) });
        }

        items.push({ label: 'Sign Out', icon: LogOut, onSelect: signOut, isDestructive: true });
        return items;
    }, [profile?.role, signOut]);

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
                paddingTop: insets.top + 10,
                paddingBottom: 12,
                paddingHorizontal: 16,
            }
        ]}>
            {title ? (
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            ) : (
                <Pressable onPress={() => router.push(ROUTES.home)} accessibilityLabel="Go to home page">
                    <Image
                        source={isDark ? require('@/assets/images/NorthFinanceTextdark.png') : require('@/assets/images/NorthFinancetext.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Pressable>
            )}

            <View style={styles.rightContainer}>
                <AnimatedThemeIcon />
                
                <Pressable onPress={() => router.push(ROUTES.messages)} accessibilityLabel="Go to messages">
                    <MessageSquareText color={colors.textSecondary} size={24} />
                </Pressable>

                <NotificationDropdown />

                <DropdownMenu
                    trigger={
                        <Avatar url={profile?.avatar_url} size={36} />
                    }
                >
                    {profileMenuItems.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={item.onSelect}
                            style={({ pressed }) => [
                                styles.dropdownMenuItem,
                                { backgroundColor: pressed ? colors.border : 'transparent' },
                            ]}
                            accessibilityLabel={item.label}
                        >
                            <item.icon size={20} color={item.isDestructive ? colors.error : colors.text} style={styles.dropdownMenuIcon} />
                            <Text style={{ color: item.isDestructive ? colors.error : colors.text }}>
                                {item.label}
                            </Text>
                        </Pressable>
                    ))}
                </DropdownMenu>
            </View>
        </View>
    );
};
 
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        width: '100%',
        zIndex: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    logo: {
        height: 25,
        width: 120,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    dropdownMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    dropdownMenuIcon: {
        marginRight: 10,
    },
});

export default MainHeader;