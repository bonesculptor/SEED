# Project Management Guide

Complete guide to creating and managing projects with intelligent agent orchestration.

## 📋 Overview

The Project Creation system allows you to:
- Create projects (trips, medical records, etc.)
- Automatically assign agents to tasks
- Track progress in real-time
- Monitor agent performance with Ikigai scoring
- Use default protocol templates

## 🚀 Quick Start

### Access the System

1. Open the application
2. Navigate to **Case Studies → Create Project**

## 📖 Step-by-Step Guide

### Step 1: Select Project Type

**Available Templates**:

#### Trip Planning & Medical Records
Create a project for travel planning with medical record collection and transfer.

**Use Case**:
```
Scenario: Patient traveling abroad needs to transfer medical 
records to a hospital at destination

Tasks Created:
1. Collect traveler information (HCP)
2. Medical history assessment (HCP)  
3. Trip logistics planning (BCP - Business Canvas)
4. Data collection & validation (DCP - Data Mesh)
5. Medical record analysis (MCP - ML Canvas)
6. Privacy & compliance check (GCP - Governance)
7. Institution transfer preparation (DCP - Data Mesh)
```

### Step 2: Configure Project

**Project Name**:
```
Example: "Medical Transfer for Europe Trip - Patient: John Doe"
```

**Description**:
```
Example: "Collect and transfer medical records for 2-week trip 
to Switzerland. Ensure records are compatible with Swiss medical 
system and comply with GDPR/HIPAA regulations."
```

Click **"Create Project & Initialize Agents"**

The system automatically:
- ✅ Creates 7 tasks based on template
- ✅ Initializes Tier 1 agents (Monitor, Analyst, Planner, Executor, Knowledge)
- ✅ Creates Tier 2 Ensemble Governor
- ✅ Calculates initial Ikigai scores for all agents
- ✅ Sets up Data Mesh topics

### Step 3: Review Tasks

The system shows all tasks with:

**Task Information**:
- Task name and order
- Protocol assignment (HCP, BCP, MCP, DCP, GCP)
- Required agent tier (Tier 1, 2, or 3)

**Example Task**:
```
1. Collect Traveler Information
   Protocol: HCP (Human Context Protocol)
   Tier: TIER 1
   
   → Uses default HCP template
   → Collects: Name, DOB, Contact, Emergency contacts
```

### Step 4: Assign Agents

**Available Agents**:

#### Tier 1 Agents
1. **Monitor Agent**
   - Type: monitor
   - Capabilities: data_collection, validation, quality_check
   - Ikigai Score: ~80-90
   - Best for: Data collection, validation tasks

2. **Analyst Agent**
   - Type: analyst
   - Capabilities: pattern_recognition, risk_assessment, classification
   - Ikigai Score: ~75-85
   - Best for: Medical history assessment, analysis

3. **Planner Agent**
   - Type: planner
   - Capabilities: task_scheduling, resource_allocation, optimization
   - Ikigai Score: ~75-85
   - Best for: Trip logistics, planning

4. **Executor Agent**
   - Type: executor
   - Capabilities: data_transfer, record_creation, system_integration
   - Ikigai Score: ~70-85
   - Best for: Transfer preparation, execution

5. **Knowledge Agent**
   - Type: knowledge
   - Capabilities: documentation, storage, retrieval
   - Ikigai Score: ~75-85
   - Best for: Record storage, documentation

#### Tier 2 Ensemble
6. **Ensemble Governor**
   - Type: ensemble_governor
   - Coordinates all Tier 1 agents
   - Manages escalations and apoptosis
   - Ikigai Score: ~85

**Assignment Options**:

**Option A: Quick Assign**
- Click on agent card
- Click "Assign to: [Task Name]" button
- Agent is immediately assigned

**Option B: Drag and Drop** (Future enhancement)
- Drag agent to task
- Drop to assign

