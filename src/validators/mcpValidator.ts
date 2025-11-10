import { MachineContext } from '../lib/supabase';
import { ValidationResult, ValidationError, ValidationWarning } from './hcpValidator';

export class MCPValidator {
  validate(mcp: Partial<MachineContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!mcp.mcp_id) {
      errors.push({ path: 'mcp_id', message: 'MCP ID is required', severity: 'error' });
    }

    if (!mcp.title) {
      errors.push({ path: 'title', message: 'Title is required', severity: 'error' });
    }

    if (!mcp.version) {
      errors.push({ path: 'version', message: 'Version is required', severity: 'error' });
    }

    if (!mcp.owner_name) {
      errors.push({ path: 'owner_name', message: 'Owner name is required', severity: 'error' });
    }

    if (!mcp.pipeline || Object.keys(mcp.pipeline).length === 0) {
      errors.push({ path: 'pipeline', message: 'Pipeline configuration is required', severity: 'error' });
    } else {
      if (!mcp.pipeline.name) {
        warnings.push({ path: 'pipeline.name', message: 'Pipeline should have a name', severity: 'warning' });
      }
      if (!mcp.pipeline.stages || !Array.isArray(mcp.pipeline.stages) || mcp.pipeline.stages.length === 0) {
        warnings.push({ path: 'pipeline.stages', message: 'Pipeline should define stages', severity: 'warning' });
      }
    }

    if (!mcp.tasks || mcp.tasks.length === 0) {
      warnings.push({ path: 'tasks', message: 'No ML tasks defined', severity: 'warning' });
    }

    if (!mcp.models || mcp.models.length === 0) {
      warnings.push({ path: 'models', message: 'No models defined', severity: 'warning' });
    } else {
      mcp.models.forEach((model: any, index: number) => {
        if (!model.name) {
          errors.push({ path: `models[${index}].name`, message: 'Model must have a name', severity: 'error' });
        }
        if (!model.type) {
          warnings.push({ path: `models[${index}].type`, message: 'Model should specify type', severity: 'warning' });
        }
      });
    }

    if (!mcp.deployment || Object.keys(mcp.deployment).length === 0) {
      warnings.push({ path: 'deployment', message: 'No deployment configuration', severity: 'warning' });
    }

    if (!mcp.monitoring || Object.keys(mcp.monitoring).length === 0) {
      warnings.push({ path: 'monitoring', message: 'No monitoring configuration', severity: 'warning' });
    } else {
      if (!mcp.monitoring.metrics || !Array.isArray(mcp.monitoring.metrics) || mcp.monitoring.metrics.length === 0) {
        warnings.push({ path: 'monitoring.metrics', message: 'No monitoring metrics defined', severity: 'warning' });
      }
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const mcpValidator = new MCPValidator();
