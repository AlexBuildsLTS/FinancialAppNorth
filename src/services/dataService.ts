
import { supabase } from '../lib/supabase';
import { Transaction, DocumentItem } from '@./../src/types';
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

export const uploadDocument = async (userId: string, uri: string, fileName: string, type: 'receipt' | 'invoice' | 'contract') => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    
    // 1. Upload to Storage Bucket 'documents'
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

    // 3. Insert Metadata
    const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        name: fileName,
        type: type,
        url: publicUrl,
        size: '2MB', // Mock size for now
        date: new Date().toISOString().split('T')[0]
    }).select().single();

    if (dbError) throw dbError;
    return data;
  } catch (e) {
    console.error('Upload failed:', e);
    throw e;
  }
};

// --- REALTIME CHAT ---

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
