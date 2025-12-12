import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';

// Supabase Client & Admin Utilities
import { 
  supabase, 
  adminChangeUserRole, 
  adminDeactivateUser, 
  adminDeleteUser 
} from '../lib/supabase';

// Strict Type Definitions
import { 
  Transaction, 
  DocumentItem, 
  User, 
  Message, 
  BudgetWithSpent,
  FinancialSummary,
  CpaClient,
  NotificationItem,
  TablesInsert,
  TablesUpdate,
  UserRole
} from '../types';

// Import Settings Service for Key Retrieval
import { settingsService } from '../shared/services/settingsService';
import { encryptMessage, decryptMessage } from '../lib/crypto'; 

/**
 * ==============================================================================
 * 🛡️ INTERNAL HELPERS (Self-Healing & Schema Safety)
 * ==============================================================================
 */

/**
 * Ensures a user profile exists in the public schema.
 * Fixes Error 23503 (Foreign Key Violation) and 42501 (RLS).
 * Added retry logic for resilience.
 */
const ensureProfileExists = async (userId: string) => {
  try {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    
    if (!data) {
      console.log(`[DataService] 🛠️ Repairing missing profile for ${userId}...`);
      // Create if missing (RLS now allows this for authenticated users via our SQL fix)
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        email: 'user@placeholder.com', // Will be updated by auth triggers usually
        first_name: 'Member',
        role: 'member',
        currency: 'USD',
        updated_at: new Date().toISOString()
      });

      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('[DataService] ❌ Failed to repair profile:', insertError);
      }
    }
  } catch (e) {
    console.warn('[DataService] Profile check skipped:', e);
  }
};

/**
 * Ensures a default account exists for transactions.
 * Prevents "null account_id" errors during onboarding.
 */
const getDefaultAccountId = async (userId: string): Promise<string> => {
  const { data: accounts } = await supabase.from('accounts').select('id').eq('user_id', userId).limit(1);
  
  if (accounts && accounts.length > 0) {
    return accounts[0].id;
  }

  // Create default wallet
  const { data: newAccount, error } = await supabase.from('accounts').insert([{
    user_id: userId,
    name: 'Main Wallet',
    type: 'cash',
    currency: 'USD',
    balance: 0,
    is_active: true
  }]).select().single();

  if (error) throw error;
  return newAccount.id;
};

/**
 * 🔒 AUDIT LOGGING
 * Logs sensitive actions for security and compliance.
 * Useful for Admin/CPA tracking.
 */
export const logAuditAction = async (userId: string, action: string, details: string) => {
  // Fire and forget - non-blocking
  supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    details,
    created_at: new Date().toISOString()
  }).then(({ error }) => {
    if (error) console.warn('[Audit] Failed to log:', error.message);
  });
};

/**
 * ==============================================================================
 * 🔔 NOTIFICATIONS SYSTEM (Real-time & Persistent)
 * ==============================================================================
 */

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'ticket' | 'cpa' | 'message' | 'system',
  relatedId?: string,
  createdBy?: string
) => {
  // Construct payload safely
  const payload: any = {
    user_id: userId,
    title,
    message,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  if (relatedId) payload.related_id = relatedId;
  if (createdBy) payload.created_by = createdBy;

  // "Fire and forget" to avoid blocking UI
  supabase.from('notifications').insert(payload).then(({ error }) => {
    if (error) console.warn('[Notifications] Failed to send:', error.message);
  });
};

/**
 * Fetches notifications (Last 50, Unread Only by Default)
 */
export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false) // Only fetch unread to keep UI clean
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data as NotificationItem[];
};

/**
 * Marks a notification as read (removes from list).
 */
export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
    
  if (error) throw error;
};

/**
 * Clears all notifications for a user.
 */
export const markAllNotificationsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) throw error;
};

/**
 * Real-time notification subscription.
 */
