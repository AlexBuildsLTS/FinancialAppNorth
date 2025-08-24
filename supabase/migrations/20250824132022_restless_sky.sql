/*
  # Support System Tables

  1. New Tables
    - `support_tickets` - Support ticket management
    - `support_messages` - Messages within support tickets
    - Update profiles to include client_mode_enabled

  2. Security
    - Enable RLS on all tables
    - Add policies for support access
*/

-- Add client_mode_enabled to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'client_mode_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN client_mode_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  attachments text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Support staff can view all tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Support', 'Administrator')
  );

CREATE POLICY "Support staff can update tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Support', 'Administrator')
  );

-- RLS Policies for support messages
CREATE POLICY "Users can view messages in own tickets"
  ON support_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_id AND st.user_id = auth.uid()
    ) OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Support', 'Administrator')
  );

CREATE POLICY "Users can send messages to own tickets"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      EXISTS (
        SELECT 1 FROM support_tickets st
        WHERE st.id = ticket_id AND st.user_id = auth.uid()
      ) OR
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Support', 'Administrator')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

-- Function to update ticket last_message
CREATE OR REPLACE FUNCTION update_ticket_last_message()
RETURNS trigger AS $$
BEGIN
  UPDATE support_tickets
  SET 
    last_message = NEW.message,
    updated_at = now()
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last message
DROP TRIGGER IF EXISTS update_ticket_last_message_trigger ON support_messages;
CREATE TRIGGER update_ticket_last_message_trigger
  AFTER INSERT ON support_messages
  FOR EACH ROW EXECUTE FUNCTION update_ticket_last_message();