import React, { useState, useEffect } from 'react';
import { FileText, Database, Cpu, BarChart3, Shield, AlertTriangle, CheckCircle, XCircle, Activity, Sparkles, Settings, Network, Target, Stethoscope, FolderKanban, Workflow, MessageSquare, Building2 } from 'lucide-react';
import { protocolService } from '../services/protocolService';
import { seedAllProtocols } from '../scripts/seedData';
import { seedFHIRMedicalRecords } from '../scripts/seedFHIRData';
import { FHIRGraphVisualization } from './FHIRGraphVisualization';
import { HCPPanel } from './protocols/HCPPanel';
import { BCPPanel } from './protocols/BCPPanel';
import { MCPPanel } from './protocols/MCPPanel';
import { DCPPanel } from './protocols/DCPPanel';
import { TCPPanel } from './protocols/TCPPanel';
import { SettingsPanel } from './SettingsPanel';
import { GraphVisualization } from './GraphVisualization';
import { PlanningInstrument } from './PlanningInstrument';
import { MedicalRecordWorkflow } from './MedicalRecordWorkflow';
import { ProjectCreation } from './ProjectCreation';
import { WorkflowBuilder } from './WorkflowBuilder';
import { LLMChat } from './LLMChat';
import { GICSSelector } from './GICSSelector';
import { graphService } from '../services/graphService';
import { userContextService, UserContext } from '../services/userContextService';
import { themeService } from '../services/themeService';
import { SectorThemeSelector } from './SectorThemeSelector';
import NavigationMenu from './NavigationMenu';

type ProtocolType = 'hcp' | 'bcp' | 'mcp' | 'dcp' | 'tcp' | 'overview' | 'graph' | 'fhir' | 'settings' | 'planning' | 'medical' | 'project' | 'workflow' | 'chat';

