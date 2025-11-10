# LLM Integration Guide - AI Assistant & Data Export

Complete guide to using the AI assistant and exporting data to ODOO.

## ⚠️ CRITICAL SECURITY WARNING

**NEVER share or commit API keys!** Follow these security best practices:

1. ✅ **DO**: Add API keys via Settings panel in the app
2. ✅ **DO**: Use environment variables
3. ✅ **DO**: Add `.env` to `.gitignore`
4. ❌ **DON'T**: Commit keys to git
5. ❌ **DON'T**: Share keys in chat or documentation  
6. ❌ **DON'T**: Hardcode keys in source code

## 🤖 AI Assistant Features

### Overview

The AI Assistant uses OpenAI GPT-4 to provide intelligent help with:
- Workflow design and optimization
- Cynefin domain classification
- Protocol generation (HCP, BCP, MCP, DCP, GCP)
- Agent task assignment suggestions
- Ikigai score predictions
- System explanations

### Access

**Menu Location**: `Case Studies → AI Assistant`

## 🔑 Setting Up OpenAI API

### Step 1: Get Your API Key

1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)
6. **IMPORTANT**: Save it securely - you can't view it again!

### Step 2: Add Key to Settings

1. Open the app
2. Go to **Settings** (gear icon in sidebar)
3. Find **API Configuration** section
4. Locate the **OpenAI** entry
5. Paste your API key in the `API Key` field
6. Ensure `Enabled` toggle is **ON**
7. Click **Save Settings**

**Settings Panel**:
```
┌────────────────────────────────────────────────┐
│ API Configuration                  [Save]      │
├────────────────────────────────────────────────┤
│                                                │
│ OpenAI                            [Test] [🗑️]  │
│ API Name: OpenAI                               │
│ API Key:  [sk-proj-...] [👁️] [Enabled ✓]       │
│ Base URL: https://api.openai.com/v1           │
│                                                │
└────────────────────────────────────────────────┘
```

### Step 3: Test Connection

1. Click the **Test** button next to OpenAI config
2. Wait for verification
3. Should show "✓ Connection successful"

## 💬 Using the AI Assistant

### Chat Interface

```
┌─────────────────────────────────────────────────┐
│ 🤖 AI Assistant                    [Export] [🗑️]│
│    Powered by OpenAI GPT-4                      │
├─────────────────────────────────────────────────┤
│                                                 │
│              Start a Conversation               │
│                                                 │
│ Quick Prompts:                                  │
│ [Explain the Cynefin framework]                 │
│ [How do I classify a complex problem?]          │
│ [What is the Data Mesh architecture?]           │
│ [Explain Ikigai scoring for agents]             │
│ [How do I design a workflow?]                   │
│ [What are the five protocols?]                  │
│                                                 │
├─────────────────────────────────────────────────┤
│ [Type your message here...           ] [Send]  │
│ Press Enter to send, Shift+Enter for new line  │
└─────────────────────────────────────────────────┘
```

### Quick Prompts

Click any quick prompt to start a conversation:

**1. "Explain the Cynefin framework"**
```
AI: The Cynefin framework classifies problems into 5 domains:

Clear (formerly Simple):
- Known solutions exist
- Best practices apply
- Sense → Categorize → Respond

Complicated:
- Expert analysis needed
- Good practices apply
- Sense → Analyze → Respond

Complex:
- Cause and effect discoverable in retrospect
- Emergent practices
- Probe → Sense → Respond
- Tier 2 Ensemble recommended

Chaotic:
- No clear cause and effect
- Novel practices required
- Act → Sense → Respond
- Tier 3 Digital Twin recommended

Confused:
- Unclear which domain applies
- Need to gather more information
```

