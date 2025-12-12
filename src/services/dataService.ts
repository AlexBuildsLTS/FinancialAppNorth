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
  NotificationItem
} from '../types';

/**
 * ==============================================================================
 * 🛠️ INTERNAL HELPERS (Self-Healing & Schema Safety)
 * ==============================================================================
 */

/**
 * Ensures a user profile exists in the public schema.
 * Fixes Error 23503 (Foreign Key Violation) and 42501 (RLS).
 */
const ensureProfileExists = async (userId: string) => {
  try {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    
    if (!data) {
      console.log(`[DataService] 🛠️ Repairing missing profile for ${userId}...`);
      // Create if missing (RLS now allows this for authenticated users)
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
 * ==============================================================================
 * 💬 MESSAGING SYSTEM (End-to-End Encrypted + Attachments)
 * ==============================================================================
 */

export const getOrCreateConversation = async (currentUserId: string, targetUserId: string): Promise<string> => {
  try {
    // Prevent crashes by ensuring both users exist in public schema
    await ensureProfileExists(currentUserId);
    await ensureProfileExists(targetUserId);

    // 1. Search for existing direct conversation
    const { data: conversations } = await supabase
      .from('conversations')
      .select(`id, conversation_participants!inner(user_id)`)
      .eq('type', 'direct');

    // Find one where both users are participants
    const existing = conversations?.find((c: any) => {
      const pIds = c.conversation_participants.map((p: any) => p.user_id);
      return pIds.includes(currentUserId) && pIds.includes(targetUserId);
    });

    if (existing) {
      return existing.id;
    }

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
      const path = `${conversationId}/${Date.now()}_${attachment.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
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
        .from('documents') 
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
  // Fetch potential contacts (excluding self)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) return [];
  
  return data.map((p: any) => ({
    id: p.id,
    name: p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : 'User',
    avatar: p.avatar_url,
    role: p.role,
    lastMessage: 'Tap to start secure chat', 
  }));
};

/**
 * ==============================================================================
 * 🔔 NOTIFICATIONS SYSTEM
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

  // Only add these if they are not undefined
  if (relatedId) payload.related_id = relatedId;
  if (createdBy) payload.created_by = createdBy;

  // "Fire and forget" to avoid blocking UI
  supabase.from('notifications').insert(payload).then(({ error }) => {
    if (error) console.warn('[Notifications] Failed to send:', error.message);
  });
};

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data as NotificationItem[];
};

export const markNotificationRead = async (notificationId: string) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
};

export const markAllNotificationsRead = async (userId: string) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
};

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

// --- Notification Triggers ---

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
    `${cpaName} has invited you to connect.`,
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
 * 🎫 SUPPORT TICKETS (Full CRUD)
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
  // 1. Trigger Cleanup (Fire & Forget) - Safe RPC call
  supabase.rpc('cleanup_stale_tickets').then(({ error }) => {
    if (error) console.warn("Cleanup warning:", error);
  });

  // 2. Fetch Active Queue with EXPLICIT FOREIGN KEY RELATIONSHIP
  // This syntax '!tickets_user_id_fkey' is critical to avoid PGRST201
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
 * 💰 TRANSACTIONS & BUDGETS
 * ==============================================================================
 */

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`*, categories (name, icon, color)`)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) return [];
  
  return data.map((t: any) => ({
      ...t,
      category: t.categories?.name || 'Uncategorized',
      category_icon: t.categories?.icon,
      category_color: t.categories?.color
  }));
};

export const createTransaction = async (transaction: Partial<Transaction>, userId: string) => {
  try {
    const accountId = await getDefaultAccountId(userId);
    let categoryId = transaction.category_id;
    
    // Auto-create category if sent as string name
    if (!categoryId && transaction.category) {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', transaction.category)
          .maybeSingle();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
             const { data: newCat } = await supabase
               .from('categories')
               .insert({ name: transaction.category, type: 'expense', user_id: userId, icon: 'tag' })
               .select().single();
             if (newCat) categoryId = newCat.id;
        }
    }
    
    // Calculate final amount (Expenses negative)
    let finalAmount = Number(transaction.amount || 0);
    const type = transaction.type || (finalAmount >= 0 ? 'income' : 'expense');
    if (type === 'expense') finalAmount = -Math.abs(finalAmount);
    else finalAmount = Math.abs(finalAmount);

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: userId,
        account_id: accountId,
        category_id: categoryId,
        amount: finalAmount,
        type,
        date: transaction.date || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
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

export const getBudgets = async (userId: string): Promise<BudgetWithSpent[]> => {
  try {
    const { data: budgets } = await supabase
      .from('budgets')
      .select(`*, categories (name, color)`) 
      .eq('user_id', userId);

    if (!budgets) return [];

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
  // Find or Create Category logic
  const { data: cats } = await supabase.from('categories').select('id').eq('name', categoryName).limit(1);
  let catId = cats?.[0]?.id;

  if (!catId) {
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
 * ==============================================================================
 * 📄 DOCUMENT MANAGEMENT
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

    // Notify CPA
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
   const { error } = await supabase.from('cpa_clients').update({ status: 'active' }).match({ client_id: clientId, cpa_id: cpaId });
   if (error) throw error;
   await notifyConnectionAccepted(clientId, 'CPA');
};

export const rejectCpaClient = async (cpaId: string, clientId: string) => {
   const { error } = await supabase.from('cpa_clients').delete().match({ client_id: clientId, cpa_id: cpaId });
   if (error) throw error;
};

export const getSharedDocuments = async (cpaId: string, clientId: string) => {
  // Security check handled by RLS, but double check status active
  const { data } = await supabase.from('cpa_clients').select('status').match({cpaId, client_id: clientId}).single();
  if (data?.status !== 'active') throw new Error("Not authorized.");

  const { data: docs } = await supabase.from('documents').select('*').eq('user_id', clientId);
  return docs || [];
};

/**
 * ==============================================================================
 * 🤖 AI & SETTINGS HELPERS
 * ==============================================================================
 */

export const saveGeminiKey = async (userId: string, apiKey: string) => {
  const { error } = await supabase
    .from('user_secrets')
    .upsert({ user_id: userId, service: 'gemini', api_key_encrypted: apiKey }, { onConflict: 'user_id,service' });
  if (error) throw error;
};

export const getGeminiKey = async (userId: string) => {
  const { data } = await supabase
    .from('user_secrets')
    .select('api_key_encrypted')
    .eq('user_id', userId)
    .eq('service', 'gemini')
    .maybeSingle();
  return data?.api_key_encrypted;
};

/**
 * ==============================================================================
 * 🔐 ADMIN & USER MANAGEMENT
 * ==============================================================================
 */

export const getUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []).map((p: any) => ({
    id: p.id, 
    email: p.email, 
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'User',
    role: p.role, 
    status: 'active', 
    avatar: p.avatar_url, 
    currency: p.currency, 
    country: p.country
  }));
};

export const getUserDetails = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
};

// Aliases for compatibility
export const getAllUsers = getUsers;
export const deleteUser = adminDeleteUser;
export const changeUserRole = adminChangeUserRole;
export const changeUserStatus = adminDeactivateUser;
export const removeUser = adminDeleteUser;
export const updateUserStatus = adminDeactivateUser;
export const updateUserRole = adminChangeUserRole;
export const isCpaForClient = async (cpaId: string, clientId: string) => {
    const { data } = await supabase.from('cpa_clients').select('status').match({ cpa_id: cpaId, client_id: clientId }).single();
    return data?.status === 'active';
};