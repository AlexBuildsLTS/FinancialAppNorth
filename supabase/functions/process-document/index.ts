/* --------------------------------------------------------------
   Supabase client & helpers for the NorthFinance project
   -------------------------------------------------------------- */

import { createClient, SupabaseClient as _SupabaseClient } from "npm:@supabase/supabase-js@2.56.0";

/* --------------------------------------------------------------
   1️⃣ Initialise two clients
   --------------------------------------------------------------
   • `supabase`   – for normal app usage (anon key)
   • `supabaseAdmin` – for privileged admin actions (service‑role key)
   -------------------------------------------------------------- */
export const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

export const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// --- ADDED: any-aliased clients for Deno TS tolerance ---
const _sb: any = supabase;
const _sbAdmin: any = supabaseAdmin;

/* --------------------------------------------------------------
   2️⃣ Type definitions – one interface per public table
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

export interface CpaClientAssignment {
  id: string;
  cpa_user_id: string;
  client_user_id: string;
  status: "pending" | "active" | "terminated";
  assigned_at: string;
}

export interface UserSecret {
  id: string;
  user_id: string;
  openai_key?: string;
  gemini_key?: string;
  claude_key?: string;
  created_at: string;
}

export interface Channel {
  id: number;
  created_by?: string;
  created_at: string;
}

export interface ChannelParticipant {
  channel_id: number;
  user_id: string;
}

export interface Message {
  id: number;
  channel_id: number;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

/* --------------------------------------------------------------
   3️⃣ Current‑user helper (role + id)
   -------------------------------------------------------------- */
export async function getCurrentUser(): Promise<
  { id: string; role: Role } | null
> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const {
    data: profile,
    error: profileErr,
  } = await supabase
    .from<Profile>("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    console.error("Failed to load profile:", profileErr);
    return null;
  }

  return { id: user.id, role: profile?.role as Role };
}

/* --------------------------------------------------------------
   4️⃣ Real‑time subscription helper
   -------------------------------------------------------------- */
export type RealtimeCallback<T> = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: T | null;
}) => void;

