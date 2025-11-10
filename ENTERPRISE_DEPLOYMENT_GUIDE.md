# Enterprise Deployment & Configuration Guide

## Overview

Complete guide for deploying and managing the Agent Protocols System from localhost development through staging to production.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Enterprise System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌───────────────┐   ┌──────────────┐  │
│  │ Development  │ →  │    Staging    │ → │  Production  │  │
│  │ (Localhost)  │    │  (Testing)    │   │    (Live)    │  │
│  │              │    │               │   │              │  │
│  │  Apple M3    │    │ Cloud Server  │   │   Enterprise │  │
│  │  localhost   │    │ Integration   │   │   Deployment │  │
│  │  :5173       │    │ Pen Testing   │   │   Auto-scale │  │
│  └──────────────┘    └───────────────┘   └──────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Development Setup (Apple M3 Localhost)

### Current Configuration

**Machine Specs:**
- Processor: Apple M3 Silicon
- RAM: 16GB (recommended minimum)
- OS: macOS
- Node.js: v16+ (check with `node --version`)
- Database: Supabase (cloud-hosted)

### Installation Steps

```bash
# 1. Navigate to project
cd /path/to/project

# 2. Install dependencies
npm install

# 3. Configure environment
cat > .env << 'ENV'
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
ENV

# 4. Start development server
npm run dev

# Server runs on: http://localhost:5173
```

### Development Environment Features

✅ **Hot Module Reload** - Instant updates on code changes
✅ **Debug Mode** - Detailed console logging
✅ **Mock Data** - Test data for rapid development
✅ **Source Maps** - Easy debugging
✅ **Fast Refresh** - React component state preservation

### Testing Locally

```bash
# Run type checking
npm run typecheck

# Build for production (test build)
npm run build

# Preview production build
npm run preview
```

## Phase 2: Staging Server Setup

### Purpose

**Staging Environment** is for:
1. Integration testing with external systems
2. Penetration testing and security audits
3. Performance testing under load
4. User acceptance testing (UAT)
5. Final validation before production

### Server Requirements

**Minimum Specifications:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS or similar
- Network: Public IP with SSL certificate

**Recommended Specifications:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 100GB SSD
- Load balancer ready
- CDN integration

### Deployment to Staging

```bash
# 1. Build production bundle
npm run build

# 2. Configure staging environment
export VITE_SUPABASE_URL="https://staging-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="staging_key"

# 3. Deploy to server (example with rsync)
rsync -avz dist/ user@staging-server:/var/www/agent-protocols/

# 4. Configure Nginx (or Apache)
# See nginx configuration below
```

### Nginx Configuration (Staging)

```nginx
server {
    listen 443 ssl http2;
    server_name staging.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/staging.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.yourdomain.com/privkey.pem;

    root /var/www/agent-protocols;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass https://your-supabase-project.supabase.co;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Integration Testing

Create test session in UI:

1. **Navigate to**: Enterprise Config → Testing Sessions
2. **Create New Test**:
   - Type: Integration
   - Environment: Staging
   - Test Cases: Import from CSV or manual entry

**Test Categories:**
- Protocol Integration (HCP → BCP → MCP flow)
- Database Operations (CRUD on all tables)
- Real-time Collaboration (WebSocket connections)
- API Endpoints (Supabase functions)
- Authentication (Sign up, sign in, sign out)
- Authorization (RLS policies)

### Penetration Testing

**Security Checklist:**

- [ ] SQL Injection testing (RLS should prevent)
- [ ] XSS (Cross-Site Scripting) vulnerability scan
- [ ] CSRF (Cross-Site Request Forgery) protection
- [ ] Authentication bypass attempts
- [ ] Session hijacking tests
- [ ] API rate limiting verification
- [ ] Input validation on all forms
- [ ] File upload security (if applicable)
- [ ] SSL/TLS configuration audit
- [ ] Environment variable exposure check

**Recommended Tools:**
- OWASP ZAP for automated scanning
- Burp Suite for manual testing
- Nmap for network reconnaissance
- SQLMap for database security

## Phase 3: Production Deployment

### Pre-Production Checklist

Before deploying to production, ensure:

- [ ] All integration tests pass (100%)
- [ ] Penetration testing completed with no critical issues
- [ ] Performance testing shows acceptable load times
- [ ] Database migrations tested and backed up
- [ ] SSL certificates configured and valid
- [ ] Monitoring and alerting set up
- [ ] Backup and disaster recovery plan in place
- [ ] User documentation complete
- [ ] Support team trained
- [ ] Rollback plan documented

### Production Server Requirements

**Minimum Production Specs:**
- CPU: 8 cores
- RAM: 32GB
- Storage: 200GB SSD (+ backup storage)
- OS: Ubuntu 22.04 LTS (hardened)
- Network: Load balancer, CDN, WAF
- Database: Supabase Pro plan (or self-hosted Postgres cluster)

**High Availability Setup:**
- Multi-region deployment
- Database read replicas
- Auto-scaling groups
- Health checks and monitoring
- Automated backups (daily)
- Disaster recovery site

### Deployment Process

```bash
# 1. Create production build
NODE_ENV=production npm run build

