import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';

import { Stack, useFocusEffect } from 'expo-router';

import { Plus, MessageSquare, HelpCircle, X, Send, Lock, CheckCircle, AlertCircle, Filter, ShieldAlert, ChevronDown } from 'lucide-react-native';

import { useAuth } from '../../shared/context/AuthContext';

import { createTicket, getTickets, getAllTickets, updateTicketStatus, addInternalNote, addTicketReply, getTicketDetails, getUsers } from '../../services/dataService';

import { UserRole } from '../../types'; // Import UserRole enum





const STAFF_ROLES = [UserRole.ADMIN, UserRole.SUPPORT, UserRole.CPA];



export default function SupportScreen() {

  const { user } = useAuth();

  // Check if current user is staff

  const isStaff = user?.role && STAFF_ROLES.includes(user.role);

  

  const [activeTab, setActiveTab] = useState<'my_tickets' | 'all_tickets' | 'faq'>('my_tickets');

  const [tickets, setTickets] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  

  // Modal States

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [loadingDetails, setLoadingDetails] = useState(false);

  

  // Form States

  const [subject, setSubject] = useState('');

  const [message, setMessage] = useState('');

  const [internalNote, setInternalNote] = useState('');

  const [reply, setReply] = useState('');

  const [statusModalVisible, setStatusModalVisible] = useState(false);



  const loadData = async () => {

    if (!user) return;

    setLoading(true);

    try {

      let data = [];

      if (isStaff && activeTab === 'all_tickets') {

          data = await getAllTickets();

      } else {

          data = await getTickets(user.id);

      }

      setTickets(data);

    } catch (e) {

      console.error(e);

    } finally {

      setLoading(false);

    }

  };



  useFocusEffect(useCallback(() => { loadData(); }, [user, activeTab]));



  const handleCreate = async () => {

      if (!subject.trim() || !message.trim()) {

          Alert.alert("Error", "Please fill in all fields");

          return;

      }

      try {

          await createTicket(user!.id, subject, message, 'General');

          setCreateModalVisible(false);

          setSubject('');

          setMessage('');

          loadData();

          Alert.alert("Success", "Ticket created.");

      } catch (e: any) {

          Alert.alert("Error", e.message);

      }

  };



  const handleViewDetails = async (ticketId: string) => {

      setLoadingDetails(true);

      setDetailModalVisible(true);

      try {

          const details = await getTicketDetails(ticketId);

          setSelectedTicket(details);

      } catch (e) {

          Alert.alert("Error", "Failed to load ticket details");

          setDetailModalVisible(false);

      } finally {

          setLoadingDetails(false);

      }

  };



  const handleAddNote = async () => {

      if (!internalNote.trim()) return;

      try {

          await addInternalNote(selectedTicket.id, user!.id, internalNote);

          setInternalNote('');

          // Refresh details

          const updated = await getTicketDetails(selectedTicket.id);

          setSelectedTicket(updated);

      } catch (e: any) {

          Alert.alert("Error", e.message);

      }

  };

  const handleAddReply = async () => {

      if (!reply.trim()) return;

      try {

          await addTicketReply(selectedTicket.id, user!.id, reply);

          setReply('');

          // Refresh details

          const updated = await getTicketDetails(selectedTicket.id);

          setSelectedTicket(updated);

      } catch (e: any) {

          Alert.alert("Error", e.message);

      }

  };

  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed') => {

      try {

          await updateTicketStatus(selectedTicket.id, newStatus);

          const updated = await getTicketDetails(selectedTicket.id);

          setSelectedTicket(updated);

          setStatusModalVisible(false);

          loadData(); // Refresh list

      } catch (e: any) {

          Alert.alert("Error", e.message);

      }

  };



  const renderTicketItem = ({ item }: { item: any }) => {
    const userInfo = isStaff && activeTab === 'all_tickets' ? item.user : null;
    const displayName = userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || userInfo.email : `Ticket #${item.id.slice(0, 8)}`;

    return (

      <TouchableOpacity

          onPress={() => handleViewDetails(item.id)}

          className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row justify-between items-center active:bg-white/5"

      >

          <View className="flex-1 mr-4">

              <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{item.subject}</Text>

              <Text className="text-[#8892B0] text-xs">{displayName} • {new Date(item.created_at).toLocaleDateString()}</Text>

          </View>

          <View className={`px-3 py-1 rounded-full border ${
              item.status === 'open' ? 'bg-green-500/20 border-green-500/30' :
              item.status === 'in_progress' ? 'bg-blue-500/20 border-blue-500/30' :
              item.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500/30' :
              item.status === 'resolved' ? 'bg-purple-500/20 border-purple-500/30' :
              'bg-red-500/20 border-red-500/30'
          }`}>
  
              <Text className={`text-[10px] font-bold uppercase ${
                  item.status === 'open' ? 'text-green-400' :
                  item.status === 'in_progress' ? 'text-blue-400' :
                  item.status === 'pending' ? 'text-yellow-400' :
                  item.status === 'resolved' ? 'text-purple-400' :
                  'text-red-400'
              }`}>
  
                  {item.status.replace('_', ' ')}
  
              </Text>
  
          </View>

      </TouchableOpacity>

    );
  };



  return (

    <SafeAreaView className="flex-1 bg-[#0A192F]">

      <View className="px-6 py-4">

          <View className="flex-row justify-between items-center mb-6">

              <Text className="text-white text-3xl font-bold">Support Center</Text>

              {isStaff && (

                  <View className="bg-blue-500/20 p-2 rounded-lg">

                      <ShieldAlert size={20} color="#60A5FA" />

                  </View>

              )}

          </View>

          

          {/* Tabs */}

          <View className="flex-row gap-3 mb-6">

              <TouchableOpacity onPress={() => setActiveTab('my_tickets')} className={`px-5 py-2.5 rounded-full border ${activeTab === 'my_tickets' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>

                  <Text className={`${activeTab === 'my_tickets' ? 'text-[#0A192F]' : 'text-white'} font-bold`}>My Tickets</Text>

              </TouchableOpacity>

              

              {isStaff && (

                  <TouchableOpacity onPress={() => setActiveTab('all_tickets')} className={`px-5 py-2.5 rounded-full border ${activeTab === 'all_tickets' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>

                      <Text className={`${activeTab === 'all_tickets' ? 'text-[#0A192F]' : 'text-white'} font-bold`}>All Queue</Text>

                  </TouchableOpacity>

              )}



               <TouchableOpacity onPress={() => setActiveTab('faq')} className={`px-5 py-2.5 rounded-full border ${activeTab === 'faq' ? 'bg-[#64FFDA] border-[#64FFDA]' : 'bg-[#112240] border-white/10'}`}>

                  <Text className={`${activeTab === 'faq' ? 'text-[#0A192F]' : 'text-white'} font-bold`}>FAQ</Text>

              </TouchableOpacity>

          </View>



          {/* List Area */}

          {loading ? (

              <ActivityIndicator size="large" color="#64FFDA" className="mt-10" />

          ) : (

              <FlatList 

                  data={tickets}

                  keyExtractor={i => i.id}

                  renderItem={renderTicketItem}

                  contentContainerStyle={{ paddingBottom: 100 }}

                  ListEmptyComponent={

                    <View className="items-center justify-center mt-20 opacity-50">

                        <HelpCircle size={48} color="#8892B0" />

                        <Text className="text-[#8892B0] text-center mt-4 text-lg">No tickets found.</Text>

                        <Text className="text-[#8892B0] text-xs mt-1">Tap + to create one.</Text>

                    </View>

                  }

                  refreshControl={

                      <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#64FFDA" />

                  }

              />

          )}

      </View>



      {/* FAB */}

      {!isStaff || activeTab === 'my_tickets' ? (

          <TouchableOpacity 

            onPress={() => setCreateModalVisible(true)}

            className="absolute bottom-24 right-6 w-14 h-14 bg-[#64FFDA] rounded-full items-center justify-center shadow-lg shadow-[#64FFDA]/20"

            activeOpacity={0.8}

          >

            <Plus size={28} color="#0A192F" />

          </TouchableOpacity>

      ) : null}



      {/* CREATE MODAL */}

      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">

              <View className="flex-1 bg-black/80 justify-end">

                  <View className="bg-[#112240] p-6 rounded-t-3xl h-[85%] border-t border-white/10">

                      <View className="flex-row justify-between items-center mb-6">

                          <Text className="text-white text-2xl font-bold">New Ticket</Text>

                          <TouchableOpacity onPress={() => setCreateModalVisible(false)} className="p-2 bg-white/5 rounded-full">

                              <X size={24} color="#8892B0" />

                          </TouchableOpacity>

                      </View>



                      <ScrollView>

                        <Text className="text-[#8892B0] font-bold text-xs uppercase mb-2 ml-1">Subject</Text>

                        <TextInput 

                            placeholder="What's the issue?" 

                            placeholderTextColor="#475569"

                            className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 text-lg"

                            value={subject}

                            onChangeText={setSubject}

                        />

                        

                        <Text className="text-[#8892B0] font-bold text-xs uppercase mb-2 ml-1">Details</Text>

                        <TextInput 

                            placeholder="Describe your issue in detail..." 

                            placeholderTextColor="#475569"

                            className="bg-[#0A192F] text-white p-4 rounded-xl mb-6 border border-white/10 h-40 text-base"

                            multiline

                            textAlignVertical="top"

                            value={message}

                            onChangeText={setMessage}

                        />



                        <TouchableOpacity onPress={handleCreate} className="bg-[#64FFDA] p-4 rounded-xl items-center shadow-lg">

                            <Text className="text-[#0A192F] font-bold text-lg">Submit Request</Text>

                        </TouchableOpacity>

                      </ScrollView>

                  </View>

              </View>

          </KeyboardAvoidingView>

      </Modal>



      {/* DETAILS MODAL */}

      <Modal visible={detailModalVisible} animationType="slide" onRequestClose={() => setDetailModalVisible(false)}>

          <SafeAreaView className="flex-1 bg-[#0A192F]">

              {/* Header */}

              <View className="px-6 py-4 border-b border-white/10 flex-row justify-between items-center bg-[#112240]">

                  <TouchableOpacity onPress={() => setDetailModalVisible(false)} className="p-2 -ml-2">

                      <X size={24} color="white" />

                  </TouchableOpacity>

                  <Text className="text-white font-bold text-lg">Ticket #{selectedTicket?.id?.slice(0,6)}</Text>

                  

                  {/* Status Display/Change */}

                  {isStaff ? (

                      <TouchableOpacity

                        onPress={() => setStatusModalVisible(true)}

                        className={`px-3 py-1.5 rounded-lg flex-row items-center ${
                            selectedTicket?.status === 'open' ? 'bg-green-500/20' :
                            selectedTicket?.status === 'in_progress' ? 'bg-blue-500/20' :
                            selectedTicket?.status === 'pending' ? 'bg-yellow-500/20' :
                            selectedTicket?.status === 'resolved' ? 'bg-purple-500/20' :
                            'bg-red-500/20'
                        }`}

                      >

                          <Text className={`text-xs font-bold uppercase mr-1 ${
                              selectedTicket?.status === 'open' ? 'text-green-400' :
                              selectedTicket?.status === 'in_progress' ? 'text-blue-400' :
                              selectedTicket?.status === 'pending' ? 'text-yellow-400' :
                              selectedTicket?.status === 'resolved' ? 'text-purple-400' :
                              'text-red-400'
                          }`}>

                              {selectedTicket?.status.replace('_', ' ')}

                          </Text>

                          <ChevronDown size={12} color={
                              selectedTicket?.status === 'open' ? '#34D399' :
                              selectedTicket?.status === 'in_progress' ? '#60A5FA' :
                              selectedTicket?.status === 'pending' ? '#FBBF24' :
                              selectedTicket?.status === 'resolved' ? '#A78BFA' :
                              '#F87171'
                          } />

                      </TouchableOpacity>

                  ) : (

                      <View className={`px-3 py-1.5 rounded-lg ${
                          selectedTicket?.status === 'open' ? 'bg-green-500/20' :
                          selectedTicket?.status === 'in_progress' ? 'bg-blue-500/20' :
                          selectedTicket?.status === 'pending' ? 'bg-yellow-500/20' :
                          selectedTicket?.status === 'resolved' ? 'bg-purple-500/20' :
                          'bg-red-500/20'
                      }`}>

                           <Text className={`text-xs font-bold uppercase ${
                               selectedTicket?.status === 'open' ? 'text-green-400' :
                               selectedTicket?.status === 'in_progress' ? 'text-blue-400' :
                               selectedTicket?.status === 'pending' ? 'text-yellow-400' :
                               selectedTicket?.status === 'resolved' ? 'text-purple-400' :
                               'text-red-400'
                           }`}>

                              {selectedTicket?.status.replace('_', ' ')}

                          </Text>

                      </View>

                  )}

              </View>



              {loadingDetails ? (

                  <View className="flex-1 justify-center items-center"><ActivityIndicator color="#64FFDA"/></View>

              ) : (

                  <ScrollView className="flex-1 p-6">

                      {/* Ticket Info Card */}

                      <View className="bg-[#112240] p-5 rounded-2xl mb-8 border border-white/10 shadow-sm">

                          <Text className="text-white font-bold text-2xl mb-2 leading-8">{selectedTicket?.subject}</Text>

                          <View className="flex-row gap-3 mt-2">

                              <View className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5">

                                  <Text className="text-[#8892B0] text-xs font-medium">{selectedTicket?.category || 'General'}</Text>

                              </View>

                              <View className="bg-white/5 px-2.5 py-1 rounded-md border border-white/5">

                                  <Text className="text-[#8892B0] text-xs font-medium">

                                      {new Date(selectedTicket?.created_at).toLocaleDateString()}

                                  </Text>

                              </View>

                          </View>

                      </View>



                      {/* Messages Thread */}

                      <Text className="text-[#8892B0] font-bold mb-4 uppercase text-xs tracking-widest">Conversation History</Text>



                      <View className="gap-4 pb-10">

                        {selectedTicket?.messages
                          ?.filter((msg: any) => isStaff || !msg.is_internal) // Staff see all, users see public only
                          ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Sort by time
                          ?.map((msg: any) => (

                            <View key={msg.id} className={`p-4 rounded-2xl border ${msg.is_internal ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-[#112240] border-white/5'}`}>

                                {msg.is_internal && (

                                    <View className="flex-row items-center mb-2 pb-2 border-b border-yellow-500/10">

                                        <Lock size={12} color="#EAB308" />

                                        <Text className="text-yellow-500 text-[10px] ml-2 font-bold uppercase tracking-wider">Internal Staff Note</Text>

                                    </View>

                                )}

                                <Text className={`${msg.is_internal ? 'text-yellow-100' : 'text-white'} text-base leading-6`}>{msg.message}</Text>

                                <Text className="text-[#8892B0] text-[10px] mt-3 text-right opacity-60">

                                    {new Date(msg.created_at).toLocaleString()}

                                </Text>

                            </View>

                        ))}

                      </View>

                  </ScrollView>

              )}



              {/* Staff Inputs */}

              {isStaff && (

                  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                      <View className="border-t border-white/10 bg-[#0D1F3A]">

                          {/* Public Reply Input */}

                          <View className="p-4">

                              <Text className="text-[#64FFDA] font-bold mb-2 text-xs uppercase tracking-wide">Send Public Reply</Text>

                              <View className="flex-row gap-3 items-end">

                                  <TextInput

                                      className="flex-1 bg-[#0A192F] text-white p-4 rounded-xl border border-white/10 min-h-[50px]"

                                      placeholder="Reply to the customer..."

                                      placeholderTextColor="#475569"

                                      value={reply}

                                      onChangeText={setReply}

                                      multiline

                                  />

                                  <TouchableOpacity onPress={handleAddReply} disabled={!reply.trim()} className={`w-12 h-12 rounded-xl items-center justify-center shadow-lg ${reply.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'}`}>

                                      <Send size={20} color={reply.trim() ? '#0A192F' : '#8892B0'} />

                                  </TouchableOpacity>

                              </View>

                          </View>

                          {/* Internal Note Input */}

                          <View className="p-4 border-t border-white/5">

                              <Text className="text-[#64FFDA] font-bold mb-2 text-xs uppercase tracking-wide">Add Internal Note</Text>

                              <View className="flex-row gap-3 items-center">

                                  <TextInput

                                      className="flex-1 bg-[#0A192F] text-white p-4 rounded-xl border border-white/10 min-h-[50px]"

                                      placeholder="Write a note for other staff..."

                                      placeholderTextColor="#475569"

                                      value={internalNote}

                                      onChangeText={setInternalNote}

                                      multiline

                                  />

                                  <TouchableOpacity onPress={handleAddNote} disabled={!internalNote.trim()} className={`w-12 h-12 rounded-xl items-center justify-center shadow-lg ${internalNote.trim() ? 'bg-[#64FFDA]' : 'bg-white/10'}`}>

                                      <Send size={20} color={internalNote.trim() ? '#0A192F' : '#8892B0'} />

                                  </TouchableOpacity>

                              </View>

                          </View>

                      </View>

                  </KeyboardAvoidingView>

              )}

          </SafeAreaView>

      </Modal>

      {/* STATUS CHANGE MODAL */}

      <Modal visible={statusModalVisible} transparent animationType="fade" onRequestClose={() => setStatusModalVisible(false)}>

          <View className="flex-1 bg-black/50 justify-center items-center p-6">

              <View className="bg-[#112240] rounded-2xl border border-white/5 p-6 w-full max-w-sm">

                  <View className="flex-row justify-between items-center mb-6">

                      <Text className="text-white text-xl font-bold">Change Status</Text>

                      <TouchableOpacity onPress={() => setStatusModalVisible(false)}>

                          <X size={24} color="#8892B0" />

                      </TouchableOpacity>

                  </View>

                  <View className="gap-3">

                      {[
                          { key: 'open', label: 'Open', color: 'bg-green-500/20 border-green-500/30', textColor: 'text-green-400' },
                          { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20 border-blue-500/30', textColor: 'text-blue-400' },
                          { key: 'pending', label: 'Pending', color: 'bg-yellow-500/20 border-yellow-500/30', textColor: 'text-yellow-400' },
                          { key: 'resolved', label: 'Resolved', color: 'bg-purple-500/20 border-purple-500/30', textColor: 'text-purple-400' },
                          { key: 'closed', label: 'Closed', color: 'bg-red-500/20 border-red-500/30', textColor: 'text-red-400' }
                      ].map((status) => (

                          <TouchableOpacity

                              key={status.key}

                              onPress={() => handleStatusChange(status.key as any)}

                              className={`p-4 rounded-xl border ${status.color} ${selectedTicket?.status === status.key ? 'border-opacity-100' : 'border-opacity-50'}`}

                          >

                              <Text className={`font-bold text-center ${status.textColor}`}>{status.label}</Text>

                          </TouchableOpacity>

                      ))}

                  </View>

              </View>

          </View>

      </Modal>

    </SafeAreaView>

  );

}