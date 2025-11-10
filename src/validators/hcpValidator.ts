import { HumanContext } from '../lib/supabase';

export interface ValidationResult {
  conforms: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  path: string;
  message: string;
  severity: 'warning';
}

export class HCPValidator {
  validate(hcp: Partial<HumanContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!hcp.hcp_id) {
      errors.push({ path: 'hcp_id', message: 'HCP ID is required', severity: 'error' });
    }

    if (!hcp.title) {
      errors.push({ path: 'title', message: 'Title is required', severity: 'error' });
    }

    if (!hcp.version) {
      errors.push({ path: 'version', message: 'Version is required', severity: 'error' });
    }

    if (!hcp.owner_name) {
      errors.push({ path: 'owner_name', message: 'Owner name is required', severity: 'error' });
    }

    if (!hcp.validity_from) {
      errors.push({ path: 'validity_from', message: 'Validity start date is required', severity: 'error' });
    }

    if (!hcp.identity || Object.keys(hcp.identity).length === 0) {
      errors.push({ path: 'identity', message: 'Identity section is required', severity: 'error' });
    } else {
      if (!hcp.identity.humans || !Array.isArray(hcp.identity.humans) || hcp.identity.humans.length === 0) {
        errors.push({ path: 'identity.humans', message: 'At least one human must be specified', severity: 'error' });
      }
    }

    if (!hcp.context || Object.keys(hcp.context).length === 0) {
      warnings.push({ path: 'context', message: 'Context section is empty', severity: 'warning' });
    } else {
      if (!hcp.context.locations || !Array.isArray(hcp.context.locations) || hcp.context.locations.length === 0) {
        warnings.push({ path: 'context.locations', message: 'No locations specified', severity: 'warning' });
      }
      if (!hcp.context.purposes || !Array.isArray(hcp.context.purposes) || hcp.context.purposes.length === 0) {
        warnings.push({ path: 'context.purposes', message: 'No purposes specified', severity: 'warning' });
      }
    }

    if (!hcp.rules || Object.keys(hcp.rules).length === 0) {
      warnings.push({ path: 'rules', message: 'No rules/guardrails defined', severity: 'warning' });
    } else {
      if (!hcp.rules.permissions || !Array.isArray(hcp.rules.permissions) || hcp.rules.permissions.length === 0) {
        warnings.push({ path: 'rules.permissions', message: 'No permissions defined', severity: 'warning' });
      }
    }

    if (!hcp.delegation || Object.keys(hcp.delegation).length === 0) {
      warnings.push({ path: 'delegation', message: 'No delegation rules defined', severity: 'warning' });
    }

    if (!hcp.audit || Object.keys(hcp.audit).length === 0) {
      warnings.push({ path: 'audit', message: 'No audit/provenance rules defined', severity: 'warning' });
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }

  validateRDF(hcp: Partial<HumanContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (hcp.identity?.humans) {
      hcp.identity.humans.forEach((human: any, index: number) => {
        if (!human.uri) {
          warnings.push({
            path: `identity.humans[${index}].uri`,
            message: 'Human should have a persistent URI (e.g., DID)',
            severity: 'warning'
          });
        }
      });
    }

    if (hcp.context?.locations) {
      hcp.context.locations.forEach((location: any, index: number) => {
        if (!location.geo || !location.geo.lat || !location.geo.lon) {
          warnings.push({
            path: `context.locations[${index}].geo`,
            message: 'Location should have geo coordinates (lat/lon)',
            severity: 'warning'
          });
        }
      });
    }

    if (hcp.resources?.digital) {
      hcp.resources.digital.forEach((resource: any, index: number) => {
        if (!resource.uri) {
          warnings.push({
            path: `resources.digital[${index}].uri`,
            message: 'Digital resource should have a URI',
            severity: 'warning'
          });
        }
      });
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const hcpValidator = new HCPValidator();
