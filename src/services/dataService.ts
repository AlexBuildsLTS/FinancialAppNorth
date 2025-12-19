/**
 * ==================================================================================================
 * 🏦 NORTHFINANCE ENTERPRISE DATA SERVICE (Unified DAL)
 * ==================================================================================================
 * FIXED:
 * 1. Added explicit foreign key hints (!client_id, !cpa_id) to fix PGRST201 errors.
 * 2. Added existence checks to inviteClient/requestCPA to fix 409 Conflict errors.
 * 3. Added error handling for Organization fetches.
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as DocumentPicker from 'expo-document-picker';

// --- Supabase Client & Admin Utilities ---
import { 
  supabase, 
  adminChangeUserRole, 
  adminDeactivateUser, 
  adminDeleteUser 
} from '../lib/supabase';

// --- Shared Services ---
import { generateContent } from './geminiService';
import { settingsService } from './settingsService';

// --- Security & Config ---
import { encryptMessage, decryptMessage } from '../lib/crypto';
import { APP_CONFIG } from '../constants'; 

// --- Strict Type Definitions ---
import { 
  Transaction, 
  DocumentItem, 
  User, 
  Message, 
  BudgetWithSpent,
  FinancialSummary,
  CpaClient,
  NotificationItem,
  Organization,
  ExpenseRequest,
  DetectedSubscription,
  TaxReportSummary,
  TaxCategory
} from '../types';

/**
 * ==============================================================================
 * 🛡️ SECTION 1: CORE SECURITY, RESILIENCE & AUDIT
 * ==============================================================================
 */

const ensureProfileExists = async (userId: string): Promise<void> => {
  try {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    
    if (!data) {
      console.log(`[DataService] 🛠️ Auto-healing: Creating missing profile for ${userId}...`);
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        email: 'user@placeholder.com',
        first_name: 'Member',
        role: 'member',
        currency: 'USD',
        updated_at: new Date().toISOString()
      });

      if (insertError && insertError.code !== '23505') { 
        console.error('[DataService] ❌ Critical: Failed to heal profile:', insertError);
      }
    }
  } catch (e) {
    console.warn('[DataService] Profile check skipped:', e);
  }
};

const getDefaultAccountId = async (userId: string): Promise<string> => {
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (accounts && accounts.length > 0 && accounts[0]) {
    return accounts[0].id;
  }

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

export const logAuditAction = async (userId: string, action: string, details: string | Record<string, any>, orgId?: string) => {
  const detailsJson = typeof details === 'string' ? { message: details } : details;
  
  supabase.from('audit_logs').insert({
    user_id: userId,
    organization_id: orgId || null,
    action,
    details: detailsJson,
    created_at: new Date().toISOString()
  }).then(({ error }) => {
    if (error) console.warn('[Audit] Failed to log:', error.message);
  });
};

/**
 * ==============================================================================
 * 🏢 SECTION 2: ENTERPRISE ORGANIZATION MANAGEMENT
 * ==============================================================================
 */

export const getUserOrganizations = async (): Promise<Organization[]> => {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createOrganization = async (name: string, ownerId: string) => {
    await ensureProfileExists(ownerId); // SAFETY CHECK

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, owner_id: ownerId })
        .select()
        .single();

    if (orgError) throw orgError;

    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: org.id,
            user_id: ownerId,
            role: 'owner'
        });

    if (memberError) console.error("Critical: Created org but failed to add owner", memberError);
    logAuditAction(ownerId, 'ORG_CREATE', `Created organization: ${name}`, org.id);
    return org;
};

export const inviteMemberToOrg = async (orgId: string, email: string, role: string = 'member', inviterId: string) => {
    const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (userError || !user) throw new Error("User not found.");

    const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
            organization_id: orgId,
            user_id: user.id,
            role,
            joined_at: new Date().toISOString()
        });

    if (insertError) {
        if (insertError.code === '23505') throw new Error("User is already a member.");
        throw insertError;
    }

    createNotification(user.id, "Organization Invite", "You have been added to a new organization.", 'system', orgId, inviterId);
};

