import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Shield, Users, Database, Activity } from 'lucide-react-native';


export default function AdminDashboard() {
  return (
    <ScrollView className="flex-1 bg-nf-bg p-5" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="mb-6 flex-row items-center space-x-3">
        <Shield size={32} color="#F87171" />
        <View>
            <Text className="text-white font-inter-bold text-2xl">Admin Panel</Text>
            <Text className="text-nf-muted text-xs">System Control Center</Text>
        </View>
      </View>
      <Text className="text-white font-inter-bold text-lg mb-4">Overview</Text>
      <View className="flex-row flex-wrap justify-between mb-6">
         <View className="w-[ 48%] bg-nf-card border border-nf-border p-4 rounded-xl mb-4">
             <Text className="text-nf-muted text-xs">Welcome to the Admin Panel. Here you can manage users, monitor system health, and configure application settings.</Text>
         </View>
         </View>

      <View className="flex-row flex-wrap justify-between mb-6">
         <View className="w-[48%] bg-nf-card border border-nf-border p-4 rounded-xl mb-4">
             <Users size={24} color="#60A5FA" className="mb-2" />
             <Text className="text-2xl font-inter-bold text-white">1,248</Text>
             <Text className="text-nf-muted text-xs">Total Users</Text>
         </View>
         <View className="w-[48%] bg-nf-card border border-nf-border p-4 rounded-xl mb-4">
             <Database size={24} color="#34D399" className="mb-2" />
             <Text className="text-2xl font-inter-bold text-white">99.9%</Text>
             <Text className="text-nf-muted text-xs">Uptime</Text>
         </View>
         <View className="w-[48%] bg-nf-card border border-nf-border p-4 rounded-xl mb-4">
             <Activity size={24} color="#FBBF24" className="mb-2" />
             <Text className="text-2xl font-inter-bold text-white">42ms</Text>
             <Text className="text-nf-muted text-xs">Latency</Text>
         </View>
      </View>

      <Text className="text-white font-inter-bold text-lg mb-3">Quick Actions</Text>
      <TouchableOpacity className="bg-nf-card p-4 rounded-xl border border-nf-border mb-3">
          <Text className="text-white font-inter-medium">View All Users</Text>
          <Text className="text-nf-muted text-xs">Browse, search, and manage user accounts</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-nf-card p-4 rounded-xl border border-nf-border mb-3">
          <Text className="text-white font-inter-medium">System Settings</Text>
          <Text className="text-nf-muted text-xs">Configure application-wide parameters</Text>
      </TouchableOpacity>

      <Text className="text-white font-inter-bold text-lg mb-3">User Management</Text>
      <TouchableOpacity className="bg-nf-card p-4 rounded-xl border border-nf-border mb-3">
          <Text className="text-white font-inter-medium">Manage Roles</Text>
          <Text className="text-nf-muted text-xs">Assign CPA, Admin, or Premium status</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-nf-card p-4 rounded-xl border border-nf-border mb-3">
          <Text className="text-white font-inter-medium">Audit Logs</Text>
          <Text className="text-nf-muted text-xs">View system access history</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}