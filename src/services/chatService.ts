import { supabase } from '@/lib/supabase';

// Fetches all chat channels for the current user
export const fetchUserChannels = async () => {
  const { data, error } = await supabase
    .from('channels')
    .select(`
      id,
      created_at,
      participants:channel_participants(
        profiles(
          id,
          display_name,
          avatar_url
        )
      )
    `);

  if (error) {
    console.error('Error fetching user channels:', error);
    throw error;
  }
  return data;
};

// Fetches all messages for a specific channel
export const fetchChannelMessages = async (channelId: number) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      created_at,
      content,
      profile:profiles(
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  return data;
};

// Sends a new message to a channel
export const sendMessage = async (channelId: number, content: string, userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ channel_id: channelId, content, user_id: userId }]);

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  return data;
};