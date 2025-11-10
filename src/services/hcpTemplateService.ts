import { UserContext } from './userContextService';

export interface HCPTemplate {
  title: string;
  description: string;
  context: {
    purposes: string[];
    activities: string[];
  };
  resources: {
    human: Array<{ role: string; availability?: string }>;
    digital: Array<{ name: string; uri: string; category: string }>;
    physical: Array<{ name: string }>;
  };
  rules: {
    permissions: Array<any>;
    duties: string[];
    prohibited: string[];
  };
  preferences: {
    style: string;
    scheduling?: string;
    domainSpecific?: string;
  };
}

export class HCPTemplateService {
  generateTemplates(userContext: UserContext | null): HCPTemplate[] {
    if (!userContext) {
      return this.getDefaultTemplates();
    }

    const sector = userContext.sectorName;
    const subIndustry = userContext.subIndustryName;

    switch (sector) {
      case 'Health Care':
        return this.getHealthCareTemplates(subIndustry);
      case 'Energy':
        return this.getEnergyTemplates(subIndustry);
      case 'Materials':
        return this.getMaterialsTemplates(subIndustry);
      case 'Industrials':
        return this.getIndustrialsTemplates(subIndustry);
      case 'Information Technology':
        return this.getITTemplates(subIndustry);
      default:
        return this.getDefaultTemplates();
    }
  }

  private getHealthCareTemplates(subIndustry?: string): HCPTemplate[] {
    const templates: HCPTemplate[] = [];

    if (subIndustry === 'Health Care Services') {
      templates.push({
        title: 'Outpatient Clinic Operations',
        description: 'Patient care delivery in outpatient setting',
        context: {
          purposes: ['Deliver outpatient consultations', 'Manage patient appointments', 'Coordinate care delivery'],
          activities: ['Book appointments', 'Examine patients', 'Order diagnostics', 'Prescribe treatments', 'Follow-up care']
        },
        resources: {
          human: [
            { role: 'Physician', availability: 'Mon-Fri 08:00-17:00' },
            { role: 'Nurse', availability: 'Mon-Fri 07:30-17:30' },
            { role: 'Medical Assistant', availability: 'Mon-Fri 08:00-17:00' },
            { role: 'Receptionist', availability: 'Mon-Fri 07:00-18:00' }
          ],
          digital: [
            { name: 'EHR System', uri: 'urn:system:ehr', category: 'application' },
            { name: 'Appointment Scheduler', uri: 'urn:system:scheduling', category: 'application' },
            { name: 'Clinical Decision Support', uri: 'urn:agent:cds', category: 'model' }
          ],
          physical: [
            { name: 'Exam Room 1' },
            { name: 'Exam Room 2' },
            { name: 'Consultation Room' },
            { name: 'Waiting Area' }
          ]
        },
        rules: {
          permissions: [],
          duties: ['Comply with HIPAA/local health data regulations', 'Maintain patient confidentiality', 'Follow clinical protocols'],
          prohibited: ['Share patient data without consent', 'Practice outside scope of license']
        },
        preferences: {
          style: 'Professional medical terminology, patient-centered communication',
          scheduling: 'Allow 15-min buffer between appointments',
          domainSpecific: 'Prioritize urgent cases, infection control protocols'
        }
      });

      templates.push({
        title: 'Telehealth Consultation Service',
        description: 'Remote patient care via digital channels',
        context: {
          purposes: ['Provide remote consultations', 'Monitor chronic conditions', 'Follow-up care'],
          activities: ['Virtual appointments', 'Remote monitoring', 'Digital prescriptions', 'Care coordination']
        },
        resources: {
          human: [
            { role: 'Telemedicine Physician', availability: 'Mon-Sun 08:00-20:00' },
            { role: 'Triage Nurse', availability: 'Mon-Sun 07:00-21:00' }
          ],
          digital: [
            { name: 'Telehealth Platform', uri: 'urn:system:telehealth', category: 'application' },
            { name: 'Remote Monitoring Hub', uri: 'urn:system:rpm', category: 'dataset' },
            { name: 'AI Symptom Checker', uri: 'urn:agent:symptom-ai', category: 'model' }
          ],
          physical: [
            { name: 'Telehealth Studio' }
          ]
        },
        rules: {
          permissions: [],
          duties: ['Verify patient identity', 'Ensure secure connections', 'Document all interactions'],
          prohibited: ['Prescribe controlled substances without proper verification', 'Store unencrypted patient data']
        },
        preferences: {
          style: 'Clear, empathetic communication for remote setting',
          domainSpecific: 'Use video when possible, provide written summaries'
        }
      });
    }

    if (subIndustry === 'Biotechnology' || subIndustry === 'Pharmaceuticals') {
      templates.push({
        title: 'Clinical Research Protocol',
        description: 'Clinical trial execution and patient safety monitoring',
        context: {
          purposes: ['Conduct clinical trials', 'Monitor patient safety', 'Collect research data'],
          activities: ['Enroll participants', 'Administer treatments', 'Monitor adverse events', 'Collect data']
        },
        resources: {
          human: [
            { role: 'Principal Investigator', availability: 'Mon-Fri 09:00-17:00' },
            { role: 'Clinical Research Coordinator', availability: 'Mon-Fri 08:00-17:00' },
            { role: 'Research Nurse', availability: 'Mon-Fri 07:00-15:00' }
          ],
          digital: [
            { name: 'Clinical Trial Management System', uri: 'urn:system:ctms', category: 'application' },
            { name: 'Electronic Data Capture', uri: 'urn:system:edc', category: 'dataset' },
            { name: 'Safety Monitoring Agent', uri: 'urn:agent:safety', category: 'model' }
          ],
          physical: [
            { name: 'Research Clinic' },
            { name: 'Lab Facility' }
          ]
        },
        rules: {
          permissions: [],
          duties: ['Follow GCP guidelines', 'Report adverse events immediately', 'Maintain trial integrity'],
          prohibited: ['Modify protocol without approval', 'Unblind trial data prematurely']
        },
        preferences: {
          style: 'Precise scientific documentation, regulatory compliance focus',
          domainSpecific: 'Prioritize patient safety, immediate AE reporting'
        }
      });
    }

    return templates.length > 0 ? templates : this.getDefaultHealthCareTemplate();
  }

