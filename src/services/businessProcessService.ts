import Papa from 'papaparse';

export interface BusinessProcess {
  pcfId: string;
  hierarchyId: string;
  name: string;
  user: string;
  action: string;
  outcome: string;
  context: string;
  userStory1: string;
  userStory2: string;
  priority: string;
  category?: string;
  layer?: string;
  standard?: string;
}

class BusinessProcessService {
  private processes: BusinessProcess[] = [];
  
  async loadProcesses(): Promise<BusinessProcess[]> {
    if (this.processes.length > 0) {
      return this.processes;
    }

    try {
      const response = await fetch('/src/data/PBD1.1 Business Structure Mapping - CI Process Mapping 1.0 .csv');
      const csvText = await response.text();
      
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      this.processes = result.data.map((row: any) => ({
        pcfId: row['PCF ID'] || '',
        hierarchyId: row['Hierarchy ID'] || '',
        name: row['Name'] || '',
        user: row['<user>'] || '',
        action: row['<action>'] || '',
        outcome: row['<outcome>'] || '',
        context: row['<context>'] || '',
        userStory1: row['User Story  [1]'] || '',
        userStory2: row['User Story  [2]'] || '',
        priority: row['Priority'] || '',
        category: row['Category'] || '',
        layer: row['Layers'] || '',
        standard: row['Standards'] || '',
      })).filter(p => p.name);

      return this.processes;
    } catch (error) {
      console.error('Error loading business processes:', error);
      return [];
    }
  }

  getProcessesByLevel(level: string): BusinessProcess[] {
    return this.processes.filter(p => {
      const parts = p.hierarchyId.split('.');
      return parts[0] === level;
    });
  }

  getProcessHierarchy(): Record<string, BusinessProcess[]> {
    const hierarchy: Record<string, BusinessProcess[]> = {};
    
    this.processes.forEach(process => {
      const level = process.hierarchyId.split('.')[0];
      if (!hierarchy[level]) {
        hierarchy[level] = [];
      }
      hierarchy[level].push(process);
    });

    return hierarchy;
  }

  getBusinessFunctions(): string[] {
    const functions = new Set<string>();
    this.processes.forEach(p => {
      const parts = p.hierarchyId.split('.');
      if (parts.length >= 2 && p.name) {
        functions.add(p.name);
      }
    });
    return Array.from(functions);
  }

  getCategoriesAndLayers(): { categories: string[]; layers: string[] } {
    const categories = new Set<string>();
    const layers = new Set<string>();
    
    this.processes.forEach(p => {
      if (p.category) categories.add(p.category);
      if (p.layer) layers.add(p.layer);
    });

    return {
      categories: Array.from(categories).filter(Boolean),
      layers: Array.from(layers).filter(Boolean),
    };
  }

  getUserRoles(): string[] {
    const roles = new Set<string>();
    this.processes.forEach(p => {
      if (p.user) roles.add(p.user);
    });
    return Array.from(roles).filter(Boolean);
  }
}

export const businessProcessService = new BusinessProcessService();
