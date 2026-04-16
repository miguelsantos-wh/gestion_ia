import { supabase } from './supabase';
import type { AciertosSession, AciertosSessionInsert } from '../types/aciertos';

export async function getSessionsByTarget(targetEmployeeId: string): Promise<AciertosSession[]> {
  const { data, error } = await supabase
    .from('aciertos_desaciertos_sessions')
    .select('*')
    .eq('target_employee_id', targetEmployeeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AciertosSession[];
}

export async function getSessionsByEvaluator(evaluatorEmployeeId: string): Promise<AciertosSession[]> {
  const { data, error } = await supabase
    .from('aciertos_desaciertos_sessions')
    .select('*')
    .eq('evaluator_employee_id', evaluatorEmployeeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AciertosSession[];
}

export async function getAllSessions(): Promise<AciertosSession[]> {
  const { data, error } = await supabase
    .from('aciertos_desaciertos_sessions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AciertosSession[];
}

export async function createSession(session: AciertosSessionInsert): Promise<AciertosSession> {
  const { data, error } = await supabase
    .from('aciertos_desaciertos_sessions')
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data as AciertosSession;
}

export async function updateSession(id: string, updates: Partial<AciertosSessionInsert> & { completed_at?: string | null }): Promise<AciertosSession> {
  const { data, error } = await supabase
    .from('aciertos_desaciertos_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AciertosSession;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('aciertos_desaciertos_sessions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
