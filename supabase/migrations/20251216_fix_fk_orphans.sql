-- ============================================================================
-- 🔧 NORTHFINANCE: FIX FOREIGN KEY ORPHANS
-- ============================================================================
-- This migration fixes orphaned foreign key records identified by the scan:
-- 1. audit_logs.organization_id (256 orphans)
-- 2. notifications.created_by (105 orphans)
-- 3. audit_logs.user_id (21 orphans)
-- 4. categories.parent_id (15 orphans)
-- 5. transactions.transfer_account_id (14 orphans)
-- 6. transactions.parent_transaction_id (14 orphans)
-- ============================================================================

-- ============================================================================
-- STEP 1: Fix audit_logs.organization_id (256 orphans)
-- ============================================================================
-- Set orphaned organization_id to NULL (safe - preserves audit trail)
UPDATE public.audit_logs
SET organization_id = NULL
WHERE organization_id IS NOT NULL
  AND organization_id NOT IN (SELECT id FROM public.organizations);

-- Update FK constraint to use ON DELETE SET NULL if not already set
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'audit_logs_organization_id_fkey'
    ) THEN
        ALTER TABLE public.audit_logs
        DROP CONSTRAINT audit_logs_organization_id_fkey;
    END IF;
    
    -- Recreate with ON DELETE SET NULL
    ALTER TABLE public.audit_logs
    ADD CONSTRAINT audit_logs_organization_id_fkey 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organizations(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated audit_logs.organization_id FK with ON DELETE SET NULL';
END $$;

-- ============================================================================
-- STEP 2: Fix audit_logs.user_id (21 orphans)
-- ============================================================================
-- Set orphaned user_id to NULL (safe - preserves audit trail)
UPDATE public.audit_logs
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT id FROM public.profiles);

-- Update FK constraint to use ON DELETE SET NULL if not already set
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'audit_logs_user_id_fkey'
    ) THEN
        ALTER TABLE public.audit_logs
        DROP CONSTRAINT audit_logs_user_id_fkey;
    END IF;
    
    -- Recreate with ON DELETE SET NULL
    ALTER TABLE public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated audit_logs.user_id FK with ON DELETE SET NULL';
END $$;

-- ============================================================================
-- STEP 3: Fix notifications.created_by (105 orphans)
-- ============================================================================
-- Check if notifications table exists and has created_by column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications' 
        AND column_name = 'created_by'
    ) THEN
        -- Set orphaned created_by to NULL
        EXECUTE '
            UPDATE public.notifications
            SET created_by = NULL
            WHERE created_by IS NOT NULL
              AND created_by NOT IN (SELECT id FROM public.profiles)
        ';
        
        -- Update FK constraint to use ON DELETE SET NULL
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND constraint_name = 'notifications_created_by_fkey'
        ) THEN
            ALTER TABLE public.notifications
            DROP CONSTRAINT notifications_created_by_fkey;
        END IF;
        
        ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_created_by_fkey 
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Fixed notifications.created_by orphans and updated FK';
    ELSE
        RAISE NOTICE 'notifications.created_by column does not exist, skipping';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Fix categories.parent_id (15 orphans)
-- ============================================================================
-- Set orphaned parent_id to NULL (categories can exist without parent)
UPDATE public.categories
SET parent_id = NULL
WHERE parent_id IS NOT NULL
  AND parent_id NOT IN (SELECT id FROM public.categories);

