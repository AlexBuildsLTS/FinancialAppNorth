-- ============================================================================
-- 🔧 FIX: Organizations INSERT Policy
-- ============================================================================
-- Allows authenticated users to create organizations (they become the owner)
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Create INSERT policy: Any authenticated user can create an org (they become owner)
CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Also allow INSERT for organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can add themselves to orgs" ON organization_members;
CREATE POLICY "Users can add themselves to orgs" ON organization_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