**2. "How do I classify a complex problem?"**
```
AI: To classify a problem using Cynefin:

1. Ask these questions:
   - Are cause/effect relationships clear?
   - Can experts predict outcomes?
   - Are there established best practices?
   - Is the situation stable or volatile?

2. Indicators of COMPLEX domain:
   - Multiple interacting factors
   - Outcomes emerge over time
   - Expert predictions diverge
   - Requires experimentation
   - Benefits from diversity of perspectives

3. Recommended Actions:
   - Use Tier 2 Ensemble Governor
   - Enable safe-to-fail probes
   - Increase feedback loops
   - HOTL for critical decisions
   - Monitor Ikigai scores > 60

4. Example:
   "Implementing new workflow across departments"
   → COMPLEX: Multiple stakeholders, emergent behaviors
   → Assign to Ensemble Governor
```

**3. "What is the Data Mesh architecture?"**
```
AI: Data Mesh is a decentralized approach to data architecture:

Core Principles:

1. Domain-Oriented Ownership:
   - Each domain owns its data products
   - Domain teams responsible for quality

2. Data as a Product:
   - Treat data like product with consumers
   - SLAs for freshness, completeness
   - Discovery and documentation

3. Self-Serve Data Platform:
   - Tools for creating data products
   - Automated data pipeline creation
   - Policy enforcement

4. Federated Computational Governance:
   - Policies defined globally
   - Execution at domain level
   - Interoperability, security, privacy

In your system:
- DCP (Data Context Protocol) implements Data Mesh
- Creates input/output ports
- Defines data contracts
- Uses Kafka for streaming
- Enforces governance policies
```

### Custom Questions

**Ask About**:
- Workflow design
- Agent selection
- Protocol generation
- Compliance checking
- Optimization tips

**Examples**:
```
"How should I route medical record workflows?"

"What agent should handle risk assessment?"

"Generate an HCP instance for a patient"

"Explain Ikigai scoring thresholds"

"What's the difference between Tier 2 and Tier 3?"

"How do I implement HOTL approval?"

"Create a Business Canvas for trip planning"
```

### Chat Features

**Export Chat** (Download button):
- Saves conversation as `.txt` file
- Includes timestamps
- Useful for documentation

**Clear Chat** (Trash button):
- Removes all messages
- Fresh start

**Message Display**:
- 👤 **User**: Blue bubbles (right side)
- 🤖 **AI**: Gray bubbles (left side)
- ⏱️ Timestamps for each message

## 🎯 Advanced AI Functions

### 1. Workflow Analysis

```typescript
// Automatically analyze workflow for optimization
const analysis = await llmService.analyzeWorkflow({
  nodes: [...],
  connections: [...]
});

// Returns:
// - Bottleneck identification
// - Efficiency suggestions
// - Protocol compliance check
// - Ikigai predictions
// - Best practice recommendations
```

**Example**:
```
User: Analyze this workflow
AI: I've identified 3 optimization opportunities:

1. Bottleneck at Analyst Agent:
   - Handling 3 sequential tasks
   - Recommendation: Parallelize tasks 2 & 3
   - Estimated time savings: 40%

2. Missing HOTL check:
   - Decision node goes directly to Executor
   - Risk: No human oversight on critical path
   - Recommendation: Add HOTL before execution

3. Ikigai concerns:
   - Monitor Agent assigned to 4 tasks
   - Predicted Ikigai score: 52 (below threshold)
   - Recommendation: Redistribute 2 tasks
```

### 2. Cynefin Classification

```typescript
// Classify problem domain
const domain = await llmService.classifyCynefinDomain(
  "Multiple departments need to coordinate on patient data sharing"
);

// Returns: "Complex" with explanation
```

**Use Cases**:
- Automatic tier assignment
- Routing decisions
- Escalation triggers

### 3. Agent Assignment Suggestions

```typescript
// Get agent recommendations
const suggestion = await llmService.suggestAgentAssignment(
  "Validate medical record completeness",
  availableAgents
);

// Returns:
// - Recommended agent (Monitor Agent)
// - Reasoning (data validation capabilities)
// - Alternative options
// - Ikigai impact prediction
```

