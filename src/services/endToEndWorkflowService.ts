import { UserContext } from './userContextService';
import { HumanContext, BusinessContext, MachineContext, DataContext, TestContext } from '../lib/supabase';

export interface WorkflowProtocolDefinition {
  type: 'hcp' | 'bcp' | 'mcp' | 'dcp' | 'tcp';
  title: string;
  description: string;
  getData: (userContext: UserContext | null, userInputs: Record<string, string>) => any;
  requiredInputs: Array<{
    name: string;
    type: 'api' | 'database' | 'file' | 'stream' | 'webhook' | 'text';
    description: string;
    required: boolean;
    placeholder?: string;
    defaultValue?: string;
  }>;
  validate?: (data: any) => { valid: boolean; errors: string[] };
}

export interface EndToEndWorkflow {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  estimatedSetupTime: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  protocols: WorkflowProtocolDefinition[];
  useCases: string[];
  expectedOutcomes: string[];
}

export class EndToEndWorkflowService {
  getHealthcarePatientIntakeWorkflow(): EndToEndWorkflow {
    return {
      id: 'hc-patient-intake',
      title: 'Patient Intake & Appointment Flow',
      description: 'Complete patient onboarding from registration to first appointment with automated scheduling and confirmations',
      category: 'Patient Management',
      icon: 'UserPlus',
      estimatedSetupTime: '15 minutes',
      complexity: 'beginner',
      tags: ['patient-care', 'appointments', 'onboarding', 'ehr-integration'],
      useCases: [
        'New patient registration and onboarding',
        'Insurance verification and eligibility checking',
        'Automated appointment scheduling',
        'Patient communication and reminders'
      ],
      expectedOutcomes: [
        'Streamlined patient registration process',
        'Reduced administrative burden',
        'Improved appointment attendance',
        'Better patient experience'
      ],
      protocols: [
        {
          type: 'hcp',
          title: 'Clinic Operational Context',
          description: 'Defines the clinic\'s operational context, staff roles, and compliance requirements',
          requiredInputs: [
            {
              name: 'clinic_name',
              type: 'text',
              description: 'Name of your clinic or healthcare facility',
              required: true,
              placeholder: 'City Medical Clinic'
            },
            {
              name: 'clinic_location',
              type: 'text',
              description: 'Physical location of the clinic',
              required: true,
              placeholder: 'New York, NY'
            },
            {
              name: 'operating_hours',
              type: 'text',
              description: 'Standard operating hours',
              required: true,
              placeholder: 'Mon-Fri 08:00-17:00',
              defaultValue: 'Mon-Fri 08:00-17:00'
            }
          ],
          getData: (userContext, inputs) => ({
            hcp_id: `urn:hcp:clinic:${Date.now()}`,
            title: inputs.clinic_name || 'Healthcare Clinic',
            version: '1.0.0',
            owner_name: 'Clinic Administrator',
            owner_uri: 'did:example:clinic-admin',
            steward_name: 'Operations Team',
            steward_uri: 'urn:team:ops',
            validity_from: new Date().toISOString(),
            validity_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            identity: {
              humans: [
                { name: 'Receptionist', uri: 'urn:role:receptionist', roles: ['Patient Intake'] },
                { name: 'Intake Coordinator', uri: 'urn:role:coordinator', roles: ['Insurance Verification'] },
                { name: 'Scheduler', uri: 'urn:role:scheduler', roles: ['Appointment Scheduling'] }
              ],
              stakeholders: [
                { name: 'Patients', uri: 'urn:group:patients' },
                { name: 'Insurance Companies', uri: 'urn:group:insurers' }
              ]
            },
            context: {
              locations: [
                {
                  label: inputs.clinic_location || 'Clinic',
                  address: inputs.clinic_location || 'Healthcare Facility',
                  jurisdiction: 'USA'
                }
              ],
              purposes: [
                'Patient registration and onboarding',
                'Insurance verification and eligibility checking',
                'Schedule and manage patient appointments',
                'Maintain HIPAA compliance'
              ],
              activities: [
                'Collect patient demographics',
                'Verify insurance coverage',
                'Create EHR records',
                'Schedule appointments',
                'Send confirmations and reminders'
              ]
            },
            resources: {
              human: [
                { role: 'Receptionist', availability: inputs.operating_hours },
                { role: 'Intake Coordinator', availability: inputs.operating_hours },
                { role: 'Scheduler', availability: inputs.operating_hours }
              ],
              digital: [
                { name: 'EHR System', uri: 'urn:system:ehr', category: 'application' },
                { name: 'Insurance Verification Service', uri: 'urn:system:insurance', category: 'api' },
                { name: 'Appointment Scheduler', uri: 'urn:system:scheduling', category: 'application' }
              ],
              physical: [
                { name: 'Reception Desk' },
                { name: 'Intake Office' }
              ]
            },
            rules: {
              permissions: [
                {
                  actor: 'urn:role:receptionist',
                  resource: 'urn:system:ehr',
                  scopes: ['read:appointments', 'write:demographics'],
                  constraints: { pii: 'full_access' }
                }
              ],
              duties: [
                'Comply with HIPAA regulations',
                'Maintain patient confidentiality',
                'Verify patient identity',
                'Document all interactions'
              ],
              prohibited: [
                'Share patient information without authorization',
                'Access records outside of job duties',
                'Store PHI on personal devices'
              ]
            },
            preferences: {
              style: 'Professional, empathetic, patient-centered',
              scheduling: 'Allow 15-minute buffer between appointments',
              clinical: 'Prioritize urgent cases, same-day appointments for acute needs'
            },
            delegation: {
              on_behalf_of: [],
              escalation: {
                to: 'urn:role:clinic-manager',
                channel: 'phone',
                reason_triggers: ['insurance_issue', 'scheduling_conflict', 'patient_complaint']
              }
            },
            audit: {
              log_to: 'urn:log:hcp',
              retain_days: 2555,
              content: ['who', 'what', 'when', 'why', 'patient_id']
            },
            mesh: {
              domains: [userContext?.sectorName || 'Health Care'],
              data_products: []
            },
            obc_map: {
              customer_segments: ['New patients', 'Existing patients'],
              value_proposition: ['Fast registration', 'Seamless appointment booking', 'Insurance verification'],
              channels: ['Phone', 'Online portal', 'Walk-in'],
              key_partners: ['Insurance companies', 'EHR vendor']
            }
          })
        },
        {
          type: 'bcp',
          title: 'Patient Registration Process',
          description: 'Step-by-step business process for registering new patients',
          requiredInputs: [
            {
              name: 'ehr_api_endpoint',
              type: 'api',
              description: 'EHR system API endpoint for patient creation',
              required: true,
              placeholder: 'https://ehr.example.com/api/v1/patients'
            },
            {
              name: 'insurance_api_endpoint',
              type: 'api',
              description: 'Insurance eligibility verification API',
              required: true,
              placeholder: 'https://insurance-verify.example.com/api/check'
            },
            {
              name: 'ehr_api_key',
              type: 'text',
              description: 'API key for EHR system',
              required: true,
              placeholder: 'ehr_key_xxxxx'
            }
          ],
          getData: (userContext, inputs) => ({
            bcp_id: `urn:bcp:registration:${Date.now()}`,
            title: 'Patient Registration Process',
            version: '1.0.0',
            owner_name: 'Clinic Operations',
            owner_uri: 'urn:team:ops',
            validity_from: new Date().toISOString(),
            validity_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            customer_segments: ['New patients', 'Returning patients'],
            value_propositions: [
              'Quick 5-minute registration',
              'Real-time insurance verification',
              'Automatic EHR record creation'
            ],
            channels: ['In-person', 'Phone', 'Online form'],
            customer_relationships: ['Personal assistance', 'Self-service'],
            revenue_streams: ['Insurance reimbursement', 'Patient payments'],
            key_resources: [
              { type: 'digital', name: 'EHR API', uri: inputs.ehr_api_endpoint },
              { type: 'digital', name: 'Insurance API', uri: inputs.insurance_api_endpoint },
              { type: 'human', name: 'Intake staff' }
            ],
            key_activities: [
              {
                name: 'Collect Demographics',
                type: 'manual',
                duration_minutes: 3,
                description: 'Gather patient name, DOB, address, contact info',
                inputs: ['patient_form'],
                outputs: ['demographics_data']
              },
              {
                name: 'Verify Insurance',
                type: 'api_call',
                duration_minutes: 2,
                description: 'Check insurance eligibility and coverage',
                api_endpoint: inputs.insurance_api_endpoint,
                inputs: ['insurance_card_data'],
                outputs: ['eligibility_result']
              },
              {
                name: 'Create EHR Record',
                type: 'system',
                duration_minutes: 1,
                description: 'Create patient record in EHR system',
                api_endpoint: inputs.ehr_api_endpoint,
                api_key: inputs.ehr_api_key,
                inputs: ['demographics_data', 'insurance_data'],
                outputs: ['patient_id', 'ehr_record_url']
              },
              {
                name: 'Generate Welcome Packet',
                type: 'automated',
                duration_minutes: 1,
                description: 'Create patient welcome materials',
                inputs: ['patient_id'],
                outputs: ['welcome_packet_pdf']
              }
            ],
            key_partners: [
              'EHR system vendor',
              'Insurance verification service',
              'Payment processor'
            ],
            cost_structure: [
              'EHR system licensing',
              'Insurance verification API fees',
              'Staff time'
            ],
            metrics: {
              cycle_time: 'Average 7 minutes',
              success_rate: '98%',
              insurance_verification_time: 'Average 2 minutes'
            },
            linked_hcp_id: null,
            metadata: {
              process_type: 'patient_intake',
              automation_level: 'partial',
              compliance_frameworks: ['HIPAA']
            }
          })
        },
        {
          type: 'mcp',
          title: 'Appointment Scheduler Agent',
          description: 'AI agent that optimizes appointment scheduling based on provider availability and patient preferences',
          requiredInputs: [
            {
              name: 'calendar_api_endpoint',
              type: 'api',
              description: 'Calendar/scheduling system API endpoint',
              required: true,
              placeholder: 'https://calendar.example.com/api/v1'
            },
            {
              name: 'provider_database_connection',
              type: 'database',
              description: 'Connection string for provider schedules database',
              required: true,
              placeholder: 'postgresql://host:5432/schedules'
            },
            {
              name: 'llm_api_key',
              type: 'text',
              description: 'API key for LLM service (OpenAI, Anthropic, etc.)',
              required: false,
              placeholder: 'sk-xxxxx'
            }
          ],
          getData: (userContext, inputs) => ({
            mcp_id: `urn:mcp:scheduler:${Date.now()}`,
            title: 'Appointment Scheduler Agent',
            version: '1.0.0',
            owner_name: 'Clinic Operations',
            owner_uri: 'urn:team:ops',
            pipeline: {
              name: 'Appointment Scheduling Pipeline',
              stages: [
                {
                  stage: 'data_ingestion',
                  description: 'Fetch provider schedules and patient preferences',
                  inputs: ['provider_schedules', 'patient_preferences'],
                  outputs: ['scheduling_context']
                },
                {
                  stage: 'optimization',
                  description: 'Find optimal appointment slot',
                  model: 'scheduling_optimizer',
                  inputs: ['scheduling_context', 'appointment_request'],
                  outputs: ['recommended_slots']
                },
                {
                  stage: 'booking',
                  description: 'Book the selected appointment',
                  api_call: inputs.calendar_api_endpoint,
                  inputs: ['selected_slot'],
                  outputs: ['appointment_confirmation']
                }
              ]
            },
            tasks: [
              {
                task_id: 'find_slots',
                name: 'Find Available Slots',
                type: 'query',
                description: 'Query provider schedules for availability',
                data_source: inputs.provider_database_connection
              },
              {
                task_id: 'optimize_schedule',
                name: 'Optimize Scheduling',
                type: 'ml_inference',
                description: 'Use ML to find best appointment time',
                model: 'scheduling_optimizer'
              },
              {
                task_id: 'book_appointment',
                name: 'Book Appointment',
                type: 'api_call',
                description: 'Create appointment in calendar system',
                endpoint: inputs.calendar_api_endpoint
              }
            ],
            models: [
              {
                model_id: 'scheduling_optimizer',
                name: 'Scheduling Optimization Model',
                type: 'llm',
                provider: 'openai',
                model_name: 'gpt-4',
                api_key: inputs.llm_api_key || '',
                capabilities: [
                  'availability_checking',
                  'preference_matching',
                  'conflict_resolution',
                  'natural_language_understanding'
                ],
                inputs: ['provider_schedules', 'patient_request', 'appointment_history'],
                outputs: ['recommended_slots', 'reasoning']
              }
            ],
            deployment: {
              environment: 'cloud',
              scalability: 'auto-scale',
              availability: '99.9%'
            },
            monitoring: {
              metrics: ['response_time', 'accuracy', 'user_satisfaction'],
              alerts: [
                { condition: 'error_rate > 5%', action: 'notify_admin' },
                { condition: 'response_time > 5s', action: 'scale_up' }
              ]
            },
            linked_hcp_id: null,
            linked_bcp_id: null,
            metadata: {
              agent_type: 'scheduling_assistant',
              automation_level: 'high',
              learning_enabled: true
            }
          })
        },
        {
          type: 'dcp',
          title: 'Patient Data Hub',
          description: 'Centralized data product for patient information with defined schema and SLAs',
          requiredInputs: [
            {
              name: 'patient_database_connection',
              type: 'database',
              description: 'Primary patient data store connection',
              required: true,
              placeholder: 'postgresql://host:5432/patients'
            },
            {
              name: 'data_retention_days',
              type: 'text',
              description: 'Number of days to retain patient data',
              required: false,
              placeholder: '2555',
              defaultValue: '2555'
            }
          ],
          getData: (userContext, inputs) => ({
            dcp_id: `urn:dcp:patient-hub:${Date.now()}`,
            title: 'Patient Master Data Product',
            version: '1.0.0',
            owner_name: 'Data Team',
            owner_uri: 'urn:team:data',
            domain: userContext?.sectorName || 'Healthcare',
            data_products: [
              {
                name: 'Patient Master Data',
                description: 'Comprehensive patient demographic and appointment data',
                schema: {
                  patient_id: { type: 'uuid', required: true, primary_key: true },
                  demographics: {
                    type: 'object',
                    required: true,
                    properties: {
                      first_name: { type: 'string', required: true },
                      last_name: { type: 'string', required: true },
                      date_of_birth: { type: 'date', required: true },
                      gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
                      address: { type: 'object' },
                      phone: { type: 'string' },
                      email: { type: 'string' }
                    }
                  },
                  insurance: {
                    type: 'object',
                    required: false,
                    properties: {
                      provider: { type: 'string' },
                      policy_number: { type: 'string' },
                      group_number: { type: 'string' },
                      eligibility_status: { type: 'string' },
                      verified_at: { type: 'timestamp' }
                    }
                  },
                  appointments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        appointment_id: { type: 'uuid' },
                        provider_id: { type: 'uuid' },
                        scheduled_time: { type: 'timestamp' },
                        status: { type: 'string', enum: ['scheduled', 'confirmed', 'completed', 'cancelled'] },
                        type: { type: 'string' }
                      }
                    }
                  },
                  created_at: { type: 'timestamp', required: true },
                  updated_at: { type: 'timestamp', required: true }
                },
                quality_rules: [
                  'patient_id must be unique',
                  'date_of_birth must be in past',
                  'phone and email cannot both be null'
                ]
              }
            ],
            contracts: {
              input_ports: [
                {
                  name: 'patient_registration',
                  description: 'New patient registration events',
                  schema: 'PatientRegistration',
                  source: 'BCP Registration Process'
                },
                {
                  name: 'appointment_updates',
                  description: 'Appointment creation and updates',
                  schema: 'AppointmentEvent',
                  source: 'MCP Scheduler Agent'
                }
              ],
              output_ports: [
                {
                  name: 'patient_queries',
                  description: 'Query interface for patient data',
                  schema: 'PatientData',
                  consumers: ['Scheduling System', 'Billing System', 'Clinical Systems']
                }
              ]
            },
            ports: [
              {
                port_id: 'query_api',
                type: 'output',
                protocol: 'REST',
                endpoint: '/api/v1/patients',
                authentication: 'oauth2'
              },
              {
                port_id: 'events_stream',
                type: 'output',
                protocol: 'WebSocket',
                endpoint: '/stream/patient-events',
                authentication: 'api_key'
              }
            ],
            storage: {
              type: 'postgresql',
              connection: inputs.patient_database_connection,
              encryption: 'at_rest_and_transit',
              backup_frequency: 'daily',
              retention_days: parseInt(inputs.data_retention_days || '2555')
            },
            slas: {
              availability: '99.9%',
              freshness: '5m',
              response_time_p95: '200ms',
              data_quality_score: '>=98%'
            },
            policies: [
              {
                policy_id: 'hipaa_compliance',
                name: 'HIPAA Compliance Policy',
                description: 'Ensure all data handling complies with HIPAA',
                rules: [
                  'Encrypt all PHI at rest and in transit',
                  'Maintain audit logs for all access',
                  'Implement role-based access control',
                  'Enable automatic session timeout'
                ]
              },
              {
                policy_id: 'data_quality',
                name: 'Data Quality Policy',
                description: 'Maintain high data quality standards',
                rules: [
                  'Validate all input data',
                  'Check for duplicates before insert',
                  'Monitor data completeness daily',
                  'Alert on quality score below 98%'
                ]
              }
            ],
            linked_hcp_id: null,
            linked_bcp_id: null,
            linked_mcp_id: null,
            metadata: {
              domain: 'patient_management',
              classification: 'sensitive_phi',
              stewardship: 'data_team'
            }
          })
        },
        {
          type: 'tcp',
          title: 'Appointment Confirmation & Reminders',
          description: 'Automated task to send confirmations and reminders to patients',
          requiredInputs: [
            {
              name: 'email_service_api',
              type: 'api',
              description: 'Email service API (SendGrid, AWS SES, etc.)',
              required: true,
              placeholder: 'https://api.sendgrid.com/v3/mail/send'
            },
            {
              name: 'email_api_key',
              type: 'text',
              description: 'Email service API key',
              required: true,
              placeholder: 'SG.xxxxx'
            },
            {
              name: 'sms_service_api',
              type: 'api',
              description: 'SMS service API (Twilio, etc.) - Optional',
              required: false,
              placeholder: 'https://api.twilio.com/2010-04-01'
            },
            {
              name: 'sms_api_key',
              type: 'text',
              description: 'SMS service credentials - Optional',
              required: false,
              placeholder: 'AC_xxxxx:auth_token'
            }
          ],
          getData: (userContext, inputs) => ({
            tcp_id: `urn:tcp:confirmations:${Date.now()}`,
            title: 'Appointment Confirmation & Reminder System',
            version: '1.0.0',
            owner_name: 'Operations Team',
            owner_uri: 'urn:team:ops',
            baseline: {
              metrics: [
                'confirmation_sent_count',
                'reminder_sent_count',
                'delivery_success_rate',
                'patient_response_rate'
              ],
              expected_values: {
                delivery_success_rate: '>=99%',
                patient_response_rate: '>=70%'
              }
            },
            monitoring: {
              triggers: [
                {
                  event: 'appointment_created',
                  source: 'DCP Patient Hub',
                  condition: 'status == "scheduled"',
                  action: 'send_confirmation'
                },
                {
                  event: 'appointment_reminder_24h',
                  source: 'scheduler',
                  condition: 'appointment_time - now == 24h',
                  action: 'send_reminder_24h'
                },
                {
                  event: 'appointment_reminder_2h',
                  source: 'scheduler',
                  condition: 'appointment_time - now == 2h',
                  action: 'send_reminder_2h'
                }
              ],
              actions: [
                {
                  action_id: 'send_confirmation',
                  name: 'Send Appointment Confirmation',
                  type: 'notification',
                  channels: ['email', 'sms'],
                  email_config: {
                    api_endpoint: inputs.email_service_api,
                    api_key: inputs.email_api_key,
                    template: 'appointment_confirmation',
                    subject: 'Appointment Confirmation',
                    from: 'noreply@clinic.example.com'
                  },
                  sms_config: inputs.sms_service_api ? {
                    api_endpoint: inputs.sms_service_api,
                    credentials: inputs.sms_api_key,
                    template: 'sms_confirmation'
                  } : null,
                  retry_policy: {
                    max_attempts: 3,
                    backoff: 'exponential'
                  }
                },
                {
                  action_id: 'send_reminder_24h',
                  name: 'Send 24-Hour Reminder',
                  type: 'notification',
                  channels: ['email', 'sms'],
                  email_config: {
                    api_endpoint: inputs.email_service_api,
                    api_key: inputs.email_api_key,
                    template: 'reminder_24h',
                    subject: 'Appointment Tomorrow',
                    from: 'reminders@clinic.example.com'
                  }
                },
                {
                  action_id: 'send_reminder_2h',
                  name: 'Send 2-Hour Reminder',
                  type: 'notification',
                  channels: ['sms'],
                  sms_config: inputs.sms_service_api ? {
                    api_endpoint: inputs.sms_service_api,
                    credentials: inputs.sms_api_key,
                    template: 'sms_reminder_2h'
                  } : null
                }
              ],
              schedule: {
                check_frequency: '1m',
                batch_size: 100
              }
            },
            drift_config: {
              detection_methods: ['statistical', 'rule_based'],
              thresholds: {
                delivery_failure_rate: '<=1%',
                response_time: '<=30s'
              },
              alert_on_drift: true
            },
            alerting: {
              channels: ['email', 'slack'],
              alert_rules: [
                {
                  condition: 'delivery_failure_rate > 5%',
                  severity: 'high',
                  message: 'High delivery failure rate detected',
                  action: 'notify_ops_team'
                },
                {
                  condition: 'no_confirmations_sent_in_1h',
                  severity: 'medium',
                  message: 'No confirmations sent recently - check system',
                  action: 'check_system_health'
                }
              ]
            },
            linked_dcp_id: null,
            metadata: {
              task_type: 'notification_automation',
              compliance: ['TCPA', 'CAN-SPAM'],
              sla: 'deliver_within_5m'
            }
          })
        }
      ]
    };
  }

  getHealthcareTelehealthWorkflow(): EndToEndWorkflow {
    return {
      id: 'hc-telehealth',
      title: 'Virtual Consultation Workflow',
      description: 'End-to-end telehealth consultation with AI-powered triage and automated follow-up',
      category: 'Telehealth',
      icon: 'Video',
      estimatedSetupTime: '20 minutes',
      complexity: 'intermediate',
      tags: ['telehealth', 'remote-care', 'ai-triage', 'virtual-visits'],
      useCases: [
        'Remote patient consultations',
        'AI-assisted symptom triage',
        'Follow-up care coordination',
        'E-prescribing capabilities'
      ],
      expectedOutcomes: [
        'Increased access to care',
        'Reduced wait times',
        'Better triage accuracy',
        'Improved patient satisfaction'
      ],
      protocols: [
        {
          type: 'hcp',
          title: 'Telehealth Service Context',
          description: 'Operational context for virtual healthcare delivery',
          requiredInputs: [
            {
              name: 'service_name',
              type: 'text',
              description: 'Name of telehealth service',
              required: true,
              placeholder: 'TeleMed Consultations'
            },
            {
              name: 'service_hours',
              type: 'text',
              description: 'Service availability hours',
              required: true,
              defaultValue: 'Mon-Sun 08:00-20:00',
              placeholder: 'Mon-Sun 08:00-20:00'
            }
          ],
          getData: (userContext, inputs) => ({
            hcp_id: `urn:hcp:telehealth:${Date.now()}`,
            title: inputs.service_name || 'Telehealth Service',
            version: '1.0.0',
            owner_name: 'Telehealth Administrator',
            owner_uri: 'did:example:telehealth-admin',
            steward_name: 'Clinical Operations',
            steward_uri: 'urn:team:clinical-ops',
            validity_from: new Date().toISOString(),
            validity_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            identity: {
              humans: [
                { name: 'Telemedicine Physician', uri: 'urn:role:telemed-physician', roles: ['Virtual Consultation'] },
                { name: 'Triage Nurse', uri: 'urn:role:triage-nurse', roles: ['Patient Screening'] },
                { name: 'Technical Support', uri: 'urn:role:tech-support', roles: ['Platform Support'] }
              ],
              stakeholders: [
                { name: 'Remote Patients', uri: 'urn:group:remote-patients' }
              ]
            },
            context: {
              locations: [
                {
                  label: 'Virtual',
                  address: 'Cloud-based telehealth platform',
                  jurisdiction: 'Multi-state'
                }
              ],
              purposes: [
                'Provide remote medical consultations',
                'AI-powered symptom triage',
                'Follow-up care coordination',
                'E-prescribing when appropriate'
              ],
              activities: [
                'Pre-visit AI triage',
                'Video consultation',
                'Clinical documentation',
                'E-prescribe medications',
                'Schedule follow-ups'
              ]
            },
            resources: {
              human: [
                { role: 'Telemedicine Physician', availability: inputs.service_hours },
                { role: 'Triage Nurse', availability: inputs.service_hours }
              ],
              digital: [
                { name: 'Telehealth Platform', uri: 'urn:system:telehealth', category: 'application' },
                { name: 'AI Triage System', uri: 'urn:agent:triage', category: 'model' },
                { name: 'E-Prescribing System', uri: 'urn:system:eprescribe', category: 'application' }
              ],
              physical: [
                { name: 'Telehealth Studio' },
                { name: 'Backup Clinic Space' }
              ]
            },
            rules: {
              permissions: [
                {
                  actor: 'urn:role:telemed-physician',
                  resource: 'urn:system:eprescribe',
                  scopes: ['prescribe:non_controlled', 'prescribe:controlled_with_verification'],
                  constraints: { requires_dea: true }
                }
              ],
              duties: [
                'Verify patient identity before consultation',
                'Ensure HIPAA-compliant video connection',
                'Document all clinical findings',
                'Follow state-specific telehealth regulations'
              ],
              prohibited: [
                'Prescribe controlled substances without proper verification',
                'Store unencrypted patient data',
                'Conduct consultations without patient consent'
              ]
            },
            preferences: {
              style: 'Clear, empathetic, adapted for virtual setting',
              scheduling: 'Enable video when possible, provide written summaries',
              clinical: 'Use AI triage to prioritize urgent cases'
            },
            delegation: {
              on_behalf_of: [
                { human: 'urn:role:telemed-physician', agent: 'urn:agent:triage' }
              ],
              escalation: {
                to: 'urn:role:senior-physician',
                channel: 'immediate_page',
                reason_triggers: ['severe_symptoms', 'diagnostic_uncertainty', 'technical_failure']
              }
            },
            audit: {
              log_to: 'urn:log:telehealth',
              retain_days: 2555,
              content: ['who', 'what', 'when', 'patient_id', 'session_recording_ref', 'clinical_notes']
            },
            mesh: {
              domains: [userContext?.sectorName || 'Health Care'],
              data_products: ['Virtual Visit Records', 'Triage Data']
            },
            obc_map: {
              customer_segments: ['Remote patients', 'Chronic disease management', 'Follow-up consultations'],
              value_proposition: ['Convenient access', 'Reduced wait times', 'AI-assisted triage'],
              channels: ['Mobile app', 'Web portal', 'Phone'],
              key_partners: ['Telehealth platform vendor', 'E-prescribing network', 'Pharmacy partners']
            }
          })
        }
        // Additional protocols would follow similar pattern
      ]
    };
  }

  getAllWorkflows(userContext: UserContext | null): EndToEndWorkflow[] {
    const workflows: EndToEndWorkflow[] = [];

    // Healthcare workflows
    if (!userContext || userContext.sectorName === 'Health Care') {
      workflows.push(this.getHealthcarePatientIntakeWorkflow());
      workflows.push(this.getHealthcareTelehealthWorkflow());
    }

    // Add other industry workflows as needed

    return workflows;
  }
}

export const endToEndWorkflowService = new EndToEndWorkflowService();
