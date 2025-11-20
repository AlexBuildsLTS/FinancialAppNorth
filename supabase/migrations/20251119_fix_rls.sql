-- 1. Centralize role checking with a single, secure function.
-- This function runs as the user who calls it (SECURITY INVOKER), which is what we want for RLS.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
BEGIN
  -- In case the user has been deleted from auth but not profiles, handle the null case.
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'anon'
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 2. Drop the old, insecure helper functions and all dependent policies.
-- Using CASCADE is crucial as it automatically removes the policies that rely on these functions.
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_support() CASCADE;
DROP FUNCTION IF EXISTS public.is_cpa_for_client(UUID) CASCADE;

-- 3. Re-create the helper functions using the new central role function.
-- These are now simple, efficient, and use SECURITY INVOKER by default because they are SQL.
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


-- 4. Re-create all necessary RLS policies from scratch with the correct logic.
-- This ensures a clean and correct state after the CASCADE drop.

-- == PROFILES ==
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- First, remove any old policies to start fresh.
DROP POLICY IF EXISTS "Allow profile access based on role" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update based on role" ON public.profiles;
-- SELECT: Users see their own profile. Support/Admins see all. CPAs see their clients.
CREATE POLICY "Allow profile access based on role" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR
  public.is_support() OR
  public.is_cpa_for_client(id)
);
-- UPDATE: Users update their own. Admins update any.
CREATE POLICY "Allow profile update based on role" ON public.profiles
FOR UPDATE USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());


-- == FINANCIAL TABLES (Transactions, Accounts, Documents, Budgets) ==
-- Re-create policies for each financial table. The logic is the same for all.
CREATE OR REPLACE PROCEDURE setup_financial_rls(table_name TEXT) AS $$
BEGIN
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow full access to own records" ON public.%I;', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow support/cpa access to client records" ON public.%I;', table_name);

  -- Policy 1: Users have full control over their own records.
  EXECUTE format('CREATE POLICY "Allow full access to own records" ON public.%I FOR ALL USING (auth.uid() = user_id);', table_name);
  -- Policy 2: Support/Admins and assigned CPAs can view records.
  EXECUTE format('CREATE POLICY "Allow support/cpa access to client records" ON public.%I FOR SELECT USING (public.is_support() OR public.is_cpa_for_client(user_id));', table_name);
END;
$$ LANGUAGE plpgsql;

CALL setup_financial_rls('transactions');
CALL setup_financial_rls('accounts');
CALL setup_financial_rls('documents');
CALL setup_financial_rls('budgets');
DROP PROCEDURE setup_financial_rls(TEXT);


-- == CPA_CLIENTS ==
ALTER TABLE public.cpa_clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access based on role" ON public.cpa_clients;
-- Admins can do anything. CPAs can manage their own links. Clients can see their own links.
CREATE POLICY "Allow access based on role" ON public.cpa_clients
FOR ALL USING (
  public.is_admin() OR
  auth.uid() = cpa_id OR
  auth.uid() = client_id
);


-- == TICKETS & MESSAGES ==
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow access based on role" ON public.tickets;
-- Users can see their own tickets. Support/Admins can see all.
CREATE POLICY "Allow access based on role" ON public.tickets
FOR ALL USING (auth.uid() = user_id OR public.is_support());

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow message access based on role" ON public.ticket_messages;
DROP POLICY IF EXISTS "Internal notes are restricted" ON public.ticket_messages;
-- Users can see messages in their own tickets. Support/Admins can see all messages.
CREATE POLICY "Allow message access based on role" ON public.ticket_messages
FOR SELECT USING (
  public.is_support() OR
  EXISTS(SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);
-- Users can post messages in their own tickets. Support/Admins can post in any.
CREATE POLICY "Allow message inserts based on role" ON public.ticket_messages
FOR INSERT WITH CHECK (
  public.is_support() OR
  EXISTS(SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);
-- RESTRICTIVE policy: Hide internal notes from non-support staff.
CREATE POLICY "Internal notes are restricted" ON public.ticket_messages
AS RESTRICTIVE FOR SELECT USING (
  NOT is_internal OR public.is_support()
);

-- == USER_SECRETS ==
ALTER TABLE public.user_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own secrets" ON public.user_secrets;
CREATE POLICY "Users can manage their own secrets" ON public.user_secrets
FOR ALL USING (auth.uid() = user_id);

-- == NOTIFICATIONS ==
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own notifications" ON public.notifications;
CREATE POLICY "Users can access their own notifications" ON public.notifications
FOR ALL USING (auth.uid() = user_id);
