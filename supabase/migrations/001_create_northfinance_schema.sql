-- 001_create_northfinance_schema.sql
-- FULL WIPE AND RECREATE FOR northfinance SCHEMA (v2 - Typos fixed)

-- 0) Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1) Create schema
CREATE SCHEMA IF NOT EXISTS northfinance AUTHORIZATION postgres;

SET search_path = northfinance, public;

-- 2) Drop existing objects in northfinance
DROP FUNCTION IF EXISTS northfinance.get_user_tenant() CASCADE;
DROP FUNCTION IF EXISTS northfinance.is_cpa_for_client(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS northfinance.audit_event(text, uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS northfinance.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS northfinance.profile_update_audit() CASCADE;

DROP TABLE IF EXISTS northfinance.user_secrets CASCADE;
DROP TABLE IF EXISTS northfinance.transactions CASCADE;
DROP TABLE IF EXISTS northfinance.accounts CASCADE;
DROP TABLE IF EXISTS northfinance.categories CASCADE;
DROP TABLE IF EXISTS northfinance.documents CASCADE;
DROP TABLE IF EXISTS northfinance.cpa_client_assignments CASCADE;
DROP TABLE IF EXISTS northfinance.cpa_client_assignments_pending CASCADE;
DROP TABLE IF EXISTS northfinance.profiles CASCADE;
DROP TABLE IF EXISTS northfinance.audit_log CASCADE;
DROP TABLE IF EXISTS northfinance.support_tickets CASCADE;
DROP TABLE IF EXISTS northfinance.support_messages CASCADE;
DROP TABLE IF EXISTS northfinance.notifications CASCADE;
DROP TABLE IF EXISTS northfinance.channels CASCADE;
DROP TABLE IF EXISTS northfinance.channel_participants CASCADE;
DROP TABLE IF EXISTS northfinance.messages CASCADE;
DROP TABLE IF EXISTS northfinance.budgets CASCADE;
DROP TABLE IF EXISTS northfinance.tickets CASCADE;
DROP TABLE IF EXISTS northfinance.ticket_messages CASCADE;

DROP TYPE IF EXISTS northfinance.user_role CASCADE;
DROP TYPE IF EXISTS northfinance.account_type CASCADE;
DROP TYPE IF EXISTS northfinance.transaction_type CASCADE;
DROP TYPE IF EXISTS northfinance.transaction_status CASCADE;
DROP TYPE IF EXISTS northfinance.document_status CASCADE;
DROP TYPE IF EXISTS northfinance.assignment_status CASCADE;
DROP TYPE IF EXISTS northfinance.ticket_status CASCADE;
DROP TYPE IF EXISTS northfinance.ticket_priority CASCADE;
DROP TYPE IF EXISTS northfinance.audit_action CASCADE;

-- 3) Create enums
CREATE TYPE northfinance.user_role AS ENUM ('member','premium','cpa','support','admin');
CREATE TYPE northfinance.account_type AS ENUM ('checking','savings','credit','investment');
CREATE TYPE northfinance.transaction_type AS ENUM ('income','expense');
CREATE TYPE northfinance.transaction_status AS ENUM ('pending','cleared','cancelled');
CREATE TYPE northfinance.document_status AS ENUM ('processing','processed','error');
CREATE TYPE northfinance.assignment_status AS ENUM ('pending','active','terminated');
CREATE TYPE northfinance.ticket_status AS ENUM ('open','in_progress','resolved','closed');
CREATE TYPE northfinance.ticket_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE northfinance.audit_action AS ENUM ('login','logout','update_profile','change_role','assign_client','post_transaction','upload_document','delete_document','system');

-- 4) Core tables
CREATE TABLE northfinance.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  role northfinance.user_role NOT NULL DEFAULT 'member',
  is_admin boolean NOT NULL DEFAULT false,
  first_name text,
  last_name text,
  country text,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.profiles IS 'Application user profiles linked to auth.users.id';

