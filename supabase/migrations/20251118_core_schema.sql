/*
  ----------------------------------------------------------------------------
  NORTHFINANCE: PRODUCTION DATABASE SCHEMA (v1.0)
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
-- Uncomment the next line if you want to wipe the database completely (DANGEROUS)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption functions if needed later

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

-- A. Profiles (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT, -- Synced from auth for easier querying
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'member' NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    country TEXT DEFAULT 'US',
    preferences JSONB DEFAULT '{}'::JSONB, -- Stores theme, notification settings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. User Secrets (Encrypted API Keys - RLS Protected)
CREATE TABLE IF NOT EXISTS public.user_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service TEXT NOT NULL, -- 'openai', 'gemini', 'claude'
    api_key_encrypted TEXT NOT NULL, -- Store encrypted keys ideally, or plaintext if using strict RLS
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service)
);

-- C. Accounts (Financial Sources)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type public.account_type NOT NULL,
    balance NUMERIC(19, 4) DEFAULT 0.0000 NOT NULL, -- High precision for finance
    currency TEXT DEFAULT 'USD' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Categories (Hierarchical)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null for system categories
    name TEXT NOT NULL,
    type public.transaction_type NOT NULL,
    parent_id UUID REFERENCES public.categories(id),
    icon TEXT, -- Lucide icon name
    color TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Transactions (Double-Entry Ready)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(19, 4) NOT NULL, -- Positive for deposit, Negative for withdrawal
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    payee TEXT,
    type public.transaction_type NOT NULL,
    status public.transaction_status DEFAULT 'cleared',
    
    -- Advanced Features
    is_recurring BOOLEAN DEFAULT FALSE,
    parent_transaction_id UUID REFERENCES public.transactions(id), -- For splits
    transfer_account_id UUID REFERENCES public.accounts(id), -- For transfers
    
    metadata JSONB DEFAULT '{}'::JSONB, -- Store AI extracted data confidence etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    period TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
    rollover BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. Documents (OCR & Attachments)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    status public.document_status DEFAULT 'scanning',
    extracted_data JSONB, -- Result from OCR
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. CPA Client Management
CREATE TABLE IF NOT EXISTS public.cpa_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'rejected'
    permissions JSONB DEFAULT '{"view_transactions": true, "view_reports": true}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cpa_id, client_id)
);

-- I. Messaging (Secure E2EE Headers)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'direct', -- 'direct', 'support'
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
    content_encrypted TEXT NOT NULL, -- E2EE ciphertext
    iv TEXT, -- Initialization Vector for encryption
    is_system_message BOOLEAN DEFAULT FALSE,
    read_by JSONB DEFAULT '[]'::JSONB, -- Array of user_ids who read it
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- J. Support Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The user asking for help
    assigned_to UUID REFERENCES public.profiles(id), -- The staff member
    subject TEXT NOT NULL,
    status public.ticket_status DEFAULT 'open',
    priority public.ticket_priority DEFAULT 'medium',
    category TEXT, -- 'billing', 'bug', 'feature'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes for staff only
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- K. Audit Logs (Security)
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

-- L. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB, -- Link to transaction_id or ticket_id
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORAGE BUCKETS (Run these manually if script fails on buckets)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false) ON CONFLICT DO NOTHING;

-- 5. FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Auto-create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name',
    'member' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
DROP TRIGGER IF EXISTS accounts_updated_at ON accounts;
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
DROP TRIGGER IF EXISTS tickets_updated_at ON tickets;
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Audit Logger Function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        auth.uid(),
        CASE WHEN TG_OP = 'INSERT' THEN 'create'::public.audit_action
             WHEN TG_OP = 'UPDATE' THEN 'update'::public.audit_action
             WHEN TG_OP = 'DELETE' THEN 'delete'::public.audit_action
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Audit Trigger to Critical Tables
DROP TRIGGER IF EXISTS audit_transactions ON transactions;
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION log_audit_event();
DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles AFTER UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event();
DROP TRIGGER IF EXISTS audit_secrets ON user_secrets;
CREATE TRIGGER audit_secrets AFTER INSERT OR UPDATE OR DELETE ON user_secrets FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpa_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper Policy Functions
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_support() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'support' OR role = 'admin'));
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_cpa_for_client(client_uid UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cpa_clients 
    WHERE cpa_id = auth.uid() AND client_id = client_uid AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- A. Profiles Policies
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins/Support view all profiles" ON profiles;
CREATE POLICY "Admins/Support view all profiles" ON profiles FOR SELECT USING (is_support());
DROP POLICY IF EXISTS "CPAs view assigned clients" ON profiles;
CREATE POLICY "CPAs view assigned clients" ON profiles FOR SELECT USING (is_cpa_for_client(id));
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins update any profile" ON profiles;
CREATE POLICY "Admins update any profile" ON profiles FOR UPDATE USING (is_admin());

-- B. Transactions/Accounts/Documents/Budgets Policies (Shared Logic)
-- Users see own; CPAs see assigned; Admins see all.
DROP POLICY IF EXISTS "View Own Financials" ON transactions;
CREATE POLICY "View Own Financials" ON transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "View Client Financials" ON transactions;
CREATE POLICY "View Client Financials" ON transactions FOR SELECT USING (is_cpa_for_client(user_id) OR is_support());
DROP POLICY IF EXISTS "Manage Own Financials" ON transactions;
CREATE POLICY "Manage Own Financials" ON transactions FOR ALL USING (auth.uid() = user_id);
-- Repeat for Accounts
DROP POLICY IF EXISTS "View Own Accounts" ON accounts;
CREATE POLICY "View Own Accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "View Client Accounts" ON accounts;
CREATE POLICY "View Client Accounts" ON accounts FOR SELECT USING (is_cpa_for_client(user_id) OR is_support());
DROP POLICY IF EXISTS "Manage Own Accounts" ON accounts;
CREATE POLICY "Manage Own Accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
-- Repeat for Documents
DROP POLICY IF EXISTS "View Own Documents" ON documents;
CREATE POLICY "View Own Documents" ON documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "View Client Documents" ON documents;
CREATE POLICY "View Client Documents" ON documents FOR SELECT USING (is_cpa_for_client(user_id) OR is_support());
DROP POLICY IF EXISTS "Manage Own Documents" ON documents;
CREATE POLICY "Manage Own Documents" ON documents FOR ALL USING (auth.uid() = user_id);
-- Repeat for Budgets
DROP POLICY IF EXISTS "View Own Budgets" ON budgets;
CREATE POLICY "View Own Budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "View Client Budgets" ON budgets;
CREATE POLICY "View Client Budgets" ON budgets FOR SELECT USING (is_cpa_for_client(user_id) OR is_support());
DROP POLICY IF EXISTS "Manage Own Budgets" ON budgets;
CREATE POLICY "Manage Own Budgets" ON budgets FOR ALL USING (auth.uid() = user_id);


-- C. User Secrets (Strict Privacy)
-- Only the user can insert/update. NO SELECT POLICY for security (retrieved via Edge Function or specific key logic)
DROP POLICY IF EXISTS "Users manage own secrets" ON user_secrets;
CREATE POLICY "Users manage own secrets" ON user_secrets FOR ALL USING (auth.uid() = user_id);

-- D. CPA Clients
DROP POLICY IF EXISTS "CPAs view their links" ON cpa_clients;
CREATE POLICY "CPAs view their links" ON cpa_clients FOR SELECT USING (cpa_id = auth.uid() OR client_id = auth.uid());
DROP POLICY IF EXISTS "CPAs manage links" ON cpa_clients;
CREATE POLICY "CPAs manage links" ON cpa_clients FOR ALL USING (cpa_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage all links" ON cpa_clients;
CREATE POLICY "Admins manage all links" ON cpa_clients FOR ALL USING (is_admin());

-- E. Tickets & Support
DROP POLICY IF EXISTS "Users view own tickets" ON tickets;
CREATE POLICY "Users view own tickets" ON tickets FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Staff view all tickets" ON tickets;
CREATE POLICY "Staff view all tickets" ON tickets FOR ALL USING (is_support());
DROP POLICY IF EXISTS "Users create tickets" ON tickets;
CREATE POLICY "Users create tickets" ON tickets FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "View ticket messages" ON ticket_messages;
CREATE POLICY "View ticket messages" ON ticket_messages FOR SELECT USING (
    (EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND user_id = auth.uid())) -- User owns ticket
    OR is_support()
);
-- Internal Notes Filter: Users CANNOT see internal notes
DROP POLICY IF EXISTS "Filter Internal Notes" ON ticket_messages;
CREATE POLICY "Filter Internal Notes" ON ticket_messages AS RESTRICTIVE FOR SELECT USING (
    NOT is_internal OR is_support()
);
DROP POLICY IF EXISTS "Users post messages" ON ticket_messages;
CREATE POLICY "Users post messages" ON ticket_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "Staff post messages" ON ticket_messages;
CREATE POLICY "Staff post messages" ON ticket_messages FOR INSERT WITH CHECK (is_support());

-- F. Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

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