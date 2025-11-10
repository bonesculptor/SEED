# Quick Reference: New Protocol Types (ACP, GCP, GeoCP, ECP)

## Protocol Overview

The system now supports **9 protocol types** for comprehensive agent workflow composition:

### Original 5 Protocols (Phase 1)
1. **HCP** - Human Context Protocol
2. **BCP** - Business Context Protocol  
3. **MCP** - Machine Context Protocol
4. **DCP** - Data Context Protocol
5. **TCP** - Test Context Protocol

### New 4 Protocols (Phase 3)
6. **ACP** - Agent Context Protocol
7. **GCP** - Governance Context Protocol
8. **GeoCP** - Geographical Context Protocol
9. **ECP** - Ecosystem Context Protocol

---

## Agent Context Protocol (ACP)

**When to use:** Agent registration, discovery, and coordination

### Key Features
- Agent identity and metadata
- Capability definitions
- Communication protocols
- Lifecycle management
- Discovery and routing

### Example Use Cases
✅ Agent registry for microservices
✅ Capability-based agent selection
✅ Service mesh configuration
✅ Agent health monitoring
✅ Dynamic agent discovery

### Example Data
```json
{
  "agent_type": "autonomous",
  "agent_identity": {
    "agent_id": "agent-001",
    "name": "DataProcessor",
    "type": "processing"
  },
  "capabilities": [
    {
      "name": "Data Transformation",
      "type": "processing",
      "description": "Converts between formats"
    }
  ],
  "lifecycle_state": "active"
}
```

---

## Governance Context Protocol (GCP)

**When to use:** Compliance, auditing, and governance requirements

### Key Features
- Compliance rule enforcement
- Regulatory requirement tracking
- Audit trail logging
- Permission systems
- Risk assessment

### Example Use Cases
✅ GDPR compliance workflows
✅ SOC2 audit trails
✅ HIPAA data handling
✅ ISO 27001 controls
✅ Role-based access control

### Example Data
```json
{
  "governance_framework": "GDPR",
  "compliance_rules": [
    {
      "rule_id": "gdpr-001",
      "name": "Data Retention",
      "severity": "high"
    }
  ],
  "audit_trail": [
    {
      "timestamp": "2025-11-08T10:00:00Z",
      "action": "data_access",
      "actor": "user@example.com",
      "outcome": "success"
    }
  ]
}
```

---

## Geographical Context Protocol (GeoCP)

**When to use:** Location-based services and spatial operations

### Key Features
- Location coordinates and addresses
- Geographic boundaries (geofencing)
- Spatial queries
- Regional regulations
- Service area definitions

### Example Use Cases
✅ Delivery route optimization
✅ Geofencing alerts
✅ Regional service restrictions
✅ Location-based pricing
✅ Emergency service dispatch

### Example Data
```json
{
  "location_data": {
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "address": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    }
  },
  "geographic_boundaries": [
    {
      "boundary_id": "service-zone-1",
      "type": "circle",
      "coordinates": [...]
    }
  ]
}
```

---

## Ecosystem Context Protocol (ECP)

**When to use:** Sustainability and environmental impact tracking

### Key Features
- Carbon footprint calculation
- Sustainability metrics
- Resource usage monitoring
- ESG scoring
- Circular economy tracking

### Example Use Cases
✅ Carbon offset programs
✅ ESG reporting
✅ Green supply chain management
✅ Sustainability certifications
✅ Energy optimization

### Example Data
```json
{
  "environmental_impact": {
    "carbon_emissions_kg": 150.5,
    "water_usage_liters": 1000,
    "energy_consumption_kwh": 45.2
  },
  "sustainability_metrics": {
    "renewable_energy_percentage": 75,
    "waste_recycling_rate": 85,
    "sustainability_score": 8.5
  },
  "esg_scores": {
    "environmental": 8.5,
    "social": 7.5,
    "governance": 9.0
  }
}
```

---

## Protocol Interaction Examples

### Example 1: Governed Agent System
```
ACP (Agent Registry)
  → GCP (Authorization Check)
    → MCP (Agent Execution)
      → GCP (Audit Logging)
```

**Purpose**: Ensure all agent actions are authorized and audited

### Example 2: Location-Aware Service
```
HCP (User Request)
  → GeoCP (Location Validation)
    → BCP (Regional Business Rules)
      → MCP (Service Execution)
```

