import type { PerformanceLevel, PotentialLevel } from './index';

export type EvaluationLens = 'metrika' | 'percepcion' | 'autoevaluacion';

export interface ScaleOption {
  value: 1 | 2 | 3 | 4 | 5;
  text: string;
}

export interface CompetencyItem {
  id: string;
  order: number;
  statement: string;
  options: ScaleOption[];
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  applicableTo: string;
  items: CompetencyItem[];
}

export interface PeerSubmission {
  evaluatorName: string;
  scores: number[];
  at: string;
}

export interface Employee360Data {
  self?: number[];
  peers: PeerSubmission[];
}

export interface PerceptionPlacement {
  evaluatorName: string;
  performanceLevel: PerformanceLevel;
  potentialLevel: PotentialLevel;
  at: string;
}

export const STORAGE_KEY = 'ninebox-evaluations-v2';

export interface EvaluationStorage {
  threeSixty: Record<string, Employee360Data>;
  percepcion: Record<string, PerceptionPlacement[]>;
  autoPercepcion: Record<string, PerceptionPlacement>;
}
