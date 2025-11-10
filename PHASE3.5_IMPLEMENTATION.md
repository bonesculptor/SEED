# Phase 3.5: Advanced Pipeline Builder Implementation Plan

## Overview

Implementation of advanced pipeline builder with business process integration, protocol governance hierarchy, and natural language interface.

## Protocol Governance Hierarchy

### Established Protocol Relationships

```
GCP (Governance Context Protocol)
  └─> ACP (Agent Context Protocol)
       └─> ECP (Ecosystem Context Protocol)
            └─> HCP (Human Context Protocol)
                 └─> BCP (Business Context Protocol)
                      └─> MCP (Machine Context Protocol)
                           └─> DCP (Data Context Protocol) ← Permissions from HCP & GCP
                           └─> TCP (Test Context Protocol)
```

### Protocol Flow Logic

1. **GCP Governs ACP**: All agent actions must be authorized by governance rules
2. **ACP within ECP**: Agents operate within ecosystem constraints (sustainability, resource limits)
3. **HCP Instructs BCP**: Human context defines business requirements
4. **BCP Initiates MCP**: Business processes trigger machine/AI operations
5. **HCP + GCP → DCP**: Data access requires human authorization AND governance approval

### Example Workflow

```
User Request (HCP)
  ↓
Authorization Check (GCP)
  ↓
Agent Selection (ACP - governed by GCP, within ECP constraints)
  ↓
Business Rules Applied (BCP - based on HCP requirements)
  ↓
Data Access Granted (DCP - permission from HCP & GCP)
  ↓
Processing Execution (MCP - implements BCP logic)
  ↓
Validation (TCP - ensures quality)
  ↓
Impact Tracking (ECP - monitors sustainability)
  ↓
Audit Log (GCP - records all actions)
```

## Business Process Integration

### From CSV Spreadsheet (PBD 1.1)

#### Core Operating Processes (1.0-6.0)
1. **1.0 - Develop Vision & Strategy** → HCP + BCP
2. **2.0 - Develop Products & Services** → BCP + MCP
3. **3.0 - Market & Sell** → BCP + HCP
4. **4.0 - Deliver Physical Products** → MCP + TCP
5. **5.0 - Deliver Services** → MCP + HCP
6. **6.0 - Manage Customer Service** → HCP + BCP

#### Management & Support Services (7.0-14.0)
7. **7.0 - Human Capital** → HCP
8. **8.0 - ICT Management** → MCP + DCP
9. **9.0 - Financial Resources** → BCP + GCP
10. **10.0 - Asset Management** → BCP + ECP
11. **11.0 - Risk & Compliance** → GCP
12. **12.0 - External Relationships** → HCP + BCP
13. **13.0 - Business Capabilities** → BCP + ACP
14. **14.0 - OSINT** → DCP + MCP

### Business Canvas Display (BCP Page)

The Business Context Protocol page will display:

1. **Customer Segments** (from CSV Category field)
2. **Value Propositions** (from Process descriptions)
3. **Channels** (from Layers field)
4. **Customer Relationships** (from User Stories)
5. **Revenue Streams** (from Business strategies 1.2.2.3-1.2.2.4)
6. **Key Resources** (from Standards field)
7. **Key Activities** (from Process names)
8. **Key Partners** (from External Relationships 12.0)
9. **Cost Structure** (from Financial Resources 9.0)

### HCP Business Functions List

From CSV Hierarchy:
- Strategy (1.0)
- Development (2.0)
- Marketing (3.0)
- Products (4.0)
- Services (5.0)
- Support (6.0)
- HR (7.0)
- ICT (8.0)
- Finance (9.0)
- Assets (10.0)
- Governance (11.0)
- Resources (12.0)
- Business (13.0)
- OSINT (14.0)

## Pre-built Workflow Templates

### Template 1: Strategic Planning Workflow
```
HCP (CEO Request: "Develop Vision")
  → GCP (Check Authorization)
    → BCP (1.1 - Define Business Concept)
      → MCP (Analyze Market Data)
        → DCP (Access Competitor Data - permission from HCP+GCP)
          → TCP (Validate Analysis)
            → HCP (Present Report to CEO)
```

### Template 2: Compliance Check Workflow
```
BCP (Business Process Initiated)
  → GCP (11.0 - Risk & Compliance Check)
    → ACP (Select Compliance Agent)
      → DCP (Access Regulatory Data - permission from GCP)
        → TCP (Validate Compliance)
          → GCP (Log Audit Trail)
            → ECP (Track Environmental Impact)
```

### Template 3: Customer Service Workflow
```
HCP (Customer Request)
  → GCP (Authorize Service)
    → GeoCP (Check Service Area)
      → BCP (6.0 - Customer Service Rules)
        → ACP (Route to Agent)
          → MCP (Process Request)
            → TCP (Quality Check)
              → HCP (Respond to Customer)
```

### Template 4: Sustainable Operations
```
BCP (Business Operation)
  → ECP (Environmental Impact Assessment)
    → GeoCP (Regional Regulations)
      → GCP (Compliance Check)
        → MCP (Optimize Resource Usage)
          → ECP (Track Carbon Footprint)
            → TCP (Validate Sustainability Goals)
```

## Natural Language Interface (LLM API Integration)

### User Input Examples

**Example 1:**
```
User: "I need to analyze our competitors and create a strategic report"

System Interprets:
- HCP: CEO role (from CSV user field)
- BCP: 1.1.1.1 - Identify competitors
- MCP: Generate competitor analysis
- DCP: Access competitor data (needs HCP+GCP permission)
- TCP: Validate report quality

Generated Pipeline:
HCP → GCP → BCP → DCP → MCP → TCP → HCP
```