**Purpose**: Provide location-specific services with regional compliance

### Example 3: Sustainable Operations
```
BCP (Business Process)
  → ECP (Impact Calculation)
    → GeoCP (Regional Regulations)
      → ECP (Optimization)
        → TCP (Validation)
```

**Purpose**: Track and optimize environmental impact with compliance

### Example 4: Full Compliance Pipeline
```
HCP (User Action)
  → GCP (Authentication)
    → ACP (Agent Selection)
      → GeoCP (Location Check)
        → DCP (Data Access)
          → GCP (Data Governance)
            → MCP (Processing)
              → TCP (Quality Check)
                → ECP (Impact Tracking)
                  → GCP (Audit Trail)
```

**Purpose**: Complete governed workflow with full traceability

---

## When to Use Which Protocol

| Business Need | Primary Protocol | Supporting Protocols |
|---------------|-----------------|---------------------|
| User workflows | HCP | BCP, MCP |
| Agent systems | ACP | MCP, TCP |
| Compliance | GCP | All others |
| Location services | GeoCP | HCP, BCP |
| Sustainability | ECP | BCP, GeoCP |
| Data pipelines | DCP | MCP, TCP |
| Testing | TCP | MCP, DCP |
| Business logic | BCP | HCP, MCP |
| AI/ML execution | MCP | DCP, TCP |

---

## Integration with Existing Features

### With RDF Export (Phase 1)
- All new protocols export to RDF/Turtle
- Semantic web compatible
- Ontology extensions for new types
- Cross-protocol relationships in graph

### With Collaboration (Phase 2)
- Workspace-scoped protocol instances
- Real-time updates for new types
- Presence tracking in protocol editors
- ODOO integration ready

### With Pipeline Builder (Phase 3)
- Visual composition of all 9 types
- Drag-and-drop workflow creation
- Execution and monitoring
- Template patterns

---

## Quick Start: Creating Protocols

### ACP Example
```typescript
const agentContext = {
  acp_id: 'acp-001',
  title: 'My Agent',
  agent_type: 'autonomous',
  agent_identity: {
    agent_id: 'agent-001',
    name: 'DataBot',
    type: 'processing',
    version: '1.0.0'
  },
  capabilities: [{
    capability_id: 'cap-001',
    name: 'Transform Data',
    type: 'processing',
    description: 'JSON to CSV conversion'
  }],
  lifecycle_state: 'active'
};
```

### GCP Example
```typescript
const governanceContext = {
  gcp_id: 'gcp-001',
  title: 'GDPR Compliance',
  governance_framework: 'GDPR',
  compliance_rules: [{
    rule_id: 'gdpr-retention',
    name: 'Data Retention',
    framework: 'GDPR',
    severity: 'high',
    automated_check: true
  }],
  permission_system: {
    access_control_model: 'RBAC',
    roles: {
      'admin': ['read', 'write', 'delete'],
      'user': ['read']
    }
  }
};
```

### GeoCP Example
```typescript
const geographicalContext = {
  geocp_id: 'geocp-001',
  title: 'San Francisco Service Zone',
  location_data: {
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    address: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    }
  },
  service_areas: [{
    area_id: 'zone-1',
    name: 'Downtown SF',
    coverage_type: 'full'
  }]
};
```

### ECP Example
```typescript
const ecosystemContext = {
  ecp_id: 'ecp-001',
  title: 'Operations Footprint',
  environmental_impact: {
    carbon_emissions_kg: 150.5,
    water_usage_liters: 1000,
    energy_consumption_kwh: 45.2
  },
  sustainability_metrics: {
    renewable_energy_percentage: 75,
    waste_recycling_rate: 85,
    sustainability_score: 8.5
  },
  esg_scores: {
    environmental: 8.5,
    social: 7.5,
    governance: 9.0
  }
};
```

---

## Next Steps

Ready to discuss:
1. **Protocol Interactions** - How should these protocols communicate?
2. **Use Cases** - Specific workflows for your needs
3. **Data Flows** - Information passing between protocols
4. **Governance Rules** - Compliance requirements
5. **Integration** - ODOO and external system connections

**Phase 3 Complete!** Now let's explore how these protocols work together for your specific use cases.
