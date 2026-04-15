import type { Employee, PerformanceLevel, PotentialLevel } from '../types';
import type { Employee360Data, EvaluationLens, PerceptionPlacement } from '../types/evaluation';

/** Índices 0–10 del cuestionario 360: ejes para 9-Box */
const PERF_ITEM_IDX = [2, 4, 7, 9, 10];
const POT_ITEM_IDX = [0, 1, 3, 5, 6, 8];

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function scoresToPerformancePotential(scores: number[]): {
  performance: number;
  potential: number;
} {
  const perfVals = PERF_ITEM_IDX.map((i) => scores[i]).filter((n) => typeof n === 'number' && n >= 1 && n <= 5);
  const potVals = POT_ITEM_IDX.map((i) => scores[i]).filter((n) => typeof n === 'number' && n >= 1 && n <= 5);
  return {
    performance: average(perfVals),
    potential: average(potVals),
  };
}

export function numericToLevel(v: number): PerformanceLevel | PotentialLevel {
  if (v < 2.34) return 'low';
  if (v < 3.67) return 'medium';
  return 'high';
}

function levelToNum(l: PerformanceLevel | PotentialLevel): number {
  if (l === 'low') return 1;
  if (l === 'medium') return 2;
  return 3;
}

function numToLevel(n: number): PerformanceLevel & PotentialLevel {
  if (n < 1.67) return 'low';
  if (n < 2.34) return 'medium';
  return 'high';
}

function aggregate360Scores(data: Employee360Data | undefined, mode: 'self' | 'all'): number[] | null {
  if (!data) return null;
  const rows: number[][] = [];
  if (mode === 'self' && data.self?.length === 11) rows.push(data.self);
  if (mode === 'all') {
    if (data.self?.length === 11) rows.push(data.self);
    data.peers.forEach((p) => {
      if (p.scores.length === 11) rows.push(p.scores);
    });
  }
  if (rows.length === 0) return null;
  const out: number[] = [];
  for (let i = 0; i < 11; i++) {
    out.push(average(rows.map((r) => r[i])));
  }
  return out;
}

export function deriveBoxFrom360(
  data: Employee360Data | undefined,
  mode: 'self' | 'all'
): { performanceLevel: PerformanceLevel; potentialLevel: PotentialLevel; performance: number; potential: number } | null {
  const agg = aggregate360Scores(data, mode);
  if (!agg) return null;
  const { performance, potential } = scoresToPerformancePotential(agg);
  return {
    performance,
    potential,
    performanceLevel: numericToLevel(performance) as PerformanceLevel,
    potentialLevel: numericToLevel(potential) as PotentialLevel,
  };
}

export function deriveBoxFromPerceptions(placements: PerceptionPlacement[] | undefined): {
  performanceLevel: PerformanceLevel;
  potentialLevel: PotentialLevel;
  performance: number;
  potential: number;
} | null {
  if (!placements?.length) return null;
  const perfN = average(placements.map((p) => levelToNum(p.performanceLevel)));
  const potN = average(placements.map((p) => levelToNum(p.potentialLevel)));
  return {
    performance: 1 + (perfN - 1) * 2,
    potential: 1 + (potN - 1) * 2,
    performanceLevel: numToLevel(perfN),
    potentialLevel: numToLevel(potN),
  };
}

const KPI_WEIGHT = 0.5;

export function deriveMetrikaBox(
  employee: Employee,
  data: Employee360Data | undefined
): { performanceLevel: PerformanceLevel; potentialLevel: PotentialLevel; performance: number; potential: number } {
  const from360 = deriveBoxFrom360(data, 'all');
  const kpiPerf = employee.performance;
  const kpiPot = employee.potential;

  if (!from360) {
    return {
      performanceLevel: employee.performanceLevel,
      potentialLevel: employee.potentialLevel,
      performance: kpiPerf,
      potential: kpiPot,
    };
  }

  const performance = KPI_WEIGHT * from360.performance + KPI_WEIGHT * kpiPerf;
  const potential = KPI_WEIGHT * from360.potential + KPI_WEIGHT * kpiPot;
  return {
    performance,
    potential,
    performanceLevel: numericToLevel(performance) as PerformanceLevel,
    potentialLevel: numericToLevel(potential) as PotentialLevel,
  };
}

export function employeeForLens(
  employee: Employee,
  lens: EvaluationLens,
  threeSixty: Record<string, Employee360Data>,
  percepcion: Record<string, PerceptionPlacement[]>
): Employee {
  const d360 = threeSixty[employee.id];
  const perc = percepcion[employee.id];

  if (lens === 'metrika') {
    const m = deriveMetrikaBox(employee, d360);
    return { ...employee, ...m };
  }
  if (lens === 'autoevaluacion') {
    const a = deriveBoxFrom360(d360, 'self');
    if (a) return { ...employee, ...a };
    return { ...employee };
  }
  if (lens === 'percepcion') {
    const p = deriveBoxFromPerceptions(perc);
    if (p) return { ...employee, ...p };
    return { ...employee };
  }
  return { ...employee };
}
