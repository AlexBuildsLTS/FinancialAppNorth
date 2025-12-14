drop extension if exists "pg_net";

create type "public"."account_type" as enum ('checking', 'savings', 'credit', 'investment', 'cash', 'loan');

create type "public"."app_role" as enum ('member', 'premium_member', 'cpa', 'support', 'admin');

create type "public"."audit_action" as enum ('create', 'update', 'delete', 'login', 'impersonate');

create type "public"."document_status" as enum ('scanning', 'processed', 'failed', 'verified');

create type "public"."ticket_priority" as enum ('low', 'medium', 'high', 'urgent');

create type "public"."ticket_status" as enum ('open', 'in_progress', 'resolved', 'closed');

create type "public"."transaction_status" as enum ('pending', 'cleared', 'reconciled', 'void');

create type "public"."transaction_type" as enum ('income', 'expense', 'transfer');

create type "public"."user_role" as enum ('member', 'premium', 'cpa', 'support', 'admin');


  create table "public"."accounts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "name" text not null,
    "type" public.account_type not null,
    "balance" numeric(19,4) not null default 0.0000,
    "currency" text not null default 'USD'::text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."accounts" enable row level security;


  create table "public"."audit_logs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "action" public.audit_action not null,
    "table_name" text not null,
    "record_id" uuid,
    "old_data" jsonb,
    "new_data" jsonb,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."audit_logs" enable row level security;


  create table "public"."budgets" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "category_id" uuid not null,
    "amount" numeric(19,4) not null,
    "period" text default 'monthly'::text,
    "rollover" boolean default false,
    "start_date" date not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."budgets" enable row level security;


  create table "public"."categories" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "name" text not null,
    "type" public.transaction_type not null,
    "parent_id" uuid,
    "icon" text,
    "color" text,
    "is_system" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."chatbot_messages" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "sender" text not null,
    "text" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."chatbot_messages" enable row level security;


  create table "public"."conversation_participants" (
    "conversation_id" uuid not null,
    "user_id" uuid not null
      );


alter table "public"."conversation_participants" enable row level security;


  create table "public"."conversations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "type" text default 'direct'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_message_at" timestamp with time zone default now(),
    "last_message_preview" text
      );


alter table "public"."conversations" enable row level security;


  create table "public"."cpa_clients" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "cpa_id" uuid not null,
    "client_id" uuid not null,
    "status" text default 'pending'::text,
    "permissions" jsonb default '{"view_reports": true, "view_transactions": true}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."cpa_clients" enable row level security;


  create table "public"."documents" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "transaction_id" uuid,
    "file_path" text not null,
    "file_name" text not null,
    "mime_type" text,
    "size_bytes" bigint,
    "status" public.document_status default 'scanning'::public.document_status,
    "extracted_data" jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."documents" enable row level security;


  create table "public"."expense_requests" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid,
    "requester_id" uuid,
    "amount" numeric not null,
    "merchant" text,
    "reason" text,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."expense_requests" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "conversation_id" uuid not null,
    "sender_id" uuid,
    "iv" text,
    "is_system_message" boolean default false,
    "read_by" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "attachment_url" text,
    "attachment_type" text,
    "message_type" text default 'text'::text,
    "file_url" text,
    "file_name" text,
    "file_size" bigint,
    "content" text,
    "content_encrypted" text
      );


alter table "public"."messages" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "title" text not null,
    "message" text not null,
    "type" text default 'info'::text,
    "is_read" boolean default false,
    "data" jsonb,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid,
    "related_id" uuid
      );


alter table "public"."notifications" enable row level security;


  create table "public"."organization_members" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid,
    "user_id" uuid,
    "role" text default 'member'::text,
    "joined_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."organization_members" enable row level security;


  create table "public"."organizations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "owner_id" uuid not null
      );


alter table "public"."organizations" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "first_name" text,
    "last_name" text,
    "avatar_url" text,
    "role" public.user_role not null default 'member'::public.user_role,
    "currency" text not null default 'USD'::text,
    "country" text default 'US'::text,
    "preferences" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "full_name" text generated always as (TRIM(BOTH FROM ((COALESCE(first_name, ''::text) || ' '::text) || COALESCE(last_name, ''::text)))) stored
      );


alter table "public"."profiles" enable row level security;


  create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "merchant" text not null,
    "amount" numeric(10,2) not null,
    "frequency" text not null,
    "status" text not null default 'stable'::text,
    "previous_amount" numeric(10,2),
    "anomaly_detected_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "next_billing_date" timestamp with time zone
      );


alter table "public"."subscriptions" enable row level security;


  create table "public"."ticket_messages" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "ticket_id" uuid not null,
    "user_id" uuid not null,
    "message" text not null,
    "is_internal" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ticket_messages" enable row level security;


  create table "public"."tickets" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "assigned_to" uuid,
    "subject" text not null,
    "status" public.ticket_status default 'open'::public.ticket_status,
    "priority" public.ticket_priority default 'medium'::public.ticket_priority,
    "category" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."tickets" enable row level security;


  create table "public"."transactions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "account_id" uuid not null,
    "category_id" uuid,
    "amount" numeric(19,4) not null,
    "date" date not null default CURRENT_DATE,
    "description" text,
    "payee" text,
    "type" public.transaction_type not null,
    "status" public.transaction_status default 'cleared'::public.transaction_status,
    "is_recurring" boolean default false,
    "parent_transaction_id" uuid,
    "transfer_account_id" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "category" text,
    "is_tax_deductible" boolean,
    "tax_category" text
      );


alter table "public"."transactions" enable row level security;


  create table "public"."user_secrets" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "service" text not null,
    "api_key_encrypted" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_secrets" enable row level security;

CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX budgets_pkey ON public.budgets USING btree (id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX chatbot_messages_pkey ON public.chatbot_messages USING btree (id);

CREATE UNIQUE INDEX conversation_participants_pkey ON public.conversation_participants USING btree (conversation_id, user_id);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX cpa_clients_cpa_id_client_id_key ON public.cpa_clients USING btree (cpa_id, client_id);

CREATE UNIQUE INDEX cpa_clients_pkey ON public.cpa_clients USING btree (id);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE UNIQUE INDEX expense_requests_pkey ON public.expense_requests USING btree (id);

CREATE INDEX idx_accounts_user_id ON public.accounts USING btree (user_id);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);