CREATE TABLE northfinance.accounts (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type northfinance.account_type NOT NULL DEFAULT 'checking',
  balance numeric(18,2) NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.accounts IS 'User financial accounts (checking, savings, etc.)';

CREATE TABLE northfinance.categories (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type northfinance.transaction_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.categories IS 'User-defined categories for transactions';

CREATE TABLE northfinance.documents (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size bigint,
  status northfinance.document_status NOT NULL DEFAULT 'processing',
  processed_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.documents IS 'Metadata for files stored in Supabase Storage';

CREATE TABLE northfinance.transactions (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES northfinance.accounts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES northfinance.categories(id) ON DELETE SET NULL,
  document_id uuid REFERENCES northfinance.documents(id) ON DELETE SET NULL,
  description text,
  amount numeric(18,2) NOT NULL,
  type northfinance.transaction_type NOT NULL,
  transaction_date date NOT NULL,
  status northfinance.transaction_status NOT NULL DEFAULT 'cleared',
  --
  -- ## FIX: Corrected typo 'timestamlptz' to 'timestamptz'
  --
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.transactions IS 'Individual transactions linked to accounts and categories';

CREATE TABLE northfinance.cpa_client_assignments (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  cpa_user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  status northfinance.assignment_status NOT NULL DEFAULT 'pending',
  assigned_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.cpa_client_assignments IS 'Maps CPAs to their client users';

CREATE TABLE northfinance.cpa_client_assignments_pending (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  cpa_user_id uuid NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES northfinance.profiles(id),
  client_email text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.cpa_client_assignments_pending IS 'Pending CPA invites by email';

CREATE TABLE northfinance.user_secrets (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  openai_key text,
  gemini_key text,
  claude_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.user_secrets IS 'User-provided API keys. RLS prevents direct user read access.';

CREATE TABLE northfinance.audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES northfinance.profiles(id) ON DELETE SET NULL,
  action northfinance.audit_action NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  actor text
);
COMMENT ON TABLE northfinance.audit_log IS 'Immutable audit log for admin actions and critical events';

CREATE TABLE northfinance.support_tickets (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid REFERENCES northfinance.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  status northfinance.ticket_status NOT NULL DEFAULT 'open',
  priority northfinance.ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to_id uuid REFERENCES northfinance.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE northfinance.support_tickets IS 'Support tickets opened by users';

CREATE TABLE northfinance.support_messages (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  ticket_id uuid REFERENCES northfinance.support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES northfinance.profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  internal boolean NOT NULL DEFAULT false
);
COMMENT ON TABLE northfinance.support_messages IS 'Messages inside a support ticket';

CREATE TABLE northfinance.notifications (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);
COMMENT ON TABLE northfinance.notifications IS 'User notifications';

CREATE TABLE northfinance.channels (
  id bigserial PRIMARY KEY,
  created_by uuid REFERENCES northfinance.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE northfinance.channel_participants (
  channel_id bigint REFERENCES northfinance.channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  --
  -- ## FIX: Corrected typo 'timestamtztz' to 'timestamptz'
  --
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE northfinance.messages (
  id bigserial PRIMARY KEY,
  channel_id bigint REFERENCES northfinance.channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES northfinance.profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE northfinance.budgets (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  user_id uuid REFERENCES northfinance.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(18,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  period text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_nf_profiles_role ON northfinance.profiles(role);
CREATE INDEX IF NOT EXISTS idx_nf_accounts_user_id ON northfinance.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_nf_transactions_user_id ON northfinance.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_nf_transactions_account_id ON northfinance.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_nf_categories_user_id ON northfinance.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_nf_documents_user_id ON northfinance.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_nf_cpa_assign_cpa ON northfinance.cpa_client_assignments(cpa_user_id);
CREATE INDEX IF NOT EXISTS idx_nf_cpa_assign_client ON northfinance.cpa_client_assignments(client_user_id);
CREATE INDEX IF NOT EXISTS idx_nf_user_secrets_user_id ON northfinance.user_secrets(user_id);

-- 6) Helper functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION northfinance.get_user_role() RETURNS northfinance.user_role
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM northfinance.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION northfinance.get_user_role() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION northfinance.is_cpa_for_client(cpa uuid, client uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM northfinance.cpa_client_assignments
    WHERE cpa_user_id = cpa AND client_user_id = client AND status = 'active'
  );
$$;
REVOKE EXECUTE ON FUNCTION northfinance.is_cpa_for_client(uuid, uuid) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION northfinance.audit_event(p_action text, p_actor uuid, p_details jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO northfinance.audit_log (actor_id, action, details, created_at, actor)
  VALUES (p_actor, p_action::northfinance.audit_action, p_details, now(), (SELECT display_name FROM northfinance.profiles WHERE id = p_actor));
END;
$$;
REVOKE EXECUTE ON FUNCTION northfinance.audit_event(text, uuid, jsonb) FROM anon, authenticated;

-- 7) Enable RLS and create policies
ALTER TABLE northfinance.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON northfinance.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY profiles_update_own ON northfinance.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id OR (SELECT northfinance.get_user_role() = 'admin')) WITH CHECK ((SELECT auth.uid()) = id OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY profiles_insert ON northfinance.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

ALTER TABLE northfinance.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_select_owner ON northfinance.accounts FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR EXISTS (
  SELECT 1 FROM northfinance.cpa_client_assignments cca WHERE cca.cpa_user_id = (SELECT auth.uid()) AND cca.client_user_id = user_id AND cca.status = 'active'
) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY accounts_insert_owner ON northfinance.accounts FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY accounts_update_owner ON northfinance.accounts FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin')) WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY accounts_delete_owner ON northfinance.accounts FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));

ALTER TABLE northfinance.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select_owner ON northfinance.categories FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY categories_insert_owner ON northfinance.categories FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY categories_update_owner ON northfinance.categories FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY categories_delete_owner ON northfinance.categories FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

ALTER TABLE northfinance.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_select_owner ON northfinance.documents FOR SELECT TO authenticated USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (SELECT 1 FROM northfinance.cpa_client_assignments cca WHERE cca.cpa_user_id = (SELECT auth.uid()) AND cca.client_user_id = user_id AND cca.status = 'active') OR
  (SELECT northfinance.get_user_role() = 'admin')
);
CREATE POLICY documents_insert_owner ON northfinance.documents FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY documents_update_owner ON northfinance.documents FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY documents_delete_owner ON northfinance.documents FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));

ALTER TABLE northfinance.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_select_owner ON northfinance.transactions FOR SELECT TO authenticated USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (SELECT 1 FROM northfinance.cpa_client_assignments cca WHERE cca.cpa_user_id = (SELECT auth.uid()) AND cca.client_user_id = user_id AND cca.status = 'active')
  OR (SELECT northfinance.get_user_role() = 'admin')
);
CREATE POLICY transactions_insert_owner ON northfinance.transactions FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY transactions_update_owner ON northfinance.transactions FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin')) WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY transactions_delete_owner ON northfinance.transactions FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));

ALTER TABLE northfinance.cpa_client_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY cpa_assign_select ON northfinance.cpa_client_assignments FOR SELECT TO authenticated USING (
  cpa_user_id = (SELECT auth.uid()) OR client_user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin')
);
CREATE POLICY cpa_assign_insert ON northfinance.cpa_client_assignments FOR INSERT TO authenticated WITH CHECK (cpa_user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY cpa_assign_update ON northfinance.cpa_client_assignments FOR UPDATE TO authenticated USING (cpa_user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin')) WITH CHECK (cpa_user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY cpa_assign_delete ON northfinance.cpa_client_assignments FOR DELETE TO authenticated USING (cpa_user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));

ALTER TABLE northfinance.user_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_secrets_no_select ON northfinance.user_secrets FOR SELECT TO authenticated USING (false);
CREATE POLICY user_secrets_owner_upsert ON northfinance.user_secrets FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY user_secrets_owner_update ON northfinance.user_secrets FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY user_secrets_admin_select ON northfinance.user_secrets FOR SELECT TO authenticated USING ((SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY user_secrets_admin_update ON northfinance.user_secrets FOR UPDATE TO authenticated USING ((SELECT northfinance.get_user_role() = 'admin')) WITH CHECK ((SELECT northfinance.get_user_role() = 'admin'));

ALTER TABLE northfinance.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_select_admin ON northfinance.audit_log FOR SELECT TO authenticated USING ((SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY audit_insert ON northfinance.audit_log FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE northfinance.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_tickets_select_owner ON northfinance.support_tickets FOR SELECT TO authenticated USING (
  user_id = (SELECT auth.uid()) OR assigned_to_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() IN ('support','admin'))
);
CREATE POLICY support_tickets_insert ON northfinance.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY support_tickets_update ON northfinance.support_tickets FOR UPDATE TO authenticated USING (assigned_to_id = (SELECT auth.uid()) OR user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() IN ('support','admin'))) WITH CHECK (true);

ALTER TABLE northfinance.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_messages_select_owner ON northfinance.support_messages FOR SELECT TO authenticated USING (
  --
  -- ## FIX: Corrected typo 'st.user_d' to 'st.user_id'
  --
  EXISTS (SELECT 1 FROM northfinance.support_tickets st WHERE st.id = ticket_id AND (st.user_id = (SELECT auth.uid()) OR st.assigned_to_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() IN ('support','admin'))))
);
CREATE POLICY support_messages_insert_owner ON northfinance.support_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM northfinance.support_tickets st WHERE st.id = ticket_id AND (st.user_id = (SELECT auth.uid()) OR st.assigned_to_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() IN ('support','admin'))))
);

ALTER TABLE northfinance.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select_owner ON northfinance.notifications FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY notifications_insert_owner ON northfinance.notifications FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY notifications_update_owner ON northfinance.notifications FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin')) WITH CHECK (true);

ALTER TABLE northfinance.channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY channels_select_participant ON northfinance.channels FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM northfinance.channel_participants cp WHERE cp.channel_id = northfinance.channels.id AND cp.user_id = (SELECT auth.uid()))
  OR (SELECT northfinance.get_user_role() = 'admin')
);
CREATE POLICY channels_insert ON northfinance.channels FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE northfinance.channel_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY channel_participants_select ON northfinance.channel_participants FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT northfinance.get_user_role() = 'admin'));
CREATE POLICY channel_participants_insert ON northfinance.channel_participants FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

ALTER TABLE northfinance.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_select_participant ON northfinance.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM northfinance.channel_participants cp WHERE cp.channel_id = northfinance.messages.channel_id AND cp.user_id = (SELECT auth.uid()))
  OR (SELECT northfinance.get_user_role() = 'admin')
);
CREATE POLICY messages_insert_participant ON northfinance.messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM northfinance.channel_participants cp WHERE cp.channel_id = northfinance.messages.channel_id AND cp.user_id = (SELECT auth.uid()))
);

ALTER TABLE northfinance.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budgets_select_owner ON northfinance.budgets FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY budgets_insert_owner ON northfinance.budgets FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY budgets_update_owner ON northfinance.budgets FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY budgets_delete_owner ON northfinance.budgets FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- 8) Triggers
CREATE OR REPLACE FUNCTION northfinance.profile_update_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM northfinance.audit_event('update_profile', (SELECT auth.uid()), jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION northfinance.profile_update_audit() FROM anon, authenticated;

CREATE TRIGGER trg_profiles_update_audit
AFTER UPDATE ON northfinance.profiles
FOR EACH ROW EXECUTE FUNCTION northfinance.profile_update_audit();

-- End of migration