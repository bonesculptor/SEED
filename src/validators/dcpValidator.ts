import { DataContext } from '../lib/supabase';
import { ValidationResult, ValidationError, ValidationWarning } from './hcpValidator';

export class DCPValidator {
  validate(dcp: Partial<DataContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!dcp.dcp_id) {
      errors.push({ path: 'dcp_id', message: 'DCP ID is required', severity: 'error' });
    }

    if (!dcp.title) {
      errors.push({ path: 'title', message: 'Title is required', severity: 'error' });
    }

    if (!dcp.version) {
      errors.push({ path: 'version', message: 'Version is required', severity: 'error' });
    }

    if (!dcp.owner_name) {
      errors.push({ path: 'owner_name', message: 'Owner name is required', severity: 'error' });
    }

    if (!dcp.domain) {
      errors.push({ path: 'domain', message: 'Domain is required', severity: 'error' });
    }

    if (!dcp.data_products || dcp.data_products.length === 0) {
      errors.push({ path: 'data_products', message: 'At least one data product is required', severity: 'error' });
    } else {
      dcp.data_products.forEach((product: any, index: number) => {
        if (!product.name) {
          errors.push({ path: `data_products[${index}].name`, message: 'Data product must have a name', severity: 'error' });
        }
        if (!product.owner) {
          errors.push({ path: `data_products[${index}].owner`, message: 'Data product must have an owner', severity: 'error' });
        }
        if (!product.contract) {
          warnings.push({ path: `data_products[${index}].contract`, message: 'Data product should have a contract URI', severity: 'warning' });
        }
      });
    }

    if (!dcp.contracts || Object.keys(dcp.contracts).length === 0) {
      warnings.push({ path: 'contracts', message: 'No data contracts defined', severity: 'warning' });
    }

    if (!dcp.slas || Object.keys(dcp.slas).length === 0) {
      warnings.push({ path: 'slas', message: 'No SLAs defined', severity: 'warning' });
    } else {
      if (!dcp.slas.freshness) {
        warnings.push({ path: 'slas.freshness', message: 'No freshness SLA defined', severity: 'warning' });
      }
      if (!dcp.slas.completeness) {
        warnings.push({ path: 'slas.completeness', message: 'No completeness SLA defined', severity: 'warning' });
      }
      if (!dcp.slas.accuracy) {
        warnings.push({ path: 'slas.accuracy', message: 'No accuracy SLA defined', severity: 'warning' });
      }
    }

    if (!dcp.policies || dcp.policies.length === 0) {
      warnings.push({ path: 'policies', message: 'No ODRL policies defined', severity: 'warning' });
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }

  validateDataMesh(dcp: Partial<DataContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (dcp.data_products) {
      dcp.data_products.forEach((product: any, index: number) => {
        if (!product.schema) {
          warnings.push({
            path: `data_products[${index}].schema`,
            message: 'Data product should define a schema',
            severity: 'warning'
          });
        }

        if (!product.quality_metrics) {
          warnings.push({
            path: `data_products[${index}].quality_metrics`,
            message: 'Data product should define quality metrics',
            severity: 'warning'
          });
        }
      });
    }

    if (!dcp.ports || dcp.ports.length === 0) {
      warnings.push({ path: 'ports', message: 'No data ports (input/output) defined', severity: 'warning' });
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const dcpValidator = new DCPValidator();
