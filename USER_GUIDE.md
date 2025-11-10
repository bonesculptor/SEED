# User Guide: Planning Instrument & Medical Record Workflow

Complete guide to using the Planning Instrument and Medical Record Management case study.

## 📋 Table of Contents

1. [Planning Instrument](#planning-instrument)
2. [Medical Record Workflow](#medical-record-workflow)
3. [How Cynefin Classification Works](#how-cynefin-classification-works)
4. [Understanding Agent Tiers](#understanding-agent-tiers)
5. [Process Map Configuration](#process-map-configuration)
6. [Best Practices](#best-practices)

---

## Planning Instrument

### Overview

The Planning Instrument helps you break down any project into manageable steps with automatic Cynefin classification and agent tier recommendations.

### Accessing the Tool

1. Open the application
2. Navigate to **Case Studies → Planning Instrument**

### Step-by-Step Usage

#### 1. Define Your Project

**Project Name**:
```
Example: "Medical Record Management System"
Example: "Customer Support Automation"
Example: "Inventory Optimization"
```

**Project Goal**:
```
Example: "Create a secure system for collecting, analyzing, and managing patient medical records with AI-assisted diagnosis support"
```

**Project Type**:
- General Project
- Medical/Healthcare
- Finance
- Manufacturing
- Technology

#### 2. Add Project Steps

Click **"Add Project Step"** button and provide:

**Step Title**:
```
Example: "Validate patient data completeness"
```

**Step Description**:
```
Example: "Check that all required fields are filled, verify data formats, ensure no duplicates"
```

The system automatically:
- ✅ Classifies the step using Cynefin model
- ✅ Recommends appropriate agent tier
- ✅ Suggests approach (best/good/emergent/novel practices)

#### 3. Track Progress

**Status Options**:
- **Pending** (gray) - Not started
- **In Progress** (blue, animated) - Currently working
- **Completed** (green) - Finished

**Actions**:
- Click **"Start"** to move from Pending → In Progress
- Click **"Complete"** to move from In Progress → Completed

#### 4. Follow Recommendations

Each step shows:

**Cynefin Domain** (color-coded):
- 🟢 **Clear** - Use standard procedures
- 🔵 **Complicated** - Analyze with experts
- 🟡 **Complex** - Experiment and probe
- 🔴 **Chaotic** - Act quickly to stabilize

**Agent Tier**:
- **Tier 1** - Individual agents (Monitor, Analyst, Planner, Executor)
- **Tier 2** - Ensemble coordination
- **Tier 3** - Digital Twin simulation

**Recommended Approach**:
```
Clear: "Use standard procedures and best practices"
Complicated: "Analyze with experts, apply good practices"
Complex: "Experiment, probe and sense patterns"
Chaotic: "Act quickly to stabilize, then assess"
```

### Example Project Breakdown

**Project**: Medical Record Management System

**Step 1**: Patient Information Collection
- Domain: Clear (standard data collection)
- Tier: Tier 1 (Monitor Agent)
- Approach: Use best practices (forms, validation)

**Step 2**: Analyze Medical History
- Domain: Complicated (requires expertise)
- Tier: Tier 1 (Analyst Agent)
- Approach: Expert analysis, pattern recognition

**Step 3**: Generate Treatment Plan
- Domain: Complex (many variables, emergent)
- Tier: Tier 2 (Ensemble coordination)
- Approach: Multi-agent collaboration, experimentation

**Step 4**: Emergency Case Handling
- Domain: Chaotic (rapid response needed)
- Tier: Tier 3 (Digital Twin simulation)
- Approach: Act immediately, stabilize, then assess

---

## Medical Record Workflow

### Overview

An interactive process map demonstrating real-world application of the three-tier agent architecture with Cynefin classification and HOTL (Human on the Loop) escalation.

### Accessing the Workflow

1. Navigate to **Case Studies → Medical Records**
2. You'll see the full interactive process map

### Process Flow

```
┌─────────────────────────────────────┐
│ Step 1: Patient Data Collection    │ ← Human Context (HCP)
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Step 2: Monitor Agent Validates     │ ← Tier 1 Agent
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Step 3: Store in EHR System         │ ← Data Context (DCP)
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Step 4: Analyst Agent Reviews       │ ← Tier 1 Agent
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Step 5: Cynefin Classification      │ ← Decision Point
└──────┬──────┬──────┬────────────────┘
       ↓      ↓      ↓
   Clear  Complex  Chaotic
       ↓      ↓      ↓
    Tier1  Tier2  Tier3
       ↓      ↓      ↓
       └──────┴──────┘
               ↓
┌─────────────────────────────────────┐
│ Final: Care Plan Delivered          │ ← Output
└─────────────────────────────────────┘
```

### Using the Workflow

#### Step 1: Enter Patient Information

Fill in the form:

**Patient Name**:
```
John Doe
```

**Age**:
```
45
```

**Symptoms**:
```
Persistent cough for 2 weeks, mild fever, fatigue
```

**Medical History**:
```
Type 2 diabetes (controlled), hypertension
Previous pneumonia 3 years ago
Allergies: Penicillin
```

**Current Medications**:
```
Metformin 500mg twice daily
Lisinopril 10mg once daily
```

Click **"Submit Patient Information"**

#### Step 2: Execute Process Nodes

Each node in the process map has an **"Execute"** button when it's ready.

**Node Types** (color-coded):

🔵 **Human Context (HCP)**:
- Patient input
- Physician review (HOTL)
- Blue background

🔷 **Tier 1 Agents**:
- Monitor, Analyst, Planner, Executor, Knowledge
- Cyan background
- Individual agent operations

🟣 **Tier 2 Ensemble**:
- Multi-agent coordination
- Ensemble Governor
- Purple background

🟠 **Tier 3 Digital Twin**:
- Predictive simulation
- Orange background
- Used for chaotic cases

🟡 **Data Context (DCP)**:
- Data storage/retrieval
- Yellow background
- Database operations

🌸 **Decision Point**:
- Cynefin classification
- Pink background
- Routes to appropriate tier

🟢 **Output**:
- Final deliverable
- Green background

#### Step 3: Observe Automation

Watch as:
1. Monitor Agent validates data quality
2. Data is stored in EHR system
3. Analyst Agent assesses medical history
4. Cynefin classifier determines case complexity
5. Appropriate tier handles the case

#### Step 4: Decision Points

At **Step 5 (Cynefin Classification)**, the system routes to:

**Path A: Clear Case** (Simple, routine)
- Tier 1: Planner Agent applies clinical guidelines
- Direct to care plan generation
- No physician review needed

**Path B: Complex Case** (Multiple factors)
- Tier 2: Ensemble Governor coordinates multiple agents
- Multi-agent analysis
- HOTL: Physician reviews and approves

**Path C: Chaotic Case** (Emergency)
- Tier 3: Digital Twin simulates outcomes
- Rapid stabilization protocols
- HOTL: Immediate physician involvement

#### Step 5: HOTL (Human on the Loop)

When execution reaches **"HOTL: Physician Review"**:

A dialog appears:
```
Physician Review: Approve care plan?
[Cancel] [OK]
```

- Click **OK** to approve → Care plan proceeds
- Click **Cancel** to reject → Escalates for revision

#### Step 6: View Node Data

Each completed node shows execution data:

```json
{
  "ikigaiScore": 85.4,
  "executionTime": "1.2s",
  "status": "completed"
}
```

---

## How Cynefin Classification Works

### The Four Main Domains

#### 1. Clear Domain

**Characteristics**:
- Cause-effect is obvious
- Best practices apply
- Repeatable, predictable

**Decision Model**:
```
Sense → Categorize → Respond
```

**Examples**:
- Standard data validation
- Routine form processing
- Known medical procedures

**Agent Recommendation**: Tier 1

#### 2. Complicated Domain

**Characteristics**:
- Cause-effect requires analysis
- Good practices with expert input
- Multiple right answers

**Decision Model**:
```
Sense → Analyze → Respond
```

**Examples**:
- Medical diagnosis (standard cases)
- Financial analysis
- Engineering problems

**Agent Recommendation**: Tier 1 (with Analyst)

#### 3. Complex Domain

**Characteristics**:
- Cause-effect only in retrospect
- Emergent practices
- Patterns emerge through experimentation

**Decision Model**:
```
Probe → Sense → Respond
```

**Examples**:
- Rare medical conditions
- Market predictions
- Innovative product development

**Agent Recommendation**: Tier 2 (Ensemble)

#### 4. Chaotic Domain

**Characteristics**:
- No clear cause-effect
- Novel practices
- Requires immediate action

**Decision Model**:
```
Act → Sense → Respond
```

**Examples**:
- Medical emergencies
- Crisis management
- System failures

**Agent Recommendation**: Tier 3 (Digital Twin + HOTL)

### Automatic Classification

The system analyzes your problem description for keywords:

**Clear**: standard, routine, checklist, procedure
**Complicated**: analyze, calculate, expertise, evaluate
**Complex**: experiment, adapt, emerge, innovate
**Chaotic**: crisis, urgent, emergency, critical

---

## Understanding Agent Tiers

### Tier 1: Individual Agents

**Purpose**: Execute specific, well-defined tasks

**Agents**:
1. **Monitor Agent** 📊
   - Observes metrics and data
   - Detects anomalies
   - Triggers workflows

2. **Analyst Agent** 📈
   - Analyzes patterns
   - Statistical analysis
   - Risk assessment

3. **Planner Agent** 📋
   - Creates action plans
   - Sequences tasks
   - Allocates resources

4. **Executor Agent** ⚙️
   - Executes plans
   - Performs actions
   - Updates systems

5. **Knowledge Agent** 📚
   - Stores information
   - Maintains knowledge base
   - Provides context

**When to Use**:
- Clear or Complicated domains
- Well-defined tasks
- Standard procedures

**Ikigai Monitoring**:
Each Tier 1 agent has an Ikigai score (0-100):
- Score > 70: Continue (optimal performance)
- Score 50-70: Monitor (close observation)
- Score 30-50: Throttle (reduce workload)
- Score < 30: Apoptosis (terminate agent)

### Tier 2: Ensemble

**Purpose**: Coordinate multiple agents, handle complex scenarios

**Components**:
1. **Ensemble Governor** 👨‍⚖️
   - Orchestrates Tier 1 agents
   - Makes coordination decisions
   - Manages apoptosis/throttle/rollback

2. **Graph Monitor** 🕸️
   - Visualizes agent relationships
   - Tracks dependencies
   - Monitors flow

**When to Use**:
- Complex domain
- Multi-agent coordination needed
- Emergent patterns

**Escalation**:
If ensemble detects:
- Low Ikigai scores (< 50)
- High uncertainty
- Policy violations

Then escalate to **HOTL** (Human on the Loop)

### Tier 3: Digital Twin

**Purpose**: Simulate entire system, predict outcomes

**Capabilities**:
- **Adaptive Learning**: Learns from execution history
- **Predictive Analytics**: Forecasts outcomes
- **Scenario Simulation**: "What-if" analysis
- **Rapid Response**: Quick decisions in chaotic situations

**When to Use**:
- Chaotic domain
- Emergency situations
- Need predictive insights

**Integration**:
- Learns from Tier 1 & 2 executions
- Provides recommendations
- Simulates outcomes before execution

---

## Process Map Configuration

### Creating Custom Workflows

You can adapt the medical workflow for other use cases:

#### 1. Define Process Nodes

```typescript
{
  id: 'node1',
  type: 'human',  // or 'tier1', 'tier2', 'tier3', 'data', 'decision', 'output'
  title: 'Step Name',
  description: 'What this step does',
  status: 'pending',
  cynefinDomain: 'clear',  // or 'complicated', 'complex', 'chaotic'
  nextNodes: ['node2']
}
```

#### 2. Connect Nodes

**Linear Flow**:
```
node1 → node2 → node3 → node4
```

**Branching**:
```
node1 → decision
         ↓
    ┌────┼────┐
    ↓    ↓    ↓
  nodeA nodeB nodeC
```

#### 3. Add Decision Logic

At decision nodes, route based on:
- Cynefin classification
- Ikigai scores
- Business rules
- User input

### Example: Customer Support Workflow

```
1. Customer submits ticket (HCP)
   ↓
2. Monitor Agent: Check urgency (Tier 1)
   ↓
3. Store in ticket system (DCP)
   ↓
4. Analyst Agent: Classify issue (Tier 1)
   ↓
5. Cynefin Classification (Decision)
   ├─ Clear → Route to FAQ bot
   ├─ Complicated → Route to specialist
   ├─ Complex → Escalate to senior team
   └─ Chaotic → Immediate manager attention
   ↓
6. Resolution delivered (Output)
```

---

## Best Practices

### Planning Instrument

✅ **DO**:
- Break projects into 5-10 manageable steps
- Write clear, specific descriptions
- Review Cynefin classifications and adjust if needed
- Track progress consistently
- Use recommended approaches

❌ **DON'T**:
- Create too many steps (overwhelming)
- Use vague descriptions (affects classification)
- Skip steps (breaks flow)
- Ignore recommendations (defeats purpose)

### Medical Workflow

✅ **DO**:
- Fill all patient information fields
- Execute nodes in sequence
- Review node data for insights
- Approve/veto thoughtfully at HOTL
- Use for training and demonstration

❌ **DON'T**:
- Skip validation steps
- Rush through HOTL decisions
- Execute out of order
- Use real patient data (use dummy data for testing)

### Cynefin Classification

✅ **DO**:
- Understand the four domains
- Accept that classification guides approach
- Use appropriate tier for domain
- Re-classify if situation changes
- Document your reasoning

❌ **DON'T**:
- Force all problems into one domain
- Ignore domain characteristics
- Use complicated approaches for clear problems
- Panic in chaotic situations (act first)

### Agent Tiers

✅ **DO**:
- Monitor Ikigai scores regularly
- Respond to governance recommendations
- Escalate to HOTL when appropriate
- Learn from Digital Twin simulations
- Track agent performance

❌ **DON'T**:
- Ignore low Ikigai scores (< 50)
- Skip HOTL approvals for critical decisions
- Over-use Tier 3 for simple tasks
- Under-use ensemble for complex tasks

---

## Keyboard Shortcuts

- `Tab`: Navigate between fields
- `Enter`: Submit forms
- `Esc`: Cancel dialogs
- `Space`: Toggle checkboxes

---

## Troubleshooting

### Classification Seems Wrong

**Solution**:
- Review your description
- Add more context and keywords
- Manually adjust tier selection if needed

### Workflow Stuck at Node

**Solution**:
- Check if previous node completed
- Click "Execute" button
- Refresh page if needed

### HOTL Not Appearing

**Solution**:
- Ensure case is Complex or Chaotic
- Check Cynefin routing
- Verify ensemble escalation threshold

### Ikigai Score Low

**Solution**:
- Review agent configuration
- Check resource allocation
- Consider throttling or rollback
- May trigger apoptosis (< 30)

---

## Advanced Features

### Custom Agent Patterns

Integrate with the 21 agent patterns:
- Routing, Parallelization, Orchestrator
- Evaluator, Prompt Chaining, Reflection
- And more...

### Data Mesh Integration

Connect process nodes to:
- Kafka topics
- Data contracts
- Data products

### Compliance Tracking

All workflow executions logged:
- Immutable audit trail
- p-risk, confidence, diff metrics
- GDPR, HIPAA compliance

---

## Next Steps

1. **Practice**: Run the medical workflow with sample data
2. **Customize**: Adapt for your use case
3. **Integrate**: Connect to real systems (ODOO, databases)
4. **Scale**: Deploy across organization
5. **Optimize**: Monitor Ikigai scores and improve

---

**Questions?** See LOCALHOST_DEPLOYMENT.md and other documentation files.

**Ready to start?** Open the application and go to Case Studies!
