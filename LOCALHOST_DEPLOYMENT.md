# Localhost Deployment Guide

Complete guide to download, install, and run the Agent Protocol System on your local machine.

## System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB free space

## Quick Start (5 Minutes)

### 1. Download the Project

```bash
# Clone or download the project
git clone <repository-url>
cd project

# Or if you have a ZIP file
unzip project.zip
cd project
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18.3.1
- Supabase Client 2.57.4
- Vite 5.4.2
- Tailwind CSS 3.4.1
- TypeScript 5.5.3
- Lucide React (icons)
- Papa Parse (CSV parsing)
- N3 (RDF/Linked Data)

### 3. Configure Environment

The project comes pre-configured with Supabase. Environment variables are already set in `.env`:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

**Note**: Supabase connection is already configured and ready to use.

### 4. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`

### 5. Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Agent Protocols System dashboard.

## Complete Feature Set

### ✅ 9 Protocols System
- HCP (Human Context Protocol)
- BCP (Business Context Protocol)
- MCP (Machine Context Protocol)
- DCP (Data Context Protocol)
- TCP (Test Context Protocol)
- ACP (Agent Context Protocol)
- GCP (Governance Context Protocol)
- GeoCP (Geographical Context Protocol)
- ECP (Ecosystem Context Protocol)

### ✅ Data Mesh with Kafka
- Kafka topic management
- Data contracts with input/output ports
- Data products with ownership
- Federated governance
- Self-serve data platform

### ✅ Ikigai-Based Agent Governance
- Love, Passion, Mission, Vocation scoring
- Competence, Value, Need, Contribution metrics
- Automated governance decisions
- Apoptosis, Throttle, Rollback controls

### ✅ Three-Tier Agent Architecture
- **Tier 1**: Monitor, Analyst, Planner, Executor, Knowledge agents
- **Tier 2**: Ensemble Governor, Graph Monitor
- **Tier 3**: Adaptive Digital Twin

### ✅ Cynefin Model Implementation
- Clear domain (sense-categorize-respond)
- Complicated domain (sense-analyze-respond)
- Complex domain (probe-sense-respond)
- Chaotic domain (act-sense-respond)
- Confusion detection

### ✅ LSS Lens Filtering
- Survive zone
- Scale to 10^1
- Scale beyond
- Six Sigma metrics
- Lean waste analysis

### ✅ GICS 2024 Industry Classification
- 163 sub-industries
- 11 sectors
- Industry-specific context mapping

### ✅ 21 Agent Patterns
- From low to expert complexity
- Full integration with protocols

### ✅ ODOO ERP Integration
- PostgreSQL direct access
- API connectivity
- Table/field mapping

## Available Commands

### Development
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Port Configuration

Default port: `5173`

To change the port, edit `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000  // Your preferred port
  }
})
```

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── AboutProtocols.tsx
│   │   ├── EcosystemSetup.tsx
│   │   ├── IndustrySelector.tsx
│   │   ├── ProtocolDashboard.tsx
│   │   └── protocols/       # Protocol-specific panels
│   │
│   ├── services/            # Business logic
│   │   ├── cynefinService.ts
│   │   ├── ikigaiService.ts
│   │   ├── dataMeshService.ts
│   │   ├── ecosystemService.ts
│   │   └── gicsService.ts
│   │
│   ├── data/                # Data files
│   │   └── GICS_2024_full_structure.csv
│   │
│   ├── lib/                 # Libraries
│   │   └── supabase.ts
│   │
│   └── main.tsx             # Entry point
│
├── supabase/migrations/     # Database migrations
├── backend/                 # Python ML models
├── public/                  # Static assets
├── .env                     # Environment variables
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind CSS config
```

## Database Setup

### Automatic Migration

The database schema is automatically created when you first access the application. It includes:

- **25+ tables** for complete system
- **9 protocol tables** (HCP, BCP, MCP, DCP, TCP, ACP, GCP, GeoCP, ECP)
- **Data Mesh tables** (Kafka topics, contracts, products)
- **Agent tables** (Tier 1, 2, 3 agents)
- **Ikigai scoring** tables
- **Cynefin classification** tables
- **Escalation and apoptosis** tables

### Manual Migration (if needed)

```bash
# Check migrations
ls supabase/migrations/

# Migrations are applied automatically via Supabase
```

## First-Time Setup Wizard

When you first open the application:

### Step 1: Industry Selection
1. Go to **Enterprise Config → Industry Selector**
2. Search or browse GICS 2024 industries
3. Select your industry (e.g., "Information Technology → Software & Services")
4. System creates ecosystem configuration

### Step 2: Ecosystem Context
1. Review auto-generated ecosystem config
2. Adjust company size, business model
3. Save configuration

### Step 3: ODOO Integration (Optional)
1. Go to **ODOO Integration** tab
2. Enter ODOO URL and credentials
3. Test connection
4. Configure data sync

### Step 4: Agent Patterns
1. Browse **21 Agent Patterns**
2. Select patterns for your use case
3. Create agent instances
4. Configure settings

### Step 5: Build Workflows
1. Open **Visual Pipeline Builder**
2. Create workflow
3. Add protocol and agent nodes
4. Connect and test

## Using the System

### Classify a Problem with Cynefin

```typescript
// In your code or via UI
import { cynefinService } from './services/cynefinService';

const classification = await cynefinService.classifyProblem(
  workspaceId,
  "We need to analyze customer churn patterns",
  userContext
);

