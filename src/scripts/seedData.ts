import { protocolService } from '../services/protocolService';
import { hcpValidator } from '../validators/hcpValidator';
import { bcpValidator } from '../validators/bcpValidator';
import { mcpValidator } from '../validators/mcpValidator';
import { dcpValidator } from '../validators/dcpValidator';
import { tcpValidator } from '../validators/tcpValidator';

export async function seedAllProtocols() {
  console.log('Starting protocol seeding...');

  const hcp = await seedHCP();
  console.log('Created HCP:', hcp.id);

  const bcp = await seedBCP(hcp.id);
  console.log('Created BCP:', bcp.id);

  const mcp = await seedMCP(hcp.id, bcp.id);
  console.log('Created MCP:', mcp.id);

  const dcp = await seedDCP(hcp.id, bcp.id, mcp.id);
  console.log('Created DCP:', dcp.id);

  const tcp = await seedTCP(dcp.id);
  console.log('Created TCP:', tcp.id);

  await linkProtocols(hcp.id, bcp.id, mcp.id, dcp.id, tcp.id);
  console.log('Linked all protocols');

  console.log('Seeding complete!');
}

async function seedHCP() {
  const hcp = {
    hcp_id: `urn:hcp:example:seed-${Date.now()}`,
    title: 'Abu Dhabi Outpatient Ortho Clinic',
    version: '1.0.0',
    owner_name: 'Simon Grange',
    owner_uri: 'did:example:simon',
    steward_name: 'Operations Team',
    steward_uri: 'urn:team:ops',
    validity_from: '2025-01-01T00:00:00Z',
    validity_to: '2025-12-31T23:59:59Z',
    timezone: 'Asia/Dubai',
    identity: {
      humans: [
        { name: 'Simon Grange', uri: 'did:example:simon', roles: ['Clinician', 'Founder'] }
      ],
      stakeholders: [
        { name: 'Patients', uri: 'urn:group:patients' },
        { name: 'Insurance Providers', uri: 'urn:group:insurers' }
      ]
    },
    context: {
      locations: [
        {
          label: 'Main Clinic',
          geo: { lat: 24.493, lon: 54.383 },
          address: 'Al Reem Island, Abu Dhabi, UAE',
          jurisdiction: 'UAE'
        }
      ],
      purposes: [
        'Deliver outpatient ortho consults',
        'Collect de-identified outcomes',
        'Infection risk assessment'
      ],
      activities: [
        'Book appointments',
        'Examine patient',
        'Order imaging',
        'Prescribe treatment',
        'Follow-up care'
      ]
    },
    resources: {
      human: [
        { role: 'Nurse', availability: 'Sun–Thu 08:00–16:00', count: 2 },
        { role: 'Radiologist', availability: 'On-call', count: 1 }
      ],
      digital: [
        { name: 'EHR API', uri: 'urn:api:ehr', category: 'dataset' },
        { name: 'Clinical Agent', uri: 'urn:agent:clinic-llm', category: 'model' },
        { name: 'Imaging System', uri: 'urn:system:pacs', category: 'integration' }
      ],
      physical: [
        { name: 'Exam Room 1' },
        { name: 'Exam Room 2' },
        { name: 'X-Ray Suite' }
      ]
    },
    rules: {
      permissions: [
        {
          actor: 'urn:agent:clinic-llm',
          resource: 'urn:api:ehr',
          scopes: ['read:appointments', 'write:notes', 'read:history'],
          constraints: { pii: 'mask', rate_limit_per_min: 10 }
        },
        {
          actor: 'urn:system:pacs',
          resource: 'urn:api:ehr',
          scopes: ['read:orders', 'write:results'],
          constraints: { encryption: 'required' }
        }
      ],
      duties: [
        'Comply with local health data laws',
        'Maintain patient confidentiality',
        'Report adverse events'
      ],
      prohibited: [
        'Export raw PII outside jurisdiction',
        'Share data without consent',
        'Modify historical records'
      ]
    },
    preferences: {
      style: 'Professional, British English',
      scheduling: 'Avoid Fridays 12:00–14:00',
      clinical: 'Prioritise infection control advice',
      communication: 'SMS reminders 24h before appointment'
    },
    delegation: {
      on_behalf_of: [
        { human: 'did:example:simon', agent: 'urn:agent:clinic-llm' }
      ],
      escalation: {
        to: 'did:example:simon',
        channel: 'push',
        reason_triggers: ['budget_exceed', 'scope_expansion', 'safety_concern']
      }
    },
    audit: {
      log_to: 'urn:log:hcp',
      retain_days: 365,
      content: ['who', 'what', 'why', 'input_refs', 'output_refs', 'timestamp']
    },
    mesh: {
      domains: ['CareDelivery', 'Finance', 'Operations'],
      data_products: [
        {
          name: 'Appointments DP',
          owner: 'Ops',
          contract: 'https://example.com/contracts/appointments.json',
          sla: { freshness: '<=5m' }
        },
        {
          name: 'Clinical Records DP',
          owner: 'Clinical',
          contract: 'https://example.com/contracts/records.json',
          sla: { freshness: '<=1m' }
        }
      ]
    },
    obc_map: {
      customer_segments: ['Patients in Abu Dhabi', 'Corporate wellness clients'],
      value_proposition: [
        'Fast ortho assessments with infection risk scoring',
        'Same-day imaging and diagnosis'
      ],
      channels: ['Clinic site', 'WhatsApp assistant', 'Telemedicine'],
      key_partners: ['Hospital Imaging Dept', 'Insurance Networks']
    }
  };

  const validation = hcpValidator.validate(hcp);
  const created = await protocolService.createHumanContext(hcp);
  await protocolService.validateProtocol('hcp', created.id, validation);

  return created;
}

