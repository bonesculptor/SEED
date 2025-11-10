# Case Studies: Planning Instrument & Medical Record Workflow

## Overview

Two complete interactive case studies demonstrating the Agent Protocol System in action.

## 🎯 Case Study 1: Planning Instrument

### Purpose
Break down any project into steps with automatic Cynefin classification and agent tier recommendations.

### Features
- ✅ Project definition (name, goal, type)
- ✅ Step-by-step breakdown
- ✅ Automatic Cynefin classification
- ✅ Agent tier recommendations
- ✅ Progress tracking
- ✅ Visual status indicators

### Access
**Menu**: Case Studies → Planning Instrument

### Use Cases
1. **Software Development**: Break down feature development
2. **Business Process**: Design new workflows
3. **Research Projects**: Plan investigation phases
4. **Product Launch**: Organize go-to-market steps
5. **Compliance Initiative**: Structure audit preparation

### Example Output

```
Project: Medical Record Management System

Step 1: Patient Data Collection
├─ Cynefin: Clear
├─ Tier: Tier 1 (Monitor Agent)
├─ Approach: Use best practices
└─ Status: ✅ Completed

Step 2: Analyze Medical History
├─ Cynefin: Complicated
├─ Tier: Tier 1 (Analyst Agent)
├─ Approach: Expert analysis
└─ Status: 🔄 In Progress

Step 3: Generate Care Plan
├─ Cynefin: Complex
├─ Tier: Tier 2 (Ensemble)
├─ Approach: Multi-agent collaboration
└─ Status: ⏸️ Pending

Progress: 1/3 Completed (33%)
```

---

## 🏥 Case Study 2: Medical Record Workflow

### Purpose
Interactive process map showing three-tier agent architecture with real-world healthcare workflow.

### Features
- ✅ Patient information input
- ✅ 12-step interactive process map
- ✅ Cynefin-based routing
- ✅ Three-tier agent execution
- ✅ HOTL (Human on the Loop) integration
- ✅ Real-time execution visualization
- ✅ Node data display

### Access
**Menu**: Case Studies → Medical Records

### Complete Process Flow

```
┌───────────────────────────────────────────────────────────────┐
│                     MEDICAL RECORD WORKFLOW                   │
└───────────────────────────────────────────────────────────────┘

[1] Patient Information Collection
    Type: Human Context (HCP)
    Input: Name, Age, Symptoms, History, Medications
    │
    ↓
[2] Monitor Agent: Validate Data
    Type: Tier 1 Agent
    Action: Check completeness, format validation
    Cynefin: Clear
    │
    ↓
[3] Store in EHR System
    Type: Data Context (DCP)
    Action: Persist to database
    Data Contract: Patient_Records_v1.0
    │
    ↓
[4] Analyst Agent: Assess Medical History
    Type: Tier 1 Agent
    Action: Pattern analysis, risk factors
    Cynefin: Complicated
    │
    ↓
[5] Cynefin Classification (Decision Point)
    Type: Decision
    Routes to: Clear / Complex / Chaotic
    │
    ├─────────────────┬─────────────────┐
    │                 │                 │
    ↓                 ↓                 ↓
[6] Clear Case    [7] Complex Case  [8] Chaotic Case
    Tier 1           Tier 2            Tier 3
    Standard         Ensemble          Digital Twin
    Protocol         Review            Simulation
    │                 │                 │
    │                 ↓                 │
    │            [10] HOTL              │
    │                Physician          │
    │                Review             │
    │                 │                 │
    └─────────────────┴─────────────────┘
                      │
                      ↓
[9] Executor Agent: Generate Care Plan
    Type: Tier 1 Agent
    Action: Create treatment recommendations
    │
    ↓
[11] Knowledge Agent: Update Record
     Type: Tier 1 Agent
     Action: Store care plan and rationale
     │
     ↓
[12] Patient Care Plan Delivered
     Type: Output
     Delivery: Secure to patient and care team
```

### Node Types Explained

#### 🔵 Human Context (HCP)
- **Color**: Blue
- **Purpose**: Human input and oversight
- **Examples**: Patient data entry, physician approval
- **Governance**: HCP initiates workflows