**Recommended Assignments**:
```
Task 1: Collect Traveler Information → Monitor Agent
Task 2: Medical History Assessment → Analyst Agent
Task 3: Trip Logistics Planning → Planner Agent
Task 4: Data Collection & Validation → Monitor Agent
Task 5: Medical Record Analysis → Analyst Agent (Tier 2 coordination)
Task 6: Privacy & Compliance Check → Analyst Agent
Task 7: Institution Transfer Preparation → Executor Agent
```

### Step 5: Monitor Progress

**Progress Dashboard Features**:

#### Overview Cards
```
┌─────────────────────────────────────────────────────┐
│ Total Tasks: 7                                       │
│ Completed: 0                                         │
│ In Progress: 0                                       │
│ Active Agents: 0                                     │
└─────────────────────────────────────────────────────┘
```

#### Task Progress Section

Each task shows:
- ✅ Protocol icon (Users, FileText, Brain, Database, Shield)
- ✅ Task name and description
- ✅ Assigned agent
- ✅ Status (Pending/In Progress/Completed)
- ✅ Progress bar (0-100%)
- ✅ Action buttons (Start task)

**Starting a Task**:
1. Ensure task has an assigned agent
2. Click the **Play** button
3. Watch progress bar fill
4. Task completes automatically after ~5 seconds (simulation)

#### Agent Status Section

Each agent displays:
- ✅ Agent name and type
- ✅ Tier level
- ✅ Current status (Idle/Working/Monitoring)
- ✅ Current task (if working)
- ✅ Ikigai score with visual bar
- ✅ Tasks completed count

**Ikigai Score Interpretation**:
```
🟢 80-100: Excellent performance (Continue)
🟡 60-79:  Good performance (Monitor closely)
🟠 30-59:  Declining performance (Throttle workload)
🔴 0-29:   Critical low (Apoptosis - terminate agent)
```

## 🎯 Default Protocol Templates

### Human Context Protocol (HCP)

Based on user intention and roles.

**Template Structure**:
```json
{
  "user_id": "UUID",
  "role": "patient/traveler/doctor",
  "intention": "transfer_medical_records",
  "context": {
    "name": "string",
    "dob": "date",
    "contact_info": "object",
    "emergency_contacts": "array"
  },
  "permissions": ["read", "write", "transfer"],
  "consent": true
}
```

### Business Context Protocol (BCP)

Based on **Outline Business Canvas** policy.

**Template Structure** (from image provided):
```
┌─────────────────────────────────────────────────┐
│ Business Model Canvas                            │
├─────────────────────────────────────────────────┤
│ Key Partners:                                    │
│ • Healthcare institutions                        │
│ • Travel agencies                                │
│ • Insurance providers                            │
│                                                  │
│ Key Activities:                                  │
│ • Medical record collection                      │
│ • Data validation                                │
│ • Secure transfer                                │
│                                                  │
│ Value Propositions:                              │
│ • Seamless medical record transfer               │
│ • HIPAA/GDPR compliant                           │
│ • Automated workflow                             │
│                                                  │
│ Customer Relationships:                          │
│ • 24/7 support                                   │
│ • Transparent tracking                           │
│                                                  │
│ Customer Segments:                               │
│ • International travelers                        │
│ • Medical tourists                               │
│ • Expats                                         │
│                                                  │
│ Channels:                                        │
│ • Web platform                                   │
│ • Mobile app                                     │
│ • API integration                                │
│                                                  │
│ Cost Structure:                                  │
│ • Infrastructure (cloud)                         │
│ • Compliance & security                          │
│ • Agent operation costs                          │
│                                                  │
│ Revenue Streams:                                 │
│ • Per-transfer fees                              │
│ • Subscription plans                             │
│ • Enterprise licensing                           │
└─────────────────────────────────────────────────┘
```

### Machine Context Protocol (MCP)

Based on **Machine Learning Canvas** policy.

