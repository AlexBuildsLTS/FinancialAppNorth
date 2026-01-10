-- ============================================================================
-- Add foreign key from expense_requests.requester_id to profiles.id
-- This enables Supabase PostgREST to automatically join expense_requests with profiles
-- ============================================================================

-- Add the foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    -- Check if the foreign key already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'expense_requests_requester_id_profiles_fkey'
        AND table_name = 'expense_requests'
    ) THEN
        -- Add foreign key from expense_requests.requester_id to profiles.id
        -- Note: This assumes profiles.id matches auth.users.id (which it should)
        ALTER TABLE expense_requests
        ADD CONSTRAINT expense_requests_requester_id_profiles_fkey
        FOREIGN KEY (requester_id) 
        REFERENCES profiles(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

