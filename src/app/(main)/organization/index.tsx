/**
 * ============================================================================
 * 🏢 ORGANIZATION DASHBOARD (HQ)
 * ============================================================================
 * The command center for Enterprise features.
 * Features:
 * - Dynamic Org Loading
 * - Quick Stats (Team Size, Role)
 * - Navigation to Sub-Modules (Members, Approvals, Audit)
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Users, Building2, CreditCard, ShieldCheck, ChevronRight, X } from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { orgService, Organization } from '../../../services/orgService';
// RESTORED: Using your GlassCard component
import { GlassCard } from '../../../shared/components/GlassCard';

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    loadOrg();
  }, [user]);

  const loadOrg = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await orgService.getMyOrganization(user.id);
      setOrg(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createOrg = async () => {
    if (!orgName.trim() || !user) {
      Alert.alert("Error", "Please enter a company name");
      return;
    }
    
    try {
      setLoading(true);
      const newOrg = await orgService.createOrganization(user.id, orgName.trim());
      setOrg(newOrg);
      setShowCreateModal(false);
      setOrgName('');
      Alert.alert("Success", "Organization created successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not create organization");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0A192F] items-center justify-center">
        <ActivityIndicator size="large" color="#64FFDA" />
      </View>
    );
  }

  if (!org) {
    return (
      <>
        <View className="flex-1 bg-[#0A192F] items-center justify-center p-6">
          <Building2 size={64} color="#64748B" />
          <Text className="text-white text-2xl font-bold mt-6 text-center">No Organization Found</Text>
          <Text className="text-[#8892B0] text-center mt-2 mb-8">
            Upgrade to Enterprise to manage teams, approvals, and corporate spend.
          </Text>
          <TouchableOpacity 
            onPress={() => setShowCreateModal(true)} 
            className="bg-[#64FFDA] px-8 py-4 rounded-xl shadow-lg shadow-[#64FFDA]/20"
          >
            <Text className="font-bold text-[#0A192F] text-lg">Create Organization</Text>
          </TouchableOpacity>
        </View>

        {/* Create Organization Modal */}
        <Modal
          visible={showCreateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View className="bg-[#112240] p-6 rounded-t-3xl border-t border-white/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Create Organization</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X size={24} color="#8892B0" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-[#8892B0] mb-4">Enter your company name:</Text>
              
              <TextInput
                className="bg-[#0A192F] text-white p-4 rounded-xl border border-white/10 mb-6"
                placeholder="Company Name"
                placeholderTextColor="#8892B0"
                value={orgName}
                onChangeText={setOrgName}
                autoFocus
                onSubmitEditing={createOrg}
              />
              
              <TouchableOpacity
                onPress={createOrg}
                disabled={loading || !orgName.trim()}
                className={`p-4 rounded-xl items-center ${loading || !orgName.trim() ? 'bg-[#64FFDA]/50' : 'bg-[#64FFDA]'}`}
              >
                {loading ? (
                  <ActivityIndicator color="#0A192F" />
                ) : (
                  <Text className="text-[#0A192F] font-bold text-lg">Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ title: org.name, headerStyle: { backgroundColor: '#0A192F' }, headerTintColor: '#fff' }} />
      
      <ScrollView className="p-4">
        {/* KPI Overview using GlassCard */}
        <View className="flex-row gap-4 mb-6">
           <GlassCard className="items-center flex-1 p-4 border border-white/5">
              <Users size={24} color="#60A5FA" />
              <Text className="mt-2 text-xs uppercase text-[#8892B0] font-bold">Team</Text>
              <Text className="text-xl font-bold text-white">Active</Text>
           </GlassCard>
           <GlassCard className="items-center flex-1 p-4 border border-white/5">
              <ShieldCheck size={24} color="#10B981" />
              <Text className="mt-2 text-xs uppercase text-[#8892B0] font-bold">Role</Text>
              <Text className="text-xl font-bold text-white">Owner</Text>
           </GlassCard>
        </View>

        <Text className="mb-4 text-lg font-bold text-white">Management Console</Text>

        <View className="gap-3">
          <TouchableOpacity 
            onPress={() => router.push('/(main)/organization/members')}
            className="flex-row items-center justify-between p-4 bg-[#112240] rounded-xl border border-white/5 active:bg-[#1E293B]"
          >
            <View className="flex-row items-center gap-4">
               <View className="p-3 rounded-lg bg-blue-500/10">
                 <Users size={20} color="#60A5FA" />
               </View>
               <View>
                 <Text className="font-bold text-white text-base">Member Management</Text>
                 <Text className="text-xs text-[#8892B0]">Invite, promote, or remove users</Text>
               </View>
            </View>
            <ChevronRight size={20} color="#8892B0" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(main)/approvals')}
            className="flex-row items-center justify-between p-4 bg-[#112240] rounded-xl border border-white/5 active:bg-[#1E293B]"
          >
            <View className="flex-row items-center gap-4">
               <View className="p-3 rounded-lg bg-orange-500/10">
                 <CreditCard size={20} color="#F59E0B" />
               </View>
               <View>
                 <Text className="font-bold text-white text-base">Expense Approvals</Text>
                 <Text className="text-xs text-[#8892B0]">Review pending team requests</Text>
               </View>
            </View>
            <ChevronRight size={20} color="#8892B0" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(main)/organization/audit-log')}
            className="flex-row items-center justify-between p-4 bg-[#112240] rounded-xl border border-white/5 active:bg-[#1E293B]"
          >
            <View className="flex-row items-center gap-4">
               <View className="p-3 rounded-lg bg-purple-500/10">
                 <ShieldCheck size={20} color="#A855F7" />
               </View>
               <View>
                 <Text className="font-bold text-white text-base">Compliance Vault</Text>
                 <Text className="text-xs text-[#8892B0]">View immutable audit trail</Text>
               </View>
            </View>
            <ChevronRight size={20} color="#8892B0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}