CREATE INDEX idx_budgets_user_id ON public.budgets USING btree (user_id);

CREATE INDEX idx_categories_user_id ON public.categories USING btree (user_id);

CREATE INDEX idx_chatbot_messages_user_id ON public.chatbot_messages USING btree (user_id);

CREATE INDEX idx_conv_participants_conv_user ON public.conversation_participants USING btree (conversation_id, user_id);

CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants USING btree (user_id);

CREATE INDEX idx_cpa_clients_client_id ON public.cpa_clients USING btree (client_id);

CREATE INDEX idx_cpa_clients_cpa_id ON public.cpa_clients USING btree (cpa_id);

CREATE INDEX idx_documents_user ON public.documents USING btree (user_id);

CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id);

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_subscriptions_merchant ON public.subscriptions USING btree (merchant);

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);

CREATE INDEX idx_ticket_messages_user_id ON public.ticket_messages USING btree (user_id);

CREATE INDEX idx_tickets_assigned ON public.tickets USING btree (assigned_to);

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);

CREATE INDEX idx_tickets_user ON public.tickets USING btree (user_id);

CREATE INDEX idx_tickets_user_id ON public.tickets USING btree (user_id);

CREATE INDEX idx_transactions_category ON public.transactions USING btree (category_id);

CREATE INDEX idx_transactions_tax_deductible ON public.transactions USING btree (is_tax_deductible) WHERE (is_tax_deductible = true);

CREATE INDEX idx_transactions_user_date ON public.transactions USING btree (user_id, date);

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);