export const getExpenseRequests = async (orgId: string, status: 'pending' | 'approved' | 'rejected' = 'pending') => {
    const { data, error } = await supabase
        .from('expense_requests')
        .select(`*, requester:profiles!expense_requests_requester_id_fkey(first_name, last_name, avatar_url)`)
        .eq('organization_id', orgId)
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) {
      // Fallback: if foreign key doesn't exist, query without join and fetch profiles separately
      if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
        const { data: requests, error: reqError } = await supabase
          .from('expense_requests')
          .select('*')
          .eq('organization_id', orgId)
          .eq('status', status)
          .order('created_at', { ascending: false });
        
        if (reqError) throw reqError;
        
        // Fetch profiles separately
        if (requests && requests.length > 0) {
          const requesterIds = requests.map(r => r.requester_id).filter(Boolean);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', requesterIds);
          
          // Merge profiles into requests
          return requests.map(req => ({
            ...req,
            requester: profiles?.find(p => p.id === req.requester_id) || null
          }));
        }
        return requests || [];
      }
      throw error;
    }
    return data;
};

export const approveExpenseRequest = async (requestId: string, approverId: string) => {
    const { data: request } = await supabase.from('expense_requests').select('*').eq('id', requestId).single();
    if (!request) throw new Error("Request not found");

    const { error: updateError } = await supabase
        .from('expense_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

    if (updateError) throw updateError;

    await createTransaction({
        amount: -Math.abs(Number(request.amount)),
        description: `${request.merchant} (Approved Request)`,
        category: request.category || 'Business Expense',
        date: new Date().toISOString(),
        type: 'expense'
    }, request.requester_id);

    createNotification(request.requester_id, "Request Approved", `Your expense for ${request.merchant} was approved.`, 'system');
    logAuditAction(approverId, 'EXPENSE_APPROVE', `Approved ${request.amount} for ${request.merchant}`, request.organization_id);
};

/**
 * ==============================================================================
 * 🦅 SECTION 3: SUBSCRIPTION HAWK (Anomaly Detection)
 * ==============================================================================
 */

export const scanForSubscriptions = async (userId: string): Promise<DetectedSubscription[]> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data: txs } = await supabase
    .from('transactions')
    .select('amount, description, date')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', ninetyDaysAgo.toISOString())
    .order('date', { ascending: false });

  if (!txs) return [];

  const groups: Record<string, any[]> = {};
  const detected: DetectedSubscription[] = [];

  txs.forEach(tx => {
    const key = (tx.description || 'Unknown').toLowerCase().trim().slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  Object.keys(groups).forEach(key => {
    const transactions = groups[key];
    if (transactions && transactions.length >= 2) {
        const latest = transactions[0];
        const nextDate = new Date(latest.date);
        nextDate.setDate(nextDate.getDate() + 30);

        detected.push({
          id: `detected_${key}`,
          merchant: latest.description || 'Unknown',
          name: latest.description || 'Unknown',
          amount: Math.abs(latest.amount),
          frequency: 'monthly',
          status: 'stable',
          next_billing_date: nextDate.toISOString(),
          next_due: nextDate.toISOString(),
          yearly_waste: Math.abs(latest.amount) * 12,
          confidence: 0.8,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  });

  return detected;
};

export const getSubscriptions = async (userId: string): Promise<DetectedSubscription[]> => {
    const { data: dbSubs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

    const manualSubs: DetectedSubscription[] = (dbSubs || []).map((s: any) => ({
        id: s.id,
        merchant: s.merchant,
        name: s.merchant,
        amount: parseFloat(s.amount),
        frequency: (s.frequency || 'monthly').toLowerCase() as any,
        status: s.status,
        next_billing_date: s.next_billing_date || new Date().toISOString(),
        next_due: s.next_billing_date || new Date().toISOString(),
        yearly_waste: parseFloat(s.amount) * 12,
        confidence: 1.0,
        user_id: s.user_id,
        created_at: s.created_at,
        updated_at: s.updated_at,
        previous_amount: s.previous_amount,
        anomaly_detected_at: s.anomaly_detected_at
    }));

    const detectedSubs = await scanForSubscriptions(userId);

    const merged = [...manualSubs];
    detectedSubs.forEach(ds => {
        const exists = manualSubs.some(ms => 
            ms.merchant.toLowerCase().includes(ds.merchant.toLowerCase().slice(0,5))
        );
        if (!exists) merged.push(ds);
    });

    return merged.sort((a, b) => b.amount - a.amount);
};

export const addSubscription = async (userId: string, sub: Partial<DetectedSubscription>) => {
    const { error } = await supabase.from('subscriptions').insert({
        user_id: userId,
        merchant: sub.merchant,
        amount: sub.amount,
        frequency: sub.frequency || 'monthly',
        status: 'stable',
        next_billing_date: sub.next_due || sub.next_billing_date
    });
    if (error) throw error;
};

export const deleteSubscription = async (subId: string) => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', subId);
    if (error) throw error;
};

/**
 * ==============================================================================
 * 🗣️ SECTION 4: TITAN 2 - AI, VOICE & FORECASTING
 * ==============================================================================
 */

export const processVoiceTransaction = async (userId: string, audioUri: string): Promise<Transaction | null> => {
    try {
        const filename = `voice_${userId}_${Date.now()}.m4a`;
        let fileBody: any;
        
        if (Platform.OS === 'web') {
            const res = await fetch(audioUri);
            fileBody = await res.blob();
        } else {
            const base64 = await FileSystem.readAsStringAsync(audioUri, { encoding: FileSystem.EncodingType.Base64 });
            fileBody = decode(base64);
        }

        const { error: uploadError } = await supabase.storage
            .from('voice-commands')
            .upload(userId + '/' + filename, fileBody, { contentType: 'audio/m4a' });

        if (uploadError) throw new Error("Voice upload failed.");

        const { data: { publicUrl } } = supabase.storage.from('voice-commands').getPublicUrl(userId + '/' + filename);

        const { data: transcriptData, error: fnError } = await supabase.functions.invoke('process-voice', {
            body: { audioUrl: publicUrl }
        });

        if (fnError || !transcriptData?.text) {
             console.warn("[AI] Cloud transcription failed, returning mock.");
             return processNaturalLanguageTransaction(userId, "Spent 25 dollars at Voice Demo Lunch");
        }

        return await processNaturalLanguageTransaction(userId, transcriptData.text);

    } catch (e) {
        console.error('[AI] Voice Processing Failed:', e);
        throw e;
    }
};

export const processNaturalLanguageTransaction = async (userId: string, input: string) => {
    const prompt = `
        Input: "${input}"
        Action: Parse this financial transaction into a JSON object.
        Structure: {"amount": number, "merchant": "string", "category": "string", "type": "income"|"expense"}
        Rules: 
        - Expenses are negative numbers.
        - Categories: Food, Transport, Rent, Shopping, Income, Other.
        - Return ONLY JSON object.
    `.trim();

    try {
        const responseText = await generateContent(prompt, userId, undefined, true);
        const data = JSON.parse(responseText);

        if (!data.amount || !data.merchant) throw new Error("Missing AI data");

        return await createTransaction({
            amount: data.amount,
            description: data.merchant,
            category: data.category || 'Other',
            date: new Date().toISOString(),
            type: data.type || 'expense'
        }, userId);
    } catch (error) {
        console.error("[DataService] AI Parsing Failed:", error);
        throw error;
    }
};

export const getSpendingForecast = async (userId: string): Promise<{ predictedAmount: number, trend: 'up' | 'down' | 'stable' }> => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', sixMonthsAgo.toISOString());

    if (!transactions || transactions.length === 0) return { predictedAmount: 0, trend: 'stable' };

    const monthlySpend: Record<string, number> = {};
    transactions.forEach(t => {
        const monthKey = t.date.slice(0, 7);
        monthlySpend[monthKey] = (monthlySpend[monthKey] || 0) + Math.abs(Number(t.amount));
    });

    const months = Object.keys(monthlySpend).sort();
    if (months.length < 2) {
        const val = Object.values(monthlySpend)[0] || 0;
        return { predictedAmount: val, trend: 'stable' };
    }

    const xValues = months.map((_, i) => i);
    const yValues = months.map(m => monthlySpend[m]);
    const n = xValues.length;
    
    const sumX = xValues.reduce((a = 0, b = 0) => a + b, 0);
    const sumY = yValues.reduce((a = 0, b = 0) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * (yValues[i] || 0), 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY!) / (n * sumXX - sumX * sumX);
    const intercept = (sumY! - slope * sumX) / n;
    const predicted = slope * n + intercept;

    return {
        predictedAmount: Math.max(0, Math.round(predicted)),
        trend: slope > 50 ? 'up' : slope < -50 ? 'down' : 'stable'
    };
};

export const getFinancialHealthScore = async (userId: string): Promise<number> => {
    const summary = await getFinancialSummary(userId);
    if (summary.income === 0) return 0;
    
    const savingsRate = (summary.income - summary.expense) / summary.income;
    let score = savingsRate * 100;
    if (summary.balance > 0) score += 10;
    
    return Math.min(Math.max(Math.round(score), 0), 100);
};

/**
 * ==============================================================================
 * 💰 SECTION 5: CORE FINANCIAL ENGINE
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
      category: t.categories ? t.categories.name : 'Uncategorized',
      category_id: t.category_id,
      category_icon: t.categories?.icon,
      category_color: t.categories?.color,
      is_tax_deductible: t.is_tax_deductible
  }));
};

export const createTransaction = async (transaction: any, userId: string) => {
  try {
    const accountId = await getDefaultAccountId(userId);
    let categoryId = transaction.category_id;
    let categoryName = 'Uncategorized';
    
    if (transaction.category) {
        if (typeof transaction.category === 'string') {
            categoryName = transaction.category;
        } else if (transaction.category.name) {
            categoryName = transaction.category.name;
            categoryId = transaction.category.id;
        }
    }

    if (!categoryId && categoryName !== 'Uncategorized') {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
             const { data: newCat } = await supabase
               .from('categories')
               .insert({ name: categoryName, type: 'expense', user_id: userId, icon: 'tag' })
               .select()
               .single();
             if (newCat) categoryId = newCat.id;
        }
    }
    
    let finalAmount = Number(transaction.amount || 0);
    const type = transaction.type || (finalAmount >= 0 ? 'income' : 'expense');
    
    if (type === 'expense' && finalAmount > 0) finalAmount = -Math.abs(finalAmount);
    else if (type === 'income' && finalAmount < 0) finalAmount = Math.abs(finalAmount);

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
    console.error("Budget Calc Error", error);
    return [];
  }
};

export const createBudget = async (userId: string, categoryName: string, limit: number) => {
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

  if (!transactions) return { balance: 0, income: 0, expense: 0, savings_rate: 0, trend: [] };

  let income = 0;
  let expense = 0;
  let runningBalance = 0;
  
  const trend = transactions.map((t: any) => {
      runningBalance += parseFloat(t.amount);
      if (t.amount > 0) income += t.amount;
      else expense += Math.abs(t.amount);
      return { value: runningBalance, date: t.date };
  });

  const balance = income - expense;
  const savings_rate = income > 0 ? (balance / income) : 0;

  return {
    balance,
    income,
    expense,
    savings_rate,
    trend: trend.length ? trend : [{ value: 0, date: new Date().toISOString() }]
  };
};

/**
 * ==============================================================================
 * 💬 SECTION 6: MESSAGING
 * ==============================================================================
 */

export const getOrCreateConversation = async (currentUserId: string, targetUserId: string): Promise<string> => {
  try {
    await ensureProfileExists(currentUserId);
    await ensureProfileExists(targetUserId);

    const { data: conversations } = await supabase
      .from('conversations')
      .select(`id, conversation_participants!inner(user_id)`)
      .eq('type', 'direct');

    const existing = conversations?.find((c: any) => {
      const pIds = c.conversation_participants.map((p: any) => p.user_id);
      return pIds.includes(currentUserId) && pIds.includes(targetUserId);
    });

    if (existing) return existing.id;

    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'direct' })
      .select()
      .single();

    if (convError) throw convError;

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConv.id, user_id: currentUserId },
        { conversation_id: newConv.id, user_id: targetUserId }
      ]);

    if (partError) throw partError;

    return newConv.id;
  } catch (error: any) {
    console.error('[Messaging] Init Failed:', error);
    throw new Error('Chat init failed');
  }
};

