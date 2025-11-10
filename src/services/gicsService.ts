import Papa from 'papaparse';

export interface GICSClassification {
  gics_code: string;
  sector: string;
  industry_group: string;
  industry: string;
  sub_industry: string;
}

export interface GICSSector {
  name: string;
  industry_groups: string[];
}

class GICSService {
  private classifications: GICSClassification[] = [];

  async loadGICSData(): Promise<GICSClassification[]> {
    if (this.classifications.length > 0) {
      return this.classifications;
    }

    try {
      const response = await fetch('/src/data/GICS_2024_full_structure.csv');
      const csvText = await response.text();

      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      this.classifications = result.data.map((row: any) => ({
        gics_code: row['GICS_Code'] || '',
        sector: row['Sector'] || '',
        industry_group: row['Industry_Group'] || '',
        industry: row['Industry'] || '',
        sub_industry: row['Sub_Industry'] || '',
      })).filter(c => c.gics_code);

      return this.classifications;
    } catch (error) {
      console.error('Error loading GICS data:', error);
      return [];
    }
  }

  getSectors(): string[] {
    const sectors = new Set<string>();
    this.classifications.forEach(c => sectors.add(c.sector));
    return Array.from(sectors).sort();
  }

  getIndustryGroups(sector: string): string[] {
    const groups = new Set<string>();
    this.classifications
      .filter(c => c.sector === sector)
      .forEach(c => groups.add(c.industry_group));
    return Array.from(groups).sort();
  }

  getIndustries(sector: string, industryGroup?: string): string[] {
    const industries = new Set<string>();
    this.classifications
      .filter(c => c.sector === sector && (!industryGroup || c.industry_group === industryGroup))
      .forEach(c => industries.add(c.industry));
    return Array.from(industries).sort();
  }

  getSubIndustries(sector: string, industry?: string): string[] {
    const subIndustries = new Set<string>();
    this.classifications
      .filter(c => c.sector === sector && (!industry || c.industry === industry))
      .forEach(c => subIndustries.add(c.sub_industry));
    return Array.from(subIndustries).sort();
  }

  findByGICSCode(code: string): GICSClassification | undefined {
    return this.classifications.find(c => c.gics_code === code);
  }

  search(query: string): GICSClassification[] {
    const lowerQuery = query.toLowerCase();
    return this.classifications.filter(c =>
      c.sector.toLowerCase().includes(lowerQuery) ||
      c.industry_group.toLowerCase().includes(lowerQuery) ||
      c.industry.toLowerCase().includes(lowerQuery) ||
      c.sub_industry.toLowerCase().includes(lowerQuery)
    );
  }

  getAllClassifications(): GICSClassification[] {
    return this.classifications;
  }

  getHierarchy(): Record<string, any> {
    const hierarchy: Record<string, any> = {};

    this.classifications.forEach(c => {
      if (!hierarchy[c.sector]) {
        hierarchy[c.sector] = {};
      }
      if (!hierarchy[c.sector][c.industry_group]) {
        hierarchy[c.sector][c.industry_group] = {};
      }
      if (!hierarchy[c.sector][c.industry_group][c.industry]) {
        hierarchy[c.sector][c.industry_group][c.industry] = [];
      }
      if (!hierarchy[c.sector][c.industry_group][c.industry].includes(c.sub_industry)) {
        hierarchy[c.sector][c.industry_group][c.industry].push(c.sub_industry);
      }
    });

    return hierarchy;
  }
}

export const gicsService = new GICSService();
