import { Database } from '../lib/database.types';

// --- SUPABASE HELPERS ---
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

/**
 * 🌍 SCENARIO ENUMS
 * Defines the strict values allowed for status and measurement units.
 */
export type ScenarioStatus = 'active' | 'archived' | 'draft';

export type DriverUnit = 'percent' | 'currency' | 'count' | 'months';

/**
 * 🔮 SCENARIO (The Parallel Universe)
 * Represents a high-level "What-If" container.
 * Maps to DB table: public.scenarios
 */
export interface Scenario {
  id: string;
  user_id: string;
  organization_id?: string | null;
  name: string;
  description?: string | null;
  is_baseline: boolean; // True = "Actuals", False = "Simulation"
  status: ScenarioStatus;
  created_at: string;
  updated_at: string;
  
  // -- Joined Data (Optional for UI) --
  drivers?: ScenarioDriver[];
  results?: ScenarioResult[];
}

/**
 * 🎛️ SCENARIO DRIVER (The Lever)
 * Represents a variable the user can tweak.
 * Maps to DB table: public.scenario_drivers
 */
export interface ScenarioDriver {
  id: string;
  scenario_id: string;
  name: string;          // e.g., "Revenue Growth"
  key: string;           // e.g., "revenue_growth_pct"
  value: number;         // e.g., 0.15 (The active value)
  default_value: number; // e.g., 0.05 (The original baseline)
  unit: DriverUnit;
  created_at: string;
}

/**
 * 📊 SCENARIO RESULT (The Outcome)
 * Represents a stored calculation point for graphing.
 * Maps to DB table: public.scenario_results
 */
export interface ScenarioResult {
  id: string;
  scenario_id: string;
  metric_name: string;   // e.g., "Net Income", "Burn Rate"
  period_date: string;   // ISO Date string
  projected_amount: number;
  created_at: string;
}

/**
 * 🛠️ HELPER TYPES FOR THE ENGINE
 * These are used by the frontend calculation engine and API payloads.
 */

// Payload to create a new scenario via API
export interface CreateScenarioPayload {
  name: string;
  description?: string;
  is_baseline?: boolean;
  drivers: Array<{
    name: string;
    key: string;
    value: number;
    default_value?: number;
    unit: DriverUnit;
  }>;
}

// Payload to update a specific driver
export interface UpdateDriverPayload {
  driver_id: string;
  value: number;
}

// The complete state of a simulation run (Live Memory)
export interface SimulationRun {
  scenarioId: string;
  drivers: Record<string, number>; // key-value map for O(1) access
  financials: {
    income: number;
    expense: number;
    balance: number;
    trend: Array<{ date: string; value: number }>;
  };
}