# Root and Branch Architecture Review

## Executive Summary

**Date**: 2025-11-10
**Status**: CRITICAL - System has become unstable due to architectural debt
**Recommendation**: Immediate refactoring required with focus on stability over features

---

## Critical Findings

### 1. DATABASE COMPLEXITY OVERLOAD

**Current State**: 78 tables across 7+ domain areas

**Categories**:
- Agent System: 9 tables
- FHIR Protocol: 9 tables
- GICS Industry: 1 table
- Cynefin Framework: 1 table
- Pipeline/Deploy: 3 tables
- Identity/Payment: 2 tables
- Blockchain/DID: 1 table
- Document System: 1 table
- Other/Unorganized: 51 tables

**Issues**:
- Too many tables for a single application
- Unclear boundaries between domains
- Multiple overlapping systems (HCP, Agent, Protocol)
- No clear data ownership model
- Excessive feature sprawl

**Impact**:
- Cannot maintain data consistency
- RLS policies become unmanageable
- Service layer is fragmented
- Graph sync breaks due to null/missing data
- Frontend cannot reliably fetch data

---

### 2. SERVICE LAYER FRAGMENTATION

**Current State**: 27+ service files

**Services Include**:
- fhirProtocolService
- fhirGraphSync
- personalMedicalRecordService
- documentExtractionService
- documentUploadService
- graphService
- protocolService
- ecosystemService
- ikigaiService
- cynefinService
- dataMeshService
- pipelineService
- stripeService
- identityVerificationService
- And 13+ more...

**Issues**:
- No clear service boundaries
- Duplicate functionality across services
- Tight coupling between unrelated domains
- No dependency injection or IoC container
- Services directly import Supabase client (breaks testing)
- Error handling is inconsistent
- No retry logic or circuit breakers

**Impact**:
- Cannot test services in isolation
- Changes cascade across unrelated features
- Debugging is nearly impossible
- Performance issues due to N+1 queries
- Race conditions in parallel operations

---

### 3. RLS POLICY CHAOS

**Current State**: Anonymous access allowed on medical data tables

**Critical Security Issues**:
```sql
-- FHIR tables allow ANONYMOUS INSERT and SELECT
"Anonymous users can create medications" (anon, INSERT)
"Anonymous users can view medications" (anon, SELECT)
"Anonymous users can create patient records" (anon, INSERT)
"Anonymous users can view patient records" (anon, SELECT)
"Anonymous users can create graph edges" (anon, INSERT)
"Anonymous users can view graph edges" (anon, SELECT)

-- Documents allow anonymous full access
"Allow anonymous access for demo" (anon, ALL)
```

**Issues**:
- Medical data is world-readable and writable
- No authentication required for sensitive operations
- User ownership not enforced
- Policies were added for "demo" purposes and never removed
- WITH CHECK clauses allow data to be created without proper validation

**Impact**:
- HIPAA/GDPR compliance violations
- Data can be corrupted by anyone
- No audit trail for who accessed what
- Cannot safely deploy to production
- Liability exposure

---

### 4. NULL/UNDEFINED DATA PROPAGATION

**Root Cause**: Schema allows NULL in critical fields

**Examples**:
- `node.label` can be NULL → crashes graph rendering
- `user_id` can be NULL → bypasses RLS policies
- `status` required but not validated → DB errors
- `medication_code` required but complex type → type mismatches

**Issues**:
- Frontend assumes data exists
- No validation at DB layer
- No validation at API layer
- No validation at service layer
- TypeScript types don't match DB schema
- Null coalescing operator missing throughout

**Impact**:
- Random crashes in visualization components
- "Cannot read property of null" errors
- Graph fails to render
- List views show incomplete data
- User experience is broken

---

### 5. OVER-ENGINEERING WITHOUT FOUNDATION

**Premature Abstractions**:
- Agent orchestration system (9 tables) - No agents implemented
- Pipeline deployment system (3 tables) - No pipelines running
- Cynefin framework classification - Not used anywhere
- Data mesh architecture - Single monolithic database
- Ikigai scoring system - No scoring logic
- Multi-tier agent hierarchy - No agent code exists

**Issues**:
- Built infrastructure before core features work
- Tables created "just in case"
- No clear use cases for 60% of tables
- Focus on buzzwords over stability
- Architecture astronauts syndrome

**Impact**:
- Maintenance burden for unused features
- Cannot understand what system actually does
- Core features break while maintaining unused tables
- New developers cannot onboard
- Technical debt compounds daily

---

## Root Causes