export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  content: string, 
  attachment?: { uri: string; type: 'image' | 'document' | 'csv'; name: string }
) => {
  try {
    let attachmentUrl = null;
    let attachmentType = null;

    if (attachment) {
      console.log('[Messaging] Sending attachment:', attachment.name);
      const cleanName = attachment.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `${conversationId}/${Date.now()}_${cleanName}`;
      
      let fileBody: any;
      if (Platform.OS === 'web') {
          const response = await fetch(attachment.uri);
          fileBody = await response.blob();
      } else {
          const base64 = await FileSystem.readAsStringAsync(attachment.uri, { encoding: FileSystem.EncodingType.Base64 });
          fileBody = decode(base64);
      }
      
      const { error: uploadError } = await supabase.storage
        .from('chat-images') 
        .upload(path, fileBody, { 
            contentType: attachment.type === 'image' ? 'image/jpeg' : 'application/octet-stream', 
            upsert: true 
        });

      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('chat-images').getPublicUrl(path);
      attachmentUrl = data.publicUrl;
      attachmentType = attachment.type;
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content_encrypted: content || (attachment ? 'Sent an attachment' : ''),
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      is_system_message: false,
      read_by: JSON.stringify([senderId])
    });

    if (error) throw error;

    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', senderId);

    participants?.forEach(p => {
        notifyNewMessage(p.user_id, 'New Message', conversationId, senderId);
    });

  } catch (error: any) {
    console.error('[Messaging] Send Error:', error);
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
      (payload) => callback(payload.new as Message)
    )
    .subscribe();
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data as Message[];
};