CREATE INDEX idx_user_secrets_user_id ON public.user_secrets USING btree (user_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX organization_members_pkey ON public.organization_members USING btree (id);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX ticket_messages_pkey ON public.ticket_messages USING btree (id);

CREATE UNIQUE INDEX tickets_pkey ON public.tickets USING btree (id);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX user_secrets_pkey ON public.user_secrets USING btree (id);

CREATE UNIQUE INDEX user_secrets_user_id_service_key ON public.user_secrets USING btree (user_id, service);

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."budgets" add constraint "budgets_pkey" PRIMARY KEY using index "budgets_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."chatbot_messages" add constraint "chatbot_messages_pkey" PRIMARY KEY using index "chatbot_messages_pkey";

alter table "public"."conversation_participants" add constraint "conversation_participants_pkey" PRIMARY KEY using index "conversation_participants_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."cpa_clients" add constraint "cpa_clients_pkey" PRIMARY KEY using index "cpa_clients_pkey";

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."expense_requests" add constraint "expense_requests_pkey" PRIMARY KEY using index "expense_requests_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."organization_members" add constraint "organization_members_pkey" PRIMARY KEY using index "organization_members_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."ticket_messages" add constraint "ticket_messages_pkey" PRIMARY KEY using index "ticket_messages_pkey";

alter table "public"."tickets" add constraint "tickets_pkey" PRIMARY KEY using index "tickets_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."user_secrets" add constraint "user_secrets_pkey" PRIMARY KEY using index "user_secrets_pkey";

alter table "public"."accounts" add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "accounts_user_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."budgets" add constraint "budgets_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE not valid;

alter table "public"."budgets" validate constraint "budgets_category_id_fkey";

alter table "public"."budgets" add constraint "budgets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."budgets" validate constraint "budgets_user_id_fkey";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.categories(id) not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."categories" add constraint "categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_user_id_fkey";

alter table "public"."chatbot_messages" add constraint "chatbot_messages_sender_check" CHECK ((sender = ANY (ARRAY['user'::text, 'ai'::text]))) not valid;

alter table "public"."chatbot_messages" validate constraint "chatbot_messages_sender_check";

alter table "public"."chatbot_messages" add constraint "chatbot_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chatbot_messages" validate constraint "chatbot_messages_user_id_fkey";

alter table "public"."conversation_participants" add constraint "conversation_participants_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_participants" validate constraint "conversation_participants_conversation_id_fkey";

alter table "public"."conversation_participants" add constraint "conversation_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_participants" validate constraint "conversation_participants_user_id_fkey";

alter table "public"."cpa_clients" add constraint "cpa_clients_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."cpa_clients" validate constraint "cpa_clients_client_id_fkey";

alter table "public"."cpa_clients" add constraint "cpa_clients_cpa_id_client_id_key" UNIQUE using index "cpa_clients_cpa_id_client_id_key";

alter table "public"."cpa_clients" add constraint "cpa_clients_cpa_id_fkey" FOREIGN KEY (cpa_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."cpa_clients" validate constraint "cpa_clients_cpa_id_fkey";

alter table "public"."documents" add constraint "documents_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_transaction_id_fkey";

alter table "public"."documents" add constraint "documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_user_id_fkey";

alter table "public"."expense_requests" add constraint "expense_requests_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) not valid;

alter table "public"."expense_requests" validate constraint "expense_requests_organization_id_fkey";

alter table "public"."expense_requests" add constraint "expense_requests_requester_id_fkey" FOREIGN KEY (requester_id) REFERENCES auth.users(id) not valid;

alter table "public"."expense_requests" validate constraint "expense_requests_requester_id_fkey";

alter table "public"."expense_requests" add constraint "expense_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."expense_requests" validate constraint "expense_requests_status_check";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."notifications" add constraint "notifications_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."notifications" validate constraint "notifications_created_by_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."organization_members" add constraint "organization_members_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_members" validate constraint "organization_members_organization_id_fkey";

alter table "public"."organization_members" add constraint "organization_members_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'manager'::text, 'member'::text]))) not valid;

alter table "public"."organization_members" validate constraint "organization_members_role_check";

alter table "public"."organization_members" add constraint "organization_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."organization_members" validate constraint "organization_members_user_id_fkey";

alter table "public"."organizations" add constraint "organizations_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) not valid;

alter table "public"."organizations" validate constraint "organizations_owner_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_frequency_check" CHECK ((frequency = ANY (ARRAY['monthly'::text, 'weekly'::text, 'yearly'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_frequency_check";

alter table "public"."subscriptions" add constraint "subscriptions_status_check" CHECK ((status = ANY (ARRAY['stable'::text, 'price_hike'::text, 'cancelled'::text]))) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_status_check";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."ticket_messages" add constraint "ticket_messages_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE not valid;

alter table "public"."ticket_messages" validate constraint "ticket_messages_ticket_id_fkey";

alter table "public"."ticket_messages" add constraint "ticket_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."ticket_messages" validate constraint "ticket_messages_user_id_fkey";

alter table "public"."tickets" add constraint "tickets_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."tickets" validate constraint "tickets_assigned_to_fkey";

alter table "public"."tickets" add constraint "tickets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."tickets" validate constraint "tickets_user_id_fkey";

alter table "public"."transactions" add constraint "chk_tax_category" CHECK ((tax_category = ANY (ARRAY['Marketing'::text, 'Travel'::text, 'Equipment'::text, 'Office Supplies'::text, 'Professional Services'::text, 'Meals'::text, 'Other'::text]))) not valid;

alter table "public"."transactions" validate constraint "chk_tax_category";

alter table "public"."transactions" add constraint "transactions_account_id_fkey" FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_account_id_fkey";

alter table "public"."transactions" add constraint "transactions_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL not valid;

alter table "public"."transactions" validate constraint "transactions_category_id_fkey";

alter table "public"."transactions" add constraint "transactions_parent_transaction_id_fkey" FOREIGN KEY (parent_transaction_id) REFERENCES public.transactions(id) not valid;

alter table "public"."transactions" validate constraint "transactions_parent_transaction_id_fkey";

alter table "public"."transactions" add constraint "transactions_transfer_account_id_fkey" FOREIGN KEY (transfer_account_id) REFERENCES public.accounts(id) not valid;

alter table "public"."transactions" validate constraint "transactions_transfer_account_id_fkey";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."user_secrets" add constraint "user_secrets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_secrets" validate constraint "user_secrets_user_id_fkey";

alter table "public"."user_secrets" add constraint "user_secrets_user_id_service_key" UNIQUE using index "user_secrets_user_id_service_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_create_conversation()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Simple check that user is authenticated
    RETURN auth.uid() IS NOT NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_is_member_secure(conversation_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conversation_uuid
    AND user_id = auth.uid()
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_stale_tickets()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.tickets
  WHERE status = 'closed' 
  AND updated_at < NOW() - INTERVAL '30 days';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_conversation_with_participant(p_type text DEFAULT 'direct'::text)
 RETURNS TABLE(conversation_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_id uuid := gen_random_uuid();
  allowed_types text[] := ARRAY['direct','group'];
BEGIN
  IF NOT (p_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'invalid conversation type: %', p_type;
  END IF;

  INSERT INTO public.conversations(id, type)
  VALUES (v_id, p_type);

  INSERT INTO public.conversation_participants(conversation_id, user_id)
  VALUES (v_id, (SELECT auth.uid()));

  RETURN QUERY SELECT v_id::uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_conversation_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_conversations()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'member' -- Default to member if no profile found
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_conversations()
 RETURNS TABLE(conversation_id uuid, type text, last_message_at timestamp with time zone, last_message_preview text, other_user_id uuid, other_first_name text, other_last_name text, other_email text, other_avatar_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.type,
        c.last_message_at,
        c.last_message_preview,
        p.id AS other_user_id,
        p.first_name,
        p.last_name,
        p.email,
        p.avatar_url
    FROM 
        conversation_participants cp
    JOIN 
        conversations c ON cp.conversation_id = c.id
    -- LEFT JOIN to support Group Chats where 'other' might be ambiguous, 
    -- but for Direct chats this correctly grabs the partner.
    LEFT JOIN 
        conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != auth.uid()
    LEFT JOIN 
        profiles p ON cp_other.user_id = p.id
    WHERE 
        cp.user_id = auth.uid()
    -- Deduplicate in case of multiple participants in groups
    GROUP BY c.id, p.id
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Insert notification for the recipient of the message
    -- We find the recipient by looking at conversation participants who are NOT the sender
    INSERT INTO public.notifications (user_id, type, title, message)
    SELECT user_id, 'message', 'New Message', 'You have a new secure message.'
    FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_ticket_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Notify user when status changes
    IF OLD.status != NEW.status THEN
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (NEW.user_id, 'ticket', 'Ticket Update', 'Your support ticket status is now: ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$ SELECT public.get_my_role() = 'admin' $function$
;

CREATE OR REPLACE FUNCTION public.is_conversation_member(conversation_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.conversation_participants 
        WHERE conversation_id = conversation_uuid 
        AND user_id = user_uuid
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_cpa_for_client(client_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.cpa_clients 
    WHERE cpa_id = auth.uid() AND client_id = client_uid AND status = 'active'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_member_of_conversation(check_conversation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = check_conversation_id
      AND user_id = (SELECT auth.uid())
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_staff()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid()
  AND role IN ('admin', 'support', 'cpa')
);
$function$
;

CREATE OR REPLACE FUNCTION public.is_support()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$ SELECT public.get_my_role() IN ('admin', 'support') $function$
;

CREATE OR REPLACE FUNCTION public.log_audit_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.sync_messages_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    NEW.content_encrypted := COALESCE(NEW.content_encrypted, NEW.content);
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = CASE 
      WHEN NEW.message_type = 'image' THEN '📷 Image'
      WHEN NEW.message_type = 'file' THEN '📎 File'
      ELSE LEFT(NEW.content, 50) -- Changed from content_encrypted to content to match your existing schema
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    -- Determine preview text based on message type
    last_message_preview = CASE 
      WHEN NEW.message_type = 'image' THEN '📷 Image'
      WHEN NEW.message_type = 'file' THEN '📎 File'
      -- Use content_encrypted if content is empty (legacy support)
      ELSE COALESCE(NEW.content, 'Message') 
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."accounts" to "anon";

grant insert on table "public"."accounts" to "anon";

grant references on table "public"."accounts" to "anon";

grant select on table "public"."accounts" to "anon";

grant trigger on table "public"."accounts" to "anon";

grant truncate on table "public"."accounts" to "anon";

grant update on table "public"."accounts" to "anon";

grant delete on table "public"."accounts" to "authenticated";

grant insert on table "public"."accounts" to "authenticated";

grant references on table "public"."accounts" to "authenticated";

grant select on table "public"."accounts" to "authenticated";

grant trigger on table "public"."accounts" to "authenticated";

grant truncate on table "public"."accounts" to "authenticated";

grant update on table "public"."accounts" to "authenticated";

grant delete on table "public"."accounts" to "service_role";

grant insert on table "public"."accounts" to "service_role";

grant references on table "public"."accounts" to "service_role";

grant select on table "public"."accounts" to "service_role";

grant trigger on table "public"."accounts" to "service_role";

grant truncate on table "public"."accounts" to "service_role";

grant update on table "public"."accounts" to "service_role";

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."budgets" to "anon";

grant insert on table "public"."budgets" to "anon";

grant references on table "public"."budgets" to "anon";

grant select on table "public"."budgets" to "anon";

grant trigger on table "public"."budgets" to "anon";

grant truncate on table "public"."budgets" to "anon";

grant update on table "public"."budgets" to "anon";

grant delete on table "public"."budgets" to "authenticated";

grant insert on table "public"."budgets" to "authenticated";

grant references on table "public"."budgets" to "authenticated";

grant select on table "public"."budgets" to "authenticated";

grant trigger on table "public"."budgets" to "authenticated";

grant truncate on table "public"."budgets" to "authenticated";

grant update on table "public"."budgets" to "authenticated";

grant delete on table "public"."budgets" to "service_role";

grant insert on table "public"."budgets" to "service_role";

grant references on table "public"."budgets" to "service_role";

grant select on table "public"."budgets" to "service_role";

grant trigger on table "public"."budgets" to "service_role";

grant truncate on table "public"."budgets" to "service_role";

grant update on table "public"."budgets" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."chatbot_messages" to "anon";

grant insert on table "public"."chatbot_messages" to "anon";

grant references on table "public"."chatbot_messages" to "anon";

grant select on table "public"."chatbot_messages" to "anon";

grant trigger on table "public"."chatbot_messages" to "anon";

grant truncate on table "public"."chatbot_messages" to "anon";

grant update on table "public"."chatbot_messages" to "anon";

grant delete on table "public"."chatbot_messages" to "authenticated";

grant insert on table "public"."chatbot_messages" to "authenticated";

grant references on table "public"."chatbot_messages" to "authenticated";

grant select on table "public"."chatbot_messages" to "authenticated";

grant trigger on table "public"."chatbot_messages" to "authenticated";

grant truncate on table "public"."chatbot_messages" to "authenticated";

grant update on table "public"."chatbot_messages" to "authenticated";

grant delete on table "public"."chatbot_messages" to "service_role";

grant insert on table "public"."chatbot_messages" to "service_role";

grant references on table "public"."chatbot_messages" to "service_role";

grant select on table "public"."chatbot_messages" to "service_role";

grant trigger on table "public"."chatbot_messages" to "service_role";

grant truncate on table "public"."chatbot_messages" to "service_role";

grant update on table "public"."chatbot_messages" to "service_role";

grant delete on table "public"."conversation_participants" to "anon";

grant insert on table "public"."conversation_participants" to "anon";

grant references on table "public"."conversation_participants" to "anon";

grant select on table "public"."conversation_participants" to "anon";

grant trigger on table "public"."conversation_participants" to "anon";

grant truncate on table "public"."conversation_participants" to "anon";

grant update on table "public"."conversation_participants" to "anon";

grant delete on table "public"."conversation_participants" to "authenticated";

grant insert on table "public"."conversation_participants" to "authenticated";

grant references on table "public"."conversation_participants" to "authenticated";

grant select on table "public"."conversation_participants" to "authenticated";

grant trigger on table "public"."conversation_participants" to "authenticated";

grant truncate on table "public"."conversation_participants" to "authenticated";

grant update on table "public"."conversation_participants" to "authenticated";

grant delete on table "public"."conversation_participants" to "service_role";

grant insert on table "public"."conversation_participants" to "service_role";

grant references on table "public"."conversation_participants" to "service_role";

grant select on table "public"."conversation_participants" to "service_role";

grant trigger on table "public"."conversation_participants" to "service_role";

grant truncate on table "public"."conversation_participants" to "service_role";

grant update on table "public"."conversation_participants" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."cpa_clients" to "anon";

grant insert on table "public"."cpa_clients" to "anon";

grant references on table "public"."cpa_clients" to "anon";

grant select on table "public"."cpa_clients" to "anon";

grant trigger on table "public"."cpa_clients" to "anon";

grant truncate on table "public"."cpa_clients" to "anon";

grant update on table "public"."cpa_clients" to "anon";

grant delete on table "public"."cpa_clients" to "authenticated";

grant insert on table "public"."cpa_clients" to "authenticated";

grant references on table "public"."cpa_clients" to "authenticated";

grant select on table "public"."cpa_clients" to "authenticated";

grant trigger on table "public"."cpa_clients" to "authenticated";

grant truncate on table "public"."cpa_clients" to "authenticated";

grant update on table "public"."cpa_clients" to "authenticated";

grant delete on table "public"."cpa_clients" to "service_role";

grant insert on table "public"."cpa_clients" to "service_role";

grant references on table "public"."cpa_clients" to "service_role";

grant select on table "public"."cpa_clients" to "service_role";

grant trigger on table "public"."cpa_clients" to "service_role";

grant truncate on table "public"."cpa_clients" to "service_role";

grant update on table "public"."cpa_clients" to "service_role";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

grant delete on table "public"."expense_requests" to "anon";

grant insert on table "public"."expense_requests" to "anon";

grant references on table "public"."expense_requests" to "anon";

grant select on table "public"."expense_requests" to "anon";

grant trigger on table "public"."expense_requests" to "anon";

grant truncate on table "public"."expense_requests" to "anon";

grant update on table "public"."expense_requests" to "anon";

grant delete on table "public"."expense_requests" to "authenticated";

grant insert on table "public"."expense_requests" to "authenticated";

grant references on table "public"."expense_requests" to "authenticated";

grant select on table "public"."expense_requests" to "authenticated";

grant trigger on table "public"."expense_requests" to "authenticated";

grant truncate on table "public"."expense_requests" to "authenticated";

grant update on table "public"."expense_requests" to "authenticated";

grant delete on table "public"."expense_requests" to "service_role";

grant insert on table "public"."expense_requests" to "service_role";

grant references on table "public"."expense_requests" to "service_role";

grant select on table "public"."expense_requests" to "service_role";

grant trigger on table "public"."expense_requests" to "service_role";

grant truncate on table "public"."expense_requests" to "service_role";

grant update on table "public"."expense_requests" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."organization_members" to "anon";

grant insert on table "public"."organization_members" to "anon";

grant references on table "public"."organization_members" to "anon";

grant select on table "public"."organization_members" to "anon";

grant trigger on table "public"."organization_members" to "anon";

grant truncate on table "public"."organization_members" to "anon";

grant update on table "public"."organization_members" to "anon";

grant delete on table "public"."organization_members" to "authenticated";

grant insert on table "public"."organization_members" to "authenticated";

grant references on table "public"."organization_members" to "authenticated";

grant select on table "public"."organization_members" to "authenticated";

grant trigger on table "public"."organization_members" to "authenticated";

grant truncate on table "public"."organization_members" to "authenticated";

grant update on table "public"."organization_members" to "authenticated";

grant delete on table "public"."organization_members" to "service_role";

grant insert on table "public"."organization_members" to "service_role";

grant references on table "public"."organization_members" to "service_role";

grant select on table "public"."organization_members" to "service_role";

grant trigger on table "public"."organization_members" to "service_role";

grant truncate on table "public"."organization_members" to "service_role";

grant update on table "public"."organization_members" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."ticket_messages" to "anon";

grant insert on table "public"."ticket_messages" to "anon";

grant references on table "public"."ticket_messages" to "anon";

grant select on table "public"."ticket_messages" to "anon";

grant trigger on table "public"."ticket_messages" to "anon";

grant truncate on table "public"."ticket_messages" to "anon";

grant update on table "public"."ticket_messages" to "anon";

grant delete on table "public"."ticket_messages" to "authenticated";

grant insert on table "public"."ticket_messages" to "authenticated";

grant references on table "public"."ticket_messages" to "authenticated";

grant select on table "public"."ticket_messages" to "authenticated";

grant trigger on table "public"."ticket_messages" to "authenticated";

grant truncate on table "public"."ticket_messages" to "authenticated";

grant update on table "public"."ticket_messages" to "authenticated";

grant delete on table "public"."ticket_messages" to "service_role";

grant insert on table "public"."ticket_messages" to "service_role";

grant references on table "public"."ticket_messages" to "service_role";

grant select on table "public"."ticket_messages" to "service_role";

grant trigger on table "public"."ticket_messages" to "service_role";

grant truncate on table "public"."ticket_messages" to "service_role";

grant update on table "public"."ticket_messages" to "service_role";

grant delete on table "public"."tickets" to "anon";

grant insert on table "public"."tickets" to "anon";

grant references on table "public"."tickets" to "anon";

grant select on table "public"."tickets" to "anon";

grant trigger on table "public"."tickets" to "anon";

grant truncate on table "public"."tickets" to "anon";

grant update on table "public"."tickets" to "anon";

grant delete on table "public"."tickets" to "authenticated";

grant insert on table "public"."tickets" to "authenticated";

grant references on table "public"."tickets" to "authenticated";

grant select on table "public"."tickets" to "authenticated";

grant trigger on table "public"."tickets" to "authenticated";

grant truncate on table "public"."tickets" to "authenticated";

grant update on table "public"."tickets" to "authenticated";

grant delete on table "public"."tickets" to "service_role";

grant insert on table "public"."tickets" to "service_role";

grant references on table "public"."tickets" to "service_role";

grant select on table "public"."tickets" to "service_role";

grant trigger on table "public"."tickets" to "service_role";

grant truncate on table "public"."tickets" to "service_role";

grant update on table "public"."tickets" to "service_role";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."user_secrets" to "anon";

grant insert on table "public"."user_secrets" to "anon";

grant references on table "public"."user_secrets" to "anon";

grant select on table "public"."user_secrets" to "anon";

grant trigger on table "public"."user_secrets" to "anon";

grant truncate on table "public"."user_secrets" to "anon";

grant update on table "public"."user_secrets" to "anon";

grant delete on table "public"."user_secrets" to "authenticated";

grant insert on table "public"."user_secrets" to "authenticated";

grant references on table "public"."user_secrets" to "authenticated";

grant select on table "public"."user_secrets" to "authenticated";

grant trigger on table "public"."user_secrets" to "authenticated";

grant truncate on table "public"."user_secrets" to "authenticated";

grant update on table "public"."user_secrets" to "authenticated";

grant delete on table "public"."user_secrets" to "service_role";

grant insert on table "public"."user_secrets" to "service_role";

grant references on table "public"."user_secrets" to "service_role";

grant select on table "public"."user_secrets" to "service_role";

grant trigger on table "public"."user_secrets" to "service_role";

grant truncate on table "public"."user_secrets" to "service_role";

grant update on table "public"."user_secrets" to "service_role";


  create policy "Allow full access to own records"
  on "public"."accounts"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Allow support/cpa access to client records"
  on "public"."accounts"
  as permissive
  for select
  to public
using ((public.is_support() OR public.is_cpa_for_client(user_id)));



  create policy "Manage Own Accounts"
  on "public"."accounts"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner manages accounts"
  on "public"."accounts"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users update own accounts"
  on "public"."accounts"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "View Client Accounts"
  on "public"."accounts"
  as permissive
  for select
  to public
using ((public.is_cpa_for_client(user_id) OR public.is_support()));



  create policy "View Own Accounts"
  on "public"."accounts"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "accounts_insert_auth"
  on "public"."accounts"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "accounts_select_auth"
  on "public"."accounts"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users update own audit_logs"
  on "public"."audit_logs"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "audit_logs_insert_auth"
  on "public"."audit_logs"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "audit_logs_select_auth"
  on "public"."audit_logs"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Allow all for owner"
  on "public"."budgets"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Allow full access to own records"
  on "public"."budgets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Allow support/cpa access to client records"
  on "public"."budgets"
  as permissive
  for select
  to public
using ((public.is_support() OR public.is_cpa_for_client(user_id)));



  create policy "Manage Own Budgets"
  on "public"."budgets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner access budgets"
  on "public"."budgets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner manages budgets"
  on "public"."budgets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users update own budgets"
  on "public"."budgets"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "View Client Budgets"
  on "public"."budgets"
  as permissive
  for select
  to public
using ((public.is_cpa_for_client(user_id) OR public.is_support()));



  create policy "View Own Budgets"
  on "public"."budgets"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "budgets_insert_auth"
  on "public"."budgets"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "budgets_select_auth"
  on "public"."budgets"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Manage own categories"
  on "public"."categories"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Read categories"
  on "public"."categories"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR (user_id IS NULL)));



  create policy "Users create categories"
  on "public"."categories"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users update own categories"
  on "public"."categories"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "View own and system categories"
  on "public"."categories"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR (user_id IS NULL)));



  create policy "Write categories"
  on "public"."categories"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "categories_insert_auth"
  on "public"."categories"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "categories_select_auth"
  on "public"."categories"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Owner access ai chat"
  on "public"."chatbot_messages"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users delete own AI chat"
  on "public"."chatbot_messages"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users insert own AI chat"
  on "public"."chatbot_messages"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users update own chatbot_messages"
  on "public"."chatbot_messages"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users view own AI chat"
  on "public"."chatbot_messages"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "chatbot_messages_insert_auth"
  on "public"."chatbot_messages"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "chatbot_messages_select_auth"
  on "public"."chatbot_messages"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Participants view their conversations"
  on "public"."conversation_participants"
  as permissive
  for select
  to public
using ((conversation_id IN ( SELECT public.get_my_conversation_ids() AS get_my_conversation_ids)));



  create policy "Users can add participants"
  on "public"."conversation_participants"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "View participants - owner only"
  on "public"."conversation_participants"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "allow_participant_insert"
  on "public"."conversation_participants"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "allow_participant_management"
  on "public"."conversation_participants"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "authenticated_users_full_access_participants"
  on "public"."conversation_participants"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "clean_participants_all"
  on "public"."conversation_participants"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "conversation_participants_allow_insert_self"
  on "public"."conversation_participants"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "conversation_participants_delete"
  on "public"."conversation_participants"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "conversation_participants_delete_own"
  on "public"."conversation_participants"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "conversation_participants_insert"
  on "public"."conversation_participants"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "conversation_participants_select"
  on "public"."conversation_participants"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "conversation_participants_select_own"
  on "public"."conversation_participants"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "conversation_participants_update"
  on "public"."conversation_participants"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "conversation_participants_update_own"
  on "public"."conversation_participants"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "participants_allow_all"
  on "public"."conversation_participants"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "participants_insert_policy"
  on "public"."conversation_participants"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "participants_select_policy"
  on "public"."conversation_participants"
  as permissive
  for select
  to public
using ((public.is_member_of_conversation(conversation_id) OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "simple_participant_policy"
  on "public"."conversation_participants"
  as permissive
  for all
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "users_manage_their_participation"
  on "public"."conversation_participants"
  as permissive
  for all
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can create conversations"
  on "public"."conversations"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Users can update their conversations"
  on "public"."conversations"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "Users view their conversations"
  on "public"."conversations"
  as permissive
  for select
  to public
using ((id IN ( SELECT public.get_my_conversation_ids() AS get_my_conversation_ids)));



  create policy "View own conversations"
  on "public"."conversations"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "allow_conversation_access"
  on "public"."conversations"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "allow_conversation_creation"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "authenticated_users_full_access"
  on "public"."conversations"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "clean_conversations_insert"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() IS NOT NULL));



  create policy "clean_conversations_select"
  on "public"."conversations"
  as permissive
  for select
  to authenticated
using (true);



  create policy "conversations_allow_all"
  on "public"."conversations"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "conversations_delete"
  on "public"."conversations"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "conversations_insert"
  on "public"."conversations"
  as permissive
  for insert
  to public
with check (true);



  create policy "conversations_insert_policy"
  on "public"."conversations"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "conversations_select"
  on "public"."conversations"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "conversations_select_policy"
  on "public"."conversations"
  as permissive
  for select
  to public
using (public.check_is_member_secure(id));



  create policy "conversations_update"
  on "public"."conversations"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "simple_conversation_insert"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "simple_conversation_select"
  on "public"."conversations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "users_can_create_conversations"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() IS NOT NULL));



  create policy "users_see_their_conversations"
  on "public"."conversations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = conversations.id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "Admins manage all links"
  on "public"."cpa_clients"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "Allow access based on role"
  on "public"."cpa_clients"
  as permissive
  for all
  to public
using ((public.is_admin() OR (auth.uid() = cpa_id) OR (auth.uid() = client_id)));



  create policy "CPA update as client"
  on "public"."cpa_clients"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = client_id))
with check ((( SELECT auth.uid() AS uid) = client_id));



  create policy "CPA update as cpa"
  on "public"."cpa_clients"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = cpa_id))
with check ((( SELECT auth.uid() AS uid) = cpa_id));



  create policy "CPAs manage links"
  on "public"."cpa_clients"
  as permissive
  for all
  to public
using ((cpa_id = auth.uid()));



  create policy "CPAs view their links"
  on "public"."cpa_clients"
  as permissive
  for select
  to public
using (((cpa_id = auth.uid()) OR (client_id = auth.uid())));



  create policy "cpa_clients_insert_auth"
  on "public"."cpa_clients"
  as permissive
  for insert
  to authenticated
with check (((client_id = ( SELECT auth.uid() AS uid)) OR (cpa_id = ( SELECT auth.uid() AS uid))));



  create policy "cpa_clients_select_auth"
  on "public"."cpa_clients"
  as permissive
  for select
  to authenticated
using (((client_id = ( SELECT auth.uid() AS uid)) OR (cpa_id = ( SELECT auth.uid() AS uid))));



  create policy "Allow full access to own records"
  on "public"."documents"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Allow support/cpa access to client records"
  on "public"."documents"
  as permissive
  for select
  to public
using ((public.is_support() OR public.is_cpa_for_client(user_id)));



  create policy "Manage Own Documents"
  on "public"."documents"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner access documents"
  on "public"."documents"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner manages documents"
  on "public"."documents"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users update own documents"
  on "public"."documents"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "View Client Documents"
  on "public"."documents"
  as permissive
  for select
  to public
using ((public.is_cpa_for_client(user_id) OR public.is_support()));



  create policy "View Own Documents"
  on "public"."documents"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "documents_insert_auth"
  on "public"."documents"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "documents_select_auth"
  on "public"."documents"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Insert messages"
  on "public"."messages"
  as permissive
  for insert
  to public
with check (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid()))))));



  create policy "View messages"
  on "public"."messages"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))));



  create policy "allow_message_management"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "authenticated_users_full_access_messages"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "clean_messages_all"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "messages_allow_all"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "messages_delete"
  on "public"."messages"
  as permissive
  for delete
  to public
