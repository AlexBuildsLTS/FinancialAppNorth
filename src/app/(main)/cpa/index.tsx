import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Users, UserPlus, MessageCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CpaDashboard() {
  return (
    <ScrollView className="flex-1 bg-nf-bg p-5" contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="mb-6 flex-row justify-between items-center">
        <View>
            <Text className="text-white font-inter-bold text-2xl">Client Management</Text>
            <Text className="text-nf-muted text-xs">Overview & Requests</Text>
        </View>
        <TouchableOpacity className="bg-nf-primary px-4 py-2 rounded-lg flex-row items-center">
            <UserPlus size={16} color="#FFF" className="mr-2" />
            <Text className="text-white font-inter-bold text-sm">Invite Client</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row space-x-3 mb-6 overflow-scroll">
          <View className="bg-nf-card border border-nf-border p-4 rounded-xl flex-1">
              <Text className="text-nf-muted text-xs">Total Clients</Text>
              <Text className="text-white font-inter-bold text-2xl">24</Text>
          </View>
          <View className="bg-nf-card border border-nf-border p-4 rounded-xl flex-1">
              <Text className="text-nf-muted text-xs">Pending Actions</Text>
              <Text className="text-nf-primary font-inter-bold text-2xl">5</Text>
          </View>
      </View>

      <Text className="text-white font-inter-bold text-lg mb-3">Active Clients</Text>
      {[1, 2, 3].map((client, index) => (
          <Animated.View 
            key={client}
            entering={FadeInDown.delay(index * 100).duration(500)}
            className="bg-nf-card border border-nf-border p-4 rounded-xl mb-3 flex-row items-center justify-between"
          >
              <View className="flex-row items-center">
                  <View className="h-10 w-10 bg-nf-bg rounded-full items-center justify-center mr-3 border border-nf-border">
                      <Text className="text-white font-inter-bold">JD</Text>
                  </View>
                  <View>
                      <Text className="text-white font-inter-medium">John Doe</Text>
                      <Text className="text-nf-muted text-xs">Last active: 2h ago</Text>
                  </View>
              </View>
              <TouchableOpacity className="bg-nf-input p-2 rounded-lg">
                  <MessageCircle size={18} color="#CCD6F6" />
              </TouchableOpacity>
          </Animated.View>
      ))}
    </ScrollView>
  );
}