-- ============================================================================
-- 🔧 FINAL FIX: Organizations RLS - Complete Solution
-- ============================================================================
-- This completely fixes the 500 errors by using a simpler, non-circular approach
-- ============================================================================

-- Step 1: Drop ALL existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own orgs" ON organizations;
DROP POLICY IF EXISTS "Members can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;

-- Step 2: Drop the function if it exists (we'll recreate it better)
DROP FUNCTION IF EXISTS public.user_is_org_member(uuid);

-- Step 3: Create a SECURITY DEFINER function that bypasses RLS completely
CREATE OR REPLACE FUNCTION public.user_is_org_member(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid()
    );
END;
$$;

-- Step 4: Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_is_org_member(uuid) TO authenticated;

-- Step 5: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Owners can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Members can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;

-- Create SELECT policy for organizations (owners first, then members)
CREATE POLICY "Owners can view their orgs" ON organizations
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Members can view their orgs" ON organizations
    FOR SELECT 
    TO authenticated
    USING (public.user_is_org_member(id));

-- Step 6: Create SELECT policy for organization_members
CREATE POLICY "Users can view org members" ON organization_members
    FOR SELECT 
    TO authenticated
    USING (
        auth.uid() = user_id
        OR
        public.user_is_org_member(organization_id)
    );

-- Step 7: Ensure INSERT policies exist (from previous migration)
-- These should already exist, but ensure they're there
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND policyname = 'Users can create organizations'
    ) THEN
        CREATE POLICY "Users can create organizations" ON organizations
            FOR INSERT 
            TO authenticated
            WITH CHECK (auth.uid() = owner_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organization_members' 
        AND policyname = 'Users can add themselves to orgs'
    ) THEN
        CREATE POLICY "Users can add themselves to orgs" ON organization_members
            FOR INSERT 
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