using ((conversation_id IN ( SELECT conversation_participants.conversation_id
   FROM public.conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))));



  create policy "messages_delete_by_participant"
  on "public"."messages"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.conversation_id = messages.conversation_id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "messages_insert"
  on "public"."messages"
  as permissive
  for insert
  to public
with check ((conversation_id IN ( SELECT conversation_participants.conversation_id
   FROM public.conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))));



  create policy "messages_insert_by_sender"
  on "public"."messages"
  as permissive
  for insert
  to authenticated
with check ((sender_id = ( SELECT auth.uid() AS uid)));



  create policy "messages_insert_policy"
  on "public"."messages"
  as permissive
  for insert
  to public
with check (public.check_is_member_secure(conversation_id));



  create policy "messages_insert_sender_is_participant"
  on "public"."messages"
  as permissive
  for insert
  to authenticated
with check (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.conversation_id = cp.conversation_id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "messages_policy"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
with check (((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))) AND (sender_id = auth.uid())));



  create policy "messages_select"
  on "public"."messages"
  as permissive
  for select
  to public
using ((conversation_id IN ( SELECT conversation_participants.conversation_id
   FROM public.conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))));



  create policy "messages_select_by_participant"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.conversation_id = messages.conversation_id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "messages_select_for_participants"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.conversation_id = messages.conversation_id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "messages_select_policy"
  on "public"."messages"
  as permissive
  for select
  to public
