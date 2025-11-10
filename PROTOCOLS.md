# Agent Protocols System

A comprehensive implementation of standardized frameworks for autonomous agent communication and interaction.

## Overview

This system implements five interconnected protocols that enable autonomous agents to communicate, collaborate, and operate effectively within a multi-agent ecosystem.

## Protocols Implemented

### 1. Human Context Protocol (HCP)

**Purpose**: Captures human identity, roles, locations, purposes, preferences, and delegation rules.

**Key Components**:
- **Identity & Roles**: Human actors, stakeholders, persistent URIs (DIDs)
- **Place & Time**: Locations with geo-coordinates, jurisdictions, time bounds
- **Purposes & Intents**: Primary objectives and constraints
- **Activities & Workflows**: Key actions and dependencies
- **Resources**: Human, digital, and physical resources
- **Rules & Guardrails**: Permissions, duties, prohibited actions
- **Preferences**: Tone, scheduling, safety posture
- **Delegation & Consent**: On-behalf-of relationships, escalation channels
- **Audit & Provenance**: Logging, data lineage, versioning

**Validation**: SHACL-based validation ensures required fields, proper URIs, and RDF compliance.

### 2. Business Context Protocol (BCP)

**Purpose**: Maps to Outline Business Canvas with segments, value propositions, and revenue streams.

**Key Components** (OBC Mapping):
- **Customer Segments**: Target audiences and market segments
- **Value Propositions**: Unique value delivered to customers
- **Channels**: Distribution and communication channels
- **Customer Relationships**: Relationship types by segment
- **Revenue Streams**: Income sources and pricing models
- **Key Resources**: Critical assets (human, digital, physical, intellectual)
- **Key Activities**: Core business functions
- **Key Partners**: Strategic partnerships and suppliers
- **Cost Structure**: Fixed and variable costs
- **Metrics**: Business KPIs and targets

**Integration**: Links to HCP for alignment between human context and business model.

### 3. Machine Context Protocol (MCP)

**Purpose**: Defines ML pipelines, models, tasks, deployment, and monitoring configurations.

**Key Components**:
- **Pipeline**: Stages, schedule, data flows
- **Tasks**: ML objectives (classification, regression, etc.)
- **Models**: Algorithm details, frameworks, performance metrics
- **Deployment**: Environment, endpoints, scaling configuration
- **Monitoring**: Metrics, alerting thresholds, dashboards

**Integration**: Links to HCP and BCP to ensure ML systems align with human intent and business objectives.

### 4. Data Context Protocol (DCP)

**Purpose**: Data Mesh elements with domains, products, contracts, SLAs, and ODRL policies.

**Key Components**:
- **Domain**: Data domain classification
- **Data Products**: Self-contained data assets with owners
- **Contracts**: Schema definitions and versioning
- **Ports**: Input/output interfaces (REST, Kafka, etc.)
- **Storage**: Backend configuration and encryption
- **SLAs**: Freshness, completeness, accuracy, availability targets
- **Policies**: ODRL-based access control and permissions

**Data Mesh Principles**:
- Domain-oriented decentralization
- Data as a product
- Self-serve data infrastructure
- Federated computational governance

### 5. Test Context Protocol (TCP)

**Purpose**: Measures drift velocity with PSI, KL divergence, KS tests, and statistical monitoring.

**Key Components**:
- **Baseline**: Reference snapshot with metrics and distributions
- **Monitoring**: Frequency, schedule, retention policies
- **Drift Configuration**: Detection methods (PSI, KS, KL, JS), thresholds, bins
- **Alerting**: Channels, recipients, severity levels, escalation

**Drift Detection Methods**:
- **PSI (Population Stability Index)**: Measures distribution shift
- **KS (Kolmogorov-Smirnov)**: Statistical test for distribution differences
- **KL Divergence**: Information-theoretic measure of distribution distance
- **JS Divergence**: Symmetric version of KL divergence
- **Drift Velocity**: Rate of change over time (rolling window)

## Architecture

```
┌─────────────────┐
│  Human Context  │ ← Human identity, roles, preferences
│      (HCP)      │
└────────┬────────┘
         │ supports
         ▼
┌─────────────────┐
│ Business Context│ ← OBC canvas, value proposition
│      (BCP)      │
└────────┬────────┘
         │ implements
         ▼
┌─────────────────┐
│ Machine Context │ ← ML pipelines, models, deployment
│      (MCP)      │
└────────┬────────┘
         │ consumes
         ▼
┌─────────────────┐
│  Data Context   │ ← Data mesh, products, SLAs
│      (DCP)      │
└────────┬────────┘
         │ monitors
         ▼
┌─────────────────┐
│  Test Context   │ ← Drift detection, quality monitoring
│      (TCP)      │
└─────────────────┘
```

