import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, LinkProps } from 'expo-router'; // Import LinkProps
import { Briefcase, ChevronRight, KeyRound, LifeBuoy, LogOut, Palette, Shield, ShieldCheck, Star, User, Users } from 'lucide-react-native';

import { Avatar } from '@/components/Avatar';
import ScreenContainer from '@/components/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeProvider';
import { UserRoleDisplayNames } from '@/types';

interface ProfileOptionProps {
    href: LinkProps['href']; // Use LinkProps['href'] for correct type
    text: string;
    Icon: React.ElementType;
    isLast?: boolean;
    colors: any; // Consider defining a more specific type for colors if possible
}

const ProfileOption = React.memo(({ href, text, Icon, isLast = false, colors }: ProfileOptionProps) => {
    return (
        <Link href={href} asChild>
            <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <View style={[styles.optionRow, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }]}>
                    <Icon size={20} color={colors.textSecondary} />
                    <Text style={[styles.optionText, { color: colors.text }]}>{text}</Text>
                    <ChevronRight size={20} color={colors.textSecondary} />
                </View>
            </Pressable>
        </Link>
    );
});

const roleMeta: Record<string, { Icon: React.ElementType; color: string; label: string }> = {
	Member: { Icon: User, color: '#2ecc71', label: 'Member' },
	'Premium Member': { Icon: Star, color: '#f1c40f', label: 'Premium Member' },
	Professional: { Icon: Briefcase, color: '#3498db', label: 'Professional (CPA)' },
	Support: { Icon: LifeBuoy, color: '#9b59b6', label: 'Support' },
	Administrator: { Icon: ShieldCheck, color: '#e74c3c', label: 'Administrator' },
	// fallback
	unknown: { Icon: Users, color: '#7f8c8d', label: 'User' },
};

export default function ProfileScreen() {
    const { theme } = useTheme();
    const { colors } = theme;
    const { profile, signOut } = useAuth();

    if (!profile) {
        return <ScreenContainer><View style={styles.centered}><ActivityIndicator /></View></ScreenContainer>;   
        
    }

    const meta = roleMeta[UserRoleDisplayNames[profile.role]] ?? roleMeta.unknown;  
    return (
        <ScreenContainer>
            <ScrollView style={{ backgroundColor: colors.background }}>
                <View style={styles.container}>
                    <View style={styles.profileHeader}> 
                        <Avatar
                            avatarUrl={profile.avatar_url}
                            size={120} userId={''}

                            />
                        <View style={styles.profileInfo}></View>    
                        <View style={styles.profileInfo}>   
                            <Text style={[styles.displayName, { color: colors.text }]}>{profile.display_name}</Text>
                            <Text style={[styles.email, { color: colors.textSecondary }]}>{UserRoleDisplayNames[profile.role]}</Text>
                        </View>
                    </View>

                    {/* Options */}
                    <View style={[styles.optionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <ProfileOption href="/(main)/profile/edit" text="Edit Profile" Icon={Palette} colors={colors} />
                        <ProfileOption href="/(main)/profile/security" text="Security" Icon={Shield} colors={colors} />
                        <ProfileOption href="/(main)/profile/api-keys" text="API Keys" Icon={KeyRound} isLast={true} colors={colors} />
                    </View>

                    {/* Sign out */}
                    <Pressable onPress={signOut}>
                        <View style={[styles.optionRow, styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <LogOut size={20} color={colors.error} />
                            <Text style={[styles.optionText, { color: colors.error }]}>Sign Out</Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}       
const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 24,
        // backgroundColor: colors.background, // This will be applied by ScreenContainer
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    profileHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 32, 
        gap: 20, 
        paddingHorizontal: 24,
    }, 
    profileInfo: { 
        gap: 8, 
        paddingHorizontal: 24,
    },
    displayName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
    },
    email: { 
        fontSize: 16, 
    },
    optionsContainer: { 
        borderWidth: 1, 
        borderRadius: 12, 
        overflow: 'hidden',     
    marginBottom: 24,
    },
    optionRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 16, 
        gap: 16, 
        borderWidth: 1, 
        borderRadius: 12, 
        overflow: 'hidden', 
    },
    optionText: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '500', 
    },
    logoutButton: {
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
});