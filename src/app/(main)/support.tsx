import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';

import { Stack, useFocusEffect } from 'expo-router';

import { Plus, MessageSquare, HelpCircle, X, Send, Lock, CheckCircle, AlertCircle, Filter, ShieldAlert } from 'lucide-react-native';

import { useAuth } from '../../shared/context/AuthContext';

import { createTicket, getTickets, updateTicketStatus, addInternalNote, getTicketDetails, getUsers } from '../../services/dataService'; 

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



  const loadData = async () => {

    if (!user) return;

    setLoading(true);

    try {

      let data = [];

      if (isStaff && activeTab === 'all_tickets') {

          // For Admin: In a real app, you would have a getAllTickets() function.

          // Reusing getTickets for now (which fetches user's own), but assuming 

          // you might implement admin logic later. 

          // If getTickets only returns own tickets, admins will only see their own.

          // To fix, add getAllTickets in dataService or update RLS policies.

          data = await getTickets(user.id); 

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



  const handleStatusChange = async (newStatus: 'open' | 'closed') => {

      try {

          await updateTicketStatus(selectedTicket.id, newStatus);

          const updated = await getTicketDetails(selectedTicket.id);

          setSelectedTicket(updated);

          loadData(); // Refresh list

      } catch (e: any) {

          Alert.alert("Error", e.message);

      }

  };



  const renderTicketItem = ({ item }: { item: any }) => (

    <TouchableOpacity 

        onPress={() => handleViewDetails(item.id)}

        className="bg-[#112240] p-4 rounded-xl mb-3 border border-white/5 flex-row justify-between items-center active:bg-white/5"

    >

        <View className="flex-1 mr-4">

            <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{item.subject}</Text>

            <Text className="text-[#8892B0] text-xs">#{item.id.slice(0, 8)} • {new Date(item.created_at).toLocaleDateString()}</Text>

        </View>

        <View className={`px-3 py-1 rounded-full ${item.status === 'open' ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'} border`}>

            <Text className={`text-[10px] font-bold uppercase ${item.status === 'open' ? 'text-green-400' : 'text-red-400'}`}>

                {item.status}

            </Text>

        </View>

    </TouchableOpacity>

  );



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

                  

                  {/* Admin Status Toggle */}

                  {isStaff ? (

                      <TouchableOpacity 

                        onPress={() => handleStatusChange(selectedTicket.status === 'open' ? 'closed' : 'open')}

                        className={`px-3 py-1.5 rounded-lg ${selectedTicket?.status === 'open' ? 'bg-red-500/20' : 'bg-green-500/20'}`}

                      >

                          <Text className={`text-xs font-bold ${selectedTicket?.status === 'open' ? 'text-red-400' : 'text-green-400'}`}>

                              {selectedTicket?.status === 'open' ? 'CLOSE TICKET' : 'REOPEN'}

                          </Text>

                      </TouchableOpacity>

                  ) : (

                      <View className={`px-3 py-1.5 rounded-lg ${selectedTicket?.status === 'open' ? 'bg-green-500/20' : 'bg-white/10'}`}>

                           <Text className={`text-xs font-bold uppercase ${selectedTicket?.status === 'open' ? 'text-green-400' : 'text-gray-400'}`}>

                              {selectedTicket?.status}

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

                        {selectedTicket?.messages?.map((msg: any) => (

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



              {/* Admin Internal Note Input */}

              {isStaff && (

                  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                      <View className="p-4 border-t border-white/10 bg-[#0D1F3A]">

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

                              <TouchableOpacity onPress={handleAddNote} className="bg-[#64FFDA] w-12 h-12 rounded-xl items-center justify-center shadow-lg">

                                  <Send size={20} color="#0A192F" />

                              </TouchableOpacity>

                          </View>

                      </View>

                  </KeyboardAvoidingView>

              )}

          </SafeAreaView>

      </Modal>

    </SafeAreaView>

  );

}