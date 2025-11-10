import React, { useEffect, useRef, useState } from 'react';
import { Network, Calendar, Activity, AlertCircle, CheckCircle, TrendingUp, FileText, RefreshCw } from 'lucide-react';
import { personalMedicalRecordService } from '../services/personalMedicalRecordService';
import NavigationMenu from './NavigationMenu';
import MedicalTimelineView from './MedicalTimelineView';
import GalaxyGraphView from './GalaxyGraphView';

interface GraphNode {
  id: string;
  type: string;
  label: string;
  data: any;
  level: number;
}

interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  summary: string;
  data: any;
  color: string;
  icon: string;
}

export default function EnhancedMedicalGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'galaxy' | 'timeline' | 'workflows'>('galaxy');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    setLoading(true);
    try {
      const graphData = await personalMedicalRecordService.getGraphData();
      console.log('Loaded graph data:', graphData.nodes.length, 'nodes', graphData.edges.length, 'edges');
      setNodes(graphData.nodes);
      setEdges(graphData.edges);

      const events = buildTimelineEvents(graphData.nodes);
      console.log('Timeline events built:', events.length, 'events');
      setTimelineEvents(events);
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
    setLoading(false);
  };

  const seedSimonGrangeData = async () => {
    setLoading(true);
    try {
      console.log('Starting seed process...');
      const { seedSimonGrangeData: seedFunction } = await import('../scripts/seedSimonGrangeData');
      const result = await seedFunction();
      console.log('Seed result:', result);
      alert('✅ Simon Grange data seeded successfully!\n\nRecords created:\n- 1 Patient\n- 3 Practitioners\n- 4 Encounters\n- 4 Conditions\n- 7 Medications\n- 2 Procedures\n- 6 Observations\n- 1 Document');
      await loadGraphData();
    } catch (error: any) {
      console.error('Error seeding data:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`❌ Error seeding data:\n\n${errorMessage}\n\nPlease check the browser console for more details.`);
    }
    setLoading(false);
  };

  const buildTimelineEvents = (nodeList: GraphNode[]): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    console.log('Building timeline from nodes:', nodeList.length);

    nodeList.forEach(node => {
      let date = null;
      let title = node.label || 'Unknown';
      let summary = '';

      if (!node.data) {
        console.log('Node has no data:', node);
        return;
      }

      switch (node.type) {
        case 'encounter':
          date = node.data.date;
          summary = node.data.reason || node.data.summary || node.data.type || '';
          break;
        case 'condition':
          date = node.data.onsetDate || node.data.diagnosisDate || node.data.date;
          summary = `${node.data.clinicalStatus || ''} ${node.data.severity ? '- ' + node.data.severity : ''}`.trim();
          break;
        case 'medication':
          date = node.data.startDate || node.data.date;
          summary = `${node.data.dosage || ''} ${node.data.frequency || ''} ${node.data.route ? '- ' + node.data.route : ''}`.trim();
          break;
        case 'procedure':
          date = node.data.performedDate || node.data.date;
          summary = node.data.outcome || node.data.type || '';
          break;
        case 'observation':
          date = node.data.effectiveDate || node.data.date;
          summary = node.data.value ? `Value: ${node.data.value}` : node.data.type || '';
          break;
        case 'document':
          date = node.data.date || node.data.created;
          summary = node.data.description || node.data.type || '';
          break;
      }

      if (date) {
        console.log('Adding event:', { type: node.type, date, title });
        events.push({
          id: node.id,
          date,
          type: node.type,
          title,
          summary: summary || 'No description',
          data: node.data,
          color: getNodeColor(node.type),
          icon: getNodeIcon(node.type)
        });
      } else {
        console.log('No date found for:', node.type, node.label, node.data);
      }
    });

    console.log('Built timeline events:', events.length);
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      patient: '#3b82f6',
      practitioner: '#8b5cf6',
      encounter: '#10b981',
      condition: '#ef4444',
      medication: '#f97316',
      procedure: '#06b6d4',
      observation: '#14b8a6',
      document: '#64748b'
    };
    return colors[type] || '#94a3b8';
  };

  const getNodeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      patient: '👤',
      practitioner: '👨‍⚕️',
      encounter: '🏥',
      condition: '💔',
      medication: '💊',
      procedure: '⚕️',
      observation: '📊',
      document: '📄'
    };
    return icons[type] || '●';
  };

  const renderGraphView = () => {
    const patientNode = nodes.find(n => n.type === 'patient');
    const byType = nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, GraphNode[]>);

    const typeOrder = ['patient', 'practitioner', 'encounter', 'condition', 'medication', 'procedure', 'observation', 'document'];

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Complete Medical Graph Structure</h2>

        {patientNode && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">👤</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{patientNode.data.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="opacity-75">DOB</div>
                    <div className="font-semibold">{new Date(patientNode.data.birthDate).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div>
                    <div className="opacity-75">NHS Number</div>
                    <div className="font-semibold">{patientNode.data.nhsNumber}</div>
                  </div>
                  <div>
                    <div className="opacity-75">Hospital No.</div>
                    <div className="font-semibold">{patientNode.data.hospitalNumber}</div>
                  </div>
                  <div>
                    <div className="opacity-75">Occupation</div>
                    <div className="font-semibold">{patientNode.data.occupation}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {typeOrder.map(type => {
            const typeNodes = byType[type] || [];
            if (typeNodes.length === 0 || type === 'patient') return null;

            return (
              <div key={type} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: getNodeColor(type) + '20' }}
                  >
                    {getNodeIcon(type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 capitalize">{type}s</h3>
                    <p className="text-sm text-slate-500">{typeNodes.length} record{typeNodes.length > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {typeNodes.map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      style={{ borderLeftWidth: '4px', borderLeftColor: getNodeColor(type) }}
                    >
                      <h4 className="font-medium text-slate-900 text-sm mb-2">{node.label}</h4>
                      <div className="text-xs text-slate-600 space-y-1">
                        {node.type === 'practitioner' && (
                          <>
                            <div>🏥 {node.data.organization}</div>
                            <div>📋 {node.data.specialty}</div>
                          </>
                        )}
                        {node.type === 'encounter' && (
                          <>
                            <div>📅 {new Date(node.data.date).toLocaleDateString('en-GB')}</div>
                            <div>📍 {node.data.location}</div>
                          </>
                        )}
                        {node.type === 'condition' && (
                          <>
                            <div>🔴 {node.data.clinicalStatus}</div>
                            <div>⚠️ {node.data.severity}</div>
                          </>
                        )}
                        {node.type === 'medication' && (
                          <>
                            <div>💊 {node.data.dosage} {node.data.frequency}</div>
                            <div>📅 Started: {new Date(node.data.startDate).toLocaleDateString('en-GB')}</div>
                          </>
                        )}
                        {node.type === 'procedure' && (
                          <>
                            <div>📅 {new Date(node.data.performedDate).toLocaleDateString('en-GB')}</div>
                            <div>✓ {node.data.outcome}</div>
                          </>
                        )}
                        {node.type === 'observation' && (
                          <>
                            <div>📊 {node.data.value}</div>
                            <div>📅 {new Date(node.data.effectiveDate).toLocaleDateString('en-GB')}</div>
                          </>
                        )}
                        {node.type === 'document' && (
                          <>
                            <div>📄 {node.data.type}</div>
                            <div>📅 {new Date(node.data.date).toLocaleDateString('en-GB')}</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Graph Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{nodes.length}</div>
              <div className="text-sm text-slate-600">Total Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{Object.keys(byType).length}</div>
              <div className="text-sm text-slate-600">Node Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{byType.medication?.length || 0}</div>
              <div className="text-sm text-slate-600">Medications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{byType.encounter?.length || 0}</div>
              <div className="text-sm text-slate-600">Encounters</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    return (
      <MedicalTimelineView
        events={timelineEvents}
        onEventClick={(event) => {
          const node = nodes.find(n => n.id === event.id);
          if (node) setSelectedNode(node);
        }}
      />
    );
  };

  const renderOldTimelineView = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Medical Timeline - Simon Grange</h2>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-30"></div>

          <div className="space-y-8">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative flex gap-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl z-10 border-4 border-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                >
                  {event.icon}
                </div>

                <div className="flex-1 pb-4">
                  <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">
                            {new Date(event.date).toLocaleDateString('en-GB', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h3>
                        {event.summary && (
                          <p className="text-sm text-slate-600 mb-3">{event.summary}</p>
                        )}
                      </div>
                      <span
                        className="px-3 py-1 text-xs font-bold rounded-full ml-4 flex-shrink-0"
                        style={{
                          backgroundColor: event.color + '20',
                          color: event.color
                        }}
                      >
                        {event.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {event.type === 'encounter' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Type:</span>
                            <span className="font-medium">{event.data.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Location:</span>
                            <span className="font-medium">{event.data.location}</span>
                          </div>
                          {event.data.transferFrom && (
                            <div className="flex items-center gap-2 col-span-2">
                              <span className="text-slate-500">Transferred from:</span>
                              <span className="font-medium">{event.data.transferFrom}</span>
                            </div>
                          )}
                        </>
                      )}
                      {event.type === 'condition' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Status:</span>
                            <span className={`font-medium ${event.data.clinicalStatus === 'Active' ? 'text-red-600' : 'text-green-600'}`}>
                              {event.data.clinicalStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Severity:</span>
                            <span className="font-medium">{event.data.severity}</span>
                          </div>
                          {event.data.snomedCode && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">SNOMED:</span>
                              <span className="font-mono text-xs">{event.data.snomedCode}</span>
                            </div>
                          )}
                        </>
                      )}
                      {event.type === 'medication' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Dosage:</span>
                            <span className="font-medium">{event.data.dosage} {event.data.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Route:</span>
                            <span className="font-medium">{event.data.route}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <span className="text-slate-500">Indication:</span>
                            <span className="font-medium">{event.data.indication}</span>
                          </div>
                        </>
                      )}
                      {event.type === 'procedure' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Performed by:</span>
                            <span className="font-medium">{event.data.performedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Outcome:</span>
                            <span className="font-medium text-green-600">{event.data.outcome}</span>
                          </div>
                        </>
                      )}
                      {event.type === 'observation' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Value:</span>
                            <span className="font-bold text-blue-600">{event.data.value}</span>
                          </div>
                          {event.data.interpretation && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Interpretation:</span>
                              <span className="font-medium">{event.data.interpretation}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {event.data.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-700"><span className="font-medium">Notes:</span> {event.data.notes}</p>
                      </div>
                    )}
                  </div>

                  {index < timelineEvents.length - 1 && (
                    <div className="ml-4 mt-4 text-xs text-slate-400 flex items-center gap-2">
                      <div className="flex-1 border-t border-dashed border-slate-300"></div>
                      <span>
                        {Math.ceil(
                          (new Date(timelineEvents[index + 1].date).getTime() - new Date(event.date).getTime()) /
                          (1000 * 60 * 60 * 24)
                        )} days
                      </span>
                      <div className="flex-1 border-t border-dashed border-slate-300"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowsView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Clinical Workflows for Post-CABG Follow-up</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workflow 1: 6-Week Follow-up */}
            <div className="border-2 border-green-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-green-900">6-Week Follow-up Protocol</h3>
                  <p className="text-xs text-green-700">Post-CABG Assessment</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Clinical Assessment</div>
                    <div className="text-slate-600">Wound healing, sternum stability, pain assessment</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Blood Tests</div>
                    <div className="text-slate-600">
                      • Full Blood Count (FBC)<br/>
                      • Lipid Profile (Total cholesterol, LDL, HDL, Triglycerides)<br/>
                      • Renal Function (U&E, Creatinine)<br/>
                      • Liver Function (LFT)<br/>
                      • HbA1c (Diabetes screening)<br/>
                      • Troponin (if chest pain present)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">12-Lead ECG</div>
                    <div className="text-slate-600">Assess rhythm, ST segments, T-waves, compare to baseline</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Medication Review</div>
                    <div className="text-slate-600">Confirm compliance with antiplatelet, statin, beta-blocker, ACE inhibitor</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Rehabilitation Assessment</div>
                    <div className="text-slate-600">Exercise tolerance, return to work planning</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <div className="text-xs font-semibold text-green-900">Timing: 6 weeks post-surgery</div>
                <div className="text-xs text-green-700">Next for Simon: ~March 2025</div>
              </div>
            </div>

            {/* Workflow 2: 3-Month Blood Monitoring */}
            <div className="border-2 border-blue-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">3-Month Blood Monitoring</h3>
                  <p className="text-xs text-blue-700">Lipid & Metabolic Assessment</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Lipid Profile</div>
                    <div className="text-slate-600">
                      • Target LDL-C: &lt;1.8 mmol/L<br/>
                      • Total cholesterol: &lt;4.0 mmol/L<br/>
                      • Check statin efficacy (Atorvastatin 80mg)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Renal Function</div>
                    <div className="text-slate-600">
                      • eGFR monitoring (baseline established)<br/>
                      • Creatinine (ACE inhibitor effect)<br/>
                      • Potassium (Ramipril monitoring)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Liver Function</div>
                    <div className="text-slate-600">ALT, AST monitoring for statin hepatotoxicity</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Glycemic Control</div>
                    <div className="text-slate-600">HbA1c, Fasting glucose (CVD risk factor)</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Inflammatory Markers</div>
                    <div className="text-slate-600">hs-CRP if indicated for residual inflammation</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="text-xs font-semibold text-blue-900">Timing: 3 months post-surgery</div>
                <div className="text-xs text-blue-700">Next for Simon: ~April 2025</div>
              </div>
            </div>

            {/* Workflow 3: Ongoing ECG Monitoring */}
            <div className="border-2 border-purple-200 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-purple-900">ECG Monitoring Protocol</h3>
                  <p className="text-xs text-purple-700">Rhythm & Ischemia Assessment</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Baseline ECG (Completed)</div>
                    <div className="text-slate-600">Pre-surgery: T-wave inversion laterally documented</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">6-Week ECG</div>
                    <div className="text-slate-600">
                      • Assess T-wave normalization<br/>
                      • Check for new Q waves (graft patency indicator)<br/>
                      • Rule out arrhythmias (AF common post-CABG)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">3-Month ECG</div>
                    <div className="text-slate-600">Routine monitoring, compare to 6-week ECG</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Annual ECG</div>
                    <div className="text-slate-600">Long-term follow-up for graft surveillance</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-red-900">Urgent ECG Indicators</div>
                    <div className="text-red-700">
                      • Chest pain recurrence<br/>
                      • Palpitations<br/>
                      • Syncope or pre-syncope<br/>
                      • Dyspnea at rest
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <div className="text-xs font-semibold text-purple-900">Frequency: 6 weeks, 3 months, then annually</div>
                <div className="text-xs text-purple-700">Plus as clinically indicated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Monitoring Recommendations */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-3">Additional Monitoring for Simon Grange</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-orange-900 mb-2">Occupational Health Assessment</div>
                  <ul className="space-y-1 text-slate-700">
                    <li>• Physical demands assessment (orthopedic surgery)</li>
                    <li>• Sternum healing complete (12 weeks minimum)</li>
                    <li>• Upper limb strength/range of motion testing</li>
                    <li>• Graded return to operating theater duties</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-orange-900 mb-2">Cardiac Rehabilitation</div>
                  <ul className="space-y-1 text-slate-700">
                    <li>• Phase III supervised exercise program</li>
                    <li>• Psychological support (surgeon as patient)</li>
                    <li>• Exercise stress test at 3 months</li>
                    <li>• Echocardiogram at 6 months</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-orange-900 mb-2">Lifestyle Modification Review</div>
                  <ul className="space-y-1 text-slate-700">
                    <li>• Dietitian referral (Mediterranean diet)</li>
                    <li>• Smoking cessation (if applicable)</li>
                    <li>• Stress management strategies</li>
                    <li>• Sleep quality assessment</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-orange-900 mb-2">Imaging Follow-up</div>
                  <ul className="space-y-1 text-slate-700">
                    <li>• CT Coronary Angiography at 1 year (graft patency)</li>
                    <li>• Chest X-ray if symptoms develop</li>
                    <li>• Consider cardiac MRI if ejection fraction concerns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Adherence Workflow */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <h3 className="font-bold text-slate-900 mb-4">Current Medication Regimen & Monitoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { drug: 'Aspirin 75mg OD', monitoring: 'GI side effects, bleeding risk', target: 'Lifelong antiplatelet' },
              { drug: 'Clopidogrel 75mg OD', monitoring: 'Bleeding risk, drug interactions', target: '12 months dual therapy' },
              { drug: 'Atorvastatin 80mg OD', monitoring: 'LFTs, LDL-C target <1.8', target: 'Lifelong lipid control' },
              { drug: 'Bisoprolol 5mg OD', monitoring: 'HR 50-60, BP, fatigue', target: 'Cardioprotection' },
              { drug: 'Ramipril 10mg OD', monitoring: 'U&E, K+, BP, cough', target: 'Remodeling prevention' },
              { drug: 'Amlodipine 10mg OD', monitoring: 'BP target <130/80, ankle edema', target: 'BP control' },
              { drug: 'Pantoprazole 40mg OD', monitoring: 'GI symptoms, B12 long-term', target: 'GI protection' }
            ].map((med, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all">
                <div className="font-semibold text-slate-900 mb-2">{med.drug}</div>
                <div className="text-xs text-slate-600 mb-2">
                  <span className="font-medium">Monitor:</span> {med.monitoring}
                </div>
                <div className="text-xs text-blue-600">
                  <span className="font-medium">Goal:</span> {med.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const patientNode = nodes.find(n => n.type === 'patient');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavigationMenu currentPath="/medical-graph" />

      <div className="max-w-7xl mx-auto p-6 pl-20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Network className="w-8 h-8 text-blue-600" />
                Medical Record Graph
              </h1>
              <p className="text-xl font-semibold text-slate-700 mt-1">Simon Grange</p>
              <p className="text-slate-600 mt-2">Complete medical history visualisation and clinical workflows</p>
            </div>
            <div className="flex gap-2">
              {nodes.length === 0 && !loading && (
                <button
                  onClick={seedSimonGrangeData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg mr-2"
                >
                  Load Sample Data
                </button>
              )}
              {nodes.length > 0 && (
                <button
                  onClick={loadGraphData}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors mr-2"
                  title="Reload data"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setViewMode('galaxy')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  viewMode === 'galaxy'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                }`}
              >
                Galaxy View
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  viewMode === 'graph'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                }`}
              >
                Timeline View
              </button>
              <button
                onClick={() => setViewMode('workflows')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  viewMode === 'workflows'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
                }`}
              >
                Clinical Workflows
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading medical records...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Medical Records Found</h2>
            <p className="text-slate-600 mb-6">
              Load Simon Grange's medical records to view the complete graph visualization
            </p>
            <button
              onClick={seedSimonGrangeData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Load Simon Grange Medical Records
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'galaxy' && (
              <GalaxyGraphView
                nodes={nodes}
                edges={edges}
                onNodeClick={(node) => setSelectedNode(node)}
              />
            )}
            {viewMode === 'graph' && renderGraphView()}
            {viewMode === 'timeline' && renderTimelineView()}
            {viewMode === 'workflows' && renderWorkflowsView()}
          </>
        )}

        {selectedNode && (viewMode === 'graph' || viewMode === 'galaxy') && (
          <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Selected Record</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-slate-700">Type:</span>{' '}
                <span className="text-slate-900">{selectedNode.type}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-slate-700">Title:</span>{' '}
                <span className="text-slate-900">{selectedNode.label}</span>
              </div>
              <div className="border-t pt-3 mt-3 space-y-2">
                {selectedNode.data && Object.entries(selectedNode.data).map(([key, value]) => {
                  if (value === null || value === undefined || key === 'metadata') return null;

                  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  let formattedValue = value;

                  if (typeof value === 'object' && value !== null) {
                    formattedValue = JSON.stringify(value);
                  } else if (typeof value === 'boolean') {
                    formattedValue = value ? 'Yes' : 'No';
                  }

                  return (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-slate-700">{formattedKey}:</span>{' '}
                      <span className="text-slate-900">{String(formattedValue)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
