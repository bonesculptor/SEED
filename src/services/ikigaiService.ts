import { supabase } from '../lib/supabase';

export interface IkigaiScore {
  id?: string;
  workspace_id: string;
  agent_id: string;
  agent_tier: 'tier1' | 'tier2' | 'tier3';

  // Ikigai quadrants
  love_score: number; // 0-100
  passion_score: number;
  mission_score: number;
  vocation_score: number;

  // Sub-components
  competence_score: number;
  value_score: number;
  need_score: number;
  contribution_score: number;

  // Calculated scores
  ikigai_work_score: number; // w = g * a * p * c
  purpose_score: number; // p = m * x
  career_score: number; // c = m * f
  profession_score: number; // e = k

  penalty_factor?: number;
  user_feedback_count?: number;
  user_feedback_average?: number;

  governance_action?: 'continue' | 'monitor' | 'throttle' | 'rollback' | 'apoptosis';
  governance_reason?: string;
}

export interface Tier1Agent {
  id?: string;
  workspace_id: string;
  agent_name: string;
  agent_type: 'monitor' | 'analyst' | 'planner' | 'executor' | 'knowledge';
  agent_config?: any;
  capabilities?: string[];
  agent_pattern_id?: string;
  cynefin_id?: string;
  handles_domains?: string[];
  current_status?: string;
}

export interface Tier2Ensemble {
  id?: string;
  workspace_id: string;
  ensemble_name: string;
  ensemble_type: 'graph_monitor' | 'ensemble_governor';
  tier1_agent_ids?: string[];
  orchestration_strategy?: string;
  escalation_threshold?: number;
  apoptosis_enabled?: boolean;
  status?: string;
}

export interface Tier3DigitalTwin {
  id?: string;
  workspace_id: string;
  twin_name: string;
  twin_type?: string;
  simulated_tier1_agents?: string[];
  simulated_tier2_ensembles?: string[];
  adaptation_strategy?: string;
  prediction_accuracy?: number;
  status?: string;
}

class IkigaiService {
  calculateIkigaiScore(components: Partial<IkigaiScore>): number {
    // Ikigai work formula: w = g * a * p * c
    // where g = goal, a = archetype, p = purpose, c = contribution

    const {
      mission_score = 50,
      love_score = 50,
      passion_score = 50,
      vocation_score = 50,
      competence_score = 50,
      value_score = 50,
      need_score = 50,
      contribution_score = 50,
      penalty_factor = 0,
    } = components;

    // Purpose = Mission * Context (simplified)
    const purposeScore = (mission_score / 100) * (love_score / 100) * 100;

    // Career = Mission * Function
    const careerScore = (mission_score / 100) * (vocation_score / 100) * 100;

    // Profession = Competence * Knowledge (simplified as competence)
    const professionScore = competence_score;

    // Ikigai = g * a * p * c (normalized to 0-100)
    const ikigaiWorkScore = (
      (mission_score / 100) *
      (love_score / 100) *
      (purposeScore / 100) *
      (contribution_score / 100)
    ) * 100;

    // Apply penalty
    const finalScore = Math.max(0, ikigaiWorkScore - penalty_factor);

    return finalScore;
  }

  async calculateAndStoreIkigai(
    workspaceId: string,
    agentId: string,
    agentTier: 'tier1' | 'tier2' | 'tier3',
    components: Partial<IkigaiScore>
  ): Promise<IkigaiScore> {
    const ikigaiWorkScore = this.calculateIkigaiScore(components);

    // Determine governance action based on score
    let governanceAction: IkigaiScore['governance_action'] = 'continue';
    let governanceReason = 'Performance within acceptable range';

    if (ikigaiWorkScore < 30) {
      governanceAction = 'apoptosis';
      governanceReason = 'Ikigai score critically low - agent termination recommended';
    } else if (ikigaiWorkScore < 50) {
      governanceAction = 'throttle';
      governanceReason = 'Ikigai score low - reduce agent workload';
    } else if (ikigaiWorkScore < 70) {
      governanceAction = 'monitor';
      governanceReason = 'Ikigai score moderate - close monitoring required';
    }

    const ikigaiData: IkigaiScore = {
      workspace_id: workspaceId,
      agent_id: agentId,
      agent_tier: agentTier,
      ikigai_work_score: ikigaiWorkScore,
      purpose_score: (components.mission_score || 50) * (components.love_score || 50) / 100,
      career_score: (components.mission_score || 50) * (components.vocation_score || 50) / 100,
      profession_score: components.competence_score || 50,
      governance_action: governanceAction,
      governance_reason: governanceReason,
      ...components,
    };

    const { data, error } = await supabase
      .from('agent_ikigai_scores')
      .insert(ikigaiData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAgentIkigaiScore(agentId: string): Promise<IkigaiScore | null> {
    const { data, error } = await supabase
      .from('agent_ikigai_scores')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createTier1Agent(agent: Tier1Agent): Promise<Tier1Agent> {
    const { data, error } = await supabase
      .from('tier1_agents')
      .insert(agent)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTier1Agents(workspaceId: string): Promise<Tier1Agent[]> {
    const { data, error } = await supabase
      .from('tier1_agents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTier2Ensemble(ensemble: Tier2Ensemble): Promise<Tier2Ensemble> {
    const { data, error } = await supabase
      .from('tier2_ensemble')
      .insert(ensemble)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTier2Ensembles(workspaceId: string): Promise<Tier2Ensemble[]> {
    const { data, error } = await supabase
      .from('tier2_ensemble')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTier3DigitalTwin(twin: Tier3DigitalTwin): Promise<Tier3DigitalTwin> {
    const { data, error } = await supabase
      .from('tier3_digital_twin')
      .insert(twin)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTier3DigitalTwins(workspaceId: string): Promise<Tier3DigitalTwin[]> {
    const { data, error } = await supabase
      .from('tier3_digital_twin')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  }

  async triggerApoptosis(
    workspaceId: string,
    targetTier: 'tier1' | 'tier2' | 'tier3',
    targetAgentId: string,
    reason: string,
    ikigaiScoreBefore: number
  ): Promise<void> {
    const { error } = await supabase
      .from('apoptosis_events')
      .insert({
        workspace_id: workspaceId,
        event_type: 'apoptosis',
        target_tier: targetTier,
        target_agent_id: targetAgentId,
        trigger_reason: reason,
        ikigai_score_before: ikigaiScoreBefore,
        executed_by: 'system',
      });

    if (error) throw error;
  }

  async escalateToHOTL(
    workspaceId: string,
    sourceTier: 'tier1' | 'tier2' | 'tier3',
    sourceAgentId: string,
    problemDescription: string,
    ikigaiScore: number
  ): Promise<string> {
    const { data, error } = await supabase
      .from('agent_escalations')
      .insert({
        workspace_id: workspaceId,
        escalation_type: 'low_ikigai',
        source_tier: sourceTier,
        source_agent_id: sourceAgentId,
        problem_description: problemDescription,
        ikigai_score: ikigaiScore,
        risk_level: ikigaiScore < 30 ? 'critical' : ikigaiScore < 50 ? 'high' : 'medium',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }
}

export const ikigaiService = new IkigaiService();
