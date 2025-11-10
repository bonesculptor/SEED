/**
 * Ecosystem Context Protocol (ECP)
 */

export interface EcosystemContext {
  id: string;
  ecp_id: string;
  title: string;
  version: string;
  owner_name: string;
  environmental_impact: {
    carbon_emissions_kg: number;
    water_usage_liters: number;
    energy_consumption_kwh: number;
  };
  sustainability_metrics: {
    renewable_energy_percentage: number;
    waste_recycling_rate: number;
    sustainability_score: number;
  };
  resource_usage: Record<string, number>;
  carbon_footprint: {
    total_kg_co2: number;
    breakdown: Record<string, number>;
  };
  esg_scores: {
    environmental: number;
    social: number;
    governance: number;
  };
  created_at: string;
}
