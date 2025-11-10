import { UserContext } from './userContextService';

export interface WorkflowConnection {
  from: string;
  to: string;
  dataType: string;
  requiresConfig: boolean;
}

export interface ProtocolTemplate {
  type: 'hcp' | 'bcp' | 'mcp' | 'dcp' | 'tcp';
  title: string;
  description: string;
  config: any;
  inputsRequired?: Array<{
    name: string;
    type: 'api' | 'database' | 'file' | 'stream' | 'webhook';
    description: string;
    required: boolean;
  }>;
  outputsProvided?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  protocols: ProtocolTemplate[];
  connections: WorkflowConnection[];
  estimatedSetupTime: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export class WorkflowTemplateService {
  generateWorkflows(userContext: UserContext | null): WorkflowTemplate[] {
    if (!userContext) {
      return this.getDefaultWorkflows();
    }

    const sector = userContext.sectorName;
    const subIndustry = userContext.subIndustryName;

    switch (sector) {
      case 'Health Care':
        return this.getHealthCareWorkflows(subIndustry);
      case 'Energy':
        return this.getEnergyWorkflows(subIndustry);
      case 'Information Technology':
        return this.getITWorkflows(subIndustry);
      case 'Industrials':
        return this.getIndustrialsWorkflows(subIndustry);
      default:
        return this.getDefaultWorkflows();
    }
  }

  private getHealthCareWorkflows(subIndustry?: string): WorkflowTemplate[] {
    const workflows: WorkflowTemplate[] = [];

    workflows.push({
      id: 'hc-patient-intake',
      title: 'Patient Intake & Appointment Flow',
      description: 'Complete patient onboarding from registration to first appointment',
      category: 'Patient Management',
      icon: 'UserPlus',
      estimatedSetupTime: '15 minutes',
      complexity: 'beginner',
      tags: ['patient-care', 'appointments', 'onboarding'],
      protocols: [
        {
          type: 'hcp',
          title: 'Clinic Context',
          description: 'Define clinic operations and staff roles',
          config: {
            context: {
              purposes: ['Patient registration', 'Schedule appointments', 'Verify insurance'],
              activities: ['Check-in', 'Registration', 'Insurance verification']
            },
            resources: {
              human: [
                { role: 'Receptionist', availability: 'Mon-Fri 08:00-17:00' },
                { role: 'Intake Coordinator', availability: 'Mon-Fri 08:00-17:00' }
              ]
            }
          }
        },
        {
          type: 'bcp',
          title: 'Patient Registration Process',
          description: 'Capture patient information and create record',
          config: {
            process_name: 'Patient Registration',
            steps: [
              { name: 'Collect Demographics', type: 'manual', duration_minutes: 5 },
              { name: 'Verify Insurance', type: 'api_call', duration_minutes: 2 },
              { name: 'Create EHR Record', type: 'system', duration_minutes: 1 }
            ]
          },
          inputsRequired: [
            { name: 'EHR API Endpoint', type: 'api', description: 'EHR system API for patient creation', required: true },
            { name: 'Insurance Verification API', type: 'api', description: 'Insurance eligibility check API', required: true }
          ]
        },
        {
          type: 'mcp',
          title: 'Appointment Scheduler',
          description: 'AI agent to find optimal appointment slots',
          config: {
            agent_name: 'Appointment Scheduler Agent',
            capabilities: ['schedule_optimization', 'availability_check', 'reminder_sending'],
            model: 'gpt-4'
          },
          inputsRequired: [
            { name: 'Calendar System API', type: 'api', description: 'Clinic calendar/scheduling system', required: true },
            { name: 'Provider Schedules', type: 'database', description: 'Database of provider availability', required: true }
          ]
        },
        {
          type: 'dcp',
          title: 'Patient Data Hub',
          description: 'Centralized patient information access',
          config: {
            data_product_name: 'Patient Master Data',
            schema: {
              patient_id: 'uuid',
              demographics: 'object',
              insurance: 'object',
              appointments: 'array'
            },
            sla: { freshness: '5m', availability: '99.9%' }
          },
          inputsRequired: [
            { name: 'Patient Database', type: 'database', description: 'Primary patient data store', required: true }
          ]
        },
        {
          type: 'tcp',
          title: 'Appointment Confirmation',
          description: 'Send confirmation and reminders',
          config: {
            task_name: 'Send Appointment Confirmation',
            triggers: ['appointment_created', 'appointment_updated'],
            actions: [
              { type: 'email', template: 'appointment_confirmation' },
              { type: 'sms', template: 'appointment_reminder_24h' }
            ]
          },
          inputsRequired: [
            { name: 'Email Service', type: 'api', description: 'Email service (SendGrid, SES, etc.)', required: true },
            { name: 'SMS Service', type: 'api', description: 'SMS service (Twilio, etc.)', required: false }
          ]
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'mcp', dataType: 'patient_data', requiresConfig: true },
        { from: 'mcp', to: 'dcp', dataType: 'appointment', requiresConfig: true },
        { from: 'dcp', to: 'tcp', dataType: 'trigger_event', requiresConfig: true }
      ]
    });

    workflows.push({
      id: 'hc-telehealth',
      title: 'Virtual Consultation Workflow',
      description: 'End-to-end telehealth appointment with AI triage',
      category: 'Telehealth',
      icon: 'Video',
      estimatedSetupTime: '20 minutes',
      complexity: 'intermediate',
      tags: ['telehealth', 'remote-care', 'ai-triage'],
      protocols: [
        {
          type: 'hcp',
          title: 'Telehealth Context',
          description: 'Remote care delivery context',
          config: {
            context: {
              purposes: ['Remote consultations', 'AI-assisted triage', 'Digital prescriptions'],
              activities: ['Video consultation', 'Symptom assessment', 'E-prescribing']
            }
          }
        },
        {
          type: 'bcp',
          title: 'Virtual Visit Process',
          description: 'Steps for conducting virtual appointments',
          config: {
            process_name: 'Telehealth Consultation',
            steps: [
              { name: 'Pre-visit AI Triage', type: 'automated', duration_minutes: 5 },
              { name: 'Video Consultation', type: 'manual', duration_minutes: 20 },
              { name: 'Clinical Documentation', type: 'manual', duration_minutes: 10 },
              { name: 'E-Prescribe if needed', type: 'system', duration_minutes: 3 }
            ]
          }
        },
        {
          type: 'mcp',
          title: 'AI Triage Agent',
          description: 'Pre-screen patients and prioritize urgency',
          config: {
            agent_name: 'Triage Assistant',
            capabilities: ['symptom_analysis', 'urgency_classification', 'visit_preparation'],
            model: 'gpt-4'
          },
          inputsRequired: [
            { name: 'Clinical Guidelines Database', type: 'database', description: 'Triage protocols and guidelines', required: true }
          ]
        },
        {
          type: 'dcp',
          title: 'Visit Records Data Product',
          description: 'Structured consultation data',
          config: {
            data_product_name: 'Telehealth Visit Records',
            schema: {
              visit_id: 'uuid',
              triage_data: 'object',
              consultation_notes: 'text',
              prescriptions: 'array'
            }
          }
        },
        {
          type: 'tcp',
          title: 'Post-Visit Follow-up',
          description: 'Automated follow-up and care coordination',
          config: {
            task_name: 'Post-Visit Actions',
            triggers: ['visit_completed'],
            actions: [
              { type: 'send_visit_summary', delay: '1h' },
              { type: 'schedule_followup', condition: 'if_required' },
              { type: 'notify_pharmacy', condition: 'if_prescribed' }
            ]
          },
          inputsRequired: [
            { name: 'Pharmacy Network API', type: 'api', description: 'E-prescribing network', required: false }
          ]
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'mcp', dataType: 'patient_symptoms', requiresConfig: true },
        { from: 'mcp', to: 'dcp', dataType: 'triage_result', requiresConfig: false },
        { from: 'dcp', to: 'tcp', dataType: 'visit_completion', requiresConfig: true }
      ]
    });

    workflows.push({
      id: 'hc-clinical-research',
      title: 'Clinical Trial Management',
      description: 'End-to-end clinical trial participant tracking',
      category: 'Research',
      icon: 'FlaskConical',
      estimatedSetupTime: '30 minutes',
      complexity: 'advanced',
      tags: ['clinical-trials', 'research', 'compliance'],
      protocols: [
        {
          type: 'hcp',
          title: 'Research Context',
          description: 'Clinical trial operational context',
          config: {
            context: {
              purposes: ['Conduct clinical trials', 'Monitor safety', 'Ensure GCP compliance'],
              activities: ['Participant enrollment', 'Dose administration', 'Adverse event monitoring']
            }
          }
        },
        {
          type: 'bcp',
          title: 'Trial Protocol Workflow',
          description: 'Study protocol execution steps',
          config: {
            process_name: 'Clinical Trial Protocol',
            steps: [
              { name: 'Screening & Consent', type: 'manual', duration_minutes: 45 },
              { name: 'Baseline Assessment', type: 'manual', duration_minutes: 60 },
              { name: 'Randomization', type: 'system', duration_minutes: 2 },
              { name: 'Study Visit', type: 'manual', duration_minutes: 90 },
              { name: 'Safety Monitoring', type: 'continuous', duration_minutes: null }
            ]
          }
        },
        {
          type: 'mcp',
          title: 'Safety Monitoring Agent',
          description: 'AI-powered adverse event detection',
          config: {
            agent_name: 'Safety Monitor',
            capabilities: ['ae_detection', 'severity_classification', 'regulatory_alerting'],
            model: 'gpt-4'
          },
          inputsRequired: [
            { name: 'EDC System', type: 'api', description: 'Electronic Data Capture system', required: true },
            { name: 'Safety Database', type: 'database', description: 'Historical AE database', required: true }
          ]
        },
        {
          type: 'dcp',
          title: 'Trial Data Product',
          description: 'Compliant trial data management',
          config: {
            data_product_name: 'Clinical Trial Dataset',
            schema: {
              participant_id: 'uuid',
              trial_arm: 'string',
              visits: 'array',
              adverse_events: 'array',
              outcomes: 'object'
            },
            governance: { audit_trail: true, encryption: 'at_rest_and_transit' }
          }
        },
        {
          type: 'tcp',
          title: 'Regulatory Reporting',
          description: 'Automated compliance reporting',
          config: {
            task_name: 'Regulatory Reports',
            triggers: ['ae_detected', 'milestone_reached', 'scheduled_report'],
            actions: [
              { type: 'generate_sae_report', urgency: 'immediate' },
              { type: 'submit_to_irb', schedule: 'quarterly' },
              { type: 'notify_sponsor', condition: 'protocol_deviation' }
            ]
          },
          inputsRequired: [
            { name: 'Regulatory Submission Portal', type: 'api', description: 'FDA/EMA submission system', required: true }
          ]
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'mcp', dataType: 'trial_data', requiresConfig: true },
        { from: 'mcp', to: 'dcp', dataType: 'safety_signals', requiresConfig: true },
        { from: 'dcp', to: 'tcp', dataType: 'reporting_triggers', requiresConfig: true }
      ]
    });

    return workflows;
  }

  private getEnergyWorkflows(subIndustry?: string): WorkflowTemplate[] {
    return [{
      id: 'en-drilling-ops',
      title: 'Drilling Operations Monitoring',
      description: 'Real-time drilling optimization with predictive maintenance',
      category: 'Operations',
      icon: 'Drill',
      estimatedSetupTime: '25 minutes',
      complexity: 'advanced',
      tags: ['drilling', 'iot', 'predictive-maintenance'],
      protocols: [
        {
          type: 'hcp',
          title: 'Drilling Site Context',
          description: 'Operations and safety context',
          config: {
            context: {
              purposes: ['Optimize drilling performance', 'Ensure safety', 'Predict equipment failures'],
              activities: ['Real-time monitoring', 'Safety checks', 'Maintenance scheduling']
            }
          }
        },
        {
          type: 'bcp',
          title: 'Drilling Process',
          description: 'Standard drilling operations procedure',
          config: {
            process_name: 'Drilling Operations',
            steps: [
              { name: 'Pre-drill Safety Check', type: 'manual', duration_minutes: 30 },
              { name: 'Drilling Operations', type: 'continuous', duration_minutes: null },
              { name: 'Real-time Monitoring', type: 'automated', duration_minutes: null },
              { name: 'Maintenance Inspection', type: 'manual', duration_minutes: 60 }
            ]
          }
        },
        {
          type: 'mcp',
          title: 'Predictive Maintenance Agent',
          description: 'AI predicts equipment failures',
          config: {
            agent_name: 'Maintenance Predictor',
            capabilities: ['anomaly_detection', 'failure_prediction', 'maintenance_scheduling'],
            model: 'time_series_ml'
          },
          inputsRequired: [
            { name: 'SCADA System', type: 'api', description: 'Real-time sensor data stream', required: true },
            { name: 'Equipment History', type: 'database', description: 'Historical maintenance records', required: true }
          ]
        },
        {
          type: 'dcp',
          title: 'Drilling Data Lake',
          description: 'Centralized operations data',
          config: {
            data_product_name: 'Drilling Operations Dataset',
            schema: {
              well_id: 'uuid',
              sensor_data: 'timeseries',
              drilling_parameters: 'object',
              maintenance_events: 'array'
            }
          }
        },
        {
          type: 'tcp',
          title: 'Alert & Response System',
          description: 'Automated alerting and response coordination',
          config: {
            task_name: 'Safety & Maintenance Alerts',
            triggers: ['anomaly_detected', 'safety_threshold_exceeded', 'maintenance_due'],
            actions: [
              { type: 'alert_supervisor', urgency: 'high' },
              { type: 'log_incident', always: true },
              { type: 'schedule_maintenance', condition: 'predictive_signal' }
            ]
          },
          inputsRequired: [
            { name: 'Alert System', type: 'api', description: 'SMS/Email alert service', required: true }
          ]
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'mcp', dataType: 'operations_data', requiresConfig: true },
        { from: 'mcp', to: 'dcp', dataType: 'predictions', requiresConfig: true },
        { from: 'dcp', to: 'tcp', dataType: 'alert_triggers', requiresConfig: true }
      ]
    }];
  }

  private getITWorkflows(subIndustry?: string): WorkflowTemplate[] {
    return [{
      id: 'it-devops-pipeline',
      title: 'CI/CD with AI Code Review',
      description: 'Automated deployment pipeline with intelligent code analysis',
      category: 'DevOps',
      icon: 'GitBranch',
      estimatedSetupTime: '20 minutes',
      complexity: 'intermediate',
      tags: ['cicd', 'devops', 'code-quality'],
      protocols: [
        {
          type: 'hcp',
          title: 'Development Team Context',
          description: 'Software development operations context',
          config: {
            context: {
              purposes: ['Continuous delivery', 'Code quality assurance', 'Automated testing'],
              activities: ['Code commit', 'Build & test', 'Deploy', 'Monitor']
            }
          }
        },
        {
          type: 'bcp',
          title: 'Release Process',
          description: 'Standard software release workflow',
          config: {
            process_name: 'Software Release',
            steps: [
              { name: 'Code Commit', type: 'manual', duration_minutes: 1 },
              { name: 'AI Code Review', type: 'automated', duration_minutes: 2 },
              { name: 'Run Tests', type: 'automated', duration_minutes: 10 },
              { name: 'Build & Package', type: 'automated', duration_minutes: 5 },
              { name: 'Deploy to Staging', type: 'automated', duration_minutes: 3 },
              { name: 'Approval Gate', type: 'manual', duration_minutes: 5 },
              { name: 'Deploy to Production', type: 'automated', duration_minutes: 5 }
            ]
          }
        },
        {
          type: 'mcp',
          title: 'Code Review Agent',
          description: 'AI-powered code quality analysis',
          config: {
            agent_name: 'Code Reviewer',
            capabilities: ['security_scan', 'style_check', 'bug_detection', 'performance_analysis'],
            model: 'code-llm'
          },
          inputsRequired: [
            { name: 'Git Repository', type: 'api', description: 'GitHub/GitLab API', required: true },
            { name: 'Code Standards', type: 'file', description: 'Coding standards config', required: false }
          ]
        },
        {
          type: 'dcp',
          title: 'Build Artifacts',
          description: 'Versioned deployment packages',
          config: {
            data_product_name: 'Release Artifacts',
            schema: {
              build_id: 'uuid',
              version: 'semver',
              artifacts: 'array',
              test_results: 'object',
              review_scores: 'object'
            }
          }
        },
        {
          type: 'tcp',
          title: 'Deployment Orchestration',
          description: 'Automated deployment and rollback',
          config: {
            task_name: 'Deploy & Monitor',
            triggers: ['build_success', 'approval_granted'],
            actions: [
              { type: 'deploy_to_environment', target: 'staging' },
              { type: 'run_smoke_tests', wait: true },
              { type: 'deploy_to_production', condition: 'tests_passed' },
              { type: 'rollback', condition: 'deployment_failed' }
            ]
          },
          inputsRequired: [
            { name: 'Deployment Platform', type: 'api', description: 'Kubernetes/Docker API', required: true },
            { name: 'Monitoring Service', type: 'api', description: 'DataDog/NewRelic', required: true }
          ]
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'mcp', dataType: 'code_commit', requiresConfig: true },
        { from: 'mcp', to: 'dcp', dataType: 'review_result', requiresConfig: false },
        { from: 'dcp', to: 'tcp', dataType: 'build_artifact', requiresConfig: true }
      ]
    }];
  }

  private getIndustrialsWorkflows(subIndustry?: string): WorkflowTemplate[] {
    return [{
      id: 'ind-quality-control',
      title: 'Automated Quality Inspection',
      description: 'AI-powered visual inspection and defect tracking',
      category: 'Quality Assurance',
      icon: 'ShieldCheck',
      estimatedSetupTime: '25 minutes',
      complexity: 'intermediate',
      tags: ['quality', 'computer-vision', 'manufacturing'],
      protocols: [
        {
          type: 'hcp',
          title: 'QA Operations Context',
          description: 'Quality assurance operational context',
          config: {
            context: {
              purposes: ['Ensure product quality', 'Detect defects', 'Maintain compliance'],
              activities: ['Visual inspection', 'Measurements', 'Documentation', 'Defect tracking']
            }
          }
        },
        {
          type: 'bcp',
          title: 'Inspection Process',
          description: 'Standard quality inspection workflow',
          config: {
            process_name: 'Quality Inspection',
            steps: [
              { name: 'Receive Component', type: 'manual', duration_minutes: 2 },
              { name: 'AI Visual Inspection', type: 'automated', duration_minutes: 1 },
              { name: 'Manual Verification', type: 'manual', duration_minutes: 5 },
              { name: 'Measurements', type: 'automated', duration_minutes: 3 },
              { name: 'Accept/Reject Decision', type: 'manual', duration_minutes: 2 },
              { name: 'Log Results', type: 'system', duration_minutes: 1 }
            ]
          }
        },
        {
          type: 'mcp',
          title: 'Vision Inspection Agent',
          description: 'AI visual defect detection',
          config: {
            agent_name: 'Vision Inspector',
            capabilities: ['defect_detection', 'dimension_measurement', 'classification'],
            model: 'computer_vision'
          },
          inputsRequired: [
            { name: 'Camera System', type: 'stream', description: 'Industrial camera feed', required: true },
            { name: 'Defect Library', type: 'database', description: 'Known defect patterns', required: true }
          ]
        },
        {
          type: 'dcp',
          title: 'Quality Metrics',
          description: 'Quality data and analytics',
          config: {
            data_product_name: 'Quality Inspection Records',
            schema: {
              inspection_id: 'uuid',
              component_id: 'string',
              inspection_result: 'object',
              defects: 'array',
              measurements: 'object'
            }
          }
        },
        {
          type: 'tcp',
          title: 'Quality Actions',
          description: 'Automated quality response',
          config: {
            task_name: 'Quality Response',
            triggers: ['defect_detected', 'threshold_exceeded', 'inspection_completed'],
            actions: [
              { type: 'quarantine_batch', condition: 'critical_defect' },
              { type: 'notify_supervisor', urgency: 'high' },
              { type: 'create_ncr', condition: 'non_conformance' },
              { type: 'adjust_process', condition: 'trend_detected' }
            ]
          },
          inputsRequired: [
            { name: 'QMS System', type: 'api', description: 'Quality Management System', required: true }
          ]
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'mcp', dataType: 'inspection_request', requiresConfig: true },
        { from: 'mcp', to: 'dcp', dataType: 'inspection_result', requiresConfig: false },
        { from: 'dcp', to: 'tcp', dataType: 'quality_event', requiresConfig: true }
      ]
    }];
  }

  private getDefaultWorkflows(): WorkflowTemplate[] {
    return [{
      id: 'default-basic',
      title: 'Basic Operational Workflow',
      description: 'Simple end-to-end operational workflow',
      category: 'General',
      icon: 'Workflow',
      estimatedSetupTime: '10 minutes',
      complexity: 'beginner',
      tags: ['starter', 'basic'],
      protocols: [
        {
          type: 'hcp',
          title: 'Operational Context',
          description: 'Define your operational context',
          config: {
            context: {
              purposes: ['Manage operations'],
              activities: ['Daily tasks', 'Reporting']
            }
          }
        },
        {
          type: 'bcp',
          title: 'Standard Process',
          description: 'Your standard operating procedure',
          config: {
            process_name: 'Standard Operations',
            steps: [
              { name: 'Initiate', type: 'manual', duration_minutes: 5 },
              { name: 'Execute', type: 'manual', duration_minutes: 30 },
              { name: 'Review', type: 'manual', duration_minutes: 10 }
            ]
          }
        },
        {
          type: 'dcp',
          title: 'Operational Data',
          description: 'Centralized operational data',
          config: {
            data_product_name: 'Operations Dataset',
            schema: {
              operation_id: 'uuid',
              timestamp: 'datetime',
              data: 'object'
            }
          }
        },
        {
          type: 'tcp',
          title: 'Notifications',
          description: 'Send notifications on completion',
          config: {
            task_name: 'Notify Completion',
            triggers: ['operation_completed'],
            actions: [
              { type: 'send_email', recipient: 'team' }
            ]
          }
        }
      ],
      connections: [
        { from: 'hcp', to: 'bcp', dataType: 'context', requiresConfig: false },
        { from: 'bcp', to: 'dcp', dataType: 'process_data', requiresConfig: false },
        { from: 'dcp', to: 'tcp', dataType: 'completion_event', requiresConfig: false }
      ]
    }];
  }
}

export const workflowTemplateService = new WorkflowTemplateService();
