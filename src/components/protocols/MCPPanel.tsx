import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { protocolService } from '../../services/protocolService';
import { mcpValidator } from '../../validators/mcpValidator';
import { MachineContext } from '../../lib/supabase';
import { ProtocolCard } from './ProtocolCard';

export function MCPPanel({ onUpdate }: { onUpdate: () => void }) {
  const [contexts, setContexts] = useState<MachineContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      setLoading(true);
      const data = await protocolService.getMachineContexts();
      setContexts(data || []);
    } catch (error) {
      console.error('Error loading MCPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSample = async () => {
    try {
      const sample = {
        mcp_id: `urn:mcp:example:${Date.now()}`,
        title: 'Infection Risk Prediction Pipeline',
        version: '1.0.0',
        owner_name: 'ML Team',
        owner_uri: 'urn:team:ml',
        pipeline: {
          name: 'infection-risk-pipeline',
          stages: ['data_ingestion', 'preprocessing', 'training', 'evaluation', 'deployment']
        },
        tasks: [
          { name: 'Predict infection risk', type: 'classification', target: 'infection_risk' }
        ],
        models: [
          { name: 'RandomForest-v1', type: 'ensemble', framework: 'scikit-learn', version: '1.0' }
        ],
        deployment: {
          environment: 'production',
          endpoint: 'https://api.example.com/predict',
          replicas: 3
        },
        monitoring: {
          metrics: ['accuracy', 'precision', 'recall', 'f1_score'],
          alerting: { threshold_accuracy: 0.85 }
        }
      };

      const validation = mcpValidator.validate(sample);
      const created = await protocolService.createMachineContext(sample);
      await protocolService.validateProtocol('mcp', created.id, validation);

      await loadContexts();
      onUpdate();
    } catch (error) {
      console.error('Error creating MCP:', error);
      alert('Error creating MCP: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Machine Context Protocol (MCP)</h2>
            <p className="text-sm text-slate-600 mt-1">ML pipelines and model configurations</p>
          </div>
          <button
            onClick={createSample}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Sample MCP
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading contexts...</div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">No Machine Context Protocols created yet</p>
            <button onClick={createSample} className="text-purple-600 hover:text-purple-700 font-medium">
              Create your first MCP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contexts.map((context) => (
              <ProtocolCard
                key={context.id}
                title={context.title}
                subtitle={`${context.owner_name} • v${context.version}`}
                data={context}
                validator={mcpValidator}
                sections={['pipeline', 'tasks', 'models', 'deployment']}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
