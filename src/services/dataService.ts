import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';

// Supabase & Types
import { 
  supabase, 
  adminChangeUserRole, 
  adminDeactivateUser, 
  adminDeleteUser 
} from '../lib/supabase';
import { 
  Transaction, 
  DocumentItem, 
  User, 
  Message, 
  UserRole, 
  BudgetWithSpent,
  FinancialSummary,
  CpaClient
} from '../types';

/**
 * ------------------------------------------------------------------
 * 1. ACCOUNT MANAGEMENT
 * Critical for linking transactions to a source of funds.
 * ------------------------------------------------------------------
 */

/**
 * Retrieves the user's primary account ID or creates one if missing.
 * Prevents "Foreign Key Violation" errors during transaction creation.
 */
const getDefaultAccountId = async (userId: string): Promise<string> => {
  try {
    const { data: accounts, error: fetchError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (fetchError) throw fetchError;

    if (accounts && accounts.length > 0) {
      return accounts[0].id;
    }

    // Create default 'Main Wallet' if user has no accounts
    const { data: newAccount, error: createError } = await supabase
      .from('accounts')
      .insert([{
        user_id: userId,
        name: 'Main Wallet',
        type: 'cash',
        currency: 'USD',
        balance: 0,
        is_active: true
      }])
      .select()
      .single();

    if (createError) throw createError;
    return newAccount.id;

  } catch (error: any) {
    console.error("Account Initialization Failed:", error.message);
    throw new Error("Could not initialize default account.");
  }
};

/**
 * ------------------------------------------------------------------
 * 2. TRANSACTION MANAGEMENT
 * Core financial data handling.
 * ------------------------------------------------------------------
 */

/**
 * Fetches all transactions for a user, joined with category names.
 */
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        icon,
        color
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Fetch Transactions Error:', error);
    return [];
  }
  
  // Transform data to match UI Transaction interface
  return data.map((t: any) => ({
      ...t,
      // Flatten joined category data for easier UI consumption
      category: t.categories?.name || 'Uncategorized',
      category_icon: t.categories?.icon,
      category_color: t.categories?.color
  }));
};

/**
 * Creates a new transaction.
 * Handles negative amounts for expenses automatically.
 * Auto-creates categories if they don't exist.
 */