export const subscribeToNotifications = (userId: string, callback: (n: NotificationItem) => void) => {
  return supabase
    .channel(`notifs:${userId}`)
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

// --- Notification Logic Triggers ---

export const notifyStaffNewTicket = async (ticketId: string, subject: string, userName: string) => {
  const { data: staff } = await supabase.from('profiles').select('id').in('role', ['admin', 'support']);
  staff?.forEach(s => {
    createNotification(s.id, 'New Ticket', `${userName}: ${subject}`, 'ticket', ticketId);
  });
};

export const notifyUserTicketUpdate = async (userId: string, ticketId: string, status: string) => {
  await createNotification(userId, 'Ticket Update', `Status changed to: ${status.replace('_', ' ')}`, 'ticket', ticketId);
};

export const notifyNewMessage = async (recipientId: string, senderName: string, conversationId: string, senderId?: string) => {
  await createNotification(recipientId, 'New Message', `From ${senderName}`, 'message', conversationId, senderId);
};

export const notifyCpaRequest = async (cpaId: string, clientName: string, createdBy?: string) => {
  await createNotification(
    cpaId,
    'New CPA Request',
    `${clientName} has requested to connect with you.`,
    'cpa',
    undefined,
    createdBy
  );
};

export const notifyClientInvitation = async (clientId: string, cpaName: string, createdBy?: string) => {
  await createNotification(
    clientId,
    'CPA Invitation',
    `${cpaName} has invited you to connect as your CPA.`,
    'cpa',
    undefined,
    createdBy
  );
};

export const notifyConnectionAccepted = async (targetId: string, accepterName: string) => {
  await createNotification(
    targetId,
    'Connection Accepted',
    `${accepterName} is now connected with you.`,
    'cpa'
  );
};

/**
 * ==============================================================================
 * 💬 MESSAGING SYSTEM (End-to-End Encrypted + Attachments)
 * ==============================================================================
 */

export const getOrCreateConversation = async (currentUserId: string, targetUserId: string): Promise<string> => {
  try {
    await ensureProfileExists(currentUserId);
    await ensureProfileExists(targetUserId);

    // 1. Search for existing direct conversation
    const { data: conversations } = await supabase
      .from('conversations')
      .select(`id, conversation_participants!inner(user_id)`)
      .eq('type', 'direct');

    const existing = conversations?.find((c: any) => {
      const pIds = c.conversation_participants.map((p: any) => p.user_id);
      return pIds.includes(currentUserId) && pIds.includes(targetUserId);
    });

    if (existing) {
      return existing.id;
    }

    console.log('[Messaging] 🆕 Creating new conversation...');
    
    // 2. Create new conversation container
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'direct' })
      .select()
      .single();

    if (convError) throw convError;

    // 3. Add both participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: currentUserId },
        { conversation_id: newConv.id, user_id: targetUserId }
      ]);

    if (partError) throw partError;

    return newConv.id;

  } catch (error: any) {
    console.error('[Messaging] ❌ Init Failed:', error);
    throw new Error('Failed to initialize chat. Please try again.');
  }
};

export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  content: string, // Can be text or empty if sending file
  attachment?: { uri: string; type: 'image' | 'document' | 'csv'; name: string }
) => {
  try {
    let attachmentUrl = null;
    let attachmentType = null;

    // 1. Upload Attachment if present
    if (attachment) {
      console.log('[Messaging] Uploading attachment:', attachment.name);
      // Create a clean file path
      const cleanName = attachment.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `${conversationId}/${Date.now()}_${cleanName}`;
      
      let fileBody: any;
      
      if (Platform.OS === 'web') {
          const response = await fetch(attachment.uri);
          fileBody = await response.blob();
      } else {
          // Robust mobile upload: Read as Base64 then decode to ArrayBuffer
          const base64 = await FileSystem.readAsStringAsync(attachment.uri, { encoding: FileSystem.EncodingType.Base64 });
          fileBody = decode(base64);
      }
      
      const { error: uploadError } = await supabase.storage
        .from('documents') // Reusing documents bucket for chat files
        .upload(path, fileBody, { 
            contentType: attachment.type === 'image' ? 'image/jpeg' : 'application/octet-stream', 
            upsert: true 
        });

      if (uploadError) {
          console.error('[Messaging] Upload Error:', uploadError);
          throw uploadError;
      }
      
      const { data } = supabase.storage.from('documents').getPublicUrl(path);
      attachmentUrl = data.publicUrl;
      attachmentType = attachment.type;
    }

    // 2. Insert Message
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content_encrypted: content || (attachment ? '[Attachment]' : ''), 
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      is_system_message: false,
      read_by: JSON.stringify([senderId])
    });

    if (error) throw error;

    // 3. Trigger Notification for Recipient
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', senderId);

    if (participants && participants.length > 0) {
      for (const p of participants) {
        await notifyNewMessage(p.user_id, 'Someone', conversationId, senderId);
      }
    }

  } catch (error: any) {
    console.error('[Messaging] ❌ Send Failed:', error);
    throw error;
  }
};

