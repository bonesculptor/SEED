import React, { useState, useRef, useEffect } from 'react';
import { Plus, Play, Save, Download, Upload, Trash2, Settings, Copy, ArrowRight, Users, Brain, Database, Shield, Activity, CheckCircle, AlertTriangle, Zap, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NavigationMenu from './NavigationMenu';

interface WorkflowNode {
  id: string;
  type: 'start' | 'agent' | 'decision' | 'data' | 'hotl' | 'end';
  agentType?: 'monitor' | 'analyst' | 'planner' | 'executor' | 'knowledge' | 'ensemble';
  tier?: 'tier1' | 'tier2' | 'tier3';
  protocol?: 'HCP' | 'BCP' | 'MCP' | 'DCP' | 'GCP';
  label: string;
  position: { x: number; y: number };
  config?: any;
  status?: 'idle' | 'running' | 'completed' | 'error';
}

interface Connection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

interface WorkflowBuilderProps {
  projectId?: string;
  onSave?: (workflow: { nodes: WorkflowNode[]; connections: Connection[] }) => void;
}

export function WorkflowBuilder({ projectId, onSave }: WorkflowBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [contextType, setContextType] = useState<string>('GENERAL');
  const [saving, setSaving] = useState(false);

  const nodeLibrary = [
    {
      category: 'Flow Control',
      nodes: [
        { type: 'start', label: 'Start', icon: Play, color: 'bg-green-500' },
        { type: 'decision', label: 'Decision', icon: AlertTriangle, color: 'bg-yellow-500' },
        { type: 'end', label: 'End', icon: CheckCircle, color: 'bg-blue-500' },
      ],
    },
    {
      category: 'Tier 1 Agents',
      nodes: [
        { type: 'agent', agentType: 'monitor', label: 'Monitor Agent', icon: Activity, color: 'bg-cyan-500', tier: 'tier1' },
        { type: 'agent', agentType: 'analyst', label: 'Analyst Agent', icon: Brain, color: 'bg-cyan-500', tier: 'tier1' },
        { type: 'agent', agentType: 'planner', label: 'Planner Agent', icon: Users, color: 'bg-cyan-500', tier: 'tier1' },
        { type: 'agent', agentType: 'executor', label: 'Executor Agent', icon: Zap, color: 'bg-cyan-500', tier: 'tier1' },
        { type: 'agent', agentType: 'knowledge', label: 'Knowledge Agent', icon: Database, color: 'bg-cyan-500', tier: 'tier1' },
      ],
    },
    {
      category: 'Tier 2 & 3',
      nodes: [
        { type: 'agent', agentType: 'ensemble', label: 'Ensemble Governor', icon: Shield, color: 'bg-purple-500', tier: 'tier2' },
        { type: 'agent', label: 'Digital Twin', icon: Brain, color: 'bg-orange-500', tier: 'tier3' },
      ],
    },
    {
      category: 'Context',
      nodes: [
        { type: 'hotl', label: 'Human on Loop', icon: Users, color: 'bg-blue-500' },
        { type: 'data', label: 'Data Store', icon: Database, color: 'bg-yellow-500' },
      ],
    },
  ];

  const addNode = (nodeTemplate: any, position?: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeTemplate.type,
      agentType: nodeTemplate.agentType,
      tier: nodeTemplate.tier,
      label: nodeTemplate.label,
      position: position || { x: 100 + nodes.length * 50, y: 100 + nodes.length * 30 },
      status: 'idle',
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, position } : n));
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('connection-handle')) {
      return;
    }

    if (target.closest('.delete-button')) {
      return;
    }

    e.stopPropagation();

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      updateNodePosition(draggingNode, {
        x: Math.max(0, e.clientX - rect.left - dragOffset.x),
        y: Math.max(0, e.clientY - rect.top - dragOffset.y),
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handleConnectionStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };

  const handleConnectionEnd = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== nodeId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: nodeId,
      };
      setConnections([...connections, newConnection]);
    }
    setConnectingFrom(null);
  };

  const deleteConnection = (connId: string) => {
    setConnections(connections.filter(c => c.id !== connId));
  };

  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
      setSelectedNode(nodeId);
    }
  };

  const updateNodeData = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    if (editingNode?.id === nodeId) {
      setEditingNode({ ...editingNode, ...updates });
    }
  };

  const closeNodeEditor = () => {
    setEditingNode(null);
  };

  const executeWorkflow = async () => {
    setExecuting(true);

    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      alert('Add a Start node to execute the workflow');
      setExecuting(false);
      return;
    }

    const executedNodes = new Set<string>();
    const queue = [startNode.id];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      if (executedNodes.has(currentNodeId)) continue;

      setNodes(prev => prev.map(n =>
        n.id === currentNodeId ? { ...n, status: 'running' } : n
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));

      setNodes(prev => prev.map(n =>
        n.id === currentNodeId ? { ...n, status: 'completed' } : n
      ));
      executedNodes.add(currentNodeId);

      const nextConnections = connections.filter(c => c.from === currentNodeId);
      nextConnections.forEach(conn => {
        if (!executedNodes.has(conn.to)) {
          queue.push(conn.to);
        }
      });
    }

    setExecuting(false);
  };

  const resetWorkflow = () => {
    setNodes(nodes.map(n => ({ ...n, status: 'idle' })));
  };

  const openSaveDialog = () => {
    setShowSaveDialog(true);
  };

  const saveWorkflowToDatabase = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      setSaving(true);

      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        context_type: contextType,
        workflow_data: { nodes, connections },
        status: 'active',
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;

      alert(`Workflow "${workflowName}" saved successfully!`);
      setShowSaveDialog(false);
      setWorkflowName('');
      setWorkflowDescription('');

      if (onSave) {
        onSave({ nodes, connections });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const loadWorkflow = () => {
    const saved = localStorage.getItem('workflow');
    if (saved) {
      const workflow = JSON.parse(saved);
      setNodes(workflow.nodes);
      setConnections(workflow.connections);
      alert('Workflow loaded!');
    }
  };

  const exportWorkflow = () => {
    const workflow = { nodes, connections };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
  };

  const getNodeIcon = (node: WorkflowNode) => {
    const iconMap: Record<string, any> = {
      start: Play,
      end: CheckCircle,
      decision: AlertTriangle,
      data: Database,
      hotl: Users,
      monitor: Activity,
      analyst: Brain,
      planner: Users,
      executor: Zap,
      knowledge: Database,
      ensemble: Shield,
    };
    return iconMap[node.agentType || node.type] || Activity;
  };

  const getNodeColor = (node: WorkflowNode) => {
    if (node.status === 'running') return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/50';
    if (node.status === 'completed') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (node.status === 'error') return 'border-red-500 bg-red-50 dark:bg-red-900/20';

    const colorMap: Record<string, string> = {
      start: 'border-green-500 bg-green-50 dark:bg-green-900/10',
      end: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
      decision: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
      data: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
      hotl: 'border-purple-500 bg-purple-50 dark:bg-purple-900/10',
      tier1: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10',
      tier2: 'border-purple-500 bg-purple-50 dark:bg-purple-900/10',
      tier3: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
    };

    return colorMap[node.tier || node.type] || 'border-slate-300 bg-white dark:bg-dark-surface';
  };

  const getNodeHeight = (node: WorkflowNode) => {
    let height = 56;
    if (node.tier) height += 16;
    if (node.status && node.status !== 'idle') height += 32;
    return height;
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-dark-bg">
      <NavigationMenu currentPath="/workflow" />

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                Save Workflow
              </h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Medical Record Transfer"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
                  Description
                </label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe the purpose of this workflow"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
                  Context Type
                </label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                >
                  <option value="GENERAL">General</option>
                  <option value="HCP">HCP - Human Context</option>
                  <option value="BCP">BCP - Business Context</option>
                  <option value="MCP">MCP - Machine Context</option>
                  <option value="DCP">DCP - Data Context</option>
                  <option value="GCP">GCP - Governance Context</option>
                  <option value="ACP">ACP - Agent Context</option>
                  <option value="TCP">TCP - Test Context</option>
                  <option value="GeoCP">GeoCP - Geographical Context</option>
                  <option value="ECP">ECP - Ecosystem Context</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWorkflowToDatabase}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Workflow'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Library Sidebar */}
      {showNodeLibrary && (
        <div className="w-64 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border overflow-y-auto ml-16">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
              Node Library
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
              Click to add nodes
            </p>
          </div>

          <div className="p-4 space-y-6">
            {nodeLibrary.map((category) => (
              <div key={category.category}>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-dark-muted uppercase tracking-wider mb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.nodes.map((nodeTemplate, index) => {
                    const Icon = nodeTemplate.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => addNode(nodeTemplate)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border-2 ${nodeTemplate.color} text-white hover:opacity-80 transition-opacity`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{nodeTemplate.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node Editor Panel */}
      {editingNode && (
        <div className="w-96 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border p-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
              Edit Node
            </h2>
            <button
              onClick={closeNodeEditor}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Node Label */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                Node Label
              </label>
              <input
                type="text"
                value={editingNode.label}
                onChange={(e) => updateNodeData(editingNode.id, { label: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                placeholder="Enter node label"
              />
            </div>

            {/* Node Type Display */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                Node Type
              </label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-dark-text">
                {editingNode.type.charAt(0).toUpperCase() + editingNode.type.slice(1)}
              </div>
            </div>

            {/* Agent Type for Agent Nodes */}
            {editingNode.type === 'agent' && editingNode.agentType && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                  Agent Type
                </label>
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-dark-text">
                  {editingNode.agentType === 'monitor' && 'Monitor Agent'}
                  {editingNode.agentType === 'analyst' && 'Analyst Agent'}
                  {editingNode.agentType === 'executor' && 'Executor Agent'}
                  {editingNode.agentType === 'specialist' && 'Specialist Agent'}
                </div>
              </div>
            )}

            {/* Tier for Tiered Agents */}
            {editingNode.tier && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                  Agent Tier
                </label>
                <select
                  value={editingNode.tier}
                  onChange={(e) => updateNodeData(editingNode.id, { tier: e.target.value as 'tier1' | 'tier2' | 'tier3' | 'hotl' })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                >
                  <option value="tier1">Tier 1</option>
                  <option value="tier2">Tier 2</option>
                  <option value="tier3">Tier 3</option>
                  <option value="hotl">HOTL</option>
                </select>
              </div>
            )}

            {/* Node Configuration Section */}
            <div className="border-t border-slate-200 dark:border-dark-border pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-4">
                Node Configuration
              </h3>

              {/* Decision Node Options */}
              {editingNode.type === 'decision' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-dark-muted mb-2">
                      Decision Criteria
                    </label>
                    <textarea
                      value={editingNode.data?.criteria || ''}
                      onChange={(e) => updateNodeData(editingNode.id, {
                        data: { ...editingNode.data, criteria: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                      rows={3}
                      placeholder="Define decision logic..."
                    />
                  </div>
                </div>
              )}

              {/* Data Node Options */}
              {editingNode.type === 'data' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-dark-muted mb-2">
                      Data Source
                    </label>
                    <input
                      type="text"
                      value={editingNode.data?.source || ''}
                      onChange={(e) => updateNodeData(editingNode.id, {
                        data: { ...editingNode.data, source: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                      placeholder="Enter data source..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-dark-muted mb-2">
                      Transform Rules
                    </label>
                    <textarea
                      value={editingNode.data?.transform || ''}
                      onChange={(e) => updateNodeData(editingNode.id, {
                        data: { ...editingNode.data, transform: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                      rows={3}
                      placeholder="Define transformation rules..."
                    />
                  </div>
                </div>
              )}

              {/* Agent Node Options */}
              {editingNode.type === 'agent' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-dark-muted mb-2">
                      Agent Instructions
                    </label>
                    <textarea
                      value={editingNode.data?.instructions || ''}
                      onChange={(e) => updateNodeData(editingNode.id, {
                        data: { ...editingNode.data, instructions: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                      rows={4}
                      placeholder="Define agent behavior and goals..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-dark-muted mb-2">
                      Escalation Threshold
                    </label>
                    <select
                      value={editingNode.data?.threshold || 'medium'}
                      onChange={(e) => updateNodeData(editingNode.id, {
                        data: { ...editingNode.data, threshold: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text"
                    >
                      <option value="low">Low - Escalate easily</option>
                      <option value="medium">Medium - Standard threshold</option>
                      <option value="high">High - Attempt resolution first</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Generic Configuration for Other Nodes */}
              {!['decision', 'data', 'agent', 'start', 'end'].includes(editingNode.type) && (
                <div>
                  <label className="block text-sm text-slate-700 dark:text-dark-muted mb-2">
                    Configuration
                  </label>
                  <textarea
                    value={JSON.stringify(editingNode.data || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const data = JSON.parse(e.target.value);
                        updateNodeData(editingNode.id, { data });
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-slate-900 dark:text-dark-text font-mono text-xs"
                    rows={6}
                    placeholder="{}"
                  />
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
                    Enter valid JSON configuration
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-200 dark:border-dark-border pt-6">
              <button
                onClick={closeNodeEditor}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNodeLibrary(!showNodeLibrary)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={executeWorkflow}
              disabled={executing || nodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {executing ? 'Executing...' : 'Execute'}
            </button>
            <button
              onClick={resetWorkflow}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openSaveDialog}
              disabled={nodes.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={loadWorkflow}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Upload className="w-4 h-4" />
              Load
            </button>
            <button
              onClick={exportWorkflow}
              disabled={nodes.length === 0}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-slate-50 dark:bg-dark-bg"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="relative" style={{ width: '5000px', height: '3000px', minHeight: '100%' }}>
          {/* Connection Lines with Arrows */}
          <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '5000px', height: '3000px', zIndex: 1 }}>
            <defs>
              <marker
                id="arrowhead-normal"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
              <marker
                id="arrowhead-completed"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#22c55e" />
              </marker>
            </defs>

            {connections.map((conn) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const fromHeight = getNodeHeight(fromNode);
              const toHeight = getNodeHeight(toNode);

              const nodeWidth = 160;
              const handleOffset = 8;
              const x1 = fromNode.position.x + nodeWidth + handleOffset;
              const y1 = fromNode.position.y + (fromHeight / 2);
              const x2 = toNode.position.x - handleOffset;
              const y2 = toNode.position.y + (toHeight / 2);

              const dx = x2 - x1;
              const dy = y2 - y1;
              const distance = Math.sqrt(dx * dx + dy * dy);

              const controlPointOffset = Math.min(Math.abs(dx) / 2, 100);
              const cx1 = x1 + controlPointOffset;
              const cx2 = x2 - controlPointOffset;

              const strokeColor =
                fromNode.status === 'completed' ? '#22c55e' :
                fromNode.status === 'running' ? '#3b82f6' :
                '#94a3b8';

              const markerId =
                fromNode.status === 'completed' ? 'arrowhead-completed' :
                fromNode.status === 'running' ? 'arrowhead-active' :
                'arrowhead-normal';

              const t = 0.5;
              const midX = Math.pow(1-t, 3) * x1 + 3 * Math.pow(1-t, 2) * t * cx1 + 3 * (1-t) * Math.pow(t, 2) * cx2 + Math.pow(t, 3) * x2;
              const midY = Math.pow(1-t, 3) * y1 + 3 * Math.pow(1-t, 2) * t * y1 + 3 * (1-t) * Math.pow(t, 2) * y2 + Math.pow(t, 3) * y2;

              return (
                <g key={conn.id}>
                  <path
                    d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
                    stroke={strokeColor}
                    strokeWidth="3"
                    fill="none"
                    markerEnd={`url(#${markerId})`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r="12"
                    fill="white"
                    stroke={strokeColor}
                    strokeWidth="2"
                    className="pointer-events-auto cursor-pointer hover:r-14"
                    onClick={() => deleteConnection(conn.id)}
                  />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="16"
                    fontWeight="bold"
                    fill={strokeColor}
                    className="pointer-events-auto cursor-pointer select-none"
                    onClick={() => deleteConnection(conn.id)}
                  >
                    ×
                  </text>
                </g>
              );
            })}

            {/* Temporary connection line while connecting */}
            {connectingFrom && (() => {
              const fromNode = nodes.find(n => n.id === connectingFrom);
              if (!fromNode) return null;
              const fromHeight = getNodeHeight(fromNode);
              const nodeWidth = 160;
              const handleOffset = 8;
              return (
                <line
                  x1={fromNode.position.x + nodeWidth + handleOffset}
                  y1={fromNode.position.y + (fromHeight / 2)}
                  x2={fromNode.position.x + nodeWidth + handleOffset + 60}
                  y2={fromNode.position.y + (fromHeight / 2)}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  strokeLinecap="round"
                />
              );
            })()}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const Icon = getNodeIcon(node);
            return (
              <div
                key={node.id}
                className={`absolute cursor-move border-2 rounded-lg shadow-lg transition-all ${getNodeColor(node)} ${
                  selectedNode === node.id ? 'ring-2 ring-blue-400' : ''
                } ${draggingNode === node.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: '160px',
                  zIndex: draggingNode === node.id ? 10 : 2,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onClick={() => handleNodeClick(node.id)}
              >
                <div className="p-3 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-dark-text truncate">
                      {node.label}
                    </div>
                    {node.tier && (
                      <div className="text-xs text-slate-500 dark:text-dark-muted">
                        {node.tier.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    className="delete-button p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>

                {node.status && node.status !== 'idle' && (
                  <div className="px-3 pb-2">
                    <div className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${
                      node.status === 'running' ? 'bg-blue-100 text-blue-700' :
                      node.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {node.status === 'running' && <Activity className="w-3 h-3 animate-pulse" />}
                      {node.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {node.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                      {node.status}
                    </div>
                  </div>
                )}

                <div
                  className="connection-handle absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => handleConnectionEnd(e, node.id)}
                  title="Click to end connection here"
                />
                <div
                  className="connection-handle absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform z-10"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => handleConnectionStart(e, node.id)}
                  title="Click to start connection from here"
                />
              </div>
            );
          })}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-2">
                  Build Your Workflow
                </h3>
                <p className="text-slate-600 dark:text-dark-muted max-w-md">
                  Click nodes from the library to add them to the canvas.
                  <br />
                  Click green handle → blue handle to connect.
                  <br />
                  Drag nodes to reposition.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border p-3">
          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-dark-muted">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Click green → start connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Click blue → end connection</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              <span>Arrow shows data flow direction</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Nodes: {nodes.length} | Connections: {connections.length}</span>
            </div>
            {connectingFrom && (
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>Click a blue handle to complete connection</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