export const createTransaction = async (
  transaction: Partial<Transaction>, 
  userId: string
) => {
  try {
    // 1. Ensure a valid Account ID exists
    const accountId = await getDefaultAccountId(userId);
    
    // 2. Resolve Category ID (Find existing or Create new)
    let categoryId = transaction.category_id;
    
    if (!categoryId && transaction.category) {
        // Try to find category by name (case-insensitive search ideally, but simple match here)
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', transaction.category)
          .limit(1)
          .maybeSingle();

        if (cat) {
          categoryId = cat.id;
        } else {
             // Create new category if missing
             const { data: newCat, error: catError } = await supabase
               .from('categories')
               .insert({ 
                 name: transaction.category, 
                 type: 'expense', 
                 user_id: userId, 
                 icon: 'tag' 
               })
               .select()
               .single();
             
             if (catError) console.warn("Category creation warning:", catError);
             if (newCat) categoryId = newCat.id;
        }
    }
    
    // 3. Normalize Amount (Expenses are negative, Income positive)
    let finalAmount = Number(transaction.amount || 0);
    const type = transaction.type || (finalAmount >= 0 ? 'income' : 'expense');

    if (type === 'expense') {
        finalAmount = -Math.abs(finalAmount);
    } else {
        finalAmount = Math.abs(finalAmount);
    }

    // 4. Insert Transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: userId,
        account_id: accountId,
        category_id: categoryId,
        amount: finalAmount,
        status: 'cleared',
        type: type,
        date: transaction.date || new Date().toISOString()
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

/**
 * Deletes a transaction by ID.
 */
export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * ------------------------------------------------------------------
 * 3. BUDGET MANAGEMENT
 * Tracking spending vs limits.
 * ------------------------------------------------------------------
 */

/**
 * Fetches budgets and calculates total spent for each category.
 */
export const getBudgets = async (userId: string): Promise<BudgetWithSpent[]> => {
  try {
    // 1. Fetch Budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (name, color)
      `) 
      .eq('user_id', userId);

    if (budgetError) throw budgetError;

    // 2. Fetch current month's expenses
    // Optimized: Only fetch amount & category_id
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, category_id') 
      .eq('user_id', userId)
      .eq('type', 'expense') // Only expenses count towards budget
      .lt('amount', 0); // Double check negative

    // 3. Aggregate Spending
    return (budgets || []).map((b: any) => {
      const categoryName = b.categories?.name || 'Uncategorized';
      
      const spent = transactions
        ?.filter((t: any) => t.category_id === b.category_id) 
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

      // Calculate percentage for UI bars
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      return { 
        ...b, 
        category_name: categoryName, 
        spent,
        remaining: b.amount - spent,
        percentage: Math.min(percentage, 100)
      };
    });

  } catch (error) {
    console.error("Get Budgets Error:", error);
    return [];
  }
};

/**
 * Creates a new budget for a category.
 */
export const createBudget = async (userId: string, categoryName: string, limit: number) => {
  try {
    let categoryId: string | undefined;
    
    // Find category ID
    const { data: existingCats } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      // Search for user's custom categories OR system default categories (null user_id)
      .or(`user_id.eq.${userId},user_id.is.null`) 
      .limit(1);

    if (existingCats && existingCats.length > 0) {
      categoryId = existingCats[0].id;
    } else {
      // Create Category if it doesn't exist
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({ 
          name: categoryName, 
          type: 'expense', 
          user_id: userId, 
          icon: 'chart-pie' 
        })
        .select()
        .single();
        
      if (catError) throw new Error(`Category creation failed: ${catError.message}`);
      categoryId = newCat.id;
    }

    // Insert Budget
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        user_id: userId,
        category_id: categoryId,
        amount: limit,
        period: 'monthly',
        start_date: new Date().toISOString(),
        rollover: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (error: any) {
    console.error("Create Budget Error:", error.message);
    throw error;
  }
};

export const deleteBudget = async (id: string) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

/**
 * ------------------------------------------------------------------
 * 4. DASHBOARD ANALYTICS
 * ------------------------------------------------------------------
 */

/**
 * Calculates Income, Expenses, Balance, and Trend Graph data.
 */
export const getFinancialSummary = async (userId: string): Promise<FinancialSummary> => {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: true }); // Important for trend graph

  if (error) {
    console.warn("Analytics fetch failed:", error);
    return { 
      balance: 0, 
      income: 0, 
      expense: 0, 
      trend: [{ value: 0, date: new Date().toISOString() }] 
    };
  }

  let income = 0;
  let expense = 0;
  let runningBalance = 0;
  
  // Calculate Running Balance for Trend Graph
  const trend = transactions.map((t: any) => {
      runningBalance += parseFloat(t.amount);
      return { 
        value: runningBalance,
        date: t.date 
      };
  });

  // Calculate Totals
  transactions.forEach((tx: any) => {
    const amt = parseFloat(tx.amount);
    if (amt > 0) income += amt;
    else expense += Math.abs(amt);
  });

  return {
    balance: income - expense, // Or use final runningBalance
    income,
    expense,
    trend: trend.length > 0 ? trend : [{ value: 0, date: new Date().toISOString() }]
  };
};

/**
 * ------------------------------------------------------------------
 * 5. SETTINGS, PROFILE & SECURITY
 * ------------------------------------------------------------------
 */

export const updateCurrency = async (userId: string, currency: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
        currency: currency, 
        updated_at: new Date().toISOString() 
    })
    .eq('id', userId);

  if (error) throw error;
};

export const updateProfileName = async (userId: string, firstName: string, lastName: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
        first_name: firstName, 
        last_name: lastName, 
        updated_at: new Date().toISOString() 
    })
    .eq('id', userId);

  if (error) throw error;
};

// --- Secure Key Management ---

/**
 * Saves an encrypted API key for a specific service.
 */
export const saveGeminiKey = async (userId: string, apiKey: string) => {
  // Upsert pattern: Insert or Update on conflict
  const { error } = await supabase
    .from('user_secrets')
    .upsert({ 
      user_id: userId, 
      service: 'gemini', 
      api_key_encrypted: apiKey 
    }, { onConflict: 'user_id,service' });

  if (error) throw error;
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

/**
 * ------------------------------------------------------------------
 * 6. DOCUMENT MANAGEMENT
 * Uploads, scanning, and file handling.
 * ------------------------------------------------------------------
 */

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
      url: d.url,
      // Map DB types to UI types
      type: d.mime_type?.includes('pdf') ? 'contract' : 'receipt'
  }));
};

/**
 * Uploads a file to Supabase Storage and creates a database record.
 */
export const uploadDocument = async (
    userId: string, 
    uri: string, 
    fileName: string, 
    type: 'receipt' | 'invoice' | 'contract' | 'other'
) => {
  try {
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${userId}/${timestamp}_${cleanFileName}`;
    
    let fileBody: any;

    // Platform-specific file reading
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileBody = await response.blob();
    } else {
        // Read file as base64 for mobile upload
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        fileBody = decode(base64);
    }

    // 1. Upload to Storage Bucket
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBody, { 
          contentType: fileName.endsWith('pdf') ? 'application/pdf' : 'image/jpeg', 
          upsert: true 
        });

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
    
    // 3. Create Database Record
    const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
            user_id: userId,
            file_name: fileName,
            file_path: filePath, 
            mime_type: fileName.endsWith('pdf') ? 'application/pdf' : 'image/jpeg',
            size_bytes: 0, // In real app, calculate this from blob size
            status: 'processed',
            extracted_data: {},
            url: publicUrl,
            // type column doesn't exist in raw schema provided earlier, 
            // so we might need to rely on mime_type or update schema
        })
        .select()
        .single();

    if (dbError) throw dbError;
    return data;

  } catch (e: any) {
    console.error('Upload failed:', e.message);
    throw e;
  }
};

