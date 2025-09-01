// src/components/common/MainHeader.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import { router } from 'expo-router';
import { Bell, Mail } from 'lucide-react-native';
import AnimatedThemeIcon from './AnimatedThemeIcon';
import { Avatar } from './Avatar';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DropdownMenu } from './DropdownMenu';
import NotificationDropdown from './NotificationDropdown';
import { Text } from 'react-native'; // Only import Text, Pressable is already imported

export const MainHeader = () => {
    const { colors, isDark } = useTheme();
    const { profile, signOut } = useAuth();
    const insets = useSafeAreaInsets();

    const profileMenuItems = [
        { label: 'Profile', onSelect: () => { router.push('/(tabs)/profile'); } },
        { label: 'Settings', onSelect: () => { router.push('/(tabs)/settings'); } },
        { label: 'Sign Out', onSelect: () => { signOut(); }, isDestructive: true },
    ];
    
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
            <Pressable onPress={() => router.push('/(tabs)')}>
                <Image
                    source={isDark ? require('@/assets/images/NorthFinanceTextdark.png') : require('@/assets/images/NorthFinancetext.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Pressable>

            <View style={styles.rightContainer}>
                <AnimatedThemeIcon />
                
                <Pressable onPress={() => router.push('/messages')}>
                    <Mail color={colors.textSecondary} size={24} />
                </Pressable>

                {/* Notification Dropdown - now manages its own trigger and state */}
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
                        >
                            <Text style={[{ color: item.isDestructive ? colors.error : colors.text }]}>
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
        zIndex: 10, // Ensure header is above other content
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
    dropdownMenuItem: { // Moved directly into styles
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
});
