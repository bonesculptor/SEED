import React, { useState, useEffect } from 'react';
import { FileText, User, Database, Shield, CheckCircle, AlertTriangle, Activity, Heart, Stethoscope, Pill, ClipboardList, Eye, Lock, ArrowRight, Settings } from 'lucide-react';
import { cynefinService } from '../services/cynefinService';
import { ikigaiService } from '../services/ikigaiService';
import { dataMeshService } from '../services/dataMeshService';

interface ProcessNode {
  id: string;
  type: 'human' | 'tier1' | 'tier2' | 'tier3' | 'data' | 'decision' | 'output';
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  cynefinDomain?: string;
  ikigaiScore?: number;
  data?: any;
  nextNodes?: string[];
}

interface MedicalRecordWorkflowProps {
  workspaceId: string;
}

export function MedicalRecordWorkflow({ workspaceId }: MedicalRecordWorkflowProps) {
  const [activeNode, setActiveNode] = useState<string>('node1');
  const [workflowData, setWorkflowData] = useState<Record<string, any>>({});
  const [nodes, setNodes] = useState<ProcessNode[]>([
    {
      id: 'node1',
      type: 'human',
      title: 'Patient Information Collection',
      description: 'Patient provides personal and medical history',
      status: 'pending',
      cynefinDomain: 'clear',
      nextNodes: ['node2'],
    },
    {
      id: 'node2',
      type: 'tier1',
      title: 'Monitor Agent: Validate Data',
      description: 'Check completeness and format of patient information',
      status: 'pending',
      cynefinDomain: 'clear',
      nextNodes: ['node3'],
    },
    {
      id: 'node3',
      type: 'data',
      title: 'Store in EHR System',
      description: 'Data Contract: Patient_Records_v1.0',
      status: 'pending',
      nextNodes: ['node4'],
    },
    {
      id: 'node4',
      type: 'tier1',
      title: 'Analyst Agent: Assess Medical History',
      description: 'Analyze patterns, identify risk factors',
      status: 'pending',
      cynefinDomain: 'complicated',
      nextNodes: ['node5'],
    },
    {
      id: 'node5',
      type: 'decision',
      title: 'Cynefin Classification',
      description: 'Determine complexity of case',
      status: 'pending',
      nextNodes: ['node6', 'node7', 'node8'],
    },
    {
      id: 'node6',
      type: 'tier1',
      title: 'Clear Case: Standard Protocol',
      description: 'Planner Agent: Apply clinical guidelines',
      status: 'pending',
      cynefinDomain: 'clear',
      nextNodes: ['node9'],
    },
    {
      id: 'node7',
      type: 'tier2',
      title: 'Complex Case: Ensemble Review',
      description: 'Ensemble Governor: Multi-agent analysis',
      status: 'pending',
      cynefinDomain: 'complex',
      nextNodes: ['node10'],
    },
    {
      id: 'node8',
      type: 'tier3',
      title: 'Chaotic Case: Digital Twin Simulation',
      description: 'Digital Twin: Predict outcomes, rapid stabilization',
      status: 'pending',
      cynefinDomain: 'chaotic',
      nextNodes: ['node10'],
    },
    {
      id: 'node9',
      type: 'tier1',
      title: 'Executor Agent: Generate Care Plan',
      description: 'Create treatment recommendations',
      status: 'pending',
      nextNodes: ['node11'],
    },
    {
      id: 'node10',
      type: 'human',
      title: 'HOTL: Physician Review',
      description: 'Human oversight for complex/chaotic cases',
      status: 'pending',
      nextNodes: ['node11'],
    },
    {
      id: 'node11',
      type: 'tier1',
      title: 'Knowledge Agent: Update Medical Record',
      description: 'Store care plan and rationale',
      status: 'pending',
      nextNodes: ['node12'],
    },
    {
      id: 'node12',
      type: 'output',
      title: 'Patient Care Plan Delivered',
      description: 'Secure delivery to patient and care team',
      status: 'pending',
      nextNodes: [],
    },
  ]);

  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    symptoms: '',
    medicalHistory: '',
    medications: '',
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'human': return User;
      case 'tier1': return Activity;
      case 'tier2': return Shield;
      case 'tier3': return Heart;
      case 'data': return Database;
      case 'decision': return AlertTriangle;
      case 'output': return CheckCircle;
      default: return FileText;
    }
  };

  const getNodeColor = (type: string, status: string) => {
    if (status === 'completed') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (status === 'active') return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (status === 'error') return 'border-red-500 bg-red-50 dark:bg-red-900/20';

    switch (type) {
      case 'human': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/10';
      case 'tier1': return 'border-cyan-300 bg-cyan-50 dark:bg-cyan-900/10';
      case 'tier2': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/10';
      case 'tier3': return 'border-orange-300 bg-orange-50 dark:bg-orange-900/10';
      case 'data': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10';
      case 'decision': return 'border-pink-300 bg-pink-50 dark:bg-pink-900/10';
      case 'output': return 'border-green-300 bg-green-50 dark:bg-green-900/10';
      default: return 'border-slate-300 bg-slate-50';
    }
  };

  const updateNodeStatus = (nodeId: string, status: ProcessNode['status'], data?: any) => {
    setNodes(nodes.map(n =>
      n.id === nodeId ? { ...n, status, data } : n
    ));

    if (data) {
      setWorkflowData({ ...workflowData, [nodeId]: data });
    }
  };

  const executeNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setActiveNode(nodeId);
    updateNodeStatus(nodeId, 'active');

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Execute based on node type
    switch (node.type) {
      case 'human':
        if (nodeId === 'node1') {
          // Patient data collection
          updateNodeStatus(nodeId, 'completed', patientData);
        } else if (nodeId === 'node10') {
          // Physician review - require human approval
          const approved = confirm('Physician Review: Approve care plan?');
          updateNodeStatus(nodeId, approved ? 'completed' : 'error');
        }
        break;

      case 'tier1':
        // Simulate agent processing with Ikigai scoring
        const ikigaiScore = Math.random() * 40 + 60; // 60-100
        updateNodeStatus(nodeId, 'completed', { ikigaiScore });
        break;

      case 'tier2':
        // Ensemble processing
        updateNodeStatus(nodeId, 'completed', { ensembleDecision: 'multi-agent-review-completed' });
        break;

      case 'tier3':
        // Digital twin simulation
        updateNodeStatus(nodeId, 'completed', { simulation: 'predictive-model-executed' });
        break;

      case 'data':
        // Data mesh operation
        updateNodeStatus(nodeId, 'completed', { stored: true, timestamp: new Date().toISOString() });
        break;

      case 'decision':
        // Cynefin classification
        const classification = await cynefinService.classifyProblem(
          workspaceId,
          `Patient case: ${patientData.symptoms}`
        );
        updateNodeStatus(nodeId, 'completed', { classification });
        break;

      case 'output':
        updateNodeStatus(nodeId, 'completed', { delivered: true });
        break;
    }

    // Auto-advance to next node if single path
    if (node.nextNodes && node.nextNodes.length === 1) {
      setTimeout(() => {
        setActiveNode(node.nextNodes![0]);
      }, 500);
    }
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'human': return 'Human Context (HCP)';
      case 'tier1': return 'Tier 1: Individual Agent';
      case 'tier2': return 'Tier 2: Ensemble';
      case 'tier3': return 'Tier 3: Digital Twin';
      case 'data': return 'Data Context (DCP)';
      case 'decision': return 'Cynefin Classification';
      case 'output': return 'Output';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Stethoscope className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Medical Record Management Workflow</h1>
        </div>
        <p className="text-blue-100">
          Interactive process map demonstrating three-tier agent architecture with Cynefin classification
        </p>
      </div>

      {/* Patient Data Input */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Step 1: Patient Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={patientData.name}
              onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
              Age
            </label>
            <input
              type="number"
              value={patientData.age}
              onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
              placeholder="45"
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
              Symptoms
            </label>
            <textarea
              value={patientData.symptoms}
              onChange={(e) => setPatientData({ ...patientData, symptoms: e.target.value })}
              placeholder="Describe symptoms..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
              Medical History
            </label>
            <textarea
              value={patientData.medicalHistory}
              onChange={(e) => setPatientData({ ...patientData, medicalHistory: e.target.value })}
              placeholder="Previous conditions, surgeries, allergies..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-1">
              Current Medications
            </label>
            <input
              type="text"
              value={patientData.medications}
              onChange={(e) => setPatientData({ ...patientData, medications: e.target.value })}
              placeholder="List medications..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
        </div>
        <button
          onClick={() => executeNode('node1')}
          disabled={!patientData.name || !patientData.symptoms}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Patient Information
        </button>
      </div>

      {/* Process Map */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Interactive Process Map
        </h2>

        <div className="space-y-4">
          {nodes.map((node, index) => {
            const Icon = getNodeIcon(node.type);
            const isActive = activeNode === node.id;
            const canExecute = node.status === 'pending' && (
              index === 0 || nodes[index - 1]?.status === 'completed'
            );

            return (
              <div key={node.id}>
                <div
                  className={`border-2 rounded-lg p-4 transition-all ${getNodeColor(node.type, node.status)} ${
                    isActive ? 'ring-2 ring-blue-400 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg ${
                      node.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                      node.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        node.status === 'completed' ? 'text-green-600' :
                        node.status === 'active' ? 'text-blue-600' :
                        'text-slate-600'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-dark-text">
                              {node.title}
                            </h3>
                            <span className="px-2 py-0.5 text-xs rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {getNodeTypeLabel(node.type)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-dark-muted">
                            {node.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {node.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {node.status === 'active' && (
                            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                          )}
                          {canExecute && node.status === 'pending' && (
                            <button
                              onClick={() => executeNode(node.id)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Execute
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      {node.cynefinDomain && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            node.cynefinDomain === 'clear' ? 'bg-green-100 text-green-800' :
                            node.cynefinDomain === 'complicated' ? 'bg-blue-100 text-blue-800' :
                            node.cynefinDomain === 'complex' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Cynefin: {node.cynefinDomain}
                          </span>
                        </div>
                      )}

                      {/* Node Data */}
                      {node.data && (
                        <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                          <pre className="text-slate-700 dark:text-slate-300">
                            {JSON.stringify(node.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector Arrow */}
                {index < nodes.length - 1 && node.nextNodes && node.nextNodes.length === 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className={`w-5 h-5 ${
                      node.status === 'completed' ? 'text-green-500' : 'text-slate-400'
                    }`} />
                  </div>
                )}

                {/* Branch Arrows */}
                {node.nextNodes && node.nextNodes.length > 1 && (
                  <div className="flex justify-center items-center gap-8 my-4">
                    {node.nextNodes.map((nextId) => (
                      <div key={nextId} className="flex flex-col items-center">
                        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                        <span className="text-xs text-slate-500 mt-1">
                          {nodes.find(n => n.id === nextId)?.cynefinDomain || 'branch'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-50 dark:bg-dark-hover rounded-lg border border-slate-200 dark:border-dark-border p-6">
        <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-4">
          Process Map Legend
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Human Context (HCP) - Human input/approval</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Tier 1 Agents - Individual agents (Monitor, Analyst, Planner, Executor)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Tier 2 Ensemble - Multi-agent coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Tier 3 Digital Twin - Predictive simulation</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Data Context (DCP) - Data storage/retrieval</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-pink-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Decision Point - Cynefin-based routing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-700 dark:text-dark-text">Output - Final deliverable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