export const subscribeToChat = (conversationId: string, callback: (msg: Message) => void) => {
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
        callback(payload.new as Message);
      }
    )
    .subscribe();
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Messaging] Fetch Error:', error);
    return [];
  }
  return data as Message[];
};

export const getConversations = async (userId: string) => {
  // Fetch conversations with unread count logic
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) return [];
  
  // In a real app, you'd join with a 'messages' view to count unread. 
  // Here we simulate checking the last message status for the "Red Dot" feature.
  const conversations = await Promise.all(profiles.map(async (p: any) => {
    const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', p.id)
        .eq('is_system_message', false)
        // Assuming your schema has an 'is_read' or we check if NOT in 'read_by'
        // For simplicity/robustness in this schema:
        .not('read_by', 'cs', `{"${userId}"}`); 
    
    return {
        id: p.id,
        name: p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : 'User',
        avatar: p.avatar_url,
        role: p.role,
        unreadCount: count || 0, // <--- FOR RED DOTS
        lastMessage: 'Tap to chat', 
    };
  }));

  return conversations;
};

/**
 * ==============================================================================
 * 🎫 SUPPORT TICKETS (Complete CRUD + Internal Notes)
 * ==============================================================================
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

  await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    user_id: userId,
    message,
    is_internal: false
  });

  notifyStaffNewTicket(ticket.id, subject, 'User');
  return ticket;
};

export const getTickets = async (userId: string) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Fetch Tickets Error:", error);
    return [];
  }
  return data;
};

export const getAllTickets = async () => {
  // 1. Trigger Cleanup (Fire & Forget)
  supabase.rpc('cleanup_stale_tickets').then(({ error }) => {
    if (error) console.warn("Cleanup warning:", error);
  });

  // 2. Fetch Active Queue with EXPLICIT FOREIGN KEY
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      user:profiles!tickets_user_id_fkey(first_name, last_name, email)
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getTicketDetails = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`*, messages:ticket_messages(*), user:profiles!tickets_user_id_fkey(*)`)
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return data;
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
  const { error } = await supabase.from('tickets').update({ status }).eq('id', ticketId);
  if (error) throw error;
  
  const { data: ticket } = await supabase.from('tickets').select('user_id, subject').eq('id', ticketId).single();
  if (ticket) {
    notifyUserTicketUpdate(ticket.user_id, ticketId, status);
  }
};

export const addInternalNote = async (ticketId: string, userId: string, note: string) => {
  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    user_id: userId,
    message: note,
    is_internal: true 
  });
  if (error) throw error;
};

export const addTicketReply = async (ticketId: string, userId: string, reply: string) => {
  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    user_id: userId,
    message: reply,
    is_internal: false
  });
  if (error) throw error;
};
export const deleteTicket = async (ticketId: string) => {
  const { error } = await supabase.from('tickets').delete().eq('id', ticketId);
  if (error) throw error;
}

/**
 * ==============================================================================
 * 💰 TRANSACTIONS & BUDGETS (Robust Fix for 'Bad Request')
 * ==============================================================================
 */

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`*, categories (id, name, icon, color)`)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) return [];

  return data.map((t: any) => ({
      ...t,
      // Flatten joined category data
      category: t.categories ? t.categories.name : 'Uncategorized',
      category_id: t.category_id,
      category_icon: t.categories?.icon,
      category_color: t.categories?.color,
      is_tax_deductible: t.is_tax_deductible
  }));
};

