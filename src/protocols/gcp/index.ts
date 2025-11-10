/**
 * Governance Context Protocol (GCP)
 *
 * Defines compliance rules, regulatory frameworks, and governance policies.
 * Enables audit trails, permission systems, and risk management.
 */

export interface ComplianceRule {
  rule_id: string;
  name: string;
  framework: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  automated_check: boolean;
}

export interface RegulatoryRequirement {
  requirement_id: string;
  regulation_name: string;
  jurisdiction: string;
  description: string;
  compliance_status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
}

export interface AuditEntry {
  entry_id: string;
  timestamp: string;
  action: string;
  actor: string;
  resource: string;
  outcome: 'success' | 'failure';
  details?: Record<string, any>;
}

export interface PermissionSystem {
  roles: Record<string, string[]>;
  policies: Record<string, any>;
  access_control_model: 'RBAC' | 'ABAC' | 'DAC';
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  identified_risks: Array<{
    risk_id: string;
    description: string;
    probability: number;
    impact: number;
    mitigation_strategy?: string;
  }>;
}

export interface GovernanceContext {
  id: string;
  gcp_id: string;
  title: string;
  version: string;
  owner_name: string;
  owner_uri?: string;
  governance_framework: string;
  compliance_rules: ComplianceRule[];
  regulatory_requirements: RegulatoryRequirement[];
  audit_trail: AuditEntry[];
  permission_system: PermissionSystem;
  risk_assessment: RiskAssessment;
  linked_bcp_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