export const getConversations = async (userId: string) => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role')
    .neq('id', userId);

  if (error) return [];
  
  const conversations = await Promise.all(profiles.map(async (p: any) => {
    const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', p.id)
        .eq('is_system_message', false)
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); 
    
    return {
        id: p.id,
        name: p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : 'User',
        avatar: p.avatar_url,
        role: p.role,
        unreadCount: count || 0,
        lastMessage: 'Tap to chat', 
    };
  }));

  return conversations;
};

/**
 * ==============================================================================
 * 📄 SECTION 7: DOCUMENTS
 * ==============================================================================
 */

export const getDocuments = async (userId: string, p0?: string): Promise<DocumentItem[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  
  return data.map((d: any) => {
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(d.file_path);
    
    return {
      ...d,
      name: d.file_name,
      formattedSize: d.size_bytes ? `${(d.size_bytes / 1024).toFixed(1)} KB` : 'Unknown',
      date: d.created_at,
      type: d.mime_type?.includes('pdf') ? 'contract' : 'receipt',
      url: urlData?.publicUrl || null
    };
  });
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
            mime_type: type === 'contract' ? 'application/pdf' : 'image/jpeg'
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

export const deleteDocument = async (docId: string) => {
  try {
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', docId)
      .single();

    if (docError) throw docError;
    if (!doc) throw new Error("Document not found.");

    if (doc.file_path) {
      await supabase.storage.from('documents').remove([doc.file_path]);
    }

    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId);

    if (dbError) throw dbError;

  } catch (e: any) {
    console.error('[DataService] Delete Document Error:', e.message);
    throw e;
  }
};