## Database Schema

All protocols are persisted in Supabase with:
- Core context tables (human_contexts, business_contexts, etc.)
- Validation results (protocol_validations)
- Drift reports (drift_reports) with time-series metrics
- Protocol links (protocol_links) for relationships

Row Level Security (RLS) is enabled with public read/write for demo purposes.

## Validation System

Each protocol has a TypeScript validator that checks:
- **Required fields**: Ensures mandatory data is present
- **Structure validation**: Verifies nested objects and arrays
- **Cross-protocol alignment**: Checks consistency across linked protocols
- **RDF compliance**: Validates URIs and semantic structures
- **Warnings**: Non-critical issues that should be addressed

Validation results are stored in the database with:
- `conforms`: boolean indicating pass/fail
- `errors`: blocking validation failures
- `warnings`: recommendations for improvement

## Drift Detection Engine

The TCP implementation includes a comprehensive drift detector:

### Statistical Methods

1. **PSI (Population Stability Index)**
   - Bins data into histograms
   - Compares baseline vs current distributions
   - Threshold: 0.1 (moderate), 0.25 (critical)

2. **KS Statistic (Kolmogorov-Smirnov)**
   - Measures max difference in CDFs
   - Non-parametric test
   - Threshold: 0.2 (moderate), 0.5 (critical)

3. **KL Divergence**
   - Information-theoretic distance
   - Asymmetric measure
   - Useful for probability distributions

4. **JS Divergence**
   - Symmetric version of KL
   - Bounded between 0 and 1
   - More interpretable than KL

### Drift Velocity Calculation

- Tracks rate of change over time
- Rolling window comparison (e.g., 7-day)
- Helps predict future drift trends
- Enables proactive intervention

## Usage

### Creating Protocols

1. Click "Create Full Demo" to generate a complete linked set of protocols
2. Or create individual protocols from each panel
3. All protocols are validated on creation

### Running Drift Detection

1. Navigate to Test Context Protocol panel
2. Select a TCP instance
3. Click "Run Drift Detection"
4. View results with metrics and alerts

### Configuring API Settings

1. Navigate to the Settings panel in the sidebar
2. Add your API configurations:
   - API Name (e.g., OpenAI, Anthropic, Custom)
   - API Key / Private Key
   - Base URL (optional, for custom endpoints)
3. Enable/disable APIs as needed
4. Click "Test Connection" to verify API keys
5. Click "Save Settings" to persist configuration
6. Supported providers:
   - OpenAI (GPT models)
   - Anthropic (Claude models)
   - Custom APIs (your own endpoints)

### Viewing Validations

- Each protocol card shows validation status
- Green checkmark: fully compliant
- Red X: validation errors present
- Orange warning: warnings to review
- Expand cards to see detailed validation results

## Key Features

1. **Full RDF/Semantic Web Support**: Uses standard vocabularies (schema.org, FOAF, ODRL, DCAT)
2. **SHACL Validation**: Implements W3C standard constraint validation
3. **Protocol Linking**: Maintains relationships between contexts
4. **Real-time Validation**: Immediate feedback on data quality
5. **Drift Monitoring**: Statistical drift detection with multiple methods
6. **Data Mesh Principles**: Domain-oriented, federated data governance
7. **ODRL Policies**: Machine-readable permission rules
8. **Audit Trail**: Complete provenance tracking
9. **API Management**: Secure API key storage and connection testing
10. **Multi-Provider Support**: OpenAI, Anthropic, and custom API integrations

## Technologies

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Validation**: Custom TypeScript validators (SHACL-inspired)
- **Statistics**: Custom drift detection implementation
- **Data Format**: JSON with JSON-LD compatibility

## Future Enhancements

1. **SPARQL Endpoint**: Query protocols using SPARQL
2. **Graph Visualization**: Visual protocol relationships
3. **Real-time Monitoring**: WebSocket-based drift alerts
4. **Agent Integration**: Connect actual AI agents to protocols
5. **Policy Enforcement**: Automated ODRL policy application
6. **Advanced Analytics**: Time-series analysis and predictions
7. **Export/Import**: RDF/Turtle export for interoperability

## Standards & References

- **W3C SHACL**: https://www.w3.org/TR/shacl/
- **ODRL**: https://www.w3.org/TR/odrl-model/
- **DCAT**: https://www.w3.org/TR/vocab-dcat/
- **Schema.org**: https://schema.org/
- **Data Mesh**: https://www.datamesh-architecture.com/
- **Agent Communication**: Anthropic MCP specification

## License

This is a demonstration implementation. Consult your organization's policies for production use.