-- Update FK constraint to use ON DELETE SET NULL if not already set
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'categories_parent_id_fkey'
    ) THEN
        ALTER TABLE public.categories
        DROP CONSTRAINT categories_parent_id_fkey;
    END IF;
    
    ALTER TABLE public.categories
    ADD CONSTRAINT categories_parent_id_fkey 
    FOREIGN KEY (parent_id) 
    REFERENCES public.categories(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated categories.parent_id FK with ON DELETE SET NULL';
END $$;

-- ============================================================================
-- STEP 5: Fix transactions.transfer_account_id (14 orphans)
-- ============================================================================
-- Set orphaned transfer_account_id to NULL (transfer transactions can exist without target account)
UPDATE public.transactions
SET transfer_account_id = NULL
WHERE transfer_account_id IS NOT NULL
  AND transfer_account_id NOT IN (SELECT id FROM public.accounts);

-- Update FK constraint to use ON DELETE SET NULL if not already set
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'transactions_transfer_account_id_fkey'
    ) THEN
        ALTER TABLE public.transactions
        DROP CONSTRAINT transactions_transfer_account_id_fkey;
    END IF;
    
    ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_transfer_account_id_fkey 
    FOREIGN KEY (transfer_account_id) 
    REFERENCES public.accounts(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated transactions.transfer_account_id FK with ON DELETE SET NULL';
END $$;

-- ============================================================================
-- STEP 6: Fix transactions.parent_transaction_id (14 orphans)
-- ============================================================================
-- Set orphaned parent_transaction_id to NULL (transactions can exist without parent)
UPDATE public.transactions
SET parent_transaction_id = NULL
WHERE parent_transaction_id IS NOT NULL
  AND parent_transaction_id NOT IN (SELECT id FROM public.transactions);

-- Update FK constraint to use ON DELETE SET NULL if not already set
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'transactions_parent_transaction_id_fkey'
    ) THEN
        ALTER TABLE public.transactions
        DROP CONSTRAINT transactions_parent_transaction_id_fkey;
    END IF;
    
    ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_parent_transaction_id_fkey 
    FOREIGN KEY (parent_transaction_id) 
    REFERENCES public.transactions(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Updated transactions.parent_transaction_id FK with ON DELETE SET NULL';
END $$;

-- ============================================================================
-- VERIFICATION: Count remaining orphans (should be 0 after this migration)
-- ============================================================================
DO $$
DECLARE
    audit_org_orphans INT;
    audit_user_orphans INT;
    notif_orphans INT;
    cat_orphans INT;
    trans_transfer_orphans INT;
    trans_parent_orphans INT;
BEGIN
    -- Count remaining orphans
    SELECT COUNT(*) INTO audit_org_orphans
    FROM public.audit_logs
    WHERE organization_id IS NOT NULL
      AND organization_id NOT IN (SELECT id FROM public.organizations);
    
    SELECT COUNT(*) INTO audit_user_orphans
    FROM public.audit_logs
    WHERE user_id IS NOT NULL
      AND user_id NOT IN (SELECT id FROM public.profiles);
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'notifications' 
               AND column_name = 'created_by') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.notifications 
                 WHERE created_by IS NOT NULL
                   AND created_by NOT IN (SELECT id FROM public.profiles)' 
        INTO notif_orphans;
    ELSE
        notif_orphans := 0;
    END IF;
    
    SELECT COUNT(*) INTO cat_orphans
    FROM public.categories
    WHERE parent_id IS NOT NULL
      AND parent_id NOT IN (SELECT id FROM public.categories);
    
    SELECT COUNT(*) INTO trans_transfer_orphans
    FROM public.transactions
    WHERE transfer_account_id IS NOT NULL
      AND transfer_account_id NOT IN (SELECT id FROM public.accounts);
    
    SELECT COUNT(*) INTO trans_parent_orphans
    FROM public.transactions
    WHERE parent_transaction_id IS NOT NULL
      AND parent_transaction_id NOT IN (SELECT id FROM public.transactions);
    
    -- Report results
    RAISE NOTICE '=== ORPHAN FIX VERIFICATION ===';
    RAISE NOTICE 'audit_logs.organization_id orphans: %', audit_org_orphans;
    RAISE NOTICE 'audit_logs.user_id orphans: %', audit_user_orphans;
    RAISE NOTICE 'notifications.created_by orphans: %', notif_orphans;
    RAISE NOTICE 'categories.parent_id orphans: %', cat_orphans;
    RAISE NOTICE 'transactions.transfer_account_id orphans: %', trans_transfer_orphans;
    RAISE NOTICE 'transactions.parent_transaction_id orphans: %', trans_parent_orphans;
    RAISE NOTICE '================================';
END $$;