### 1. No Architectural Governance
- Features added without design review
- No ADR (Architecture Decision Records)
- No clear boundaries between domains
- No refactoring sprints planned

### 2. Feature Velocity Over Quality
- "Add more features" prioritized over "fix existing features"
- No test coverage
- No integration tests
- No error monitoring
- No performance benchmarks

### 3. Missing Foundation Patterns
- No repository pattern
- No unit of work pattern
- No domain models
- No value objects
- No aggregate roots
- Direct database access throughout

### 4. Absent DevOps Practices
- No CI/CD pipeline
- No automated tests
- No staging environment
- No rollback strategy
- No monitoring/alerting

---

## Proposed Solution: Back to Basics

### Phase 1: Stabilize Core (Week 1-2)

#### 1.1 Define Core Domain
**Keep Only**:
- Patient medical records (FHIR)
- Document storage
- Graph visualization
- Basic user accounts

**Archive/Delete**:
- Agent system (9 tables)
- Pipeline system (3 tables)
- HCP blockchain tables (12+ tables)
- Cynefin, Ikigai, Data Mesh tables
- GICS industry system
- Odoo integration
- 40+ unused tables

#### 1.2 Fix Security Immediately
**Migration: `fix_rls_policies.sql`**
```sql
-- Remove ALL anonymous access
DROP POLICY "Anonymous users can create patient records" ON fhir_patient_protocols;
DROP POLICY "Anonymous users can view patient records" ON fhir_patient_protocols;
DROP POLICY "Anonymous users can create medications" ON fhir_medication_protocols;
DROP POLICY "Anonymous users can view medications" ON fhir_medication_protocols;
DROP POLICY "Allow anonymous access for demo" ON document_files;

-- Add proper authenticated-only policies
CREATE POLICY "Users can only view own patient records"
  ON fhir_patient_protocols FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create own patient records"
  ON fhir_patient_protocols FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add user_id to ALL tables that lack it
ALTER TABLE fhir_medication_protocols ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE fhir_condition_protocols ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
-- ... repeat for all FHIR tables

-- Create index for performance
CREATE INDEX idx_fhir_patient_user_id ON fhir_patient_protocols(user_id);
```

#### 1.3 Fix NULL Handling
**Add NOT NULL constraints**:
```sql
-- Ensure critical fields cannot be NULL
ALTER TABLE fhir_patient_protocols ALTER COLUMN given_name SET DEFAULT 'Unknown';
ALTER TABLE fhir_patient_protocols ALTER COLUMN family_name SET DEFAULT 'Unknown';

-- Add database-level validation
ALTER TABLE fhir_medication_protocols
  ADD CONSTRAINT medication_text_not_empty
  CHECK (medication_text IS NOT NULL AND length(medication_text) > 0);
```

**Frontend: Add null guards everywhere**:
```typescript
// Before
const label = node.label.replace(...);

// After
const label = (node.label ?? 'Unknown').toString().replace(...);
```

#### 1.4 Simplify Service Layer
**Create 5 Core Services Only**:
```
src/services/
  ├── PatientService.ts      # CRUD for patients
  ├── MedicalRecordService.ts # CRUD for all FHIR resources
  ├── DocumentService.ts      # Upload/download/extract
  ├── GraphService.ts         # Build graph from FHIR data
  └── AuthService.ts          # User authentication
```

**Delete 20+ other services**

**Use Repository Pattern**:
```typescript
// New pattern
class MedicalRecordRepository {
  constructor(private db: SupabaseClient) {}

  async findByUserId(userId: string): Promise<MedicalRecord[]> {
    const { data, error } = await this.db
      .from('fhir_patient_protocols')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new RepositoryError(error);
    return data.map(row => this.toDomain(row));
  }

  private toDomain(row: any): MedicalRecord {
    // Map DB row to domain object with validation
    return new MedicalRecord({
      id: row.id,
      givenName: row.given_name ?? 'Unknown',
      familyName: row.family_name ?? 'Unknown',
      // ... with NULL handling
    });
  }
}
```

---

### Phase 2: Rebuild on Solid Foundation (Week 3-4)

#### 2.1 Domain-Driven Design
```
src/
  ├── domain/
  │   ├── patient/
  │   │   ├── Patient.ts           # Domain model
  │   │   ├── PatientRepository.ts # Interface
  │   │   └── PatientService.ts    # Business logic
  │   ├── medication/
  │   ├── condition/
  │   └── shared/
  │       ├── ValueObjects.ts      # Email, NHSNumber, etc.
  │       └── Errors.ts
  ├── infrastructure/
  │   ├── database/
  │   │   ├── SupabasePatientRepository.ts # Implementation
  │   │   └── migrations/
  │   └── external/
  │       └── PDFExtractionClient.ts
  ├── application/
  │   └── usecases/
  │       ├── CreatePatient.ts
  │       ├── UploadMedicalDocument.ts
  │       └── GenerateGraph.ts
  └── presentation/
      └── components/  # React components
```