using (public.check_is_member_secure(conversation_id));



  create policy "messages_update"
  on "public"."messages"
  as permissive
  for update
  to public
using ((conversation_id IN ( SELECT conversation_participants.conversation_id
   FROM public.conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))))
with check ((conversation_id IN ( SELECT conversation_participants.conversation_id
   FROM public.conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))));



  create policy "messages_update_by_sender"
  on "public"."messages"
  as permissive
  for update
  to authenticated
using (((sender_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.conversation_id = messages.conversation_id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))))
with check ((sender_id = ( SELECT auth.uid() AS uid)));



  create policy "users_manage_messages_in_their_conversations"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))))
with check (((EXISTS ( SELECT 1
   FROM public.conversation_participants
  WHERE ((conversation_participants.conversation_id = messages.conversation_id) AND (conversation_participants.user_id = auth.uid())))) AND (sender_id = auth.uid())));



  create policy "Insert notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (true);



  create policy "Update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can access their own notifications"
  on "public"."notifications"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users see own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "Users view own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "anyone_can_insert_notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (true);



  create policy "authenticated_users_full_access_notifications"
  on "public"."notifications"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "notifications_admin_access"
  on "public"."notifications"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "notifications_insert_auth"
  on "public"."notifications"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_insert_authenticated"
  on "public"."notifications"
  as permissive
  for insert
  to authenticated