**Template Structure** (from governance image):
```
Machine Learning Canvas:

1. Value Proposition:
   • Automated medical record analysis
   • Pattern recognition for risk assessment
   • Predictive compliance checking

2. Data Sources:
   • Patient medical records (EHR)
   • Lab results
   • Imaging data
   • Medication history

3. Features:
   • Demographics
   • Diagnosis codes (ICD-10)
   • Medication interactions
   • Compliance flags

4. Models:
   • Classification: Risk level
   • NLP: Extract medical entities
   • Recommendation: Transfer protocols

5. Predictions:
   • Compatibility with destination system
   • Missing information alerts
   • Compliance violations

6. Evaluation Metrics:
   • Accuracy: >95%
   • Precision/Recall
   • F1 Score
   • Compliance rate: 100%
```

### Data Context Protocol (DCP)

Based on **Data Mesh** architecture (from image provided).

**Template Structure**:
```
Data Mesh Architecture:

┌──────────────────────────────────────────────┐
│ Operational Data                              │
├──────────────────────────────────────────────┤
│ • Microservice: Medical Record Service        │
│ • Database: PostgreSQL                        │
│ • Messaging: Kafka                            │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Analytical Data                               │
├──────────────────────────────────────────────┤
│ • Events: Record_Created, Record_Updated     │
│ • Stream: Haystack-Traces                    │
│ • Storage: Cassandra                          │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Domain (Data Product)                         │
├──────────────────────────────────────────────┤
│ • Elastic Search: Full-text search           │
│ • Kafka: Event streaming                      │
│ • Haystack-Adaptive Alerting                  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Data Contract                                 │
├──────────────────────────────────────────────┤
│ Input Port: Operational/Analytical           │
│ Output Port: Data Model/ML Model             │
│                                              │
│ Contract includes:                            │
│ 1. Domain                                     │
│ 2. Data Product Name                          │
│ 3. Consumer and Use Case                      │
│ 4. Data Contract                              │
│ 5. SLA                                        │
│ 6. Data Product Architecture                  │
│ 7. Ubiquitous Language                        │
│ 8. Classification                             │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Data Product                                  │
├──────────────────────────────────────────────┤
│ • Ownership & Life Cycle                      │
│ • Transformation Code                         │
│ • Tests                                       │
│ • Documentation                               │
│ • Data Storage                                │
│ • Cost Management                             │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Self Serve Data Platform                      │
├──────────────────────────────────────────────┤
│ • Data Contract Management                    │
│ • Data Product Catalogue                      │
│ • Monitoring & Observatory                    │
│ • Storage Query Engine                        │
│ • Policy Automation                           │
└──────────────────────────────────────────────┘

Federated Governance:
• Interoperability Policy
• Documentation Policy
• Security Policy
• Privacy Policy
• Compliance Policy
```

**Kafka Topics Created**:
```
- workspace-{id}-tier1-monitor
- workspace-{id}-tier1-analyst
- workspace-{id}-tier1-planner
- workspace-{id}-tier1-executor
- workspace-{id}-tier2-ensemble
- workspace-{id}-tier3-digital-twin
- workspace-{id}-hotl-escalations
```

### Governance Context Protocol (GCP)

Based on **Governance Policy** (from Cynefin governance image).

**Template Structure**:
```
Cynefin Framework for Governance:

Level 0 - Oversight (Blue):
├─ Complete autonomy
├─ Seeing both/enlightenment
└─ Integration

Level B - Ecosystem Aware (Pink):
├─ Construct weave + witness/acting
├─ Identity
└─ Witness

Level 7 - Integration (Red):
├─ People telling stories
├─ Harmonize
└─ Persona

Level 6 - Alternative Interpretation (Peach):
├─ Collect data
├─ 1SoTs approach
└─ Persona 2 & Dashboard

Level 5 - Independent Machine Evaluation (Yellow):
├─ What do we think looks like?
├─ Object
└─ Disparate Observation

Level 4 - Boundary Crossing Shared (Tan):
├─ Second Person Perspective
└─ Informed

Level 3 - Basic Control Unit (Green):
├─ Memory needs to be in
├─ Correct
├─ Social Structure, Morality, Beauty
└─ Good Delivery (Baseline)

Level 2 - Connect
Level 1 - Survive (Baseline)

Decision Gates:
• Persona 1 → Informed
• What info affects people
• Answer: How people have feelings
• Social situations, Affective Empathy
• Goal: Back Today/Features

Policy Automation:
• Context mapping
• Policy automation triggers
• Federated governance enforcement
```

