import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  created_at: string;
  last_active?: string;
  ikigai_score?: number;
  projects_count?: number;
  tasks_completed?: number;
}

interface OdooContact {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_position?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  notes?: string;
  tags?: string;
}

class CSVExportService {
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private arrayToCSV(headers: string[], rows: any[][]): string {
    const csvHeaders = headers.map(h => this.escapeCSV(h)).join(',');
    const csvRows = rows.map(row =>
      row.map(cell => this.escapeCSV(cell)).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  }

  async exportUserProfiles(workspaceId?: string): Promise<void> {
    try {
      let query = supabase
        .from('tier1_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data: agents, error } = await query;

      if (error) throw error;

      const headers = [
        'ID',
        'Name',
        'Type',
        'Tier',
        'Capabilities',
        'Ikigai Score',
        'Tasks Completed',
        'Status',
        'Created At',
        'Updated At',
      ];

      const rows = (agents || []).map((agent: any) => [
        agent.id,
        agent.agent_name,
        agent.agent_type,
        'Tier 1',
        agent.capabilities?.join('; ') || '',
        agent.ikigai_score || 0,
        agent.tasks_completed || 0,
        agent.status || 'active',
        agent.created_at,
        agent.updated_at,
      ]);

      const csv = this.arrayToCSV(headers, rows);
      this.downloadCSV(csv, `user-profiles-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting user profiles:', error);
      throw error;
    }
  }

  async exportOdooContacts(workspaceId?: string): Promise<void> {
    try {
      let query = supabase
        .from('tier1_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data: agents, error } = await query;

      if (error) throw error;

      const odooHeaders = [
        'Name',
        'Email',
        'Phone',
        'Company',
        'Job Position',
        'Street',
        'City',
        'State/Province',
        'ZIP',
        'Country',
        'Website',
        'Notes',
        'Tags',
      ];

      const rows = (agents || []).map((agent: any) => {
        const contact: OdooContact = {
          name: agent.agent_name || '',
          email: `${agent.agent_type}@agents.local`,
          company: 'Agent Protocol System',
          job_position: `${agent.agent_type} Agent - Tier 1`,
          notes: `Agent ID: ${agent.id}\nCapabilities: ${agent.capabilities?.join(', ') || 'N/A'}\nIkigai Score: ${agent.ikigai_score || 0}`,
          tags: `agent,tier1,${agent.agent_type}`,
        };

        return [
          contact.name,
          contact.email,
          contact.phone || '',
          contact.company || '',
          contact.job_position || '',
          contact.street || '',
          contact.city || '',
          contact.state || '',
          contact.zip || '',
          contact.country || '',
          contact.website || '',
          contact.notes || '',
          contact.tags || '',
        ];
      });

      const csv = this.arrayToCSV(odooHeaders, rows);
      this.downloadCSV(csv, `odoo-contacts-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting Odoo contacts:', error);
      throw error;
    }
  }

  async exportProjectData(projectId?: string): Promise<void> {
    try {
      let query = supabase
        .from('human_contexts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: contexts, error } = await query;

      if (error) throw error;

      const headers = [
        'ID',
        'User ID',
        'Role',
        'Intention',
        'Context Data',
        'Permissions',
        'Consent Given',
        'Created At',
      ];

      const rows = (contexts || []).map((ctx: any) => [
        ctx.id,
        ctx.user_id,
        ctx.role,
        ctx.intention,
        JSON.stringify(ctx.context_data),
        ctx.permissions?.join('; ') || '',
        ctx.consent_given ? 'Yes' : 'No',
        ctx.created_at,
      ]);

      const csv = this.arrayToCSV(headers, rows);
      this.downloadCSV(csv, `project-data-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting project data:', error);
      throw error;
    }
  }

  async exportWorkflowData(workflowData: {
    nodes: any[];
    connections: any[];
  }): Promise<void> {
    try {
      const nodeHeaders = [
        'Node ID',
        'Type',
        'Agent Type',
        'Tier',
        'Label',
        'Position X',
        'Position Y',
        'Status',
      ];

      const nodeRows = workflowData.nodes.map((node: any) => [
        node.id,
        node.type,
        node.agentType || '',
        node.tier || '',
        node.label,
        node.position.x,
        node.position.y,
        node.status || 'idle',
      ]);

      const nodeCSV = this.arrayToCSV(nodeHeaders, nodeRows);

      const connHeaders = ['Connection ID', 'From Node', 'To Node', 'Condition'];
      const connRows = workflowData.connections.map((conn: any) => [
        conn.id,
        conn.from,
        conn.to,
        conn.condition || '',
      ]);

      const connCSV = this.arrayToCSV(connHeaders, connRows);

      const combinedCSV = `# WORKFLOW NODES\n${nodeCSV}\n\n# WORKFLOW CONNECTIONS\n${connCSV}`;
      this.downloadCSV(combinedCSV, `workflow-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting workflow data:', error);
      throw error;
    }
  }

  async exportAllData(workspaceId?: string): Promise<void> {
    try {
      const timestamp = Date.now();

      await this.exportUserProfiles(workspaceId);
      await new Promise(resolve => setTimeout(resolve, 500));

      await this.exportProjectData();
      await new Promise(resolve => setTimeout(resolve, 500));

      await this.exportOdooContacts(workspaceId);

      alert('All data exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error exporting all data:', error);
      alert('Error exporting data: ' + (error as Error).message);
    }
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => this.parseCSVLine(line));

    return { headers, rows };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }
}

export const csvExportService = new CSVExportService();
