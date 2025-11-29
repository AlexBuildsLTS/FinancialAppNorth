import { supabase, adminChangeUserRole, adminDeactivateUser, adminDeleteUser } from '../lib/supabase';
import { Transaction, DocumentItem, User, Message } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; 
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

// ==========================================
// 1. ACCOUNTS (Critical for Transactions)
// ==========================================

const getDefaultAccountId = async (userId: string): Promise<string> => {
  try {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (accounts && accounts.length > 0) {
      return accounts[0].id;
    }

    // Create default account if none exists
    const { data: newAccount, error } = await supabase
      .from('accounts')
      .insert([{
        user_id: userId,
        name: 'Main Wallet',
        type: 'cash',
        currency: 'USD',
        balance: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return newAccount.id;
  } catch (e: any) {
    console.error("Account Init Error:", e.message);
    throw e;
  }
};

// ==========================================
// 2. TRANSACTIONS
// ==========================================

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name)')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return data.map((t: any) => ({
      ...t,
      category: t.categories?.name || 'Uncategorized'
  }));
};

export const createTransaction = async (transaction: Partial<Transaction>, userId: string) => {
  try {
    // 1. Ensure Account Exists (Fixes "0 Balance" bug)
    const accountId = await getDefaultAccountId(userId);
    
    // 2. Resolve Category ID
    let categoryId = transaction.category_id;
    if (!categoryId && transaction.category) {
        // Try to find category by name
        const { data: cat } = await supabase.from('categories').select('id').eq('name', transaction.category).limit(1).maybeSingle();
        if (cat) categoryId = cat.id;
        else {
             // Create if missing
             const { data: newCat } = await supabase.from('categories').insert({ name: transaction.category, type: 'expense', user_id: userId, icon: 'tag' }).select().single();
             if (newCat) categoryId = newCat.id;
        }
    }
    
    let finalAmount = Number(transaction.amount || 0);
    if (transaction.type === 'expense') {
        finalAmount = -Math.abs(finalAmount);
    } else {
        finalAmount = Math.abs(finalAmount);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: userId,
        account_id: accountId, // REQUIRED
        category_id: categoryId,
        amount: finalAmount,
        status: 'cleared',
        type: transaction.type || (finalAmount >= 0 ? 'income' : 'expense')
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Create Transaction Error:", err.message);
    throw err;
  }
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 3. BUDGETS
// ==========================================

export const getBudgets = async (userId: string) => {
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*, categories(name)') 
    .eq('user_id', userId);

  if (error) {
      console.error("Get Budgets Error:", error);
      throw error;
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category_id') 
    .eq('user_id', userId)
    .lt('amount', 0); 

  return budgets.map((b: any) => {
    const categoryName = b.categories?.name || 'Unknown';
    const spent = transactions
      ?.filter((t: any) => t.category_id === b.category_id) 
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

    return { ...b, category_name: categoryName, spent };
  });
};

export const createBudget = async (userId: string, categoryName: string, limit: number) => {
  let categoryId: string | undefined;
  
  const { data: existingCats } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .or(`user_id.eq.${userId},user_id.is.null`) 
    .limit(1);

  if (existingCats && existingCats.length > 0) {
    categoryId = existingCats[0].id;
  } else {
    const { data: newCat, error: catError } = await supabase
      .from('categories')
      .insert({ name: categoryName, type: 'expense', user_id: userId, icon: 'tag' })
      .select()
      .single();
      
    if (catError) throw new Error(`Category creation failed: ${catError.message}`);
    categoryId = newCat.id;
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert([{
      user_id: userId,
      category_id: categoryId,
      amount: limit,
      period: 'monthly',
      start_date: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBudget = async (id: string) => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 4. DASHBOARD METRICS
// ==========================================

export const getFinancialSummary = async (userId: string) => {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) return { balance: 0, income: 0, expense: 0, trend: [{value: 0}] };

  let income = 0;
  let expense = 0;
  let runningBalance = 0;
  
  const trend = transactions.map((t: any) => {
      runningBalance += parseFloat(t.amount);
      return { value: runningBalance };
  });

  transactions.forEach((tx: any) => {
    const amt = parseFloat(tx.amount);
    if (amt > 0) income += amt;
    else expense += Math.abs(amt);
  });

  return {
    balance: income - expense,
    income,
    expense,
    trend: trend.length > 0 ? trend : [{value: 0}, {value: 0}]
  };
};

// ==========================================
// 5. SETTINGS & PROFILE & AI KEYS
// ==========================================

export const updateCurrency = async (userId: string, currency: string) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ 
        id: userId, 
        currency: currency, 
        updated_at: new Date().toISOString() 
    });

  if (error) throw error;
};

export const updateProfileName = async (userId: string, firstName: string, lastName: string) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ 
        id: userId, 
        first_name: firstName, 
        last_name: lastName, 
        updated_at: new Date().toISOString() 
    });

  if (error) throw error;
};

// FIX: AI Key Functions (Restored)
export const saveGeminiKey = async (userId: string, apiKey: string) => {
  // Check if exists first to avoid constraint errors
  const { data: existing } = await supabase
    .from('user_secrets')
    .select('id')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('user_secrets').update({ api_key_encrypted: apiKey }).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_secrets').insert({ user_id: userId, service: 'gemini', api_key_encrypted: apiKey });
    if (error) throw error;
  }
};

