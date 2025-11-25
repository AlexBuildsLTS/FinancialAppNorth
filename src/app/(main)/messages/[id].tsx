import { supabase, adminChangeUserRole, adminDeactivateUser, adminDeleteUser } from '../../../lib/supabase';
import { Transaction, DocumentItem, User } from '@./../src/types'
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// --- TRANSACTIONS ---
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data || [];
};

export const createTransaction = async (transaction: Partial<Transaction>, userId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transaction, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
};

// --- DOCUMENTS ---
export const getDocuments = async (userId: string): Promise<DocumentItem[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  return data || [];
};

export const uploadDocument = async (userId: string, uri: string, fileName: string, type: 'receipt' | 'invoice' | 'contract') => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

    const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        name: fileName,
        type: type,
        url: publicUrl,
        size: '2MB',
        date: new Date().toISOString()
    }).select().single();

    if (dbError) throw dbError;
    return data;
  } catch (e) {
    console.error('Upload failed:', e);
    throw e;
  }
};

// --- MESSAGING (Real-Time) ---
export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return data.map((p: any) => ({
    id: p.id,
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown User',
    avatar: p.avatar_url,
    role: p.role,
    lastMessage: 'Tap to start chatting',
    time: ''
  }));
};

export const getChatHistory = async (conversationId: string) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
    
    if (error) return [];
    return data;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content_encrypted: content,
        is_system_message: false
    });

  if (error) throw error;
};

export const subscribeToChat = (conversationId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
};

// --- ADMIN HELPERS ---
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id, email: p.email || 'No Email', name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown',
    role: p.role, status: 'active', avatar: p.avatar_url, currency: p.currency, country: p.country
  }));
};

export const updateUserStatus = async (userId: string, status: 'active' | 'banned') => {
  if (status === 'banned') await adminDeactivateUser(userId);
};

export const updateUserRole = async (userId: string, newRole: string) => await adminChangeUserRole(userId, newRole as any);

export const removeUser = async (userId: string) => await adminDeleteUser(userId);