**Governance Policies Applied**:
1. **Interoperability**: Standards for data exchange
2. **Documentation**: Required metadata
3. **Security**: Encryption, access control
4. **Privacy**: GDPR, HIPAA compliance
5. **Compliance**: Audit trails, immutable logs

## 🔄 Complete Workflow Example

### Scenario: Medical Transfer for Europe Trip

**Step 1: Create Project**
```
Name: "Europe Trip - Medical Transfer"
Type: Trip Planning
Description: "Transfer medical records for 14-day Europe trip"
```

**Step 2: System Initializes**
```
✓ 7 tasks created
✓ 5 Tier 1 agents initialized
✓ 1 Tier 2 ensemble created
✓ Kafka topics set up
✓ Data contracts created
```

**Step 3: Assign Agents**
```
Monitor Agent → Task 1 (Collect Information)
Analyst Agent → Task 2 (Medical Assessment)
Planner Agent → Task 3 (Trip Logistics)
Monitor Agent → Task 4 (Data Validation)
Analyst Agent → Task 5 (Record Analysis)
Analyst Agent → Task 6 (Compliance Check)
Executor Agent → Task 7 (Transfer Prep)
```

**Step 4: Execute Tasks**
```
[Monitor Agent] Starting Task 1...
  ├─ HCP: Collect traveler information
  ├─ Validate required fields
  ├─ Progress: 0% → 20% → 40% → 60% → 80% → 100%
  └─ Status: Completed ✓

[Analyst Agent] Starting Task 2...
  ├─ HCP: Review medical history
  ├─ MCP: Analyze patterns
  ├─ Risk assessment: Low
  ├─ Progress: 0% → 100%
  └─ Status: Completed ✓

[Planner Agent] Starting Task 3...
  ├─ BCP: Business Canvas template
  ├─ Plan logistics
  ├─ Identify key partners
  ├─ Progress: 0% → 100%
  └─ Status: Completed ✓

[Monitor Agent] Starting Task 4...
  ├─ DCP: Data Mesh validation
  ├─ Check data completeness
  ├─ Verify data contracts
  ├─ Progress: 0% → 100%
  └─ Status: Completed ✓

[Analyst Agent] Starting Task 5...
  ├─ MCP: ML Canvas analysis
  ├─ Run classification model
  ├─ Extract medical entities
  ├─ Tier 2 coordination
  ├─ Progress: 0% → 100%
  └─ Status: Completed ✓

[Analyst Agent] Starting Task 6...
  ├─ GCP: Governance policy check
  ├─ GDPR compliance: ✓
  ├─ HIPAA compliance: ✓
  ├─ Privacy check: ✓
  ├─ Progress: 0% → 100%
  └─ Status: Completed ✓

[Executor Agent] Starting Task 7...
  ├─ DCP: Prepare data transfer
  ├─ Create data product
  ├─ Setup discovery port
  ├─ Generate transfer package
  ├─ Progress: 0% → 100%
  └─ Status: Completed ✓
```

**Step 5: Monitor Ikigai Scores**
```
Monitor Agent: 85.4 (Continue)
Analyst Agent: 78.2 (Monitor)
Planner Agent: 82.1 (Continue)
Executor Agent: 76.8 (Monitor)
Knowledge Agent: 80.5 (Continue)
Ensemble Governor: 88.0 (Continue)
```

**Step 6: Completion**
```
Project Status: Completed
Total Tasks: 7
Completed: 7
Success Rate: 100%
Average Ikigai: 81.8

Medical records successfully prepared for transfer to:
- Destination: Swiss Medical Center, Zurich
- Format: HL7 FHIR R4
- Encryption: AES-256
- Compliance: GDPR ✓, HIPAA ✓
```