with check ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "notifications_select_auth"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_select_own"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_update_own"
  on "public"."notifications"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "users_select_own_notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own orgs"
  on "public"."organizations"
  as permissive
  for select
  to public
using ((auth.uid() IN ( SELECT organization_members.user_id
   FROM public.organization_members
  WHERE (organization_members.organization_id = organizations.id))));



  create policy "Admins update any profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Admins/Support view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (public.is_support());



  create policy "Allow profile access based on role"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR public.is_support() OR public.is_cpa_for_client(id)));



  create policy "Allow profile update based on role"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.uid() = id) OR public.is_admin()));



  create policy "CPAs view assigned clients"
  on "public"."profiles"
  as permissive
  for select
  to public
using (public.is_cpa_for_client(id));



  create policy "Enable insert for users based on user_id"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.uid() = id) OR public.is_admin()));



  create policy "Users view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR public.is_support()));



  create policy "admin_see_all_profiles"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "allow_profile_access"
  on "public"."profiles"
  as permissive
  for all
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "allow_profile_creation"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = id));



  create policy "clean_profiles_insert"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = id));



  create policy "clean_profiles_update"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "profiles_admin_access"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "profiles_insert_policy"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = id));



  create policy "role_change_admin_only"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles admin_profile
  WHERE ((admin_profile.id = auth.uid()) AND (admin_profile.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles admin_profile
  WHERE ((admin_profile.id = auth.uid()) AND (admin_profile.role = 'admin'::public.user_role)))));



  create policy "user_manage_own_profile"
  on "public"."profiles"
  as permissive
  for all
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "user_own_profile"
  on "public"."profiles"
  as permissive
  for all
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Users can delete own subscriptions"
  on "public"."subscriptions"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own subscriptions"
  on "public"."subscriptions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can insert their own subscriptions"
  on "public"."subscriptions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own subscriptions"
  on "public"."subscriptions"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can update their own subscriptions"
  on "public"."subscriptions"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own subscriptions"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can view their own subscriptions"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Allow message access based on role"
  on "public"."ticket_messages"
  as permissive
  for select
  to public