export function subscribe<T extends Record<string, any>>(
  table: string,
  cb: RealtimeCallback<T>
): () => void {
  const channel = supabase
    .channel(`realtime-${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        const { eventType, new: n, old: o } = payload as any;
        cb({ eventType, new: n as T | null, old: o as T | null });
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/* --------------------------------------------------------------
   5️⃣ CRUD helpers – one per table (extend as needed)
   -------------------------------------------------------------- */
/* NOTE: Using non-generic `.from('table')` and casting results as `any`
   avoids Deno/TS complaints about expected generic arguments in this
   Edge Function environment. Replace `any` with proper types later
   if you want stricter compile-time checks.
*/
export const api = {
  /* ---- Profiles ------------------------------------------------- */
  async getProfile(userId: string) {
    const { data, error } = await _sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as any;
  },

  async updateProfile(userId: string, changes: Record<string, any>) {
    const { data, error } = await _sb
      .from('profiles')
      .update(changes)
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as any;
  },

  /* ---- Accounts ------------------------------------------------- */
  async listAccounts(userId: string) {
    const { data, error } = await _sb
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async createAccount(account: Record<string, any>) {
    const { data, error } = await _sb
      .from('accounts')
      .insert([account])
      .single();
    if (error) throw error;
    return data as any;
  },

  async updateAccount(id: string, changes: Record<string, any>) {
    const { data, error } = await _sb
      .from('accounts')
      .update(changes)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  },

  async deleteAccount(id: string) {
    const { error } = await _sb
      .from('accounts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  /* ---- Categories ----------------------------------------------- */
  async listCategories(userId: string) {
    const { data, error } = await _sb
      .from('categories')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async createCategory(cat: Record<string, any>) {
    const { data, error } = await _sb.from('categories').insert([cat]).single();
    if (error) throw error;
    return data as any;
  },

  async updateCategory(id: string, changes: Record<string, any>) {
    const { data, error } = await _sb.from('categories').update(changes).eq('id', id).single();
    if (error) throw error;
    return data as any;
  },

  async deleteCategory(id: string) {
    const { error } = await _sb.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  /* ---- Documents ------------------------------------------------ */
  async listDocuments(userId: string) {
    const { data, error } = await _sb.from('documents').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async createDocument(doc: Record<string, any>) {
    const payload = { ...doc, status: 'processing' };
    const { data, error } = await _sb.from('documents').insert([payload]).single();
    if (error) throw error;
    return data as any;
  },

  async updateDocument(id: string, changes: Record<string, any>) {
    const { data, error } = await _sb.from('documents').update(changes).eq('id', id).single();
    if (error) throw error;
    return data as any;
  },

  async deleteDocument(id: string) {
    const { error } = await _sb.from('documents').delete().eq('id', id);
    if (error) throw error;
  },

  /* ---- Transactions --------------------------------------------- */
  async listTransactions(userId: string) {
    const { data, error } = await _sb.from('transactions').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async createTransaction(tx: Record<string, any>) {
    const { data, error } = await _sb.from('transactions').insert([tx]).single();
    if (error) throw error;
    return data as any;
  },

  async updateTransaction(id: string, changes: Record<string, any>) {
    const { data, error } = await _sb.from('transactions').update(changes).eq('id', id).single();
    if (error) throw error;
    return data as any;
  },

  async deleteTransaction(id: string) {
    const { error } = await _sb.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  /* ---- CPA‑Client Assignments ----------------------------------- */
  async listAssignmentsForCpa(cpaId: string) {
    const { data, error } = await _sb.from('cpa_client_assignments').select('*').eq('cpa_user_id', cpaId);
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async assignClient(cpaId: string, clientId: string) {
    const payload = { cpa_user_id: cpaId, client_user_id: clientId, status: 'pending' };
    const { data, error } = await _sb.from('cpa_client_assignments').insert([payload]).single();
    if (error) throw error;
    return data as any;
  },

  async updateAssignmentStatus(assignmentId: string, newStatus: 'pending' | 'active' | 'terminated') {
    const { data, error } = await _sb.from('cpa_client_assignments').update({ status: newStatus }).eq('id', assignmentId).single();
    if (error) throw error;
    return data as any;
  },

  /* ---- User Secrets (service‑role only) ------------------------ */
  async upsertUserSecret(secret: Record<string, any>) {
    const { data, error } = await _sbAdmin.from('user_secrets').upsert([secret], { onConflict: 'user_id' }).single();
    if (error) throw error;
    return data as any;
  },

  async getUserSecret(userId: string) {
    const { data, error } = await _sbAdmin.from('user_secrets').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data as any;
  },

  /* ---- Channels & Messaging ------------------------------------ */
  async createChannel(createdBy: string) {
    const { data, error } = await _sb.from('channels').insert({ created_by: createdBy }).single();
    if (error) throw error;
    return data as any;
  },

  async addParticipant(channelId: number, userId: string) {
    const { error } = await _sb.from('channel_participants').insert({ channel_id: channelId, user_id: userId });
    if (error) throw error;
  },

  async sendMessage(channelId: number, fromUserId: string, content: string) {
    const { data, error } = await _sb.from('messages').insert({ channel_id: channelId, user_id: fromUserId, content }).single();
    if (error) throw error;
    return data as any;
  },

  async listMessages(channelId: number) {
    const { data, error } = await _sb.from('messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as any[];
  },

  /* ---- Notifications (used by edge functions) ----------------- */
  async createNotification(userId: string, title: string, body: string) {
    const { error } = await _sb.from('notifications').insert({ user_id: userId, title, body, is_read: false });
    if (error) throw error;
  },

  async markNotificationRead(notificationId: number) {
    const { error } = await _sb.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw error;
  },
};

// --- Admin helpers (service role) ---

export async function adminEditUserRole(userId: string, newRole: Role): Promise<void> {
  const isAdmin = newRole === 'admin';
  const { error } = await _sbAdmin.from('profiles').update({ role: newRole, is_admin: isAdmin }).eq('id', userId);
  if (error) throw error;
}

export async function adminDeactivateUser(userId: string): Promise<void> {
  // Revoke tokens using any to avoid strict auth typing mismatch
  try {
    const adminAuth: any = _sbAdmin.auth?.admin;
    if (adminAuth?.revokeRefreshTokens) {
      const { error: revoke } = await adminAuth.revokeRefreshTokens(userId);
      if (revoke) throw revoke;
    }
  } catch (e) {
    // Not fatal; continue to set flags
    console.warn('revokeRefreshTokens returned error or unavailable in this runtime', e);
  }

  const { error } = await _sbAdmin.from('profiles').update({ is_admin: false }).eq('id', userId);
  if (error) throw error;
}

export async function adminDeleteUser(userId: string): Promise<void> {
  const adminAuth: any = _sbAdmin.auth?.admin;
  if (adminAuth?.deleteUser) {
    const { error } = await adminAuth.deleteUser(userId);
    if (error) throw error;
    return;
  }
  throw new Error('admin.deleteUser not available in this environment');
}

/* --------------------------------------------------------------
   Helper: create a private channel and add two participants
   -------------------------------------------------------------- */
async function createPrivateChannel(userA: string, userB: string) {
  const { data: channel, error: chErr } = await _sbAdmin.from('channels').insert({ created_by: userA }).single();
  if (chErr) throw chErr;
  const channelId = (channel as any)?.id;
  if (!channelId) throw new Error('Failed to create channel');

  const { error: pErr } = await _sbAdmin.from('channel_participants').insert([
    { channel_id: channelId, user_id: userA },
    { channel_id: channelId, user_id: userB },
  ]);
  if (pErr) throw pErr;

  return channel;
}

/* --------------------------------------------------------------
   Send a direct message (admin)
   -------------------------------------------------------------- */
export async function adminSendDirectMessage(fromUserId: string, toUserId: string, content: string): Promise<void> {
  // 1) find channels where the recipient participates
  const { data: parts, error: pErr } = await _sbAdmin.from('channel_participants').select('channel_id').eq('user_id', toUserId);
  if (pErr) throw pErr;
  const channelIds = (parts ?? []).map((r: any) => r.channel_id).filter(Boolean);

  let channelId: number | null = null;
  if (channelIds.length > 0) {
    // try to find a channel from that list
    const { data: chs, error: chError } = await _sbAdmin.from('channels').select('id').in('id', channelIds);
    if (chError) throw chError;
    channelId = (chs ?? [])[0]?.id ?? null;
  }

  if (!channelId) {
    // create a private channel and participants
    const newCh = await createPrivateChannel(fromUserId, toUserId);
    channelId = (newCh as any)?.id;
  }

  if (!channelId) throw new Error('Could not determine or create a channel for direct message');

  const { error: msgErr } = await _sbAdmin.from('messages').insert({
    channel_id: channelId,
    user_id: fromUserId,
    content,
  });
  if (msgErr) throw msgErr;
}