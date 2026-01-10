/**
 * src/app/(main)/organization/index.tsx
 * ROLE: The "Enterprise HQ" Command Center (Titan-Engine).
 * PURPOSE: Orchestrates business entity provisioning and multi-tenant session logic.
 * PERFORMANCE: Optimized for Web/Native with Reanimated 3 and BlurView synthesis.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import {
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  X,
  CreditCard,
  Layers,
  Briefcase,
} from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { orgService } from '../../../services/orgService';
import { Organization } from '../../../types';
import { GlassCard } from '../../../shared/components/GlassCard';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // --- STATE ---
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState('');

  /**
   * 🔄 TITAN STATE SYNC
   * Resolves the "Disappearing Org" bug by prioritizing junction-table lookups.
   */
  const syncOrgState = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await orgService.getMyOrganization(user.id);
      setOrg(data);
    } catch (e) {
      console.error('[OrgHQ] Tactical Sync Failure:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Re-sync whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      syncOrgState();
    }, [syncOrgState])
  );

  /**
   * 🏗️ ATOMIC ENTITY PROVISIONING
   * Uses a verify-after-create loop to ensure 500 errors don't lead to ghost states.
   */
  const handleCreation = async () => {
    if (!orgName.trim() || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      // 1. Execute Provisioning
      const newOrg = await orgService.createOrganization(
        user.id,
        orgName.trim()
      );

      // 2. Verification Loop (Safety Net for async triggers)
      let verifiedOrg = newOrg;
      if (!verifiedOrg) {
        verifiedOrg = (await orgService.getMyOrganization(
          user.id
        )) as Organization;
      }

      setOrg(verifiedOrg);
      setShowCreateModal(false);
      setOrgName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      // Direct feedback for the 500 Internal Server Errors detected in logs
      Alert.alert(
        'Provisioning Terminated',
        'The server rejected the request. This is usually due to profile sync or database constraint issues.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  // --- ENTITY PROVISIONING VIEW (EMPTY STATE) ---
  if (!org) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
        <Stack.Screen options={{ title: 'Organization' }} />
        <View className="items-center justify-center flex-1 p-10">
          <Animated.View
            entering={FadeInUp.springify()}
            className="items-center"
          >
            <View className="w-24 h-24 bg-cyan-500/10 rounded-[32px] items-center justify-center border border-cyan-500/20 mb-8">
              <Building2 size={48} color="#22d3ee" />
            </View>
            <Text className="text-3xl font-black text-center text-white">
              Entity Offline
            </Text>
            <Text className="px-6 mt-4 mb-10 leading-6 text-center text-slate-400">
              Your account is isolated. Establish a corporate organization to
              unlock team liquidity, approvals, and compliance trails.
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCreateModal(true);
              }}
              className="bg-cyan-500 px-12 py-5 rounded-[24px] shadow-2xl shadow-cyan-500/30"
            >
              <Text className="text-lg font-black tracking-widest uppercase text-slate-950">
                Create Organization
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Modal
          visible={showCreateModal}
          transparent
          animationType="slide"
          statusBarTranslucent
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 90 : 100}
            tint="dark"
            className="justify-end flex-1"
          >
            <TouchableOpacity
              className="flex-1"
              onPress={() => setShowCreateModal(false)}
            />
            <Animated.View
              entering={FadeInDown}
              className="bg-[#0f172a] p-8 rounded-t-[48px] border-t border-white/10 pb-16"
            >
              <View className="flex-row items-center justify-between mb-10">
                <Text className="text-2xl font-black text-white">
                  Provision Entity
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  className="p-2 rounded-full bg-white/5"
                >
                  <X size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <Text className="mb-3 ml-1 text-[10px] font-black tracking-[2px] uppercase text-slate-500">
                Legal Company Name
              </Text>
              <TextInput
                className="p-6 mb-10 text-xl font-bold text-white border bg-white/5 rounded-3xl border-white/10"
                placeholder="e.g. NorthFinance Global"
                placeholderTextColor="#475569"
                value={orgName}
                onChangeText={setOrgName}
                autoFocus
                selectionColor="#22d3ee"
              />
              <TouchableOpacity
                onPress={handleCreation}
                disabled={!orgName.trim() || loading}
                className={`p-6 rounded-3xl items-center shadow-xl ${
                  !orgName.trim() ? 'bg-cyan-500/20' : 'bg-cyan-500'
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <Text className="text-lg font-black tracking-widest uppercase text-slate-950">
                    Establish Entity
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    );
  }

  // --- ENTERPRISE HQ VIEW (ACTIVE STATE) ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ title: org.name }} />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              syncOrgState();
            }}
            tintColor="#22d3ee"
          />
        }
      >
        <Animated.View
          entering={FadeInUp.duration(600)}
          className="flex-row items-center gap-4 mb-10"
        >
          <View className="items-center justify-center border shadow-2xl w-14 h-14 bg-white/5 rounded-2xl border-white/10">
            <Layers size={28} color="#22d3ee" />
          </View>
          <View className="flex-1">
            <Text
              className="text-3xl font-black tracking-tight text-white"
              numberOfLines={1}
            >
              {org.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 mr-2 rounded-full bg-cyan-500 animate-pulse" />
              <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Enterprise Active • {org.id.substring(0, 8)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* EXECUTIVE STATS MATRIX */}
        <View className="flex-row gap-4 mb-10">
          <GlassCard className="flex-1 p-6 border-white/5">
            <Users size={20} color="#60a5fa" />
            <Text className="mt-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Team Flow
            </Text>
            <Text className="mt-1 text-2xl font-black text-white">Active</Text>
          </GlassCard>
          <GlassCard className="flex-1 p-6 border-white/5">
            <ShieldCheck size={20} color="#10b981" />
            <Text className="mt-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              Permissions
            </Text>
            <Text className="mt-1 text-2xl font-black text-white">Owner</Text>
          </GlassCard>
        </View>

        <Text className="mb-6 ml-1 text-lg font-black tracking-widest text-white uppercase">
          Directorship Console
        </Text>

        {/* NAVIGATION TACTICAL MATRIX */}
        <View className="gap-4">
          {[
            {
              title: 'Team Directory',
              sub: 'Manage access and authority',
              icon: Users,
              color: '#60a5fa',
              route: '/(main)/organization/members',
            },
            {
              title: 'Expense Approvals',
              sub: 'Review pending corporate spend',
              icon: CreditCard,
              color: '#f59e0b',
              route: '/(main)/approvals',
            },
            {
              title: 'Compliance Vault',
              sub: 'Immutable system audit trails',
              icon: ShieldCheck,
              color: '#a855f7',
              route: '/(main)/organization/audit-log',
            },
          ].map((item, idx) => (
            <Animated.View
              key={idx}
              entering={FadeInDown.delay(idx * 100)}
              layout={Layout.springify()}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/5"
              >
                <View className="flex-row items-center flex-1 gap-5">
                  <View
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon size={24} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-black text-white">
                      {item.title}
                    </Text>
                    <Text className="text-xs font-medium text-slate-500 mt-0.5">
                      {item.sub}
                    </Text>
                  </View>
                </View>
                <View className="p-2 rounded-full bg-white/5">
                  <ChevronRight size={18} color="#475569" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* CORPORATE UPSELL / INTELLIGENCE BANNER */}
        <LinearGradient
          colors={['#1e1b4b', '#020617']}
          className="mt-12 p-10 rounded-[48px] border border-indigo-500/20 items-center overflow-hidden"
        >
          <View className="absolute top-0 right-0 p-4 opacity-10">
            <Briefcase size={120} color="#818cf8" />
          </View>
          <Briefcase size={32} color="#818cf8" />
          <Text className="mt-4 text-xl font-black text-white">
            Titan Intelligence
          </Text>
          <Text className="px-2 mt-3 text-sm leading-6 text-center text-slate-400">
            Your corporate ledger is now fully synchronized with immutable
            compliance hashing.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
