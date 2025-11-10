import { supabase, ApiSettings } from '../lib/supabase';

export class ApiService {
  async getEnabledApis(): Promise<ApiSettings[]> {
    const { data, error } = await supabase
      .from('api_settings')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getApiByName(name: string): Promise<ApiSettings | null> {
    const { data, error } = await supabase
      .from('api_settings')
      .select('*')
      .eq('api_name', name)
      .eq('enabled', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllApis(): Promise<ApiSettings[]> {
    const { data, error } = await supabase
      .from('api_settings')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createApi(api: Omit<ApiSettings, 'id' | 'created_at' | 'updated_at'>): Promise<ApiSettings> {
    const { data, error } = await supabase
      .from('api_settings')
      .insert(api)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateApi(id: string, updates: Partial<ApiSettings>): Promise<ApiSettings> {
    const { data, error } = await supabase
      .from('api_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteApi(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async testApiConnection(apiName: string, apiKey: string, baseUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!apiKey) {
        return { success: false, message: 'API key is required' };
      }

      if (apiName.toLowerCase().includes('openai')) {
        const response = await fetch(`${baseUrl || 'https://api.openai.com/v1'}/models`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          return { success: true, message: 'OpenAI connection successful' };
        } else {
          return { success: false, message: `OpenAI connection failed: ${response.statusText}` };
        }
      }

      if (apiName.toLowerCase().includes('anthropic')) {
        const response = await fetch(`${baseUrl || 'https://api.anthropic.com'}/v1/messages`, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        });

        if (response.ok) {
          return { success: true, message: 'Anthropic connection successful' };
        } else {
          return { success: false, message: `Anthropic connection failed: ${response.statusText}` };
        }
      }

      return { success: false, message: 'API testing not implemented for this provider' };
    } catch (error) {
      return { success: false, message: `Connection error: ${(error as Error).message}` };
    }
  }

  maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '••••••••';
    }
    const visibleStart = apiKey.substring(0, 4);
    const visibleEnd = apiKey.substring(apiKey.length - 4);
    return `${visibleStart}${'•'.repeat(Math.max(8, apiKey.length - 8))}${visibleEnd}`;
  }
}

export const apiService = new ApiService();
