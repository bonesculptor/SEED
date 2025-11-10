import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SettingsPanelContent } from './SettingsPanelContent';
import { apiService } from '../services/apiService';
import NavigationMenu from './NavigationMenu';

interface ApiConfig {
  api_name: string;
  api_key: string;
  base_url?: string;
  enabled: boolean;
}

export function SettingsPanel() {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<Record<number, boolean>>({});
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string }>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setApiConfigs(data.map((d: any) => ({
          api_name: d.api_name,
          api_key: d.api_key,
          base_url: d.base_url,
          enabled: d.enabled
        })));
      } else {
        setApiConfigs([
          { api_name: 'OpenAI', api_key: '', base_url: 'https://api.openai.com/v1', enabled: true },
          { api_name: 'Anthropic', api_key: '', base_url: 'https://api.anthropic.com', enabled: false },
          { api_name: 'Custom API', api_key: '', base_url: '', enabled: false }
        ]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      await supabase.from('api_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      for (const config of apiConfigs) {
        if (config.api_name && config.api_key) {
          await supabase.from('api_settings').insert({
            api_name: config.api_name,
            api_key: config.api_key,
            base_url: config.base_url,
            enabled: config.enabled
          });
        }
      }

      alert('API settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (index: number, field: keyof ApiConfig, value: any) => {
    setApiConfigs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addNewConfig = () => {
    setApiConfigs(prev => [...prev, {
      api_name: '',
      api_key: '',
      base_url: '',
      enabled: false
    }]);
  };

  const removeConfig = (index: number) => {
    setApiConfigs(prev => prev.filter((_, i) => i !== index));
  };

  const toggleShowKey = (index: number) => {
    setShowKeys(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const testConnection = async (index: number) => {
    const config = apiConfigs[index];
    if (!config.api_key) {
      setTestResults(prev => ({
        ...prev,
        [index]: { success: false, message: 'API key is required' }
      }));
      return;
    }

    try {
      setTesting(prev => ({ ...prev, [index]: true }));
      const result = await apiService.testApiConnection(config.api_name, config.api_key, config.base_url);
      setTestResults(prev => ({ ...prev, [index]: result }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [index]: { success: false, message: (error as Error).message }
      }));
    } finally {
      setTesting(prev => ({ ...prev, [index]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-8 text-center transition-colors ml-16">
        <NavigationMenu currentPath="/settings" />
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-dark-border border-t-slate-900 dark:border-t-cyber-blue" />
        <p className="mt-4 text-slate-600 dark:text-dark-muted">Loading settings...</p>
      </div>
    );
  }

  return <SettingsPanelContent
    apiConfigs={apiConfigs}
    showKeys={showKeys}
    testing={testing}
    testResults={testResults}
    saving={saving}
    updateConfig={updateConfig}
    toggleShowKey={toggleShowKey}
    testConnection={testConnection}
    removeConfig={removeConfig}
    addNewConfig={addNewConfig}
    saveSettings={saveSettings}
  />;
}