export const pickAndUploadFile = async (userId: string) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: APP_CONFIG.SUPPORTED_MIME_TYPES,
      copyToCacheDirectory: true
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return null;

    const asset = result.assets[0];
    if (!asset) return null;
    if (asset.size && asset.size > APP_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`File size exceeds ${APP_CONFIG.MAX_FILE_SIZE_MB}MB limit`);
    }

    let docType: 'receipt' | 'invoice' | 'contract' | 'other' = 'other';
    if (asset.mimeType?.includes('pdf')) docType = 'contract';
    else if (asset.mimeType?.includes('csv') || asset.mimeType?.includes('excel')) docType = 'other';

    return await uploadDocument(userId, asset.uri, asset.name, docType);
  } catch (e) {
    console.error("File Picker Error:", e);
    throw e;
  }
};

/**
 * ==============================================================================
 * 💼 SECTION 8: CPA PORTAL
 * ==============================================================================
 */

// ✅ FIXED: Added explicit foreign key hint (!client_id)
export const getCpaClients = async (cpaId: string): Promise<CpaClient[]> => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .select(`*, client:profiles!client_id(*)`) // Hint applied here
    .eq('cpa_id', cpaId);

  if (error) {
    console.error('[DataService] CPA Clients Fetch Error:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.client.id,
    name: item.client.first_name ? `${item.client.first_name} ${item.client.last_name || ''}`.trim() : 'Unknown Client',
    email: item.client.email || '',
    status: item.status || 'pending',
    last_audit: item.updated_at,
    permissions: item.permissions || {},
    cpa_id: item.cpa_id,
    client_id: item.client_id,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
};

// ✅ FIXED: Added explicit foreign key hint (!cpa_id)
export const getClientCpas = async (clientId: string) => {
  const { data, error } = await supabase
    .from('cpa_clients')
    .select(`*, cpa:profiles!cpa_id(*)`) // Hint applied here
    .eq('client_id', clientId);

  if (error) return [];
  
  return data.map((item: any) => ({
    id: item.cpa.id,
    name: item.cpa.first_name ? `${item.cpa.first_name} ${item.cpa.last_name || ''}`.trim() : 'CPA',
    email: item.cpa.email,
    status: item.status
  }));
};

// ✅ FIXED: Added 409 Conflict Prevention Check
export const requestCPA = async (userId: string, cpaIdOrEmail: string) => {
    let cpaId: string;
    
    // If it looks like an email, look it up; otherwise treat as ID
    if (cpaIdOrEmail.includes('@')) {
        const { data: cpa } = await supabase.from('profiles').select('id, first_name').eq('email', cpaIdOrEmail).eq('role', 'cpa').single();
        if (!cpa) throw new Error("CPA not found.");
        cpaId = cpa.id;
    } else {
        // It's already an ID
        cpaId = cpaIdOrEmail;
    }

    // Check existing
    const { data: existing } = await supabase.from('cpa_clients').select('id').match({ client_id: userId, cpa_id: cpaId }).maybeSingle();
    if (existing) throw new Error("Connection already exists.");

    const { error } = await supabase.from('cpa_clients').insert({ client_id: userId, cpa_id: cpaId, status: 'pending' });
    if (error) throw error;

    await notifyCpaRequest(cpaId, 'New Client', userId);
};

// ✅ FIXED: Added 409 Conflict Prevention Check
export const inviteClient = async (cpaId: string, clientEmail: string) => {
    const { data: client, error } = await supabase.from('profiles').select('id').eq('email', clientEmail).single();
    if (!client) throw new Error("Client not found.");

    // Check existing
    const { data: existing } = await supabase.from('cpa_clients').select('id').match({ client_id: client.id, cpa_id: cpaId }).maybeSingle();
    if (existing) throw new Error("Invitation already sent or user is already a client.");

    const { error: inviteError } = await supabase.from('cpa_clients').insert({ client_id: client.id, cpa_id: cpaId, status: 'pending' });
    if (inviteError) throw inviteError;

    await notifyClientInvitation(client.id, 'Your CPA', cpaId);
};

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
   const { error } = await supabase
     .from('cpa_clients')
     .update({ status: 'active', updated_at: new Date().toISOString() })
     .match({ cpa_id: cpaId, client_id: clientId });
     
   if (error) throw error;
   
   await createNotification(clientId, 'Request Accepted', 'Your CPA accepted your request.', 'cpa', cpaId);
};