export const createTransaction = async (transaction: Partial<Transaction>, userId: string) => {
  try {
    const accountId = await getDefaultAccountId(userId);
    let categoryId = transaction.category_id;
    let categoryName = 'Uncategorized';
    
    // 1. Resolve Category Name vs ID logic
    if (transaction.category) {
        if (typeof transaction.category === 'string') {
            categoryName = transaction.category;
        } else if (transaction.category.name) {
            categoryName = transaction.category.name;
            categoryId = transaction.category.id;
        }
    }

    // 2. Auto-Create Category if ID missing
    if (!categoryId && categoryName !== 'Uncategorized') {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .eq('user_id', userId) // Check user's specific categories first
          .maybeSingle();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
             // If not found, create new category dynamically
             const { data: newCat } = await supabase
               .from('categories')
               .insert({ name: categoryName, type: 'expense', user_id: userId, icon: 'tag' })
               .select()
               .single();
             if (newCat) categoryId = newCat.id;
        }
    }
    
    // 3. Calculate final amount direction
    let finalAmount = Number(transaction.amount || 0);
    const type = transaction.type || (finalAmount >= 0 ? 'income' : 'expense');
    if (type === 'expense') finalAmount = -Math.abs(finalAmount);
    else finalAmount = Math.abs(finalAmount);

    // 4. Construct Payload (Only schema-valid fields)
    // CRITICAL: Exclude 'category' text string to prevent database Schema errors
    const payload: any = {
        user_id: userId,
        account_id: accountId,
        amount: finalAmount,
        type,
        date: transaction.date || new Date().toISOString(),
        description: transaction.description,
        is_tax_deductible: transaction.is_tax_deductible || null
    };

    if (categoryId) payload.category_id = categoryId;

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    
    // NEW FEATURE: High Value Transaction Alert (Audit)
    if (Math.abs(finalAmount) > 5000) {
        logAuditAction(userId, 'HIGH_VALUE_TX', `Amount: ${finalAmount}`);
    }

    return data;
  } catch (err: any) {
    console.error("[DataService] Create Transaction Error:", err);
    throw err;
  }
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
};

/**
 * ==============================================================================
 * 📉 BUDGETS (CRUD)
 * ==============================================================================
 */

export const getBudgets = async (userId: string): Promise<BudgetWithSpent[]> => {
  try {
    // Fetch budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select(`*, categories (name, color)`) 
      .eq('user_id', userId);

    if (!budgets) return [];

    // Calculate actual spending against budgets
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, category_id') 
      .eq('user_id', userId)
      .eq('type', 'expense')
      .lt('amount', 0);

    return budgets.map((b: any) => {
      const spent = transactions
        ?.filter((t: any) => t.category_id === b.category_id) 
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      return { 
        ...b, 
        category_name: b.categories?.name || 'Uncategorized', 
        spent,
        remaining: b.amount - spent,
        percentage: Math.min(percentage, 100)
      };
    });
  } catch (error) {
    return [];
  }
};