/**
 * UI Wrapper to pick a document and upload it.
 */
export const pickAndUploadFile = async (userId: string) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    return await uploadDocument(userId, asset.uri, asset.name, 'other');

  } catch (e: any) {
    console.error("File Picker Error:", e.message);
    throw e;
  }
};

/**
 * Triggers an Edge Function to perform OCR on a document.
 */
export const processReceiptAI = async (documentPath: string) => {
  const { data, error } = await supabase.functions.invoke('ocr-scan', {
    body: { documentPath }
  });

  if (error) throw new Error(error.message || 'AI processing failed');
  if (data?.error) throw new Error(data.error);
  
  return data.data; 
};

/**
 * Generates a CSV of all user data and shares it.
 */
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
    csvContent += `Document,${d.created_at},"${d.file_name || 'Doc'}",-,-,"${d.file_name || ''}"\n`;
  });

  // Save to cache directory
  const fileUri = FileSystem.documentDirectory + `NorthFinance_Report_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

  // Share file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error("Sharing is not available on this device");
  }
};

/**
 * ------------------------------------------------------------------
 * 7. MESSAGING SYSTEM (End-to-End Encrypted)
 * ------------------------------------------------------------------
 */

/**
 * Gets or Creates a conversation between two users.
 * Ensures uniqueness (only one DM thread per pair).
 */
export const getOrCreateConversation = async (
  currentUserId: string,
  targetUserId: string
): Promise<string> => {
  try {
    // Ensure profiles exist for both users
    await ensureProfileExists(currentUserId);
    await ensureProfileExists(targetUserId);

    // 1. Fetch all 'direct' conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_participants!conversation_participants_user_id_fkey!inner (user_id)
      `)
      .eq('type', 'direct');

    if (error) throw error;

    // 2. Client-side filtering to find exact match of participants
    // (Optimization: In production, use a Database Function for this)
    const existing = conversations?.find((c: any) => {
        const pIds = c.conversation_participants.map((p: any) => p.user_id);
        return pIds.includes(currentUserId) && pIds.includes(targetUserId);
    });

    if (existing) return existing.id;

    // 3. Create New Conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({ type: 'direct' }) // created_at defaults to now()
      .select()
      .single();

    if (createError) throw createError;

    // 4. Add Both Participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: currentUserId },
        { conversation_id: newConv.id, user_id: targetUserId }
      ]);

    if (partError) throw partError;

    return newConv.id;

  } catch (e) {
    console.error("Conversation Init Error:", e);
    throw e;
  }
};

const ensureProfileExists = async (userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    // Create minimal profile
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: '', // Will be updated by auth trigger
        first_name: 'User',
        last_name: '',
        role: 'member',
        currency: 'USD',
        country: 'US',
        updated_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.warn('Profile creation warning:', error);
    }
  }
};

/**
 * Fetches all people available to chat (Contacts list).
 */
