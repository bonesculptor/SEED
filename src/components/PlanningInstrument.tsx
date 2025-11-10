import React, { useState } from 'react';
import { Target, CheckCircle, Circle, ArrowRight, Plus, Settings, Brain, Users, AlertCircle } from 'lucide-react';
import { cynefinService } from '../services/cynefinService';
import { ikigaiService } from '../services/ikigaiService';

interface PlanningStep {
  id: string;
  title: string;
  description: string;
  cynefinDomain?: string;
  tier?: string;
  status: 'pending' | 'in_progress' | 'completed';
  ikigaiScore?: number;
}

interface PlanningInstrumentProps {
  workspaceId: string;
  projectType?: string;
}

export function PlanningInstrument({ workspaceId, projectType = 'general' }: PlanningInstrumentProps) {
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [steps, setSteps] = useState<PlanningStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showClassification, setShowClassification] = useState(false);

  const classifyProblem = async (description: string) => {
    try {
      const classification = await cynefinService.classifyProblem(
        workspaceId,
        description
      );
      return classification;
    } catch (error) {
      console.error('Error classifying problem:', error);
      return null;
    }
  };

  const addStep = async () => {
    const stepTitle = prompt('Enter step title:');
    const stepDescription = prompt('Enter step description:');

    if (!stepTitle || !stepDescription) return;

    // Classify the step
    const classification = await classifyProblem(stepDescription);

    const newStep: PlanningStep = {
      id: `step-${Date.now()}`,
      title: stepTitle,
      description: stepDescription,
      cynefinDomain: classification?.domain,
      tier: classification?.recommended_tier,
      status: 'pending',
    };

    setSteps([...steps, newStep]);
  };

  const updateStepStatus = (stepId: string, status: PlanningStep['status']) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, status } : s));
  };

  const getCynefinColor = (domain?: string) => {
    switch (domain) {
      case 'clear': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'complicated': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'complex': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'chaotic': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getTierInfo = (tier?: string) => {
    switch (tier) {
      case 'tier1':
        return { label: 'Tier 1: Individual Agents', icon: Users, color: 'text-blue-600' };
      case 'tier2':
        return { label: 'Tier 2: Ensemble', icon: Brain, color: 'text-purple-600' };
      case 'tier3':
        return { label: 'Tier 3: Digital Twin', icon: AlertCircle, color: 'text-orange-600' };
      default:
        return { label: 'Not Classified', icon: Circle, color: 'text-gray-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Setup */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-blue-600 dark:text-cyber-blue" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">
            Project Planning Instrument
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Medical Record Management System"
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
              Project Type
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            >
              <option value="general">General Project</option>
              <option value="medical">Medical/Healthcare</option>
              <option value="finance">Finance</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="technology">Technology</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
            Project Goal
          </label>
          <textarea
            value={projectGoal}
            onChange={(e) => setProjectGoal(e.target.value)}
            placeholder="Describe what you want to achieve..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
          />
        </div>

        <button
          onClick={addStep}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-cyber-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project Step
        </button>
      </div>

      {/* Planning Steps */}
      {steps.length > 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
            Project Steps ({steps.filter(s => s.status === 'completed').length}/{steps.length} Completed)
          </h3>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const tierInfo = getTierInfo(step.tier);
              const TierIcon = tierInfo.icon;

              return (
                <div
                  key={step.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    step.status === 'completed'
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                      : step.status === 'in_progress'
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-slate-200 dark:border-dark-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : step.status === 'in_progress' ? (
                        <Circle className="w-6 h-6 text-blue-600 animate-pulse" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-dark-text">
                            Step {index + 1}: {step.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {step.status === 'pending' && (
                            <button
                              onClick={() => updateStepStatus(step.id, 'in_progress')}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Start
                            </button>
                          )}
                          {step.status === 'in_progress' && (
                            <button
                              onClick={() => updateStepStatus(step.id, 'completed')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Classification Info */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {step.cynefinDomain && (
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getCynefinColor(step.cynefinDomain)}`}>
                            Cynefin: {step.cynefinDomain}
                          </span>
                        )}
                        {step.tier && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 flex items-center gap-1">
                            <TierIcon className="w-3 h-3" />
                            {tierInfo.label}
                          </span>
                        )}
                      </div>

                      {/* Recommended Actions */}
                      {step.cynefinDomain && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-dark-hover rounded border border-slate-200 dark:border-dark-border">
                          <p className="text-xs font-medium text-slate-700 dark:text-dark-text mb-1">
                            Recommended Approach:
                          </p>
                          <p className="text-xs text-slate-600 dark:text-dark-muted">
                            {step.cynefinDomain === 'clear' && 'Use standard procedures and best practices'}
                            {step.cynefinDomain === 'complicated' && 'Analyze with experts, apply good practices'}
                            {step.cynefinDomain === 'complex' && 'Experiment, probe and sense patterns'}
                            {step.cynefinDomain === 'chaotic' && 'Act quickly to stabilize, then assess'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {steps.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
            Project Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-dark-text">
                {steps.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-dark-muted">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-cyber-blue">
                {steps.filter(s => s.status === 'in_progress').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-dark-muted">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-400">
                {steps.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-dark-muted">Pending</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-dark-border rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {steps.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How to Use the Planning Instrument
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li>1. Enter your project name and goal above</li>
            <li>2. Click "Add Project Step" to break down your project</li>
            <li>3. Each step is automatically classified using the Cynefin model</li>
            <li>4. The system recommends which agent tier to use (Tier 1, 2, or 3)</li>
            <li>5. Follow the recommended approach for each domain</li>
            <li>6. Track progress as you complete each step</li>
          </ul>
        </div>
      )}
    </div>
  );
}
