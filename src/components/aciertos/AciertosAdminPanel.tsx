import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ChevronRight, CheckCircle, Clock, Eye, CreditCard as Edit2, X, Users, FileText } from 'lucide-react';
import { EMPLOYEES } from '../../data/mockData';
import { useUser } from '../../context/UserContext';
import type { Employee } from '../../types';
import type { AciertosSession } from '../../types/aciertos';
import { getAllSessions, getSessionsByTarget } from '../../lib/aciertosService';
import AciertosForm from './AciertosForm';
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
      Borrador
    </span>
  );
}

function EmployeeListItem({
  employee,
  sessions,
  isSelected,
  onSelect,
}: {
  employee: Employee;
  sessions: AciertosSession[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const completed = sessions.filter((s) => s.status === 'completed').length;
  const drafts = sessions.filter((s) => s.status === 'draft').length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected ? 'border-slate-400 shadow-md ring-2 ring-slate-200' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      } bg-white`}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
          {employee.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{employee.name}</div>
          <div className="text-xs text-gray-500 truncate">{employee.position}</div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {sessions.length === 0 && (
              <span className="text-[10px] text-gray-400 italic">Sin evaluaciones</span>
            )}
            {completed > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle size={8} />
                {completed} completada{completed !== 1 ? 's' : ''}
              </span>
            )}
            {drafts > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                <Clock size={8} />
                {drafts} borrador{drafts !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        </div>
        <ChevronRight size={14} className={`text-gray-300 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
      </div>
    </button>
  );
}

type RightPanelState =
  | { type: 'empty' }
  | { type: 'list'; targetId: string }
  | { type: 'form'; targetId: string; sessionId?: string }
  | { type: 'view'; session: AciertosSession };

export default function AciertosAdminPanel() {
  const { currentEmployee } = useUser();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [allSessions, setAllSessions] = useState<AciertosSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<RightPanelState>({ type: 'empty' });

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setAllSessions(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const sessionsByEmployee = useMemo(() => {
    const map: Record<string, AciertosSession[]> = {};
    for (const s of allSessions) {
      if (!map[s.target_employee_id]) map[s.target_employee_id] = [];
      map[s.target_employee_id].push(s);
    }
    return map;
  }, [allSessions]);

  const filteredEmployees = useMemo(
    () =>
      EMPLOYEES.filter((e) => {
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
      }),
    [search]
  );

  const selectEmployee = (id: string) => {
    setSelectedId(id);
    setPanel({ type: 'list', targetId: id });
  };

  const handleSaved = async (session: AciertosSession) => {
    await loadSessions();
    setPanel({ type: 'view', session });
  };

  const evaluator = currentEmployee ?? EMPLOYEES[0];

  const totalCompleted = allSessions.filter((s) => s.status === 'completed').length;
  const totalDraft = allSessions.filter((s) => s.status === 'draft').length;
  const totalEmployeesWithEvals = new Set(allSessions.map((s) => s.target_employee_id)).size;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 h-full">
      <div className="xl:col-span-2 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <div className="text-xs text-gray-500 mb-0.5">Con evaluar</div>
            <div className="text-lg font-black text-gray-900">{totalEmployeesWithEvals}</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-3 text-center">
            <div className="text-xs text-emerald-600 mb-0.5">Completadas</div>
            <div className="text-lg font-black text-emerald-700">{totalCompleted}</div>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-3 text-center">
            <div className="text-xs text-amber-600 mb-0.5">Borradores</div>
            <div className="text-lg font-black text-amber-700">{totalDraft}</div>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
        ) : (
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
            {filteredEmployees.map((emp) => (
              <EmployeeListItem
                key={emp.id}
                employee={emp}
                sessions={sessionsByEmployee[emp.id] ?? []}
                isSelected={selectedId === emp.id}
                onSelect={() => selectEmployee(emp.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {panel.type === 'empty' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Users size={26} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-semibold text-gray-500">Selecciona un colaborador</h4>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
              Haz clic en un colaborador para ver sus evaluaciones o iniciar una nueva.
            </p>
          </div>
        )}

        {panel.type === 'list' && (() => {
          const target = EMPLOYEES.find((e) => e.id === panel.targetId);
          if (!target) return null;
          const sessions = sessionsByEmployee[panel.targetId] ?? [];

          return (
            <div className="flex flex-col h-full">
              <div className="shrink-0 p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                      {target.avatar}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{target.name}</h3>
                      <p className="text-xs text-gray-500">{target.position} · {target.department}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanel({ type: 'form', targetId: panel.targetId })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={14} />
                    Nueva evaluación
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                      <FileText size={20} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Sin evaluaciones</p>
                    <p className="text-xs text-gray-400 mt-1">Crea la primera evaluación de Aciertos y Desaciertos</p>
                    <button
                      type="button"
                      onClick={() => setPanel({ type: 'form', targetId: panel.targetId })}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <Plus size={14} />
                      Crear evaluación
                    </button>
                  </div>
                ) : (
                  sessions.map((s) => {
                    const evalEmp = EMPLOYEES.find((e) => e.id === s.evaluator_employee_id);
                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => setPanel({ type: 'view', session: s })}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <StatusPill status={s.status} />
                              <span className="text-sm font-bold text-gray-800 truncate">{s.period || 'Sin periodo'}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Evaluador: {evalEmp?.name ?? s.evaluator_employee_id}
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
                          <div className="flex items-center gap-1 shrink-0">
                            {s.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPanel({ type: 'form', targetId: panel.targetId, sessionId: s.id }); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            <Eye size={13} className="text-gray-300" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {panel.type === 'form' && (() => {
          const target = EMPLOYEES.find((e) => e.id === panel.targetId);
          if (!target) return null;
          const existing = panel.sessionId ? allSessions.find((s) => s.id === panel.sessionId) : undefined;

          return (
            <AciertosForm
              evaluator={evaluator}
              target={target}
              existingSession={existing}
              onSaved={handleSaved}
              onCancel={() => setPanel({ type: 'list', targetId: panel.targetId })}
            />
          );
        })()}

        {panel.type === 'view' && (() => {
          const session = allSessions.find((s) => s.id === panel.session.id) ?? panel.session;
          const targetId = session.target_employee_id;

          return (
            <div className="flex flex-col h-full">
              <div className="shrink-0 px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Detalle de evaluación</h3>
                <button
                  type="button"
                  onClick={() => setPanel({ type: 'list', targetId })}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <AciertosSessionView
                  session={session}
                  onEdit={() => setPanel({ type: 'form', targetId, sessionId: session.id })}
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