// Returns: { domain: 'complicated', recommended_tier: 'tier1', ... }
```

### Create Tier 1 Agents

**Monitor Agent**:
```typescript
import { ikigaiService } from './services/ikigaiService';

const monitor = await ikigaiService.createTier1Agent({
  workspace_id: workspaceId,
  agent_name: "System Monitor",
  agent_type: "monitor",
  capabilities: ["metric_collection", "anomaly_detection"],
  handles_domains: ["clear", "complicated"]
});
```

**Analyst Agent**:
```typescript
const analyst = await ikigaiService.createTier1Agent({
  workspace_id: workspaceId,
  agent_name: "Data Analyst",
  agent_type: "analyst",
  capabilities: ["statistical_analysis", "pattern_recognition"],
  handles_domains: ["complicated", "complex"]
});
```

### Calculate Ikigai Score

```typescript
const ikigaiScore = await ikigaiService.calculateAndStoreIkigai(
  workspaceId,
  agentId,
  'tier1',
  {
    love_score: 85,        // External recognition, user feedback
    passion_score: 70,     // Cost efficiency
    mission_score: 90,     // Goal alignment
    vocation_score: 80,    // Opportunity, function
    competence_score: 75,  // Skills, knowledge
    value_score: 85,       // Energy provision
    need_score: 90,        // Demand
    contribution_score: 80 // Career contribution
  }
);

// Returns governance action: 'continue', 'monitor', 'throttle', 'rollback', or 'apoptosis'
```

### Setup Data Mesh with Kafka

```typescript
import { dataMeshService } from './services/dataMeshService';

// Create Kafka topic
const topic = await dataMeshService.createKafkaTopic({
  workspace_id: workspaceId,
  topic_name: "customer-events",
  topic_type: "event",
  data_domain: "customer",
  partitions: 3,
  allowed_producers: ["customer-service"],
  allowed_consumers: ["*"]
});

// Create data contract
const contract = await dataMeshService.createDataContract({
  workspace_id: workspaceId,
  contract_name: "Customer Events Contract",
  contract_version: "1.0.0",
  producer_service: "customer-service",
  consumer_services: ["analytics", "ml-pipeline"],
  input_port_type: "operational",
  output_port_type: "streaming",
  freshness_sla_seconds: 60
});

// Create data product
const product = await dataMeshService.createDataProduct({
  workspace_id: workspaceId,
  product_name: "Customer Behavior Dataset",
  domain: "customer",
  contract_id: contract.id,
  lifecycle_stage: "operate"
});
```

### Escalate to HOTL

```typescript
// When Ikigai score drops or uncertainty is high
const escalationId = await ikigaiService.escalateToHOTL(
  workspaceId,
  'tier1',
  monitorAgentId,
  "Detected anomalous pattern requiring human judgment",
  45.5  // Low Ikigai score
);
```

## Troubleshooting

### Port Already in Use

```bash
# Error: Port 5173 is already in use

# Solution 1: Kill the process
# On Windows
netstat -ano | findstr :5173
taskkill /PID <process-id> /F

# On Mac/Linux
lsof -ti:5173 | xargs kill -9

# Solution 2: Use different port
# Edit vite.config.ts and change port
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Build Errors

```bash
# Run type checking
npm run typecheck

# Check for linting issues
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite
```

### Database Connection Issues

Check `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Browser Console Errors

1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Clear browser cache (Ctrl+Shift+Delete)

## Performance Optimization

### For Development

```bash
# Use faster builds
npm run dev -- --host
```

### For Production

```bash
# Build optimized bundle
npm run build

# Check bundle size
npm run preview

# Analyze bundle
npx vite-bundle-visualizer
```

## Security Notes

### Environment Variables

Never commit `.env` to version control:
```bash
# Already in .gitignore
.env
.env.local
.env.production
```

### API Keys

Supabase keys are for development only. For production:
1. Use Row Level Security (RLS) - already enabled
2. Rotate keys regularly
3. Use service role key only on backend

## Updating the System

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Run migrations (automatic)
# Just restart the app

# Rebuild
npm run build
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |

## System Health Check

After starting, verify:

✅ Application loads at `localhost:5173`
✅ No console errors in DevTools
✅ Database connection successful
✅ Can navigate all 9 protocols
✅ Industry selector loads GICS data
✅ Agent patterns display (21 total)

## Getting Help

### Documentation Files
- `README.md` - Overview
- `ECOSYSTEM_CONFIGURATION_GUIDE.md` - Setup guide
- `PHASE3_DOCUMENTATION.md` - Technical docs
- `NEW_PROTOCOLS_GUIDE.md` - Protocol details
- This file - Localhost deployment

### Common Workflows
- See `SETTINGS_GUIDE.md`
- Check UI tooltips and help text
- Review example workflows in documentation

## Next Steps

After successful deployment:

1. **Explore the System**
   - Navigate all 9 protocols
   - Read "About Protocols" page
   - Browse agent patterns

2. **Configure Your Environment**
   - Select your industry (GICS)
   - Create ecosystem configuration
   - Connect ODOO (optional)

3. **Create First Workflow**
   - Select agent pattern
   - Create instance
   - Build pipeline
   - Test execution

4. **Monitor and Optimize**
   - Check Ikigai scores
   - Review Cynefin classifications
   - Monitor data mesh
   - Track ESG impact

---

**Status**: Ready for localhost deployment

**Default URL**: http://localhost:5173

**Documentation**: Complete

**System**: Fully functional on localhost

Enjoy using the Agent Protocols System! 🚀
