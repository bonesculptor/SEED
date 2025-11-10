import React, { useState, useEffect } from 'react';
import { Plus, Activity } from 'lucide-react';
import { protocolService } from '../../services/protocolService';
import { tcpValidator } from '../../validators/tcpValidator';
import { driftDetector } from '../../services/driftDetector';
import { TestContext, DriftReport } from '../../lib/supabase';
import { ProtocolCard } from './ProtocolCard';

export function TCPPanel({ onUpdate }: { onUpdate: () => void }) {
  const [contexts, setContexts] = useState<TestContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningDrift, setRunningDrift] = useState<string | null>(null);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      setLoading(true);
      const data = await protocolService.getTestContexts();
      setContexts(data || []);
    } catch (error) {
      console.error('Error loading TCPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSample = async () => {
    try {
      const sample = {
        tcp_id: `urn:tcp:example:${Date.now()}`,
        title: 'Infection Risk Model Drift Monitor',
        version: '1.0.0',
        owner_name: 'QA Team',
        owner_uri: 'urn:team:qa',
        baseline: {
          snapshot_date: '2025-01-01T00:00:00Z',
          metrics: {
            feature_accuracy: 0.92,
            prediction_confidence: 0.88
          },
          data_snapshot: {
            age: Array.from({ length: 100 }, () => Math.random() * 60 + 20),
            temperature: Array.from({ length: 100 }, () => Math.random() * 3 + 36)
          }
        },
        monitoring: {
          frequency: 'daily',
          schedule: '00:00 UTC'
        },
        drift_config: {
          methods: ['PSI', 'KS', 'KL_divergence'],
          thresholds: {
            psi: 0.1,
            ks: 0.2,
            kl: 0.15
          },
          bins: 10
        },
        alerting: {
          channels: ['email', 'slack'],
          recipients: ['qa@example.com'],
          severity_levels: ['warning', 'critical']
        }
      };

      const validation = tcpValidator.validate(sample);
      const created = await protocolService.createTestContext(sample);
      await protocolService.validateProtocol('tcp', created.id, validation);

      await loadContexts();
      onUpdate();
    } catch (error) {
      console.error('Error creating TCP:', error);
      alert('Error creating TCP: ' + (error as Error).message);
    }
  };

  const runDriftDetection = async (context: TestContext) => {
    try {
      setRunningDrift(context.id);

      const currentData = {
        age: Array.from({ length: 100 }, () => Math.random() * 65 + 18),
        temperature: Array.from({ length: 100 }, () => Math.random() * 3.5 + 35.5)
      };

      const { metrics, alerts } = driftDetector.detectDrift(
        context.baseline.data_snapshot,
        currentData,
        context.drift_config.thresholds
      );

      const avgPsi = Object.values(metrics).reduce((sum, m) => sum + m.psi, 0) / Object.values(metrics).length;
      const velocity = avgPsi * 100;

      await protocolService.createDriftReport(context.id, metrics, velocity, alerts);

      alert(`Drift detection complete!\n\nAverage PSI: ${avgPsi.toFixed(4)}\nVelocity Score: ${velocity.toFixed(2)}\nAlerts: ${alerts.length}`);

      await loadContexts();
      onUpdate();
    } catch (error) {
      console.error('Error running drift detection:', error);
      alert('Error running drift detection: ' + (error as Error).message);
    } finally {
      setRunningDrift(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Test Context Protocol (TCP)</h2>
            <p className="text-sm text-slate-600 mt-1">Drift detection and monitoring</p>
          </div>
          <button
            onClick={createSample}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Sample TCP
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading contexts...</div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">No Test Context Protocols created yet</p>
            <button onClick={createSample} className="text-red-600 hover:text-red-700 font-medium">
              Create your first TCP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contexts.map((context) => (
              <div key={context.id}>
                <ProtocolCard
                  title={context.title}
                  subtitle={`${context.owner_name} • v${context.version}`}
                  data={context}
                  validator={tcpValidator}
                  sections={['baseline', 'drift_config', 'monitoring', 'alerting']}
                />
                <div className="mt-2">
                  <button
                    onClick={() => runDriftDetection(context)}
                    disabled={runningDrift === context.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Activity className="w-4 h-4" />
                    {runningDrift === context.id ? 'Running...' : 'Run Drift Detection'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
