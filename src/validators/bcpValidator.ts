import { BusinessContext } from '../lib/supabase';
import { ValidationResult, ValidationError, ValidationWarning } from './hcpValidator';

export class BCPValidator {
  validate(bcp: Partial<BusinessContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!bcp.bcp_id) {
      errors.push({ path: 'bcp_id', message: 'BCP ID is required', severity: 'error' });
    }

    if (!bcp.title) {
      errors.push({ path: 'title', message: 'Title is required', severity: 'error' });
    }

    if (!bcp.version) {
      errors.push({ path: 'version', message: 'Version is required', severity: 'error' });
    }

    if (!bcp.owner_name) {
      errors.push({ path: 'owner_name', message: 'Owner name is required', severity: 'error' });
    }

    if (!bcp.validity_from) {
      errors.push({ path: 'validity_from', message: 'Validity start date is required', severity: 'error' });
    }

    if (!bcp.customer_segments || bcp.customer_segments.length === 0) {
      warnings.push({ path: 'customer_segments', message: 'No customer segments defined', severity: 'warning' });
    }

    if (!bcp.value_propositions || bcp.value_propositions.length === 0) {
      warnings.push({ path: 'value_propositions', message: 'No value propositions defined', severity: 'warning' });
    }

    if (!bcp.channels || bcp.channels.length === 0) {
      warnings.push({ path: 'channels', message: 'No channels defined', severity: 'warning' });
    }

    if (!bcp.key_resources || bcp.key_resources.length === 0) {
      warnings.push({ path: 'key_resources', message: 'No key resources defined', severity: 'warning' });
    }

    if (!bcp.key_activities || bcp.key_activities.length === 0) {
      warnings.push({ path: 'key_activities', message: 'No key activities defined', severity: 'warning' });
    }

    if (!bcp.revenue_streams || bcp.revenue_streams.length === 0) {
      warnings.push({ path: 'revenue_streams', message: 'No revenue streams defined', severity: 'warning' });
    }

    if (!bcp.cost_structure || bcp.cost_structure.length === 0) {
      warnings.push({ path: 'cost_structure', message: 'No cost structure defined', severity: 'warning' });
    }

    if (!bcp.metrics || Object.keys(bcp.metrics).length === 0) {
      warnings.push({ path: 'metrics', message: 'No business metrics defined', severity: 'warning' });
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }

  validateOBCAlignment(bcp: Partial<BusinessContext>, hcp?: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (hcp) {
      const hcpStakeholders = hcp.identity?.stakeholders || [];
      if (hcpStakeholders.length > 0 && (!bcp.customer_segments || bcp.customer_segments.length === 0)) {
        warnings.push({
          path: 'customer_segments',
          message: 'HCP has stakeholders but BCP has no customer segments',
          severity: 'warning'
        });
      }

      const hcpPurposes = hcp.context?.purposes || [];
      if (hcpPurposes.length > 0 && (!bcp.value_propositions || bcp.value_propositions.length === 0)) {
        warnings.push({
          path: 'value_propositions',
          message: 'HCP has purposes but BCP has no value propositions',
          severity: 'warning'
        });
      }
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const bcpValidator = new BCPValidator();
