import React, { useState } from 'react';
import { Save, Eye, EyeOff, Key, Zap, Moon, Sun, Users, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AdminAccountManager } from './AdminAccountManager';
import { OnboardingFlow } from './OnboardingFlow';
import NavigationMenu from './NavigationMenu';

interface ApiConfig {
  api_name: string;
  api_key: string;
  base_url?: string;
  enabled: boolean;
}

interface Props {
  apiConfigs: ApiConfig[];
  showKeys: Record<number, boolean>;
  testing: Record<number, boolean>;
  testResults: Record<number, { success: boolean; message: string }>;
  saving: boolean;
  updateConfig: (index: number, field: keyof ApiConfig, value: any) => void;
  toggleShowKey: (index: number) => void;
  testConnection: (index: number) => void;
  removeConfig: (index: number) => void;
  addNewConfig: () => void;
  saveSettings: () => void;
}

export function SettingsPanelContent({
  apiConfigs,
  showKeys,
  testing,
  testResults,
  saving,
  updateConfig,
  toggleShowKey,
  testConnection,
  removeConfig,
  addNewConfig,
  saveSettings
}: Props) {
  const { theme, toggleTheme } = useTheme();
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (showAccountManager) {
    return <AdminAccountManager />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="space-y-6 ml-16">
      <NavigationMenu currentPath="/settings" />

      {/* Account Management Section */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Identity & Payments
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">
              Manage user accounts, identity verification, and payment subscriptions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-dark-text mb-1">
                Create New Account
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-muted">
                Upload identity document and set up payment method
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowAccountManager(true)}
            className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-dark-text mb-1">
                Manage Accounts (Admin)
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-muted">
                View and verify all user accounts and documents
              </p>
            </div>
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Appearance</h2>
            <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">Customize the visual theme</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-hover rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <div className="p-2 bg-cyber-blue/20 rounded-lg">
                <Moon className="w-5 h-5 text-cyber-blue" />
              </div>
            ) : (
              <div className="p-2 bg-slate-200 rounded-lg">
                <Sun className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div>
              <div className="font-medium text-slate-900 dark:text-dark-text">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div className="text-sm text-slate-600 dark:text-dark-muted">
                {theme === 'dark' ? 'Cyber-themed dark interface with blue accents' : 'Classic light interface'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:ring-offset-2 dark:focus:ring-offset-dark-surface bg-slate-300 dark:bg-cyber-blue/30"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white dark:bg-cyber-blue shadow-lg transition-transform ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">API Configuration</h2>
            <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">Configure external API connections for agent protocols</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-cyber-blue text-white rounded-lg hover:bg-slate-800 dark:hover:bg-cyber-blue-glow transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="space-y-6">
          {apiConfigs.map((config, index) => (
            <div key={index} className="border border-slate-200 dark:border-dark-border rounded-lg p-4 space-y-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig(index, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-cyber-blue dark:text-cyber-blue rounded focus:ring-cyber-blue dark:bg-dark-hover dark:border-dark-border"
                  />
                  <span className="text-sm text-slate-600 dark:text-dark-muted">Enabled</span>
                </div>
                <div className="flex-1" />
                {apiConfigs.length > 1 && (
                  <button
                    onClick={() => removeConfig(index)}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2">
                    API Name
                  </label>
                  <input
                    type="text"
                    value={config.api_name}
                    onChange={(e) => updateConfig(index, 'api_name', e.target.value)}
                    placeholder="e.g., OpenAI, Anthropic"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border dark:bg-dark-hover dark:text-dark-text rounded-lg focus:ring-2 focus:ring-cyber-blue focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2">
                    Base URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.base_url || ''}
                    onChange={(e) => updateConfig(index, 'base_url', e.target.value)}
                    placeholder="https://api.example.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-border dark:bg-dark-hover dark:text-dark-text rounded-lg focus:ring-2 focus:ring-cyber-blue focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key / Private Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys[index] ? 'text' : 'password'}
                    value={config.api_key}
                    onChange={(e) => updateConfig(index, 'api_key', e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-dark-border dark:bg-dark-hover dark:text-dark-text rounded-lg focus:ring-2 focus:ring-cyber-blue focus:border-transparent font-mono text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey(index)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-dark-muted hover:text-slate-700 dark:hover:text-dark-text"
                  >
                    {showKeys[index] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-dark-muted">
                  Your API key is stored securely and never shared. Only used for authenticated requests.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => testConnection(index)}
                  disabled={testing[index] || !config.api_key}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-cyber-blue text-white rounded-lg hover:bg-blue-700 dark:hover:bg-cyber-blue-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  {testing[index] ? 'Testing...' : 'Test Connection'}
                </button>

                {testResults[index] && (
                  <div className={`flex-1 p-2 rounded-lg text-sm ${
                    testResults[index].success
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {testResults[index].message}
                  </div>
                )}
              </div>

              {config.enabled && !config.api_key && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    This API is enabled but no key is configured. Some features may not work.
                  </p>
                </div>
              )}

              {config.enabled && config.api_key && !testResults[index] && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    ✓ API configured and ready to use
                  </p>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addNewConfig}
            className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-dark-border rounded-lg text-slate-600 dark:text-dark-muted hover:border-slate-400 dark:hover:border-cyber-blue hover:text-slate-700 dark:hover:text-cyber-blue transition-colors"
          >
            + Add Another API Configuration
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">Security Best Practices</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-dark-muted">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-cyber-blue rounded-full mt-2" />
            <p>Never share your API keys or commit them to version control</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-cyber-blue rounded-full mt-2" />
            <p>Rotate your API keys regularly and immediately if compromised</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-cyber-blue rounded-full mt-2" />
            <p>Use environment-specific keys for development, staging, and production</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-cyber-blue rounded-full mt-2" />
            <p>Monitor API usage to detect unauthorized access</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-cyber-blue rounded-full mt-2" />
            <p>Set appropriate rate limits and access controls on your API accounts</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-dark-hover rounded-xl border border-slate-200 dark:border-dark-border p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">Supported APIs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border transition-colors">
            <h4 className="font-medium text-slate-900 dark:text-dark-text mb-2">OpenAI</h4>
            <p className="text-sm text-slate-600 dark:text-dark-muted mb-2">GPT models for text generation and analysis</p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-cyber-blue hover:text-blue-700 dark:hover:text-cyber-cyan"
            >
              Get API Key →
            </a>
          </div>

          <div className="p-4 bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border transition-colors">
            <h4 className="font-medium text-slate-900 dark:text-dark-text mb-2">Anthropic</h4>
            <p className="text-sm text-slate-600 dark:text-dark-muted mb-2">Claude models for advanced reasoning</p>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-cyber-blue hover:text-blue-700 dark:hover:text-cyber-cyan"
            >
              Get API Key →
            </a>
          </div>

          <div className="p-4 bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border transition-colors">
            <h4 className="font-medium text-slate-900 dark:text-dark-text mb-2">Custom API</h4>
            <p className="text-sm text-slate-600 dark:text-dark-muted mb-2">Connect your own API endpoints</p>
            <span className="text-sm text-slate-500 dark:text-dark-muted">Configure above</span>
          </div>

          <div className="p-4 bg-white dark:bg-dark-surface rounded-lg border border-slate-200 dark:border-dark-border transition-colors">
            <h4 className="font-medium text-slate-900 dark:text-dark-text mb-2">Coming Soon</h4>
            <p className="text-sm text-slate-600 dark:text-dark-muted">More integrations in development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