export const getGeminiKey = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('user_secrets')
    .select('api_key_encrypted')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .maybeSingle();
    
  return data?.api_key_encrypted || null;
};

// ==========================================
// 6. DOCUMENTS & EXPORT
// ==========================================

export const getDocuments = async (userId: string): Promise<DocumentItem[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  
  return data.map((d: any) => ({
      ...d,
      name: d.file_name,
      size: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : 'Unknown',
      date: d.created_at,
      url: d.url
  }));
};

export const uploadDocument = async (
    userId: string, 
    uri: string, 
    fileName: string, 
    type: 'receipt' | 'invoice' | 'contract' | 'other' // Fixed Type
) => {
  try {
    const filePath = `${userId}/${Date.now()}_${fileName}`;
    let fileBody: any;

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileBody = await response.blob();
    } else {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        fileBody = decode(base64);
    }

    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBody, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
    
    // Simple size check
    const sizeBytes = 0; 

    const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        file_name: fileName,
        file_path: filePath, 
        mime_type: 'image/jpeg',
        size_bytes: sizeBytes,
        status: 'processed',
        extracted_data: {},
        type: type, 
        url: publicUrl,
        date: new Date().toISOString()
    }).select().single();

    if (dbError) throw dbError;
    return data;
  } catch (e: any) {
    console.error('Upload failed:', e.message);
    throw e;
  }
};

// FIX: pickAndUploadFile (Restored)
export const pickAndUploadFile = async (userId: string) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    // Fixed: Passes 'other' correctly now
    return await uploadDocument(userId, asset.uri, asset.name, 'other');

  } catch (e: any) {
    console.error("File Picker Error:", e.message);
    throw e;
  }
};

export const processReceiptAI = async (documentPath: string) => {
  const { data, error } = await supabase.functions.invoke('ocr-scan', {
    body: { documentPath }
  });

  if (error) throw new Error(error.message || 'AI processing failed');
  if (data?.error) throw new Error(data.error);
  
  return data.data; 
};

