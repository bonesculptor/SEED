# Workflow Builder Guide - Node-RED Style Visual Designer

Complete guide to building agent workflows with drag-and-drop visual design.

## 📋 Overview

The Workflow Builder is a Node-RED style visual interface for designing agent pathways and workflows. It allows you to:
- ✅ Drag and drop agent nodes onto a canvas
- ✅ Connect nodes to create workflows
- ✅ Execute workflows visually
- ✅ Save and load workflow configurations
- ✅ Export workflows as JSON

## 🚀 Quick Start

### Access the Workflow Builder

1. Open the application
2. Navigate to **Case Studies → Workflow Builder**

## 🎨 Interface Overview

```
┌────────────────────────────────────────────────────────────┐
│  [Node Library]  │  [Toolbar] Execute Save Load Export     │
├──────────────────┼──────────────────────────────────────────┤
│                  │                                          │
│  Flow Control    │          [Canvas with Grid]             │
│  • Start         │                                          │
│  • Decision      │    Drag nodes here →                     │
│  • End           │    Connect with handles                  │
│                  │    Execute to see flow                   │
│  Tier 1 Agents   │                                          │
│  • Monitor       │                                          │
│  • Analyst       │                                          │
│  • Planner       │                                          │
│  • Executor      │                                          │
│  • Knowledge     │                                          │
│                  │                                          │
│  Tier 2 & 3      │                                          │
│  • Ensemble      │                                          │
│  • Digital Twin  │                                          │
│                  │                                          │
│  Context         │                                          │
│  • HOTL          │                                          │
│  • Data Store    │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
│  Instructions: Green = Start | Blue = End | Drag to move   │
└────────────────────────────────────────────────────────────┘
```

## 📚 Node Library

### Flow Control Nodes

#### 1. Start Node (Green)
```
Icon: Play button
Color: Green
Purpose: Entry point for workflow
Required: Yes (one per workflow)
```

**Use When**:
- Beginning a workflow
- Triggering from external event
- Starting automated process

#### 2. Decision Node (Yellow)
```
Icon: Alert Triangle
Color: Yellow
Purpose: Branching logic
Outputs: Multiple paths
```

**Use When**:
- Cynefin classification routing
- Conditional logic (if/then/else)
- Risk assessment branching
- Multi-path workflows

**Example**:
```
Decision Node: "Classify Problem Complexity"
├─ Path 1: Clear → Tier 1 Agent
├─ Path 2: Complicated → Tier 1 Agent
├─ Path 3: Complex → Tier 2 Ensemble
└─ Path 4: Chaotic → Tier 3 Digital Twin
```

#### 3. End Node (Blue)
```
Icon: Check Circle
Color: Blue
Purpose: Workflow completion
Required: Yes (one or more per workflow)
```

**Use When**:
- Workflow completes successfully
- Final output delivered
- Process terminates

### Tier 1 Agent Nodes (Cyan)

#### 4. Monitor Agent
```
Icon: Activity
Color: Cyan
Tier: Tier 1
Capabilities: data_collection, validation, quality_check
```

**Use When**:
- Collecting data from users or systems
- Validating input data
- Quality checking
- Observing metrics
- Detecting anomalies

**Example Workflows**:
```
Start → Monitor Agent (Collect Data) → Data Store → End
```

#### 5. Analyst Agent
```
Icon: Brain
Color: Cyan
Tier: Tier 1
Capabilities: pattern_recognition, risk_assessment, classification
```

**Use When**:
- Analyzing patterns in data
- Risk assessment
- Classification tasks
- Statistical analysis
- Cynefin domain classification

**Example Workflows**:
```
Data Store → Analyst Agent (Analyze) → Decision → Multiple Paths
```

#### 6. Planner Agent
```
Icon: Users
Color: Cyan
Tier: Tier 1
Capabilities: task_scheduling, resource_allocation, optimization
```

**Use When**:
- Creating action plans
- Scheduling tasks
- Resource allocation
- Optimization problems
- Sequencing operations

**Example Workflows**:
```
Analyst Agent → Planner Agent (Create Plan) → Executor Agent
```

#### 7. Executor Agent
```
Icon: Zap
Color: Cyan
Tier: Tier 1
Capabilities: data_transfer, record_creation, system_integration
```

**Use When**:
- Executing plans
- Performing actions
- Updating systems
- Data transfer
- Record creation

**Example Workflows**:
```
Planner Agent → Executor Agent (Execute) → Data Store → End
```

#### 8. Knowledge Agent
```
Icon: Database
Color: Cyan
Tier: Tier 1
Capabilities: documentation, storage, retrieval
```