using ((public.is_support() OR (EXISTS ( SELECT 1
   FROM public.tickets t
  WHERE ((t.id = ticket_messages.ticket_id) AND (t.user_id = auth.uid()))))));



  create policy "Allow message inserts based on role"
  on "public"."ticket_messages"
  as permissive
  for insert
  to public
with check ((public.is_support() OR (EXISTS ( SELECT 1
   FROM public.tickets t
  WHERE ((t.id = ticket_messages.ticket_id) AND (t.user_id = auth.uid()))))));



  create policy "Filter Internal Notes"
  on "public"."ticket_messages"
  as restrictive
  for select
  to public
using (((NOT is_internal) OR public.is_support()));



  create policy "Internal notes are restricted"
  on "public"."ticket_messages"
  as restrictive
  for select
  to public
using (((NOT is_internal) OR public.is_support()));



  create policy "Staff post messages"
  on "public"."ticket_messages"
  as permissive
  for insert
  to public
with check (public.is_support());



  create policy "Users post messages"
  on "public"."ticket_messages"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_messages.ticket_id) AND (tickets.user_id = auth.uid())))));



  create policy "Users update own ticket_messages"
  on "public"."ticket_messages"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "View ticket messages"
  on "public"."ticket_messages"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_messages.ticket_id) AND (tickets.user_id = auth.uid())))) OR public.is_support()));



  create policy "insert_messages"
  on "public"."ticket_messages"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_messages.ticket_id) AND (tickets.user_id = auth.uid())))) OR public.is_staff()));



  create policy "ticket_messages_insert_auth"
  on "public"."ticket_messages"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "ticket_messages_select_auth"
  on "public"."ticket_messages"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "view_messages"
  on "public"."ticket_messages"
  as permissive
  for select
  to public