  private getEnergyTemplates(subIndustry?: string): HCPTemplate[] {
    const templates: HCPTemplate[] = [];

    if (subIndustry?.includes('Oil & Gas')) {
      templates.push({
        title: 'Drilling Operations Control',
        description: 'Oil & gas drilling site operations management',
        context: {
          purposes: ['Manage drilling operations', 'Ensure safety compliance', 'Optimize production'],
          activities: ['Monitor drilling parameters', 'Coordinate crew shifts', 'Maintain equipment', 'Safety inspections']
        },
        resources: {
          human: [
            { role: 'Drilling Supervisor', availability: '24/7 rotation' },
            { role: 'Safety Officer', availability: '24/7 on-site' },
            { role: 'Drilling Engineer', availability: 'Mon-Sun 06:00-18:00' }
          ],
          digital: [
            { name: 'SCADA System', uri: 'urn:system:scada', category: 'application' },
            { name: 'Well Monitoring', uri: 'urn:system:monitoring', category: 'dataset' },
            { name: 'Predictive Maintenance AI', uri: 'urn:agent:maintenance', category: 'model' }
          ],
          physical: [
            { name: 'Drilling Rig' },
            { name: 'Control Room' },
            { name: 'Equipment Storage' }
          ]
        },
        rules: {
          permissions: [],
          duties: ['Follow HSE regulations', 'Report incidents immediately', 'Maintain safety equipment'],
          prohibited: ['Override safety systems', 'Operate without proper certification']
        },
        preferences: {
          style: 'Direct, safety-first communication',
          domainSpecific: 'Zero tolerance for safety violations, immediate escalation protocol'
        }
      });
    }

    return templates.length > 0 ? templates : this.getDefaultEnergyTemplate();
  }