### 4. Protocol Generation

```typescript
// Generate protocol instances
const hcpInstance = await llmService.generateProtocolInstance('HCP', {
  user: "patient",
  intention: "transfer_records"
});

// Returns properly formatted HCP JSON
```

### 5. Protocol Validation

```typescript
// Validate protocol compliance
const validation = await llmService.validateProtocol('DCP', protocolData);

// Returns:
// {
//   valid: true/false,
//   issues: ["Missing SLA", "Invalid Kafka topic format"]
// }
```

## 📤 Data Export Features

### Overview

Export system data in ODOO-compatible CSV format for integration with enterprise systems.

### Export Types

#### 1. User Profiles

**What's Exported**:
- Agent information
- Capabilities
- Ikigai scores
- Task completion stats
- Status and metadata

**CSV Format**:
```csv
ID,Name,Type,Tier,Capabilities,Ikigai Score,Tasks Completed,Status,Created At,Updated At
agent-001,Monitor Agent,monitor,Tier 1,data_collection; validation; quality_check,85.4,12,active,2025-01-01,2025-01-08
agent-002,Analyst Agent,analyst,Tier 1,pattern_recognition; risk_assessment,78.2,8,active,2025-01-01,2025-01-08
...
```

**Usage**:
```typescript
import { csvExportService } from '../services/csvExportService';

// Export all agents
await csvExportService.exportUserProfiles();

// Export workspace-specific
await csvExportService.exportUserProfiles('workspace-123');
```

#### 2. ODOO Contacts

**What's Exported**:
- Agent data in ODOO contact format
- Compatible with ODOO CRM
- Includes tags for filtering

**CSV Format**:
```csv
Name,Email,Phone,Company,Job Position,Street,City,State/Province,ZIP,Country,Website,Notes,Tags
Monitor Agent,monitor@agents.local,,Agent Protocol System,monitor Agent - Tier 1,,,,,,"Agent ID: agent-001
Capabilities: data_collection, validation
Ikigai Score: 85.4",agent;tier1;monitor
...
```

**ODOO Import Steps**:
1. Export from app: `csvExportService.exportOdooContacts()`
2. Download CSV file
3. Open ODOO
4. Go to **Contacts**
5. Click **Import**
6. Upload CSV file
7. Map fields (auto-detected)
8. Click **Import**
9. Contacts appear in ODOO

#### 3. Project Data

**What's Exported**:
- Human contexts (HCP instances)
- User intentions and roles
- Permissions and consent
- Context metadata

**CSV Format**:
```csv
ID,User ID,Role,Intention,Context Data,Permissions,Consent Given,Created At
hcp-001,user-123,patient,transfer_records,"{...}",read; write; transfer,Yes,2025-01-01
...
```

#### 4. Workflow Data

**What's Exported**:
- Node configurations
- Connection mappings
- Agent assignments
- Positions and status

**CSV Format**:
```csv
# WORKFLOW NODES
Node ID,Type,Agent Type,Tier,Label,Position X,Position Y,Status
node-001,start,,Start,100,100,idle
node-002,agent,monitor,tier1,Monitor Agent,300,100,idle
...

# WORKFLOW CONNECTIONS
Connection ID,From Node,To Node,Condition
conn-001,node-001,node-002,
...
```

### Export Functions

**Export All Data**:
```typescript
// Exports all data types sequentially
await csvExportService.exportAllData('workspace-123');

// Downloads 3 files:
// - user-profiles-{timestamp}.csv
// - project-data-{timestamp}.csv
// - odoo-contacts-{timestamp}.csv
```

**Export Workflow**:
```typescript
const workflow = {
  nodes: [...],
  connections: [...]
};

await csvExportService.exportWorkflowData(workflow);
// Downloads: workflow-{timestamp}.csv
```

