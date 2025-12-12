import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Plus, HelpCircle, X, Send, Lock, ShieldAlert, ChevronDown, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../shared/context/AuthContext';
import { 
  createTicket, 
  getTickets, 
  getAllTickets, 
  updateTicketStatus, 
  addInternalNote, 
  addTicketReply, 
  getTicketDetails, 
  deleteTicket 
} from '../../services/dataService'; // Corrected Path
import { UserRole } from '../../types'; // Corrected Path

const STAFF_ROLES = [UserRole.ADMIN, UserRole.SUPPORT, UserRole.CPA];

export default function SupportScreen() {
  const { user } = useAuth();
  const isStaff = user?.role && STAFF_ROLES.includes(user.role);
  
  // Tabs: If staff, default to 'all_tickets'. If user, 'my_tickets'.
  const [activeTab, setActiveTab] = useState<'my_tickets' | 'all_tickets' | 'faq'>(isStaff ? 'all_tickets' : 'my_tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Inputs
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [reply, setReply] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: any[] = [];
      // STRICT SEPARATION OF DATA FETCHING
      if (activeTab === 'all_tickets' && isStaff) {
          data = await getAllTickets();
      } else if (activeTab === 'my_tickets') {
          data = await getTickets(user.id);
      }
      setTickets(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user, activeTab]));

  const handleCreate = async () => {
      if (!subject.trim() || !message.trim()) return Alert.alert("Error", "Fill all fields");
      try {
          await createTicket(user!.id, subject, message, 'General');
          setCreateModalVisible(false);
          setSubject(''); setMessage('');
          loadData();
          Alert.alert("Success", "Ticket created.");
      } catch (e: any) { Alert.alert("Error", e.message); }
  };

  const handleViewDetails = async (ticketId: string) => {
      setDetailModalVisible(true);
      try {
        const details = await getTicketDetails(ticketId);
        setSelectedTicket(details);
      } catch (e: any) {
        Alert.alert("Error", "Failed to load ticket.");
        setDetailModalVisible(false);
      }
  };

  const handleDelete = async () => {
      if (!selectedTicket || !isStaff) return;
      Alert.alert("Delete Ticket", "Are you sure? This cannot be undone.", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: async () => {
              try {
                await deleteTicket(selectedTicket.id);
                setDetailModalVisible(false);
                loadData();
              } catch (e: any) {
                Alert.alert("Error", e.message);
              }
          }}
      ]);
  };

  const handleStatusChange = async (newStatus: string) => {
      try {
        await updateTicketStatus(selectedTicket.id, newStatus);
        const updated = await getTicketDetails(selectedTicket.id);
        setSelectedTicket(updated);
        setStatusModalVisible(false);
        loadData();
      } catch (e: any) {
        Alert.alert("Error", e.message);
      }
  };

  const handleReply = async (isInternal: boolean) => {
      const text = isInternal ? internalNote : reply;
      if (!text.trim()) return;
      
      try {
        if (isInternal) await addInternalNote(selectedTicket.id, user!.id, text);
        else await addTicketReply(selectedTicket.id, user!.id, text);
        
        setInternalNote(''); setReply('');
        const updated = await getTicketDetails(selectedTicket.id);
        setSelectedTicket(updated);
      } catch (e: any) {
        Alert.alert("Error", e.message);
      }
  };

  const renderTicketItem = ({ item }: { item: any }) => {
    const isStaffView = activeTab === 'all_tickets';
    // If staff view, show Client Name. If user view, show Ticket ID/Subject
    const title = isStaffView ? (item.user?.first_name ? `${item.user.first_name} ${item.user.last_name}` : item.user?.email) : item.subject;
    const subtitle = isStaffView ? item.subject : `Created: ${new Date(item.created_at).toLocaleDateString()}`;

    return (
      <TouchableOpacity onPress={() => handleViewDetails(item.id)} className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row justify-between items-center">
          <View className="flex-1 mr-4">
              <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{title}</Text>
              <Text className="text-[#8892B0] text-xs">{subtitle}</Text>
          </View>
          <View className={`px-2 py-1 rounded border ${
              item.status === 'open' ? 'bg-green-500/10 border-green-500/30' :
              item.status === 'closed' ? 'bg-red-500/10 border-red-500/30' : 
              'bg-blue-500/10 border-blue-500/30'
          }`}>
              <Text className="text-[10px] font-bold text-white uppercase">{item.status.replace('_', ' ')}</Text>
          </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="px-6 py-4 flex-1">
          <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-3xl font-bold">Support</Text>
              {isStaff && <ShieldAlert size={24} color="#60A5FA" />}
          </View>
          
          <View className="flex-row gap-3 mb-6">
              {isStaff && (
                  <TouchableOpacity onPress={() => setActiveTab('all_tickets')} className={`px-4 py-2 rounded-full border ${activeTab === 'all_tickets' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>
                      <Text className={activeTab === 'all_tickets' ? 'text-[#0A192F] font-bold' : 'text-white'}>Queue</Text>
                  </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setActiveTab('my_tickets')} className={`px-4 py-2 rounded-full border ${activeTab === 'my_tickets' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>
                  <Text className={activeTab === 'my_tickets' ? 'text-[#0A192F] font-bold' : 'text-white'}>My Tickets</Text>
              </TouchableOpacity>
          </View>

          {loading ? <ActivityIndicator color="#64FFDA" /> : (
              <FlatList 
                  data={tickets}
                  keyExtractor={i => i.id}
                  renderItem={renderTicketItem}
                  refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#64FFDA" />}
                  ListEmptyComponent={<Text className="text-[#8892B0] text-center mt-10">No tickets found.</Text>}
              />
          )}
      </View>

      <TouchableOpacity onPress={() => setCreateModalVisible(true)} className="absolute bottom-10 right-6 w-14 h-14 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg">
        <Plus size={28} color="#0A192F" />
      </TouchableOpacity>

      {/* DETAIL MODAL */}
      <Modal visible={detailModalVisible} animationType="slide" onRequestClose={() => setDetailModalVisible(false)}>
          <SafeAreaView className="flex-1 bg-[#0A192F]">
              <View className="px-4 py-3 border-b border-white/10 flex-row justify-between items-center bg-[#112240]">
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)}><X size={24} color="white" /></TouchableOpacity>
                  <Text className="text-white font-bold">Ticket Details</Text>
                  {isStaff ? (
                      <TouchableOpacity onPress={handleDelete}><Trash2 size={20} color="#F87171" /></TouchableOpacity>
                  ) : <View className="w-6" />}
              </View>

              <ScrollView className="flex-1 p-4">
                  <View className="bg-[#112240] p-4 rounded-xl border border-white/10 mb-4">
                      <View className="flex-row justify-between mb-2">
                          <Text className="text-white font-bold text-xl flex-1">{selectedTicket?.subject}</Text>
                          {isStaff && <TouchableOpacity onPress={() => setStatusModalVisible(true)}><Text className="text-[#64FFDA] font-bold uppercase">{selectedTicket?.status}</Text></TouchableOpacity>}
                      </View>
                      <Text className="text-[#8892B0] text-xs">Category: {selectedTicket?.category}</Text>
                  </View>

                  <View className="gap-3 pb-10">
                    {selectedTicket?.messages?.map((msg: any) => (
                        (isStaff || !msg.is_internal) && (
                            <View key={msg.id} className={`p-3 rounded-xl border ${msg.is_internal ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[#112240] border-white/5'}`}>
                                {msg.is_internal && <Text className="text-yellow-500 text-[10px] font-bold mb-1 uppercase">Internal Note</Text>}
                                <Text className="text-white">{msg.message}</Text>
                                <Text className="text-[#8892B0] text-[10px] mt-2 text-right">{new Date(msg.created_at).toLocaleString()}</Text>
                            </View>
                        )
                    ))}
                  </View>
              </ScrollView>

              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                  {isStaff && (
                      <View className="p-2 bg-[#0D1F3A] border-t border-white/5">
                          <TextInput 
                              className="bg-[#0A192F] text-white p-3 rounded-lg border border-white/10 mb-2"
                              placeholder="Internal Note (Staff Only)..."
                              placeholderTextColor="#64748B"
                              value={internalNote}
                              onChangeText={setInternalNote}
                          />
                          <TouchableOpacity onPress={() => handleReply(true)} className="bg-yellow-600/80 p-2 rounded items-center"><Text className="text-white font-bold text-xs">Add Note</Text></TouchableOpacity>
                      </View>
                  )}
                  <View className="p-4 bg-[#112240] border-t border-white/10 flex-row gap-2">
                      <TextInput 
                          className="flex-1 bg-[#0A192F] text-white p-3 rounded-xl border border-white/10"
                          placeholder="Reply..."
                          placeholderTextColor="#475569"
                          value={reply}
                          onChangeText={setReply}
                      />
                      <TouchableOpacity onPress={() => handleReply(false)} className="bg-[#64FFDA] w-12 rounded-xl items-center justify-center">
                          <Send size={20} color="#0A192F" />
                      </TouchableOpacity>
                  </View>
              </KeyboardAvoidingView>
          </SafeAreaView>
      </Modal>

      {/* CREATE MODAL */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#112240] p-6 rounded-t-3xl h-[80%]">
                <Text className="text-white text-2xl font-bold mb-6">New Ticket</Text>
                <TextInput className="bg-[#0A192F] text-white p-4 rounded-xl mb-4" placeholder="Subject" placeholderTextColor="#8892B0" value={subject} onChangeText={setSubject} />
                <TextInput className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 h-32" placeholder="Details..." placeholderTextColor="#8892B0" multiline textAlignVertical="top" value={message} onChangeText={setMessage} />
                <TouchableOpacity onPress={handleCreate} className="bg-[#64FFDA] p-4 rounded-xl items-center"><Text className="text-[#0A192F] font-bold">Submit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)} className="mt-4 items-center"><Text className="text-[#8892B0]">Cancel</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* STATUS MODAL */}
      <Modal visible={statusModalVisible} transparent>
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
            <View className="bg-[#112240] w-full rounded-2xl p-4">
                <Text className="text-white font-bold mb-4 text-center">Update Status</Text>
                {['open', 'in_progress', 'pending', 'resolved', 'closed'].map(s => (
                    <TouchableOpacity key={s} onPress={() => handleStatusChange(s)} className="p-3 border-b border-white/5"><Text className="text-white text-center capitalize">{s.replace('_', ' ')}</Text></TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setStatusModalVisible(false)} className="mt-4"><Text className="text-red-400 text-center">Cancel</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}