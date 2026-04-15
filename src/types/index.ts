export type PotentialLevel = 'low' | 'medium' | 'high';
export type PerformanceLevel = 'low' | 'medium' | 'high';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  performance: number;
  potential: number;
  performanceLevel: PerformanceLevel;
  potentialLevel: PotentialLevel;
  avatar: string;
  tenure: number;
  age: number;
  lastReview: string;
  goals: { label: string; progress: number }[];
  competencies: { label: string; score: number }[];
}

export interface Department {
  id: string;
  name: string;
  headCount: number;
  avgPerformance: number;
  avgPotential: number;
}

export interface BoxConfig {
  id: string;
  /** Código del cuadrante (A, B4, C1, …) */
  code: string;
  label: string;
  /** Resumen corto (p. ej. mix valores/resultados) para celdas y leyendas */
  description: string;
  /** Definición ampliada por viñetas */
  detailBullets: string[];
  color: string;
  bgColor: string;
  textColor: string;
  recommendation: string;
  potentialLevel: PotentialLevel;
  performanceLevel: PerformanceLevel;
}

export type ViewType = 'overview' | 'individual' | 'eval360';
