import React, { useEffect, useRef, useState } from 'react';
import { Network, User, Calendar, Heart, Pill, Activity, FileText, Stethoscope, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { personalMedicalRecordService } from '../services/personalMedicalRecordService';
import NavigationMenu from './NavigationMenu';

interface GraphNode {
  id: string;
  type: string;
  label: string;
  data: any;
  level: number;
  x: number;
  y: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label: string;
}

export default function MedicalRecordGraphView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline'>('graph');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadGraphData();
  }, []);

  useEffect(() => {
    if (canvasRef.current && !loading) {
      drawGraph();
    }
  }, [nodes, edges, selectedNode, hoveredNode, scale, offset, loading]);

  const loadGraphData = async () => {
    setLoading(true);
    try {
      const graphData = await personalMedicalRecordService.getGraphData();

      const width = 1200;
      const height = 800;
      const centerX = width / 2;
      const centerY = height / 2;

      const patientNode = graphData.nodes.find(n => n.type === 'patient');

      const processedNodes: GraphNode[] = graphData.nodes.map((node, index) => {
        let x = centerX;
        let y = centerY;
        let color = getNodeColor(node.type);

        if (node.type === 'patient') {
          x = centerX;
          y = centerY;
        } else {
          const level = node.level || 1;
          const nodesAtLevel = graphData.nodes.filter(n => n.level === level && n.type === node.type);
          const indexAtLevel = nodesAtLevel.indexOf(node);
          const totalAtLevel = nodesAtLevel.length;

          const angle = (indexAtLevel / totalAtLevel) * 2 * Math.PI;
          const radius = 150 + (level * 80);

          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }

        return {
          id: node.id,
          type: node.type,
          label: node.label || 'Unknown',
          data: node.data,
          level: node.level || 1,
          x,
          y,
          color
        };
      });

      const processedEdges: GraphEdge[] = graphData.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type,
        label: edge.type.replace(/_/g, ' ')
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
    setLoading(false);
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = selectedNode?.id === edge.source || selectedNode?.id === edge.target
          ? '#3b82f6'
          : '#cbd5e1';
        ctx.lineWidth = selectedNode?.id === edge.source || selectedNode?.id === edge.target ? 2 : 1;
        ctx.stroke();

        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        if (selectedNode?.id === edge.source || selectedNode?.id === edge.target) {
          ctx.fillStyle = '#64748b';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(edge.label, midX, midY - 5);
        }
      }
    });

    nodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      const isRelated = edges.some(e =>
        (e.source === selectedNode?.id && e.target === node.id) ||
        (e.target === selectedNode?.id && e.source === node.id)
      );

      const radius = node.type === 'patient' ? 40 : 30;
      const displayRadius = isSelected ? radius + 5 : radius;

      ctx.beginPath();
      ctx.arc(node.x, node.y, displayRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered ? lightenColor(node.color) : node.color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (isRelated) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = node.type === 'patient' ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const icon = getNodeIcon(node.type);
      ctx.fillText(icon, node.x, node.y);

      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      const labelText = node.label ? String(node.label) : 'Unknown';
      const words = labelText.split(' ');
      const maxWidth = radius * 2.5;
      let line = '';
      let lineY = node.y + displayRadius + 15;

      words.forEach((word, i) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, node.x, lineY);
          line = word + ' ';
          lineY += 14;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, node.x, lineY);
    });

    ctx.restore();
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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    let clickedNode: GraphNode | null = null;
    for (const node of nodes) {
      const radius = node.type === 'patient' ? 40 : 30;
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      if (distance <= radius) {
        clickedNode = node;
        break;
      }
    }

    setSelectedNode(clickedNode);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setDragStart({ x: event.clientX, y: event.clientY });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    let hoveredNodeId: string | null = null;
    for (const node of nodes) {
      const radius = node.type === 'patient' ? 40 : 30;
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      if (distance <= radius) {
        hoveredNodeId = node.id;
        canvas.style.cursor = 'pointer';
        break;
      }
    }

    if (!hoveredNodeId) {
      canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
    }

    setHoveredNode(hoveredNodeId);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setScale(Math.max(0.3, Math.min(3, scale * delta)));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  const getTimelineData = () => {
    return nodes
      .filter(node => node.data.date || node.data.onsetDate || node.data.startDate)
      .map(node => ({
        ...node,
        date: node.data.date || node.data.onsetDate || node.data.startDate
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const patientNode = nodes.find(n => n.type === 'patient');
  const relatedNodes = selectedNode
    ? edges
        .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
        .map(e => {
          const nodeId = e.source === selectedNode.id ? e.target : e.source;
          return { ...nodes.find(n => n.id === nodeId)!, relationship: e.label };
        })
        .filter(n => n.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <NavigationMenu currentPath="/medical-graph" />

      <div className="max-w-7xl mx-auto p-6 pl-20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Network className="w-8 h-8 text-blue-600" />
                Medical Record Graph - Simon Grange
              </h1>
              <p className="text-slate-600 mt-2">Interactive visualization of complete medical history</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('graph')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'graph'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                Graph View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                Timeline View
              </button>
            </div>
          </div>

          {patientNode && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{patientNode.data.name}</h2>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <span className="opacity-75">DOB:</span> {new Date(patientNode.data.birthDate).toLocaleDateString('en-GB')}
                    </div>
                    <div>
                      <span className="opacity-75">NHS:</span> {patientNode.data.nhsNumber}
                    </div>
                    <div>
                      <span className="opacity-75">Age:</span> {new Date().getFullYear() - new Date(patientNode.data.birthDate).getFullYear()} years
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{nodes.length - 1}</div>
                  <div className="text-sm opacity-75">Total Records</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {viewMode === 'graph' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Relationship Graph</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScale(Math.min(3, scale * 1.2))}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
                    >
                      Zoom +
                    </button>
                    <button
                      onClick={() => setScale(Math.max(0.3, scale * 0.8))}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
                    >
                      Zoom -
                    </button>
                    <button
                      onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm"
                    >
                      Reset
                    </button>
                  </div>
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
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    className="w-full h-[600px] border border-slate-200 rounded-lg cursor-grab"
                  />
                )}

                <div className="mt-4 flex flex-wrap gap-3">
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

                  <div className="mb-4">
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: selectedNode.color + '20',
                        color: selectedNode.color
                      }}
                    >
                      {selectedNode.type.toUpperCase()} - Level {selectedNode.level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-3">{selectedNode.label}</h3>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Record Data</h4>
                    <dl className="space-y-2">
                      {Object.entries(selectedNode.data).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs font-medium text-slate-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm text-slate-900 mt-0.5">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {relatedNodes.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        Connections ({relatedNodes.length})
                      </h4>
                      <div className="space-y-2">
                        {relatedNodes.map((node, idx) => (
                          <div
                            key={idx}
                            className="text-sm p-2 bg-slate-50 rounded hover:bg-slate-100 cursor-pointer"
                            onClick={() => setSelectedNode(node)}
                          >
                            <div className="font-medium text-slate-700">{node.label}</div>
                            <div className="text-xs text-slate-500">{node.relationship}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Graph Statistics</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-900">Total Records</span>
                      <span className="text-lg font-bold text-blue-600">{nodes.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-900">Connections</span>
                      <span className="text-lg font-bold text-green-600">{edges.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-purple-900">Protocol Levels</span>
                      <span className="text-lg font-bold text-purple-600">8</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 text-center">
                      Click on any node to view detailed information and relationships
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Medical Timeline
            </h2>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              <div className="space-y-6">
                {getTimelineData().map((node, index) => (
                  <div key={node.id} className="relative flex gap-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10 border-4 border-white shadow-lg"
                      style={{ backgroundColor: node.color }}
                    >
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm text-slate-500">
                              {new Date(node.date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mt-1">{node.label}</h3>
                          </div>
                          <span
                            className="px-2 py-1 text-xs font-semibold rounded"
                            style={{
                              backgroundColor: node.color + '20',
                              color: node.color
                            }}
                          >
                            {node.type}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          {Object.entries(node.data)
                            .filter(([key]) => !['date', 'onsetDate', 'startDate'].includes(key))
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <div key={key} className="mb-1">
                                <span className="font-medium capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>{' '}
                                {String(value).slice(0, 100)}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
