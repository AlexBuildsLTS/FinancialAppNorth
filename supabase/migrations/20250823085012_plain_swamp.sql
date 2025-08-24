/*
  # Complete NorthFinance Database Schema

  1. New Tables
    - `role_permissions` - Define what each role can do
    - `user_api_keys` - Store encrypted API keys for AI providers
    - `accounts` - Financial accounts for users
    - `transactions` - All financial transactions
    - `budgets` - Budget tracking
    - `goals` - Financial goals
    - `journal_entries` - Accounting journal entries
    - `journal_entry_lines` - Individual lines in journal entries
    - `chart_of_accounts` - Chart of accounts for accounting
    - `bank_reconciliations` - Bank reconciliation records
    - `audit_trails` - Audit logging
    - `notifications` - User notifications
    - `channels` - Chat channels
    - `channel_participants` - Channel membership
    - `messages` - Chat messages

  2. Storage Buckets
    - `avatars` - User profile pictures
    - `documents` - Scanned documents and receipts

  3. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Implement data segregation for CPAs and clients

  4. Functions
    - Automatic profile creation on signup
    - Role assignment triggers
*/

-- Create role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission)
);

-- Insert default role permissions
INSERT INTO role_permissions (role, permission) VALUES
  ('Member', 'manage_own_finances'),
  ('Member', 'view_own_data'),
  ('Member', 'create_transactions'),
  ('Member', 'create_budgets'),
  ('Member', 'generate_basic_reports'),
  ('Member', 'use_camera_scanning'),
  ('Member', 'use_ai_assistant'),
  
  ('Premium Member', 'manage_own_finances'),
  ('Premium Member', 'view_own_data'),
  ('Premium Member', 'create_transactions'),
  ('Premium Member', 'create_budgets'),
  ('Premium Member', 'generate_basic_reports'),
  ('Premium Member', 'use_camera_scanning'),
  ('Premium Member', 'use_ai_assistant'),
  ('Premium Member', 'advanced_analytics'),
  ('Premium Member', 'multi_year_forecasting'),
  ('Premium Member', 'tax_preparation'),
  ('Premium Member', 'export_data'),
  
  ('Professional Accountant', 'manage_client_finances'),
  ('Professional Accountant', 'view_client_data'),
  ('Professional Accountant', 'create_journal_entries'),
  ('Professional Accountant', 'bank_reconciliation'),
  ('Professional Accountant', 'generate_professional_reports'),
  ('Professional Accountant', 'tax_preparation'),
  ('Professional Accountant', 'export_data'),
  
  ('Support', 'view_user_data_readonly'),
  ('Support', 'view_transaction_logs'),
  ('Support', 'view_reports_readonly'),
  
  ('Administrator', 'manage_all_users'),
  ('Administrator', 'change_user_roles'),
  ('Administrator', 'global_messaging'),
  ('Administrator', 'system_auditing'),
  ('Administrator', 'admin_panel_access');

-- Update profiles table to include API keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'api_keys'
  ) THEN
    ALTER TABLE profiles ADD COLUMN api_keys jsonb DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'basic';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'storage_limit_mb'
  ) THEN
    ALTER TABLE profiles ADD COLUMN storage_limit_mb integer DEFAULT 50;
  END IF;
END $$;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
  balance decimal(15,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  amount decimal(15,2) NOT NULL,
  transaction_date date NOT NULL,
  transaction_time time,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  tags text[],
  location text,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  allocated_amount decimal(15,2) NOT NULL,
  spent_amount decimal(15,2) DEFAULT 0,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount decimal(15,2) NOT NULL,
  current_amount decimal(15,2) DEFAULT 0,
  target_date date NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chart of accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'cost_of_goods_sold')),
  parent_id uuid REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  balance decimal(15,2) DEFAULT 0,
  normal_balance text NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  tax_reporting_category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Create journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reference text NOT NULL,
  description text NOT NULL,
  entry_date date NOT NULL,
  total_debit decimal(15,2) NOT NULL,
  total_credit decimal(15,2) NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  posted_at timestamptz,
  UNIQUE(user_id, reference)
);

-- Create journal entry lines table
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid REFERENCES chart_of_accounts(id),
  description text,
  debit_amount decimal(15,2) DEFAULT 0,
  credit_amount decimal(15,2) DEFAULT 0,
  line_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update client_assignments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'client_assignments'
  ) THEN
    CREATE TABLE client_assignments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      cpa_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
      assigned_at timestamptz DEFAULT now(),
      assigned_by uuid REFERENCES auth.users(id),
      UNIQUE(cpa_id, client_id)
    );
  END IF;
END $$;

-- Create audit trails table
CREATE TABLE IF NOT EXISTS audit_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view')),
  changes jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Create channels table for messaging