**Use When**:
- Storing information
- Maintaining knowledge base
- Retrieving context
- Documentation
- Historical reference

**Example Workflows**:
```
Executor Agent → Knowledge Agent (Document) → End
```

### Tier 2 & 3 Nodes

#### 9. Ensemble Governor (Purple)
```
Icon: Shield
Color: Purple
Tier: Tier 2
Purpose: Coordinate multiple Tier 1 agents
```

**Use When**:
- Complex problems requiring coordination
- Multiple agents need to work together
- Cynefin: Complex domain
- Ensemble decision-making

**Coordinates**:
- Multiple Tier 1 agents
- Parallel processing
- Consensus building
- Apoptosis/Throttle decisions

**Example Workflows**:
```
Decision (Complex) → Ensemble Governor
                    ├─ Monitor Agent
                    ├─ Analyst Agent
                    └─ Planner Agent
                    ↓
                    Aggregate Results → HOTL → End
```

#### 10. Digital Twin (Orange)
```
Icon: Brain
Color: Orange
Tier: Tier 3
Purpose: Predictive simulation and rapid response
```

**Use When**:
- Chaotic situations (Cynefin)
- Need predictive outcomes
- "What-if" scenario analysis
- Emergency response
- System-wide simulation

**Capabilities**:
- Adaptive learning
- Predictive analytics
- Scenario simulation
- Rapid decision-making

**Example Workflows**:
```
Decision (Chaotic) → Digital Twin (Simulate)
                    ↓
                    Predict Outcomes → HOTL → Executor → End
```

### Context Nodes

#### 11. Human on the Loop (HOTL) (Purple)
```
Icon: Users
Color: Purple
Purpose: Human oversight and approval
```

**Use When**:
- Critical decisions require human approval
- Cynefin: Complex or Chaotic domains
- Ikigai score < 60
- Compliance requires human review
- Escalation triggered

**Integration**:
```
Ensemble Governor → HOTL (Human Approves) → Continue/Stop
Digital Twin → HOTL (Physician Review) → Execute/Veto
```

#### 12. Data Store (Yellow)
```
Icon: Database
Color: Yellow
Purpose: Data persistence via Data Mesh
```

**Use When**:
- Storing collected data
- Persisting workflow state
- Implementing Data Context Protocol (DCP)
- Creating data products
- Maintaining audit trail

**Data Mesh Integration**:
- Input ports (operational/analytical)
- Output ports (streaming/batch)
- Data contracts
- Kafka topics

## 🔧 Building Workflows

### Step 1: Add Nodes to Canvas

**Method A: Click to Add**
1. Click any node in the Node Library
2. Node appears on canvas at auto-position

**Method B: Drag to Add** (Future)
1. Drag node from library
2. Drop onto canvas

### Step 2: Position Nodes

1. Click and hold any node
2. Drag to desired position
3. Release to place

**Grid System**:
- 20px grid for alignment
- Snap-to-grid (future enhancement)

### Step 3: Connect Nodes

**Connection Handles**:
- 🟢 **Green handle** (right side): Start connection
- 🔵 **Blue handle** (left side): End connection

**To Connect**:
1. Click the **green handle** on source node
2. Click the **blue handle** on target node
3. Connection line appears

**Connection Line**:
```
Source Node [🟢] ───────→ [🔵] Target Node
```

**Multiple Outputs**:
- One node can connect to multiple targets
- Useful for Decision nodes
- Parallel processing

**Example**:
```
Decision Node [🟢]
    ├───→ [🔵] Monitor Agent
    ├───→ [🔵] Analyst Agent
    └───→ [🔵] Planner Agent
```

### Step 4: Delete Nodes or Connections

**Delete Node**:
- Click trash icon (🗑️) on node
- Removes node and all connected lines

**Delete Connection**:
- Click the "×" button on connection line (midpoint)
- Removes only that connection

### Step 5: Configure Nodes

**Select Node**:
- Click node to select (blue ring appears)
- View properties in sidebar (future)

**Node Properties** (Future Enhancement):
- Label (rename)
- Configuration (settings)
- Conditions (for Decision nodes)
- Timeouts
- Retry logic

## ▶️ Executing Workflows

### Execute Button

1. Click **Execute** in toolbar
2. Workflow runs from Start node
3. Watch visual execution

**Execution Flow**:
```
Start Node
  ↓ (status: running, blue glow)
Monitor Agent
  ↓ (status: running, blue glow)
  ↓ (1.5 seconds)
  ↓ (status: completed, green)
Analyst Agent
  ↓ (status: running, blue glow)
  ... continues
```