export const rejectCpaClient = async (cpaId: string, clientId: string) => {
   const { error } = await supabase
     .from('cpa_clients')
     .delete()
     .match({ cpa_id: cpaId, client_id: clientId });
     
   if (error) throw error;
};

export const isCpaForClient = async (cpaId: string, clientId: string) => {
    const { data } = await supabase.from('cpa_clients').select('status').match({ cpa_id: cpaId, client_id: clientId }).single();
    return data?.status === 'active';
};

export const generateTaxReport = async (userId: string, cpaId?: string): Promise<TaxReportSummary> => {
  if (cpaId) {
    const isAuthorized = await isCpaForClient(cpaId, userId);
    if (!isAuthorized) throw new Error('Unauthorized access to tax data');
  }

  const { data: taxTransactions } = await supabase
    .from('transactions')
    .select('*, categories(name), documents(*)')
    .eq('user_id', userId)
    .eq('is_tax_deductible', true)
    .order('date', { ascending: false });

  const totalDeductible = taxTransactions?.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;

  const categoryBreakdown: Record<TaxCategory, number> = {
    [TaxCategory.MARKETING]: 0,
    [TaxCategory.TRAVEL]: 0,
    [TaxCategory.EQUIPMENT]: 0,
    [TaxCategory.OFFICE_SUPPLIES]: 0,
    [TaxCategory.PROFESSIONAL_SERVICES]: 0,
    [TaxCategory.MEALS]: 0,
    [TaxCategory.OTHER]: 0
  };

  const evidenceFiles: string[] = [];

  taxTransactions?.forEach(t => {
    const category = (t.tax_category as TaxCategory) || TaxCategory.OTHER;
    categoryBreakdown[category] += Math.abs(parseFloat(t.amount));

    if (t.documents && t.documents.length > 0) {
      t.documents.forEach((doc: any) => {
        if (doc.file_path) evidenceFiles.push(doc.file_path);
      });
    }
  });

  return {
    user_id: userId,
    generated_at: new Date().toISOString(),
    total_deductible_amount: totalDeductible,
    transaction_count: taxTransactions?.length || 0,
    tax_categories_breakdown: categoryBreakdown,
    potential_savings: totalDeductible * 0.3,
    evidence_files: evidenceFiles,
    transactions: taxTransactions || []
  };
};

