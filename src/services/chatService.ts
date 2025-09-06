import { supabase } from '@/lib/supabase';

/* Simple chat service for frontend use.
   - getConversations(userId?)
   - getMessages(conversationId)
   - uploadAttachment(file)
   - sendMessage(payload)
   Adjust bucket/table names to match your DB if needed.
*/

export interface ConversationMeta {
  id: string;
  participants?: string[];
  name?: string;
  avatar_url?: string | null;
  lastMessage?: string | null;
  timestamp?: string | null;
  unread?: number;
}

export async function getConversations(userId?: string): Promise<{ conversations: ConversationMeta[]; error?: unknown }> {
  try {
    if (userId) {
      const { data: parts, error: pErr } = await supabase
        .from('channel_participants')
        .select('channel_id')
        .eq('user_id', userId);
      if (pErr) return { conversations: [], error: pErr };
  const channelIds = (parts ?? []).map((r: { channel_id: string }) => r.channel_id);
      if (channelIds.length === 0) return { conversations: [] };
      const { data, error } = await supabase
        .from('channels')
        .select('id, created_by')
        .in('id', channelIds);
          if (error) return { conversations: [], error };
          return {
            conversations: (data ?? []).map((c: { id: string | number }) => ({
              id: String(c.id),
              participants: [],
              name: `Channel ${c.id}`,
              avatar_url: null,
              lastMessage: null,
              timestamp: null,
              unread: 0,
            })),
          };
    } else {
      const { data, error } = await supabase.from('channels').select('id, created_by');
      if (error) return { conversations: [], error };
      return { conversations: data ?? [] };
    }
  } catch (err) {
    console.error('chatService.getConversations error', err);
    return { conversations: [], error: err };
  }
}

export interface RawMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content?: string | null;
  attachments?: Array<{ path?: string; url?: string; name?: string; mimeType?: string }> | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export async function getMessages(conversationId: string): Promise<RawMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', conversationId)
      .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((d: RawMessage) => ({ ...d, attachments: d.attachments ?? [] }));
  } catch (err) {
    console.error('chatService.getMessages error', err);
    throw err;
  }
}

export async function uploadAttachment(file: { uri: string; name?: string; mimeType?: string }) {
  try {
    const bucket = 'documents';
    const filename = file.name ?? `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const remotePath = `${filename}`;

    const res = await fetch(file.uri);
    const blob = await res.blob();

    const { data, error } = await supabase.storage.from(bucket).upload(remotePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.mimeType ?? undefined,
    });
    if (error) throw error;

    // getPublicUrl returns { data: { publicUrl } } synchronously
  const publicRes = supabase.storage.from(bucket).getPublicUrl(remotePath);
  let url = (publicRes as any)?.data?.publicUrl ?? null;

    if (!url) {
      const { data: signed, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(remotePath, 60 * 60 * 24);
      if (signErr) {
        console.warn('signed url error', signErr);
      } else {
        url = signed?.signedUrl ?? null;
      }
    }

    return { path: data?.path ?? remotePath, url, name: filename, mimeType: file.mimeType };
  } catch (err) {
    console.error('chatService.uploadAttachment error', err);
    throw err;
  }
}

export async function sendMessage({
  conversationId,
  senderId,
  text,
  attachments = [],
  metadata = {},
}: {
  conversationId: string;
  senderId: string;
  text?: string;
  attachments?: Array<{ uri: string; name?: string; mimeType?: string; size?: number }>;
  metadata?: Record<string, any>;
}) {
  try {
  const uploaded: Array<{ path?: string; url?: string; name?: string; mimeType?: string }> = [];
    for (const att of attachments) {
      try {
        const u = await uploadAttachment(att);
        uploaded.push(u);
      } catch (err) {
        console.warn('attachment upload failed for', att.name, err);
      }
    }
    const payload: Record<string, unknown> = {
      channel_id: conversationId,
      user_id: senderId,
      content: text ?? null,
      attachments: uploaded.length ? uploaded : null,
      metadata: Object.keys(metadata).length ? metadata : null,
    };
    const { data, error } = await supabase.from('messages').insert(payload).select();
    if (error) throw error;
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error('chatService.sendMessage error', err);
    throw err;
  }
}