  private getIndustrialsTemplates(subIndustry?: string): HCPTemplate[] {
    const templates: HCPTemplate[] = [];

    if (subIndustry?.includes('Aerospace')) {
      templates.push({
        title: 'Aircraft Manufacturing Quality Control',
        description: 'Quality assurance in aerospace manufacturing',
        context: {
          purposes: ['Ensure manufacturing quality', 'Maintain compliance', 'Optimize production'],
          activities: ['Inspect components', 'Test assemblies', 'Document compliance', 'Coordinate with engineering']
        },
        resources: {
          human: [
            { role: 'Quality Inspector', availability: 'Mon-Fri 06:00-18:00' },
            { role: 'QA Engineer', availability: 'Mon-Fri 08:00-17:00' }
          ],
          digital: [
            { name: 'Quality Management System', uri: 'urn:system:qms', category: 'application' },
            { name: 'Defect Tracking', uri: 'urn:system:defects', category: 'dataset' },
            { name: 'AI Vision Inspection', uri: 'urn:agent:inspection', category: 'model' }
          ],
          physical: [
            { name: 'Assembly Line' },
            { name: 'Testing Facility' }
          ]
        },
        rules: {
          permissions: [],
          duties: ['Follow AS9100 standards', 'Document all inspections', 'Report non-conformances'],
          prohibited: ['Approve defective parts', 'Skip inspection steps']
        },
        preferences: {
          style: 'Precise technical documentation, zero-defect mindset',
          domainSpecific: 'Safety-critical components require triple verification'
        }
      });
    }

    return templates.length > 0 ? templates : this.getDefaultIndustrialsTemplate();
  }

  private getITTemplates(subIndustry?: string): HCPTemplate[] {
    const templates: HCPTemplate[] = [];

    if (subIndustry?.includes('Software')) {
      templates.push({
        title: 'Software Development Team',
        description: 'Agile software development operations',
        context: {
          purposes: ['Develop software products', 'Deliver features', 'Maintain code quality'],
          activities: ['Sprint planning', 'Code reviews', 'Deploy releases', 'Bug triage']
        },
        resources: {
          human: [
            { role: 'Software Engineer', availability: 'Mon-Fri 09:00-18:00' },
            { role: 'Product Manager', availability: 'Mon-Fri 09:00-18:00' },
            { role: 'DevOps Engineer', availability: 'Mon-Fri 08:00-17:00' }
          ],
          digital: [
            { name: 'Git Repository', uri: 'urn:system:git', category: 'dataset' },
            { name: 'CI/CD Pipeline', uri: 'urn:system:cicd', category: 'application' },
            { name: 'Code Review AI', uri: 'urn:agent:codereview', category: 'model' }
          ],
          physical: [
            { name: 'Development Office' },
            { name: 'Collaboration Space' }
          ]
        },
        rules: {
          permissions: [],
          duties: ['Follow coding standards', 'Review peer code', 'Write tests'],
          prohibited: ['Commit secrets to repository', 'Deploy without testing']
        },
        preferences: {
          style: 'Collaborative, iterative approach',
          domainSpecific: 'Code quality over speed, documentation required'
        }
      });
    }

    return templates.length > 0 ? templates : this.getDefaultITTemplate();
  }

  private getMaterialsTemplates(subIndustry?: string): HCPTemplate[] {
    return this.getDefaultMaterialsTemplate();
  }

  private getDefaultHealthCareTemplate(): HCPTemplate[] {
    return [{
      title: 'General Healthcare Facility',
      description: 'General healthcare operations',
      context: {
        purposes: ['Deliver patient care', 'Ensure compliance'],
        activities: ['Patient care', 'Documentation', 'Coordination']
      },
      resources: {
        human: [{ role: 'Healthcare Professional', availability: 'Standard hours' }],
        digital: [{ name: 'EHR System', uri: 'urn:system:ehr', category: 'application' }],
        physical: [{ name: 'Healthcare Facility' }]
      },
      rules: {
        permissions: [],
        duties: ['Comply with healthcare regulations'],
        prohibited: ['Breach patient confidentiality']
      },
      preferences: {
        style: 'Professional healthcare communication'
      }
    }];
  }