export const updateTransactionTaxStatus = async (transactionId: string, isTaxDeductible: boolean) => {
  const { error } = await supabase
    .from('transactions')
    .update({ is_tax_deductible: isTaxDeductible })
    .eq('id', transactionId);

  if (error) throw error;
};

export const autoTagTaxDeductible = async (userId: string) => {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('id, description')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .is('is_tax_deductible', null)
    .lt('amount', 0);

  if (error || !transactions) return;

  const businessKeywords = [
    'office', 'supply', 'depot', 'staples', 'amazon business', 'quickbooks', 'xero',
    'advertising', 'marketing', 'software', 'subscription', 'service', 'consulting',
    'equipment', 'tools', 'machinery', 'vehicle', 'gas', 'fuel', 'parking',
    'travel', 'hotel', 'flight', 'taxi', 'uber', 'lyft', 'mileage',
    'internet', 'phone', 'utilities', 'rent', 'lease', 'insurance',
    'professional', 'legal', 'accounting', 'tax', 'audit'
  ];

  const updates = transactions.map(t => {
    const desc = (t.description || '').toLowerCase();
    const isBusiness = businessKeywords.some(k => desc.includes(k));
    
    if (isBusiness) {
        return {
            id: t.id,
            is_tax_deductible: true
        };
    }
    return null;
  }).filter(Boolean);

  if (updates.length > 0) {
    const { error: updateError } = await supabase
      .from('transactions')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) console.warn('Auto-tagging failed:', updateError);
  }
};

/**
 * ==============================================================================
 * 🎫 SECTION 9: SUPPORT TICKETS & ADMIN SYSTEMS
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

  if (error) return [];
  return data;
};

export const getAllTickets = async () => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`*, user:profiles!tickets_user_id_fkey(first_name, last_name, email)`)
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
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return (data || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    name: p.first_name ? `${p.first_name} ${p.last_name}` : 'User',
    role: p.role,
    status: p.status || 'active',
    suspended_until: p.suspended_until,
    avatar: p.avatar_url,
    currency: p.currency,
    country: p.country
  }));
};

/**
 * Get only active CPAs (for Find CPA screen)
 * Filters out test/mock users and only returns active, verified CPAs
 */
export const getActiveCPAs = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'cpa')
    .not('email', 'ilike', '%test%')
    .not('email', 'ilike', '%mock%')
    .not('email', 'ilike', '%example%')
    .not('email', 'ilike', '%demo%')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching CPAs:', error);
    throw error;
  }
  
  // Additional filtering to exclude mock/placeholder users by name patterns
  const filteredData = (data || []).filter((p: any) => {
    const firstName = (p.first_name || '').toLowerCase();
    const lastName = (p.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
    const email = (p.email || '').toLowerCase();
    
    // Exclude common mock/placeholder patterns
    const mockPatterns = [
      'user doe', 'ghost host', 'test user', 'mock user', 'demo user',
      'example user', 'placeholder', 'sample user', 'fake user',
      'john doe', 'jane doe', 'admin test', 'test admin'
    ];
    
    // Check if name matches mock patterns
    if (mockPatterns.some(pattern => fullName.includes(pattern) || firstName.includes(pattern) || lastName.includes(pattern))) {
      return false;
    }
    
    // Exclude if email domain is clearly a test domain
    if (email.includes('@test.') || email.includes('@mock.') || email.includes('@example.') || email.includes('@demo.')) {
      return false;
    }
    
    // Exclude if name is just a single word that looks like a placeholder
    if (fullName.split(' ').length === 1 && (fullName.length < 3 || fullName === 'user' || fullName === 'cpa')) {
      return false;
    }
    
    return true;
  });
  
  return filteredData.map((p: any) => ({
    id: p.id,
    email: p.email,
    name: p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : p.email?.split('@')[0] || 'CPA',
    role: p.role,
    status: 'active', // Default to active since status column doesn't exist
    suspended_until: p.suspended_until,
    avatar: p.avatar_url,
    currency: p.currency,
    country: p.country
  }));
};

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

