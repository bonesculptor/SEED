import { TestContext } from '../lib/supabase';
import { ValidationResult, ValidationError, ValidationWarning } from './hcpValidator';

export class TCPValidator {
  validate(tcp: Partial<TestContext>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!tcp.tcp_id) {
      errors.push({ path: 'tcp_id', message: 'TCP ID is required', severity: 'error' });
    }

    if (!tcp.title) {
      errors.push({ path: 'title', message: 'Title is required', severity: 'error' });
    }

    if (!tcp.version) {
      errors.push({ path: 'version', message: 'Version is required', severity: 'error' });
    }

    if (!tcp.owner_name) {
      errors.push({ path: 'owner_name', message: 'Owner name is required', severity: 'error' });
    }

    if (!tcp.baseline || Object.keys(tcp.baseline).length === 0) {
      errors.push({ path: 'baseline', message: 'Baseline configuration is required', severity: 'error' });
    } else {
      if (!tcp.baseline.snapshot_date) {
        warnings.push({ path: 'baseline.snapshot_date', message: 'Baseline should have a snapshot date', severity: 'warning' });
      }
      if (!tcp.baseline.metrics || Object.keys(tcp.baseline.metrics).length === 0) {
        warnings.push({ path: 'baseline.metrics', message: 'Baseline should define metrics', severity: 'warning' });
      }
    }

    if (!tcp.monitoring || Object.keys(tcp.monitoring).length === 0) {
      warnings.push({ path: 'monitoring', message: 'No monitoring configuration', severity: 'warning' });
    } else {
      if (!tcp.monitoring.frequency) {
        warnings.push({ path: 'monitoring.frequency', message: 'Monitoring should specify frequency', severity: 'warning' });
      }
    }

    if (!tcp.drift_config || Object.keys(tcp.drift_config).length === 0) {
      warnings.push({ path: 'drift_config', message: 'No drift detection configuration', severity: 'warning' });
    } else {
      if (!tcp.drift_config.methods || !Array.isArray(tcp.drift_config.methods) || tcp.drift_config.methods.length === 0) {
        warnings.push({ path: 'drift_config.methods', message: 'No drift detection methods specified', severity: 'warning' });
      }
      if (!tcp.drift_config.thresholds || Object.keys(tcp.drift_config.thresholds).length === 0) {
        warnings.push({ path: 'drift_config.thresholds', message: 'No drift thresholds defined', severity: 'warning' });
      }
    }

    if (!tcp.alerting || Object.keys(tcp.alerting).length === 0) {
      warnings.push({ path: 'alerting', message: 'No alerting configuration', severity: 'warning' });
    } else {
      if (!tcp.alerting.channels || !Array.isArray(tcp.alerting.channels) || tcp.alerting.channels.length === 0) {
        warnings.push({ path: 'alerting.channels', message: 'No alert channels defined', severity: 'warning' });
      }
    }

    return {
      conforms: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const tcpValidator = new TCPValidator();
