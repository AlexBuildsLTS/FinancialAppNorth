import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  Alert, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { 
  Plus, 
  HelpCircle, 
  X, 
  Send, 
  Lock, 
  ShieldAlert, 
  ChevronDown, 
  Trash2, 
  Search, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react-native';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  createTicket, 
  getTickets, 
  getAllTickets, 
  updateTicketStatus,
  addTicketReply, 
  addInternalNote, 
  getTicketDetails, 
  deleteTicket 
} from '../../../services/dataService';
import { UserRole } from '../../../types';

// FIXED: Defined as string literal array to prevent Type vs Value errors
const STAFF_ROLES: string[] = ['admin', 'support', 'cpa'];

interface TicketUI {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  messages?: any[];
}

export default function SupportScreen() {
  const { user } = useAuth();
  
  // FIXED: Role check uses safe string casting
  const isStaff = user?.role && STAFF_ROLES.includes(user.role as string);
  
  const [activeTab, setActiveTab] = useState<'my_tickets' | 'queue' | 'faq'>(isStaff ? 'queue' : 'my_tickets');
  const [tickets, setTickets] = useState<TicketUI[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  
  // Selection
  const [selectedTicket, setSelectedTicket] = useState<TicketUI | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Forms
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: any[] = [];
      
      // Admin sees queue, User sees own tickets
      if (activeTab === 'queue' && isStaff) {
          data = await getAllTickets();
      } else if (activeTab === 'my_tickets') {
          data = await getTickets(user.id);
      }
      
      setTickets(data || []);
      setFilteredTickets(data || []);
    } catch (e) {
      console.error("Support Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [user, activeTab]));

  // Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTickets(tickets);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = tickets.filter(t => 
        t.subject?.toLowerCase().includes(lower) || 
        t.id?.toLowerCase().includes(lower) ||
        (t.user?.email && t.user.email.toLowerCase().includes(lower))
      );
      setFilteredTickets(filtered);
    }
  }, [searchQuery, tickets]);

  const handleCreate = async () => {
      if (!subject.trim() || !message.trim()) {
        Alert.alert("Validation", "Please fill in both subject and message.");
        return;
      }
      if (!user) return;
      setIsSubmitting(true);
      try {
          await createTicket(user.id, subject, message, 'General');
          setCreateModalVisible(false);
          setSubject(''); setMessage('');
          loadData();
          Alert.alert("Success", "Support ticket created.");
      } catch (e: any) {
          Alert.alert("Error", e.message || "Failed to create ticket.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleViewDetails = async (ticketId: string) => {
      setLoadingDetails(true);
      setDetailModalVisible(true);
      try {
        const details = await getTicketDetails(ticketId);
        setSelectedTicket(details);
      } catch (e) {
        Alert.alert("Error", "Could not load ticket details.");
        setDetailModalVisible(false);
      } finally {
        setLoadingDetails(false);
      }
  };

  const handleDelete = async () => {
      if (!selectedTicket || !isStaff) return;
      Alert.alert("Delete Ticket", "Are you sure? This action is permanent.", [
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
      if (!selectedTicket) return;
      try {
        await updateTicketStatus(selectedTicket.id, newStatus as any);
        const updated = await getTicketDetails(selectedTicket.id);
        setSelectedTicket(updated);
        setStatusModalVisible(false);
        loadData(); 
      } catch (e: any) {
        Alert.alert("Error", e.message);
      }
  };

  const handleReply = async (isInternal: boolean) => {
      if (!selectedTicket || !user) return;
      const text = isInternal ? internalNote : reply;
      if (!text.trim()) return;
      setIsSubmitting(true);
      try {
        if (isInternal) {
          // Robust call to service
          await addInternalNote(selectedTicket.id, user.id, text);
          setInternalNote('');
        } else {
          await addTicketReply(selectedTicket.id, user.id, text);
          setReply('');
        }
        const updated = await getTicketDetails(selectedTicket.id);
        setSelectedTicket(updated);
      } catch (e: any) {
        Alert.alert("Error", e.message);
      } finally {
        setIsSubmitting(false);
      }
  };

  // UI Components
  const renderTicketItem = ({ item }: { item: TicketUI }) => {
    const isQueue = activeTab === 'queue';
    const title = isQueue && item.user 
      ? `${item.user.first_name} ${item.user.last_name || ''}`.trim() || item.user.email
      : item.subject;
    const subTitle = isQueue ? item.subject : `ID: #${item.id.substring(0, 8)}`;
    
    const statusColors: any = {
      open: 'bg-green-500/20 text-green-400 border-green-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      resolved: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const statusStyle = statusColors[item.status] || statusColors['open'];
    const [bg, textColor, border] = statusStyle.split(' ');

    return (
      <TouchableOpacity 
        onPress={() => handleViewDetails(item.id)} 
        className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row justify-between items-center active:bg-[#162C52]"
      >
          <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-1">
                 <Text className="mr-2 text-base font-bold text-white" numberOfLines={1}>{title}</Text>
                 {item.priority === 'high' && <AlertTriangle size={14} color="#F87171" />}
              </View>
              <Text className="text-[#8892B0] text-xs" numberOfLines={1}>
                {subTitle} • {new Date(item.created_at).toLocaleDateString()}
              </Text>
          </View>
          <View className={`px-2.5 py-1 rounded-lg border ${bg} ${border}`}>
              <Text className={`text-[10px] font-bold uppercase ${textColor}`}>
                {item.status.replace('_', ' ')}
              </Text>
          </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-[#0A192F] border-b border-white/5">
          <View className="flex-row items-center justify-between mb-4">
              <Text className="text-3xl font-extrabold tracking-tight text-white">Support</Text>
              {isStaff && (
                <View className="flex-row items-center px-3 py-1 border rounded-full bg-blue-500/10 border-blue-500/20">
                  <ShieldAlert size={16} color="#60A5FA" />
                  <Text className="ml-2 text-xs font-bold text-blue-400 uppercase">Staff Mode</Text>
                </View>
              )}
          </View>
          
          {/* Enhanced Tabs */}
          <View className="flex-row gap-3">
              {isStaff && (
                  <TouchableOpacity onPress={() => setActiveTab('queue')} className={`flex-1 items-center py-2.5 rounded-xl border ${activeTab === 'queue' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>
                      <Text className={`font-bold text-sm ${activeTab === 'queue' ? 'text-[#0A192F]' : 'text-white'}`}>Queue</Text>
                  </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setActiveTab('my_tickets')} className={`flex-1 items-center py-2.5 rounded-xl border ${activeTab === 'my_tickets' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>
                  <Text className={`font-bold text-sm ${activeTab === 'my_tickets' ? 'text-[#0A192F]' : 'text-white'}`}>My Tickets</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('faq')} className={`flex-1 items-center py-2.5 rounded-xl border ${activeTab === 'faq' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>
                  <Text className={`font-bold text-sm ${activeTab === 'faq' ? 'text-[#0A192F]' : 'text-white'}`}>FAQ</Text>
              </TouchableOpacity>
          </View>
      </View>

      {/* Content Area */}
      <View className="flex-1 px-6 pt-4">
          {(tickets.length > 0 || searchQuery !== '') && activeTab !== 'faq' && (
             <View className="bg-[#112240] rounded-xl px-4 py-3 mb-4 flex-row items-center border border-white/10">
                <Search size={18} color="#8892B0" />
                <TextInput 
                  className="flex-1 ml-3 text-white" 
                  placeholder="Search tickets..." 
                  placeholderTextColor="#475569" 
                  value={searchQuery} 
                  onChangeText={setSearchQuery}
                />
             </View>
          )}

          {activeTab === 'faq' ? (
              <ScrollView className="flex-1">
                  <View className="bg-[#112240] p-6 rounded-2xl border border-white/5 mb-4">
                      <HelpCircle size={32} color="#64FFDA" className="mb-4"/>
                      <Text className="mb-2 text-lg font-bold text-white">How do I verify my account?</Text>
                      <Text className="text-[#8892B0] leading-5">Go to Settings &gt; Profile and upload your ID document. Our team usually reviews within 24 hours.</Text>
                  </View>
                  <View className="bg-[#112240] p-6 rounded-2xl border border-white/5">
                      <Lock size={32} color="#A78BFA" className="mb-4"/>
                      <Text className="mb-2 text-lg font-bold text-white">Is my data safe?</Text>
                      <Text className="text-[#8892B0] leading-5">Yes, all sensitive data is encrypted using AES-256 before being stored in our database.</Text>
                  </View>
              </ScrollView>
          ) : loading ? (
              <View className="items-center justify-center flex-1"><ActivityIndicator size="large" color="#64FFDA" /></View>
          ) : (
              <FlatList 
                  data={filteredTickets}
                  keyExtractor={i => i.id}
                  renderItem={renderTicketItem}
                  contentContainerStyle={{ paddingBottom: 100 }}
                  refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#64FFDA" />}
                  ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-50">
                        <MessageSquare size={48} color="#8892B0" />
                        <Text className="text-[#8892B0] text-center mt-4 text-lg">No tickets found.</Text>
                        <Text className="text-[#8892B0] text-xs mt-1">Tap + to create a new request.</Text>
                    </View>
                  }
              />
          )}
      </View>

      {(activeTab === 'my_tickets' || !isStaff) && (
          <TouchableOpacity onPress={() => setCreateModalVisible(true)} className="absolute bottom-10 right-6 w-14 h-14 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20" activeOpacity={0.8}>
            <Plus size={28} color="#0A192F" />
          </TouchableOpacity>
      )}

      {/* CREATE MODAL */}
      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
              <View className="justify-end flex-1 bg-black/80">
                  <View className="bg-[#112240] p-6 rounded-t-3xl h-[85%] border-t border-white/10">
                      <View className="flex-row items-center justify-between mb-8">
                          <Text className="text-2xl font-bold text-white">New Ticket</Text>
                          <TouchableOpacity onPress={() => setCreateModalVisible(false)} className="p-2 rounded-full bg-white/5"><X size={24} color="#8892B0" /></TouchableOpacity>
                      </View>
                      <ScrollView>
                        <Text className="text-[#8892B0] font-bold text-xs uppercase mb-2 ml-1">Subject</Text>
                        <TextInput placeholder="Brief summary..." placeholderTextColor="#475569" className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 text-base" value={subject} onChangeText={setSubject}/>
                        <Text className="text-[#8892B0] font-bold text-xs uppercase mb-2 ml-1">Details</Text>
                        <TextInput placeholder="Describe your issue..." placeholderTextColor="#475569" className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 h-40 text-base" multiline textAlignVertical="top" value={message} onChangeText={setMessage}/>
                        <TouchableOpacity onPress={handleCreate} disabled={isSubmitting} className={`bg-[#64FFDA] p-4 rounded-xl items-center shadow-lg ${isSubmitting ? 'opacity-50' : 'opacity-100'}`}>
                            {isSubmitting ? <ActivityIndicator color="#0A192F" /> : <Text className="text-[#0A192F] font-bold text-lg">Submit Request</Text>}
                        </TouchableOpacity>
                      </ScrollView>
                  </View>
              </View>
          </KeyboardAvoidingView>
      </Modal>

      {/* DETAILS MODAL */}
      <Modal visible={detailModalVisible} animationType="slide" onRequestClose={() => setDetailModalVisible(false)}>
          <SafeAreaView className="flex-1 bg-[#0A192F]">
              <View className="px-4 py-3 border-b border-white/10 flex-row justify-between items-center bg-[#112240]">
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)} className="p-2"><X size={24} color="white" /></TouchableOpacity>
                  <View className="flex-row items-center">
                    <Text className="mr-2 font-bold text-white">Status:</Text>
                    {isStaff ? (
                        <TouchableOpacity onPress={() => setStatusModalVisible(true)} className="flex-row items-center px-3 py-1 rounded-lg bg-white/10">
                            <Text className="text-[#64FFDA] font-bold uppercase text-xs mr-1">{selectedTicket?.status?.replace('_', ' ')}</Text>
                            <ChevronDown size={12} color="#64FFDA" />
                        </TouchableOpacity>
                    ) : (
                        <View className="px-3 py-1 rounded-lg bg-white/5"><Text className="text-[#8892B0] font-bold uppercase text-xs">{selectedTicket?.status?.replace('_', ' ')}</Text></View>
                    )}
                  </View>
                  {isStaff ? <TouchableOpacity onPress={handleDelete} className="p-2"><Trash2 size={20} color="#F87171" /></TouchableOpacity> : <View className="w-8" />}
              </View>
              {loadingDetails || !selectedTicket ? (
                  <View className="items-center justify-center flex-1"><ActivityIndicator color="#64FFDA"/></View>
              ) : (
                  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
                          <View className="bg-[#112240] p-5 rounded-2xl mb-6 border border-white/5">
                              <Text className="mb-2 text-xl font-bold text-white">{selectedTicket.subject}</Text>
                              <View className="flex-row gap-3 mt-2">
                                  <View className="bg-[#0A192F] px-2 py-1 rounded border border-white/5"><Text className="text-[#8892B0] text-xs">{selectedTicket.category}</Text></View>
                                  <View className="flex-row items-center bg-[#0A192F] px-2 py-1 rounded border border-white/5">
                                    <Clock size={10} color="#8892B0" className="mr-1" />
                                    <Text className="text-[#8892B0] text-xs">{new Date(selectedTicket.created_at).toLocaleString()}</Text>
                                  </View>
                              </View>
                          </View>
                          
                          <Text className="text-[#8892B0] font-bold mb-4 uppercase text-xs tracking-widest pl-1">Discussion</Text>
                          
                          <View className="gap-4 pb-4">
                            {selectedTicket.messages
                                ?.filter((msg: any) => isStaff || !msg.is_internal)
                                ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                ?.map((msg: any) => (
                                <View key={msg.id} className={`p-4 rounded-2xl border ${msg.is_internal ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-[#112240] border-white/5'}`}>
                                    {msg.is_internal && (
                                        <View className="flex-row items-center pb-2 mb-2 border-b border-yellow-500/10">
                                            <Lock size={12} color="#EAB308" />
                                            <Text className="text-yellow-500 text-[10px] ml-2 font-bold uppercase tracking-wider">Internal Staff Note</Text>
                                        </View>
                                    )}
                                    <Text className={`${msg.is_internal ? 'text-yellow-100' : 'text-white'} text-base leading-6`}>{msg.message}</Text>
                                    <Text className="text-[#8892B0] text-[10px] mt-2 text-right opacity-60">
                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </Text>
                                </View>
                            ))}
                          </View>
                      </ScrollView>
                      
                      <View className="border-t border-white/10 bg-[#0D1F3A]">
                          {isStaff && (
                              <View className="px-4 pt-3 pb-1 border-b border-white/5">
                                  <View className="flex-row gap-2">
                                      <TextInput 
                                        className="flex-1 bg-[#0A192F] text-yellow-100 p-3 rounded-lg border border-yellow-500/20 text-sm" 
                                        placeholder="Add internal note..." 
                                        placeholderTextColor="#64748B" 
                                        value={internalNote} 
                                        onChangeText={setInternalNote}
                                      />
                                      <TouchableOpacity onPress={() => handleReply(true)} disabled={!internalNote.trim() || isSubmitting} className="items-center justify-center w-12 border rounded-lg bg-yellow-600/20 border-yellow-600/50">
                                          {isSubmitting ? <ActivityIndicator size="small" color="#EAB308"/> : <Lock size={18} color="#EAB308" />}
                                      </TouchableOpacity>
                                  </View>
                              </View>
                          )}
                          <View className="flex-row items-end gap-3 p-4">
                              <TextInput 
                                className="flex-1 bg-[#0A192F] text-white p-4 rounded-xl border border-white/10 max-h-32 text-base" 
                                placeholder="Type a reply..." 
                                placeholderTextColor="#475569" 
                                value={reply} 
                                onChangeText={setReply} 
                                multiline
                              />
                              <TouchableOpacity onPress={() => handleReply(false)} disabled={!reply.trim() || isSubmitting} className={`w-12 h-12 rounded-xl items-center justify-center shadow-lg ${reply.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'}`}>
                                  {isSubmitting ? <ActivityIndicator color="#0A192F"/> : <Send size={20} color={reply.trim() ? '#0A192F' : '#8892B0'} />}
                              </TouchableOpacity>
                          </View>
                      </View>
                  </KeyboardAvoidingView>
              )}
          </SafeAreaView>
      </Modal>

      <Modal visible={statusModalVisible} transparent animationType="fade" onRequestClose={() => setStatusModalVisible(false)}>
          <View className="items-center justify-center flex-1 p-6 bg-black/60">
              <View className="bg-[#112240] rounded-3xl border border-white/10 p-6 w-full max-w-xs shadow-2xl">
                  <Text className="mb-6 text-xl font-bold text-center text-white">Update Ticket Status</Text>
                  <View className="gap-3">
                      {[
                          { key: 'open', label: 'Open', color: 'text-green-400', bg: 'bg-green-500/10' }, 
                          { key: 'in_progress', label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' }, 
                          { key: 'pending', label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }, 
                          { key: 'resolved', label: 'Resolved', color: 'text-purple-400', bg: 'bg-purple-500/10' }, 
                          { key: 'closed', label: 'Closed', color: 'text-gray-400', bg: 'bg-gray-500/10' }
                      ].map((s) => (
                          <TouchableOpacity key={s.key} onPress={() => handleStatusChange(s.key)} className={`p-4 rounded-xl border border-white/5 ${s.bg} flex-row justify-center items-center`}>
                              <Text className={`font-bold ${s.color} mr-2`}>{s.label}</Text>
                              {selectedTicket?.status === s.key && <CheckCircle size={16} color={s.color.split('-')[1]} />}
                          </TouchableOpacity>
                      ))}
                  </View>
                  <TouchableOpacity onPress={() => setStatusModalVisible(false)} className="mt-6"><Text className="text-[#8892B0] text-center font-medium">Cancel</Text></TouchableOpacity>
              </View>
          </View>
      </Modal>
    </SafeAreaView>
  );
}