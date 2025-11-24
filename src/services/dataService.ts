import { supabase } from '../lib/supabase'; // Only import supabase, as admin functions are invoked via it
import { Transaction, DocumentItem, User } from '../types';
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
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

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

export const uploadDocument = async (
  userId: string, 
  uri: string, 
  fileName: string, 
  type: 'receipt' | 'invoice' | 'contract',
  mimeType: string = 'image/jpeg' // Added mimeType support
) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    // 1. Upload to Storage Bucket 'documents'
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

    // 3. Insert Metadata
    const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        name: fileName,
        type: type,
        url: publicUrl,
        size: '2MB', // ideally calculate actual size from base64 length
        date: new Date().toISOString()
    }).select().single();

    if (dbError) throw dbError;
    return data;
  } catch (e) {
    console.error('Upload failed:', e);
    throw e;
  }
};

// --- REALTIME CHAT (P2P / Support) ---

export const subscribeToChat = (chatId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload: { new: any; }) => callback(payload.new)
    )
    .subscribe();
};

export const sendMessage = async (chatId: string, userId: string, text: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({
        chat_id: chatId,
        sender_id: userId,
        text: text,
        created_at: new Date().toISOString()
    });

  if (error) throw error;
};

export const getChatHistory = async (chatId: string) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
    
    if (error) return [];
    return data;
};

// --- ADMIN USER MANAGEMENT ---
// These connect to the Edge Functions we set up in lib/supabase.ts

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return (data || []).map((p: any) => ({
    id: p.id,
    email: p.email || 'No Email',
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown',
    role: p.role,
    status: 'active', // Defaulting to active as 'banned' status isn't in profiles yet
    avatar: p.avatar_url,
    currency: p.currency,
    country: p.country
  }));
};

export const updateUserStatus = async (userId: string, status: 'active' | 'banned'): Promise<void> => {
  if (status === 'banned') {
    await supabase.functions.invoke('deactivateUser', { body: { userId } });
  } else {
    console.warn("Re-activation requires manual DB intervention or new Edge Function.");
  }
};

export const updateUserRole = async (userId: string, newRole: string): Promise<void> => {
  await supabase.functions.invoke('changeUserRole', { body: { userId, newRole } });
};

export const removeUser = async (userId: string): Promise<void> => {
  await supabase.functions.invoke('deleteUser', { body: { userId } });
};
// --- CPA PORTAL ---

export const getCpaClients = async (cpaId: string) => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .select('*, client:profiles(*)') // Fetch client details from profiles table
    .eq('cpa_id', cpaId);

  if (error) {
    console.error('Error fetching CPA clients:', error);
    return [];
  }

  return data.map((item: { client: { id: any; first_name: any; last_name: any; email: any; }; status: any; last_audit: any; }) => ({
    id: item.client.id,
    name: item.client.first_name ? `${item.client.first_name} ${item.client.last_name}` : 'Unknown',
    email: item.client.email,
    status: item.status,
    last_audit: item.last_audit,
  })) || [];
};

export const addCpaClient = async (cpaId: string, clientEmail: string) => {
  // First, find the client's user ID based on their email
  const { data: clientData, error: clientError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', clientEmail)
    .single();

  if (clientError || !clientData) {
    console.error('Error finding client by email:', clientError);
    throw new Error('Client not found with the provided email.');
  }

  const clientId = clientData.id;

  // Then, insert the relationship into cpa_clients
  const { data, error } = await supabase
    .from('cpa_clients')
    .insert([{ cpa_id: cpaId, client_id: clientId, status: 'active', last_audit: new Date().toISOString() }])
    .select()
    .single();

  if (error) {
    console.error('Error adding CPA client:', error);
    throw error;
  }
  return data;
};

export const updateCpaClientStatus = async (cpaId: string, clientId: string, status: 'active' | 'pending') => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .update({ status: status, last_audit: new Date().toISOString() })
    .eq('cpa_id', cpaId)
    .eq('client_id', clientId)
    .select()
    .single();

  if (error) {
    console.error('Error updating CPA client status:', error);
    throw error;
  }
  return data;
};