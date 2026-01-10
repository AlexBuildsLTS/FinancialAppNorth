/*
  # TITAN 4: SCENARIO PLANNING ENGINE
  # -----------------------------------------------------------------------------
  # Enables "What-If" analysis by separating hypothetical data from actuals.
  # Includes tables for Scenarios, Drivers (variables), and Cached Results.
*/

-- 1. Create Scenarios Table (The "Parallel Universes")
CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- Optional: For enterprise sharing
    name TEXT NOT NULL,
    description TEXT,
    is_baseline BOOLEAN DEFAULT false, -- If true, this is the "Real" budget copy
    status TEXT CHECK (status IN ('active', 'archived', 'draft')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Scenario Drivers Table (The "Levers" you pull)
-- Examples: "Inflation Rate", "Hiring Delay (Months)", "Marketing Spend Multiplier"
CREATE TABLE IF NOT EXISTS public.scenario_drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,          -- Display Name: "Revenue Growth"
    key TEXT NOT NULL,           -- Code Reference: "revenue_growth_pct"
    value NUMERIC NOT NULL,      -- The tweaked value: 0.15 (15%)
    default_value NUMERIC,       -- The original value: 0.05 (5%)
    unit TEXT CHECK (unit IN ('percent', 'currency', 'count', 'months')) DEFAULT 'percent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Scenario Results Table (The "Crystal Ball")
-- Stores the calculated outcome so you don't have to re-run math every time you load the page.
CREATE TABLE IF NOT EXISTS public.scenario_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE NOT NULL,
    metric_name TEXT NOT NULL,   -- e.g., "Net Income", "Runway"
    period_date DATE NOT NULL,   -- e.g., '2025-01-01'
    projected_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (Titan Security Standard)
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_results ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies (Strict Ownership)

-- Scenarios: Users can only see/edit their own
CREATE POLICY "Users can manage their own scenarios" 
ON public.scenarios
FOR ALL 
USING (auth.uid() = user_id);

-- Drivers: Inherit access from the parent scenario
CREATE POLICY "Users can manage drivers for their scenarios" 
ON public.scenario_drivers
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.scenarios s 
        WHERE s.id = scenario_drivers.scenario_id 
        AND s.user_id = auth.uid()
    )
);

-- Results: Inherit access from the parent scenario
CREATE POLICY "Users can view results for their scenarios" 
ON public.scenario_results
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.scenarios s 
        WHERE s.id = scenario_results.scenario_id 
        AND s.user_id = auth.uid()
    )
);

-- 6. Indexes for High-Performance Querying (Titan Speed)
CREATE INDEX IF NOT EXISTS idx_scenarios_user ON public.scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_scenario ON public.scenario_drivers(scenario_id);
CREATE INDEX IF NOT EXISTS idx_results_scenario ON public.scenario_results(scenario_id);

-- 7. Trigger to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scenarios_modtime
    BEFORE UPDATE ON public.scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Seed Default "Optimistic" & "Pessimistic" Scenarios Logic (Optional Helper)
-- This function allows the frontend to quickly clone the current state into a new scenario
CREATE OR REPLACE FUNCTION public.clone_scenario(original_scenario_id UUID, new_name TEXT)
RETURNS UUID AS $$
DECLARE
    new_scenario_id UUID;
BEGIN
    -- Insert new scenario
    INSERT INTO public.scenarios (user_id, organization_id, name, description, is_baseline)
    SELECT user_id, organization_id, new_name, 'Cloned from ' || name, false
    FROM public.scenarios
    WHERE id = original_scenario_id
    RETURNING id INTO new_scenario_id;

    -- Clone drivers
    INSERT INTO public.scenario_drivers (scenario_id, name, key, value, default_value, unit)
    SELECT new_scenario_id, name, key, value, default_value, unit
    FROM public.scenario_drivers
    WHERE scenario_id = original_scenario_id;

    RETURN new_scenario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;