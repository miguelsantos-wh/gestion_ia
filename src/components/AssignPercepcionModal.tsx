import { useState, useMemo } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { X, Search, CheckCircle, Users, UserCheck } from 'lucide-react';
import type { Employee } from '../types';

interface AssignPercepcionModalProps {
  targetEmployee: Employee;
  onClose: () => void;
}

export default function AssignPercepcionModal({ targetEmployee, onClose }: AssignPercepcionModalProps) {
  const { assignments, saveAssignment } = useEvaluationStore();
  const [search, setSearch] = useState('');
  const [justAssigned, setJustAssigned] = useState<string | null>(null);

  const evaluators = useMemo(
    () =>
      EMPLOYEES.filter(
        (e) =>
          e.id !== targetEmployee.id &&
          (e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.position.toLowerCase().includes(search.toLowerCase()) ||
            e.department.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, targetEmployee.id]
  );

  const pendingForTarget = useMemo(
    () => new Set(assignments.filter((a) => a.targetId === targetEmployee.id && !a.completedAt).map((a) => a.evaluatorId)),
    [assignments, targetEmployee.id]
  );

  const assign = (evaluator: Employee) => {
    saveAssignment(evaluator.id, targetEmployee.id);
    setJustAssigned(evaluator.id);
    setTimeout(() => setJustAssigned(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Asignar evaluador</h2>
              <p className="text-xs text-gray-500">Para: {targetEmployee.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Selecciona quién va a evaluar a <strong>{targetEmployee.name}</strong> en la matriz 9-Box. La evaluación aparecerá como tarea pendiente en su portal.
          </p>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {evaluators.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">Sin resultados</div>
            ) : (
              evaluators.map((emp) => {
                const isPending = pendingForTarget.has(emp.id);
                const wasJustAssigned = justAssigned === emp.id;

                return (
                  <div
                    key={emp.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isPending ? 'bg-teal-50 border border-teal-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{emp.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{emp.position} · {emp.department}</div>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-1 text-teal-600 shrink-0">
                        <UserCheck size={14} />
                        <span className="text-[10px] font-bold">Asignado</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => assign(emp)}
                        className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          wasJustAssigned
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                      >
                        {wasJustAssigned ? <CheckCircle size={12} /> : <UserCheck size={12} />}
                        {wasJustAssigned ? 'Listo' : 'Asignar'}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
