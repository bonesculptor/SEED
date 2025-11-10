import { supabase } from '../lib/supabase';
import { personalMedicalRecordService } from './personalMedicalRecordService';

interface FHIRResource {
  resourceType: string;
  id?: string;
  [key: string]: any;
}

interface ExportOptions {
  format: 'json' | 'xml' | 'pdf';
  includeImages?: boolean;
}

class MedicalRecordIOService {
  async importFHIRJSON(jsonData: string): Promise<{ success: boolean; recordsCreated: number; errors: string[] }> {
    const errors: string[] = [];
    let recordsCreated = 0;

    try {
      const data = JSON.parse(jsonData);
      const bundle = data.resourceType === 'Bundle' ? data : { entry: [{ resource: data }] };

      for (const entry of bundle.entry || []) {
        const resource = entry.resource;
        if (!resource) continue;

        try {
          await this.processFHIRResource(resource);
          recordsCreated++;
        } catch (error) {
          errors.push(`Error processing ${resource.resourceType}: ${error}`);
        }
      }

      return { success: errors.length === 0, recordsCreated, errors };
    } catch (error) {
      return { success: false, recordsCreated: 0, errors: [`Parse error: ${error}`] };
    }
  }

  async importFHIRXML(xmlData: string): Promise<{ success: boolean; recordsCreated: number; errors: string[] }> {
    const errors: string[] = [];

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

      const resources = xmlDoc.getElementsByTagName('entry');
      let recordsCreated = 0;

      for (let i = 0; i < resources.length; i++) {
        try {
          const resource = this.xmlToJSON(resources[i]);
          await this.processFHIRResource(resource);
          recordsCreated++;
        } catch (error) {
          errors.push(`Error processing resource ${i}: ${error}`);
        }
      }

      return { success: errors.length === 0, recordsCreated, errors };
    } catch (error) {
      return { success: false, recordsCreated: 0, errors: [`XML parse error: ${error}`] };
    }
  }

  private xmlToJSON(xmlNode: Element): any {
    const obj: any = {};

    if (xmlNode.nodeType === 1) {
      if (xmlNode.attributes.length > 0) {
        for (let j = 0; j < xmlNode.attributes.length; j++) {
          const attribute = xmlNode.attributes.item(j);
          if (attribute) {
            obj[attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    }

    if (xmlNode.hasChildNodes()) {
      for (let i = 0; i < xmlNode.childNodes.length; i++) {
        const item = xmlNode.childNodes.item(i);
        if (item && item.nodeType === 1) {
          const nodeName = item.nodeName;
          if (typeof obj[nodeName] === 'undefined') {
            obj[nodeName] = this.xmlToJSON(item as Element);
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(this.xmlToJSON(item as Element));
          }
        } else if (item && item.nodeType === 3) {
          const textContent = item.textContent?.trim();
          if (textContent) {
            return textContent;
          }
        }
      }
    }

    return obj;
  }

  private async processFHIRResource(resource: FHIRResource): Promise<void> {
    const typeMap: Record<string, string> = {
      'Patient': 'patient',
      'Practitioner': 'practitioner',
      'Encounter': 'encounter',
      'Condition': 'condition',
      'MedicationStatement': 'medication',
      'Procedure': 'procedure',
      'Observation': 'observation',
      'DocumentReference': 'document'
    };

    const recordType = typeMap[resource.resourceType];
    if (!recordType) {
      throw new Error(`Unsupported resource type: ${resource.resourceType}`);
    }

    const recordData = this.convertFHIRToInternal(resource);
    await personalMedicalRecordService.createRecord(recordType as any, recordData);
  }

  private convertFHIRToInternal(resource: FHIRResource): any {
    switch (resource.resourceType) {
      case 'Patient':
        return {
          name: resource.name?.[0]?.text || '',
          birthDate: resource.birthDate,
          gender: resource.gender,
          phone: resource.telecom?.find((t: any) => t.system === 'phone')?.value,
          address: resource.address?.[0]?.text
        };

      case 'Condition':
        return {
          name: resource.code?.text || resource.code?.coding?.[0]?.display,
          clinicalStatus: resource.clinicalStatus?.coding?.[0]?.code,
          severity: resource.severity?.coding?.[0]?.display,
          onsetDate: resource.onsetDateTime,
          snomedCode: resource.code?.coding?.find((c: any) => c.system?.includes('snomed'))?.code,
          icd10Code: resource.code?.coding?.find((c: any) => c.system?.includes('icd'))?.code
        };

      case 'MedicationStatement':
        return {
          medication: resource.medicationCodeableConcept?.text,
          dosage: resource.dosage?.[0]?.text,
          startDate: resource.effectivePeriod?.start,
          endDate: resource.effectivePeriod?.end,
          status: resource.status
        };

      case 'Encounter':
        return {
          type: resource.class?.display || resource.type?.[0]?.text,
          date: resource.period?.start,
          location: resource.location?.[0]?.location?.display,
          reason: resource.reasonCode?.[0]?.text,
          status: resource.status
        };

      default:
        return resource;
    }
  }

  async exportToJSON(patientId?: string): Promise<string> {
    const graphData = await personalMedicalRecordService.getGraphData();

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: graphData.nodes.map(node => ({
        fullUrl: `urn:uuid:${node.id}`,
        resource: this.convertInternalToFHIR(node)
      }))
    };

    return JSON.stringify(bundle, null, 2);
  }

  async exportToXML(patientId?: string): Promise<string> {
    const graphData = await personalMedicalRecordService.getGraphData();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<Bundle xmlns="http://hl7.org/fhir">\n';
    xml += '  <type value="collection"/>\n';
    xml += `  <timestamp value="${new Date().toISOString()}"/>\n`;

    graphData.nodes.forEach(node => {
      const resource = this.convertInternalToFHIR(node);
      xml += '  <entry>\n';
      xml += `    <fullUrl value="urn:uuid:${node.id}"/>\n`;
      xml += '    <resource>\n';
      xml += this.objectToXML(resource, '      ');
      xml += '    </resource>\n';
      xml += '  </entry>\n';
    });

    xml += '</Bundle>';
    return xml;
  }

  private objectToXML(obj: any, indent: string): string {
    let xml = '';
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        xml += `${indent}<${key}>\n`;
        xml += this.objectToXML(value, indent + '  ');
        xml += `${indent}</${key}>\n`;
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          xml += `${indent}<${key}>\n`;
          if (typeof item === 'object') {
            xml += this.objectToXML(item, indent + '  ');
          } else {
            xml += `${indent}  ${item}\n`;
          }
          xml += `${indent}</${key}>\n`;
        });
      } else {
        xml += `${indent}<${key} value="${value}"/>\n`;
      }
    }
    return xml;
  }

  async exportToPDF(patientId?: string): Promise<Blob> {
    const graphData = await personalMedicalRecordService.getGraphData();

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Medical Records Export</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; }
          h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #475569; margin-top: 30px; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; }
          .record { background: #f8fafc; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
          .field { margin: 8px 0; }
          .label { font-weight: bold; color: #334155; }
          .value { color: #64748b; }
          .codes { background: #fef3c7; padding: 8px; margin-top: 8px; border-radius: 4px; }
          .code-label { font-weight: bold; color: #92400e; }
        </style>
      </head>
      <body>
        <h1>Personal Medical Records</h1>
        <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    const groupedNodes = graphData.nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, any[]>);

    const typeLabels: Record<string, string> = {
      patient: 'Patient Information',
      practitioner: 'Healthcare Practitioners',
      encounter: 'Medical Encounters',
      condition: 'Conditions & Diagnoses',
      medication: 'Medications',
      procedure: 'Procedures',
      observation: 'Observations',
      document: 'Documents'
    };

    Object.entries(groupedNodes).forEach(([type, nodes]) => {
      html += `<h2>${typeLabels[type] || type}</h2>`;
      nodes.forEach(node => {
        html += '<div class="record">';
        html += `<div class="field"><span class="label">Title:</span> <span class="value">${node.label}</span></div>`;

        if (node.data) {
          Object.entries(node.data).forEach(([key, value]) => {
            if (value && key !== 'metadata') {
              html += `<div class="field"><span class="label">${this.formatFieldName(key)}:</span> <span class="value">${value}</span></div>`;
            }
          });

          if (type === 'condition' && (node.data.snomedCode || node.data.icd10Code)) {
            html += '<div class="codes">';
            if (node.data.snomedCode) {
              html += `<div><span class="code-label">SNOMED CT:</span> ${node.data.snomedCode}</div>`;
            }
            if (node.data.icd10Code) {
              html += `<div><span class="code-label">ICD-10:</span> ${node.data.icd10Code}</div>`;
            }
            html += '</div>';
          }
        }

        html += '</div>';
      });
    });

    html += `
        <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
          <p>This document contains personal medical information and should be handled securely.</p>
          <p>Generated by Personal Health Record System</p>
        </footer>
      </body>
      </html>
    `;

    return new Blob([html], { type: 'text/html' });
  }

  private formatFieldName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private convertInternalToFHIR(node: any): FHIRResource {
    const baseResource = {
      resourceType: this.getResourceType(node.type),
      id: node.id
    };

    switch (node.type) {
      case 'patient':
        return {
          ...baseResource,
          resourceType: 'Patient',
          name: [{ text: node.data.name }],
          birthDate: node.data.birthDate,
          gender: node.data.gender?.toLowerCase()
        };

      case 'condition':
        return {
          ...baseResource,
          resourceType: 'Condition',
          code: {
            text: node.data.name,
            coding: [
              node.data.snomedCode && {
                system: 'http://snomed.info/sct',
                code: node.data.snomedCode,
                display: node.data.name
              },
              node.data.icd10Code && {
                system: 'http://hl7.org/fhir/sid/icd-10',
                code: node.data.icd10Code,
                display: node.data.name
              }
            ].filter(Boolean)
          },
          clinicalStatus: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: node.data.clinicalStatus?.toLowerCase()
            }]
          },
          onsetDateTime: node.data.onsetDate
        };

      case 'encounter':
        return {
          ...baseResource,
          resourceType: 'Encounter',
          status: node.data.status?.toLowerCase() || 'finished',
          class: { display: node.data.type },
          period: { start: node.data.date }
        };

      default:
        return { ...baseResource, ...node.data };
    }
  }

  private getResourceType(internalType: string): string {
    const typeMap: Record<string, string> = {
      patient: 'Patient',
      practitioner: 'Practitioner',
      encounter: 'Encounter',
      condition: 'Condition',
      medication: 'MedicationStatement',
      procedure: 'Procedure',
      observation: 'Observation',
      document: 'DocumentReference'
    };
    return typeMap[internalType] || 'Resource';
  }

  downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const medicalRecordIOService = new MedicalRecordIOService();
