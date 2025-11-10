# Navigation and FHIR Graph Sync Guide

## Overview

The SEED Platform now features a comprehensive navigation system with hamburger menu and FHIR-compliant graph synchronization between patient records and all protocol levels.

## Navigation Menu

### Accessing the Menu

A hamburger menu icon (☰) appears in the top-left corner of every page. Click it to access the navigation sidebar.

### Menu Items

1. **Dashboard** (`/`) - Main overview and quick access hub
2. **Medical Records** (`/medical-records`) - Full CRUD interface for all 8 protocol levels
3. **Graph View** (`/medical-graph`) - Interactive visualization of record relationships
4. **Medical Workflow** (`/workflow`) - Process medical records through workflows
5. **Protocols** (`/protocols`) - Original protocol management dashboard
6. **Settings** (`/settings`) - System configuration

### Navigation Features

- **Active State**: Current page is highlighted in blue
- **Click Anywhere**: Click outside the menu to close it
- **Persistent**: Menu stays open until you navigate or close it
- **Responsive**: Works on all screen sizes

## Patient Record Actions

### Actions Menu

When viewing Patient Records (`/medical-records`), click the **Actions** button in the top-right to access:

### 1. Seed Test Data (Simon Grange)

**Purpose**: Import complete medical records for Simon Grange

**What it does**:
- Creates 29 FHIR R4 compliant records across 8 protocol levels
- Establishes 24+ graph relationships between records
- Propagates patient information to all related protocols
- Validates graph integrity automatically

**Usage**:
```
1. Click "Actions" button
2. Select "Seed Test Data (Simon Grange)"
3. Confirm the action
4. Wait for completion message with validation results
```

**Result**:
- ✅ 1 Patient record
- ✅ 3 Practitioner records
- ✅ 4 Encounter records
- ✅ 4 Condition records
- ✅ 7 Medication records
- ✅ 2 Procedure records
- ✅ 6 Observation records
- ✅ 1 Document record
- ✅ 24+ bidirectional graph edges
- ✅ Full FHIR compliance validation

### 2. Sync to All Protocols

**Purpose**: Connect patient records to other protocol levels via FHIR graph

**When available**: Only visible when viewing the Patient tab with at least one patient record

**What it does**:
- Creates graph edges from patient to all existing records
- Propagates patient metadata (name, NHS number, DOB) to all related records
- Validates graph integrity
- Reports any orphaned edges or issues

**Usage**:
```
1. Navigate to "Patient Info" tab
2. Ensure you have a patient record loaded
3. Click "Actions" → "Sync to All Protocols"
4. Review validation results
```

**Graph Structure Created**:
```
Patient (L1)
  ├─→ has_record → Practitioner (L2)
  ├─→ has_record → Encounter (L3)
  ├─→ has_record → Condition (L4)
  ├─→ has_record → Medication (L5)
  ├─→ has_record → Procedure (L6)
  ├─→ has_record → Observation (L7)
  └─→ has_record → Document (L8)
```

### 3. Export FHIR Bundle

**Purpose**: Export all medical records in FHIR R4 Bundle format

**What it does**:
- Collects all records from the graph
- Formats as FHIR R4 Bundle (type: collection)
- Includes patient resource and all related resources
- Adds proper FHIR resource references
- Downloads as JSON file

**Usage**:
```
1. Click "Actions" → "Export FHIR Bundle"
2. File downloads automatically
3. Filename: medical-records-YYYY-MM-DD.json
```

**FHIR Bundle Structure**:
```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "timestamp": "2025-11-09T...",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "...",
        "name": "Simon Grange",
        ...
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "id": "...",
        "subject": { "reference": "Patient/..." },
        ...
      }
    }
  ]
}
```

### 4. Refresh Data

**Purpose**: Reload current protocol level records from database

**What it does**:
- Refreshes the current view
- Updates record counts
- Reflects any changes made in other sessions

## FHIR Graph Synchronization

### Relationship Types

The system establishes bidirectional relationships:

| Forward Relationship | Reverse Relationship | Description |
|---------------------|---------------------|-------------|
| `has_record` | `belongs_to_patient` | Patient owns record |
| `treated_by` | `treats` | Encounter treated by Practitioner |
| `diagnosed_during` | `diagnosed` | Condition diagnosed in Encounter |
| `prescribed_at` | `prescription_for` | Medication prescribed at Encounter |
| `performed_during` | `includes_procedure` | Procedure during Encounter |
| `recorded_during` | `has_observation` | Observation recorded in Encounter |
| `documents` | `documented_by` | Document references Encounter |

### Graph Validation

Automatic validation checks:
- ✓ All source nodes exist
- ✓ All target nodes exist
- ✓ Valid relationship types
- ✓ No orphaned edges
- ✓ FHIR compliance

### Metadata Propagation

When syncing, each related record receives:
```json
{
  "patient_info": {
    "id": "patient-uuid",
    "name": "Simon Grange",
    "nhs_number": "450 437 4846",
    "dob": "1966-07-06"
  },
  "last_synced": "2025-11-09T..."
}
```

## Protocol Level Hierarchy

### Level 1 - Patient
- **Root Node**: All other records connect to patient
- **Purpose**: Core demographic and contact information
- **Cardinality**: One per person