#### 🔷 Tier 1 Agents (Individual)
- **Color**: Cyan
- **Agents**: Monitor, Analyst, Planner, Executor, Knowledge
- **Purpose**: Execute specific tasks
- **Ikigai Scored**: Performance monitored
- **Domains**: Clear, Complicated

#### 🟣 Tier 2 Ensemble (Coordination)
- **Color**: Purple
- **Components**: Ensemble Governor, Graph Monitor
- **Purpose**: Multi-agent coordination
- **Use**: Complex problems
- **Features**: Apoptosis, Throttle, Rollback controls

#### 🟠 Tier 3 Digital Twin (Simulation)
- **Color**: Orange
- **Type**: Adaptive simulation
- **Purpose**: Predict outcomes, rapid response
- **Use**: Chaotic situations
- **Features**: Learning, adaptation, "what-if" analysis

#### 🟡 Data Context (DCP)
- **Color**: Yellow
- **Purpose**: Data storage and retrieval
- **Integration**: ODOO ERP, databases
- **Security**: Requires HCP + GCP permission

#### 🌸 Decision Point
- **Color**: Pink
- **Purpose**: Route based on classification
- **Logic**: Cynefin domain determines path
- **Branches**: Multiple downstream paths

#### 🟢 Output
- **Color**: Green
- **Purpose**: Final deliverable
- **Action**: Deliver to stakeholders
- **Audit**: Logged immutably

### Sample Patient Data

```javascript
{
  name: "John Doe",
  age: 45,
  symptoms: "Persistent cough for 2 weeks, mild fever, fatigue",
  medicalHistory: `
    - Type 2 diabetes (controlled)
    - Hypertension
    - Previous pneumonia 3 years ago
    - Allergies: Penicillin
  `,
  medications: `
    - Metformin 500mg twice daily
    - Lisinopril 10mg once daily
  `
}
```

### Execution Example

**Clear Case Path**:
```
Input: Routine annual checkup
↓
Cynefin: Clear (predictable, standard)
↓
Route: Tier 1 → Planner Agent
↓
Action: Apply clinical guidelines
↓
Output: Standard care plan
No physician review needed
```

**Complex Case Path**:
```
Input: Multiple chronic conditions
↓
Cynefin: Complex (many interacting factors)
↓
Route: Tier 2 → Ensemble Governor
↓
Action: Coordinate multiple agents
       - Analyst reviews history
       - Planner considers options
       - Executor simulates outcomes
↓
HOTL: Physician reviews and approves
↓
Output: Comprehensive care plan
```

**Chaotic Case Path**:
```
Input: Emergency situation
↓
Cynefin: Chaotic (crisis)
↓
Route: Tier 3 → Digital Twin
↓
Action: Rapid simulation
       - Predict critical outcomes
       - Identify stabilization steps
       - Generate immediate actions
↓
HOTL: Immediate physician involvement
↓
Output: Emergency protocol
```

### Ikigai Monitoring

Each Tier 1 agent shows Ikigai score:

```json
{
  "agent_id": "monitor-001",
  "agent_type": "monitor",
  "ikigai_score": 85.4,
  "love_score": 90,      // User feedback
  "passion_score": 80,   // Cost efficiency
  "mission_score": 85,   // Goal alignment
  "vocation_score": 85,  // Function performance
  "governance_action": "continue"
}
```

**Governance Actions**:
- Score > 70: **Continue** (optimal)
- Score 50-70: **Monitor** (observe)
- Score 30-50: **Throttle** (reduce load)
- Score < 30: **Apoptosis** (terminate)

### HOTL (Human on the Loop)

**Trigger Conditions**:
- Cynefin domain: Complex or Chaotic
- Ikigai score < 50
- High uncertainty detected
- Policy violation
- Manual escalation

**Human Decision**:
```
┌──────────────────────────────────────┐
│ Physician Review Required            │
│                                      │
│ Patient: John Doe, Age 45            │
│ Case Complexity: High                │
│ Ikigai Confidence: 62%               │
│                                      │
│ Proposed Care Plan:                  │
│ - Chest X-ray                        │
│ - Blood work (CBC, CMP)              │
│ - Follow-up in 1 week                │
│                                      │
│ [Veto]  [Modify]  [Approve]          │
└──────────────────────────────────────┘
```

