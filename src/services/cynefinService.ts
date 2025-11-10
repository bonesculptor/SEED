import { supabase } from '../lib/supabase';

export interface CynefinClassification {
  id?: string;
  workspace_id: string;
  problem_description: string;
  domain: 'clear' | 'complicated' | 'complex' | 'chaotic' | 'confusion';
  cause_effect_relationship?: 'ordered' | 'unordered' | 'unknown';
  decision_model?: string;
  practice_type?: string;
  uncertainty_level?: number;
  complexity_level?: number;
  constraints?: any;
  recommended_agent_pattern?: string;
  recommended_tier?: 'tier1' | 'tier2' | 'tier3';
  requires_human_oversight?: boolean;
}

export interface LSSAssessment {
  id?: string;
  workspace_id: string;
  cynefin_id?: string;
  zone: 'survive' | 'scale_to_10_1' | 'scale_beyond';
  sigma_level?: number;
  defects_per_million?: number;
  process_capability?: number;
  cycle_time_seconds?: number;
  lead_time_seconds?: number;
  value_add_ratio?: number;
  waste_percentage?: number;
  uncertainty_signal?: 'high' | 'medium' | 'low';
  novelty_signal?: 'high' | 'medium' | 'low';
  coupling_signal?: 'tight' | 'loose';
}

class CynefinService {
  async classifyProblem(
    workspaceId: string,
    problemDescription: string,
    userContext?: any
  ): Promise<CynefinClassification> {
    // Simple rule-based classification
    const text = problemDescription.toLowerCase();
    let domain: CynefinClassification['domain'] = 'complicated';
    let decisionModel = 'sense-analyze-respond';
    let practiceType = 'good_practice';
    let uncertaintyLevel = 50;
    let complexityLevel = 50;
    let recommendedTier: 'tier1' | 'tier2' | 'tier3' = 'tier1';

    // Clear domain - predictable, best practices
    if (text.includes('standard') || text.includes('routine') || text.includes('checklist')) {
      domain = 'clear';
      decisionModel = 'sense-categorize-respond';
      practiceType = 'best_practice';
      uncertaintyLevel = 10;
      complexityLevel = 20;
      recommendedTier = 'tier1';
    }
    // Complicated domain - analyzable, good practices
    else if (text.includes('analyze') || text.includes('expertise') || text.includes('calculate')) {
      domain = 'complicated';
      decisionModel = 'sense-analyze-respond';
      practiceType = 'good_practice';
      uncertaintyLevel = 30;
      complexityLevel = 50;
      recommendedTier = 'tier1';
    }
    // Complex domain - emergent, experimentation
    else if (text.includes('experiment') || text.includes('adapt') || text.includes('emerge')) {
      domain = 'complex';
      decisionModel = 'probe-sense-respond';
      practiceType = 'emergent_practice';
      uncertaintyLevel = 70;
      complexityLevel = 80;
      recommendedTier = 'tier2';
    }
    // Chaotic domain - novel, rapid response
    else if (text.includes('crisis') || text.includes('urgent') || text.includes('emergency')) {
      domain = 'chaotic';
      decisionModel = 'act-sense-respond';
      practiceType = 'novel_practice';
      uncertaintyLevel = 90;
      complexityLevel = 95;
      recommendedTier = 'tier3';
    }

    const classification: CynefinClassification = {
      workspace_id: workspaceId,
      problem_description: problemDescription,
      domain,
      cause_effect_relationship: domain === 'clear' || domain === 'complicated' ? 'ordered' : 'unordered',
      decision_model: decisionModel,
      practice_type: practiceType,
      uncertainty_level: uncertaintyLevel,
      complexity_level: complexityLevel,
      recommended_tier: recommendedTier,
      requires_human_oversight: domain === 'chaotic' || complexityLevel > 80,
    };

    const { data, error } = await supabase
      .from('cynefin_classifications')
      .insert(classification)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async assessLSS(
    workspaceId: string,
    cynefinId: string,
    metrics: Partial<LSSAssessment>
  ): Promise<LSSAssessment> {
    // Determine zone based on metrics
    let zone: LSSAssessment['zone'] = 'survive';

    if (metrics.sigma_level && metrics.sigma_level >= 4) {
      zone = 'scale_beyond';
    } else if (metrics.process_capability && metrics.process_capability > 1.33) {
      zone = 'scale_to_10_1';
    }

    const assessment: LSSAssessment = {
      workspace_id: workspaceId,
      cynefin_id: cynefinId,
      zone,
      ...metrics,
    };

    const { data, error } = await supabase
      .from('lss_assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCynefinClassifications(workspaceId: string): Promise<CynefinClassification[]> {
    const { data, error } = await supabase
      .from('cynefin_classifications')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const cynefinService = new CynefinService();