  private getDefaultEnergyTemplate(): HCPTemplate[] {
    return [{
      title: 'Energy Operations',
      description: 'Energy sector operations',
      context: {
        purposes: ['Manage energy operations', 'Ensure safety'],
        activities: ['Operations monitoring', 'Maintenance', 'Safety compliance']
      },
      resources: {
        human: [{ role: 'Operations Supervisor' }],
        digital: [{ name: 'Operations System', uri: 'urn:system:ops', category: 'application' }],
        physical: [{ name: 'Operations Facility' }]
      },
      rules: {
        permissions: [],
        duties: ['Follow safety regulations'],
        prohibited: ['Override safety systems']
      },
      preferences: {
        style: 'Safety-first communication'
      }
    }];
  }

  private getDefaultIndustrialsTemplate(): HCPTemplate[] {
    return [{
      title: 'Industrial Operations',
      description: 'Industrial manufacturing operations',
      context: {
        purposes: ['Manage production', 'Ensure quality'],
        activities: ['Production oversight', 'Quality control', 'Maintenance']
      },
      resources: {
        human: [{ role: 'Production Manager' }],
        digital: [{ name: 'Production System', uri: 'urn:system:production', category: 'application' }],
        physical: [{ name: 'Manufacturing Facility' }]
      },
      rules: {
        permissions: [],
        duties: ['Follow quality standards'],
        prohibited: ['Skip quality checks']
      },
      preferences: {
        style: 'Precise operational communication'
      }
    }];
  }

  private getDefaultITTemplate(): HCPTemplate[] {
    return [{
      title: 'IT Operations',
      description: 'Information technology operations',
      context: {
        purposes: ['Manage IT systems', 'Support users'],
        activities: ['System monitoring', 'User support', 'Incident response']
      },
      resources: {
        human: [{ role: 'IT Administrator' }],
        digital: [{ name: 'IT Management System', uri: 'urn:system:itm', category: 'application' }],
        physical: [{ name: 'Data Center' }]
      },
      rules: {
        permissions: [],
        duties: ['Follow security policies'],
        prohibited: ['Access unauthorized systems']
      },
      preferences: {
        style: 'Technical, precise communication'
      }
    }];
  }

  private getDefaultMaterialsTemplate(): HCPTemplate[] {
    return [{
      title: 'Materials Operations',
      description: 'Materials processing and manufacturing',
      context: {
        purposes: ['Manage materials operations', 'Ensure quality'],
        activities: ['Production oversight', 'Quality control', 'Supply chain management']
      },
      resources: {
        human: [{ role: 'Operations Manager' }],
        digital: [{ name: 'Operations System', uri: 'urn:system:ops', category: 'application' }],
        physical: [{ name: 'Processing Facility' }]
      },
      rules: {
        permissions: [],
        duties: ['Follow environmental regulations'],
        prohibited: ['Bypass safety protocols']
      },
      preferences: {
        style: 'Professional operational communication'
      }
    }];
  }

  private getDefaultTemplates(): HCPTemplate[] {
    return [{
      title: 'General Business Operations',
      description: 'Standard business operational context',
      context: {
        purposes: ['Manage operations', 'Serve customers'],
        activities: ['Daily operations', 'Customer service', 'Administration']
      },
      resources: {
        human: [{ role: 'Manager' }],
        digital: [{ name: 'Business System', uri: 'urn:system:business', category: 'application' }],
        physical: [{ name: 'Office' }]
      },
      rules: {
        permissions: [],
        duties: ['Follow company policies'],
        prohibited: ['Share confidential information']
      },
      preferences: {
        style: 'Professional business communication'
      }
    }];
  }
}

export const hcpTemplateService = new HCPTemplateService();
