/**
 * src/app/(main)/organization/members.tsx
 * ROLE: The "Directorship" Management Console.
 * PURPOSE: Securely manage organization access, roles, and member invites.
 * PERFORMANCE: Uses FlashList for 60FPS list performance and Reanimated for UX.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User as UserIcon,
  Users,
  X,
  Plus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { orgService } from '../../../services/orgService';
import { BlurView } from 'expo-blur';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface OrganizationMember {
  id: string;
  full_name?: string;
  user_email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
}

/**
 * 🏷️ PREMIUM ROLE BADGE
 */
const RoleBadge = ({ role }: { role: string }) => {
  const configs = {
    owner: {
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.1)',
      icon: ShieldAlert,
    },
    admin: {
      color: '#22d3ee',
      bg: 'rgba(34, 211, 238, 0.1)',
      icon: ShieldCheck,
    },
    manager: { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)', icon: Shield },
    member: {
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      icon: UserIcon,
    },
  };

  const config = configs[role as keyof typeof configs] || configs.member;
  const Icon = config.icon;

  return (
    <View
      style={{ backgroundColor: config.bg }}
      className="flex-row items-center px-3 py-1 border rounded-full border-white/5"
    >
      <Icon size={10} color={config.color} className="mr-1.5" />
      <Text
        style={{ color: config.color }}
        className="text-[10px] font-black uppercase tracking-widest"
      >
        {role}
      </Text>
    </View>
  );
};

export default function OrganizationMembersScreen() {
  const { user } = useAuth();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Invite Engine State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>(
    'member'
  );
  const [sendingInvite, setSendingInvite] = useState(false);

  const syncTeamData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const org = await orgService.getMyOrganization(user.id);
      if (!org) {
        setLoading(false);
        return;
      }
      setOrgId(org.id);
      const list = await orgService.getOrgMembers(org.id);
      setMembers(
        list.map((member) => ({
          ...member,
          role: member.role as 'owner' | 'admin' | 'manager' | 'member',
        }))
      );
    } catch (e) {
      console.error('[TeamHQ] Data Sync Failed:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    syncTeamData();
  }, [syncTeamData]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !orgId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSendingInvite(true);
    try {
      await orgService.inviteMember(orgId, inviteEmail.trim(), inviteRole);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsModalVisible(false);
      setInviteEmail('');
      syncTeamData();
    } catch (e: any) {
      Alert.alert('Provisioning Error', e.message);
    } finally {
      setSendingInvite(false);
    }
  };

  const renderMemberItem = ({
    item,
    index,
  }: {
    item: OrganizationMember;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(400)}
      layout={Layout.springify()}
      className="flex-row items-center justify-between p-5 bg-white/5 rounded-[32px] mb-4 border border-white/5"
    >
      <View className="flex-row items-center flex-1 mr-4">
        <View className="items-center justify-center w-12 h-12 mr-4 border bg-white/5 rounded-2xl border-white/10">
          <Text className="text-lg font-black text-cyan-400">
            {(item.full_name || item.user_email || '?')[0].toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-black text-white" numberOfLines={1}>
            {item.full_name || 'Pending Onboarding'}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Mail size={10} color="#475569" className="mr-1" />
            <Text className="text-xs font-medium text-slate-500">
              {item.user_email}
            </Text>
          </View>
        </View>
      </View>
      <RoleBadge role={item.role} />
    </Animated.View>
  );

  if (!orgId && !loading) {
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center p-10">
        <Users size={64} color="#1e293b" />
        <Text className="mt-6 text-2xl font-black text-center text-white">
          Identity Not Found
        </Text>
        <Text className="mt-3 leading-6 text-center text-slate-500">
          You are not currently associated with an active organization.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#020617]" edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* EXECUTIVE HEADER */}
      <View className="flex-row items-end justify-between px-6 py-4">
        <View>
          <Text className="text-slate-500 text-[10px] font-black uppercase tracking-[3px] mb-1">
            Directorship
          </Text>
          <Text className="text-4xl font-black tracking-tight text-white">
            Team
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsModalVisible(true);
          }}
          className="w-14 h-14 bg-cyan-500 rounded-[22px] items-center justify-center shadow-2xl shadow-cyan-500/40"
        >
          <Plus size={28} color="#020617" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#22d3ee" />
        </View>
      ) : (
        <View className="flex-1 px-6 pt-6">
          <FlashList
            data={members}
            renderItem={renderMemberItem}
            estimatedItemSize={88}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center mt-20 opacity-30">
                <Users size={48} color="#94a3b8" />
                <Text className="mt-4 font-bold text-slate-400">
                  Isolated Environment
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* TACTICAL INVITE SHEET */}
      <Modal animationType="slide" transparent visible={isModalVisible}>
        <BlurView intensity={80} tint="dark" className="justify-end flex-1">
          <TouchableOpacity
            className="flex-1"
            onPress={() => setIsModalVisible(false)}
          />
          <Animated.View
            entering={FadeInDown}
            className="bg-[#0f172a] p-8 rounded-t-[48px] border-t border-white/10 pb-16"
          >
            <View className="flex-row items-center justify-between mb-10">
              <Text className="text-2xl font-black text-white">
                Invite Member
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="p-2 rounded-full bg-white/5"
              >
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">
              Work Email
            </Text>
            <TextInput
              placeholder="user@company.com"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="email-address"
              className="p-6 mb-8 text-lg font-bold text-white border bg-white/5 border-white/10 rounded-3xl"
            />

            <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4 ml-1">
              Authority Level
            </Text>
            <View className="flex-row gap-3 mb-10">
              {['member', 'manager', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setInviteRole(role as any);
                  }}
                  className={`flex-1 py-4 rounded-2xl items-center border ${
                    inviteRole === role
                      ? 'bg-cyan-500 border-cyan-500'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Text
                    className={`font-black text-xs uppercase tracking-widest ${
                      inviteRole === role ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleInvite}
              disabled={sendingInvite || !inviteEmail}
              className={`p-6 rounded-3xl items-center shadow-xl ${
                sendingInvite || !inviteEmail ? 'bg-cyan-500/20' : 'bg-cyan-500'
              }`}
            >
              {sendingInvite ? (
                <ActivityIndicator color="#020617" />
              ) : (
                <Text className="text-lg font-black tracking-widest uppercase text-slate-950">
                  Send Directorship Invite
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