export const getConversations = async (userId: string) => {
  // Fetch users excluding self
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) return [];
  
  return data.map((p: any) => ({
    id: p.id,
    name: p.first_name ? `${p.first_name} ${p.last_name}` : p.email?.split('@')[0] || 'User',
    avatar: p.avatar_url,
    role: p.role,
    lastMessage: 'Tap to start chatting', 
    time: ''
  }));
};

/**
 * Loads messages for a specific conversation.
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true }); // Oldest first for chat UI logic

  if (error) {
    console.error("Fetch Messages Error:", error);
    return [];
  }
  
  return data as Message[];
};

/**
 * Sends an encrypted message.
 * NOTE: The 'content' arg MUST be pre-encrypted by the client before calling this.
 */
export const sendMessage = async (
  targetUserId: string, 
  currentUserId: string, 
  encryptedContent: string
) => {
  try {
      // Ensure conversation exists
      const conversationId = await getOrCreateConversation(currentUserId, targetUserId);
      
      const { error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content_encrypted: encryptedContent,
            is_system_message: false,
            // Assuming read_by is a JSONB array column
            read_by: JSON.stringify([currentUserId]) 
        });

      if (error) throw error;
  } catch (e) {
      console.error("Send Message Error:", e);
      throw e;
  }
};

/**
 * Real-time Subscription Wrapper.
 */
export const subscribeToChat = (conversationId: string, callback: (msg: Message) => void) => {
  console.log(`🔍 [Realtime] Subscribing to chat ${conversationId}`);
  return supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log(`✅ [Realtime] New message in ${conversationId}:`, payload.new);
        callback(payload.new as Message);
      }
    )
    .subscribe((status) => {
      console.log(`📡 [Realtime] Subscription status for ${conversationId}:`, status);
    });
};

export const getUserDetails = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
};

/**
 * ------------------------------------------------------------------
 * 8. ADMIN, CPA & SUPPORT FUNCTIONS
 * ------------------------------------------------------------------
 */

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

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

/**
 * Admin: Change User Status (Banned/Active)
 */
export const updateUserStatus = async (userId: string, status: 'active' | 'banned') => {
  if (status === 'banned') {
      // Use Admin SDK if available locally, else call Edge Function
      if (adminDeactivateUser) { 
        await adminDeactivateUser(userId); 
      } else { 
        await supabase.functions.invoke('admin-deactivate', { body: { userId, deactivate: true } }); 
      }
  }
};

/**
 * Admin: Change User Role
 */
export const updateUserRole = async (userId: string, newRole: string) => {
     if (adminChangeUserRole) { 
       await adminChangeUserRole(userId, newRole); 
     } else { 
       await supabase.functions.invoke('admin-change-role', { body: { userId, newRole } }); 
     }
};

/**
 * Admin: Hard Delete User
 */
export const removeUser = async (userId: string) => {
    if (adminDeleteUser) { 
      await adminDeleteUser(userId); 
    } else { 
      await supabase.functions.invoke('admin-delete', { body: { userId } }); 
    }
};

/**
 * CPA: Get assigned clients
 */
export const getCpaClients = async (cpaId: string): Promise<CpaClient[]> => {
  console.log(`🔍 [CPA] Fetching clients for CPA ${cpaId}`);
  const { data, error } = await supabase
    .from('cpa_clients')
    .select(`
      *,
      client:profiles!cpa_clients_client_id_fkey (*)
    `)
    .eq('cpa_id', cpaId);

  if (error) {
    console.error("❌ [CPA] Fetch error:", error);
    return [];
  }
  console.log(`✅ [CPA] Fetched ${data?.length || 0} clients`);

  // Map nested client data
  return data.map((item: any) => ({
    id: item.client.id,
    name: item.client.first_name ? `${item.client.first_name} ${item.client.last_name}` : 'Unknown',
    email: item.client.email,
    status: item.status,
    last_audit: item.updated_at || new Date().toISOString(),
    permissions: item.permissions || {}
  }));
};

/**
 * Support: Create new ticket
 */
export const createTicket = async (userId: string, subject: string, message: string, category: string) => {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      user_id: userId,
      subject,
      category,
      status: 'open',
      priority: 'medium'
    })
    .select()
    .single();

  if (error) throw error;

  // Add initial message
  await supabase
    .from('ticket_messages')
    .insert({
      ticket_id: ticket.id,
      user_id: userId,
      message,
      is_internal: false
    });

  // Notify staff of new ticket
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (user) {
    await notifyStaffNewTicket(ticket.id, subject, user.email || 'Unknown User', userId);
  }

  return ticket;
};