#### 2.2 Add Testing
```typescript
// Unit tests for domain logic
describe('Patient', () => {
  it('should validate NHS number format', () => {
    expect(() => new NHSNumber('invalid')).toThrow();
    expect(new NHSNumber('450 437 4846').isValid()).toBe(true);
  });
});

// Integration tests for repositories
describe('PatientRepository', () => {
  it('should save and retrieve patient', async () => {
    const patient = new Patient({ ... });
    await repo.save(patient);
    const retrieved = await repo.findById(patient.id);
    expect(retrieved).toEqual(patient);
  });
});

// E2E tests for critical flows
describe('Document Upload Flow', () => {
  it('should extract FHIR records from PDF', async () => {
    await uploadDocument('medical-letter.pdf');
    const records = await getMedicalRecords();
    expect(records.length).toBeGreaterThan(0);
  });
});
```

#### 2.3 Add Observability
```typescript
// Structured logging
logger.info('Patient record created', {
  patientId: patient.id,
  userId: user.id
});

// Error tracking
Sentry.captureException(error, {
  tags: { component: 'DocumentUpload' },
  contexts: { user: { id: userId } }
});

// Performance monitoring
const span = tracer.startSpan('load-patient-graph');
try {
  const graph = await buildGraph(patientId);
  span.setStatus({ code: SpanStatusCode.OK });
} finally {
  span.end();
}
```

---

### Phase 3: Add Features Properly (Week 5+)

Only after Phases 1-2 complete:
- Agent orchestration (if needed)
- Blockchain anchoring (if needed)
- Advanced analytics (if needed)

**Each new feature requires**:
1. Architecture Decision Record (ADR)
2. Design document with clear boundaries
3. Test plan (unit + integration + e2e)
4. Migration plan
5. Rollback plan
6. Monitoring/alerting setup

---

## Immediate Action Items

### This Week (Week 1)

**Monday-Tuesday**:
- [ ] Create migration to remove anonymous RLS policies
- [ ] Add user_id to all FHIR tables
- [ ] Add NOT NULL constraints with defaults
- [ ] Deploy security fixes

**Wednesday-Thursday**:
- [ ] Archive 40+ unused tables
- [ ] Consolidate service layer to 5 core services
- [ ] Add null guards to all visualization components
- [ ] Fix graph rendering crashes

**Friday**:
- [ ] Add basic error boundaries to React app
- [ ] Add Sentry or error logging
- [ ] Write integration tests for seed flow
- [ ] Document simplified architecture

### Next Week (Week 2)

**Monday-Wednesday**:
- [ ] Refactor services to use repository pattern
- [ ] Create domain models for Patient, Medication, etc.
- [ ] Add validation layer
- [ ] Write unit tests for business logic

**Thursday-Friday**:
- [ ] Set up CI/CD pipeline
- [ ] Add test coverage reporting
- [ ] Create staging environment
- [ ] Load test critical paths

---

## Success Metrics

### Stability Metrics
- **Zero** null pointer exceptions in graphs
- **Zero** anonymous access to medical data
- **90%+** test coverage for core domains
- **<100ms** P99 latency for graph rendering
- **Zero** data loss incidents

### Quality Metrics
- All PRs require tests
- All migrations peer reviewed
- ADRs written for architectural decisions
- No tables added without justification
- Weekly refactoring time allocated

### User Experience Metrics
- Graph renders on first load 100% of time
- Document upload success rate >95%
- Seed data loads without errors 100% of time
- No crashes in production for 30 days

---

## Conclusion

**Current State**:
- 78 tables, 27 services, 93 TypeScript files
- Core features broken
- Security vulnerabilities
- Unstable foundation

**Target State**:
- 10-15 tables, 5 services, clean architecture
- Core features rock-solid
- Security-first design
- Stable, maintainable, testable

**Recommendation**:
**STOP adding features. FOCUS on stability.**

Implement Phase 1 immediately. The system cannot scale or be maintained in its current state. Every new feature added makes the problem exponentially worse.

We need to go back to basics, build a solid foundation, then grow carefully with proper architectural governance.

---

**Next Steps**: Review this document with team. Get buy-in for stability-first approach. Begin Phase 1 immediately.