async function seedBCP(linkedHcpId: string) {
  const bcp = {
    bcp_id: `urn:bcp:example:seed-${Date.now()}`,
    title: 'Ortho Clinic Business Model',
    version: '1.0.0',
    owner_name: 'Simon Grange',
    owner_uri: 'did:example:simon',
    validity_from: '2025-01-01T00:00:00Z',
    validity_to: '2025-12-31T23:59:59Z',
    customer_segments: [
      {
        name: 'Individual Patients',
        description: 'Walk-in and appointment-based ortho patients',
        size: 'Large'
      },
      {
        name: 'Corporate Wellness',
        description: 'Company-sponsored health programs',
        size: 'Medium'
      }
    ],
    value_propositions: [
      {
        name: 'Fast Diagnosis',
        description: 'Same-day imaging and consultation results',
        differentiation: 'High'
      },
      {
        name: 'AI-Assisted Risk Assessment',
        description: 'Infection risk scoring powered by ML',
        differentiation: 'Very High'
      }
    ],
    channels: [
      { name: 'Physical Clinic', type: 'physical', reach: 'local' },
      { name: 'WhatsApp Booking', type: 'digital', reach: 'regional' },
      { name: 'Telemedicine Portal', type: 'digital', reach: 'national' }
    ],
    customer_relationships: [
      { segment: 'Individual Patients', type: 'personal assistance' },
      { segment: 'Corporate Wellness', type: 'dedicated account manager' }
    ],
    revenue_streams: [
      { name: 'Consultation fees', type: 'transaction', recurring: false },
      { name: 'Corporate contracts', type: 'subscription', recurring: true },
      { name: 'Telemedicine fees', type: 'usage', recurring: false }
    ],
    key_resources: [
      { name: 'Medical Staff', type: 'human', criticality: 'high' },
      { name: 'EHR System', type: 'digital', criticality: 'high' },
      { name: 'AI Models', type: 'intellectual', criticality: 'medium' },
      { name: 'Clinic Space', type: 'physical', criticality: 'high' }
    ],
    key_activities: [
      { name: 'Patient Consultations', category: 'service delivery' },
      { name: 'Model Training', category: 'innovation' },
      { name: 'Partner Management', category: 'relationship' }
    ],
    key_partners: [
      { name: 'Hospital Imaging Dept', relationship: 'supplier', value: 'imaging services' },
      { name: 'Insurance Networks', relationship: 'channel', value: 'patient access' },
      { name: 'ML Platform Provider', relationship: 'technology', value: 'AI infrastructure' }
    ],
    cost_structure: [
      { name: 'Staff Salaries', type: 'fixed', amount: 180000, currency: 'AED', period: 'annual' },
      { name: 'Equipment Leasing', type: 'fixed', amount: 60000, currency: 'AED', period: 'annual' },
      { name: 'ML Platform Costs', type: 'variable', amount: 2000, currency: 'AED', period: 'monthly' },
      { name: 'Marketing', type: 'variable', amount: 5000, currency: 'AED', period: 'monthly' }
    ],
    metrics: {
      patient_satisfaction: { current: 4.3, target: 4.5, unit: 'stars' },
      monthly_revenue: { current: 45000, target: 60000, unit: 'AED' },
      patient_volume: { current: 120, target: 150, unit: 'patients/month' },
      net_promoter_score: { current: 35, target: 50, unit: 'score' }
    },
    linked_hcp_id: linkedHcpId
  };

  const validation = bcpValidator.validate(bcp);
  const created = await protocolService.createBusinessContext(bcp);
  await protocolService.validateProtocol('bcp', created.id, validation);

  return created;
}