export const getTickets = async (userId: string) => {
  console.log(`🔍 [Tickets] Fetching tickets for user ${userId}`);
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ [Tickets] Fetch error:", error);
    return [];
  }
  console.log(`✅ [Tickets] Fetched ${data?.length || 0} tickets`);
  return data;
};

export const updateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed') => {
  // Get ticket info before update
  const { data: ticket } = await supabase
    .from('tickets')
    .select('user_id, subject')
    .eq('id', ticketId)
    .single();

  const { error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId);
  if (error) throw error;

  // Notify user if status changed
  if (ticket) {
    await notifyUserTicketUpdate(ticket.user_id, ticketId, ticket.subject, status.replace('_', ' '));
  }
};

export const addInternalNote = async (ticketId: string, userId: string, note: string) => {
  const { error } = await supabase
    .from('ticket_messages')
    .insert({
        ticket_id: ticketId,
        user_id: userId,
        message: note,
        is_internal: true // Only visible to staff
    });
  if (error) throw error;
};

export const addTicketReply = async (ticketId: string, userId: string, reply: string) => {
  const { error } = await supabase
    .from('ticket_messages')
    .insert({
        ticket_id: ticketId,
        user_id: userId,
        message: reply,
        is_internal: false // Public reply
    });
  if (error) throw error;
};

export const getTicketDetails = async (ticketId: string) => {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      user:profiles!tickets_user_id_fkey(*),
      messages:ticket_messages!ticket_id(*)
    `)
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return ticket;
};

export const getAllTickets = async () => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      user:profiles!tickets_user_id_fkey(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// --- NOTIFICATION SYSTEM ---

export interface NotificationItem {
  id: string;
  user_id: string;
  created_by?: string;
  title: string;
  message: string;
  type: 'ticket' | 'cpa' | 'message' | 'system';
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'ticket' | 'cpa' | 'message' | 'system',
  relatedId?: string,
  createdBy?: string
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      related_id: relatedId,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const markAllNotificationsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

export const subscribeToNotifications = (userId: string, callback: (notification: NotificationItem) => void) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => callback(payload.new as NotificationItem)
    )
    .subscribe();
};

// --- NOTIFICATION TRIGGERS ---

export const notifyStaffNewTicket = async (ticketId: string, ticketSubject: string, userEmail: string, createdBy?: string) => {
  // Get all staff users
  const { data: staff } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'support', 'cpa']);

  if (staff) {
    for (const s of staff) {
      await createNotification(
        s.id,
        'New Support Ticket',
        `New ticket: "${ticketSubject}" from ${userEmail}`,
        'ticket',
        ticketId,
        createdBy
      );
    }
  }
};

export const notifyUserTicketUpdate = async (userId: string, ticketId: string, ticketSubject: string, newStatus: string, createdBy?: string) => {
  await createNotification(
    userId,
    'Ticket Status Updated',
    `Your ticket "${ticketSubject}" status changed to: ${newStatus}`,
    'ticket',
    ticketId,
    createdBy
  );
};

export const notifyCpaRequest = async (cpaId: string, clientName: string, createdBy?: string) => {
  await createNotification(
    cpaId,
    'New CPA Request',
    `${clientName} has requested to connect with you as their CPA`,
    'cpa',
    undefined,
    createdBy
  );
};

export const notifyClientInvitation = async (clientId: string, cpaName: string, createdBy?: string) => {
  await createNotification(
    clientId,
    'CPA Invitation',
    `${cpaName} has invited you to connect as your CPA`,
    'cpa',
    undefined,
    createdBy
  );
};

export const notifyNewMessage = async (recipientId: string, senderName: string, conversationId: string, createdBy?: string) => {
  await createNotification(
    recipientId,
    'New Message',
    `You have a new message from ${senderName}`,
    'message',
    conversationId,
    createdBy
  );
};

// --- ALIAS EXPORTS FOR COMPATIBILITY ---
export const getAllUsers = getUsers;
export const deleteUser = removeUser;
export const changeUserRole = updateUserRole;
export const changeUserStatus = updateUserStatus;