**Visual Indicators**:
- 🔵 **Blue glow**: Currently running
- 🟢 **Green**: Completed
- 🔴 **Red**: Error
- ⚪ **Gray**: Idle/Pending

**Connection Colors**:
- Gray: Not executed
- Blue: Currently executing
- Green: Completed

### Reset Workflow

- Click **Reset** button
- All nodes return to idle state
- Ready to execute again

## 💾 Saving & Loading

### Save Workflow

**Button**: Green "Save" button

**What's Saved**:
```json
{
  "nodes": [
    {
      "id": "node-123",
      "type": "start",
      "label": "Start",
      "position": {"x": 100, "y": 100},
      "status": "idle"
    },
    {
      "id": "node-456",
      "type": "agent",
      "agentType": "monitor",
      "tier": "tier1",
      "label": "Monitor Agent",
      "position": {"x": 300, "y": 100},
      "status": "idle"
    }
  ],
  "connections": [
    {
      "id": "conn-789",
      "from": "node-123",
      "to": "node-456"
    }
  ]
}
```

**Storage**: Browser localStorage

### Load Workflow

**Button**: Purple "Load" button

- Retrieves last saved workflow from localStorage
- Replaces current canvas
- Restores all nodes and connections

### Export Workflow

**Button**: "Download" button

- Downloads workflow as JSON file
- Filename: `workflow-{timestamp}.json`
- Can be shared with team
- Can be version controlled

**Use Cases**:
- Share workflows with team
- Version control in git
- Backup workflows
- Template library

## 📖 Example Workflows

### Example 1: Simple Medical Record Collection

```
[Start]
   ↓
[Monitor Agent] ← Collect patient data
   ↓
[Data Store] ← Save to database (DCP)
   ↓
[End]
```

**Steps to Build**:
1. Add Start node
2. Add Monitor Agent node
3. Add Data Store node
4. Add End node
5. Connect: Start → Monitor → Data Store → End
6. Click Execute

### Example 2: Medical Record with Analysis

```
[Start]
   ↓
[Monitor Agent] ← Collect data
   ↓
[Data Store] ← Store (DCP)
   ↓
[Analyst Agent] ← Analyze patterns
   ↓
[Decision] ← Classify complexity
   ├─→ [Planner Agent] (Simple case)
   ├─→ [Ensemble Governor] (Complex case)
   └─→ [Digital Twin] (Chaotic case)
      ↓
   [HOTL] ← Human review
      ↓
   [End]
```

**Cynefin Routing**:
- Clear/Complicated → Planner (Tier 1)
- Complex → Ensemble Governor (Tier 2)
- Chaotic → Digital Twin (Tier 3)

### Example 3: Trip Planning Workflow

```
[Start]
   ↓
[Monitor Agent] ← Collect traveler info (HCP)
   ↓
[Data Store] ← Store operational data
   ↓
[Analyst Agent] ← Assess medical history
   ↓
[Planner Agent] ← Plan trip logistics (BCP)
   ↓
   ├─→ [Monitor Agent] ← Validate data (DCP)
   ↓
[Analyst Agent] ← Analyze records (MCP)
   ↓
[Decision] ← Check compliance
   ├─→ [Analyst Agent] ← Passed (GCP check)
   └─→ [HOTL] ← Failed (human review)
      ↓
   [Executor Agent] ← Prepare transfer (DCP)
      ↓
   [Knowledge Agent] ← Document process
      ↓
   [End]
```

### Example 4: Ensemble Coordination

```
[Start]
   ↓
[Decision] ← Problem classification
   ↓
[Ensemble Governor]
   ├─→ [Monitor Agent] ← Track metrics
   ├─→ [Analyst Agent] ← Analyze patterns  
   ├─→ [Planner Agent] ← Generate options
   ↓
[Ensemble Governor] ← Aggregate results
   ↓
[HOTL] ← Human approval
   ↓
[Executor Agent] ← Execute approved plan
   ↓
[End]
```

**Parallel Execution**:
- Ensemble Governor coordinates 3 Tier 1 agents
- All execute simultaneously
- Results aggregated
- Human approves consensus

### Example 5: Digital Twin Emergency Response

```
[Start]
   ↓
[Monitor Agent] ← Detect anomaly
   ↓
[Decision] ← Assess severity
   ├─→ [Analyst Agent] (Normal)
   └─→ [Digital Twin] (Critical - Chaotic)
         ↓
      [Digital Twin] ← Simulate outcomes
         ↓
      [Digital Twin] ← Identify stabilization
         ↓
      [HOTL] ← Immediate physician
         ↓
      [Executor Agent] ← Execute emergency protocol
         ↓
      [Knowledge Agent] ← Log incident
         ↓
      [End]
```

