/* --------------------------------------------------------------
   Supabase client & full‑stack helpers for NorthFinance
   -------------------------------------------------------------- */

    

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
  

// ------------------- Replaced: robust client initialization -------------------
// Resolve runtime config (supports app.config.js extra on web)
const EX = (Constants as any)?.expoConfig?.extra ?? {};
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  EX.SUPABASE_URL ||
  EX.EXPO_PUBLIC_SUPABASE_URL ||

  '';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  EX.SUPABASE_ANON_KEY ||
  EX.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';
const SUPABASE_FUNCTIONS_URL =
  process.env.SUPABASE_FUNCTIONS_URL ||
  process.env.EXPO_SUPABASE_FUNCTIONS_URL ||
  EX.SUPABASE_FUNCTIONS_URL ||

  '';
const FRONTEND_ADMIN_API_KEY = process.env.SUPABASE_ROLE_KEY || EX.ADMIN_API_KEY || '';

// Helper: produce a proxy client that throws a clear error when used
function makeMissingClient(name: string, message?: string) {
  const errMsg = message ?? `${name} not configured: missing SUPABASE_URL or key`;
  const handler: ProxyHandler<any> = {
    get() {
      return () => { throw new Error(errMsg); };
    },
    apply() {
      throw new Error(errMsg);
    },
  };
  return new Proxy({}, handler);
}

const hasAnon = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const hasService = Boolean(SUPABASE_URL && serviceRoleKey);

// small, non-fatal runtime warning so Metro doesn't abort on missing env during dev
if (!hasAnon) {
  console.warn('Supabase anon client not configured: SUPABASE_URL or SUPABASE_ANON_KEY missing. Certain features will throw when used.');
}
if (!hasService) {

}

// initialize clients (exported) — create only when keys exist, otherwise use safe proxy
export const supabase: any = hasAnon
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : makeMissingClient('supabase', 'Supabase anon client not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY to enable DB features.');

export const supabaseAdmin: any = hasService
  ? createClient(SUPABASE_URL, serviceRoleKey)
  : makeMissingClient('supabaseAdmin', 'Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY for admin operations.');

// --- ADDED: local any-typed aliases to avoid widespread generic typing issues in the frontend ---
const _sb: any = supabase;
const _sbAdmin: any = supabaseAdmin;

/* --------------------------------------------------------------
   2️⃣ Type definitions – mirrors the public schema
   -------------------------------------------------------------- */

export type Role = "member" | "premium" | "cpa" | "support" | "admin";

export interface Profile {
  id: string; // uuid = auth.users.id
  display_name?: string;
  avatar_url?: string;
  role: Role;
  is_admin: boolean;
  updated_at: string; // timestamptz
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  document_id?: string;
  description?: string;
  amount: number;
  type: "income" | "expense";
  transaction_date: string; // date
  status: "pending" | "cleared" | "cancelled";
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  mime_type?: string;
  file_size?: number;
  status: "processing" | "processed" | "error";
  processed_data?: Record<string, any>;
  created_at: string;
}

/** Messaging between users (chat & support) */
export interface Message {
  id: string;
  channel_id: string | null; // null = direct message
  user_id: string; // sender
  content: string;
  created_at: string;
}

/** Simple notification table */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

/** CPA‑client linking table */
export interface CpaClient {
  cpa_id: string; // user_id of CPA
  client_id: string; // user_id of client
}

/* --------------------------------------------------------------
   3️⃣ Helper – current user & role (cached per request)
   -------------------------------------------------------------- */
export async function getCurrentUser(): Promise<{
  id: string;
  role: Role;
} | null> {
  // use the any-aliased clients so the editor doesn't complain about generic signatures
  const { data: { user }, error } = await _sb.auth.getUser();
  if (error || !user) return null;

  const { data: profile, error: pErr } = await _sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (pErr) {
    console.error("Profile load error:", pErr);
    return null;
  }

  return { id: user.id, role: profile?.role as Role };
}

/* --------------------------------------------------------------
   4️⃣ Real‑time subscription utility
   -------------------------------------------------------------- */
export type RealtimePayload<T> = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: T | null;
};

export type RealtimeCallback<T> = (payload: RealtimePayload<T>) => void;

/**
 * Subscribe to *any* public table.
 * Returns an unsubscribe function.
 */
