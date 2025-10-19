----------------------------------------------------------------
-- PART 1: EXTENSIONS & CUSTOM TYPES
-- Ensures required database extensions are enabled and defines custom data types for consistency.
----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types for Statuses
CREATE TYPE public.transaction_status AS ENUM ('pending', 'cleared', 'cancelled');
CREATE TYPE public.assignment_status AS ENUM ('pending', 'active', 'terminated');
CREATE TYPE public.document_status AS ENUM ('processing', 'processed', 'error');
CREATE TYPE public.user_role AS ENUM ('member', 'premium', 'cpa', 'support', 'admin');
CREATE TYPE public.account_type AS ENUM ('checking', 'savings', 'credit', 'investment');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');


----------------------------------------------------------------
-- PART 2: CORE TABLES
-- Creates the foundational tables for your application.
----------------------------------------------------------------

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'member' NOT NULL
);
COMMENT ON TABLE public.profiles IS 'User profile information, linked directly to the authentication user.';

-- Accounts Table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL
);
COMMENT ON TABLE public.accounts IS 'Financial accounts for each user (e.g., checking, savings).';

-- Categories Table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  UNIQUE(user_id, name)
);
COMMENT ON TABLE public.categories IS 'User-defined categories for transactions (e.g., Groceries, Salary).';

-- Documents Table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  status document_status DEFAULT 'processing' NOT NULL,
  processed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.documents IS 'Stores metadata for user-uploaded receipts and invoices.';

-- Transactions Table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  description TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  type transaction_type NOT NULL,
  transaction_date DATE NOT NULL,
  status transaction_status DEFAULT 'cleared' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.transactions IS 'Individual financial transactions, linked to accounts and categories.';

-- CPA Client Assignments Table
CREATE TABLE public.cpa_client_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpa_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status assignment_status DEFAULT 'pending' NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(cpa_user_id, client_user_id)
);
COMMENT ON TABLE public.cpa_client_assignments IS 'Maps professional accountants (CPAs) to their clients.';

-- User Secrets Table (For API Keys)
CREATE TABLE public.user_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  openai_key TEXT,
  gemini_key TEXT,
  claude_key TEXT
);
COMMENT ON TABLE public.user_secrets IS 'Securely stores user-provided API keys. To be encrypted in a real environment.';

