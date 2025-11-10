import React, { useState, useEffect } from 'react';
import { Globe, Database, Settings, CheckCircle, AlertCircle, Zap, GitBranch } from 'lucide-react';
import { ecosystemService, AgentPattern, EcosystemConfiguration, OdooIntegration } from '../services/ecosystemService';

interface EcosystemSetupProps {
  workspaceId: string;
}

export function EcosystemSetup({ workspaceId }: EcosystemSetupProps) {
  const [activeTab, setActiveTab] = useState<'context' | 'odoo' | 'patterns'>('context');
  const [ecosystemConfigs, setEcosystemConfigs] = useState<EcosystemConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<EcosystemConfiguration | null>(null);
  const [odooIntegrations, setOdooIntegrations] = useState<OdooIntegration[]>([]);
  const [agentPatterns, setAgentPatterns] = useState<AgentPattern[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [ecosystemForm, setEcosystemForm] = useState({
    configuration_name: '',
    description: '',
    erp_system: 'odoo' as const,
    erp_version: '',
    industry: '',
    company_size: 'medium' as const,
    business_model: 'b2b' as const,
  });

  const [odooForm, setOdooForm] = useState({
    integration_name: '',
    description: '',
    odoo_url: '',
    odoo_database: '',
    odoo_username: '',
    odoo_api_key: '',
    postgres_host: '',
    postgres_port: 5432,
    postgres_database: '',
    postgres_username: '',
    postgres_password: '',
    postgres_ssl_enabled: true,
  });

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configs, patterns, integrations] = await Promise.all([
        ecosystemService.getEcosystemConfigs(workspaceId),
        ecosystemService.getAgentPatterns(),
        ecosystemService.getOdooIntegrations(workspaceId),
      ]);

      setEcosystemConfigs(configs);
      setAgentPatterns(patterns);
      setOdooIntegrations(integrations);

      if (configs.length > 0) {
        setSelectedConfig(configs[0]);
      }
    } catch (error) {
      console.error('Error loading ecosystem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEcosystemConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = await ecosystemService.createEcosystemConfig({
        workspace_id: workspaceId,
        ...ecosystemForm,
      });

      setEcosystemConfigs([config, ...ecosystemConfigs]);
      setSelectedConfig(config);
      setEcosystemForm({
        configuration_name: '',
        description: '',
        erp_system: 'odoo',
        erp_version: '',
        industry: '',
        company_size: 'medium',
        business_model: 'b2b',
      });
    } catch (error) {
      console.error('Error creating ecosystem config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOdooIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConfig) return;

    setLoading(true);
    try {
      const integration = await ecosystemService.createOdooIntegration({
        ecosystem_config_id: selectedConfig.id!,
        workspace_id: workspaceId,
        ...odooForm,
      });

      setOdooIntegrations([integration, ...odooIntegrations]);
      setOdooForm({
        integration_name: '',
        description: '',
        odoo_url: '',
        odoo_database: '',
        odoo_username: '',
        odoo_api_key: '',
        postgres_host: '',
        postgres_port: 5432,
        postgres_database: '',
        postgres_username: '',
        postgres_password: '',
        postgres_ssl_enabled: true,
      });
      setActiveTab('patterns');
    } catch (error) {
      console.error('Error creating ODOO integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setLoading(true);
    try {
      const result = await ecosystemService.testOdooConnection(integrationId);
      alert(result.message);
      loadData();
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'expert': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Globe className="w-8 h-8 text-blue-600 dark:text-cyber-blue" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">
            Ecosystem Configuration
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-muted">
            Set up your business context, ODOO ERP integration, and select agent patterns
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-dark-border">
        <button
          onClick={() => setActiveTab('context')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'context'
              ? 'text-blue-600 dark:text-cyber-blue border-b-2 border-blue-600 dark:border-cyber-blue'
              : 'text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Ecosystem Context
          </div>
        </button>
        <button
          onClick={() => setActiveTab('odoo')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'odoo'
              ? 'text-blue-600 dark:text-cyber-blue border-b-2 border-blue-600 dark:border-cyber-blue'
              : 'text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text'
          }`}
          disabled={!selectedConfig}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            ODOO Integration
          </div>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'patterns'
              ? 'text-blue-600 dark:text-cyber-blue border-b-2 border-blue-600 dark:border-cyber-blue'
              : 'text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Agent Patterns ({agentPatterns.length})
          </div>
        </button>
      </div>

      {/* Ecosystem Context Tab */}
      {activeTab === 'context' && (
        <div className="space-y-6">
          {ecosystemConfigs.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
                Create Ecosystem Configuration
              </h3>
              <form onSubmit={handleCreateEcosystemConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Configuration Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ecosystemForm.configuration_name}
                      onChange={(e) => setEcosystemForm({ ...ecosystemForm, configuration_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="Production Environment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      ERP System
                    </label>
                    <select
                      value={ecosystemForm.erp_system}
                      onChange={(e) => setEcosystemForm({ ...ecosystemForm, erp_system: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                    >
                      <option value="odoo">ODOO</option>
                      <option value="sap">SAP</option>
                      <option value="netsuite">NetSuite</option>
                      <option value="dynamics">Dynamics</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={ecosystemForm.industry}
                      onChange={(e) => setEcosystemForm({ ...ecosystemForm, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="Manufacturing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Company Size
                    </label>
                    <select
                      value={ecosystemForm.company_size}
                      onChange={(e) => setEcosystemForm({ ...ecosystemForm, company_size: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                    >
                      <option value="startup">Startup</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Business Model
                    </label>
                    <select
                      value={ecosystemForm.business_model}
                      onChange={(e) => setEcosystemForm({ ...ecosystemForm, business_model: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                    >
                      <option value="b2b">B2B</option>
                      <option value="b2c">B2C</option>
                      <option value="b2b2c">B2B2C</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="saas">SaaS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                    Description
                  </label>
                  <textarea
                    value={ecosystemForm.description}
                    onChange={(e) => setEcosystemForm({ ...ecosystemForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                    placeholder="Describe your business ecosystem..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 dark:bg-cyber-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-cyber-blue/80 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Configuration'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                  Current Configuration
                </h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm">
                  Active
                </span>
              </div>

              {selectedConfig && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-dark-muted">Name:</span>
                    <span className="ml-2 text-slate-900 dark:text-dark-text font-medium">
                      {selectedConfig.configuration_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-dark-muted">ERP System:</span>
                    <span className="ml-2 text-slate-900 dark:text-dark-text font-medium uppercase">
                      {selectedConfig.erp_system}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-dark-muted">Industry:</span>
                    <span className="ml-2 text-slate-900 dark:text-dark-text">
                      {selectedConfig.industry || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-dark-muted">Company Size:</span>
                    <span className="ml-2 text-slate-900 dark:text-dark-text capitalize">
                      {selectedConfig.company_size}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-dark-muted">Business Model:</span>
                    <span className="ml-2 text-slate-900 dark:text-dark-text uppercase">
                      {selectedConfig.business_model}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Next Step:</strong> Configure your ODOO ERP integration to connect your PostgreSQL database and enable agent workflows.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ODOO Integration Tab */}
      {activeTab === 'odoo' && selectedConfig && (
        <div className="space-y-6">
          {odooIntegrations.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
                Connect ODOO ERP
              </h3>
              <form onSubmit={handleCreateOdooIntegration} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Integration Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={odooForm.integration_name}
                      onChange={(e) => setOdooForm({ ...odooForm, integration_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="Production ODOO"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      ODOO URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={odooForm.odoo_url}
                      onChange={(e) => setOdooForm({ ...odooForm, odoo_url: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="https://your-odoo-instance.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Database Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={odooForm.odoo_database}
                      onChange={(e) => setOdooForm({ ...odooForm, odoo_database: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="odoo_db"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={odooForm.odoo_username}
                      onChange={(e) => setOdooForm({ ...odooForm, odoo_username: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={odooForm.odoo_api_key}
                      onChange={(e) => setOdooForm({ ...odooForm, odoo_api_key: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-dark-border pt-4 mt-4">
                  <h4 className="text-md font-semibold text-slate-900 dark:text-dark-text mb-3">
                    PostgreSQL Direct Connection (Optional)
                  </h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                        Host
                      </label>
                      <input
                        type="text"
                        value={odooForm.postgres_host}
                        onChange={(e) => setOdooForm({ ...odooForm, postgres_host: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        value={odooForm.postgres_port}
                        onChange={(e) => setOdooForm({ ...odooForm, postgres_port: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                        Database
                      </label>
                      <input
                        type="text"
                        value={odooForm.postgres_database}
                        onChange={(e) => setOdooForm({ ...odooForm, postgres_database: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                        placeholder="postgres"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                        PostgreSQL Username
                      </label>
                      <input
                        type="text"
                        value={odooForm.postgres_username}
                        onChange={(e) => setOdooForm({ ...odooForm, postgres_username: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                        placeholder="postgres"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                        PostgreSQL Password
                      </label>
                      <input
                        type="password"
                        value={odooForm.postgres_password}
                        onChange={(e) => setOdooForm({ ...odooForm, postgres_password: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-dark-text"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 dark:bg-cyber-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-cyber-blue/80 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Connecting...' : 'Connect ODOO'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {odooIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-blue-600 dark:text-cyber-blue" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                          {integration.integration_name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-dark-muted">
                          {integration.odoo_url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connection_status === 'connected' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <button
                        onClick={() => handleTestConnection(integration.id!)}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-dark-muted">Database:</span>
                      <span className="ml-2 text-slate-900 dark:text-dark-text">
                        {integration.odoo_database}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-dark-muted">Username:</span>
                      <span className="ml-2 text-slate-900 dark:text-dark-text">
                        {integration.odoo_username}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-dark-muted">Status:</span>
                      <span className="ml-2 text-slate-900 dark:text-dark-text capitalize">
                        {integration.connection_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agent Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>21 Agent Patterns Available:</strong> Select patterns based on your workflow needs. The system can recommend patterns based on your business processes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border p-4 hover:border-blue-500 dark:hover:border-cyber-blue transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-dark-hover text-slate-700 dark:text-dark-text text-xs font-mono rounded">
                      #{pattern.pattern_number}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(pattern.complexity_level)}`}>
                      {pattern.complexity_level}
                    </span>
                  </div>
                </div>

                <h3 className="text-md font-semibold text-slate-900 dark:text-dark-text mb-2">
                  {pattern.pattern_name}
                </h3>

                <p className="text-sm text-slate-600 dark:text-dark-muted mb-3 line-clamp-2">
                  {pattern.description}
                </p>

                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-dark-muted">Input:</span>
                    <p className="text-slate-700 dark:text-dark-text mt-1 line-clamp-2">
                      {pattern.inputs_description}
                    </p>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-dark-muted">Output:</span>
                    <p className="text-slate-700 dark:text-dark-text mt-1 line-clamp-2">
                      {pattern.outputs_description}
                    </p>
                  </div>
                </div>

                {pattern.compatible_protocols && pattern.compatible_protocols.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {pattern.compatible_protocols.map((protocol) => (
                      <span
                        key={protocol}
                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded"
                      >
                        {protocol}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