**Outcomes**:
- **Approve**: Workflow continues
- **Veto**: Workflow stops, requires revision
- **Modify**: Adjustments made, re-submit

### Data Mesh Integration

**Kafka Topics**:
```
workspace-{id}-tier1-monitor    (Event data)
workspace-{id}-tier1-analyst    (Analytical data)
workspace-{id}-tier2-ensemble   (Command data)
workspace-{id}-hotl-escalations (Escalation events)
```

**Data Contract**:
```json
{
  "contract_name": "Patient_Records_Contract",
  "version": "1.0.0",
  "producer": "medical-record-system",
  "consumers": ["care-team", "analytics"],
  "input_port": "operational",
  "output_port": "streaming",
  "schema": {
    "patient_id": "uuid",
    "name": "string",
    "symptoms": "string[]",
    "diagnosis": "string",
    "care_plan": "object"
  },
  "sla": {
    "freshness": "< 60 seconds",
    "completeness": "> 95%",
    "accuracy": "> 99%"
  }
}
```

---

## 🎓 Learning Objectives

### Planning Instrument

Students will learn:
1. How to decompose complex projects
2. Cynefin classification in practice
3. Agent tier selection criteria
4. Progress tracking methods
5. Adaptive planning strategies

### Medical Workflow

Students will learn:
1. Three-tier agent architecture
2. Cynefin-based routing
3. HOTL escalation patterns
4. Ikigai-based governance
5. Data mesh operations
6. Process automation design

---

## 🔧 Customization Guide

### Adapting the Planning Instrument

**For Different Industries**:

**Finance**:
```javascript
projectType: 'finance'
cynefinKeywords: ['regulatory', 'compliance', 'risk', 'audit']
tierRecommendations: {
  clear: 'Tier 1 - Standard compliance checks',
  complicated: 'Tier 1 - Risk analysis',
  complex: 'Tier 2 - Multi-factor modeling',
  chaotic: 'Tier 3 - Crisis management'
}
```

**Manufacturing**:
```javascript
projectType: 'manufacturing'
cynefinKeywords: ['production', 'quality', 'efficiency', 'defect']
tierRecommendations: {
  clear: 'Tier 1 - Standard QC',
  complicated: 'Tier 1 - Six Sigma analysis',
  complex: 'Tier 2 - Process optimization',
  chaotic: 'Tier 3 - Emergency response'
}
```

### Adapting the Medical Workflow

**For Other Domains**:

**Customer Support**:
```
1. Customer submits ticket (HCP)
2. Monitor Agent: Check urgency (Tier 1)
3. Store in CRM (DCP)
4. Analyst Agent: Classify issue (Tier 1)
5. Cynefin routing (Decision)
6. Resolution path (Tier 1/2/3)
7. HOTL if complex (Human)
8. Ticket closed (Output)
```

**Supply Chain**:
```
1. Order received (HCP)
2. Monitor Agent: Validate order (Tier 1)
3. Store in ERP (DCP)
4. Analyst Agent: Check inventory (Tier 1)
5. Cynefin routing (Decision)
6. Fulfillment strategy (Tier 1/2/3)
7. HOTL if issues (Human)
8. Order shipped (Output)
```

---

## 📊 Metrics & Analytics

### Planning Instrument Metrics

- Total projects created
- Average steps per project
- Completion rate
- Cynefin domain distribution
- Tier usage statistics

### Medical Workflow Metrics

- Cases processed
- Average processing time
- Cynefin routing distribution
- HOTL escalation rate
- Ikigai score trends
- Agent performance by tier

---

## 🚀 Next Steps

1. **Try Both Case Studies**: Get hands-on experience
2. **Review Documentation**: Read USER_GUIDE.md
3. **Customize Workflows**: Adapt for your use case
4. **Monitor Performance**: Track Ikigai scores
5. **Scale Deployment**: Roll out to team

---

## 📚 Related Documentation

- **USER_GUIDE.md** - Step-by-step instructions
- **LOCALHOST_DEPLOYMENT.md** - Installation guide
- **ECOSYSTEM_CONFIGURATION_GUIDE.md** - Setup details
- **PHASE3_DOCUMENTATION.md** - Technical architecture

---

**Ready to explore?** Open the application and navigate to Case Studies!