using ((((EXISTS ( SELECT 1
   FROM public.tickets
  WHERE ((tickets.id = ticket_messages.ticket_id) AND (tickets.user_id = auth.uid())))) AND (is_internal = false)) OR public.is_staff()));



  create policy "Allow access based on role"
  on "public"."tickets"
  as permissive
  for all
  to public
using (((auth.uid() = user_id) OR public.is_support()));



  create policy "Staff view all tickets"
  on "public"."tickets"
  as permissive
  for all
  to public
using (public.is_support());



  create policy "Users create tickets"
  on "public"."tickets"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users update own tickets"
  on "public"."tickets"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users view own tickets"
  on "public"."tickets"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "authenticated_users_full_access_tickets"
  on "public"."tickets"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "staff_delete_tickets"
  on "public"."tickets"
  as permissive
  for delete
  to public
using (public.is_staff());



  create policy "tickets_admin_full_access"
  on "public"."tickets"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tickets_insert_auth"
  on "public"."tickets"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "tickets_select_auth"
  on "public"."tickets"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "users_create_own_tickets"
  on "public"."tickets"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "users_update_own_tickets"
  on "public"."tickets"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR public.is_staff()));



  create policy "users_view_own_tickets"
  on "public"."tickets"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_staff()));



  create policy "Allow all for owner"
  on "public"."transactions"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Allow full access to own records"
  on "public"."transactions"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Allow support/cpa access to client records"
  on "public"."transactions"
  as permissive
  for select
  to public
using ((public.is_support() OR public.is_cpa_for_client(user_id)));



  create policy "Manage Own Financials"
  on "public"."transactions"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner access transactions"
  on "public"."transactions"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner manages transactions"
  on "public"."transactions"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete own transactions"
  on "public"."transactions"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own transactions"
  on "public"."transactions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own transactions"
  on "public"."transactions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users update own transactions"
  on "public"."transactions"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "View Client Financials"
  on "public"."transactions"
  as permissive
  for select
  to public
using ((public.is_cpa_for_client(user_id) OR public.is_support()));



  create policy "View Own Financials"
  on "public"."transactions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "transactions_insert_auth"
  on "public"."transactions"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "transactions_select_auth"
  on "public"."transactions"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Owner access secrets"
  on "public"."user_secrets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Owner manages secrets"
  on "public"."user_secrets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users can manage their own secrets"
  on "public"."user_secrets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users manage own secrets"
  on "public"."user_secrets"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Users update own user_secrets"
  on "public"."user_secrets"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "user_secrets_insert_auth"
  on "public"."user_secrets"
  as permissive
  for insert
  to authenticated
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "user_secrets_select_auth"
  on "public"."user_secrets"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER messages_content_sync_trigger BEFORE INSERT OR UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.sync_messages_content();

CREATE TRIGGER on_message_insert AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

CREATE TRIGGER on_new_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();

CREATE TRIGGER update_conv_timestamp AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

CREATE TRIGGER audit_profiles AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_ticket_update AFTER UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.handle_ticket_update();

CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER audit_transactions AFTER INSERT OR DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER audit_secrets AFTER INSERT OR DELETE OR UPDATE ON public.user_secrets FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow read access for conversation participants"
  on "realtime"."messages"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.user_id = auth.uid()) AND ((cp.conversation_id)::text = split_part(messages.topic, ':'::text, 2))))));



  create policy "Allow write access for conversation participants"
  on "realtime"."messages"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.user_id = auth.uid()) AND ((cp.conversation_id)::text = split_part(messages.topic, ':'::text, 2))))));



  create policy "Authenticated Delete Avatars"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "Authenticated Update Avatars"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "Authenticated Upload Avatars"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'avatars'::text));



  create policy "Avatar Select"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Avatar Update Own"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Avatar Update"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Avatar Upload Auth"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Avatar Upload"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Avatar View Public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Avatars are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Chat Uploads"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'chat-uploads'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Chat Views"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'chat-uploads'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Public Read Avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Upload chat images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'chat-images'::text) AND (auth.uid() IS NOT NULL)));



  create policy "Users can delete their own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));



  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));



  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));



  create policy "Users delete own documents"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'documents'::text) AND (auth.uid() = owner)));



  create policy "Users upload own documents"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'documents'::text) AND (auth.uid() = owner)));



  create policy "Users view own documents"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'documents'::text) AND (auth.uid() = owner)));



  create policy "Users view own reports"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'reports'::text) AND (auth.uid() = owner)));



  create policy "View chat images"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'chat-images'::text) AND (auth.uid() IS NOT NULL)));