export function subscribe<T extends Record<string, any>>(
  table: string,
  cb: RealtimeCallback<T>
): () => void {
  const channel = _sb
    .channel(`realtime-${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload: any) => {
        const { eventType, new: n, old: o } = payload as any;
        cb({ eventType, new: n as T | null, old: o as T | null });
      }
    )
    .subscribe();

  return () => _sb.removeChannel(channel);
}

/* --------------------------------------------------------------
   5️⃣ CRUD helpers – one example per entity (extend as needed)
   -------------------------------------------------------------- */
export const api = {
  async getProfile(userId: string) {
    const { data, error } = await _sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as any;
  },

  // transactions
  async listTransactions(userId: string) {
    const { data, error } = await _sb
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  },

  async createTransaction(tx: any) {
    const { data, error } = await _sb
      .from('transactions')
      .insert([tx])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async updateTransaction(id: string, changes: any) {
    const { data, error } = await _sb
      .from('transactions')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  },

  async deleteTransaction(id: string) {
    const { error } = await _sb
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // accounts/categories/documents use _sb too (non-generic .from calls)
  async listAccounts(userId: string) {
    const { data, error } = await _sb.from('accounts').select('*').eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  },

  async listCategories(userId: string) {
    const { data, error } = await _sb.from('categories').select('*').eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  },

  async listDocuments(userId: string) {
    const { data, error } = await _sb.from('documents').select('*').eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  },

  // messaging (simple insert)
  async sendMessage(channelId: string | null, fromUserId: string, content: string) {
    const { error } = await _sb.from('messages').insert([{ channel_id: channelId, user_id: fromUserId, content }]);
    if (error) throw error;
  },

  // notifications
  async createNotification(userId: string, title: string, body: string) {
    const { error } = await _sb.from('notifications').insert([{ user_id: userId, title, body, is_read: false }]);
    if (error) throw error;
  },

  // cpa clients
  async linkClient(cpaId: string, clientId: string) {
    const { error } = await _sb.from('cpa_clients').insert([{ cpa_id: cpaId, client_id: clientId }]);
    if (error) throw error;
  },

  async listCpaClients(cpaId: string) {
    const { data, error } = await _sb.from('cpa_clients').select('*').eq('cpa_id', cpaId);
    if (error) throw error;
    return data ?? [];
  },
};

// admin helpers use _sbAdmin; call admin auth methods via any to avoid API mismatch
export async function adminBroadcast(title: string, body: string, targetRoles: Role[] = ['member','premium','cpa','support']) {
  const { data: users, error } = await _sbAdmin.from('profiles').select('id').in('role', targetRoles);
  if (error) throw error;
  const inserts = (users ?? []).map((u: any) => ({ user_id: u.id, title, body, is_read: false }));
  const { error: notifErr } = await _sbAdmin.from('notifications').insert(inserts);
  if (notifErr) throw notifErr;
}

// --- replace: frontend wrappers that call Edge Functions for privileged actions ---
// helper: get current user's access token (throws if not signed in)
async function getCurrentAccessToken(): Promise<string> {
  const { data, error } = await _sb.auth.getSession();
  if (error) throw error;
  const session = (data as any)?.session;
  if (!session?.access_token) throw new Error('Not authenticated');
  return session.access_token as string;
}

export async function adminChangeUserRole(userId: string, newRole: Role): Promise<void> {
  if (!SUPABASE_FUNCTIONS_URL) {
    throw new Error('SUPABASE_FUNCTIONS_URL not configured');
  }

  const token = await getCurrentAccessToken();
  const resp = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-change-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, newRole }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`admin-change-role failed: ${resp.status} ${txt}`);
  }
}

export async function adminDeactivateUser(userId: string): Promise<void> {
  if (!SUPABASE_FUNCTIONS_URL) {
    throw new Error('SUPABASE_FUNCTIONS_URL not configured');
  }

  const token = await getCurrentAccessToken();
  const resp = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-deactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`admin-deactivate failed: ${resp.status} ${txt}`);
  }
}

export async function adminDeleteUser(userId: string): Promise<void> {
  if (!SUPABASE_FUNCTIONS_URL) {
    throw new Error('SUPABASE_FUNCTIONS_URL not configured');
  }

  const token = await getCurrentAccessToken();
  const resp = await fetch(`${SUPABASE_FUNCTIONS_URL}/admin-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`admin-delete failed: ${resp.status} ${txt}`);
  }
}

/* --------------------------------------------------------------
   7️⃣ RPC wrappers (you already have a monthly‑income summary)
   -------------------------------------------------------------- */
export async function getMonthlyIncomeSummary(
  monthStart: string,
  monthEnd: string
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "get_monthly_income_summary",
    { month_start: monthStart, month_end: monthEnd }
  );
  if (error) throw error;
  // RPC returns a table; grab first row
  return (data as Array<{ total_income: number }>)[0]?.total_income ?? 0;
}

/* --------------------------------------------------------------
   8️⃣ Export a single namespace for easy imports
   -------------------------------------------------------------- */
export const db = {
  supabase,
  supabaseAdmin,
  getCurrentUser,
  subscribe,
  api,
  adminChangeUserRole,
  adminDeactivateUser,
  adminDeleteUser,
  adminBroadcast,
  getMonthlyIncomeSummary,
};