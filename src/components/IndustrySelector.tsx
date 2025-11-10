import React, { useState, useEffect } from 'react';
import { Search, Building2, CheckCircle } from 'lucide-react';
import { gicsService, GICSClassification } from '../services/gicsService';
import { ecosystemService } from '../services/ecosystemService';

interface IndustrySelectorProps {
  workspaceId: string;
  onSelected?: (classification: GICSClassification) => void;
}

export function IndustrySelector({ workspaceId, onSelected }: IndustrySelectorProps) {
  const [classifications, setClassifications] = useState<GICSClassification[]>([]);
  const [filteredClassifications, setFilteredClassifications] = useState<GICSClassification[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedClassification, setSelectedClassification] = useState<GICSClassification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGICSData();
  }, []);

  useEffect(() => {
    filterClassifications();
  }, [selectedSector, searchQuery, classifications]);

  const loadGICSData = async () => {
    setLoading(true);
    try {
      const data = await gicsService.loadGICSData();
      setClassifications(data);
      setFilteredClassifications(data);
      const sectorList = gicsService.getSectors();
      setSectors(sectorList);
    } catch (error) {
      console.error('Error loading GICS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClassifications = () => {
    let filtered = classifications;

    if (selectedSector) {
      filtered = filtered.filter(c => c.sector === selectedSector);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.sector.toLowerCase().includes(query) ||
        c.industry_group.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query) ||
        c.sub_industry.toLowerCase().includes(query) ||
        c.gics_code.includes(query)
      );
    }

    setFilteredClassifications(filtered);
  };

  const handleSelectClassification = async (classification: GICSClassification) => {
    setSelectedClassification(classification);

    // Create ecosystem configuration with GICS data
    try {
      const ecosystemConfig = {
        workspace_id: workspaceId,
        configuration_name: `${classification.sector} - ${classification.industry}`,
        description: `GICS Classification: ${classification.sub_industry}`,
        erp_system: 'odoo' as const,
        industry: classification.sub_industry,
        company_size: 'medium' as const,
        business_model: 'b2b' as const,
      };

      await ecosystemService.createEcosystemConfig(ecosystemConfig);

      if (onSelected) {
        onSelected(classification);
      }
    } catch (error) {
      console.error('Error creating ecosystem config:', error);
    }
  };

  const getSectorColor = (sector: string): string => {
    const colors: Record<string, string> = {
      'Energy': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
      'Materials': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400',
      'Industrials': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
      'Information Technology': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
      'Health Care': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
    };
    return colors[sector] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Building2 className="w-8 h-8 text-blue-600 dark:text-cyber-blue" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text">
            Industry Classification (GICS 2024)
          </h2>
          <p className="text-sm text-slate-600 dark:text-dark-muted">
            Select your industry to define ecosystem and human context
          </p>
        </div>
      </div>

      {selectedClassification && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                Industry Selected
              </h3>
              <div className="text-sm text-green-800 dark:text-green-400 space-y-1">
                <p><strong>GICS Code:</strong> {selectedClassification.gics_code}</p>
                <p><strong>Sector:</strong> {selectedClassification.sector}</p>
                <p><strong>Industry Group:</strong> {selectedClassification.industry_group}</p>
                <p><strong>Industry:</strong> {selectedClassification.industry}</p>
                <p><strong>Sub-Industry:</strong> {selectedClassification.sub_industry}</p>
              </div>
              <p className="text-xs text-green-700 dark:text-green-500 mt-3">
                Ecosystem configuration created. This will define human context roles and business processes for your industry.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
            Filter by Sector
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by industry, code..."
              className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-dark-muted">Loading GICS classifications...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border">
          <div className="p-4 border-b border-slate-200 dark:border-dark-border">
            <p className="text-sm text-slate-600 dark:text-dark-muted">
              Showing {filteredClassifications.length} of {classifications.length} classifications
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredClassifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-dark-muted">
                No classifications found matching your criteria
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-dark-border">
                {filteredClassifications.map((classification) => (
                  <button
                    key={classification.gics_code}
                    onClick={() => handleSelectClassification(classification)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors ${
                      selectedClassification?.gics_code === classification.gics_code
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-dark-text text-xs font-mono rounded">
                            {classification.gics_code}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded ${getSectorColor(classification.sector)}`}>
                            {classification.sector}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-1">
                          {classification.sub_industry}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-dark-muted">
                          {classification.industry_group} → {classification.industry}
                        </p>
                      </div>
                      {selectedClassification?.gics_code === classification.gics_code && (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-cyber-blue flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How Industry Classification Defines Context
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li><strong>Ecosystem Context (ECP):</strong> Industry sector defines environmental and sustainability priorities</li>
          <li><strong>Human Context (HCP):</strong> Industry determines typical roles (CEO, CFO, Operations Manager, etc.)</li>
          <li><strong>Business Context (BCP):</strong> Maps to relevant business processes from your CSV (Strategy, Operations, Finance)</li>
          <li><strong>Governance Context (GCP):</strong> Industry-specific compliance requirements (Healthcare → HIPAA, Finance → SOX)</li>
          <li><strong>Agent Patterns:</strong> Recommends appropriate patterns based on common industry workflows</li>
        </ul>
      </div>
    </div>
  );
}