async function seedMCP(linkedHcpId: string, linkedBcpId: string) {
  const mcp = {
    mcp_id: `urn:mcp:example:seed-${Date.now()}`,
    title: 'Infection Risk Prediction Pipeline',
    version: '2.1.0',
    owner_name: 'ML Engineering Team',
    owner_uri: 'urn:team:ml',
    pipeline: {
      name: 'infection-risk-pipeline-v2',
      description: 'End-to-end pipeline for infection risk assessment',
      stages: [
        'data_ingestion',
        'data_validation',
        'feature_engineering',
        'model_training',
        'model_evaluation',
        'model_deployment',
        'monitoring'
      ],
      schedule: 'daily at 02:00 UTC'
    },
    tasks: [
      {
        name: 'Predict surgical infection risk',
        type: 'binary_classification',
        target: 'infection_risk',
        features: ['age', 'bmi', 'diabetes', 'smoking', 'previous_surgeries']
      },
      {
        name: 'Estimate recovery time',
        type: 'regression',
        target: 'days_to_recovery',
        features: ['age', 'procedure_type', 'comorbidities']
      }
    ],
    models: [
      {
        name: 'InfectionRiskClassifier-RF',
        type: 'ensemble',
        algorithm: 'RandomForest',
        framework: 'scikit-learn',
        version: '2.1.0',
        performance: { accuracy: 0.89, precision: 0.87, recall: 0.91, f1: 0.89 }
      },
      {
        name: 'RecoveryTimeEstimator-XGB',
        type: 'gradient_boosting',
        algorithm: 'XGBoost',
        framework: 'xgboost',
        version: '1.5.0',
        performance: { rmse: 2.3, mae: 1.8, r2: 0.82 }
      }
    ],
    deployment: {
      environment: 'production',
      platform: 'kubernetes',
      endpoints: [
        { path: '/api/v2/predict/infection-risk', method: 'POST' },
        { path: '/api/v2/predict/recovery-time', method: 'POST' }
      ],
      replicas: 3,
      resources: { cpu: '500m', memory: '1Gi' },
      autoscaling: { min: 2, max: 10, target_cpu: 70 }
    },
    monitoring: {
      metrics: [
        'accuracy',
        'precision',
        'recall',
        'f1_score',
        'latency_p95',
        'throughput',
        'error_rate'
      ],
      alerting: {
        threshold_accuracy: 0.85,
        threshold_latency_p95: 500,
        threshold_error_rate: 0.05
      },
      dashboards: ['grafana://ml-models', 'datadog://infection-risk']
    },
    linked_hcp_id: linkedHcpId,
    linked_bcp_id: linkedBcpId
  };

  const validation = mcpValidator.validate(mcp);
  const created = await protocolService.createMachineContext(mcp);
  await protocolService.validateProtocol('mcp', created.id, validation);

  return created;
}

async function seedDCP(linkedHcpId: string, linkedBcpId: string, linkedMcpId: string) {
  const dcp = {
    dcp_id: `urn:dcp:example:seed-${Date.now()}`,
    title: 'Clinical Data Mesh',
    version: '1.2.0',
    owner_name: 'Data Platform Team',
    owner_uri: 'urn:team:data',
    domain: 'CareDelivery',
    data_products: [
      {
        name: 'Appointments Data Product',
        description: 'Patient appointments and scheduling data',
        owner: 'Operations Team',
        owner_uri: 'urn:team:ops',
        contract: 'https://example.com/contracts/appointments-v1.json',
        schema: {
          type: 'object',
          properties: {
            appointment_id: { type: 'string' },
            patient_id: { type: 'string' },
            datetime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] }
          }
        },
        quality_metrics: { completeness: 0.99, accuracy: 0.97, timeliness: 0.95 }
      },
      {
        name: 'Clinical Records Data Product',
        description: 'Patient medical records and history',
        owner: 'Clinical Team',
        owner_uri: 'urn:team:clinical',
        contract: 'https://example.com/contracts/records-v1.json',
        schema: {
          type: 'object',
          properties: {
            record_id: { type: 'string' },
            patient_id: { type: 'string' },
            diagnosis: { type: 'array' },
            medications: { type: 'array' }
          }
        },
        quality_metrics: { completeness: 0.96, accuracy: 0.98, timeliness: 0.99 }
      }
    ],
    contracts: {
      appointments_v1: {
        version: '1.0.0',
        format: 'json-schema',
        breaking_change_policy: 'major_version'
      },
      records_v1: {
        version: '1.0.0',
        format: 'json-schema',
        breaking_change_policy: 'major_version'
      }
    },
    ports: [
      { name: 'appointments-rest-api', type: 'output', protocol: 'REST', url: '/api/v1/appointments' },
      { name: 'appointments-stream', type: 'output', protocol: 'Kafka', topic: 'appointments.events' },
      { name: 'records-rest-api', type: 'output', protocol: 'REST', url: '/api/v1/records' }
    ],
    storage: {
      type: 'postgresql',
      provider: 'supabase',
      region: 'uae-central',
      encryption: 'AES-256',
      backup_frequency: 'hourly',
      retention_days: 2555
    },
    slas: {
      freshness: '<=5m',
      completeness: '>=95%',
      accuracy: '>=90%',
      availability: '99.9%',
      response_time_p95: '200ms'
    },
    policies: [
      {
        type: 'odrl:Policy',
        uid: 'policy:appointments:read',
        permission: {
          action: 'read',
          assignee: 'authenticated_users',
          target: 'appointments_dp',
          constraint: { purpose: 'care_delivery' }
        }
      },
      {
        type: 'odrl:Policy',
        uid: 'policy:records:read',
        permission: {
          action: 'read',
          assignee: 'clinical_staff',
          target: 'records_dp',
          constraint: { purpose: 'treatment', pii_masking: 'required' }
        }
      }
    ],
    linked_hcp_id: linkedHcpId,
    linked_bcp_id: linkedBcpId,
    linked_mcp_id: linkedMcpId
  };

  const validation = dcpValidator.validate(dcp);
  const created = await protocolService.createDataContext(dcp);
  await protocolService.validateProtocol('dcp', created.id, validation);

  return created;
}

