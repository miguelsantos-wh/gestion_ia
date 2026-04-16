import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Eye, FileText, ChevronRight, X } from 'lucide-react';
import type { Employee } from '../../types';
import type { AciertosSession } from '../../types/aciertos';
import { getSessionsByTarget } from '../../lib/aciertosService';
import { EMPLOYEES } from '../../data/mockData';
import AciertosSessionView from './AciertosSessionView';

function StatusPill({ status }: { status: 'draft' | 'completed' }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
        <CheckCircle size={9} />
        Completada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
      <Clock size={9} />
      Pendiente
    </span>
  );
}

interface AciertosEmployeeViewProps {
  employee: Employee;
}

export default function AciertosEmployeeView({ employee }: AciertosEmployeeViewProps) {
  const [sessions, setSessions] = useState<AciertosSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSession, setViewSession] = useState<AciertosSession | null>(null);

  useEffect(() => {
    void getSessionsByTarget(employee.id)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [employee.id]);

  const completed = sessions.filter((s) => s.status === 'completed');
  const drafts = sessions.filter((s) => s.status === 'draft');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Cargando evaluaciones...
      </div>
    );
  }

  if (viewSession) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Detalle de evaluación</h3>
          <button
            type="button"
            onClick={() => setViewSession(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <AciertosSessionView session={viewSession} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3 text-center">
          <div className="text-xs text-gray-500 mb-0.5">Total</div>
          <div className="text-lg font-black text-gray-900">{sessions.length}</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-3 text-center">
          <div className="text-xs text-emerald-600 mb-0.5">Completadas</div>
          <div className="text-lg font-black text-emerald-700">{completed.length}</div>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-3 text-center">
          <div className="text-xs text-amber-600 mb-0.5">Pendientes</div>
          <div className="text-lg font-black text-amber-700">{drafts.length}</div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={28} className="text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-gray-700 mb-2">Sin evaluaciones</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            No tienes evaluaciones de Aciertos y Desaciertos asignadas aún.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const evaluator = EMPLOYEES.find((e) => e.id === s.evaluator_employee_id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setViewSession(s)}
                className="w-full text-left rounded-2xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusPill status={s.status} />
                      <span className="text-sm font-bold text-gray-800 truncate">{s.period || 'Sin periodo'}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Evaluador: {evaluator?.name ?? 'Desconocido'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {s.resultado_actual && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-1 bg-gray-50 rounded-lg px-2 py-1">
                        {s.resultado_actual}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-1">
                    <Eye size={13} className="text-gray-300" />
                    <ChevronRight size={13} className="text-gray-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
