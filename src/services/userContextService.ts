import { supabase } from '../lib/supabase';

export interface UserContext {
  id?: string;
  userId?: string;
  sessionId?: string;
  gicsSector?: string;
  gicsIndustryGroup?: string;
  gicsIndustry?: string;
  gicsSubIndustry?: string;
  sectorName?: string;
  industryGroupName?: string;
  industryName?: string;
  subIndustryName?: string;
  domainContext?: Record<string, any>;
  active?: boolean;
  isFavorite?: boolean;
  usageCount?: number;
  lastUsedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GICSHierarchyLevel {
  code: string;
  name: string;
}

class UserContextService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
  }

  async saveContext(context: UserContext): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const contextData = {
      user_id: user?.id || null,
      session_id: user ? null : this.sessionId,
      gics_sector: context.gicsSector,
      gics_industry_group: context.gicsIndustryGroup,
      gics_industry: context.gicsIndustry,
      gics_sub_industry: context.gicsSubIndustry,
      sector_name: context.sectorName,
      industry_group_name: context.industryGroupName,
      industry_name: context.industryName,
      sub_industry_name: context.subIndustryName,
      domain_context: context.domainContext || {},
      active: true,
    };

    await supabase
      .from('user_context_preferences')
      .update({ active: false })
      .or(`user_id.eq.${user?.id || 'null'},session_id.eq.${this.sessionId}`);

    const { error } = await supabase
      .from('user_context_preferences')
      .insert(contextData);

    if (error) {
      console.error('Error saving user context:', error);
      throw error;
    }
  }

  async getActiveContext(): Promise<UserContext | null> {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('user_context_preferences')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', this.sessionId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching user context:', error);
      return null;
    }

    if (!data) return null;

    return this.mapToUserContext(data);
  }

  async getAllContexts(): Promise<UserContext[]> {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('user_context_preferences')
      .select('*')
      .order('created_at', { ascending: false });

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', this.sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contexts:', error);
      return [];
    }

    return (data || []).map(this.mapToUserContext);
  }

  async clearContext(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('user_context_preferences')
      .update({ active: false });

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', this.sessionId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing context:', error);
      throw error;
    }
  }

  async loadGICSHierarchyFromCSV(): Promise<void> {
    try {
      const { count } = await supabase
        .from('gics_hierarchy')
        .select('*', { count: 'exact', head: true });

      if (count && count > 0) {
        console.log(`GICS data already loaded (${count} entries)`);
        return;
      }

      console.log('Loading GICS data from CSV...');
      const response = await fetch('/data/GICS_2024_full_structure.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      console.log('CSV loaded, length:', csvText.length);

      const lines = csvText.split('\n').slice(1);
      console.log('Processing', lines.length, 'lines');

      const gicsData = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',');
          const gicsCode = parts[0]?.trim();
          const sector = parts[1]?.trim();
          const industryGroup = parts[2]?.replace(/^"|"$/g, '').trim();
          const industry = parts[3]?.replace(/^"|"$/g, '').trim();
          const subIndustry = parts[4]?.replace(/^"|"$/g, '').trim();

          return {
            gics_code: gicsCode,
            sector: gicsCode.substring(0, 2),
            sector_name: sector,
            industry_group: gicsCode.substring(0, 4),
            industry_group_name: industryGroup,
            industry: gicsCode.substring(0, 6),
            industry_name: industry,
            sub_industry: gicsCode,
            sub_industry_name: subIndustry,
          };
        })
        .filter(item => item.gics_code && item.sector_name);

      console.log('Parsed', gicsData.length, 'GICS entries');

      if (gicsData.length > 0) {
        const { error } = await supabase
          .from('gics_hierarchy')
          .insert(gicsData);

        if (error) {
          console.error('Error inserting GICS data:', error);
          throw error;
        } else {
          console.log(`Successfully loaded ${gicsData.length} GICS entries to database`);
        }
      }
    } catch (error) {
      console.error('Error loading GICS hierarchy:', error);
      throw error;
    }
  }

  async getSectors(): Promise<GICSHierarchyLevel[]> {
    const { data, error } = await supabase
      .from('gics_hierarchy')
      .select('sector, sector_name')
      .order('sector');

    if (error) {
      console.error('Error fetching sectors:', error);
      return [];
    }

    const uniqueSectors = new Map<string, string>();
    data.forEach(item => {
      uniqueSectors.set(item.sector, item.sector_name);
    });

    return Array.from(uniqueSectors.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  }

  async getIndustryGroups(sectorCode: string): Promise<GICSHierarchyLevel[]> {
    const { data, error } = await supabase
      .from('gics_hierarchy')
      .select('industry_group, industry_group_name')
      .eq('sector', sectorCode)
      .order('industry_group');

    if (error) {
      console.error('Error fetching industry groups:', error);
      return [];
    }

    const uniqueGroups = new Map<string, string>();
    data.forEach(item => {
      uniqueGroups.set(item.industry_group, item.industry_group_name);
    });

    return Array.from(uniqueGroups.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  }

  async getIndustries(industryGroupCode: string): Promise<GICSHierarchyLevel[]> {
    const { data, error } = await supabase
      .from('gics_hierarchy')
      .select('industry, industry_name')
      .eq('industry_group', industryGroupCode)
      .order('industry');

    if (error) {
      console.error('Error fetching industries:', error);
      return [];
    }

    const uniqueIndustries = new Map<string, string>();
    data.forEach(item => {
      uniqueIndustries.set(item.industry, item.industry_name);
    });

    return Array.from(uniqueIndustries.entries()).map(([code, name]) => ({
      code,
      name,
    }));
  }

  async getSubIndustries(industryCode: string): Promise<GICSHierarchyLevel[]> {
    const { data, error } = await supabase
      .from('gics_hierarchy')
      .select('sub_industry, sub_industry_name')
      .eq('industry', industryCode)
      .order('sub_industry');

    if (error) {
      console.error('Error fetching sub-industries:', error);
      return [];
    }

    return data.map(item => ({
      code: item.sub_industry,
      name: item.sub_industry_name,
    }));
  }

  async getFavoriteContexts(): Promise<UserContext[]> {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('user_context_preferences')
      .select('*')
      .eq('is_favorite', true)
      .order('usage_count', { ascending: false })
      .limit(5);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', this.sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching favorite contexts:', error);
      return [];
    }

    return (data || []).map(this.mapToUserContext);
  }

  async getFrequentContexts(): Promise<UserContext[]> {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('user_context_preferences')
      .select('*')
      .order('usage_count', { ascending: false })
      .order('last_used_at', { ascending: false })
      .limit(5);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('session_id', this.sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching frequent contexts:', error);
      return [];
    }

    return (data || []).map(this.mapToUserContext);
  }

  async toggleFavorite(contextId: string): Promise<void> {
    const { data: context } = await supabase
      .from('user_context_preferences')
      .select('is_favorite')
      .eq('id', contextId)
      .maybeSingle();

    if (!context) return;

    const { error } = await supabase
      .from('user_context_preferences')
      .update({ is_favorite: !context.is_favorite })
      .eq('id', contextId);

    if (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  private mapToUserContext(d: any): UserContext {
    return {
      id: d.id,
      userId: d.user_id,
      sessionId: d.session_id,
      gicsSector: d.gics_sector,
      gicsIndustryGroup: d.gics_industry_group,
      gicsIndustry: d.gics_industry,
      gicsSubIndustry: d.gics_sub_industry,
      sectorName: d.sector_name,
      industryGroupName: d.industry_group_name,
      industryName: d.industry_name,
      subIndustryName: d.sub_industry_name,
      domainContext: d.domain_context,
      active: d.active,
      isFavorite: d.is_favorite,
      usageCount: d.usage_count,
      lastUsedAt: d.last_used_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }
}

export const userContextService = new UserContextService();