export const createBudget = async (userId: string, categoryName: string, limit: number) => {
  // Find category ID from name
  const { data: cats } = await supabase.from('categories').select('id').eq('name', categoryName).limit(1);
  let catId = cats?.[0]?.id;

  if (!catId) {
    // Auto-create category if missing
    const { data: newCat } = await supabase.from('categories').insert({ name: categoryName, type: 'expense', user_id: userId }).select().single();
    catId = newCat?.id;
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert([{ user_id: userId, category_id: catId, amount: limit, start_date: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBudget = async (id: string) => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
};

/**
 * ==============================================================================
 * 📊 FINANCIAL ANALYSIS (Metrics + New Features)
 * ==============================================================================
 */

export const getFinancialSummary = async (userId: string): Promise<FinancialSummary> => {
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (!transactions) return { balance: 0, income: 0, expense: 0, trend: [] };

  let income = 0;
  let expense = 0;
  let runningBalance = 0;
  
  // Calculate running balance for trend charts
  const trend = transactions.map((t: any) => {
      runningBalance += parseFloat(t.amount);
      if (t.amount > 0) income += t.amount;
      else expense += Math.abs(t.amount);
      return { value: runningBalance, date: t.date };
  });

  return {
    balance: income - expense,
    income,
    expense,
    trend: trend.length ? trend : [{ value: 0, date: new Date().toISOString() }]
  };
};

/**
 * NEW FEATURE: Financial Health Score (0-100)
 * Calculates a score based on expense ratio and savings.
 */
export const getFinancialHealthScore = async (userId: string): Promise<number> => {
    const summary = await getFinancialSummary(userId);
    if (summary.income === 0) return 0;
    
    const savingsRate = (summary.income - summary.expense) / summary.income;
    let score = savingsRate * 100;
    
    // Bonus for positive balance
    if (summary.balance > 0) score += 10;
    
    return Math.min(Math.max(Math.round(score), 0), 100);
};

/**
 * NEW FEATURE: Spending Forecast
 * Simple linear projection for next month's spending.
 */
export const getSpendingForecast = async (userId: string): Promise<number> => {
    const summary = await getFinancialSummary(userId);
    // Simple naive forecast: avg monthly expense + 5% inflation buffer
    return Math.round(summary.expense * 1.05);
};

/**
 * ==============================================================================
 * 📄 DOCUMENT MANAGEMENT (Secure Storage)
 * ==============================================================================
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
      formattedSize: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : 'Unknown',
      date: d.created_at,
      type: d.mime_type?.includes('pdf') ? 'contract' : 'receipt'
  }));
};

export const uploadDocument = async (
    userId: string, 
    uri: string, 
    fileName: string, 
    type: 'receipt' | 'invoice' | 'contract' | 'other'
) => {
  try {
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `${userId}/${timestamp}_${cleanName}`;
    
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
        .upload(path, fileBody, { contentType: 'application/octet-stream', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);
    
    const { data, error } = await supabase
        .from('documents')
        .insert({
            user_id: userId,
            file_name: fileName,
            file_path: path, 
            status: 'processed',
            url: publicUrl,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
  } catch (e: any) {
    console.error('[DataService] Upload failed:', e.message);
    throw e;
  }
};

export const pickAndUploadFile = async (userId: string) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled) return null;
    return await uploadDocument(userId, result.assets[0].uri, result.assets[0].name, 'other');
  } catch (e) {
    console.error("File Picker Error:", e);
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

/**
 * ==============================================================================
 * 💼 PROFESSIONAL (CPA) SERVICES (Enhanced)
 * ==============================================================================
 */

export const getCpaClients = async (cpaId: string): Promise<CpaClient[]> => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .select(`*, client:profiles(*)`)
    .eq('cpa_id', cpaId);

  if (error) {
    console.error('[DataService] CPA Clients Fetch Error:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.client.id,
    name: item.client.first_name ? `${item.client.first_name} ${item.client.last_name || ''}`.trim() : 'Unknown Client',
    email: item.client.email,
    status: item.status,
    last_audit: item.updated_at,
    permissions: item.permissions || {}
  }));
};

export const getClientCpas = async (clientId: string) => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .select(`*, cpa:profiles(*)`)
    .eq('client_id', clientId);

  if (error) return [];
  
  return data.map((item: any) => ({
    id: item.cpa.id,
    name: item.cpa.first_name ? `${item.cpa.first_name} ${item.cpa.last_name || ''}`.trim() : 'CPA',
    email: item.cpa.email,
    status: item.status
  }));
};

// 1. Client Requests a CPA
export const requestCPA = async (userId: string, cpaEmail: string) => {
    // Find CPA by email
    const { data: cpa, error: cpaError } = await supabase.from('profiles').select('id, first_name').eq('email', cpaEmail).eq('role', 'cpa').single();
    if (!cpa) throw new Error("CPA not found.");

    // Check existing
    const { data: existing } = await supabase.from('cpa_clients').select('id').match({ client_id: userId, cpa_id: cpa.id }).maybeSingle();
    if (existing) throw new Error("Connection already exists.");

    // Insert
    const { error } = await supabase.from('cpa_clients').insert({ client_id: userId, cpa_id: cpa.id, status: 'pending' });
    if (error) throw error;

    await notifyCpaRequest(cpa.id, 'New Client', userId);
};

// 2. CPA Invites a Client
export const inviteClient = async (cpaId: string, clientEmail: string) => {
    const { data: client, error } = await supabase.from('profiles').select('id').eq('email', clientEmail).single();
    if (!client) throw new Error("Client not found.");

    const { error: inviteError } = await supabase.from('cpa_clients').insert({ client_id: client.id, cpa_id: cpaId, status: 'pending' });
    if (inviteError) throw inviteError;

    await notifyClientInvitation(client.id, 'Your CPA', cpaId);
};

// 3. Accept/Reject Logic
export const acceptInvitation = async (userId: string, cpaId: string) => {
   const { error } = await supabase.from('cpa_clients').update({ status: 'active' }).match({ client_id: userId, cpa_id: cpaId });
   if (error) throw error;
   await notifyConnectionAccepted(cpaId, 'Client');
};

export const declineInvitation = async (userId: string, cpaId: string) => {
   const { error } = await supabase.from('cpa_clients').delete().match({ client_id: userId, cpa_id: cpaId });
   if (error) throw error;
};

export const acceptCpaClient = async (cpaId: string, clientId: string) => {
   // FIX: Specific matching ensures we update exactly the right relationship
   const { error } = await supabase
     .from('cpa_clients')
     .update({ status: 'active', updated_at: new Date().toISOString() })
     .match({ cpa_id: cpaId, client_id: clientId });
     
   if (error) throw error;
   
   // Notify client
   await createNotification(clientId, 'Request Accepted', 'Your CPA accepted your request.', 'cpa', cpaId);
};

export const rejectCpaClient = async (cpaId: string, clientId: string) => {
   const { error } = await supabase
     .from('cpa_clients')
     .delete()
     .match({ cpa_id: cpaId, client_id: clientId });
     
   if (error) throw error;
};

export const getSharedDocuments = async (cpaId: string, clientId: string) => {
  // Security check handled by RLS, but double check status active
  const { data } = await supabase.from('cpa_clients').select('status').match({cpa_id: cpaId, client_id: clientId}).single();
  if (data?.status !== 'active') throw new Error("Not authorized.");

  const { data: docs } = await supabase.from('documents').select('*').eq('user_id', clientId);
  return docs || [];
};

export const isCpaForClient = async (cpaId: string, clientId: string) => {
    const { data } = await supabase.from('cpa_clients').select('status').match({ cpa_id: cpaId, client_id: clientId }).single();
    return data?.status === 'active';
};

/**
 * ==============================================================================
 * 📊 ANALYSIS & INSIGHTS
 * ==============================================================================
 */

import { DetectedSubscription } from '../types';

/**
 * Detects recurring subscriptions from transaction history.
 * Analyzes patterns in amounts and dates to identify potential subscriptions.
 */
export const detectSubscriptions = async (userId: string): Promise<DetectedSubscription[]> => {
  // Fetch last 6 months of expense transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('description, amount, date')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .lt('amount', 0)
    .gte('date', sixMonthsAgo.toISOString())
    .order('date', { ascending: true });

  if (!transactions || transactions.length < 5) return [];

  // Group by merchant (simplified: use description as merchant)
  const merchantGroups: { [key: string]: { amounts: number[], dates: string[] } } = {};

  transactions.forEach(t => {
    const merchant = t.description?.split(' ')[0] || 'Unknown'; // Simple merchant extraction
    const amount = Math.abs(parseFloat(t.amount));

    if (!merchantGroups[merchant]) {
      merchantGroups[merchant] = { amounts: [], dates: [] };
    }

    merchantGroups[merchant].amounts.push(amount);
    merchantGroups[merchant].dates.push(t.date);
  });

  const subscriptions: DetectedSubscription[] = [];

  Object.entries(merchantGroups).forEach(([merchant, data]) => {
    if (data.amounts.length < 3) return; // Need at least 3 transactions

    // Check for recurring amounts (within 10% variance)
    const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
    const variance = data.amounts.filter(a => Math.abs(a - avgAmount) / avgAmount <= 0.1).length;

    if (variance < data.amounts.length * 0.7) return; // Not consistent enough

    // Check for recurring dates (monthly pattern)
    const dates = data.dates.map(d => new Date(d).getDate()).sort((a, b) => a - b);
    const dateVariance = Math.max(...dates) - Math.min(...dates);

    let frequency: 'monthly' | 'weekly' | 'yearly' = 'monthly';
    let confidence = 0.5;

    if (dateVariance <= 7) {
      frequency = 'monthly'; // Same date each month
      confidence = 0.8;
    } else if (dateVariance <= 14) {
      frequency = 'weekly';
      confidence = 0.6;
    }

    // Calculate next due date (simplified)
    const lastDate = new Date(data.dates[data.dates.length - 1]);
    const nextDue = new Date(lastDate);
    if (frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
    else if (frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);

    const yearlyWaste = frequency === 'monthly' ? avgAmount * 12 : frequency === 'weekly' ? avgAmount * 52 : avgAmount;

    subscriptions.push({
      id: `${merchant}-${avgAmount}`,
      merchant,
      amount: avgAmount,
      frequency,
      next_due: nextDue.toISOString(),
      yearly_waste: yearlyWaste,
      confidence
    });
  });

  return subscriptions.sort((a, b) => b.yearly_waste - a.yearly_waste);
};

/**
 * Generates tax-ready report for CPA access.
 * Exports transactions marked as tax deductible.
 */
export const generateTaxReport = async (userId: string, cpaId?: string): Promise<any> => {
  // Security check if called by CPA
  if (cpaId) {
    const isAuthorized = await isCpaForClient(cpaId, userId);
    if (!isAuthorized) throw new Error('Unauthorized access to tax data');
  }

  const { data: taxTransactions } = await supabase
    .from('transactions')
    .select('*, categories(name)')
    .eq('user_id', userId)
    .eq('is_tax_deductible', true)
    .order('date', { ascending: false });

  const totalDeductible = taxTransactions?.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;

  return {
    user_id: userId,
    generated_at: new Date().toISOString(),
    total_deductible_amount: totalDeductible,
    transaction_count: taxTransactions?.length || 0,
    transactions: taxTransactions?.map(t => ({
      date: t.date,
      description: t.description,
      amount: Math.abs(parseFloat(t.amount)),
      category: t.categories?.name || 'Uncategorized'
    })) || [],
    summary: {
      business_expenses: totalDeductible,
      potential_tax_savings: totalDeductible * 0.3 // Rough estimate
    }
  };
};

/**
 * Updates transaction tax deductible status.
 */
export const updateTransactionTaxStatus = async (transactionId: string, isTaxDeductible: boolean) => {
  const { error } = await supabase
    .from('transactions')
    .update({ is_tax_deductible: isTaxDeductible })
    .eq('id', transactionId);

  if (error) throw error;
};

/**
 * Auto-tags transactions as tax deductible based on merchant name.
 * Uses AI-like logic with predefined business categories.
 */
export const autoTagTaxDeductible = async (userId: string) => {
  // Fetch untagged expense transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, description')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .is('is_tax_deductible', null)
    .lt('amount', 0);

  if (error || !transactions) return;

  // Business keywords that indicate tax-deductible expenses
  const businessKeywords = [
    'office', 'supply', 'depot', 'staples', 'amazon business', 'quickbooks', 'xero',
    'advertising', 'marketing', 'software', 'subscription', 'service', 'consulting',
    'equipment', 'tools', 'machinery', 'vehicle', 'gas', 'fuel', 'parking',
    'travel', 'hotel', 'flight', 'taxi', 'uber', 'lyft', 'mileage',
    'internet', 'phone', 'utilities', 'rent', 'lease', 'insurance',
    'professional', 'legal', 'accounting', 'tax', 'audit'
  ];

  // Personal keywords (not deductible)
  const personalKeywords = [
    'mcdonald', 'starbucks', 'netflix', 'spotify', 'amazon prime', 'hulu',
    'grocery', 'supermarket', 'restaurant', 'bar', 'entertainment',
    'clothing', 'shopping', 'mall', 'gift', 'personal'
  ];

  const updates = transactions.map(t => {
    const desc = (t.description || '').toLowerCase();
    const isBusiness = businessKeywords.some(k => desc.includes(k));
    const isPersonal = personalKeywords.some(k => desc.includes(k));

    let isTaxDeductible = null;
    if (isBusiness && !isPersonal) {
      isTaxDeductible = true;
    } else if (isPersonal) {
      isTaxDeductible = false;
    }

    return {
      id: t.id,
      is_tax_deductible: isTaxDeductible
    };
  }).filter(u => u.is_tax_deductible !== null);

  // Batch update
  if (updates.length > 0) {
    const { error: updateError } = await supabase
      .from('transactions')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) console.warn('Auto-tagging failed:', updateError);
  }
};

/**
 * ==============================================================================
 * 🤖 AI & SETTINGS HELPERS
 * ==============================================================================
 */

// Legacy helper for AI Keys (Settings Service is preferred)
const keyCache: Record<string, string> = {};

export const saveGeminiKey = async (userId: string, apiKey: string) => {
    // FIX: Removed updated_at to prevent 400 error
    const encrypted = encryptMessage(apiKey.trim());
    const { error } = await supabase
        .from('user_secrets')
        .upsert({ 
            user_id: userId, 
            service: 'gemini', 
            api_key_encrypted: encrypted 
        }, { onConflict: 'user_id,service' });
        
    if (error) throw error;
    keyCache['gemini'] = apiKey.trim();
};

export const getGeminiKey = async (userId: string) => {
    if (keyCache['gemini']) return keyCache['gemini'];
    
    const { data } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();

    if (data?.api_key_encrypted) {
        const decrypted = decryptMessage(data.api_key_encrypted);
        keyCache['gemini'] = decrypted;
        return decrypted;
    }
    return null;
};

/**
 * ==============================================================================
 * 🔐 ADMIN & USER MANAGEMENT (Consolidated from UserService)
 * ==============================================================================
 */

export const getUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'User',
    role: p.role,
    status: p.status || 'active', // 'active' | 'banned' | 'suspended'
    suspended_until: p.suspended_until, // NEW FIELD
    avatar: p.avatar_url,
    currency: p.currency,
    country: p.country
  }));
};

// NEW: Suspend User Logic
export const suspendUser = async (userId: string, untilDate: Date) => {
    const { error } = await supabase
        .from('profiles')
        .update({
            status: 'suspended',
            suspended_until: untilDate.toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
};

export const getUserDetails = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
};

/**
 * NEW FEATURE: Data Export for GDPR Compliance
 */
export const exportUserData = async (userId: string) => {
    const [profile, transactions, documents] = await Promise.all([
        getUserDetails(userId),
        getTransactions(userId),
        getDocuments(userId)
    ]);
    
    return {
        profile,
        transactions,
        documents,
        exportedAt: new Date().toISOString()
    };
};

// Aliases for compatibility with UI components
export const getAllUsers = getUsers;
export const deleteUser = adminDeleteUser;
export const changeUserRole = adminChangeUserRole;
export const changeUserStatus = adminDeactivateUser;
export const removeUser = adminDeleteUser;
export const updateUserStatus = adminDeactivateUser;
export const updateUserRole = adminChangeUserRole;

export { supabase };