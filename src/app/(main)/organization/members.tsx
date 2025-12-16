/**
 * ============================================================================
 * 👥 TEAM MEMBER MANAGEMENT
 * ============================================================================
 * Lists all users in the current organization.
 * Allows Admins/Owners to invite new users via email.
 * Uses `orgService` for all data interactions.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Users, X, Plus } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { orgService, OrganizationMember } from '../../../services/orgService';

const RoleBadge = ({ role }: { role: string }) => {
    let colorClass = 'bg-[#8892B0]/20';
    let textColor = 'text-[#8892B0]';
    
    if (role === 'owner') { colorClass = 'bg-yellow-500/20'; textColor = 'text-yellow-400'; }
    else if (role === 'admin') { colorClass = 'bg-[#64FFDA]/20'; textColor = 'text-[#64FFDA]'; }
    else if (role === 'manager') { colorClass = 'bg-blue-500/20'; textColor = 'text-blue-400'; }

    return (
        <View className={`px-3 py-1 rounded-full ${colorClass}`}>
            <Text className={`text-[10px] font-bold uppercase ${textColor}`}>{role}</Text>
        </View>
    );
};

export default function OrganizationMembersScreen() {
    const { user } = useAuth();
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member');
    const [sendingInvite, setSendingInvite] = useState(false);

    useEffect(() => {
        if (user) initializeScreen();
    }, [user]);

    const initializeScreen = async () => {
        setLoading(true);
        try {
            // 1. Get the Context (Which Org are we in?)
            if (!user) return;
            const org = await orgService.getMyOrganization(user.id);
            
            if (!org) {
                // If no org, we could prompt to create one, but for now just show empty
                setLoading(false);
                return;
            }

            setOrgId(org.id);

            // 2. Load Members
            const list = await orgService.getOrgMembers(org.id);
            setMembers(list);
        } catch (e) {
            console.error("Failed to load org data:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !orgId) return;
        
        setSendingInvite(true);
        try {
            await orgService.inviteMember(orgId, inviteEmail.trim(), inviteRole);
            Alert.alert("Success", "User added to organization.");
            setIsModalVisible(false);
            setInviteEmail('');
            // Refresh list
            initializeScreen();
        } catch (e: any) {
            Alert.alert("Invite Failed", e.message);
        } finally {
            setSendingInvite(false);
        }
    };

    const renderMemberItem = ({ item }: { item: OrganizationMember }) => (
        <View className="flex-row items-center justify-between p-4 bg-[#112240] rounded-xl mb-3 border border-white/5">
            <View className="flex-row items-center flex-1 mr-4">
                <View className="w-10 h-10 bg-[#1D3255] rounded-full items-center justify-center mr-3 border border-white/10">
                    <User size={18} color="#60A5FA" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                        {item.full_name || item.user_email || 'Unknown User'}
                    </Text>
                    <Text className="text-[#8892B0] text-xs">{item.user_email}</Text>
                </View>
            </View>
            <RoleBadge role={item.role} />
        </View>
    );

    if (!orgId && !loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0A192F] items-center justify-center p-6">
                <Users size={64} color="#112240" />
                <Text className="text-white text-xl font-bold mt-4 text-center">No Organization Found</Text>
                <Text className="text-[#8892B0] text-center mt-2 mb-6">
                    You are not part of any organization yet. Please contact support or create a new one.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0A192F]">
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-2 pb-4">
                <View>
                    <Text className="text-white text-3xl font-bold">Team</Text>
                    <Text className="text-[#8892B0] text-sm">Manage access & roles</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => setIsModalVisible(true)} 
                    className="w-10 h-10 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20"
                >
                    <Plus size={24} color="#0A192F" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#64FFDA" />
                </View>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMemberItem}
                    contentContainerStyle={{ padding: 24 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20 opacity-50">
                            <Users size={48} color="#8892B0" />
                            <Text className="text-[#8892B0] mt-4">No members found.</Text>
                        </View>
                    }
                />
            )}

            {/* Invite Modal */}
            <Modal 
                animationType="slide" 
                transparent={true} 
                visible={isModalVisible} 
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-[#112240] p-6 rounded-t-3xl border-t border-white/10 pb-12">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Invite New Member</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={24} color="#8892B0" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Email Address</Text>
                        <TextInput
                            placeholder="user@example.com"
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            placeholderTextColor="#475569"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            className="p-4 bg-[#0A192F] border border-white/10 rounded-xl text-white mb-6 text-base"
                        />

                        <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Role Assignment</Text>
                        <View className="flex-row gap-3 mb-8">
                            {['member', 'manager', 'admin'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    onPress={() => setInviteRole(role as any)}
                                    className={`flex-1 py-3 rounded-xl items-center border ${
                                        inviteRole === role 
                                        ? 'bg-[#64FFDA] border-[#64FFDA]' 
                                        : 'bg-[#0A192F] border-white/10'
                                    }`}
                                >
                                    <Text className={`font-bold capitalize ${
                                        inviteRole === role ? 'text-[#0A192F]' : 'text-white'
                                    }`}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity 
                            onPress={handleInvite} 
                            disabled={sendingInvite || !inviteEmail} 
                            className={`p-4 rounded-xl items-center ${sendingInvite ? 'bg-[#64FFDA]/50' : 'bg-[#64FFDA]'}`}
                        >
                            {sendingInvite ? (
                                <ActivityIndicator color="#0A192F" />
                            ) : (
                                <Text className="text-[#0A192F] font-bold text-lg">Send Invite</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}