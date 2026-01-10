-- ============================================================================
-- 🏛️ NORTHFINANCE: ENTERPRISE & MESSAGING SCHEMA MIGRATION
-- ============================================================================
-- Financial Operating System (FOS) Foundation
-- Creates enterprise multi-tenancy tables and enhances messaging system
-- ============================================================================
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------
-- 1. Enterprise Tables (Titan 3)
-----------------------------------

-- Organizations: Core multi-tenant structure
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    owner_id UUID REFERENCES auth.users NOT NULL
);

-- Organization Members: RBAC foundation
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, user_id) -- Prevent duplicate memberships
);

-- Expense Requests: Corporate spend management
CREATE TABLE IF NOT EXISTS expense_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    requester_id UUID REFERENCES auth.users,
    amount NUMERIC NOT NULL,
    merchant TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Audit Logs: Compliance-grade immutable record
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users,
    action TEXT NOT NULL, -- e.g., "deleted_transaction", "invited_user", "request_approved"
    details JSONB,         -- Store what changed (flexible structure)
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-----------------------------------
-- 2. Update Messages Table (Titan 1)
-----------------------------------

-- Add message_type and file_url columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'file_url') THEN
        ALTER TABLE messages ADD COLUMN file_url TEXT;
    END IF;
END $$;

-----------------------------------
-- 3. RLS Policies (Row Level Security)
-----------------------------------

-- Enable RLS on all enterprise tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view orgs they belong to
DROP POLICY IF EXISTS "Users can view own orgs" ON organizations;
CREATE POLICY "Users can view own orgs" ON organizations
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = organizations.id)
        OR auth.uid() = owner_id
    );

-- Organization Members: Users can view members of their orgs
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
CREATE POLICY "Users can view org members" ON organization_members
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = organization_members.organization_id)
    );

-- Expense Requests: Requesters can view their own, Managers can view pending
DROP POLICY IF EXISTS "Users can view expense requests" ON expense_requests;
CREATE POLICY "Users can view expense requests" ON expense_requests
    FOR SELECT USING (
        requester_id = auth.uid()
        OR auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = expense_requests.organization_id 
            AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Audit Logs: Admin/Owner only (strict compliance)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM organization_members 
            WHERE organization_id = audit_logs.organization_id 
            AND role IN ('owner', 'admin')
        )
    );

-----------------------------------
-- 4. Indexes for Performance
-----------------------------------

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_expense_requests_org_id ON expense_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_expense_requests_requester ON expense_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_expense_requests_status ON expense_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-----------------------------------
-- 5. Storage Bucket Configuration
-----------------------------------

-- MANDATE: Create a new Supabase Storage Bucket named 'chat-images'
-- in the Storage section of your Supabase dashboard.
-- 
-- Steps:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: "chat-images"
-- 4. Public: false (Private bucket for security)
-- 5. File size limit: 10MB (adjust as needed)
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- Your Financial Operating System (FOS) foundation is now ready.
-- Next steps:
-- 1. Create the 'chat-images' storage bucket (see instructions above)
-- 2. Test organization creation via the UI
-- 3. Verify RLS policies are working correctly
-- ============================================================================

