create or replace function get_user_conversations()
returns table (
  conversation_id uuid,
  last_message_at timestamptz,
  last_message_preview text,
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  avatar_url text
)
language sql
security definer
as $$
  select
    c.id as conversation_id,
    c.last_message_at,
    c.last_message_preview,
    p.id as user_id,
    p.first_name,
    p.last_name,
    p.email,
    p.avatar_url
  from conversations c
  join conversation_participants cp on c.id = cp.conversation_id
  join profiles p on p.id = cp.user_id
  where c.id in (
    select conversation_id
    from conversation_participants
    where user_id = auth.uid()
  )
  and cp.user_id != auth.uid();
$$;