export const exportDocumentsToCSV = async (userId: string) => {
  const docs = await getDocuments(userId);
  const txs = await getTransactions(userId);

  if (docs.length === 0 && txs.length === 0) throw new Error("No data to export.");

  let csvContent = "Type,Date,Description,Amount,Category,File Name\n";
  
  txs.forEach(t => {
    const amount = t.amount ? t.amount.toFixed(2) : "0.00";
    csvContent += `Transaction,${t.date},"${t.description || ''}",${amount},${t.category || ''},-\n`;
  });
  
  docs.forEach(d => {
    csvContent += `Document,${d.date},"${d.name || 'Doc'}",-,-,"${d.file_name || ''}"\n`;
  });

  const fileUri = FileSystem.documentDirectory + `NorthFinance_Report_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error("Sharing is not available on this device");
  }
};

// ==========================================
// 7. MESSAGING (Fixed: No Duplicates + E2EE Support)
// ==========================================

// 1. Get or Create a conversation (Prevents duplicates)
export const getOrCreateConversation = async (currentUserId: string, targetUserId: string) => {
  try {
    // A. Check if conversation already exists
    // We fetch all direct conversations and filter in JS because Supabase simple filtering is limited for many-to-many
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, conversation_participants!inner(user_id)')
      .eq('type', 'direct');

    if (error) throw error;

    // Find one where BOTH users are participants
    const existing = conversations?.find((c: any) => {
        const pIds = c.conversation_participants.map((p: any) => p.user_id);
        return pIds.includes(currentUserId) && pIds.includes(targetUserId);
    });

    if (existing) return existing.id;

    // B. If none, Create new one
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_at: new Date().toISOString() })
      .select()
      .single();

    if (createError) throw createError;

    // C. Add Participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: targetUserId }
    ]);

    return newConv.id;
  } catch (e) {
    console.error("Conversation Init Error:", e);
    throw e;
  }
};

// 2. Get List of People to Chat With
export const getConversations = async (userId: string) => {
  // In a real app, you'd fetch distinct conversations. 
  // For this MVP, we fetch all profiles (Contacts list style)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) return [];
  
  return data.map((p: any) => ({
    id: p.id,
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown User',
    avatar: p.avatar_url,
    role: p.role,
    lastMessage: 'Tap to start chatting', 
    time: ''
  }));
};

// 3. Get Messages for a specific chat
export const getConversationMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Fetch Messages Error:", error);
    return [];
  }
  return data;
};

// 4. Send a Message
export const sendMessage = async (targetUserId: string, currentUserId: string, content: string) => {
  try {
      // Ensure conversation exists first
      const conversationId = await getOrCreateConversation(currentUserId, targetUserId);
      
      const { error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content_encrypted: content, // Pass the ALREADY ENCRYPTED string here
            is_system_message: false
        });

      if (error) throw error;
  } catch (e) {
      console.error("Send Message Error:", e);
      throw e;
  }
};

// 5. Subscribe to Realtime Updates
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

// 6. Get User Details (For Header)
export const getUserDetails = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
};

// ==========================================
// 8. ADMIN, CPA & SUPPORT
// ==========================================

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((p: any) => ({
    id: p.id, 
    email: p.email || 'No Email', 
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown',
    role: p.role, 
    status: 'active', 
    avatar: p.avatar_url, 
    currency: p.currency, 
    country: p.country
  }));
};

export const updateUserStatus = async (userId: string, status: 'active' | 'banned') => {
  if (status === 'banned') {
      if (adminDeactivateUser) { await adminDeactivateUser(userId); }
      else { await supabase.functions.invoke('admin-deactivate', { body: { userId, deactivate: true } }); }
  }
};

export const updateUserRole = async (userId: string, newRole: string) => {
     if (adminChangeUserRole) { await adminChangeUserRole(userId, newRole); }
     else { await supabase.functions.invoke('admin-change-role', { body: { userId, newRole } }); }
};

export const removeUser = async (userId: string) => {
    if (adminDeleteUser) { await adminDeleteUser(userId); }
    else { await supabase.functions.invoke('admin-delete', { body: { userId } }); }
};

export const getCpaClients = async (cpaId: string) => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .select('*, client:profiles(*)')
    .eq('cpa_id', cpaId);

  if (error) return [];
  return data.map((item: any) => ({
    id: item.client.id,
    name: item.client.first_name ? `${item.client.first_name} ${item.client.last_name}` : 'Unknown',
    email: item.client.email,
    status: item.status,
    last_audit: item.last_audit,
  })) || [];
};

// FIX: Support Tickets (Restored)
export const createTicket = async (userId: string, subject: string, message: string, category: string) => {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({ user_id: userId, subject, category, status: 'open' })
    .select().single();
  
  if (error) throw error;

  await supabase
    .from('ticket_messages')
    .insert({ ticket_id: ticket.id, user_id: userId, message, is_internal: false });
    
  return ticket;
};

export const getTickets = async (userId: string) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) return [];
  return data;
};
// SUPPORT EXPANSION
export const updateTicketStatus = async (ticketId: string, status: 'open' | 'closed' | 'pending') => {
  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId);
  if (error) throw error;
};

export const addInternalNote = async (ticketId: string, userId: string, note: string) => {
  const { error } = await supabase
    .from('ticket_messages')
    .insert({
        ticket_id: ticketId,
        user_id: userId,
        message: note,
        is_internal: true // Special flag for admin eyes only
    });
  if (error) throw error;
};

export const getTicketDetails = async (ticketId: string) => {
  // Fetch ticket + messages (including internal ones)
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*, user:profiles(*), messages:ticket_messages(*)')
    .eq('id', ticketId)
    .single();
    
  if (error) throw error;
  return ticket;
};
// --- ALIASES ---
export const getAllUsers = getUsers;
export const deleteUser = removeUser;
export const changeUserRole = updateUserRole;
export const changeUserStatus = updateUserStatus;
export { User };