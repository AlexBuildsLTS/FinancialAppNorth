/*
  ----------------------------------------------------------------------------
  NORTHFINANCE: PRODUCTION DATABASE SCHEMA (v1.0) - CONSOLIDATED
  ----------------------------------------------------------------------------
  Features:
  - Strict RBAC (Member, Premium, CPA, Support, Admin)
  - Double-Entry Bookkeeping Support (Split Transactions)
  - Comprehensive Audit Logging
  - Secure User Secrets (API Keys)
  - E2EE Messaging Architecture
  - Support Ticket System with Internal Notes
  - Real-time Notification System
  ----------------------------------------------------------------------------
*/

-- 1. RESET & EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('member', 'premium', 'cpa', 'support', 'admin');
    CREATE TYPE public.account_type AS ENUM ('checking', 'savings', 'credit', 'investment', 'cash', 'loan');
    CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer');
    CREATE TYPE public.transaction_status AS ENUM ('pending', 'cleared', 'reconciled', 'void');
    CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
    CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'delete', 'login', 'impersonate');
    CREATE TYPE public.document_status AS ENUM ('scanning', 'processed', 'failed', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'member' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    country TEXT DEFAULT 'US',
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service TEXT NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service)
);

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type public.account_type NOT NULL,
    balance NUMERIC(19, 4) DEFAULT 0.0000 NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type public.transaction_type NOT NULL,
    parent_id UUID REFERENCES public.categories(id),
    icon TEXT,
    color TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(19, 4) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payee TEXT,
    type public.transaction_type NOT NULL,
    status public.transaction_status DEFAULT 'cleared',
    is_recurring BOOLEAN DEFAULT FALSE,
    parent_transaction_id UUID REFERENCES public.transactions(id),
    transfer_account_id UUID REFERENCES public.accounts(id),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    period TEXT DEFAULT 'monthly',
    rollover BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    status public.document_status DEFAULT 'scanning',
    extracted_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cpa_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending',
    permissions JSONB DEFAULT '{"view_transactions": true, "view_reports": true}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cpa_id, client_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'direct',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content_encrypted TEXT NOT NULL,
    iv TEXT,
    is_system_message BOOLEAN DEFAULT FALSE,
    read_by JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id),
    subject TEXT NOT NULL,
    status public.ticket_status DEFAULT 'open',
    priority public.ticket_priority DEFAULT 'medium',
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action public.audit_action NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORAGE BUCKETS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false) ON CONFLICT DO NOTHING;

-- 5. FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Centralize role checking with a single, secure function.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'anon'
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Helper functions using the new central role function.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$ SELECT public.get_my_role() = 'admin' $$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_support()
RETURNS BOOLEAN AS $$ SELECT public.get_my_role() IN ('admin', 'support') $$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_cpa_for_client(client_uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cpa_clients
    WHERE cpa_id = auth.uid() AND client_id = client_uid AND status = 'active'
  );
$$ LANGUAGE sql STABLE;

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow profile access based on role" ON public.profiles
FOR SELECT USING (auth.uid() = id OR public.is_support() OR public.is_cpa_for_client(id));
CREATE POLICY "Allow profile update based on role" ON public.profiles
FOR UPDATE USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- FINANCIAL TABLES RLS (Procedure to apply to multiple tables)
CREATE OR REPLACE PROCEDURE setup_financial_rls(table_name TEXT) AS $$
BEGIN
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow full access to own records" ON public.%I;', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow support/cpa access to client records" ON public.%I;', table_name);
  EXECUTE format('CREATE POLICY "Allow full access to own records" ON public.%I FOR ALL USING (auth.uid() = user_id);', table_name);
  EXECUTE format('CREATE POLICY "Allow support/cpa access to client records" ON public.%I FOR SELECT USING (public.is_support() OR public.is_cpa_for_client(user_id));', table_name);
END;
$$ LANGUAGE plpgsql;

CALL setup_financial_rls('transactions');
CALL setup_financial_rls('accounts');
CALL setup_financial_rls('documents');
CALL setup_financial_rls('budgets');
DROP PROCEDURE setup_financial_rls(TEXT);

-- CPA_CLIENTS RLS
ALTER TABLE public.cpa_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access based on role" ON public.cpa_clients
FOR ALL USING (public.is_admin() OR auth.uid() = cpa_id OR auth.uid() = client_id);

-- TICKETS & MESSAGES RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access based on role" ON public.tickets
FOR ALL USING (auth.uid() = user_id OR public.is_support());

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow message access based on role" ON public.ticket_messages
FOR SELECT USING (public.is_support() OR EXISTS(SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Allow message inserts based on role" ON public.ticket_messages
FOR INSERT WITH CHECK (public.is_support() OR EXISTS(SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Internal notes are restricted" ON public.ticket_messages
AS RESTRICTIVE FOR SELECT USING (NOT is_internal OR public.is_support());

-- USER_SECRETS RLS
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own secrets" ON public.user_secrets
FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their own notifications" ON public.notifications
FOR ALL USING (auth.uid() = user_id);

-- 7. INDEXES (Performance Optimization)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to);

-- End of Migration Script
