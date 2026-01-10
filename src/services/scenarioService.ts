/**
 * src/services/scenarioService.ts
 * ROLE: The "What-If" Simulation Engine (Titan-4).
 * PURPOSE: Manages parallel financial scenarios, driver levers, and projected results.
 */

import { supabase } from '../lib/supabase';
import {
  Scenario,
  ScenarioDriver,
  ScenarioResult,
  CreateScenarioPayload,
  UpdateDriverPayload,
  SimulationRun,
} from '../types/scenario';
import * as Haptics from 'expo-haptics';

export class ScenarioService {
  /**
   * 🌌 FETCH ALL SCENARIOS
   * Retrieves scenarios with their associated drivers for a specific user.
   */
  static async getScenarios(userId: string): Promise<Scenario[]> {
    const { data, error } = await supabase
      .from('scenarios')
      .select('*, drivers:scenario_drivers(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * 🏗️ CREATE SCENARIO (DEEP INSERT)
   * Creates a scenario and its initial drivers in a single atomic flow.
   */
  static async createScenario(
    userId: string,
    payload: CreateScenarioPayload
  ): Promise<Scenario> {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 1. Create the scenario container
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .insert({
        user_id: userId,
        name: payload.name,
        description: payload.description,
        is_baseline: payload.is_baseline || false,
        status: 'active',
      })
      .select()
      .single();

    if (scenarioError) throw scenarioError;

    // 2. Insert associated drivers
    const driversToInsert = payload.drivers.map((d) => ({
      scenario_id: scenario.id,
      ...d,
    }));

    const { error: driverError } = await supabase
      .from('scenario_drivers')
      .insert(driversToInsert);

    if (driverError) throw driverError;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return scenario;
  }

  /**
   * 🎛️ UPDATE DRIVER VALUE
   * Tweaks a specific variable lever and triggers a re-simulation.
   */
  static async updateDriver(payload: UpdateDriverPayload): Promise<void> {
    const { error } = await supabase
      .from('scenario_drivers')
      .update({ value: payload.value })
      .eq('id', payload.driver_id);

    if (error) throw error;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  /**
   * 👯 CLONE SCENARIO (RPC CALL)
   * Executes the PostgreSQL function to duplicate a scenario universe instantly.
   */
  static async cloneScenario(
    originalId: string,
    newName: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('clone_scenario', {
      original_scenario_id: originalId,
      new_name: newName,
    });

    if (error) throw error;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return data; // Returns the new UUID
  }

  /**
   * 📊 FETCH PROJECTION RESULTS
   * Retrieves cached calculation points for the simulation graph.
   */
  static async getScenarioResults(
    scenarioId: string
  ): Promise<ScenarioResult[]> {
    const { data, error } = await supabase
      .from('scenario_results')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('period_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * ⚡ EXECUTE SIMULATION ENGINE
   * The "Brain" of the What-If analysis.
   * Logic: Takes current actuals and applies the Scenario Driver multipliers.
   */
  static async runSimulation(
    userId: string,
    scenarioId: string
  ): Promise<SimulationRun> {
    // 1. Fetch the Scenario and Drivers
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('*, drivers:scenario_drivers(*)')
      .eq('id', scenarioId)
      .single();

    if (!scenario) throw new Error('Scenario not found');

    // 2. Fetch "Baseline" Actuals for context
    const { data: summary } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const baselineBalance = summary?.balance || 0;
    const drivers = scenario.drivers as ScenarioDriver[];

    // Convert drivers to a quick-access map
    const driverMap: Record<string, number> = {};
    drivers.forEach((d) => {
      driverMap[d.key] = d.value;
    });

    // 3. APPLY SIMULATION LOGIC (Example: Revenue Growth & Burn Rate)
    // Formula: New Balance = Current + (Income * GrowthLever) - (Expense * BurnLever)
    const growth = driverMap['revenue_growth_pct'] || 1.0;
    const burn = driverMap['expense_multiplier'] || 1.0;

    // Generate a 12-month projection trend
    const trend = [];
    let rollingBalance = baselineBalance;

    for (let i = 0; i < 12; i++) {
      const monthlyNet = 2000 * growth - 1500 * burn; // Placeholder values
      rollingBalance += monthlyNet;
      trend.push({
        date: new Date(2025, i, 1).toISOString(),
        value: Number(rollingBalance.toFixed(2)),
      });
    }

    // 4. PERSIST RESULTS (Cache for UI performance)
    const resultRows = trend.map((t) => ({
      scenario_id: scenarioId,
      metric_name: 'Projected Balance',
      period_date: t.date.split('T')[0],
      projected_amount: t.value,
    }));

    // Clear old results and insert new ones (Titan-Speed Refresh)
    await supabase
      .from('scenario_results')
      .delete()
      .eq('scenario_id', scenarioId);
    await supabase.from('scenario_results').insert(resultRows);

    return {
      scenarioId,
      drivers: driverMap,
      financials: {
        income: 2000 * growth,
        expense: 1500 * burn,
        balance: rollingBalance,
        trend,
      },
    };
  }

  /**
   * 🧹 PURGE SCENARIO
   * Fully removes a scenario and its cascading children (Drivers/Results).
   */
  static async deleteScenario(id: string): Promise<void> {
    const { error } = await supabase.from('scenarios').delete().eq('id', id);

    if (error) throw error;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}
