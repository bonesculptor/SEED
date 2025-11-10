import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, AlertTriangle, Sparkles, Workflow } from 'lucide-react';
import { protocolService } from '../../services/protocolService';
import { hcpValidator } from '../../validators/hcpValidator';
import { HumanContext } from '../../lib/supabase';
import { RDFExportButton, RDFMultiExportButton } from '../RDFExportButton';
import { userContextService, UserContext } from '../../services/userContextService';
import { hcpTemplateService, HCPTemplate } from '../../services/hcpTemplateService';
import { WorkflowTemplateGallery } from '../WorkflowTemplateGallery';

export function HCPPanel({ onUpdate }: { onUpdate: () => void }) {
  const [contexts, setContexts] = useState<HumanContext[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showWorkflowGallery, setShowWorkflowGallery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeContext, setActiveContext] = useState<UserContext | null>(null);
  const [templates, setTemplates] = useState<HCPTemplate[]>([]);

  useEffect(() => {
    loadContexts();
    loadActiveContext();
  }, []);

  const loadActiveContext = async () => {
    const context = await userContextService.getActiveContext();
    setActiveContext(context);
    if (context) {
      const generatedTemplates = hcpTemplateService.generateTemplates(context);
      setTemplates(generatedTemplates);
    }
  };

  const loadContexts = async () => {
    try {
      setLoading(true);
      const data = await protocolService.getHumanContexts();
      setContexts(data || []);
    } catch (error) {
      console.error('Error loading HCPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createHCPFromTemplate = async (template: HCPTemplate) => {
    try {
      const hcp = {
        hcp_id: `urn:hcp:${activeContext?.gicsSubIndustry || 'default'}:${Date.now()}`,
        title: template.title,
        version: '1.0.0',
        owner_name: 'User',
        owner_uri: 'did:example:user',
        steward_name: 'Operations Team',
        steward_uri: 'urn:team:ops',
        validity_from: new Date().toISOString(),
        validity_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        identity: {
          humans: [
            { name: 'User', uri: 'did:example:user', roles: ['Owner'] }
          ],
          stakeholders: []
        },
        context: template.context,
        resources: template.resources,
        rules: template.rules,
        preferences: template.preferences,
        delegation: {
          on_behalf_of: [],
          escalation: {
            to: 'did:example:user',
            channel: 'email',
            reason_triggers: ['budget_exceed', 'scope_expansion']
          }
        },
        audit: {
          log_to: 'urn:log:hcp',
          retain_days: 365,
          content: ['who', 'what', 'why', 'input_refs', 'output_refs']
        },
        mesh: {
          domains: [activeContext?.sectorName || 'General'],
          data_products: []
        },
        obc_map: {
          customer_segments: [],
          value_proposition: [],
          channels: [],
          key_partners: []
        }
      };

      const validation = hcpValidator.validate(hcp);
      const created = await protocolService.createHumanContext(hcp);
      await protocolService.validateProtocol('hcp', created.id, validation);

      await loadContexts();
      onUpdate();
      setShowTemplates(false);
    } catch (error) {
      console.error('Error creating HCP from template:', error);
      alert('Error creating HCP: ' + (error as Error).message);
    }
  };

  const createSampleHCP = async () => {
    try {
      const sampleHCP = {
        hcp_id: `urn:hcp:example:${Date.now()}`,
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
            { name: 'Patients', uri: 'urn:group:patients' }
          ]
        },
        context: {
          locations: [
            {
              label: 'Clinic',
              geo: { lat: 24.493, lon: 54.383 },
              address: 'Al Reem Island, Abu Dhabi, UAE',
              jurisdiction: 'UAE'
            }
          ],
          purposes: ['Deliver outpatient ortho consults', 'Collect de-identified outcomes'],
          activities: ['Book appointments', 'Examine patient', 'Order imaging']
        },
        resources: {
          human: [{ role: 'Nurse', availability: 'Sun–Thu 08:00–16:00' }],
          digital: [
            { name: 'EHR API', uri: 'urn:api:ehr', category: 'dataset' },
            { name: 'Clinical Agent', uri: 'urn:agent:clinic-llm', category: 'model' }
          ],
          physical: [{ name: 'Exam Room 1' }]
        },
        rules: {
          permissions: [
            {
              actor: 'urn:agent:clinic-llm',
              resource: 'urn:api:ehr',
              scopes: ['read:appointments', 'write:notes'],
              constraints: { pii: 'mask', rate_limit_per_min: 10 }
            }
          ],
          duties: ['Comply with local health data laws'],
          prohibited: ['Export raw PII outside jurisdiction']
        },
        preferences: {
          style: 'Professional, British English',
          scheduling: 'Avoid Fridays 12:00–14:00',
          clinical: 'Prioritise infection control advice'
        },
        delegation: {
          on_behalf_of: [{ human: 'did:example:simon', agent: 'urn:agent:clinic-llm' }],
          escalation: {
            to: 'did:example:simon',
            channel: 'push',
            reason_triggers: ['budget_exceed', 'scope_expansion']
          }
        },
        audit: {
          log_to: 'urn:log:hcp',
          retain_days: 365,
          content: ['who', 'what', 'why', 'input_refs', 'output_refs']
        },
        mesh: {
          domains: ['CareDelivery', 'Finance'],
          data_products: [
            {
              name: 'Appointments DP',
              owner: 'Ops',
              contract: 'https://example.com/contracts/appointments.json',
              sla: { freshness: '<=5m' }
            }
          ]
        },
        obc_map: {
          customer_segments: ['Patients in Abu Dhabi'],
          value_proposition: ['Fast ortho assessments with infection risk scoring'],
          channels: ['Clinic site', 'WhatsApp assistant'],
          key_partners: ['Hospital Imaging Dept']
        }
      };

      const validation = hcpValidator.validate(sampleHCP);

      const created = await protocolService.createHumanContext(sampleHCP);

      await protocolService.validateProtocol('hcp', created.id, validation);

      await loadContexts();
      onUpdate();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating HCP:', error);
      alert('Error creating HCP: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Human Context Protocol (HCP)</h2>
            <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">Identity, roles, locations, purposes, and preferences</p>
            {activeContext && (
              <p className="text-xs text-blue-600 dark:text-cyber-blue mt-1">
                Active Context: {activeContext.sectorName} → {activeContext.subIndustryName || activeContext.industryName || 'General'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {contexts.length > 0 && (
              <RDFMultiExportButton protocols={contexts} protocolType="hcp" />
            )}
            {activeContext && (
              <button
                onClick={() => setShowWorkflowGallery(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-colors"
              >
                <Workflow className="w-4 h-4" />
                Workflow Templates
              </button>
            )}
            {activeContext && templates.length > 0 && (
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                HCP Templates
              </button>
            )}
            <button
              onClick={createSampleHCP}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-cyber-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-cyber-blue-glow transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Sample HCP
            </button>
          </div>
        </div>

        {/* Workflow Gallery Modal */}
        {showWorkflowGallery && (
          <WorkflowTemplateGallery onClose={() => {
            setShowWorkflowGallery(false);
            loadContexts();
            onUpdate();
          }} />
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text">
                      Context-Aware HCP Templates
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">
                      Based on: {activeContext?.sectorName} → {activeContext?.subIndustryName || activeContext?.industryName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {templates.map((template, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 dark:border-dark-border rounded-lg p-4 hover:border-blue-400 dark:hover:border-cyber-blue transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-dark-text">
                          {template.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">
                          {template.description}
                        </p>
                      </div>
                      <button
                        onClick={() => createHCPFromTemplate(template)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Use Template
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-slate-700 dark:text-dark-text">Purposes:</span>
                        <ul className="list-disc list-inside text-slate-600 dark:text-dark-muted mt-1">
                          {template.context.purposes.slice(0, 2).map((purpose, i) => (
                            <li key={i}>{purpose}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 dark:text-dark-text">Resources:</span>
                        <ul className="list-disc list-inside text-slate-600 dark:text-dark-muted mt-1">
                          {template.resources.human.slice(0, 2).map((resource, i) => (
                            <li key={i}>{resource.role}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading contexts...</div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">No Human Context Protocols created yet</p>
            <button
              onClick={createSampleHCP}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first HCP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contexts.map((context) => (
              <HCPCard key={context.id} context={context} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HCPCard({ context }: { context: HumanContext }) {
  const [expanded, setExpanded] = useState(false);
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    const result = hcpValidator.validate(context);
    setValidation(result);
  }, [context]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div
        className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-900">{context.title}</h3>
              {validation?.conforms ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {validation?.warnings.length > 0 && (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              {context.owner_name} • v{context.version} • {context.hcp_id}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RDFExportButton protocol={context} />
            <div className="text-sm text-slate-500">
              {expanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-slate-200 space-y-4">
          {validation && (
            <div className="space-y-2">
              {validation.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                  <ul className="space-y-1">
                    {validation.errors.map((error: any, i: number) => (
                      <li key={i} className="text-sm text-red-700">
                        <span className="font-medium">{error.path}:</span> {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Warnings</h4>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning: any, i: number) => (
                      <li key={i} className="text-sm text-orange-700">
                        <span className="font-medium">{warning.path}:</span> {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.conforms && validation.warnings.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ All validation checks passed</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Identity</h4>
              <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(context.identity, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Context</h4>
              <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(context.context, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Rules</h4>
              <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(context.rules, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Preferences</h4>
              <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(context.preferences, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