**Example 2:**
```
User: "Check if our new product complies with European regulations"

System Interprets:
- BCP: Product compliance check
- GeoCP: European jurisdiction
- GCP: Regulatory requirements (11.0)
- ACP: Compliance agent selection
- TCP: Validation

Generated Pipeline:
BCP → GeoCP → GCP → ACP → TCP → GCP (audit log)
```

**Example 3:**
```
User: "What's the carbon footprint of our delivery operations?"

System Interprets:
- ECP: Environmental impact
- BCP: Delivery operations (4.0)
- MCP: Calculate footprint
- DCP: Access operations data
- TCP: Validate calculations

Generated Pipeline:
BCP → DCP → MCP → ECP → TCP
```

### LLM Prompt Template

```
You are an agent protocol orchestrator. Given a user request, generate a pipeline workflow.

Available Protocols:
- HCP: Human Context (users, roles, requests)
- BCP: Business Context (processes, rules)
- MCP: Machine Context (AI agents, processing)
- DCP: Data Context (data sources, access)
- TCP: Test Context (validation, quality)
- ACP: Agent Context (agent registry, capabilities)
- GCP: Governance Context (compliance, audit)
- GeoCP: Geographic Context (location, regulations)
- ECP: Ecosystem Context (sustainability, impact)

Business Processes Available: [from CSV]
- 1.1.1.1: Identify competitors
- 1.1.1.4: Political and regulatory issues
- 6.0: Manage Customer Service
[etc.]

Rules:
1. GCP must authorize ACP actions
2. ACP operates within ECP constraints
3. DCP access requires HCP + GCP permission
4. HCP requests drive BCP
5. BCP initiates MCP

User Request: "{user_input}"

Generate Pipeline: [protocol_chain with reasoning]
```

## Advanced Pipeline Canvas Features

### 1. Template Library
- Pre-built workflows for common tasks
- One-click template insertion
- Customizable templates
- Version control

### 2. Validation Rules
- Enforce GCP → ACP relationship
- Check HCP + GCP before DCP access
- Validate protocol combinations
- Circular dependency prevention

### 3. Visual Enhancements
- Color-coded protocol types
- Animated data flow
- Connection labels with data types
- Minimap for large pipelines
- Zoom and pan controls

### 4. Node Configuration
- Protocol-specific settings
- CSV process selection dropdowns
- User role assignment
- Permission matrix
- Output format selection

### 5. Execution Features
- Step-by-step execution
- Breakpoint support
- Real-time logs
- Performance metrics
- Error handling with rollback

## Export & Backup

### Export Formats

1. **JSON Pipeline Definition**
```json
{
  "name": "Strategic Planning",
  "version": "1.0.0",
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "created_by": "user@example.com",
    "business_process": "1.1.1",
    "protocols_used": ["HCP", "GCP", "BCP", "MCP", "DCP"]
  }
}
```

2. **RDF/Turtle Export**
```turtle
:pipeline1 a :Pipeline ;
  :name "Strategic Planning" ;
  :hasNode :node1, :node2 ;
  :implements :BusinessProcess_1_1_1 .

:node1 a :HCPNode ;
  :role "CEO" ;
  :action "Request Analysis" ;
  :connectsTo :node2 .
```

3. **Workspace Backup**
```
workspace_backup_2025-11-08.zip
├── pipelines/
│   ├── strategic-planning.json
│   ├── compliance-check.json
│   └── customer-service.json
├── protocols/
│   ├── hcp-instances.json
│   ├── bcp-instances.json
│   └── ...
├── business-processes/
│   └── pbd-1.1.csv
└── metadata.json
```

## Implementation Checklist

### Phase 3.5.1 - Business Process Integration
- [x] Parse CSV data
- [ ] Create BusinessProcessService
- [ ] Map processes to protocols
- [ ] Display Business Canvas on BCP page
- [ ] Show HCP function lists

### Phase 3.5.2 - Protocol Governance
- [ ] Implement GCP → ACP validation
- [ ] Add ACP ⊂ ECP constraints
- [ ] Create HCP + GCP → DCP permission system
- [ ] Visual governance indicators

### Phase 3.5.3 - Advanced Canvas
- [ ] Template library UI
- [ ] Drag-and-drop enhancements
- [ ] Node configuration panels
- [ ] Connection validation
- [ ] Execution controls

### Phase 3.5.4 - Natural Language Interface
- [ ] LLM API integration (OpenAI/Anthropic)
- [ ] Prompt engineering for pipeline generation
- [ ] Natural language to protocol mapping
- [ ] Intent recognition from CSV processes

### Phase 3.5.5 - Export & Backup
- [ ] JSON export
- [ ] RDF/Turtle export
- [ ] Workspace backup
- [ ] Import functionality
- [ ] Version control

## Database Updates Needed

```sql
-- Add governance relationships
CREATE TABLE protocol_governance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governed_protocol text NOT NULL,
  governing_protocol text NOT NULL,
  relationship_type text NOT NULL,
  constraints jsonb DEFAULT '{}'
);

-- Add pipeline templates
CREATE TABLE pipeline_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  template_data jsonb NOT NULL,
  is_system boolean DEFAULT false,
  created_by uuid REFERENCES user_profiles(id)
);

-- Add business process mappings
CREATE TABLE protocol_process_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_type text NOT NULL,
  pcf_id text NOT NULL,
  hierarchy_id text NOT NULL,
  process_name text NOT NULL,
  mapping_rules jsonb DEFAULT '{}'
);
```

## Next Steps

1. **Complete Phase 3.5.1**: Business process integration
2. **Implement governance rules**: GCP → ACP → ECP
3. **Build advanced canvas**: Templates + validation
4. **Add LLM integration**: Natural language to pipelines
5. **Create export system**: Backup and restore

**Timeline**: 2-3 development iterations
**Priority**: Governance rules + Business Canvas display