### Level 2 - Practitioner
- **Relationship**: Can treat multiple patients
- **Purpose**: Healthcare provider information
- **Cardinality**: Many per patient

### Level 3 - Encounter
- **Relationship**: Patient visits, treated by practitioners
- **Purpose**: Medical events and appointments
- **Cardinality**: Many per patient

### Level 4 - Condition
- **Relationship**: Diagnosed during encounters
- **Purpose**: Medical diagnoses and health conditions
- **Cardinality**: Many per patient

### Level 5 - Medication
- **Relationship**: Prescribed at encounters, treats conditions
- **Purpose**: Drug treatments and prescriptions
- **Cardinality**: Many per patient

### Level 6 - Procedure
- **Relationship**: Performed during encounters, treats conditions
- **Purpose**: Surgical and medical procedures
- **Cardinality**: Many per patient

### Level 7 - Observation
- **Relationship**: Recorded during encounters
- **Purpose**: Clinical measurements and findings
- **Cardinality**: Many per patient

### Level 8 - Document
- **Relationship**: Documents encounters
- **Purpose**: Medical letters and reports
- **Cardinality**: Many per patient

## Graph Visualization

### Viewing the Graph

Navigate to **Graph View** (`/medical-graph`) to see:

- **Color-coded nodes** by protocol level
- **Relationship edges** with labels
- **Hierarchical layout** (Level 1-8 from top to bottom)
- **Interactive nodes** (click to view details)
- **Statistics panel** with record counts

### Node Colors

- 🔵 Blue - Patient (L1)
- 🟣 Purple - Practitioner (L2)
- 🟢 Green - Encounter (L3)
- 🔴 Red - Condition (L4)
- 🟠 Orange - Medication (L5)
- 🔵 Cyan - Procedure (L6)
- 🔵 Teal - Observation (L7)
- ⚫ Slate - Document (L8)

### Graph Interactions

- **Click node**: View full record details
- **Hover node**: Highlight and change cursor
- **View connections**: See all relationships in detail panel
- **Refresh**: Reload graph data

## Best Practices

### 1. Seeding Data

```
Recommended order:
1. Seed test data first
2. System automatically syncs and validates
3. Review validation results
4. Verify in Graph View
```

### 2. Manual Record Entry

```
When adding records manually:
1. Start with Patient (L1)
2. Add Practitioners (L2)
3. Add Encounters (L3)
4. Add Conditions, Medications, Procedures (L4-6)
5. Add Observations and Documents (L7-8)
6. Run "Sync to All Protocols" from Patient tab
```

### 3. Data Integrity

```
- Always validate after major changes
- Clean orphaned edges regularly
- Export backups before bulk operations
- Use graph view to verify relationships
```

### 4. FHIR Compliance

```
- All records follow FHIR R4 standards
- Use standard coding systems (SNOMED CT, LOINC, RxNorm, CPT)
- Maintain proper resource references
- Validate exported bundles with FHIR validator
```

## Troubleshooting

### No Records After Seeding

**Problem**: Records don't appear after seeding
**Solution**:
1. Click "Refresh Data" in Actions menu
2. Check browser console for errors
3. Verify Supabase connection

### Validation Errors

**Problem**: Graph validation reports issues
**Solution**:
1. Review issues list in alert
2. Navigate to affected protocol tabs
3. Verify records exist
4. Re-run sync if needed

### Orphaned Edges

**Problem**: Edges point to deleted records
**Solution**:
1. System automatically detects orphaned edges
2. Use validation to identify issues
3. Manual cleanup: Delete and recreate affected records

### Export Fails

**Problem**: FHIR Bundle export doesn't work
**Solution**:
1. Check that patient record exists
2. Verify graph edges are created
3. Check browser console for errors
4. Try refreshing data first

## API Reference

### FHIRGraphSyncService Methods

```typescript
// Sync patient to all protocols
await fhirGraphSync.syncPatientToProtocols(patientId);

// Propagate patient data
await fhirGraphSync.propagatePatientData(patientId);

// Validate graph integrity
const validation = await fhirGraphSync.validateGraphIntegrity();

// Clean orphaned edges
const deletedCount = await fhirGraphSync.cleanOrphanedEdges();

// Get patient timeline
const timeline = await fhirGraphSync.getPatientTimeline(patientId);

// Export FHIR bundle
const bundle = await fhirGraphSync.exportFHIRBundle(patientId);
```

## Security & Privacy

- **Row Level Security**: All records protected by RLS
- **User Isolation**: Records separated by user_id
- **No Public Access**: All tables require authentication
- **HIPAA Ready**: Compliant security measures
- **Audit Trail**: Created/updated timestamps on all records

## Next Steps

1. **Seed the test data** to populate Simon Grange's records
2. **Explore the Graph View** to visualize relationships
3. **Try manual record entry** to understand the CRUD interface
4. **Export a FHIR Bundle** to see the standard format
5. **Build custom workflows** using the established graph

---

**Version**: 1.0.0
**Last Updated**: 2025-11-09
**FHIR Version**: R4
**Standards**: SNOMED CT, LOINC, RxNorm, CPT
