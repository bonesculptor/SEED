import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'lucide-react';
import { personalMedicalRecordService } from '../services/personalMedicalRecordService';
import NavigationMenu from './NavigationMenu';

interface Node {
  id: string;
  type: string;
  label: string;
  data: any;
  level: number;
}

interface Edge {
  source: string;
  target: string;
  type: string;
  metadata: any;
}

export default function PersonalMedicalGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    setLoading(true);
    try {
      const data = await personalMedicalRecordService.getGraphData();
      setGraphData(data);
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    drawGraph(ctx, canvas.width, canvas.height);
  }, [graphData, selectedNode, hoveredNode, loading]);

  const drawGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    if (graphData.nodes.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No medical records to display', width / 2, height / 2);
      return;
    }

    const positions = calculateNodePositions(graphData.nodes, width, height);

    graphData.edges.forEach(edge => {
      const sourcePos = positions.get(edge.source);
      const targetPos = positions.get(edge.target);
      if (!sourcePos || !targetPos) return;

      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      const midX = (sourcePos.x + targetPos.x) / 2;
      const midY = (sourcePos.y + targetPos.y) / 2;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.type.replace(/_/g, ' '), midX, midY);
    });

    graphData.nodes.forEach(node => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      const color = getNodeColor(node.type);
      const radius = 30;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius + (isSelected ? 5 : 0), 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? lightenColor(color) : color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = wrapText(ctx, node.label, radius * 1.8);
      lines.forEach((line, i) => {
        ctx.fillText(line, pos.x, pos.y + (i - lines.length / 2 + 0.5) * 14);
      });

      ctx.fillStyle = '#334155';
      ctx.font = '10px sans-serif';
      ctx.fillText(`L${node.level}`, pos.x, pos.y + radius + 15);
    });
  };

  const calculateNodePositions = (nodes: Node[], width: number, height: number): Map<string, { x: number; y: number }> => {
    const positions = new Map();
    const levels = new Map<number, Node[]>();

    nodes.forEach(node => {
      if (!levels.has(node.level)) {
        levels.set(node.level, []);
      }
      levels.get(node.level)!.push(node);
    });

    const maxLevel = Math.max(...Array.from(levels.keys()));
    const levelHeight = height / (maxLevel + 2);

    levels.forEach((levelNodes, level) => {
      const levelWidth = width / (levelNodes.length + 1);
      levelNodes.forEach((node, index) => {
        positions.set(node.id, {
          x: levelWidth * (index + 1),
          y: levelHeight * (level + 1)
        });
      });
    });

    return positions;
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

  const lightenColor = (color: string): string => {
    const colors: Record<string, string> = {
      '#3b82f6': '#60a5fa',
      '#8b5cf6': '#a78bfa',
      '#10b981': '#34d399',
      '#ef4444': '#f87171',
      '#f97316': '#fb923c',
      '#06b6d4': '#22d3ee',
      '#14b8a6': '#2dd4bf',
      '#64748b': '#94a3b8'
    };
    return colors[color] || color;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines.slice(0, 3);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const positions = calculateNodePositions(graphData.nodes, canvas.width, canvas.height);

    for (const node of graphData.nodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance <= 30) {
        setSelectedNode(node);
        return;
      }
    }

    setSelectedNode(null);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const positions = calculateNodePositions(graphData.nodes, canvas.width, canvas.height);

    for (const node of graphData.nodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance <= 30) {
        setHoveredNode(node.id);
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredNode(null);
    canvas.style.cursor = 'default';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <NavigationMenu currentPath="/medical-graph" />
      <div className="max-w-7xl mx-auto pl-14">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Network className="w-8 h-8 text-blue-600" />
            Personal Medical Record Graph
          </h1>
          <p className="text-slate-600">Context-aware visualization of your health records and their relationships</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Graph Visualization</h2>
                <button
                  onClick={loadGraphData}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  className="w-full h-[600px] border border-slate-200 rounded-lg"
                />
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { type: 'patient', label: 'Patient', color: '#3b82f6' },
                  { type: 'practitioner', label: 'Practitioner', color: '#8b5cf6' },
                  { type: 'encounter', label: 'Encounter', color: '#10b981' },
                  { type: 'condition', label: 'Condition', color: '#ef4444' },
                  { type: 'medication', label: 'Medication', color: '#f97316' },
                  { type: 'procedure', label: 'Procedure', color: '#06b6d4' },
                  { type: 'observation', label: 'Observation', color: '#14b8a6' },
                  { type: 'document', label: 'Document', color: '#64748b' }
                ].map(item => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedNode ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Details</h2>

                <div className="space-y-4">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full" style={{
                      backgroundColor: getNodeColor(selectedNode.type) + '20',
                      color: getNodeColor(selectedNode.type)
                    }}>
                      {selectedNode.type.toUpperCase()} - Level {selectedNode.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{selectedNode.label}</h3>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Record Data</h4>
                    <dl className="space-y-2">
                      {Object.entries(selectedNode.data).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs font-medium text-slate-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm text-slate-900 mt-0.5">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Connections</h4>
                    <div className="space-y-1">
                      {graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((edge, idx) => {
                        const isSource = edge.source === selectedNode.id;
                        const connectedId = isSource ? edge.target : edge.source;
                        const connectedNode = graphData.nodes.find(n => n.id === connectedId);
                        return (
                          <div key={idx} className="text-sm text-slate-600">
                            {isSource ? '→' : '←'} {edge.type.replace(/_/g, ' ')} {connectedNode?.label}
                          </div>
                        );
                      })}
                      {graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                        <p className="text-sm text-slate-400">No connections</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Details</h2>
                <p className="text-slate-500 text-center py-12">
                  Click on a node to view details
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-900 mb-2">Graph Statistics</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Total Records: {graphData.nodes.length}</p>
                <p>Connections: {graphData.edges.length}</p>
                <p>Levels: {Math.max(...graphData.nodes.map(n => n.level), 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
