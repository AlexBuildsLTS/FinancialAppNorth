-- ============================================================================
-- 🔧 FIX: Organizations RLS Circular Dependency (CRITICAL FIX)
-- ============================================================================
-- The original policy had a circular reference that caused 500 errors.
-- This fixes it by using SECURITY DEFINER functions to bypass RLS checks.
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own orgs" ON organizations;
DROP POLICY IF EXISTS "Members can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;

-- Create a SECURITY DEFINER function to check membership (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_is_org_member(org_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = org_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Owners can always see their orgs (no circular dependency)
CREATE POLICY "Owners can view their orgs" ON organizations
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = owner_id);

-- Members can view orgs they belong to (using function to avoid circular ref)
CREATE POLICY "Members can view their orgs" ON organizations
    FOR SELECT 
    TO authenticated
    USING (public.user_is_org_member(id));

-- Fix organization_members SELECT policy
CREATE POLICY "Users can view org members" ON organization_members
    FOR SELECT 
    TO authenticated
    USING (
        auth.uid() = user_id
        OR
        public.user_is_org_member(organization_id)
    );