# 2. Run security audit
npm audit

# 3. Test build locally
npm run preview

# 4. Deploy to production
# Using Docker:
docker build -t agent-protocols:v1.0 .
docker push registry.yourdomain.com/agent-protocols:v1.0

# Or traditional deployment:
rsync -avz --delete dist/ user@prod-server:/var/www/agent-protocols/

# 5. Apply database migrations
# Via Supabase dashboard or CLI

# 6. Verify deployment
curl https://yourdomain.com/health

# 7. Monitor logs
tail -f /var/log/nginx/access.log
```

### Production Nginx Configuration

```nginx
upstream agent_protocols {
    least_conn;
    server app1.yourdomain.com:3000;
    server app2.yourdomain.com:3000;
    server app3.yourdomain.com:3000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    root /var/www/agent-protocols;
    index index.html;

    # Enable caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_req zone=one burst=20;
}
```

## UI Components for Configuration

### 1. Deployment Manager

**Location**: Enterprise Config → Deployment Environments

**Features:**
- View all three environments (dev/staging/prod)
- Configure each environment
- Monitor health status
- View machine specs
- Update deployment URLs

**Database Table**: `deployment_environments`

```typescript
interface DeploymentEnvironment {
  environment_name: 'development' | 'staging' | 'production';
  environment_type: 'local' | 'cloud' | 'hybrid';
  base_url: string;
  status: 'active' | 'inactive' | 'maintenance';
  machine_specs: {
    processor: string;
    ram_gb: number;
    os: string;
  };
  configuration: {
    hot_reload?: boolean;
    debug_mode?: boolean;
    monitoring?: boolean;
  };
}
```

### 2. Business Process Automation

**Location**: Enterprise Config → Business Automations

**Features:**
- Create automated workflows from CSV processes
- Define triggers (scheduled, event-driven, manual)
- Configure action sequences
- Link to pipelines
- Monitor execution history
- Success rate tracking

**Database Table**: `business_automations`

**Example Automation:**
```typescript
{
  name: "Daily Competitor Analysis",
  business_process_id: "1.1.1.1", // From CSV
  automation_type: "scheduled",
  trigger_config: {
    schedule: "0 9 * * *", // Daily at 9 AM
    timezone: "UTC"
  },
  action_sequence: [
    { protocol: "HCP", action: "initiate_request", role: "CEO" },
    { protocol: "GCP", action: "authorize", permission: "read_competitors" },
    { protocol: "DCP", action: "fetch_data", source: "competitor_db" },
    { protocol: "MCP", action: "analyze", model: "competitor_analysis" },
    { protocol: "TCP", action: "validate", threshold: 0.95 },
    { protocol: "HCP", action: "deliver_report", recipient: "CEO" }
  ]
}
```

### 3. Compliance Workflows

**Location**: Enterprise Config → Compliance

**Features:**
- Define regulatory frameworks (GDPR, HIPAA, SOX, etc.)
- Set up approval chains
- Configure automated compliance checks
- Manual review requirements
- Audit trail logging
- Violation tracking
- Remediation action plans

**Database Table**: `compliance_workflows`

**Example Workflow:**
```typescript
{
  workflow_name: "GDPR Data Access Request",
  regulatory_framework: "GDPR",
  compliance_type: "gdpr",
  required_approvals: [
    { role: "Data Protection Officer", timeout_hours: 72 },
    { role: "Legal Team", timeout_hours: 48 }
  ],
  automated_checks: [
    { check: "data_minimization", severity: "high" },
    { check: "consent_verification", severity: "critical" },
    { check: "retention_policy", severity: "medium" }
  ],
  audit_requirements: {
    log_all_access: true,
    retention_days: 2555, // 7 years
    encrypt_logs: true
  }
}
```

### 4. Sustainable Operations Dashboard

**Location**: Enterprise Config → Sustainability

**Features:**
- Set carbon reduction targets
- Track renewable energy percentage
- Monitor water usage
- Waste reduction metrics
- ESG scoring (Environmental, Social, Governance)
- Progress visualization
- Certification tracking (B Corp, Carbon Neutral, etc.)
- Reporting standards (GRI, CDP, SASB)

**Database Table**: `sustainability_operations`

**Example Configuration:**
```typescript
{
  operation_name: "2025 Carbon Reduction Initiative",
  scope: "all", // Scope 1, 2, 3
  carbon_target_kg_co2: 50000,
  current_carbon_kg_co2: 75000,
  reduction_target_percent: 33.3,
  baseline_date: "2024-01-01",
  target_date: "2025-12-31",
  renewable_energy_target_percent: 80,
  metrics: {
    electricity_kwh: 150000,
    natural_gas_m3: 5000,
    fleet_fuel_liters: 12000
  },
  esg_scores: {
    environmental: 7.5,
    social: 8.0,
    governance: 9.0
  }
}
```

### 5. Multi-Agent Coordination

**Location**: Enterprise Config → Agent Coordination

**Features:**
- Configure coordination strategy (centralized/decentralized/hierarchical/federated)
- Agent registry management
- Define communication protocols
- Load balancing rules
- Failover configuration
- Health monitoring
- Performance metrics
- Scaling rules

**Database Table**: `agent_coordination_configs`

**Example Configuration:**
```typescript
{
  config_name: "Production Agent Orchestration",
  coordination_strategy: "hierarchical",
  agent_registry: [
    { agent_id: "agent-001", type: "data_processor", capacity: 100 },
    { agent_id: "agent-002", type: "ml_inference", capacity: 50 },
    { agent_id: "agent-003", type: "report_generator", capacity: 75 }
  ],
  routing_rules: {
    strategy: "least_connections",
    sticky_sessions: true,
    health_check_interval: 30
  },
  load_balancing: {
    algorithm: "weighted_round_robin",
    weights: { "agent-001": 1, "agent-002": 2, "agent-003": 1 }
  },
  failover_config: {
    retry_attempts: 3,
    timeout_seconds: 300,
    fallback_agent: "agent-001"
  }
}
```

### 6. Model Registry

**Location**: Enterprise Config → Model Registry

**Features:**
- Register ML/AI models
- Track model versions
- Deployment status
- Performance metrics
- Integration status
- Hardware requirements
- Dependency management

**Database Table**: `model_registry`

**Supported Model Types:**
- ARIMA (time series forecasting)
- Prophet (Facebook's forecasting tool)
- State Space Models
- Agentic Twin Models
- LLMs (GPT, Claude, etc.)
- Custom models

**Example Model Registration:**
```typescript
{
  model_name: "Competitor Analysis ARIMA",
  model_type: "arima",
  version: "1.0.0",
  framework: "statsmodels",
  model_config: {
    order: [1, 1, 1],
    seasonal_order: [1, 1, 1, 12],
    trend: "ct"
  },
  training_parameters: {
    lookback_days: 365,
    forecast_horizon: 30,
    confidence_interval: 0.95
  },
  performance_metrics: {
    mape: 5.2,
    rmse: 125.4,
    r_squared: 0.89
  },
  deployment_status: "deployed",
  deployment_environment: "production",
  endpoint_url: "/api/models/competitor-forecast",
  hardware_requirements: {
    min_ram_gb: 4,
    min_cpu_cores: 2,
    gpu_required: false
  }
}
```

## Integration Testing Interface

### Testing Session Management

**Location**: Enterprise Config → Testing

**Features:**
- Create test sessions
- Select testing type (integration/penetration/load/security)
- Define test cases
- Execute tests
- View results
- Track issues by severity
- Generate reports
- Recommendations

**Database Table**: `testing_sessions`

**Example Test Session:**
```typescript
{
  session_name: "Pre-Production Integration Test",
  testing_type: "integration",
  environment_id: "staging-uuid",
  test_cases: [
    {
      id: "tc-001",
      name: "HCP to BCP Protocol Flow",
      steps: [
        "Create HCP instance with CEO role",
        "Trigger BCP process 1.1.1.1",
        "Verify DCP data access",
        "Validate MCP execution",
        "Check TCP validation"
      ],
      expected_result: "Full protocol chain executes successfully",
      status: "passed"
    },
    {
      id: "tc-002",
      name: "GCP Authorization Check",
      steps: [
        "Create ACP agent without GCP permission",
        "Attempt to access DCP data",
        "Verify access denied",
        "Add GCP authorization",
        "Retry DCP access",
        "Verify access granted"
      ],
      expected_result: "GCP properly governs ACP access",
      status: "passed"
    }
  ],
  results: {
    total_tests: 25,
    passed: 23,
    failed: 2,
    pass_rate: 92.0
  },
  issues: [
    {
      severity: "high",
      description: "Slow response time on DCP queries",
      recommendation: "Add database indexes"
    }
  ]
}
```

## Model Integration Roadmap

### Phase 1: ARIMA Models (Backend Integration)
**Location**: `/backend/arima_model.py`

- Time series forecasting
- Competitor analysis prediction
- Financial trend analysis
- Resource usage forecasting

### Phase 2: Prophet Models
**Location**: `/backend/prophet_model.py`

- Business metrics forecasting
- Seasonal trend analysis
- Holiday effect modeling
- Multiple seasonality support

### Phase 3: State Space Models
**Location**: `/backend/state_space_model.py`

- Complex system modeling
- Kalman filtering
- Dynamic regression
- Structural time series

### Phase 4: Agentic Twin Models
**Location**: `/backend/agentic_twin_model.py`

- Digital twin agents
- Simulation and prediction
- Behavior modeling
- Decision optimization

### Integration Process

1. **Register Model** in Model Registry UI
2. **Configure Parameters** (training data, hyperparameters)
3. **Train Model** (via backend Python scripts)
4. **Validate Performance** (metrics, accuracy tests)
5. **Deploy to Environment** (dev → staging → prod)
6. **Create Pipeline Node** (add model as MCP node)
7. **Test Integration** (via testing interface)
8. **Monitor Performance** (ongoing metrics)

## Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl https://yourdomain.com/health

# Database health (Supabase)
# Check dashboard at https://supabase.com/dashboard

# Server resources
htop
df -h
free -m
```