## 📊 Protocol Integration Details

### HCP (Human Context)
```
{
  "protocol": "HCP",
  "version": "1.0",
  "user": {
    "id": "user-123",
    "role": "patient",
    "permissions": ["read", "write", "transfer"]
  },
  "context": {
    "intention": "medical_transfer",
    "urgency": "medium",
    "destination": "Switzerland"
  }
}
```

### BCP (Business Context)
```
{
  "protocol": "BCP",
  "version": "1.0",
  "business_model": "Outline Business Canvas",
  "value_proposition": "Seamless medical record transfer",
  "customer_segment": "International travelers",
  "key_activities": [
    "data_collection",
    "validation",
    "transfer"
  ],
  "revenue_model": "per_transfer_fee"
}
```

### MCP (Machine Context)
```
{
  "protocol": "MCP",
  "version": "1.0",
  "ml_canvas": {
    "value_proposition": "Automated analysis",
    "models": [
      {
        "type": "classification",
        "name": "risk_assessor",
        "accuracy": 0.96
      }
    ],
    "features": ["demographics", "diagnosis", "medications"],
    "predictions": ["compatibility", "missing_info", "compliance"]
  }
}
```

### DCP (Data Context)
```
{
  "protocol": "DCP",
  "version": "1.0",
  "data_mesh": {
    "domain": "medical_records",
    "data_product": "patient_transfer_package",
    "input_port": {
      "type": "operational",
      "kafka_topic": "medical-records-raw"
    },
    "output_port": {
      "type": "streaming",
      "kafka_topic": "medical-records-processed"
    },
    "data_contract": {
      "sla": {
        "freshness_seconds": 300,
        "completeness_threshold": 0.99,
        "accuracy_threshold": 1.0
      }
    }
  }
}
```

### GCP (Governance Context)
```
{
  "protocol": "GCP",
  "version": "1.0",
  "governance": {
    "cynefin_level": 3,
    "policies": [
      "interoperability",
      "documentation",
      "security",
      "privacy",
      "compliance"
    ],
    "compliance_checks": {
      "gdpr": true,
      "hipaa": true,
      "regional": ["swiss_data_protection"]
    },
    "audit_required": true
  }
}
```

## 🎯 Best Practices

### Agent Assignment
✅ **DO**:
- Assign Monitor agents to data collection tasks
- Assign Analyst agents to assessment and analysis
- Assign Planner agents to logistics and planning
- Assign Executor agents to transfer and execution
- Use Ensemble Governor for complex coordination

❌ **DON'T**:
- Over-assign agents (one task, one agent)
- Assign inappropriate agent types
- Ignore Ikigai scores < 60

### Task Execution
✅ **DO**:
- Execute tasks in sequence
- Monitor progress bars
- Watch for blocked status
- Check Ikigai scores regularly

❌ **DON'T**:
- Skip tasks
- Execute out of order
- Ignore low Ikigai warnings

### Protocol Usage
✅ **DO**:
- Use default templates as starting point
- Customize for specific needs
- Follow protocol structure
- Maintain compliance

❌ **DON'T**:
- Skip protocol steps
- Mix protocol contexts incorrectly
- Ignore governance policies

## 🚨 Troubleshooting

### Agent Not Assigning
**Solution**: Ensure agent tier matches task tier

### Task Stuck at 0%
**Solution**: Click "Start" button to begin execution

### Low Ikigai Score
**Solution**: 
- Review agent workload
- Consider throttling
- May need agent replacement

### Compliance Failure
**Solution**:
- Review GCP policies
- Check data completeness
- Verify encryption

## 📈 Metrics & KPIs

Track these metrics:
- Tasks completed / Total tasks
- Average Ikigai score
- Completion time per task
- Compliance pass rate
- Agent utilization

## 🔜 Coming Soon

- Custom project templates
- Advanced agent patterns
- Real-time collaboration
- External system integration
- Advanced analytics dashboard

---

**Ready to create your first project?** Go to Case Studies → Create Project!