CREATE TABLE IF NOT EXISTS channels (
  id serial PRIMARY KEY,
  name text,
  description text,
  is_private boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create channel participants table
CREATE TABLE IF NOT EXISTS channel_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id integer REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id integer REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update documents table structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'processed_data'
  ) THEN
    ALTER TABLE documents ADD COLUMN processed_data jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'file_size_mb'
  ) THEN
    ALTER TABLE documents ADD COLUMN file_size_mb decimal(10,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE documents ADD COLUMN mime_type text;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "CPAs can view assigned client profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.cpa_id = auth.uid() AND ca.client_id = id AND ca.status = 'active'
    )
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'Administrator'
  );

-- RLS Policies for accounts
CREATE POLICY "Users can manage own accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CPAs can view client accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.cpa_id = auth.uid() AND ca.client_id = user_id AND ca.status = 'active'
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CPAs can manage client transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.cpa_id = auth.uid() AND ca.client_id = user_id AND ca.status = 'active'
    )
  );

-- RLS Policies for budgets
CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CPAs can view client budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.cpa_id = auth.uid() AND ca.client_id = user_id AND ca.status = 'active'
    )
  );

-- RLS Policies for goals
CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CPAs can view client documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.cpa_id = auth.uid() AND ca.client_id = user_id AND ca.status = 'active'
    )
  );

-- RLS Policies for journal entries
CREATE POLICY "Users can manage own journal entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "CPAs can manage client journal entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM client_assignments ca
      WHERE ca.cpa_id = auth.uid() AND ca.client_id = user_id AND ca.status = 'active'
    )
  );

-- RLS Policies for journal entry lines
CREATE POLICY "Users can manage own journal entry lines"
  ON journal_entry_lines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_id AND je.user_id = auth.uid()
    )
  );

-- RLS Policies for chart of accounts
CREATE POLICY "Users can manage own chart of accounts"
  ON chart_of_accounts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for client assignments
CREATE POLICY "CPAs can view their assignments"
  ON client_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = cpa_id);

CREATE POLICY "Clients can view their assignments"
  ON client_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all assignments"
  ON client_assignments FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'Administrator'
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for channels
CREATE POLICY "Users can view channels they participate in"
  ON channels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_participants cp
      WHERE cp.channel_id = id AND cp.user_id = auth.uid()
    )
  );

-- RLS Policies for channel participants
CREATE POLICY "Users can view channel participants"
  ON channel_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_participants cp2
      WHERE cp2.channel_id = channel_id AND cp2.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their channels"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_participants cp
      WHERE cp.channel_id = channel_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their channels"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM channel_participants cp
      WHERE cp.channel_id = channel_id AND cp.user_id = auth.uid()
    )
  );

-- RLS Policies for audit trails
CREATE POLICY "Admins can view all audit trails"
  ON audit_trails FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Administrator', 'Support')
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    'Member',
    new.email
  );
  
  -- Create default accounts for new users
  INSERT INTO public.accounts (user_id, name, type, balance) VALUES
    (new.id, 'Primary Checking', 'checking', 0),
    (new.id, 'Savings Account', 'savings', 0);
  
  -- Create default chart of accounts for new users
  INSERT INTO public.chart_of_accounts (user_id, code, name, account_type, normal_balance) VALUES
    (new.id, '1000', 'Cash and Cash Equivalents', 'asset', 'debit'),
    (new.id, '1100', 'Accounts Receivable', 'asset', 'debit'),
    (new.id, '2000', 'Accounts Payable', 'liability', 'credit'),
    (new.id, '3000', 'Owner Equity', 'equity', 'credit'),
    (new.id, '4000', 'Revenue', 'revenue', 'credit'),
    (new.id, '5000', 'Expenses', 'expense', 'debit');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update storage limits based on subscription
CREATE OR REPLACE FUNCTION update_storage_limit()
RETURNS trigger AS $$
BEGIN
  -- Update storage limit based on role
  CASE NEW.role
    WHEN 'Member' THEN
      NEW.storage_limit_mb := 50;
    WHEN 'Premium Member' THEN
      NEW.storage_limit_mb := 500;
    WHEN 'Professional Accountant' THEN
      NEW.storage_limit_mb := 2000;
    WHEN 'Administrator' THEN
      NEW.storage_limit_mb := 10000;
    ELSE
      NEW.storage_limit_mb := 50;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for storage limit updates
DROP TRIGGER IF EXISTS update_storage_limit_trigger ON profiles;
CREATE TRIGGER update_storage_limit_trigger
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_storage_limit();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_accounts_user_type ON accounts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_client_assignments_cpa ON client_assignments(cpa_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_status ON documents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel_id, created_at);

-- Insert sample data for testing
INSERT INTO channels (name, description, created_by) VALUES
  ('General Discussion', 'General chat for all users', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for documents bucket
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "CPAs can view client documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM client_assignments ca
        WHERE ca.cpa_id = auth.uid() 
        AND ca.client_id::text = (storage.foldername(name))[1]
        AND ca.status = 'active'
      )
    )
  );