### Logging

**Development:**
- Console logs in browser DevTools
- Terminal logs from Vite dev server

**Staging/Production:**
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- Application logs: Supabase Dashboard → Logs
- Custom logging: Implement with Winston or Pino

### Backup Strategy

**Development:**
- Git commits (code)
- Manual backups (see BACKUP_GUIDE.md)

**Staging:**
- Daily code snapshots
- Database backups (automated)
- Configuration backups

**Production:**
- Continuous code backups (Git)
- Hourly database snapshots (first 24h)
- Daily backups retained for 30 days
- Monthly backups retained for 1 year
- Off-site backup storage
- Disaster recovery site sync

## Performance Optimization

### Frontend Optimization

- **Code Splitting**: Lazy load components
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JS/CSS
- **Image Optimization**: WebP format, lazy loading
- **CDN**: Serve static assets from CDN
- **Caching**: Browser caching with proper headers

### Database Optimization

- **Indexes**: Add indexes on frequently queried columns
- **Connection Pooling**: Supabase handles this
- **Query Optimization**: Use `.select()` with specific columns
- **RLS Performance**: Keep policies simple
- **Read Replicas**: Use for heavy read workloads

### Backend Optimization

- **Edge Functions**: Use for API endpoints
- **Caching**: Redis for frequently accessed data
- **Batch Processing**: Group database operations
- **Async Operations**: Non-blocking I/O

