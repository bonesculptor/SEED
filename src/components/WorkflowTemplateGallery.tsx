import React, { useState, useEffect } from 'react';
import {
  Workflow, Clock, Zap, Tag, ChevronRight, Check,
  AlertCircle, FileText, Sparkles, ArrowRight, CheckCircle2, Info
} from 'lucide-react';
import { endToEndWorkflowService, EndToEndWorkflow, WorkflowProtocolDefinition } from '../services/endToEndWorkflowService';
import { userContextService, UserContext } from '../services/userContextService';
import { protocolService } from '../services/protocolService';

export function WorkflowTemplateGallery({ onClose }: { onClose: () => void }) {
  const [activeContext, setActiveContext] = useState<UserContext | null>(null);
  const [workflows, setWorkflows] = useState<EndToEndWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<EndToEndWorkflow | null>(null);
  const [configStep, setConfigStep] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<number, Record<string, string>>>({});
  const [deploying, setDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState<string[]>([]);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const context = await userContextService.getActiveContext();
    setActiveContext(context);
    const templates = endToEndWorkflowService.getAllWorkflows(context);
    setWorkflows(templates);
  };

  const startWorkflowConfig = (workflow: EndToEndWorkflow) => {
    setSelectedWorkflow(workflow);
    setConfigStep(0);
    setUserInputs({});
    setDeploymentProgress([]);
  };

  const updateUserInputs = (protocolIndex: number, inputs: Record<string, string>) => {
    setUserInputs(prev => ({
      ...prev,
      [protocolIndex]: inputs
    }));
  };

  const deployWorkflow = async () => {
    if (!selectedWorkflow) return;

    setDeploying(true);
    setDeploymentProgress([]);

    try {
      const createdProtocols: any[] = [];
      const protocolIds: Record<string, string> = {};

      for (let i = 0; i < selectedWorkflow.protocols.length; i++) {
        const protocolDef = selectedWorkflow.protocols[i];
        const inputs = userInputs[i] || {};

        setDeploymentProgress(prev => [...prev, `Creating ${protocolDef.type.toUpperCase()}: ${protocolDef.title}...`]);

        // Generate protocol data using the getData function
        const protocolData = protocolDef.getData(activeContext, inputs);

        // Link to previously created protocols
        if (i > 0) {
          if (protocolDef.type === 'bcp' && createdProtocols[0]) {
            protocolData.linked_hcp_id = createdProtocols[0].id;
          } else if (protocolDef.type === 'mcp') {
            if (createdProtocols[0]) protocolData.linked_hcp_id = createdProtocols[0].id;
            if (createdProtocols[1]) protocolData.linked_bcp_id = createdProtocols[1].id;
          } else if (protocolDef.type === 'dcp') {
            if (createdProtocols[0]) protocolData.linked_hcp_id = createdProtocols[0].id;
            if (createdProtocols[1]) protocolData.linked_bcp_id = createdProtocols[1].id;
            if (createdProtocols[2]) protocolData.linked_mcp_id = createdProtocols[2].id;
          } else if (protocolDef.type === 'tcp') {
            if (createdProtocols[3]) protocolData.linked_dcp_id = createdProtocols[3].id;
          }
        }

        let created;
        switch (protocolDef.type) {
          case 'hcp':
            created = await protocolService.createHumanContext(protocolData);
            break;
          case 'bcp':
            created = await protocolService.createBusinessContext(protocolData);
            break;
          case 'mcp':
            created = await protocolService.createMachineContext(protocolData);
            break;
          case 'dcp':
            created = await protocolService.createDataContext(protocolData);
            break;
          case 'tcp':
            created = await protocolService.createTestContext(protocolData);
            break;
        }

        if (created) {
          createdProtocols.push(created);
          protocolIds[protocolDef.type] = created.id;
          setDeploymentProgress(prev => [...prev, `✓ Created ${protocolDef.type.toUpperCase()}: ${protocolDef.title}`]);
        }
      }

      setDeploymentProgress(prev => [...prev, `\n✓ Workflow "${selectedWorkflow.title}" deployed successfully!`]);

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error deploying workflow:', error);
      setDeploymentProgress(prev => [...prev, `\n✗ Error: ${(error as Error).message}`]);
    } finally {
      setDeploying(false);
    }
  };

  if (selectedWorkflow) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text">
                    {selectedWorkflow.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-dark-muted">
                    {selectedWorkflow.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              {selectedWorkflow.protocols.map((protocol, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-full h-1 rounded-full ${
                      i <= configStep ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />
                    <span className={`text-xs mt-1 ${
                      i <= configStep ? 'text-blue-600 font-medium' : 'text-slate-400'
                    }`}>
                      {protocol.type.toUpperCase()}
                    </span>
                  </div>
                  {i < selectedWorkflow.protocols.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Configuration Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
            {configStep < selectedWorkflow.protocols.length ? (
              <ConfigureProtocol
                protocol={selectedWorkflow.protocols[configStep]}
                inputs={userInputs[configStep] || {}}
                onChange={(inputs) => updateUserInputs(configStep, inputs)}
              />
            ) : (
              <WorkflowSummary
                workflow={selectedWorkflow}
                userInputs={userInputs}
                deploymentProgress={deploymentProgress}
                deploying={deploying}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <button
              onClick={() => setConfigStep(Math.max(0, configStep - 1))}
              disabled={configStep === 0}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            <div className="text-sm text-slate-600 dark:text-dark-muted">
              Step {configStep + 1} of {selectedWorkflow.protocols.length + 1}
            </div>

            {configStep < selectedWorkflow.protocols.length ? (
              <button
                onClick={() => setConfigStep(configStep + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={deployWorkflow}
                disabled={deploying}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deploying ? 'Deploying...' : 'Deploy Workflow'} <Zap className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Workflow Templates
              </h2>
              <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">
                {activeContext ? (
                  <>Context-aware workflows for <span className="font-medium text-blue-600">{activeContext.sectorName}</span></>
                ) : (
                  'Pre-built workflow templates to get started quickly'
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Workflow Gallery */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onSelect={() => startWorkflowConfig(workflow)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({ workflow, onSelect }: { workflow: WorkflowTemplate; onSelect: () => void }) {
  const complexityColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="border border-slate-200 dark:border-dark-border rounded-lg p-5 hover:border-blue-400 dark:hover:border-cyber-blue transition-all hover:shadow-lg group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-dark-text group-hover:text-blue-600 dark:group-hover:text-cyber-blue transition-colors">
              {workflow.title}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${complexityColors[workflow.complexity]}`}>
              {workflow.complexity}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-dark-muted mb-3">
            {workflow.description}
          </p>
        </div>
      </div>

      {/* Protocol Chain Visualization */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {workflow.protocols.map((protocol, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {protocol.type.toUpperCase()}
              </div>
            </div>
            {i < workflow.protocols.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-dark-muted mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {workflow.estimatedSetupTime}
        </div>
        <div className="flex items-center gap-1">
          <Workflow className="w-3 h-3" />
          {workflow.protocols.length} protocols
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {workflow.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Action */}
      <button
        onClick={onSelect}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        Use This Workflow <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ConfigureProtocol({ protocol, inputs, onChange }: {
  protocol: WorkflowProtocolDefinition;
  inputs: Record<string, string>;
  onChange: (inputs: Record<string, string>) => void;
}) {
  const handleInputChange = (fieldName: string, value: string) => {
    onChange({ ...inputs, [fieldName]: value });
  };

  // Set default values
  useEffect(() => {
    const defaults: Record<string, string> = {};
    protocol.requiredInputs.forEach(input => {
      if (input.defaultValue && !inputs[input.name]) {
        defaults[input.name] = input.defaultValue;
      }
    });
    if (Object.keys(defaults).length > 0) {
      onChange({ ...inputs, ...defaults });
    }
  }, [protocol]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-2">
          Configure {protocol.type.toUpperCase()}: {protocol.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-dark-muted">
          {protocol.description}
        </p>
      </div>

      {/* Show required inputs */}
      {protocol.requiredInputs && protocol.requiredInputs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-dark-text">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Required Configuration
          </div>

          {protocol.requiredInputs.map((input, i) => (
            <div key={i} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
              <label className="block mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-dark-text">
                    {input.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {input.required && (
                    <span className="text-xs text-red-600 dark:text-red-400">Required</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {input.description}
                </p>
                <input
                  type={input.type === 'api' || input.type === 'webhook' ? 'url' : 'text'}
                  placeholder={input.placeholder || ''}
                  value={inputs[input.name] || ''}
                  onChange={(e) => handleInputChange(input.name, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Info about what will be created */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <strong>What will be created:</strong> A complete {protocol.type.toUpperCase()} protocol with all required fields,
            linked to previous protocols in the chain, and ready to use immediately.
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowSummary({ workflow, userInputs, deploymentProgress, deploying }: {
  workflow: EndToEndWorkflow;
  userInputs: Record<number, Record<string, string>>;
  deploymentProgress: string[];
  deploying: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          {deploying ? (
            <Zap className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-white" />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text mb-2">
          {deploying ? 'Deploying Workflow...' : 'Ready to Deploy!'}
        </h3>
        <p className="text-slate-600 dark:text-dark-muted">
          {deploying ? 'Please wait while we create your protocols' : 'Review your workflow configuration'}
        </p>
      </div>

      {/* Show use cases and expected outcomes */}
      {!deploying && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-dark-text mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Use Cases
            </h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-dark-muted">
              {workflow.useCases.map((useCase, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-dark-text mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Expected Outcomes
            </h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-dark-muted">
              {workflow.expectedOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Deployment progress */}
      {deploymentProgress.length > 0 && (
        <div className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
          <h4 className="font-medium text-slate-900 dark:text-dark-text mb-3">Deployment Progress</h4>
          <div className="space-y-2 font-mono text-sm">
            {deploymentProgress.map((progress, i) => (
              <div
                key={i}
                className={`${
                  progress.startsWith('✓') ? 'text-green-600 dark:text-green-400' :
                  progress.startsWith('✗') ? 'text-red-600 dark:text-red-400' :
                  'text-slate-600 dark:text-slate-400'
                }`}
              >
                {progress}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protocol summary */}
      {!deploying && deploymentProgress.length === 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-dark-text">Protocols to be Created:</h4>
          {workflow.protocols.map((protocol, i) => (
            <div key={i} className="border border-slate-200 dark:border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {protocol.type.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-dark-text">
                    {protocol.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {protocol.description}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              {userInputs[i] && Object.keys(userInputs[i]).length > 0 && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                  <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Configuration:
                  </div>
                  <div className="space-y-1">
                    {Object.entries(userInputs[i]).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{key}:</span> {String(value).substring(0, 40)}
                        {String(value).length > 40 && '...'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
