import React from 'react';
import { Users, Building2, Cpu, Database, TestTube, GitBranch, Shield, Globe, Leaf } from 'lucide-react';

interface ProtocolInfo {
  name: string;
  abbreviation: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
  purpose: string;
  keyFeatures: string[];
  useCases: string[];
  governanceRules?: string[];
}

export function AboutProtocols() {
  const protocols: ProtocolInfo[] = [
    {
      name: 'Human Context Protocol',
      abbreviation: 'HCP',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Captures human intentions, roles, requirements, and interactions within the system.',
      purpose: 'Define and manage human actors, their roles, permissions, and business needs that drive all other protocols.',
      keyFeatures: [
        'User role management (CEO, Director, Manager, Employee)',
        'Business function mapping (Strategy, Marketing, Finance, HR, etc.)',
        'User story and requirement capture',
        'Permission and authorization definitions',
        'Human oversight and approval workflows',
      ],
      useCases: [
        'Strategic planning initiated by executives',
        'Business process requests from department heads',
        'Approval workflows for compliance',
        'Human-in-the-loop decision gates',
        'User context and session management',
      ],
      governanceRules: [
        'HCP instructs BCP (Human requirements define business processes)',
        'HCP + GCP required for DCP access (Dual authorization)',
        'HCP used for critical decision points and escalations',
      ],
    },
    {
      name: 'Business Context Protocol',
      abbreviation: 'BCP',
      icon: Building2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Defines business processes, rules, workflows, and the Business Model Canvas for your organization.',
      purpose: 'Map business operations from your CSV processes (14 domains) and implement business logic across the system.',
      keyFeatures: [
        '14 business domains from PCF framework',
        'Business Model Canvas (9 building blocks)',
        'Process hierarchy (1.0, 1.1, 1.1.1 levels)',
        'Workflow automation and triggers',
        'Business rules and constraints',
      ],
      useCases: [
        'Strategic planning (1.0 - Develop Vision & Strategy)',
        'Product development (2.0)',
        'Marketing and sales (3.0)',
        'Service delivery (5.0)',
        'Customer service management (6.0)',
      ],
      governanceRules: [
        'BCP receives instructions from HCP',
        'BCP initiates MCP operations',
        'BCP integrates with all business automations',
      ],
    },
    {
      name: 'Machine Context Protocol',
      abbreviation: 'MCP',
      icon: Cpu,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Manages AI agents, machine learning models, and automated processing operations.',
      purpose: 'Execute business logic through AI agents and ML models, implementing the 21 agent patterns.',
      keyFeatures: [
        '21 agent patterns (Routing, Parallelization, RAG, etc.)',
        'ML model registry (ARIMA, Prophet, State Space, Agentic Twin)',
        'Agent orchestration and coordination',
        'Processing pipelines and workflows',
        'Model deployment and versioning',
      ],
      useCases: [
        'Automated data processing and analysis',
        'ML-powered forecasting and predictions',
        'Natural language processing and generation',
        'Pattern recognition and classification',
        'Intelligent routing and decision-making',
      ],
      governanceRules: [
        'MCP initiated by BCP business processes',
        'MCP accesses data through DCP',
        'MCP outputs validated by TCP',
      ],
    },
    {
      name: 'Data Context Protocol',
      abbreviation: 'DCP',
      icon: Database,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Controls data access, storage, retrieval, and integration with external data sources including ODOO ERP.',
      purpose: 'Manage all data operations with strict permission controls requiring dual authorization (HCP + GCP).',
      keyFeatures: [
        'ODOO PostgreSQL integration',
        'Database table mappings',
        'Data access permissions and audit logs',
        'Real-time data synchronization',
        'Data quality and validation',
      ],
      useCases: [
        'ODOO ERP data access (customers, products, orders)',
        'External API data retrieval',
        'Database queries and updates',
        'Data warehouse operations',
        'Business intelligence and reporting',
      ],
      governanceRules: [
        'DCP requires HCP + GCP permission (CRITICAL)',
        'All data access logged in audit trail',
        'Data cannot be accessed without proper authorization',
      ],
    },
    {
      name: 'Test Context Protocol',
      abbreviation: 'TCP',
      icon: TestTube,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Ensures quality, validation, testing, and verification of all system operations and outputs.',
      purpose: 'Validate quality of all processes, from data to models to business outcomes, ensuring reliability.',
      keyFeatures: [
        'Integration testing frameworks',
        'Penetration testing and security scans',
        'Quality assurance and validation',
        'Performance benchmarking',
        'Regression testing',
      ],
      useCases: [
        'Validate ML model predictions',
        'Test API integrations',
        'Verify business rule compliance',
        'Check data quality and consistency',
        'Ensure SLA compliance',
      ],
      governanceRules: [
        'TCP validates all MCP outputs',
        'TCP ensures quality before delivery to HCP',
        'TCP logs all test results and metrics',
      ],
    },
    {
      name: 'Agent Context Protocol',
      abbreviation: 'ACP',
      icon: GitBranch,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Registry and management of all agents, their capabilities, status, and coordination.',
      purpose: 'Centralized agent registry enabling multi-agent workflows with proper governance and orchestration.',
      keyFeatures: [
        'Agent registry and discovery',
        'Agent capabilities and skills mapping',
        'Multi-agent coordination patterns',
        'Agent health monitoring',
        'Load balancing and routing',
      ],
      useCases: [
        'Multi-agent collaboration workflows',
        'Distributed task processing',
        'Agent selection and routing',
        'Capability-based agent matching',
        'Agent performance tracking',
      ],
      governanceRules: [
        'ACP governed by GCP (all agent actions authorized)',
        'ACP operates within ECP constraints',
        'ACP coordinates MCP operations',
      ],
    },
    {
      name: 'Governance Context Protocol',
      abbreviation: 'GCP',
      icon: Shield,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      description: 'Top-level governance, compliance, security, audit, and authorization for the entire system.',
      purpose: 'Enforce compliance, manage permissions, log all actions, and ensure regulatory adherence across all protocols.',
      keyFeatures: [
        'Compliance frameworks (GDPR, HIPAA, SOX, ISO27001)',
        'Audit logging and trails',
        'Permission and authorization management',
        'Risk assessment and management',
        'Policy enforcement',
      ],
      useCases: [
        'Regulatory compliance checking',
        'Security policy enforcement',
        'Access control and authorization',
        'Audit trail generation',
        'Risk and compliance reporting',
      ],
      governanceRules: [
        'GCP governs ACP (authorizes all agent actions)',
        'GCP + HCP required for DCP access',
        'GCP logs all critical operations',
        'GCP is the highest authority in the hierarchy',
      ],
    },
    {
      name: 'Geographical Context Protocol',
      abbreviation: 'GeoCP',
      icon: Globe,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      description: 'Location-based rules, regional regulations, jurisdictional compliance, and geographical constraints.',
      purpose: 'Apply location-specific regulations, cultural considerations, and geographical business rules.',
      keyFeatures: [
        'Regional regulatory compliance',
        'Jurisdictional data residency rules',
        'Cultural and linguistic considerations',
        'Time zone management',
        'Location-based service routing',
      ],
      useCases: [
        'GDPR compliance for EU operations',
        'Regional tax and legal requirements',
        'Multi-national deployment',
        'Location-based service delivery',
        'Cross-border data transfer compliance',
      ],
      governanceRules: [
        'GeoCP enforces location-specific rules',
        'GeoCP integrates with GCP for compliance',
        'GeoCP affects routing and data storage decisions',
      ],
    },
    {
      name: 'Ecosystem Context Protocol',
      abbreviation: 'ECP',
      icon: Leaf,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: 'Environmental impact, sustainability goals, resource efficiency, and ESG (Environmental, Social, Governance) tracking.',
      purpose: 'Ensure sustainable operations by tracking carbon footprint, resource usage, and environmental impact.',
      keyFeatures: [
        'Carbon footprint tracking (Scope 1, 2, 3)',
        'ESG scoring and reporting',
        'Resource efficiency monitoring',
        'Sustainability target setting and tracking',
        'Environmental impact assessment',
      ],
      useCases: [
        'Carbon emission reduction tracking',
        'Renewable energy usage monitoring',
        'Waste reduction initiatives',
        'Sustainable supply chain operations',
        'ESG compliance reporting',
      ],
      governanceRules: [
        'ECP constrains ACP operations (agents operate within environmental limits)',
        'ECP tracks impact of all MCP operations',
        'ECP reports to GCP for sustainability compliance',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text mb-3">
          About Agent Protocols
        </h1>
        <p className="text-lg text-slate-600 dark:text-dark-muted">
          A comprehensive framework of 9 interconnected protocols that govern, coordinate, and execute intelligent agent workflows across your enterprise.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-3">
          Protocol Hierarchy & Governance
        </h2>
        <div className="space-y-2 text-sm text-slate-700 dark:text-dark-text">
          <p className="font-medium">The protocols follow a strict governance hierarchy:</p>
          <div className="pl-4 space-y-1">
            <p><strong>GCP</strong> (Governance) governs <strong>ACP</strong> (Agents)</p>
            <p className="pl-4">↳ <strong>ACP</strong> operates within <strong>ECP</strong> (Ecosystem) constraints</p>
            <p className="pl-8">↳ <strong>HCP</strong> (Human) defines requirements for <strong>BCP</strong> (Business)</p>
            <p className="pl-12">↳ <strong>BCP</strong> initiates <strong>MCP</strong> (Machine) operations</p>
            <p className="pl-16">↳ <strong>MCP</strong> accesses <strong>DCP</strong> (Data) with <strong>HCP</strong> + <strong>GCP</strong> permission</p>
            <p className="pl-20">↳ <strong>TCP</strong> (Test) validates all outputs</p>
            <p className="pl-4"><strong>GeoCP</strong> (Geographical) enforces location-specific rules across all protocols</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {protocols.map((protocol) => {
          const Icon = protocol.icon;
          return (
            <div
              key={protocol.abbreviation}
              className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 ${protocol.bgColor} rounded-lg`}>
                  <Icon className={`w-8 h-8 ${protocol.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text">
                      {protocol.name}
                    </h3>
                    <span className={`px-3 py-1 ${protocol.bgColor} ${protocol.color} text-sm font-mono rounded-full`}>
                      {protocol.abbreviation}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-dark-muted mb-3">
                    {protocol.description}
                  </p>
                  <div className={`p-3 ${protocol.bgColor} rounded-lg mb-4`}>
                    <p className={`text-sm font-medium ${protocol.color}`}>
                      <strong>Purpose:</strong> {protocol.purpose}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-2">
                    Key Features
                  </h4>
                  <ul className="space-y-1">
                    {protocol.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-dark-muted flex items-start gap-2">
                        <span className={`mt-1 ${protocol.color}`}>•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-2">
                    Use Cases
                  </h4>
                  <ul className="space-y-1">
                    {protocol.useCases.map((useCase, idx) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-dark-muted flex items-start gap-2">
                        <span className={`mt-1 ${protocol.color}`}>•</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {protocol.governanceRules && protocol.governanceRules.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-2">
                    Governance Rules
                  </h4>
                  <ul className="space-y-1">
                    {protocol.governanceRules.map((rule, idx) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-dark-muted flex items-start gap-2">
                        <span className="mt-1 text-red-500">⚠</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-dark-hover rounded-lg border border-slate-200 dark:border-dark-border p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-4">
          Integration & Usage
        </h2>
        <div className="space-y-4 text-sm text-slate-700 dark:text-dark-text">
          <div>
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-dark-muted">
              <li>Define your <strong>Ecosystem Context (ECP)</strong> using GICS industry classification</li>
              <li>Set up <strong>Human Context (HCP)</strong> with user roles and business functions</li>
              <li>Configure <strong>Business Context (BCP)</strong> from your CSV business processes</li>
              <li>Connect <strong>Data Context (DCP)</strong> to your ODOO ERP database</li>
              <li>Select <strong>Machine Context (MCP)</strong> agent patterns for automation</li>
              <li>Enable <strong>Governance (GCP)</strong> for compliance and security</li>
              <li>Add <strong>Test Context (TCP)</strong> for quality assurance</li>
              <li>Configure <strong>Agent Context (ACP)</strong> for multi-agent coordination</li>
              <li>Set <strong>Geographical Context (GeoCP)</strong> for regional compliance</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Example Workflow</h3>
            <div className="bg-white dark:bg-dark-surface p-4 rounded border border-slate-200 dark:border-dark-border">
              <code className="text-xs">
                <span className="text-blue-600 dark:text-blue-400">HCP</span> (CEO requests competitor analysis)<br />
                → <span className="text-cyan-600 dark:text-cyan-400">GCP</span> (Authorize request)<br />
                → <span className="text-green-600 dark:text-green-400">BCP</span> (Process 1.1.1.1: Identify competitors)<br />
                → <span className="text-orange-600 dark:text-orange-400">DCP</span> (Fetch competitor data - requires HCP+GCP permission)<br />
                → <span className="text-purple-600 dark:text-purple-400">MCP</span> (AI agent analyzes data)<br />
                → <span className="text-red-600 dark:text-red-400">TCP</span> (Validate analysis quality)<br />
                → <span className="text-emerald-600 dark:text-emerald-400">ECP</span> (Check carbon footprint of computation)<br />
                → <span className="text-blue-600 dark:text-blue-400">HCP</span> (Deliver report to CEO)<br />
                → <span className="text-cyan-600 dark:text-cyan-400">GCP</span> (Log audit trail)
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
