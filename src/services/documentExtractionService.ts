import { llmService } from './llmService';
import { didService } from './didService';
import { supabase } from '../lib/supabase';

interface ExtractedMedicalData {
  patient: {
    name: string;
    birthDate: string;
    nhsNumber?: string;
    hospitalNumber?: string;
    address?: string;
    phone?: string;
  };
  practitioners: Array<{
    name: string;
    role: string;
    specialty?: string;
    organisation?: string;
  }>;
  encounters: Array<{
    date: string;
    type: string;
    location?: string;
    reason?: string;
  }>;
  conditions: Array<{
    name: string;
    diagnosisDate?: string;
    clinicalStatus?: string;
    severity?: string;
  }>;
  procedures: Array<{
    name: string;
    performedDate?: string;
    performer?: string;
    outcome?: string;
  }>;
  medications: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    startDate?: string;
  }>;
  observations: Array<{
    type: string;
    value?: string;
    date?: string;
  }>;
}

class DocumentExtractionService {
  async extractFromPDF(fileData: ArrayBuffer, filename: string): Promise<ExtractedMedicalData | null> {
    try {
      const text = await this.convertPDFToText(fileData, filename);
      if (!text || text.length < 100) {
        console.error('Insufficient text extracted from PDF');
        return null;
      }
      return await this.extractStructuredData(text);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return null;
    }
  }

  async extractFromImage(fileData: ArrayBuffer): Promise<ExtractedMedicalData | null> {
    try {
      console.log('Image extraction requires OCR service - not yet implemented');
      return null;
    } catch (error) {
      console.error('Image extraction error:', error);
      return null;
    }
  }

  private async convertPDFToText(fileData: ArrayBuffer, filename: string): Promise<string> {
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(fileData);

      const contentMatch = text.match(/stream([\s\S]*?)endstream/g);
      if (contentMatch) {
        let extracted = '';
        contentMatch.forEach(match => {
          const content = match.replace(/stream|endstream/g, '');
          const readable = content.replace(/[^\x20-\x7E\n\r]/g, ' ');
          extracted += readable + '\n';
        });
        return extracted;
      }

      return text.replace(/[^\x20-\x7E\n\r]/g, ' ');
    } catch (error) {
      console.error('PDF text extraction error:', error);
      return '';
    }
  }

  async extractStructuredData(documentText: string): Promise<ExtractedMedicalData | null> {
    const prompt = `You are a medical records extraction specialist. Extract structured data from this NHS medical document.

Document Text:
${documentText}

Extract the following information in JSON format:
{
  "patient": {
    "name": "Full patient name",
    "birthDate": "YYYY-MM-DD format",
    "nhsNumber": "NHS number if present",
    "hospitalNumber": "Hospital number if present",
    "address": "Full address",
    "phone": "Phone number"
  },
  "practitioners": [
    {
      "name": "Practitioner name",
      "role": "Their role (e.g., Consultant Cardiologist, SpR in Cardiac Surgery)",
      "specialty": "Specialty",
      "organisation": "Hospital or practice name"
    }
  ],
  "encounters": [
    {
      "date": "YYYY-MM-DD",
      "type": "Type of encounter (e.g., Follow-up, Admission, Procedure)",
      "location": "Hospital/Department",
      "reason": "Reason for encounter"
    }
  ],
  "conditions": [
    {
      "name": "Condition name",
      "diagnosisDate": "YYYY-MM-DD if mentioned",
      "clinicalStatus": "active, resolved, etc.",
      "severity": "mild, moderate, severe"
    }
  ],
  "procedures": [
    {
      "name": "Procedure name (e.g., CABG x3, angiogram)",
      "performedDate": "YYYY-MM-DD",
      "performer": "Who performed it",
      "outcome": "Outcome description"
    }
  ],
  "medications": [
    {
      "name": "Medication name",
      "dosage": "Dosage with units",
      "frequency": "e.g., OD, BD, TDS",
      "route": "e.g., oral, IV",
      "startDate": "YYYY-MM-DD if mentioned"
    }
  ],
  "observations": [
    {
      "type": "Type of observation",
      "value": "Value if quantifiable",
      "date": "YYYY-MM-DD"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON, no explanation
- Use British English spellings
- Convert all dates to YYYY-MM-DD format
- If information is not present, omit the field or use null
- Extract ALL medications with exact dosages and frequencies mentioned
- Include all practitioners mentioned in the document`;

    try {
      const result = await llmService.generateResponse(prompt);

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in LLM response');
        return null;
      }

      const extracted = JSON.parse(jsonMatch[0]);
      return extracted as ExtractedMedicalData;
    } catch (error) {
      console.error('Error extracting structured data:', error);
      return null;
    }
  }

  async createRecordsFromExtraction(
    extracted: ExtractedMedicalData,
    fileId: string
  ): Promise<{ success: boolean; did?: string; recordCount: number }> {
    try {
      let did: string | null = null;

      if (extracted.patient.nhsNumber) {
        did = await didService.getPatientDID(extracted.patient.nhsNumber);
      }

      if (!did && extracted.patient) {
        const didResult = await didService.createPatientDID({
          name: extracted.patient.name,
          nhsNumber: extracted.patient.nhsNumber,
          birthDate: extracted.patient.birthDate,
          hospitalNumber: extracted.patient.hospitalNumber
        });
        did = didResult.did;

        await supabase.from('blockchain_audit_log').insert({
          did: did,
          action: 'created',
          data_hash: didService.generateBlockchainRecord(did, didResult.didDocument).hash,
          status: 'pending',
          metadata: {
            source: 'document_extraction',
            file_id: fileId
          }
        });
      }

      let recordCount = 0;

      if (extracted.patient) {
        await supabase.from('fhir_patient_protocols').insert({
          name: extracted.patient.name,
          birth_date: extracted.patient.birthDate,
          nhs_number: extracted.patient.nhsNumber,
          hospital_number: extracted.patient.hospitalNumber,
          address: extracted.patient.address,
          phone: extracted.patient.phone,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      for (const pract of extracted.practitioners || []) {
        await supabase.from('fhir_practitioner_protocols').insert({
          name: pract.name,
          role: pract.role,
          specialty: pract.specialty,
          organisation: pract.organisation,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      for (const enc of extracted.encounters || []) {
        await supabase.from('fhir_encounter_protocols').insert({
          date: enc.date,
          type: enc.type,
          location: enc.location,
          reason: enc.reason,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      for (const cond of extracted.conditions || []) {
        await supabase.from('fhir_condition_protocols').insert({
          name: cond.name,
          diagnosis_date: cond.diagnosisDate,
          clinical_status: cond.clinicalStatus,
          severity: cond.severity,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      for (const proc of extracted.procedures || []) {
        await supabase.from('fhir_procedure_protocols').insert({
          name: proc.name,
          performed_date: proc.performedDate,
          performer: proc.performer,
          outcome: proc.outcome,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      for (const med of extracted.medications || []) {
        await supabase.from('fhir_medication_protocols').insert({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          route: med.route,
          start_date: med.startDate,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      for (const obs of extracted.observations || []) {
        await supabase.from('fhir_observation_protocols').insert({
          type: obs.type,
          value: obs.value,
          date: obs.date,
          metadata: { did, source: 'extraction', file_id: fileId }
        });
        recordCount++;
      }

      return { success: true, did: did || undefined, recordCount };
    } catch (error) {
      console.error('Error creating records from extraction:', error);
      return { success: false, recordCount: 0 };
    }
  }
}

export const documentExtractionService = new DocumentExtractionService();
