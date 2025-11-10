import React, { useState, useEffect } from 'react';
import { Plus, Play, CheckCircle, Clock, AlertCircle, Users, Database, Shield, Brain, MapPin, Plane, FileText, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cynefinService } from '../services/cynefinService';
import { ikigaiService } from '../services/ikigaiService';
import { dataMeshService } from '../services/dataMeshService';

interface Project {
  id?: string;
  name: string;
  type: 'trip' | 'medical' | 'general';
  description: string;
  status: 'setup' | 'active' | 'completed';
  created_at?: string;
}

interface ProjectTask {
  id: string;
  project_id: string;
  task_name: string;
  protocol: 'HCP' | 'BCP' | 'MCP' | 'DCP' | 'GCP';
  agent_tier: 'tier1' | 'tier2' | 'tier3';
  assigned_agent?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  cynefin_domain?: string;
  ikigai_score?: number;
}

interface AgentStatus {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  tier: string;
  current_task?: string;
  status: string;
  ikigai_score: number;
  tasks_completed: number;
}

export function ProjectCreation() {
  const [step, setStep] = useState<'select' | 'configure' | 'tasks' | 'agents' | 'monitor'>('select');
  const [project, setProject] = useState<Project>({
    name: '',
    type: 'trip',
    description: '',
    status: 'setup',
  });
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [showAgentDetails, setShowAgentDetails] = useState<string | null>(null);

  const projectTemplates = {
    trip: {
      name: 'Trip Planning & Medical Records',
      description: 'Plan travel and ensure medical records are collected and transferred',
      defaultTasks: [
        {
          task_name: 'Collect Traveler Information',
          protocol: 'HCP' as const,
          agent_tier: 'tier1' as const,
          status: 'pending' as const,
          progress: 0,
        },
        {
          task_name: 'Medical History Assessment',
          protocol: 'HCP' as const,
          agent_tier: 'tier1' as const,
          status: 'pending' as const,
          progress: 0,
        },
        {
          task_name: 'Trip Logistics Planning',
          protocol: 'BCP' as const,
          agent_tier: 'tier1' as const,
          status: 'pending' as const,
          progress: 0,
        },
        {
          task_name: 'Data Collection & Validation',
          protocol: 'DCP' as const,
          agent_tier: 'tier1' as const,
          status: 'pending' as const,
          progress: 0,
        },
        {
          task_name: 'Medical Record Analysis',
          protocol: 'MCP' as const,
          agent_tier: 'tier2' as const,
          status: 'pending' as const,
          progress: 0,
        },
        {
          task_name: 'Privacy & Compliance Check',
          protocol: 'GCP' as const,
          agent_tier: 'tier1' as const,
          status: 'pending' as const,
          progress: 0,
        },
        {
          task_name: 'Institution Transfer Preparation',
          protocol: 'DCP' as const,
          agent_tier: 'tier2' as const,
          status: 'pending' as const,
          progress: 0,
        },
      ],
    },
  };

  const createProject = async () => {
    const template = projectTemplates[project.type];
    const newProject = {
      ...project,
      name: project.name || template.name,
      description: project.description || template.description,
      status: 'active' as const,
    };

    // Create project tasks with agent assignments
    const projectTasks: ProjectTask[] = template.defaultTasks.map((task, index) => ({
      ...task,
      id: `task-${Date.now()}-${index}`,
      project_id: `project-${Date.now()}`,
    }));

    setProject(newProject);
    setTasks(projectTasks);

    // Initialize agents for each tier
    await initializeAgents(projectTasks);

    setStep('tasks');
  };

  const initializeAgents = async (projectTasks: ProjectTask[]) => {
    const workspaceId = 'default-workspace';
    const createdAgents: AgentStatus[] = [];

    // Create Tier 1 agents
    const tier1Types = ['monitor', 'analyst', 'planner', 'executor', 'knowledge'];
    for (const type of tier1Types) {
      try {
        const agent = await ikigaiService.createTier1Agent({
          workspace_id: workspaceId,
          agent_name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
          agent_type: type as any,
          capabilities: getAgentCapabilities(type),
          handles_domains: ['clear', 'complicated'],
        });

        // Calculate initial Ikigai score
        const ikigai = await ikigaiService.calculateAndStoreIkigai(
          workspaceId,
          agent.id!,
          'tier1',
          {
            love_score: 75 + Math.random() * 15,
            passion_score: 70 + Math.random() * 20,
            mission_score: 80 + Math.random() * 15,
            vocation_score: 75 + Math.random() * 20,
            competence_score: 70 + Math.random() * 25,
            value_score: 75 + Math.random() * 20,
            need_score: 80 + Math.random() * 15,
            contribution_score: 75 + Math.random() * 20,
          }
        );

        createdAgents.push({
          agent_id: agent.id!,
          agent_name: agent.agent_name,
          agent_type: type,
          tier: 'tier1',
          status: 'idle',
          ikigai_score: ikigai.ikigai_work_score,
          tasks_completed: 0,
        });
      } catch (error) {
        console.error(`Error creating ${type} agent:`, error);
      }
    }

    // Create Tier 2 ensemble
    try {
      const ensemble = await ikigaiService.createTier2Ensemble({
        workspace_id: workspaceId,
        ensemble_name: 'Project Coordination Ensemble',
        ensemble_type: 'ensemble_governor',
        tier1_agent_ids: createdAgents.map(a => a.agent_id),
        orchestration_strategy: 'adaptive',
      });

      createdAgents.push({
        agent_id: ensemble.id!,
        agent_name: 'Ensemble Governor',
        agent_type: 'ensemble_governor',
        tier: 'tier2',
        status: 'monitoring',
        ikigai_score: 85,
        tasks_completed: 0,
      });
    } catch (error) {
      console.error('Error creating ensemble:', error);
    }

    setAgents(createdAgents);
  };

  const getAgentCapabilities = (type: string): string[] => {
    const capabilityMap: Record<string, string[]> = {
      monitor: ['data_collection', 'validation', 'quality_check'],
      analyst: ['pattern_recognition', 'risk_assessment', 'classification'],
      planner: ['task_scheduling', 'resource_allocation', 'optimization'],
      executor: ['data_transfer', 'record_creation', 'system_integration'],
      knowledge: ['documentation', 'storage', 'retrieval'],
    };
    return capabilityMap[type] || [];
  };

  const assignAgentToTask = (taskId: string, agentId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const agent = agents.find(a => a.agent_id === agentId);
        return {
          ...task,
          assigned_agent: agent?.agent_name,
          status: 'in_progress' as const,
        };
      }
      return task;
    }));

    setAgents(agents.map(agent => {
      if (agent.agent_id === agentId) {
        return {
          ...agent,
          current_task: tasks.find(t => t.id === taskId)?.task_name,
          status: 'working',
        };
      }
      return agent;
    }));
  };

  const startTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.assigned_agent) return;

    // Simulate task execution with progress updates
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'in_progress' as const } : t));

    // Simulate progress
    const progressInterval = setInterval(() => {
      setTasks(current => current.map(t => {
        if (t.id === taskId && t.progress < 100) {
          return { ...t, progress: Math.min(100, t.progress + 20) };
        }
        return t;
      }));
    }, 1000);

    // Complete after 5 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setTasks(tasks.map(t => t.id === taskId ? {
        ...t,
        status: 'completed' as const,
        progress: 100
      } : t));

      // Update agent status
      const agent = agents.find(a => a.agent_name === task.assigned_agent);
      if (agent) {
        setAgents(agents.map(a =>
          a.agent_id === agent.agent_id
            ? { ...a, tasks_completed: a.tasks_completed + 1, status: 'idle', current_task: undefined }
            : a
        ));
      }
    }, 5000);
  };

  const getProtocolIcon = (protocol: string) => {
    const icons: Record<string, any> = {
      HCP: Users,
      BCP: FileText,
      MCP: Brain,
      DCP: Database,
      GCP: Shield,
    };
    return icons[protocol] || Activity;
  };

  const getProtocolColor = (protocol: string) => {
    const colors: Record<string, string> = {
      HCP: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      BCP: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      MCP: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      DCP: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
      GCP: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    };
    return colors[protocol] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Plane className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Project Creation & Management</h1>
        </div>
        <p className="text-blue-100">
          Create projects, assign agents, and track progress with intelligent automation
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-4">
        <div className="flex items-center justify-between">
          {['Select Type', 'Configure', 'Review Tasks', 'Assign Agents', 'Monitor Progress'].map((label, index) => {
            const stepKeys = ['select', 'configure', 'tasks', 'agents', 'monitor'];
            const currentIndex = stepKeys.indexOf(step);
            const isActive = currentIndex === index;
            const isCompleted = currentIndex > index;

            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-slate-900 dark:text-dark-text' : 'text-slate-500 dark:text-dark-muted'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Project Type */}
      {step === 'select' && (
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-4">
            Select Project Type
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => { setProject({ ...project, type: 'trip' }); setStep('configure'); }}
              className="p-6 border-2 border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Plane className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-2">
                Trip Planning
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-muted">
                Manage travel arrangements and medical record transfers
              </p>
            </button>

            <button
              onClick={() => { setProject({ ...project, type: 'medical' }); setStep('configure'); }}
              className="p-6 border-2 border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors opacity-50"
              disabled
            >
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-2">
                Medical Records
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-muted">
                Coming soon
              </p>
            </button>

            <button
              onClick={() => { setProject({ ...project, type: 'general' }); setStep('configure'); }}
              className="p-6 border-2 border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors opacity-50"
              disabled
            >
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-2">
                General Project
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-muted">
                Coming soon
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure Project */}
      {step === 'configure' && (
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-4">
            Configure Project
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                placeholder={projectTemplates[project.type].name}
                className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                Description
              </label>
              <textarea
                value={project.description}
                onChange={(e) => setProject({ ...project, description: e.target.value })}
                placeholder={projectTemplates[project.type].description}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="px-4 py-2 border border-slate-200 dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Project & Initialize Agents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review Tasks */}
      {step === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-4">
              Project Tasks
            </h2>
            <div className="space-y-3">
              {tasks.map((task, index) => {
                const ProtocolIcon = getProtocolIcon(task.protocol);
                return (
                  <div
                    key={task.id}
                    className="border border-slate-200 dark:border-dark-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <ProtocolIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-dark-text">
                            {index + 1}. {task.task_name}
                          </h3>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded ${getProtocolColor(task.protocol)}`}>
                              {task.protocol}
                            </span>
                            <span className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                              {task.agent_tier.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setStep('agents')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Proceed to Agent Assignment
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Assign Agents */}
      {step === 'agents' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tasks */}
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
              Tasks
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tasks.map((task) => {
                const ProtocolIcon = getProtocolIcon(task.protocol);
                return (
                  <div
                    key={task.id}
                    className={`border-2 rounded-lg p-3 ${
                      task.assigned_agent
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                        : 'border-slate-200 dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ProtocolIcon className="w-4 h-4" />
                      <span className="font-medium text-sm text-slate-900 dark:text-dark-text">
                        {task.task_name}
                      </span>
                    </div>
                    {task.assigned_agent ? (
                      <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Assigned to: {task.assigned_agent}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Drag agent here or click to assign
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agents */}
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
              Available Agents
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {agents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="border border-slate-200 dark:border-dark-border rounded-lg p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => setShowAgentDetails(agent.agent_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-dark-text">
                        {agent.agent_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {agent.tier.toUpperCase()} • {agent.agent_type}
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded ${
                      agent.ikigai_score >= 80 ? 'bg-green-100 text-green-700' :
                      agent.ikigai_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Ikigai: {agent.ikigai_score.toFixed(0)}
                    </div>
                  </div>
                  {agent.current_task && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Working on: {agent.current_task}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    Completed: {agent.tasks_completed} tasks
                  </div>

                  {/* Quick assign buttons */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tasks
                      .filter(t => !t.assigned_agent && t.agent_tier === agent.tier)
                      .slice(0, 2)
                      .map(t => (
                        <button
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            assignAgentToTask(t.id, agent.agent_id);
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200"
                        >
                          Assign to: {t.task_name.slice(0, 20)}...
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('monitor')}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Monitoring
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Monitor Progress */}
      {step === 'monitor' && (
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-4">
              <div className="text-sm text-slate-600 dark:text-dark-muted mb-1">Total Tasks</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-dark-text">{tasks.length}</div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-4">
              <div className="text-sm text-slate-600 dark:text-dark-muted mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-4">
              <div className="text-sm text-slate-600 dark:text-dark-muted mb-1">In Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'in_progress').length}
              </div>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-4">
              <div className="text-sm text-slate-600 dark:text-dark-muted mb-1">Active Agents</div>
              <div className="text-2xl font-bold text-purple-600">
                {agents.filter(a => a.status === 'working').length}
              </div>
            </div>
          </div>

          {/* Task Progress */}
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
              Task Progress
            </h2>
            <div className="space-y-4">
              {tasks.map((task) => {
                const ProtocolIcon = getProtocolIcon(task.protocol);
                return (
                  <div key={task.id} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <ProtocolIcon className="w-5 h-5 text-slate-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-dark-text">
                            {task.task_name}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded ${getProtocolColor(task.protocol)}`}>
                              {task.protocol}
                            </span>
                            {task.assigned_agent && (
                              <span className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {task.assigned_agent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {task.status === 'in_progress' && <Activity className="w-5 h-5 text-blue-600 animate-pulse" />}
                        {task.status === 'pending' && task.assigned_agent && (
                          <button
                            onClick={() => startTask(task.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {task.assigned_agent && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-dark-muted">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              task.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Status */}
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
              Agent Status
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="border border-slate-200 dark:border-dark-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-dark-text">
                        {agent.agent_name}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1">
                        {agent.tier.toUpperCase()} • {agent.agent_type}
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded ${
                      agent.status === 'working' ? 'bg-blue-100 text-blue-700' :
                      agent.status === 'idle' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {agent.status}
                    </div>
                  </div>

                  {agent.current_task && (
                    <div className="text-sm text-slate-600 dark:text-dark-muted mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {agent.current_task}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-dark-muted">
                      Ikigai Score
                    </span>
                    <span className={`font-semibold ${
                      agent.ikigai_score >= 80 ? 'text-green-600' :
                      agent.ikigai_score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {agent.ikigai_score.toFixed(1)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        agent.ikigai_score >= 80 ? 'bg-green-600' :
                        agent.ikigai_score >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${agent.ikigai_score}%` }}
                    />
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Tasks completed: {agent.tasks_completed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
