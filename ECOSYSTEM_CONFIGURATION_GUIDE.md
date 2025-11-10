# Ecosystem Configuration Guide

## Overview

Complete guide for configuring your business ecosystem, connecting ODOO ERP PostgreSQL database, and selecting appropriate agent patterns for your workflows.

## Table of Contents

1. [Agent Patterns (21 Types)](#agent-patterns)
2. [Ecosystem Context Setup](#ecosystem-context-setup)
3. [ODOO ERP Integration](#odoo-erp-integration)
4. [Intelligent Workflow Recommendations](#workflow-recommendations)
5. [Agent Pattern Selection Guide](#pattern-selection-guide)

---

## Agent Patterns

### Complete List of 21 Agent Patterns

Based on OBC Canvas (Inputs), ML Canvas/Ontology (Processes), and Data Mesh Canvas (Outputs):

#### 1. Prompt Chaining
- **Complexity**: Medium
- **Inputs**: Business goal broken into subtasks; constraints = scope, budget, time
- **Process**: Sequence tasks, dependency mapping, verification after each step
- **Outputs**: Chain execution log; task correctness contracts; lineage of prompts
- **Ontology**: task, dependency, validation
- **Use Cases**: Complex multi-step business processes, report generation with verification, strategic planning workflows
- **Compatible Protocols**: HCP, BCP, MCP, TCP

#### 2. Routing
- **Complexity**: Low
- **Inputs**: Need to classify incoming requests; constraints = domain coverage
- **Process**: Intent classification, thresholding, fallback logic
- **Outputs**: Routed message stream; metadata tags (intent, route taken)
- **Ontology**: intent, confidence, specialist
- **Use Cases**: Customer service routing, expert assignment, multi-department workflows
- **Compatible Protocols**: HCP, ACP, BCP

#### 3. Parallelization
- **Complexity**: High
- **Inputs**: High-volume task; cost vs latency trade-off
- **Process**: Fan-out across workers; merge/reduce stage
- **Outputs**: Partitioned outputs; merge log; QoS guarantees
- **Ontology**: partition, shard, reducer
- **Use Cases**: Bulk data processing, multi-source analysis, distributed computation
- **Compatible Protocols**: MCP, DCP, TCP

#### 4. Reflection
- **Complexity**: Medium
- **Inputs**: Stakeholder requires quality assurance; risk = errors
- **Process**: Critic model evaluates candidate outputs; revise loop
- **Outputs**: Improved artefacts; evaluation scores attached
- **Ontology**: critic, candidate, revision
- **Use Cases**: Document review, code quality checking, compliance validation
- **Compatible Protocols**: TCP, GCP, BCP

#### 5. Tool Use
- **Complexity**: Medium
- **Inputs**: Business need to integrate APIs/tools; governance = authorisation
- **Process**: Tool discovery, invocation, result validation
- **Outputs**: Data product enriched with external system outputs; provenance logs
- **Ontology**: tool, call, auth, result
- **Use Cases**: API integration, external data enrichment, system orchestration
- **Compatible Protocols**: MCP, GCP, DCP

#### 6. Planning
- **Complexity**: High
- **Inputs**: Complex goal with milestones; constraints = resources
- **Process**: Plan generation, scheduling, dependency tracking
- **Outputs**: Structured plan artefact; plan adherence metrics
- **Ontology**: milestone, dependency, horizon
- **Use Cases**: Project planning, strategic initiatives, resource allocation
- **Compatible Protocols**: BCP, HCP, GCP

#### 7. Multi-Self (Multi-Agent)
- **Complexity**: Expert
- **Inputs**: Need coordination of multiple roles; risk = misalignment
- **Process**: Role definition, orchestrator, shared memory
- **Outputs**: Logs of inter-role communications; team outcome trace
- **Ontology**: role, orchestrator, memory
- **Use Cases**: Team collaboration, complex workflows, distributed decision-making
- **Compatible Protocols**: ACP, HCP, BCP

#### 8. Memory Management
- **Complexity**: High
- **Inputs**: Need continuity over sessions; risk = context loss
- **Process**: Short/long-term store, retrieval, update
- **Outputs**: Memory snapshots; access API; audit of reads/writes
- **Ontology**: memory, retention, retrieval
- **Use Cases**: Long-running processes, user context preservation, learning systems
- **Compatible Protocols**: MCP, DCP, ACP

#### 9. Learning & Adaptation
- **Complexity**: Expert
- **Inputs**: Business KPI drift; changing environment
- **Process**: Feedback loops, parameter update, policy adaptation
- **Outputs**: Updated model parameters; adaptation log; delta report
- **Ontology**: feedback, policy, reward
- **Use Cases**: Performance optimization, adaptive systems, ML model updates
- **Compatible Protocols**: MCP, TCP, ECP

#### 10. Goal Monitoring
- **Complexity**: Low
- **Inputs**: KPIs with thresholds; constraints = SLA
- **Process**: Metric collection, drift detection, alerts
- **Outputs**: KPI dashboard feed; SLA compliance log
- **Ontology**: KPI, threshold, alert
- **Use Cases**: Performance monitoring, SLA tracking, business metrics
- **Compatible Protocols**: BCP, GCP, ECP

#### 11. Exceptions & Recovery
- **Complexity**: High
- **Inputs**: High availability required; risks = failure modes
- **Process**: Error classification, retry, fallback, escalation
- **Outputs**: Recovery log; error taxonomy dataset
- **Ontology**: error, recovery, fallback
- **Use Cases**: Production systems, critical workflows, fault tolerance
- **Compatible Protocols**: GCP, TCP, ACP

#### 12. Human-in-the-Loop (HITL)
- **Complexity**: Medium
- **Inputs**: Regulatory/ethical review requirement
- **Process**: Escalation to human, approval/rejection
- **Outputs**: Decision record; human notes; provenance link
- **Ontology**: review, decision, override
- **Use Cases**: Compliance approval, critical decisions, quality gates
- **Compatible Protocols**: HCP, GCP, BCP

#### 13. Retrieval (RAG)
- **Complexity**: Medium
- **Inputs**: Need to ground answers in data; sources defined
- **Process**: Ingest, embed, retrieve, rerank, cite
- **Outputs**: Curated chunks; retriever logs; citation set
- **Ontology**: document, embedding, passage, citation
- **Use Cases**: Knowledge base queries, documentation search, research assistance
- **Compatible Protocols**: DCP, MCP, HCP

#### 14. Inter-Self Comms
- **Complexity**: Expert
- **Inputs**: Multi-self pipeline; interop constraints
- **Process**: Protocol, message passing, coordination
- **Outputs**: Message bus logs; comms schema
- **Ontology**: message, channel, consensus
- **Use Cases**: Agent collaboration, distributed systems, service mesh
- **Compatible Protocols**: ACP, MCP, GeoCP

#### 15. Resource-Aware
- **Complexity**: High
- **Inputs**: Budget & latency constraints
- **Process**: Estimate cost/latency; route to low-cost model if possible
- **Outputs**: Usage reports; cost-benefit logs
- **Ontology**: budget, latency, trade-off
- **Use Cases**: Cost optimization, performance tuning, resource allocation
- **Compatible Protocols**: BCP, ECP, MCP

#### 16. Reasoning Techniques
- **Complexity**: Expert
- **Inputs**: Complex reasoning needed (math, logic)
- **Process**: Apply CoT, ToT, self-consistency
- **Outputs**: Reasoning traces; path evaluation logs
- **Ontology**: reasoning path, step, branch
- **Use Cases**: Complex calculations, logic puzzles, decision trees
- **Compatible Protocols**: MCP, TCP, HCP

#### 17. Evaluation & SLAs
- **Complexity**: Medium
- **Inputs**: Business need for measurable quality
- **Process**: Golden set tests, regression, SLA check
- **Outputs**: Eval reports; pass/fail signals
- **Ontology**: benchmark, test, SLA
- **Use Cases**: Quality assurance, testing, compliance validation
- **Compatible Protocols**: TCP, GCP, BCP

#### 18. Guardrails & Safety
- **Complexity**: High
- **Inputs**: Compliance (PII, injection)
- **Process**: Pattern check, sandbox, blocklist
- **Outputs**: Violation log; guardrail coverage dataset
- **Ontology**: guardrail, violation, block
- **Use Cases**: Security enforcement, compliance checking, content moderation
- **Compatible Protocols**: GCP, TCP, HCP

#### 19. Prioritisation
- **Complexity**: Low
- **Inputs**: Competing requests, scarce resources
- **Process**: Score = Value × Effort × Risk
- **Outputs**: Priority queue; decision audit
- **Ontology**: priority, score, rank
- **Use Cases**: Task scheduling, resource allocation, queue management
- **Compatible Protocols**: BCP, ACP, HCP

#### 20. Exploration
- **Complexity**: High
- **Inputs**: Early-stage discovery; little known
- **Process**: Probe, cluster, scan
- **Outputs**: Cluster map; exploratory dataset
- **Ontology**: cluster, probe, exploration
- **Use Cases**: Research, discovery, data mining
- **Compatible Protocols**: MCP, DCP, ECP

#### 21. MCP (Model Context Protocol)
- **Complexity**: Expert
- **Inputs**: Need for interoperability across agents/tools
- **Process**: Define context schema, send/receive contexts
- **Outputs**: Context packets; MCP schema adherence log
- **Ontology**: context, schema, interop
- **Use Cases**: Agent interoperability, tool integration, standard protocols
- **Compatible Protocols**: MCP, ACP, DCP

---

## Ecosystem Context Setup

### Step 1: Create Ecosystem Configuration

Navigate to **Enterprise Config → Ecosystem Setup → Ecosystem Context**

#### Required Information

**Configuration Name**: Unique identifier for your ecosystem
- Example: "Production Environment", "Development Setup"

**ERP System**: Select your enterprise resource planning system
- ODOO (recommended)
- SAP
- NetSuite
- Microsoft Dynamics
- Custom

**Industry**: Your business sector
- Examples: Manufacturing, Healthcare, Finance, Retail, Technology

**Company Size**: Scale of your organization
- Startup (1-50 employees)
- Small (51-250 employees)
- Medium (251-1,000 employees)
- Enterprise (1,000+ employees)

**Business Model**: How you operate
- B2B (Business to Business)
- B2C (Business to Consumer)
- B2B2C (Business to Business to Consumer)
- Marketplace
- SaaS (Software as a Service)

**Description**: Brief overview of your ecosystem

### Step 2: Complete Configuration

Once created, your ecosystem configuration:
- ✅ Links to Ecosystem Context Protocol (ECP)
- ✅ Links to Geographical Context Protocol (GeoCP)
- ✅ Provides context for all agent operations
- ✅ Enables intelligent workflow recommendations

---

## ODOO ERP Integration

### Step 1: Navigate to ODOO Integration

Go to **Enterprise Config → Ecosystem Setup → ODOO Integration**

### Step 2: ODOO API Connection

#### Required Fields

**Integration Name**: Identifier for this connection
- Example: "Production ODOO Instance"

**ODOO URL**: Your ODOO instance URL
- Format: `https://your-company.odoo.com`
- Example: `https://example.odoo.com`

**Database Name**: ODOO database identifier
- Usually your company name or subdomain
- Example: `example_production`

**Username**: ODOO user account
- Admin or API user recommended
- Example: `admin@example.com`

**API Key**: ODOO API authentication key
- Generate in ODOO: Settings → Users → API Keys
- Keep secure - stored encrypted

### Step 3: PostgreSQL Direct Connection (Optional)

For direct database access:

**PostgreSQL Host**: Database server address
- Localhost: `localhost` or `127.0.0.1`
- Remote: `db.example.com`

**PostgreSQL Port**: Database port (default: 5432)

**Database Name**: PostgreSQL database name
- Usually same as ODOO database

**Username**: PostgreSQL user
- Example: `odoo` or `postgres`

**Password**: PostgreSQL password
- Stored encrypted

**SSL Enabled**: Use encrypted connection (recommended: Yes)

### Step 4: Test Connection

Click **Test Connection** to verify:
- ✅ ODOO API accessibility
- ✅ Authentication successful
- ✅ Database connectivity (if configured)
- ✅ Proper permissions

### ODOO API Endpoints

The system automatically configures these endpoints:

```
/api/v1/models          # Access ODOO models
/api/v1/search          # Search records
/api/v1/read            # Read records
/api/v1/create          # Create records
/api/v1/write           # Update records
/api/v1/unlink          # Delete records
```

### Common ODOO Tables to Integrate

- `res.partner` - Customers/Vendors
- `product.product` - Products
- `sale.order` - Sales Orders
- `purchase.order` - Purchase Orders
- `account.invoice` - Invoices
- `stock.picking` - Inventory Movements
- `hr.employee` - Employees
- `project.project` - Projects
- `crm.lead` - CRM Leads

---

## Workflow Recommendations

### Intelligent Agent Pattern Selection

The system recommends agent patterns based on your goals.

### How It Works

1. **Describe Your Goal**: Enter what you want to accomplish
2. **Context Analysis**: System analyzes keywords and business process
3. **Pattern Matching**: Matches to appropriate agent patterns
4. **Confidence Score**: Shows how confident the recommendation is
5. **Alternatives**: Suggests alternative patterns

### Example Recommendations

**Goal**: "Route customer support tickets to appropriate departments"
- **Recommended**: Routing Pattern (Confidence: 95%)
- **Reasoning**: Routing pattern is ideal for classifying and directing requests
- **Alternatives**: Prioritisation, Multi-Self

**Goal**: "Process 10,000 customer records in parallel"
- **Recommended**: Parallelization Pattern (Confidence: 98%)
- **Reasoning**: Parallelization enables concurrent processing for high-volume tasks
- **Alternatives**: Resource-Aware, Multi-Self

**Goal**: "Ensure GDPR compliance in all data operations"
- **Recommended**: Guardrails & Safety Pattern (Confidence: 90%)
- **Reasoning**: Guardrails pattern ensures compliance and regulatory adherence
- **Alternatives**: Human-in-the-Loop, Evaluation & SLAs

**Goal**: "Search company knowledge base for answers"
- **Recommended**: Retrieval (RAG) Pattern (Confidence: 92%)
- **Reasoning**: RAG pattern retrieves and grounds answers in your knowledge base
- **Alternatives**: Tool Use, Memory Management

**Goal**: "Coordinate multiple AI agents for complex workflow"
- **Recommended**: Multi-Self Pattern (Confidence: 88%)
- **Reasoning**: Multi-Self pattern coordinates multiple agents for collaborative workflows
- **Alternatives**: Inter-Self Comms, Planning

---

## Pattern Selection Guide

### By Use Case

**Customer Service**
- Routing (classify tickets)
- Human-in-the-Loop (escalation)
- Retrieval RAG (knowledge base)

**Data Processing**
- Parallelization (bulk operations)
- Memory Management (session continuity)
- Exceptions & Recovery (error handling)

**Compliance & Security**
- Guardrails & Safety (security enforcement)
- Evaluation & SLAs (quality assurance)
- Human-in-the-Loop (approval workflows)

**Planning & Strategy**
- Planning (project management)
- Goal Monitoring (KPI tracking)
- Reflection (quality review)

**Integration & Interoperability**
- Tool Use (API integration)
- MCP (agent communication)
- Inter-Self Comms (distributed systems)

**Optimization**
- Resource-Aware (cost optimization)
- Learning & Adaptation (continuous improvement)
- Prioritisation (resource allocation)

**Research & Discovery**
- Exploration (data mining)
- Retrieval RAG (research assistance)
- Reasoning Techniques (complex analysis)

### By Complexity

**Low Complexity** (Quick setup, immediate use)
- Routing
- Goal Monitoring
- Prioritisation

**Medium Complexity** (Moderate setup, some configuration)
- Prompt Chaining
- Reflection
- Tool Use
- Human-in-the-Loop
- Retrieval RAG
- Evaluation & SLAs

**High Complexity** (Advanced setup, careful planning)
- Parallelization
- Planning
- Memory Management
- Exceptions & Recovery
- Resource-Aware
- Guardrails & Safety
- Exploration

**Expert** (Complex systems, specialized knowledge)
- Multi-Self (Multi-Agent)
- Learning & Adaptation
- Inter-Self Comms
- Reasoning Techniques
- MCP

### By Protocol Compatibility

**Human Context Protocol (HCP)**
- Routing, Planning, Multi-Self, Human-in-the-Loop, Retrieval RAG, Prioritisation

**Business Context Protocol (BCP)**
- Prompt Chaining, Routing, Reflection, Planning, Goal Monitoring, Evaluation & SLAs

**Machine Context Protocol (MCP)**
- Prompt Chaining, Parallelization, Tool Use, Memory Management, Learning & Adaptation

**Data Context Protocol (DCP)**
- Parallelization, Tool Use, Memory Management, Retrieval RAG, Exploration

**Test Context Protocol (TCP)**
- Prompt Chaining, Parallelization, Reflection, Learning & Adaptation, Evaluation & SLAs

**Agent Context Protocol (ACP)**
- Routing, Multi-Self, Memory Management, Exceptions & Recovery, Inter-Self Comms

**Governance Context Protocol (GCP)**
- Reflection, Tool Use, Planning, Goal Monitoring, Guardrails & Safety

**Geographic Context Protocol (GeoCP)**
- Inter-Self Comms

**Ecosystem Context Protocol (ECP)**
- Goal Monitoring, Learning & Adaptation, Resource-Aware, Exploration

---

## Creating Agent Instances

### Step 1: Select Pattern

From the **Agent Patterns** tab, click on desired pattern

### Step 2: Configure Instance

**Instance Name**: Unique identifier
- Example: "Customer Support Router", "Invoice Processor"

**Description**: Purpose and scope

**Configuration**: Pattern-specific settings
- Depends on pattern selected
- Examples: thresholds, endpoints, rules

**Link to ODOO**: Select ODOO integration (if needed)

**Link to Pipeline**: Connect to workflow pipeline (optional)

### Step 3: Activate

Change status to **Active** to enable

### Step 4: Monitor

Track:
- Execution count
- Success rate
- Average duration
- Error logs

---

## Integration Examples

### Example 1: Customer Support Routing

**Business Need**: Automatically route support tickets to correct department

**Configuration**:
1. **Ecosystem Context**: Customer service department, B2C business
2. **ODOO Integration**: Connect to `helpdesk.ticket` table
3. **Agent Pattern**: Routing
4. **Configuration**:
   ```json
   {
     "classification_rules": {
       "billing": ["invoice", "payment", "charge"],
       "technical": ["bug", "error", "not working"],
       "sales": ["upgrade", "pricing", "features"]
     },
     "confidence_threshold": 0.7,
     "fallback_department": "general_support"
   }
   ```

**Protocol Flow**:
```
HCP (Customer submits ticket)
→ BCP (Support workflow initiated)
→ Routing Pattern (Classify intent)
→ DCP (Update ODOO ticket record)
→ HCP (Notify assigned department)
```

### Example 2: Invoice Processing

**Business Need**: Validate and process invoices with compliance checks

**Configuration**:
1. **Ecosystem Context**: Finance department, enterprise
2. **ODOO Integration**: Connect to `account.invoice` table
3. **Agent Patterns**: Prompt Chaining + Reflection + Guardrails
4. **Configuration**:
   ```json
   {
     "steps": [
       "Extract invoice data",
       "Validate against PO",
       "Check compliance (SOX)",
       "Calculate taxes",
       "Generate approval request"
     ],
     "quality_threshold": 0.95,
     "compliance_frameworks": ["SOX", "GAAP"]
   }
   ```

**Protocol Flow**:
```
BCP (Invoice received)
→ Prompt Chaining (Multi-step processing)
→ DCP (Fetch PO data from ODOO)
→ GCP (Compliance check)
→ Reflection (Quality validation)
→ Guardrails & Safety (Final compliance)
→ HCP (Human approval if threshold not met)
→ DCP (Update ODOO invoice status)
```

### Example 3: Inventory Optimization

**Business Need**: Optimize inventory levels based on demand forecasting

**Configuration**:
1. **Ecosystem Context**: Supply chain, manufacturing
2. **ODOO Integration**: Connect to `stock.quant`, `sale.order.line`
3. **Agent Patterns**: Learning & Adaptation + Goal Monitoring + Resource-Aware
4. **Configuration**:
   ```json
   {
     "forecast_horizon_days": 90,
     "reorder_threshold": "dynamic",
     "cost_optimization": true,
     "sustainability_targets": {
       "reduce_waste": 0.15,
       "carbon_footprint": "minimize"
     }
   }
   ```

**Protocol Flow**:
```
DCP (Fetch inventory & sales data from ODOO)
→ MCP (ML model forecasts demand)
→ Learning & Adaptation (Update model parameters)
→ Resource-Aware (Optimize costs)
→ ECP (Check sustainability impact)
→ Goal Monitoring (Track KPIs)
→ BCP (Generate reorder recommendations)
→ DCP (Update ODOO stock rules)
```

---

## Best Practices

### Ecosystem Configuration

1. **Start Simple**: Begin with basic configuration, expand as needed
2. **Test Connections**: Always test ODOO connection before production use
3. **Secure Credentials**: Use API keys, not passwords when possible
4. **Document Context**: Provide detailed descriptions for team understanding
5. **Regular Updates**: Keep ERP version and configuration current

### Agent Pattern Selection

1. **Match Complexity**: Choose pattern complexity appropriate for your team
2. **Start Low**: Begin with low-complexity patterns, graduate to expert
3. **Combine Patterns**: Use multiple patterns in workflows for best results
4. **Monitor Performance**: Track success rates and adjust configurations
5. **Get Recommendations**: Use intelligent recommendations for guidance

### ODOO Integration

1. **Secure Access**: Use dedicated API user with minimal required permissions
2. **SSL/TLS**: Always use encrypted connections
3. **Rate Limiting**: Respect API rate limits (default: 60/minute)
4. **Error Handling**: Implement retry logic for transient failures
5. **Audit Logging**: Enable comprehensive logging for compliance

### Protocol Integration

1. **Follow Hierarchy**: Respect GCP → ACP → ECP governance
2. **Dual Permission**: DCP access requires HCP + GCP authorization
3. **Validate Outputs**: Use TCP for quality assurance
4. **Track Impact**: Use ECP for sustainability monitoring
5. **Human Oversight**: Use HCP for critical decisions

---

## Troubleshooting

### ODOO Connection Issues

**Problem**: "Connection failed"
- Check ODOO URL is correct and accessible
- Verify API key is valid (regenerate if needed)
- Confirm user has API access enabled
- Check network/firewall settings

**Problem**: "Authentication failed"
- Verify username and password/API key
- Check user account is active in ODOO
- Confirm user has proper permissions

**Problem**: "Database not found"
- Verify database name matches ODOO instance
- Check user has access to specified database
- Confirm multi-database setup if applicable

### PostgreSQL Connection Issues

**Problem**: "Cannot connect to PostgreSQL"
- Verify host and port are correct
- Check PostgreSQL is accepting remote connections
- Confirm pg_hba.conf allows your IP
- Verify SSL settings match server configuration

**Problem**: "Permission denied"
- Check PostgreSQL user permissions
- Verify user can access ODOO database
- Confirm user has SELECT/INSERT/UPDATE rights

### Agent Pattern Issues

**Problem**: "Pattern not working as expected"
- Review pattern configuration
- Check input data format
- Verify all required protocols are active
- Review execution logs for errors

**Problem**: "Low success rate"
- Adjust confidence thresholds
- Review and update configuration
- Check data quality
- Consider different pattern

---

## Support Resources

**Documentation**:
- ECOSYSTEM_CONFIGURATION_GUIDE.md (this file)
- ENTERPRISE_DEPLOYMENT_GUIDE.md
- PHASE3.5_IMPLEMENTATION.md
- NEW_PROTOCOLS_GUIDE.md

**Database Tables**:
- `agent_patterns` - 21 standard patterns
- `ecosystem_configurations` - Your ecosystem settings
- `odoo_integrations` - ERP connections
- `workflow_recommendations` - Intelligent suggestions
- `agent_pattern_instances` - Active agents

**UI Paths**:
- Enterprise Config → Ecosystem Setup
- Enterprise Config → ODOO Integration
- Enterprise Config → Agent Patterns

---

**Status**: Ecosystem configuration system ready for use

**Next Steps**:
1. Create ecosystem configuration
2. Connect ODOO ERP
3. Select agent patterns
4. Create agent instances
5. Build workflows

**Recommendation**: Start with low-complexity patterns (Routing, Goal Monitoring) and progress to more advanced patterns as you gain experience.
