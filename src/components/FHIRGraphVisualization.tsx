import React, { useEffect, useState } from 'react';
import { Activity, User, Stethoscope, Calendar, HeartPulse, Pill, TestTube, Scissors, FileText, Network } from 'lucide-react';
import { fhirProtocolService } from '../services/fhirProtocolService';

interface FHIRGraphNode {
  id: string;
  type: string;
  level: number;
  label: string;
  data: any;
}

interface FHIRGraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export function FHIRGraphVisualization() {
  const [graphData, setGraphData] = useState<{ nodes: FHIRGraphNode[]; edges: FHIRGraphEdge[] }>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<FHIRGraphNode | null>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      const patients = await fhirProtocolService.getPatients();

      if (patients.length === 0) {
        setGraphData({ nodes: [], edges: [] });
        setLoading(false);
        return;
      }

      const patient = patients[0];
      const graph = await fhirProtocolService.getGraphForPatient(patient.id!);

      const nodes: FHIRGraphNode[] = graph.nodes.map(node => ({
        id: node.id,
        type: node.type,
        level: node.level,
        label: getNodeLabel(node),
        data: node
      }));

      const edges: FHIRGraphEdge[] = graph.edges.map(edge => ({
        source: edge.source_protocol_id,
        target: edge.target_protocol_id,
        relationship: edge.relationship_type
      }));

      setGraphData({ nodes, edges });
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeLabel = (node: any): string => {
    switch (node.type) {
      case 'patient':
        return `${node.given_name} ${node.family_name}`;
      case 'practitioner':
        return `Dr. ${node.given_name} ${node.family_name}`;
      case 'encounter':
        return `${node.class_code} Visit`;
      case 'condition':
        return node.code?.text || 'Condition';
      case 'medication':
        return node.medication_text;
      case 'observation':
        return node.code?.text || 'Lab Result';
      case 'procedure':
        return node.code?.text || 'Procedure';
      case 'document':
        return node.description || 'Clinical Document';
      default:
        return node.protocol_id;
    }
  };

  const getNodeIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      patient: User,
      practitioner: Stethoscope,
      encounter: Calendar,
      condition: HeartPulse,
      medication: Pill,
      observation: TestTube,
      procedure: Scissors,
      document: FileText
    };
    return iconMap[type] || Activity;
  };

  const getNodeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      patient: '#3B82F6',
      practitioner: '#10B981',
      encounter: '#F59E0B',
      condition: '#EF4444',
      medication: '#8B5CF6',
      observation: '#06B6D4',
      procedure: '#EC4899',
      document: '#6B7280'
    };
    return colorMap[type] || '#9CA3AF';
  };

  const getLevelLabel = (level: number): string => {
    const labels: Record<number, string> = {
      1: 'Identity',
      2: 'Care Team',
      3: 'Care Events',
      4: 'Diagnoses',
      5: 'Medications',
      6: 'Clinical Data',
      7: 'Interventions',
      8: 'Documents'
    };
    return labels[level] || `Level ${level}`;
  };

  const groupNodesByLevel = () => {
    const grouped: Record<number, FHIRGraphNode[]> = {};
    graphData.nodes.forEach(node => {
      if (!grouped[node.level]) {
        grouped[node.level] = [];
      }
      grouped[node.level].push(node);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: 'var(--color-panel)', color: 'var(--color-text)' }}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-current border-t-transparent" />
        <p className="mt-4">Loading medical record graph...</p>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
        <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Medical Records Yet</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Create a patient record to start building your personal medical ontology.
        </p>
      </div>
    );
  }

  const groupedNodes = groupNodesByLevel();
  const levels = Object.keys(groupedNodes).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Network className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              Personal Medical Record Ontology
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              FHIR R4 Compliant Protocol Hierarchy
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {levels.map(level => {
            const nodes = groupedNodes[level];
            return (
              <div key={level} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff'
                    }}
                  >
                    Level {level}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {getLevelLabel(level)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    ({nodes.length} {nodes.length === 1 ? 'record' : 'records'})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {nodes.map(node => {
                    const Icon = getNodeIcon(node.type);
                    const color = getNodeColor(node.type);
                    const isSelected = selectedNode?.id === node.id;

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(isSelected ? null : node)}
                        className="p-4 rounded-lg border text-left transition-all hover:shadow-md"
                        style={{
                          backgroundColor: isSelected ? 'var(--color-elevated)' : 'var(--color-panel)',
                          borderColor: isSelected ? color : 'var(--color-border)',
                          borderWidth: isSelected ? '2px' : '1px'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                              {node.label}
                            </div>
                            <div className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>
                              {node.type}
                            </div>
                          </div>
                        </div>

                        {node.data.status && (
                          <div className="mt-2">
                            <span
                              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: `${color}30`,
                                color
                              }}
                            >
                              {node.data.status}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {level < Math.max(...levels) && (
                  <div className="flex items-center justify-center py-2">
                    <div
                      className="h-8 w-px"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedNode && (
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Protocol Details
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Protocol ID
              </div>
              <div className="font-mono text-sm" style={{ color: 'var(--color-text)' }}>
                {selectedNode.data.protocol_id}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Type
              </div>
              <div className="capitalize" style={{ color: 'var(--color-text)' }}>
                {selectedNode.type}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
                FHIR Resource
              </div>
              <div style={{ color: 'var(--color-text)' }}>
                {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Raw Data
              </div>
              <pre
                className="p-3 rounded text-xs overflow-auto max-h-96"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)'
                }}
              >
                {JSON.stringify(selectedNode.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--color-panel)', borderColor: 'var(--color-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Graph Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {graphData.nodes.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Total Protocols
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {graphData.edges.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Relationships
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {levels.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Hierarchy Levels
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              FHIR R4
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Compliance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
