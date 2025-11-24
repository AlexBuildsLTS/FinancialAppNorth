import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Plus, MessageSquare, X, Send } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../shared/context/AuthContext';

export default function SupportScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Fetch real tickets (Mocking DB call structure for now as table might be empty)
    // In production: const { data } = await supabase.from('tickets').select('*').eq('user_id', user.id);
    setTickets([
      { id: '1', title: 'Login Issue', status: 'Open', date: '2h ago' },
      { id: '2', title: 'Billing Inquiry', status: 'Closed', date: '1d ago' },
    ]);
  }, []);

  const handleCreateTicket = async () => {
    if (!subject || !description) return;
    
    // Optimistic Update
    const newTicket = { id: Date.now().toString(), title: subject, status: 'Open', date: 'Just now' };
    setTickets([newTicket, ...tickets]);
    
    // TODO: Real DB Insert
    // await supabase.from('tickets').insert({ user_id: user.id, title: subject, description });

    setModalVisible(false);
    setSubject('');
    setDescription('');
    Alert.alert('Success', 'Ticket created!');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <Stack.Screen options={{ headerTitle: 'Support', headerStyle: { backgroundColor: '#0A192F' }, headerTintColor: '#fff' }} />
      
      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-[#64FFDA]/10 items-center justify-center">
              <MessageSquare size={20} color="#64FFDA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold">{item.title}</Text>
              <Text className="text-[#8892B0] text-xs">#{item.id} • {item.date}</Text>
            </View>
            <Text className={`text-xs font-bold uppercase ${item.status === 'Open' ? 'text-[#64FFDA]' : 'text-[#8892B0]'}`}>{item.status}</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 w-14 h-14 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={28} color="#0A192F" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#112240] rounded-t-3xl p-6 h-[60%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">New Ticket</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#8892B0" /></TouchableOpacity>
              </View>

              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Subject</Text>
              <TextInput 
                className="bg-[#0A192F] text-white p-4 rounded-xl mb-4 border border-white/10" 
                placeholder="Brief summary..." 
                placeholderTextColor="#475569"
                value={subject}
                onChangeText={setSubject}
              />

              <Text className="text-[#8892B0] text-xs font-bold uppercase mb-2">Description</Text>
              <TextInput 
                className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 h-32" 
                placeholder="Describe the issue..." 
                placeholderTextColor="#475569" 
                multiline 
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity onPress={handleCreateTicket} className="bg-[#64FFDA] py-4 rounded-xl items-center flex-row justify-center gap-2">
                <Text className="text-[#0A192F] font-bold text-lg">Submit Ticket</Text>
                <Send size={20} color="#0A192F" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}