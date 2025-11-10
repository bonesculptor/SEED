# Personal Medical Records System Guide

## Overview

The Personal Medical Records System provides comprehensive FHIR R4 compliant health record management with an 8-level protocol hierarchy, graph visualization, and context-aware agent-driven workflows.

## System Architecture

### FHIR R4 Protocol Hierarchy

The system implements an 8-level protocol hierarchy following FHIR R4 standards:

1. **Level 1 - Patient**: Core patient demographic and contact information
2. **Level 2 - Practitioner**: Healthcare providers and their specialties
3. **Level 3 - Encounter**: Medical visits, admissions, and appointments
4. **Level 4 - Condition**: Diagnoses, symptoms, and health conditions
5. **Level 5 - Medication**: Prescribed medications with dosages and schedules
6. **Level 6 - Procedure**: Medical procedures, surgeries, and interventions
7. **Level 7 - Observation**: Clinical observations, test results, and measurements
8. **Level 8 - Document**: Medical documents, letters, and reports

## Features

### 1. Medical Record Manager (`/medical-records`)

Comprehensive CRUD interface for managing all medical records:

- **Create**: Add new records at any protocol level with structured forms
- **Read**: View records organized by protocol level with search and filtering
- **Update**: Edit existing records with full data validation
- **Delete**: Remove records with cascade handling for related data

#### Record Types & Forms

Each protocol level has a custom form tailored to its data requirements:

- **Patient**: Name, DOB, gender, NHS number, contact details, address
- **Practitioner**: Name, specialty, organization, contact information
- **Encounter**: Type, date, location, practitioner, reason for visit
- **Condition**: Condition name, clinical status, severity, onset date, SNOMED codes
- **Medication**: Drug name, dosage, frequency, route, prescriber, RxNorm codes
- **Procedure**: Procedure name, date, performer, outcome, CPT codes
- **Observation**: Observation type, value, unit, interpretation, LOINC codes
- **Document**: Title, type, author, date, description

### 2. Graph Visualization (`/medical-graph`)

Interactive graph view showing relationships between all medical records:

- **Node Representation**: Color-coded nodes for each protocol level
- **Edge Connections**: Relationship lines showing how records connect
- **Interactive**: Click nodes to view details and relationships
- **Hierarchical Layout**: Organized by protocol levels (1-8)
- **Statistics**: Real-time count of records and connections

#### Relationship Types

- `treated_by`: Encounter → Practitioner
- `diagnosed_during`: Condition → Encounter
- `prescribed_at`: Medication → Encounter
- `performed_during`: Procedure → Encounter
- `recorded_during`: Observation → Encounter
- `documents`: Document → Encounter
- `treats`: Procedure → Condition

### 3. Dashboard (`/`)

Central hub providing:

- Quick access to Medical Records, Graph View, and Workflow systems
- Real-time statistics on patient records and system health
- FHIR protocol level summary
- Quick action buttons for common tasks

## Simon Grange Test Case

### Patient Profile

**Personal Information:**
- Name: Simon Andre Welham Grange
- DOB: 6 July 1966 (58 years old)
- NHS Number: 450 437 4846
- Occupation: Orthopaedic Surgeon
- Address: 82 Collinswood Drive, St. Leonards-on-Sea, East Sussex

### Medical History

**Primary Condition:**
- Triple vessel coronary artery disease diagnosed via angiogram (01/01/2025)

**Major Procedure:**
- CABG x3 (Triple Bypass) performed 08/01/2025 by Mr. Sabetai
  - LIMA → mid LAD (2.5mm)
  - Left Radial → OM2 (2.5mm)
  - Left Long Saphenous Vein → distal RCA (1.5mm)

**Current Medications (7 total):**
1. Amlodipine 10mg OD
2. Aspirin 75mg OD
3. Atorvastatin 80mg OD
4. Bisoprolol 3.75mg AM, 2.5mg PM
5. Clopidogrel 75mg OD (1 year)
6. Pantoprazole 40mg OD (1 year)
7. Ramipril 1.25mg OD