## Security Best Practices

### Development

- Never commit `.env` files
- Use HTTPS even in development (mkcert)
- Keep dependencies updated
- Run security audits: `npm audit`

### Staging/Production

- Regular security scans
- Penetration testing (quarterly)
- SSL certificate monitoring
- Rate limiting on APIs
- Input validation
- Output sanitization
- Secure headers (see Nginx config)
- Database encryption at rest
- Encrypted backups

## Support and Troubleshooting

### Common Issues

**Issue**: Application won't start
**Solution**: Check `.env` file, verify Supabase credentials

**Issue**: Database connection errors
**Solution**: Verify Supabase project is active, check RLS policies

**Issue**: Slow performance
**Solution**: Check database indexes, optimize queries, enable caching

**Issue**: Authentication errors
**Solution**: Verify Supabase Auth settings, check email templates

## Cost Estimation

### Development (Localhost)
- Cost: $0 (using Supabase free tier)
- Supabase Free: Up to 500MB database, 2GB file storage, 50K monthly active users

### Staging
- Server: $20-50/month (DigitalOcean, Linode)
- Supabase Pro: $25/month
- SSL Certificate: Free (Let's Encrypt)
- Total: ~$50-75/month

### Production
- Servers: $200-500/month (depending on scale)
- Supabase Pro: $25/month + usage
- CDN: $20-100/month
- Monitoring: $50-100/month
- Backups: $30-50/month
- Total: ~$350-800/month

## Enterprise Scale Considerations

### Scaling Strategy

**Vertical Scaling (Up):**
- Increase server resources (CPU, RAM)
- Good for: Initial growth (up to 10K users)

**Horizontal Scaling (Out):**
- Add more servers
- Load balancing
- Good for: 10K+ users

**Database Scaling:**
- Read replicas for queries
- Connection pooling
- Caching layer (Redis)
- Good for: High database load

### High Availability

- Multi-region deployment
- Active-active or active-passive setup
- Automated failover
- Health monitoring
- 99.9% uptime SLA

### Enterprise Features

- Single Sign-On (SSO)
- LDAP/Active Directory integration
- Custom branding
- Dedicated support
- SLA guarantees
- Compliance certifications
- Audit logging
- Data residency options

## Next Steps

1. **Complete Development** (Apple M3 localhost) ✓
2. **Set Up Staging** (Configure server, deploy, test)
3. **Integration Testing** (Full test suite)
4. **Penetration Testing** (Security audit)
5. **Load Testing** (Performance under stress)
6. **Production Deployment** (Go live!)
7. **Model Integration** (Add ARIMA, Prophet, etc.)
8. **Ongoing Monitoring** (Health checks, performance)
9. **Continuous Improvement** (Features, optimization)

---

**Status**: System ready for enterprise deployment

**Current Phase**: Development (Localhost)

**Next Phase**: Staging setup and integration testing

**Documentation**: Complete and ready for team handoff