async function seedTCP(linkedDcpId: string) {
  const tcp = {
    tcp_id: `urn:tcp:example:seed-${Date.now()}`,
    title: 'Infection Risk Model Drift Monitor',
    version: '1.0.0',
    owner_name: 'QA & Monitoring Team',
    owner_uri: 'urn:team:qa',
    baseline: {
      snapshot_date: '2025-01-01T00:00:00Z',
      description: 'Initial production deployment baseline',
      metrics: {
        model_accuracy: 0.89,
        prediction_confidence_mean: 0.87,
        prediction_confidence_std: 0.12,
        inference_latency_p95: 145
      },
      data_snapshot: {
        age: Array.from({ length: 1000 }, () => Math.random() * 60 + 20),
        bmi: Array.from({ length: 1000 }, () => Math.random() * 20 + 18),
        temperature: Array.from({ length: 1000 }, () => Math.random() * 3 + 36),
        white_blood_cell_count: Array.from({ length: 1000 }, () => Math.random() * 8000 + 4000)
      },
      feature_distributions: {
        age: { mean: 45.2, std: 15.3, min: 20, max: 80 },
        bmi: { mean: 26.5, std: 4.2, min: 18, max: 38 },
        temperature: { mean: 37.1, std: 0.8, min: 36, max: 39 }
      }
    },
    monitoring: {
      frequency: 'daily',
      schedule: '00:00 UTC',
      retention_days: 90,
      comparison_window: '7d'
    },
    drift_config: {
      methods: ['PSI', 'KS', 'KL_divergence', 'JS_divergence'],
      thresholds: {
        psi: 0.1,
        ks: 0.2,
        kl: 0.15,
        js: 0.1
      },
      bins: 10,
      min_samples: 100,
      velocity_calculation: 'rolling_7d'
    },
    alerting: {
      enabled: true,
      channels: ['email', 'slack', 'pagerduty'],
      recipients: ['qa@example.com', 'ml-team@example.com'],
      severity_levels: {
        warning: { psi_threshold: 0.1, action: 'notify' },
        critical: { psi_threshold: 0.25, action: 'notify_and_page' }
      },
      escalation: {
        if_unacknowledged_minutes: 30,
        escalate_to: 'cto@example.com'
      }
    },
    linked_dcp_id: linkedDcpId
  };

  const validation = tcpValidator.validate(tcp);
  const created = await protocolService.createTestContext(tcp);
  await protocolService.validateProtocol('tcp', created.id, validation);

  return created;
}

async function linkProtocols(
  hcpId: string,
  bcpId: string,
  mcpId: string,
  dcpId: string,
  tcpId: string
) {
  await protocolService.linkProtocols('hcp', hcpId, 'bcp', bcpId, 'supports');
  await protocolService.linkProtocols('bcp', bcpId, 'mcp', mcpId, 'implements');
  await protocolService.linkProtocols('mcp', mcpId, 'dcp', dcpId, 'consumes');
  await protocolService.linkProtocols('dcp', dcpId, 'tcp', tcpId, 'monitors');
}
