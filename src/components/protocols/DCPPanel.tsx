import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { protocolService } from '../../services/protocolService';
import { dcpValidator } from '../../validators/dcpValidator';
import { DataContext } from '../../lib/supabase';
import { ProtocolCard } from './ProtocolCard';

export function DCPPanel({ onUpdate }: { onUpdate: () => void }) {
  const [contexts, setContexts] = useState<DataContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      setLoading(true);
      const data = await protocolService.getDataContexts();
      setContexts(data || []);
    } catch (error) {
      console.error('Error loading DCPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSample = async () => {
    try {
      const sample = {
        dcp_id: `urn:dcp:example:${Date.now()}`,
        title: 'Clinic Data Mesh',
        version: '1.0.0',
        owner_name: 'Data Team',
        owner_uri: 'urn:team:data',
        domain: 'CareDelivery',
        data_products: [
          {
            name: 'Appointments Data Product',
            owner: 'Operations',
            contract: 'https://example.com/contracts/appointments.json',
            schema: { type: 'object', properties: {} },
            quality_metrics: { completeness: 0.98, accuracy: 0.95 }
          }
        ],
        contracts: {
          appointments: { format: 'json-schema', version: '1.0' }
        },
        ports: [
          { name: 'appointments-api', type: 'output', protocol: 'REST' }
        ],
        storage: {
          type: 'postgresql',
          location: 'supabase'
        },
        slas: {
          freshness: '<=5m',
          completeness: '>=95%',
          accuracy: '>=90%'
        },
        policies: [
          {
            type: 'odrl:Policy',
            permission: { action: 'read', assignee: 'authenticated_users' }
          }
        ]
      };

      const validation = dcpValidator.validate(sample);
      const created = await protocolService.createDataContext(sample);
      await protocolService.validateProtocol('dcp', created.id, validation);

      await loadContexts();
      onUpdate();
    } catch (error) {
      console.error('Error creating DCP:', error);
      alert('Error creating DCP: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Data Context Protocol (DCP)</h2>
            <p className="text-sm text-slate-600 mt-1">Data Mesh domains and products</p>
          </div>
          <button
            onClick={createSample}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Sample DCP
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading contexts...</div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">No Data Context Protocols created yet</p>
            <button onClick={createSample} className="text-orange-600 hover:text-orange-700 font-medium">
              Create your first DCP
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contexts.map((context) => (
              <ProtocolCard
                key={context.id}
                title={context.title}
                subtitle={`${context.domain} • ${context.owner_name} • v${context.version}`}
                data={context}
                validator={dcpValidator}
                sections={['data_products', 'contracts', 'slas', 'policies']}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
