import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { protocolService } from '../../services/protocolService';
import { bcpValidator } from '../../validators/bcpValidator';
import { BusinessContext } from '../../lib/supabase';
import { ProtocolCard } from './ProtocolCard';

export function BCPPanel({ onUpdate }: { onUpdate: () => void }) {
  const [contexts, setContexts] = useState<BusinessContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    try {
      setLoading(true);
      const data = await protocolService.getBusinessContexts();
      setContexts(data || []);
    } catch (error) {
      console.error('Error loading BCPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSample = async () => {
    try {
      const sample = {
        bcp_id: `urn:bcp:example:${Date.now()}`,
        title: 'Ortho Clinic Business Model',
        version: '1.0.0',
        owner_name: 'Simon Grange',
        owner_uri: 'did:example:simon',
        validity_from: '2025-01-01T00:00:00Z',
        validity_to: '2025-12-31T23:59:59Z',
        customer_segments: [
          { name: 'Patients in Abu Dhabi', description: 'Ortho patients requiring consultation' }
        ],
        value_propositions: [
          { name: 'Fast ortho assessments', description: 'Quick diagnosis with infection risk scoring' }
        ],
        channels: [
          { name: 'Clinic site', type: 'physical' },
          { name: 'WhatsApp assistant', type: 'digital' }
        ],
        customer_relationships: [
          { segment: 'Patients', type: 'personal assistance' }
        ],
        revenue_streams: [
          { name: 'Consultation fees', type: 'transaction' }
        ],
        key_resources: [
          { name: 'Medical staff', type: 'human' },
          { name: 'EHR system', type: 'digital' }
        ],
        key_activities: [
          { name: 'Patient consultations', category: 'service delivery' }
        ],
        key_partners: [
          { name: 'Hospital Imaging Dept', relationship: 'supplier' }
        ],
        cost_structure: [
          { name: 'Staff salaries', type: 'fixed' },
          { name: 'Equipment', type: 'variable' }
        ],
        metrics: {
          patient_satisfaction: { target: 4.5, unit: 'stars' },
          monthly_revenue: { target: 50000, unit: 'AED' }
        }
      };

      const validation = bcpValidator.validate(sample);
      const created = await protocolService.createBusinessContext(sample);
      await protocolService.validateProtocol('bcp', created.id, validation);

      await loadContexts();
      onUpdate();
    } catch (error) {
      console.error('Error creating BCP:', error);
      alert('Error creating BCP: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Business Context Protocol (BCP)</h2>
            <p className="text-sm text-slate-600 mt-1">Outline Business Canvas mapping</p>
          </div>
          <button
            onClick={createSample}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Sample BCP
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading contexts...</div>
        ) : contexts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">No Business Context Protocols created yet</p>
            <button onClick={createSample} className="text-green-600 hover:text-green-700 font-medium">
              Create your first BCP
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
                validator={bcpValidator}
                sections={['customer_segments', 'value_propositions', 'channels', 'revenue_streams']}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
