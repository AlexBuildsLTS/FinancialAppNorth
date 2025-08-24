import { supabase } from '@/lib/supabase';
import { Conversation, Message } from '@/types';

// Type guards to check if an object has the expected properties
function hasDisplayName(obj: any): obj is { display_name: string } {
  return obj && typeof obj === 'object' && 'display_name' in obj;
}

function hasAvatarUrl(obj: any): obj is { avatar_url: string } {
  return obj && typeof obj === 'object' && 'avatar_url' in obj;
}

function hasCreatedAt(obj: any): obj is { created_at: string } {
  return obj && typeof obj === 'object' && 'created_at' in obj;
}

export const getConversations = async (userId: string): Promise<Conversation[]> => {
  // This is a complex query. It finds all conversations a user is a part of.
  // It then joins to get the other participant's profile and the last message.
  // This needs a proper database structure to work.
  // Assuming tables: `conversations`, `conversation_participants`, `messages`, `profiles`
  
  // First, get conversation IDs for the user
  const { data: conversationIdsData, error: conversationIdsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  if (conversationIdsError) {
    console.error('Error fetching conversation IDs:', conversationIdsError);
    throw conversationIdsError;
  }

  const conversationIds = conversationIdsData?.map(p => p.conversation_id) || [];

  if (conversationIds.length === 0) {
    return [];
  }

  // Then get the conversations with participants and last messages
  // We'll handle ordering and limiting messages separately to avoid deprecated methods
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      last_message: messages ( text, created_at ),
      participants: conversation_participants ( profile: profiles (id, display_name, avatar_url) )
    `)
    .in('id', conversationIds);

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
  
  // Process the data to match Conversation type
  return data.map(conv => {
    // Handle the nested data structure carefully
    const participants = Array.isArray(conv.participants) ? conv.participants : [];
    const lastMessages = Array.isArray(conv.last_message) ? conv.last_message : [];
    
    // Find the participant that is not the current user
    // This is a simplified approach - in a real app, you might need a more robust solution
    let displayName = 'Chat';
    let avatarUrl = '';
    
    if (participants.length > 0) {
      const firstParticipant = participants[0];
      if (Array.isArray(firstParticipant.profile) && firstParticipant.profile.length > 0) {
        const profile = firstParticipant.profile[0];
        if (hasDisplayName(profile)) {
          displayName = profile.display_name || 'Chat';
        }
        if (hasAvatarUrl(profile)) {
          avatarUrl = profile.avatar_url || '';
        }
      }
    }
    
    // Get the first last message if available (most recent)
    let lastMessageText = 'No messages yet.';
    let timestamp = '';
    
    // Sort messages by created_at to get the most recent one
    const sortedMessages = [...lastMessages].sort((a, b) => {
      if (hasCreatedAt(a) && hasCreatedAt(b)) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });
    
    if (sortedMessages.length > 0) {
      const lastMessage = sortedMessages[0];
      lastMessageText = lastMessage.text || 'No messages yet.';
      if (hasCreatedAt(lastMessage) && lastMessage.created_at) {
        timestamp = new Date(lastMessage.created_at).toLocaleTimeString();
      }
    }
    
    return {
      id: conv.id,
      name: displayName,
      avatar: avatarUrl,
      lastMessage: lastMessageText,
      timestamp: timestamp,
      unread: 0, // In a real app, this would be calculated based on unread messages
    };
  });
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select(`id, conversation_id, user_id, text, created_at, sender: profiles (display_name)`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  // Process the data to match Message type
  return data.map(msg => {
    // Handle the sender data structure carefully
    let senderDisplayName = '';
    
    if (Array.isArray(msg.sender) && msg.sender.length > 0) {
      const sender = msg.sender[0];
      if (hasDisplayName(sender)) {
        senderDisplayName = sender.display_name || '';
      }
    }
    
    return {
      id: msg.id,
      conversation_id: msg.conversation_id,
      user_id: msg.user_id,
      text: msg.text,
      created_at: msg.created_at,
      sender: { display_name: senderDisplayName }
    };
  });
};

export const sendMessage = async (conversationId: string, userId: string, text: string): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, user_id: userId, text }])
    .select(`id, conversation_id, user_id, text, created_at`)
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  
  // Check if data exists
  if (!data) {
    throw new Error('No data returned after sending message');
  }
  
  // Transform the data to match Message type
  return {
    id: data.id,
    conversation_id: data.conversation_id,
    user_id: data.user_id,
    text: data.text,
    created_at: data.created_at,
    sender: { display_name: '' } // Default value since we don't have sender info in insert response
  };
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);
  
  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};