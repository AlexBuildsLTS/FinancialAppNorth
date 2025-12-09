-- Fix RLS policies for messaging tables to resolve infinite recursion

-- Drop all problematic policies that use inline subqueries
DROP POLICY IF EXISTS "robust_messages_select" ON public.messages;
DROP POLICY IF EXISTS "allow_insert_messages" ON public.messages;
DROP POLICY IF EXISTS "allow_select_messages" ON public.messages;
DROP POLICY IF EXISTS "robust_messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_member" ON public.messages;
DROP POLICY IF EXISTS "messages_select_member" ON public.messages;
DROP POLICY IF EXISTS "user_messages" ON public.messages;

DROP POLICY IF EXISTS "allow_insert_conversations" ON public.conversations;
DROP POLICY IF EXISTS "allow_select_conversations" ON public.conversations;
DROP POLICY IF EXISTS "robust_conversations_all" ON public.conversations;
DROP POLICY IF EXISTS "user_conversations" ON public.conversations;

DROP POLICY IF EXISTS "allow_insert_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "allow_select_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert_own" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select_member" ON public.conversation_participants;
DROP POLICY IF EXISTS "robust_participants_all" ON public.conversation_participants;
DROP POLICY IF EXISTS "user_participants" ON public.conversation_participants;

-- Enable RLS on messaging tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Safe policies using SECURITY DEFINER helper function to avoid recursion

-- Conversation Participants: Users can manage their own participation records
CREATE POLICY "conversation_participants_manage_own" ON public.conversation_participants
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Conversations: Users can access conversations they are members of
CREATE POLICY "conversations_member_access" ON public.conversations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

-- Messages: Users can access messages in conversations they are members of, and send messages
CREATE POLICY "messages_member_access" ON public.messages
  FOR ALL TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()))
  WITH CHECK (public.is_conversation_member(conversation_id, auth.uid()) AND sender_id = auth.uid());