-- Chat Channels Table
CREATE TABLE public.channels (
    id BIGSERIAL PRIMARY KEY,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.channels IS 'Represents a chat conversation.';

-- Channel Participants Table
CREATE TABLE public.channel_participants (
    channel_id BIGINT NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (channel_id, user_id)
);
COMMENT ON TABLE public.channel_participants IS 'Links users to chat channels.';

-- Messages Table
CREATE TABLE public.messages (
    id BIGSERIAL PRIMARY KEY,
    channel_id BIGINT NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    -- For E2EE, you would store ciphertext here instead of plaintext 'content'.
    -- The schema is ready for it when your client-side encryption is implemented.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.messages IS 'Individual messages within a channel.';


----------------------------------------------------------------
-- PART 3: INDEXES FOR PERFORMANCE
-- Speeds up common database queries.
----------------------------------------------------------------
CREATE INDEX ON public.accounts (user_id);
CREATE INDEX ON public.categories (user_id);
CREATE INDEX ON public.documents (user_id);
CREATE INDEX ON public.transactions (user_id);
CREATE INDEX ON public.transactions (account_id);
CREATE INDEX ON public.transactions (category_id);
CREATE INDEX ON public.cpa_client_assignments (cpa_user_id);
CREATE INDEX ON public.cpa_client_assignments (client_user_id);
CREATE INDEX ON public.channel_participants (user_id);
CREATE INDEX ON public.messages (channel_id);


----------------------------------------------------------------
-- PART 4: FUNCTIONS & TRIGGERS
-- Automates essential backend logic.
----------------------------------------------------------------

-- Function to create a profile when a new user signs up in Supabase Auth.
-- THIS IS THE KEY TO MAKING YOUR REGISTRATION FLOW WORK.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    'member'
  );
  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to easily get the role of the currently logged-in user.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE plpgsql
AS $$
DECLARE
  my_role user_role;
BEGIN
  SELECT role INTO my_role FROM public.profiles WHERE id = auth.uid();
  RETURN my_role;
END;
$$;

-- Function to get a summary of income and expenses for the current month.
CREATE OR REPLACE FUNCTION public.get_monthly_income_summary()
RETURNS TABLE(total_income NUMERIC, total_expense NUMERIC, net_income NUMERIC)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  v_start_date := date_trunc('month', NOW())::DATE;
  v_end_date := (date_trunc('month', NOW()) + interval '1 month - 1 day')::DATE;

  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_income
  FROM
    public.transactions
  WHERE
    user_id = auth.uid() AND
    transaction_date BETWEEN v_start_date AND v_end_date;
END;
$$;


----------------------------------------------------------------
-- PART 5: ROW-LEVEL SECURITY (RLS)
-- The most critical part. This enforces who can see and do what.
----------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpa_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ** PROFILES POLICIES **
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ** ACCOUNTS, CATEGORIES, TRANSACTIONS, DOCUMENTS POLICIES **
CREATE POLICY "Users can manage their own data; admins manage all." ON public.accounts FOR ALL USING ((auth.uid() = user_id) OR (get_my_role() = 'admin'));
CREATE POLICY "Users can manage their own data; admins manage all." ON public.categories FOR ALL USING ((auth.uid() = user_id) OR (get_my_role() = 'admin'));
CREATE POLICY "Users can manage their own data; admins manage all." ON public.transactions FOR ALL USING ((auth.uid() = user_id) OR (get_my_role() = 'admin'));
CREATE POLICY "Users can manage their own data; admins manage all." ON public.documents FOR ALL USING ((auth.uid() = user_id) OR (get_my_role() = 'admin'));

-- ** CPA & SUPPORT "READ-ONLY" POLICIES FOR CLIENT DATA **
CREATE POLICY "Support and assigned CPAs can view client data." ON public.accounts FOR SELECT USING (
  (get_my_role() = 'support') OR
  (EXISTS (SELECT 1 FROM cpa_client_assignments WHERE client_user_id = public.accounts.user_id AND cpa_user_id = auth.uid() AND status = 'active'))
);
CREATE POLICY "Support and assigned CPAs can view client data." ON public.categories FOR SELECT USING (
  (get_my_role() = 'support') OR
  (EXISTS (SELECT 1 FROM cpa_client_assignments WHERE client_user_id = public.categories.user_id AND cpa_user_id = auth.uid() AND status = 'active'))
);
CREATE POLICY "Support and assigned CPAs can view client data." ON public.transactions FOR SELECT USING (
  (get_my_role() = 'support') OR
  (EXISTS (SELECT 1 FROM cpa_client_assignments WHERE client_user_id = public.transactions.user_id AND cpa_user_id = auth.uid() AND status = 'active'))
);
CREATE POLICY "Support and assigned CPAs can view client data." ON public.documents FOR SELECT USING (
  (get_my_role() = 'support') OR
  (EXISTS (SELECT 1 FROM cpa_client_assignments WHERE client_user_id = public.documents.user_id AND cpa_user_id = auth.uid() AND status = 'active'))
);

-- ** USER SECRETS POLICY (CRITICAL) **
-- This policy allows users to insert their own secrets, but BLOCKS EVERYONE from reading them.
-- ONLY YOUR EDGE FUNCTIONS USING THE 'service_role' KEY CAN READ THESE.
CREATE POLICY "Users can insert their own secrets." ON public.user_secrets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own secrets." ON public.user_secrets FOR UPDATE USING (auth.uid() = user_id);
-- INTENTIONALLY NO 'SELECT' POLICY. This makes the data read-proof for all users.

-- ** CHAT POLICIES **
CREATE POLICY "Users can manage channels they participate in." ON public.channels FOR ALL USING (
  EXISTS (SELECT 1 FROM channel_participants WHERE channel_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their own participation." ON public.channel_participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can send/read messages in channels they are in." ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM channel_participants WHERE channel_id = public.messages.channel_id AND user_id = auth.uid())
);




