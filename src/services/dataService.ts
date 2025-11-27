import { supabase, adminChangeUserRole, adminDeactivateUser, adminDeleteUser } from '../lib/supabase';
import { Transaction, DocumentItem, User, Message } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; 
import { decode } from 'base64-arraybuffer';

// ==========================================
// 1. ACCOUNTS (Critical for Transactions)
// ==========================================

// Helper to get a valid account ID (required by your schema)
const getDefaultAccountId = async (userId: string): Promise<string> => {
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

  if (error) throw new Error(`Failed to create default account: ${error.message}`);
  return newAccount.id;
};

// ==========================================
// 2. TRANSACTIONS
// ==========================================

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  // Join with categories to get the name for the UI
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name)')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  // Map DB result to UI Type
  return data.map((t: any) => ({
      ...t,
      category: t.categories?.name || 'Uncategorized'
  }));
};

export const createTransaction = async (transaction: Partial<Transaction>, userId: string) => {
  try {
    const accountId = await getDefaultAccountId(userId);
    
    let finalAmount = transaction.amount || 0;
    if (transaction.type === 'expense' && finalAmount > 0) {
      finalAmount = -finalAmount;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: userId,
        account_id: accountId, // REQUIRED by your schema
        amount: finalAmount,
        status: 'cleared',
        type: transaction.type || (finalAmount >= 0 ? 'income' : 'expense') // Ensure type enum is set
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
// 3. BUDGETS (Schema-Compliant)
// ==========================================

export const getBudgets = async (userId: string) => {
  // Join with categories to get the NAME
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*, categories(name)') 
    .eq('user_id', userId);

  if (error) {
      console.error("Get Budgets Error:", error);
      throw error;
  }

  // Calculate spending by matching category_id
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category_id') 
    .eq('user_id', userId)
    .lt('amount', 0); 

  return budgets.map((b: any) => {
    const categoryName = b.categories?.name || 'Unknown';
    
    // Strict matching on category_id (Your schema relates them)
    const spent = transactions
      ?.filter((t: any) => t.category_id === b.category_id) 
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

    return { ...b, category_name: categoryName, spent };
  });
};

export const createBudget = async (userId: string, categoryName: string, limit: number) => {
  // 1. Find or Create Category ID (Required by Budgets FK)
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
      .insert({ 
          name: categoryName, 
          type: 'expense', 
          user_id: userId,
          icon: 'tag' // Default icon
      })
      .select()
      .single();
      
    if (catError) throw new Error(`Category creation failed: ${catError.message}`);
    categoryId = newCat.id;
  }

  // 2. Create Budget
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
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

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
// 5. SETTINGS & PROFILE
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

// ==========================================
// 6. DOCUMENTS & EXPORT
// ==========================================

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
  
  return data.map((d: any) => ({
      ...d,
      name: d.file_name, // Map DB 'file_name' to UI 'name'
      size: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : 'Unknown',
      date: d.created_at
  }));
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
    
    // Get info to convert size to number if possible, or use static for now if FS doesn't return it easily
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const sizeBytes = fileInfo.exists ? fileInfo.size : 0;

    const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: userId,
        file_name: fileName, // Schema uses 'file_name', not 'name'
        file_path: filePath, // Schema uses 'file_path'
        mime_type: 'image/jpeg',
        size_bytes: sizeBytes, // Schema uses BIGINT
        status: 'scanning',
        extracted_data: {},
        type: type, // Ensure type matches schema enum or text
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

// NEW: Call the AI Edge Function
export const processReceiptAI = async (documentPath: string) => {
  const { data, error } = await supabase.functions.invoke('ocr-scan', {
    body: { documentPath }
  });

  if (error) throw new Error(error.message || 'AI processing failed');
  if (data?.error) throw new Error(data.error);
  
  return data.data; // Returns { merchant_name, total_amount, etc. }
};

// NEW: Export Data to CSV
export const exportDocumentsToCSV = async (userId: string) => {
  // 1. Fetch Data
  const docs = await getDocuments(userId);
  const txs = await getTransactions(userId);

  if (docs.length === 0 && txs.length === 0) throw new Error("No data to export.");

  // 2. Build CSV Content
  let csvContent = "Type,Date,Description,Amount,Category,File Name\n";

  // Add Transactions
  txs.forEach(t => {
    const amount = t.amount ? t.amount.toFixed(2) : "0.00";
    csvContent += `Transaction,${t.date},"${t.description || ''}",${amount},${t.category_id || ''},-\n`;
  });

  // Add Documents
  docs.forEach(d => {
    // Note: Adjust property names to match DB response (file_name vs name)
    csvContent += `Document,${d.date},"${d.name || 'Doc'}",-,-,"${d.file_name || ''}"\n`;
  });

  // 3. Save to File
  const fileUri = FileSystem.documentDirectory + `NorthFinance_Report_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

  // 4. Share/Export
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error("Sharing is not available on this device");
  }
};

// ==========================================
// 7. MESSAGING (E2EE Ready)
// ==========================================

// Helper: Find or create conversation between two users
const getConversationId = async (currentUserId: string, targetUserId: string): Promise<string> => {
  // Simplified: Create new if not found (Robust for MVP)
  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({ type: 'direct' })
    .select()
    .single();
    
  if (error) throw error;
  
  await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: targetUserId }
  ]);
  
  return newConv.id;
};

export const getConversations = async (userId: string) => {
  // Fetching profiles for UI contact list
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) return [];
  return data.map((p: any) => ({
    id: p.id, // This is the USER ID
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'Unknown User',
    avatar: p.avatar_url,
    role: p.role,
    lastMessage: 'Tap to chat',
    time: ''
  }));
};

export const getChatHistory = async (conversationId: string) => {
    // Note: This function is called by the UI with 'conversationId'. 
    // If the UI passes a User ID instead (as in current mockup), this will fail to find messages.
    // For the MVP to work with your current chat screen, we fetch messages where conversation_id matches.
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
    
    if (error) return [];
    return data;
};

export const sendMessage = async (targetUserId: string, currentUserId: string, content: string) => {
  try {
      // Auto-find conversation logic
      const conversationId = await getConversationId(currentUserId, targetUserId);
      
      const { error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content_encrypted: content,
            is_system_message: false
        });

      if (error) throw error;
  } catch (e) {
      console.error("Send Message Error:", e);
      throw e;
  }
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

// ==========================================
// 8. ADMIN & CPA
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

// --- ALIASES ---
export const getAllUsers = getUsers;
export const deleteUser = removeUser;
export const changeUserRole = updateUserRole;
export const changeUserStatus = updateUserStatus;
export { User };