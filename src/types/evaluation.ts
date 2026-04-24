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

export interface PercepcionAssignment {
  evaluatorId: string;
  targetId: string;
  assignedAt: string;
  completedAt?: string;
}

export type Eval360Role = 'self' | 'leader' | 'peer' | 'collaborator' | 'client' | 'anonymous';

export type Eval360Period =
  | 'Q1-2025' | 'Q2-2025' | 'Q3-2025' | 'Q4-2025'
  | 'Q1-2026' | 'Q2-2026' | 'Q3-2026' | 'Q4-2026'
  | 'Q1-2024' | 'Q2-2024' | 'Q3-2024' | 'Q4-2024';

export const EVAL_360_PERIODS: { value: Eval360Period; label: string }[] = [
  { value: 'Q1-2025', label: 'Q1 2025 (Ene–Mar)' },
  { value: 'Q2-2025', label: 'Q2 2025 (Abr–Jun)' },
  { value: 'Q3-2025', label: 'Q3 2025 (Jul–Sep)' },
  { value: 'Q4-2025', label: 'Q4 2025 (Oct–Dic)' },
  { value: 'Q1-2026', label: 'Q1 2026 (Ene–Mar)' },
  { value: 'Q2-2026', label: 'Q2 2026 (Abr–Jun)' },
  { value: 'Q3-2026', label: 'Q3 2026 (Jul–Sep)' },
  { value: 'Q4-2026', label: 'Q4 2026 (Oct–Dic)' },
  { value: 'Q4-2024', label: 'Q4 2024 (Oct–Dic)' },
  { value: 'Q3-2024', label: 'Q3 2024 (Jul–Sep)' },
];

export const EVAL_360_ROLE_LABELS: Record<Eval360Role, string> = {
  self: 'Autoevaluación',
  leader: 'Evaluación por Líder',
  peer: 'Evaluación por Par',
  collaborator: 'Evaluación por Colaborador',
  client: 'Evaluación por Cliente',
  anonymous: 'Evaluación Anónima',
};

/** A 360 evaluation session groups all assignments for one employee in one period */
export interface Evaluation360Session {
  id: string;
  targetEmployeeId: string;
  name: string;
  description: string;
  period: Eval360Period;
  dueDate: string;
  templateId: string;
  createdAt: string;
}

export interface Eval360Assignment {
  id: string;
  sessionId: string;
  targetEmployeeId: string;
  role: Eval360Role;
  evaluatorName: string;
  evaluatorEmployeeId?: string;
  isAnonymous: boolean;
  assignedAt: string;
  completedAt?: string;
  scores?: number[];
}

export interface EvaluationStorage {
  threeSixty: Record<string, Employee360Data>;
  percepcion: Record<string, PerceptionPlacement[]>;
  autoPercepcion: Record<string, PerceptionPlacement>;
  assignments: PercepcionAssignment[];
  eval360Assignments: Eval360Assignment[];
  eval360Sessions: Evaluation360Session[];
}