export function ProtocolDashboard() {
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType>('overview');
  const [stats, setStats] = useState({
    hcp: 0,
    bcp: 0,
    mcp: 0,
    dcp: 0,
    tcp: 0,
    validations: 0,
    driftReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showGICSSelector, setShowGICSSelector] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  useEffect(() => {
    themeService.initializeTheme();
    loadStats();
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    const context = await userContextService.getActiveContext();
    setUserContext(context);
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const [hcps, bcps, mcps, dcps, tcps, validations] = await Promise.all([
        protocolService.getHumanContexts(),
        protocolService.getBusinessContexts(),
        protocolService.getMachineContexts(),
        protocolService.getDataContexts(),
        protocolService.getTestContexts(),
        protocolService.getValidations()
      ]);

      setStats({
        hcp: hcps?.length || 0,
        bcp: bcps?.length || 0,
        mcp: mcps?.length || 0,
        dcp: dcps?.length || 0,
        tcp: tcps?.length || 0,
        validations: validations?.length || 0,
        driftReports: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will create a complete set of FHIR-compliant medical record protocols. Continue?')) {
      return;
    }

    try {
      setSeeding(true);
      await seedFHIRMedicalRecords();
      await loadStats();
      alert('Successfully created FHIR medical record protocols! View them in the FHIR Medical Records section.');
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data: ' + (error as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  const handleContextSelect = async (context: UserContext) => {
    setUserContext(context);
    setShowGICSSelector(false);
    await loadStats();
  };

  const handleClearContext = async () => {
    await userContextService.clearContext();
    setUserContext(null);
    await loadStats();
  };

  const protocols = [
    { id: 'hcp' as const, name: 'Human Context', icon: FileText, color: 'bg-blue-500', count: stats.hcp },
    { id: 'bcp' as const, name: 'Business Context', icon: BarChart3, color: 'bg-green-500', count: stats.bcp },
    { id: 'mcp' as const, name: 'Machine Context', icon: Cpu, color: 'bg-purple-500', count: stats.mcp },
    { id: 'dcp' as const, name: 'Data Context', icon: Database, color: 'bg-orange-500', count: stats.dcp },
    { id: 'tcp' as const, name: 'Test Context', icon: Shield, color: 'bg-red-500', count: stats.tcp }
  ];

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: 'var(--color-bg)' }}>
      <NavigationMenu currentPath="/protocols" />

      <header className="border-b sticky top-0 z-10 transition-colors" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 pl-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Personal Health Record</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Intelligent health data management with AI-powered workflows</p>
            </div>
            <div className="flex items-center gap-3">
              <SectorThemeSelector />
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
              >
                <Sparkles className="w-4 h-4" />
                {seeding ? 'Creating...' : 'Create Full Demo'}
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-elevated)' }}>
                <Activity className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{stats.validations} Validations</span>
              </div>
            </div>
          </div>

          {userContext ? (
            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1, borderColor: 'var(--color-primary)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}>
                    <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Active Domain Context</div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {userContext.sectorName}
                      {userContext.industryGroupName && <> → {userContext.industryGroupName}</>}
                      {userContext.industryName && <> → {userContext.industryName}</>}
                      {userContext.subIndustryName && <> → {userContext.subIndustryName}</>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowGICSSelector(true)}
                    className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                    style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                  >
                    Change
                  </button>
                  <button
                    onClick={handleClearContext}
                    className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                    style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-elevated)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
                    <Building2 className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No Domain Context Set</div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      Set your domain context to personalize your view and get relevant agent recommendations
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowGICSSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                >
                  <Building2 className="w-4 h-4" />
                  Set Domain Context
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showGICSSelector && (
        <GICSSelector
          onContextSelect={handleContextSelect}
          onClose={() => setShowGICSSelector(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 pl-20">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <nav className="rounded-xl border p-2 transition-colors" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setActiveProtocol('overview')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                style={activeProtocol === 'overview'
                  ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text)' }
                }
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </button>

              <div className="my-3 h-px" style={{ backgroundColor: 'var(--color-border)' }} />

              {protocols.map((protocol) => (
                <button
                  key={protocol.id}
                  onClick={() => setActiveProtocol(protocol.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1"
                  style={activeProtocol === protocol.id
                    ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-text)' }
                  }
                >
                  <protocol.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{protocol.name}</div>
                    <div className="text-xs" style={{ color: activeProtocol === protocol.id ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                      {protocol.count} instances
                    </div>
                  </div>
                </button>
              ))}

              <div className="my-3 h-px" style={{ backgroundColor: 'var(--color-border)' }} />

              <button
                onClick={() => setActiveProtocol('graph')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1"
                style={activeProtocol === 'graph'
                  ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text)' }
                }
              >
                <Network className="w-5 h-5" />
                <span className="font-medium">Graph View</span>
              </button>

              <button
                onClick={() => setActiveProtocol('settings')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                style={activeProtocol === 'settings'
                  ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text)' }
                }
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>

              <div className="my-3 h-px" style={{ backgroundColor: 'var(--color-border)' }} />

              <div className="px-2 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Health Management
                </p>
              </div>

              {[
                { id: 'fhir', icon: Activity, label: 'FHIR Medical Records' },
                { id: 'chat', icon: MessageSquare, label: 'AI Assistant' },
                { id: 'workflow', icon: Workflow, label: 'Workflow Builder' },
                { id: 'project', icon: FolderKanban, label: 'Create Project' },
                { id: 'planning', icon: Target, label: 'Planning Instrument' },
                { id: 'medical', icon: Stethoscope, label: 'Medical Records' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveProtocol(item.id as ProtocolType)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1"
                  style={activeProtocol === item.id
                    ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-text)' }
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-8 text-center transition-colors">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-dark-border border-t-slate-900 dark:border-t-cyber-blue" />
                <p className="mt-4 text-slate-600 dark:text-dark-muted">Loading protocols...</p>
              </div>
            ) : (
              <>
                {activeProtocol === 'overview' && <OverviewPanel stats={stats} protocols={protocols} />}
                {activeProtocol === 'hcp' && <HCPPanel onUpdate={loadStats} />}
                {activeProtocol === 'bcp' && <BCPPanel onUpdate={loadStats} />}
                {activeProtocol === 'mcp' && <MCPPanel onUpdate={loadStats} />}
                {activeProtocol === 'dcp' && <DCPPanel onUpdate={loadStats} />}
                {activeProtocol === 'tcp' && <TCPPanel onUpdate={loadStats} />}
                {activeProtocol === 'graph' && <GraphViewPanel />}
                {activeProtocol === 'fhir' && <FHIRGraphVisualization />}
                {activeProtocol === 'settings' && <SettingsPanel />}
                {activeProtocol === 'chat' && (
                  <div className="h-[calc(100vh-8rem)]">
                    <LLMChat />
                  </div>
                )}
                {activeProtocol === 'workflow' && <WorkflowBuilder />}
                {activeProtocol === 'project' && <ProjectCreation />}
                {activeProtocol === 'planning' && <PlanningInstrument workspaceId="default-workspace" />}
                {activeProtocol === 'medical' && <MedicalRecordWorkflow workspaceId="default-workspace" />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function OverviewPanel({ stats, protocols }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">Protocol Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          {protocols.map((protocol: any) => (
            <div key={protocol.id} className="p-4 bg-slate-50 dark:bg-dark-hover rounded-lg transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${protocol.color} rounded-lg`}>
                  <protocol.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-slate-900 dark:text-dark-text">{protocol.count}</div>
                  <div className="text-sm text-slate-600 dark:text-dark-muted">{protocol.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">About Personal Health Records</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-dark-text mb-2">What is a Personal Health Record?</h3>
            <p className="text-sm text-slate-600 dark:text-dark-muted leading-relaxed">
              A Personal Health Record (PHR) is a comprehensive digital system that empowers you to securely manage,
              store, and share your health information. Using intelligent AI agents and standardized protocols,
              your PHR coordinates medical records, facilitates provider communication, ensures compliance with
              privacy regulations, and helps you make informed health decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-cyber-blue" />
                <h4 className="font-medium text-blue-900 dark:text-cyber-blue">Human Context Protocol</h4>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Captures human identity, roles, locations, purposes, preferences, and delegation rules
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-900 dark:text-green-400">Business Context Protocol</h4>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Maps to Outline Business Canvas with segments, value propositions, and revenue streams
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-medium text-purple-900 dark:text-purple-400">Machine Context Protocol</h4>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Defines ML pipelines, models, tasks, deployment, and monitoring configurations
              </p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-orange-600 dark:text-cyber-orange" />
                <h4 className="font-medium text-orange-900 dark:text-cyber-orange">Data Context Protocol</h4>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Data Mesh elements with domains, products, contracts, SLAs, and ODRL policies
              </p>
            </div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h4 className="font-medium text-red-900 dark:text-red-400">Test Context Protocol</h4>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              Measures drift velocity with PSI, KL divergence, KS tests, and statistical monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphViewPanel() {
  const [protocols, setProtocols] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocolsAndGenerateGraph();
  }, []);

  const loadProtocolsAndGenerateGraph = async () => {
    try {
      const allProtocols: any[] = [];

      const hcpData = await protocolService.getProtocols('hcp');
      const bcpData = await protocolService.getProtocols('bcp');
      const mcpData = await protocolService.getProtocols('mcp');
      const dcpData = await protocolService.getProtocols('dcp');
      const tcpData = await protocolService.getProtocols('tcp');

      allProtocols.push(...hcpData, ...bcpData, ...mcpData, ...dcpData, ...tcpData);

      graphService.setProtocols(allProtocols);
      const graph = graphService.generateProtocolGraph();
      const layoutGraph = graphService.calculateLayout(graph, 800, 600);

      setProtocols(allProtocols);
      setGraphData(layoutGraph);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load protocols for graph:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-8 text-center transition-colors">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-dark-border border-t-slate-900 dark:border-t-cyber-blue" />
        <p className="mt-4 text-slate-600 dark:text-dark-muted">Generating graph...</p>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-8 text-center transition-colors">
        <Network className="w-12 h-12 text-slate-400 dark:text-dark-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-2">No Protocols Found</h3>
        <p className="text-slate-600 dark:text-dark-muted mb-4">
          Create some protocols to see the relationship graph
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GraphVisualization graphData={graphData} width={800} height={600} />

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">Graph Insights</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-dark-hover rounded-lg transition-colors">
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text">{protocols.length}</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted">Total Protocols</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-dark-hover rounded-lg transition-colors">
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text">{graphData.nodes.length}</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted">Graph Nodes</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-dark-hover rounded-lg transition-colors">
            <div className="text-2xl font-bold text-slate-900 dark:text-dark-text">{graphData.edges.length}</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted">Relationships</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">About the Graph</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-dark-muted">
          <p>
            <strong className="text-slate-900 dark:text-dark-text">Protocol Nodes:</strong> Large circles represent each protocol instance (HCP, BCP, MCP, DCP, TCP)
          </p>
          <p>
            <strong className="text-slate-900 dark:text-dark-text">Entity Nodes:</strong> Smaller circles show key entities referenced within protocols
          </p>
          <p>
            <strong className="text-slate-900 dark:text-dark-text">Solid Lines:</strong> Direct relationships between a protocol and its internal entities
          </p>
          <p>
            <strong className="text-slate-900 dark:text-dark-text">Dashed Lines:</strong> Cross-protocol relationships showing how different protocols interact
          </p>
          <p>
            <strong className="text-slate-900 dark:text-dark-text">Interactions:</strong> Click and drag to pan, use controls to zoom, hover over nodes for details
          </p>
        </div>
      </div>
    </div>
  );
}
