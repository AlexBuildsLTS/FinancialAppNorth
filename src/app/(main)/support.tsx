
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Plus, MessageSquare, HelpCircle, X, Send } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Tab = 'tickets' | 'faq';

interface Ticket {
  id: string;
  title: string;
  status: string;
  date: string;
  description?: string;
}

export default function SupportScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  const [tickets, setTickets] = useState<Ticket[]>([
    { id: '1', title: 'Login Issue', status: 'Open', date: '2h ago', description: 'Cannot access dashboard' },
    { id: '2', title: 'Billing Inquiry', status: 'Closed', date: '1d ago', description: 'Invoice #1023 discrepancy' },
  ]);

  const MOCK_FAQ = [
    { id: '1', q: 'How do I reset password?', a: 'Go to Settings > Security.' },
    { id: '2', q: 'Where are keys stored?', a: 'Locally on device.' },
    { id: '3', q: 'Is my data encrypted?', a: 'Yes, using AES-256 encryption.' },
  ];

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim() || !newTicketDesc.trim()) {
      Alert.alert('Error', 'Please fill in both subject and description.');
      return;
    }

    const newTicket: Ticket = {
      id: Date.now().toString(),
      title: newTicketSubject,
      status: 'Open',
      date: 'Just now',
      description: newTicketDesc
    };

    setTickets([newTicket, ...tickets]);
    setModalVisible(false);
    setNewTicketSubject('');
    setNewTicketDesc('');
    Alert.alert('Success', 'Ticket created successfully. A support agent will review it shortly.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ headerTitle: 'Support', headerStyle: { backgroundColor: '#0A192F' }, headerTintColor: '#fff' }} />
      
      {/* Tabs */}
      <View className="flex-row px-4 py-2 gap-4">
        <TouchableOpacity 
          onPress={() => setActiveTab('tickets')}
          className={`flex-1 py-3 rounded-lg items-center border ${activeTab === 'tickets' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/5'}`}
        >
          <Text className={`font-bold ${activeTab === 'tickets' ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>My Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('faq')}
          className={`flex-1 py-3 rounded-lg items-center border ${activeTab === 'faq' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/5'}`}
        >
          <Text className={`font-bold ${activeTab === 'faq' ? 'text-[#0A192F]' : 'text-[#8892B0]'}`}>FAQ</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View className="flex-1 px-4 pt-4">
        {activeTab === 'tickets' ? (
          <FlatList
            data={tickets}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 100)} className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center">
                  <MessageSquare size={20} color="#64FFDA" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">{item.title}</Text>
                  <Text className="text-[#8892B0] text-xs">#{item.id} • {item.date}</Text>
                </View>
                <Text className={`text-xs font-bold uppercase ${item.status === 'Open' ? 'text-[#64FFDA]' : 'text-[#8892B0]'}`}>{item.status}</Text>
              </Animated.View>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Text className="text-[#8892B0]">No tickets found.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={MOCK_FAQ}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 100)} className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5">
                <View className="flex-row items-center gap-3 mb-2">
                  <HelpCircle size={18} color="#64FFDA" />
                  <Text className="text-white font-bold">{item.q}</Text>
                </View>
                <Text className="text-[#8892B0] pl-8 text-sm leading-5">{item.a}</Text>
              </Animated.View>
            )}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 w-14 h-14 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/30 z-10"
        activeOpacity={0.8}
      >
        <Plus size={28} color="#0A192F" />
      </TouchableOpacity>

      {/* Create Ticket Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#112240] rounded-t-3xl p-6 h-[80%] border-t border-white/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">New Support Ticket</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
                  <X size={24} color="#8892B0" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Subject</Text>
                <View className="bg-[#0A192F] border border-white/10 rounded-xl px-4 py-3 mb-4">
                  <TextInput
                    placeholder="Brief summary of the issue..."
                    placeholderTextColor="#475569"
                    className="text-white text-base"
                    value={newTicketSubject}
                    onChangeText={setNewTicketSubject}
                  />
                </View>

                <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Description</Text>
                <View className="bg-[#0A192F] border border-white/10 rounded-xl px-4 py-3 mb-6 h-40">
                  <TextInput
                    placeholder="Describe the problem in detail..."
                    placeholderTextColor="#475569"
                    className="text-white text-base flex-1"
                    multiline
                    textAlignVertical="top"
                    value={newTicketDesc}
                    onChangeText={setNewTicketDesc}
                  />
                </View>

                <View className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mb-6">
                    <View className="flex-row items-center gap-2 mb-1">
                        <HelpCircle size={16} color="#60A5FA" />
                        <Text className="text-blue-400 font-bold text-xs uppercase">Note</Text>
                    </View>
                    <Text className="text-[#8892B0] text-xs leading-5">
                        Our support team typically responds within 24 hours. Premium members receive priority handling.
                    </Text>
                </View>

                <TouchableOpacity 
                    onPress={handleCreateTicket}
                    className="bg-[#64FFDA] py-4 rounded-xl items-center flex-row justify-center gap-2"
                >
                  <Text className="text-[#0A192F] font-bold text-lg">Submit Ticket</Text>
                  <Send size={20} color="#0A192F" />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