## 🎯 Protocol Integration

### Assigning Protocols to Nodes

Each agent node can implement multiple protocols:

**Monitor Agent** + **HCP**:
```
Purpose: Collect human context (user data)
Input: User form, interviews
Output: Structured HCP instance
```

**Planner Agent** + **BCP**:
```
Purpose: Business logic (Business Canvas)
Input: Requirements, constraints
Output: Business plan, resource allocation
```

**Analyst Agent** + **MCP**:
```
Purpose: Machine learning (ML Canvas)
Input: Data, features
Output: Predictions, classifications
```

**Data Store** + **DCP**:
```
Purpose: Data persistence (Data Mesh)
Input: Raw data
Output: Data products, contracts
Kafka Topics: Created automatically
```

**Decision** + **GCP**:
```
Purpose: Governance (Cynefin policy)
Input: Problem description
Output: Domain classification, tier recommendation
```

## 🚀 Advanced Features

### Workflow Patterns

#### 1. Sequential Flow
```
A → B → C → D
```
Simple linear execution

#### 2. Parallel Processing
```
      ┌→ B →┐
A → ─┼→ C →├→ E
      └→ D →┘
```
Multiple agents execute simultaneously

#### 3. Conditional Branching
```
      ┌→ B → E
A → C─┼→ D → F
      └→ G → H
```
Based on decision node conditions

#### 4. Loop (Future)
```
A → B → C → (condition) → Back to B or Continue
```
Iterative processing

#### 5. Sub-workflows (Future)
```
A → [Sub-workflow: X → Y → Z] → B
```
Reusable workflow components

### Keyboard Shortcuts (Future)

- `Delete`: Delete selected node
- `Ctrl+C`: Copy selected node
- `Ctrl+V`: Paste node
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Ctrl+S`: Save workflow
- `Space`: Pan canvas
- `+/-`: Zoom in/out

### Zoom & Pan (Future)

- Mouse wheel: Zoom
- Drag background: Pan
- Fit to screen button

## 📊 Workflow Analytics (Future)

Track workflow performance:
- Execution time per node
- Success/failure rates
- Bottleneck identification
- Ikigai score impact
- Resource utilization

## 🛠️ Best Practices

### Workflow Design

✅ **DO**:
- Always start with a Start node
- Always end with an End node
- Use Decision nodes for branching
- Add HOTL for critical decisions
- Connect all nodes (no orphans)
- Test workflows before production

❌ **DON'T**:
- Create circular references (without exit)
- Skip error handling
- Overcomplicate simple flows
- Ignore Ikigai warnings

### Node Naming

✅ **DO**:
- Use descriptive labels
- Indicate purpose clearly
- Follow naming convention

❌ **DON'T**:
- Use generic names like "Node 1"
- Use abbreviations without context

### Testing

✅ **DO**:
- Execute workflows to test
- Watch visual execution
- Verify all paths work
- Test error scenarios

❌ **DON'T**:
- Deploy without testing
- Assume connections work
- Skip edge cases

## 🚨 Troubleshooting

### Workflow Won't Execute

**Solution**:
- Ensure Start node exists
- Check all connections are valid
- Verify no orphaned nodes

### Node Won't Connect

**Solution**:
- Click green handle first
- Then click blue handle
- Ensure handles are visible

### Execution Stuck

**Solution**:
- Click Reset
- Check for circular references
- Verify end nodes exist

### Can't See Nodes

**Solution**:
- Pan canvas by dragging background
- Zoom out if needed
- Check node library is open

## 💡 Tips & Tricks

1. **Start Simple**: Build basic flows first
2. **Test Often**: Execute frequently during design
3. **Save Regularly**: Use Save button often
4. **Export Templates**: Save common patterns
5. **Visual Layout**: Arrange nodes left-to-right for clarity
6. **Use Colors**: Node colors indicate tier/type
7. **Document**: Add notes about decision logic
8. **Version Control**: Export and commit to git

## 🔜 Coming Soon

- Node configuration panels
- Custom node types
- Workflow templates library
- Real-time collaboration
- Workflow version history
- Performance analytics
- Debugging tools
- Sub-workflow support
- Loop constructs
- Conditional routing rules

---

**Ready to build workflows?** Go to Case Studies → Workflow Builder!

**Examples**: See CASE_STUDIES.md for complete workflow examples

**Integration**: Workflows can be loaded into Project Creation
