export interface DriftMetrics {
  psi: number;
  kl_divergence?: number;
  js_divergence?: number;
  ks_statistic?: number;
  ad_statistic?: number;
  distribution_shift: boolean;
  drift_severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DriftAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
}

export class DriftDetector {
  calculatePSI(baseline: number[], current: number[], bins: number = 10): number {
    const baselineHist = this.histogram(baseline, bins);
    const currentHist = this.histogram(current, bins);

    let psi = 0;
    for (let i = 0; i < bins; i++) {
      const baselineProp = (baselineHist[i] + 0.0001) / baseline.length;
      const currentProp = (currentHist[i] + 0.0001) / current.length;
      psi += (currentProp - baselineProp) * Math.log(currentProp / baselineProp);
    }

    return psi;
  }

  calculateKLDivergence(baseline: number[], current: number[], bins: number = 10): number {
    const baselineHist = this.histogram(baseline, bins);
    const currentHist = this.histogram(current, bins);

    let kl = 0;
    for (let i = 0; i < bins; i++) {
      const p = (baselineHist[i] + 0.0001) / baseline.length;
      const q = (currentHist[i] + 0.0001) / current.length;
      kl += p * Math.log(p / q);
    }

    return kl;
  }

  calculateJSDivergence(baseline: number[], current: number[], bins: number = 10): number {
    const baselineHist = this.histogram(baseline, bins);
    const currentHist = this.histogram(current, bins);

    const m = baselineHist.map((val, i) => (val + currentHist[i]) / 2);

    let jsP = 0;
    let jsQ = 0;

    for (let i = 0; i < bins; i++) {
      const p = (baselineHist[i] + 0.0001) / baseline.length;
      const q = (currentHist[i] + 0.0001) / current.length;
      const mVal = (m[i] + 0.0001) / baseline.length;

      jsP += p * Math.log(p / mVal);
      jsQ += q * Math.log(q / mVal);
    }

    return 0.5 * jsP + 0.5 * jsQ;
  }

  calculateKSStatistic(baseline: number[], current: number[]): number {
    const sortedBaseline = [...baseline].sort((a, b) => a - b);
    const sortedCurrent = [...current].sort((a, b) => a - b);

    let maxDiff = 0;
    let i = 0, j = 0;
    const n1 = baseline.length;
    const n2 = current.length;

    while (i < n1 && j < n2) {
      const cdf1 = (i + 1) / n1;
      const cdf2 = (j + 1) / n2;
      maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));

      if (sortedBaseline[i] < sortedCurrent[j]) {
        i++;
      } else {
        j++;
      }
    }

    return maxDiff;
  }

  detectDrift(
    baseline: Record<string, number[]>,
    current: Record<string, number[]>,
    thresholds: Record<string, number> = { psi: 0.1, ks: 0.2 }
  ): { metrics: Record<string, DriftMetrics>; alerts: DriftAlert[] } {
    const metrics: Record<string, DriftMetrics> = {};
    const alerts: DriftAlert[] = [];

    for (const [feature, baselineData] of Object.entries(baseline)) {
      const currentData = current[feature];
      if (!currentData || currentData.length === 0) {
        continue;
      }

      const psi = this.calculatePSI(baselineData, currentData);
      const ks = this.calculateKSStatistic(baselineData, currentData);
      const kl = this.calculateKLDivergence(baselineData, currentData);
      const js = this.calculateJSDivergence(baselineData, currentData);

      const distributionShift = psi > (thresholds.psi || 0.1) || ks > (thresholds.ks || 0.2);

      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (psi > 0.25 || ks > 0.5) {
        severity = 'critical';
      } else if (psi > 0.15 || ks > 0.3) {
        severity = 'high';
      } else if (psi > 0.1 || ks > 0.2) {
        severity = 'medium';
      }

      metrics[feature] = {
        psi,
        ks_statistic: ks,
        kl_divergence: kl,
        js_divergence: js,
        distribution_shift: distributionShift,
        drift_severity: severity
      };

      if (distributionShift) {
        alerts.push({
          metric: feature,
          value: psi,
          threshold: thresholds.psi || 0.1,
          severity: severity === 'critical' || severity === 'high' ? 'critical' : 'warning',
          message: `Distribution drift detected in ${feature}: PSI=${psi.toFixed(4)}, KS=${ks.toFixed(4)}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    return { metrics, alerts };
  }

  calculateDriftVelocity(historicalMetrics: Array<{ timestamp: string; psi: number }>): number {
    if (historicalMetrics.length < 2) {
      return 0;
    }

    const sorted = [...historicalMetrics].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let totalVelocity = 0;
    for (let i = 1; i < sorted.length; i++) {
      const timeDiff = (new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const psiDiff = sorted[i].psi - sorted[i - 1].psi;
      totalVelocity += Math.abs(psiDiff) / timeDiff;
    }

    return totalVelocity / (sorted.length - 1);
  }

  private histogram(data: number[], bins: number): number[] {
    if (data.length === 0) return new Array(bins).fill(0);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;

    const hist = new Array(bins).fill(0);

    for (const value of data) {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex === bins) binIndex = bins - 1;
      hist[binIndex]++;
    }

    return hist;
  }

  generateBaselineSnapshot(data: Record<string, any[]>): Record<string, any> {
    const snapshot: Record<string, any> = {
      timestamp: new Date().toISOString(),
      features: {}
    };

    for (const [feature, values] of Object.entries(data)) {
      const numericValues = values.filter(v => typeof v === 'number') as number[];

      if (numericValues.length > 0) {
        snapshot.features[feature] = {
          type: 'numeric',
          mean: this.mean(numericValues),
          std: this.std(numericValues),
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          count: numericValues.length,
          distribution: this.histogram(numericValues, 10)
        };
      } else {
        const categories = this.countCategories(values);
        snapshot.features[feature] = {
          type: 'categorical',
          categories,
          count: values.length
        };
      }
    }

    return snapshot;
  }

  private mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private std(values: number[]): number {
    const avg = this.mean(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  private countCategories(values: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const value of values) {
      const key = String(value);
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
}

export const driftDetector = new DriftDetector();
