import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Bell, Check, X } from 'lucide-react-native';
import { useTheme } from '@/shared/context/ThemeProvider';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Replace with your actual notification type and data fetching
const notifications = [
    { id: '1', read: false, message: 'Your Q3 report is ready to view.', timestamp: '2h ago' },
    { id: '2', read: false, message: 'New message from John Doe (CPA).', timestamp: 'Yesterday' },
    { id: '3', read: true, message: 'Welcome to NorthFinance!', timestamp: '3d ago' },
];

export default function NotificationDropdown() {
    const { colors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: height.value,
            opacity: opacity.value,
        };
    });

    const toggleDropdown = () => {
        if (isOpen) {
            height.value = withTiming(0, { duration: 300 });
            opacity.value = withTiming(0, { duration: 200 });
        } else {
            height.value = withTiming(300, { duration: 300 }); // Adjust height as needed
            opacity.value = withTiming(1, { duration: 400 });
        }
        setIsOpen(!isOpen);
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={toggleDropdown} style={styles.iconButton}>
                <Bell size={24} color={colors.textSecondary} />
                {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.error }]}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </Pressable>

            {isOpen && <Pressable style={StyleSheet.absoluteFill} onPress={toggleDropdown} />}
            
            <Animated.View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }, animatedStyle]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                    <Pressable>
                        <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all as read</Text>
                    </Pressable>
                </View>
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.item, { borderBottomColor: colors.border }]}>
                            <View style={[styles.dot, { backgroundColor: item.read ? 'transparent' : colors.primary }]} />
                            <View style={styles.itemContent}>
                                <Text style={[styles.itemMessage, { color: colors.text }]}>{item.message}</Text>
                                <Text style={[styles.itemTimestamp, { color: colors.textSecondary }]}>{item.timestamp}</Text>
                            </View>
                        </View>
                    )}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { zIndex: 1000 },
    iconButton: { padding: 4, position: 'relative' },
    badge: {
        position: 'absolute', top: -5, right: -8,
        minWidth: 20, height: 20, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 5,
    },
    badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    dropdown: {
        position: 'absolute',
        top: 60, right: 0,
        width: 320,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    markAllRead: { fontSize: 12, fontWeight: '500' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    itemContent: { flex: 1 },
    itemMessage: { fontSize: 14 },
    itemTimestamp: { fontSize: 12, marginTop: 4 },
});