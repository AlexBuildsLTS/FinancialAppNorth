    // src/shared/components/MainHeader.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import { router, RelativePathString } from 'expo-router';
import { Bell, MessageSquareText, UserCog, Settings, LogOut, HandHelping, LucideIcon } from 'lucide-react-native';
import AnimatedThemeIcon from './AnimatedThemeIcon';
import { Avatar } from '@/shared/components/Avatar';
import { useAuth } from '@/shared/context/AuthContext'; // Assuming this is correct
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DropdownMenu } from './DropdownMenu';
import NotificationDropdown from './NotificationDropdown';
import { UserRole } from '@/shared/types';
import { useTheme } from '@/shared/context/ThemeProvider';

// Define route constants for better maintainability
const ROUTES = {
    home: '/(main)' as RelativePathString,
    messages: '/(main)/support' as RelativePathString,
    profile: '/(main)/profile' as RelativePathString,
    settings: '/(main)/settings' as RelativePathString,
    support: '/(main)/support' as RelativePathString,
};

interface MainHeaderProps {
    title?: string;
}

interface ProfileMenuItem {
    label: string;
    icon: LucideIcon;
    onSelect: () => void;
    isDestructive?: boolean;
    testID?: string; // Added for testing
}

export const MainHeader: React.FC<MainHeaderProps> = ({ title }) => {    const { theme } = useTheme(); // Destructure only what's needed
    const { profile, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    // Memoize menu items to prevent unnecessary recalculations
    const profileMenuItems = useMemo(() => {
        const items: ProfileMenuItem[] = [
            { label: 'Edit Profile', icon: UserCog, onSelect: () => router.push(ROUTES.profile), testID: 'edit-profile-button' },
            { label: 'Settings', icon: Settings, onSelect: () => router.push(ROUTES.settings), testID: 'settings-button' },
        ];

        // Conditionally add support ticket management
        if (profile?.role === UserRole.SUPPORT || profile?.role === UserRole.ADMIN) {
            items.push({ label: 'Ticket Management', icon: HandHelping, onSelect: () => router.push(ROUTES.support), testID: 'ticket-management-button' });
        }

        // Add sign out option
        items.push({ label: 'Sign Out', icon: LogOut, onSelect: signOut, isDestructive: true, testID: 'sign-out-button' });
        return items;
    }, [profile, signOut]); // Dependencies for useMemo

    // Determine logo source based on theme name
    const logoSource = theme.name === 'dark' ? require('@/assets/images/NorthFinanceTextdark.png') : require('@/assets/images/NorthFinancetext.png');

    return (
        <View style={[styles.container, {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            paddingTop: insets.top + styles.container.paddingTop, // Dynamic padding based on safe area
            paddingBottom: styles.container.paddingBottom,
            paddingHorizontal: styles.container.paddingHorizontal,
        }]}>
            {title ? (
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
            ) : (
                <Pressable onPress={() => router.push(ROUTES.home)} accessibilityLabel="Go to home page" testID="home-logo-button">
                    <Image
                        source={logoSource}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Pressable>
            )}

            <View style={styles.rightContainer}><AnimatedThemeIcon />
                <Pressable onPress={() => router.push(ROUTES.messages)} accessibilityLabel="Go to messages" testID="messages-button">
                    <MessageSquareText color={theme.colors.textSecondary} size={24} />
                </Pressable>
                <NotificationDropdown />
                <DropdownMenu
                    trigger={
                        <Avatar
                            avatarUrl={profile?.avatar_url}
                            firstName={profile?.first_name}
                            lastName={profile?.last_name}
                            userId={profile?.id || 'anonymous'}
                            size={36}
                        />
                    }
                >{profileMenuItems.map((item, index) => (
                        <Pressable
                            key={item.label || index} // Use label as key, fallback to index if label is not unique
                            onPress={item.onSelect}
                            style={({ pressed }) => [
                                styles.dropdownMenuItem,
                                { backgroundColor: pressed ? theme.colors.border : 'transparent' },
                            ]}
                            accessibilityLabel={item.label}
                            testID={item.testID}
                        >
                            <item.icon size={20} color={item.isDestructive ? theme.colors.error : theme.colors.textPrimary} style={styles.dropdownMenuIcon} />
                            <Text style={[styles.dropdownMenuText, { color: item.isDestructive ? theme.colors.error : theme.colors.textPrimary }]}>
                                {item.label}
                            </Text>
                        </Pressable>
                    ))}</DropdownMenu>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        paddingTop: 10, // Default padding, will be adjusted by insets
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logo: {
        width: 150,
        height: 30,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    dropdownMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownMenuIcon: {
        marginRight: 12,
    },
    dropdownMenuText: {
        // Add any specific styles for dropdown menu text here if needed
    },
});

