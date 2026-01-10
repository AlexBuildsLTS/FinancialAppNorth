-- ============================================================================
-- 🔧 NORTHFINANCE: FIX AUDIT_LOGS.ORGANIZATION_ID (Safe Migration)
-- ============================================================================
-- This migration safely adds organization_id to existing audit_logs table
-- and updates RLS policies. Non-destructive and safe to run.
-- ============================================================================

-- Step 1: Add organization_id column (nullable, safe for existing data)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs' 
        AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.audit_logs 
        ADD COLUMN organization_id UUID;
        
        RAISE NOTICE 'Added organization_id column to audit_logs';
    ELSE
        RAISE NOTICE 'organization_id column already exists in audit_logs';
    END IF;
END $$;

-- Step 2: Add foreign key constraint (only if organizations table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        -- Check if FK constraint already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND constraint_name = 'audit_logs_organization_id_fkey'
        ) THEN
            ALTER TABLE public.audit_logs
            ADD CONSTRAINT audit_logs_organization_id_fkey 
            FOREIGN KEY (organization_id) 
            REFERENCES public.organizations(id) 
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Added foreign key constraint on audit_logs.organization_id';
        ELSE
            RAISE NOTICE 'Foreign key constraint already exists';
        END IF;
    ELSE
        RAISE NOTICE 'organizations table does not exist, skipping FK constraint';
    END IF;
END $$;

-- Step 3: Update RLS Policy for audit_logs (handles both with and without org_id)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- Policy: Admins/Owners can view audit logs for their organization
-- Also allows viewing logs without organization_id (for backward compatibility)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        -- If log has organization_id, check if user is admin/owner of that org
        (
            organization_id IS NULL 
            OR auth.uid() IN (
                SELECT user_id FROM public.organization_members 
                WHERE organization_id = audit_logs.organization_id 
                AND role IN ('owner', 'admin')
            )
        )
        -- Also allow if user created the log (for personal audit logs)
        OR user_id = auth.uid()
    );

-- Step 4: Create index for performance (if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs' 
        AND column_name = 'organization_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id 
        ON public.audit_logs(organization_id);
        
        RAISE NOTICE 'Created index on audit_logs.organization_id';
    END IF;
END $$;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- The audit_logs table now has organization_id column (nullable).
-- Existing audit logs will have NULL organization_id (safe).
-- New audit logs can be linked to organizations for multi-tenant compliance.
-- ============================================================================




