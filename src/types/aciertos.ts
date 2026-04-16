export type SessionStatus = 'draft' | 'completed';

export interface Compromiso {
  tipo: 'colaborador' | 'empresa';
  descripcion: string;
  fecha: string;
}

export interface AciertosSession {
  id: string;
  evaluator_employee_id: string;
  target_employee_id: string;
  period: string;
  status: SessionStatus;
  resultado_actual: string;
  resultado_objetivo: string;
  aciertos_colaborador: string[];
  desaciertos_colaborador: string[];
  retroalimentacion_empresa: string[];
  compromisos: Compromiso[];
  created_at: string;
  completed_at: string | null;
}

export type AciertosSessionInsert = Omit<AciertosSession, 'id' | 'created_at' | 'completed_at'>;