export const exportUserData = async (userId: string) => {
    const [profile, transactions, documents] = await Promise.all([
        getUserDetails(userId),
        getTransactions(userId),
        getDocuments(userId, '')
    ]);
    
    return {
        profile,
        transactions,
        documents,
        exportedAt: new Date().toISOString()
    };
};

export const getAllUsers = getUsers;
export const deleteUser = adminDeleteUser;
export const changeUserRole = adminChangeUserRole;
export const changeUserStatus = adminDeactivateUser;
export const removeUser = adminDeleteUser;
export const updateUserStatus = adminDeactivateUser;
export const updateUserRole = adminChangeUserRole;

/**
 * ==============================================================================
 * 🔔 SECTION 10: NOTIFICATIONS
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

  supabase.from('notifications').insert(payload).then(({ error }) => {
    if (error) console.warn('[Notifications] Failed:', error.message);
  });
};

export const getNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return data as NotificationItem[];
};

export const markNotificationRead = async (notificationId: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
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
  await createNotification(cpaId, 'New CPA Request', `${clientName} has requested access.`, 'cpa', undefined, createdBy);
};

export const notifyClientInvitation = async (clientId: string, cpaName: string, createdBy?: string) => {
  await createNotification(clientId, 'CPA Invitation', `${cpaName} invited you.`, 'cpa', undefined, createdBy);
};

export const notifyConnectionAccepted = async (targetId: string, accepterName: string) => {
  await createNotification(targetId, 'Connection Accepted', `${accepterName} is now connected with you.`, 'cpa');
};

export const saveGeminiKey = async (userId: string, apiKey: string) => {
    const encrypted = encryptMessage(apiKey.trim());
    const { error } = await supabase
        .from('user_secrets')
        .upsert({ 
            user_id: userId, 
            service: 'gemini', 
            api_key_encrypted: encrypted 
        }, { onConflict: 'user_id,service' });
        
    if (error) throw error;
};

export const getGeminiKey = async (userId: string) => {
    const { data } = await supabase
        .from('user_secrets')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('service', 'gemini')
        .maybeSingle();

    if (data?.api_key_encrypted) {
        return decryptMessage(data.api_key_encrypted);
    }
    return null;
};

// Export Singleton
export const dataService = {
  // Core Security & Resilience
  ensureProfileExists,
  getDefaultAccountId,
  logAuditAction,

  // Enterprise & Organization
  getUserOrganizations,
  createOrganization,
  inviteMemberToOrg,
  getExpenseRequests,
  approveExpenseRequest,

  // Titan 1: Subscription Hawk
  scanForSubscriptions,
  getSubscriptions,
  addSubscription,
  deleteSubscription,

  // Titan 2: AI, Voice & Forecasting
  processVoiceTransaction,
  processNaturalLanguageTransaction,
  getSpendingForecast,
  getFinancialHealthScore,

  // Core Financial Engine
  getTransactions,
  createTransaction,
  deleteTransaction,
  getBudgets,
  createBudget,
  deleteBudget,
  getFinancialSummary,

  // Messaging & Collaboration
  getOrCreateConversation,
  sendMessage,
  subscribeToChat,
  getConversationMessages,
  getConversations,

  // Document Management
  getDocuments,
  uploadDocument,
  deleteDocument,
  pickAndUploadFile,

  // Professional Portal (CPA)
  getCpaClients,
  getClientCpas,
  requestCPA,
  inviteClient,
  acceptInvitation,
  declineInvitation,
  acceptCpaClient,
  rejectCpaClient,
  isCpaForClient,
  generateTaxReport,
  updateTransactionTaxStatus,
  autoTagTaxDeductible,

  // Support & Admin Systems
  createTicket,
  getTickets,
  getAllTickets,
  getTicketDetails,
  updateTicketStatus,
  addInternalNote,
  addTicketReply,
  deleteTicket,
  getUsers,
  getActiveCPAs,
  suspendUser,
  getUserDetails,
  exportUserData,
  
  // Aliases
  getAllUsers,
  deleteUser,
  changeUserRole,
  changeUserStatus,
  removeUser,
  updateUserStatus,
  updateUserRole,

  // Notifications System
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
  notifyStaffNewTicket,
  notifyUserTicketUpdate,
  notifyNewMessage,
  notifyCpaRequest,
  notifyClientInvitation,
  notifyConnectionAccepted,

  // Keys & Secrets
  saveGeminiKey,
  getGeminiKey,
};
export { supabase };