### CSV Parsing

**Import CSV Data**:
```typescript
const csvText = '...'; // From file upload

const { headers, rows } = csvExportService.parseCSV(csvText);

// Process imported data
rows.forEach(row => {
  const record = {};
  headers.forEach((header, index) => {
    record[header] = row[index];
  });
  // Import record to database
});
```

## 🖥️ Local Testing (Apple M3)

### Prerequisites

- Node.js 18+ installed
- Chrome browser
- Terminal access

### Setup

```bash
# Clone/navigate to project
cd /path/to/project

# Install dependencies
npm install

# Start development server
npm run dev
```

### Open in Chrome

```
http://localhost:5173
```

### Testing Checklist

- [ ] Settings panel loads
- [ ] Can add OpenAI API key
- [ ] Can save settings
- [ ] AI Assistant accessible
- [ ] Chat interface responds
- [ ] Quick prompts work
- [ ] Export buttons functional
- [ ] CSV downloads correctly
- [ ] ODOO format validated

### Browser DevTools

**Open DevTools**: `Cmd + Option + I`

**Console Tab**:
- View API calls
- Check errors
- Monitor requests

**Network Tab**:
- Track OpenAI API requests
- Verify 200 status codes
- Check response times

**Application Tab**:
- View localStorage
- Inspect API settings
- Check saved workflows

## 🔒 Security Best Practices

### API Key Storage

**✅ SECURE**:
```
1. User enters key via Settings panel
2. Saved to Supabase database
3. Encrypted in transit (HTTPS)
4. RLS policies restrict access
5. Never logged or exposed
```

**❌ INSECURE**:
```
1. Hardcoding in source code
2. Committing to git
3. Sharing in documentation
4. Storing in plain text files
5. Exposing in client-side code
```

### Environment Variables

**.env File** (NOT committed):
```bash
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_OPENAI_API_KEY=    # EMPTY - user adds via Settings
```

**.gitignore**:
```
.env
.env.local
.env.*.local
```

### RLS Policies

**Supabase Security**:
```sql
-- Only authenticated users can read their own API settings
CREATE POLICY "Users can read own API settings"
  ON api_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only authenticated users can update their own settings
CREATE POLICY "Users can update own API settings"
  ON api_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

## 📊 Usage Analytics

### Tracking LLM Usage

**OpenAI Response Includes**:
```json
{
  "message": "...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 320,
    "total_tokens": 470
  }
}
```

**Cost Estimation** (GPT-4):
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens

**Example**:
```
150 prompt tokens × $0.03/1K = $0.0045
320 completion tokens × $0.06/1K = $0.0192
Total: $0.0237 per request
```

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured"

**Solution**:
1. Go to Settings
2. Add OpenAI API key
3. Ensure "Enabled" is ON
4. Click "Save Settings"
5. Refresh page

### Error: "Invalid API key"

**Solution**:
1. Verify key starts with `sk-proj-` or `sk-`
2. Check for extra spaces
3. Generate new key if needed
4. Update in Settings

### Error: "Rate limit exceeded"

**Solution**:
1. Wait 60 seconds
2. Check OpenAI dashboard for limits
3. Upgrade plan if needed
4. Implement request queuing

### Error: "Network request failed"

**Solution**:
1. Check internet connection
2. Verify firewall settings
3. Check CORS policies
4. Try different network

### Chat not responding

**Solution**:
1. Check browser console for errors
2. Verify API key is saved
3. Test API connection in Settings
4. Clear browser cache
5. Reload page

## 📚 Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **ODOO Import Guide**: https://www.odoo.com/documentation/
- **CSV Format Spec**: https://tools.ietf.org/html/rfc4180

---

**Ready to use AI Assistant?** Add your API key in Settings → Case Studies → AI Assistant!

**Need to export data?** See csvExportService functions in the code.

**REMEMBER**: Never commit or share API keys! 🔐