**Healthcare Team:**
- Dr. Mohammad Salman (SpR Cardiac Surgery, St Thomas' Hospital)
- Dr. Shahram AhmadVizir (Consultant Cardiologist, Conquest Hospital)
- Mr. Sabetai (Cardiac Surgeon, St Thomas' Hospital)

### Complete Record Set (29 records)

- 1 Patient record
- 3 Practitioner records
- 4 Encounter records
- 4 Condition records
- 7 Medication records
- 2 Procedure records
- 6 Observation records
- 1 Document record
- 24 Graph relationships

## Seeding Test Data

To populate the database with Simon Grange's medical records:

```typescript
import { seedSimonGrangeData } from './src/scripts/seedSimonGrangeData';

// Run the seed function
await seedSimonGrangeData();
```

This will create all 29 records with proper relationships and graph edges.

## Database Schema

### Tables

All tables follow the same base structure:

```sql
CREATE TABLE fhir_[type]_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Graph Edges

```sql
CREATE TABLE fhir_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## API Service Layer

### PersonalMedicalRecordService

Core service providing:

- `getRecordsByType(type)`: Fetch all records of a specific type
- `getRecordById(type, id)`: Fetch single record by ID
- `createRecord(type, data)`: Create new record with auto-generated title/summary
- `updateRecord(type, id, data)`: Update existing record
- `deleteRecord(type, id)`: Delete record and associated graph edges
- `getGraphData()`: Fetch complete graph structure with nodes and edges

### Automatic Title & Summary Generation

The service automatically generates human-readable titles and summaries based on the record type and data, for example:

- Patient: "Simon Andre Welham Grange"
- Medication: "Amlodipine 10mg OD"
- Condition: "Triple Vessel Coronary Artery Disease"
- Procedure: "CABG x3 (Triple Bypass)"

## Context-Aware Features

### Agent-Driven Processing

The system is designed to integrate with agent-driven workflows for:

- Automated record classification and coding (SNOMED CT, LOINC, RxNorm, CPT)
- Context-aware relationship discovery
- Clinical decision support
- Care pathway recommendations
- Medication interaction checking
- Duplicate detection and record linkage

### Standard Medical Coding

Records include standard medical coding fields:

- **SNOMED CT**: Conditions and clinical findings
- **LOINC**: Laboratory observations and measurements
- **RxNorm**: Medications and drug products
- **CPT**: Procedures and services

## Security

All tables have Row Level Security (RLS) enabled:

- Users can only access their own medical records
- Records are isolated by `user_id`
- Graph edges follow the same security model
- No public access to personal health information

## Navigation

### URL Routes

- `/` - Main dashboard
- `/medical-records` - Medical record manager
- `/medical-graph` - Graph visualization
- `/protocols` - Original protocol dashboard
- `/workflow` - Medical workflow builder (coming soon)

### Quick Actions

From the dashboard, click any card to navigate:
- Blue card → Medical Records Manager
- Purple card → Graph Visualization
- Green card → Medical Workflow

## Future Enhancements

Planned features:

1. **Document Upload**: Direct PDF/image upload with OCR extraction
2. **Timeline View**: Chronological view of medical events
3. **Care Plans**: Structured treatment and care planning
4. **Sharing**: Secure record sharing with healthcare providers
5. **Analytics**: Health trends and insights dashboard
6. **Mobile App**: iOS/Android companion apps
7. **HL7 Integration**: Import/export HL7 FHIR bundles
8. **Telemedicine**: Video consultation integration

## Technical Stack

- **Frontend**: React 18.3 + TypeScript 5.5
- **UI Framework**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite 5.4
- **Icons**: Lucide React
- **Standards**: FHIR R4, SNOMED CT, LOINC, RxNorm, CPT

## Support

For issues or questions:
- Check existing documentation in `/docs`
- Review database migrations in `/supabase/migrations`
- Examine service implementations in `/src/services`

---

**Version**: 1.0.0
**Last Updated**: 2025-11-09
**Compliance**: FHIR R4, HIPAA-ready with RLS
