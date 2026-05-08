import { useState, useMemo } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { X, Search, CheckCircle, Users, UserCheck, Zap, Briefcase, List } from 'lucide-react';
import type { Employee } from '../types';

interface AssignPercepcionModalProps {
  targetEmployee: Employee;
  onClose: () => void;
}

type AssignMode = 'manual' | 'team' | 'position' | 'all';

const MODES: { id: AssignMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'manual',
    label: 'Manual',
    icon: <List size={14} />,
    description: 'Elige individualmente con checkbox',
  },
  {
    id: 'team',
    label: 'Por equipo',
    icon: <Users size={14} />,
    description: 'Todos del mismo departamento',
  },
  {
    id: 'position',
    label: 'Por puesto',
    icon: <Briefcase size={14} />,
    description: 'Todos con el mismo puesto',
  },
  {
    id: 'all',
    label: 'Todos',
    icon: <Zap size={14} />,
    description: 'Todos los colaboradores',
  },
];

export default function AssignPercepcionModal({ targetEmployee, onClose }: AssignPercepcionModalProps) {
  const { assignments, saveAssignment } = useEvaluationStore();
  const [mode, setMode] = useState<AssignMode>('manual');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [justAssigned, setJustAssigned] = useState<Set<string>>(new Set());
  const [bulkDone, setBulkDone] = useState(false);

  const pendingForTarget = useMemo(
    () => new Set(assignments.filter(a => a.targetId === targetEmployee.id && !a.completedAt).map(a => a.evaluatorId)),
    [assignments, targetEmployee.id]
  );

  const candidates = useMemo(
    () => EMPLOYEES.filter(e => e.id !== targetEmployee.id),
    [targetEmployee.id]
  );

  const autoPool = useMemo(() => {
    if (mode === 'team') return candidates.filter(e => e.department === targetEmployee.department);
    if (mode === 'position') return candidates.filter(e => e.position === targetEmployee.position);
    if (mode === 'all') return candidates;
    return [];
  }, [mode, candidates, targetEmployee]);

  const manualList = useMemo(() => {
    if (mode !== 'manual') return [];
    const q = search.toLowerCase();
    return candidates.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [mode, candidates, search]);

  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const visibleUnassigned = manualList.filter(e => !pendingForTarget.has(e.id));
    const allChecked = visibleUnassigned.every(e => selected.has(e.id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allChecked) visibleUnassigned.forEach(e => next.delete(e.id));
      else visibleUnassigned.forEach(e => next.add(e.id));
      return next;
    });
  };

  const assignManual = () => {
    const toAssign = [...selected].filter(id => !pendingForTarget.has(id));
    toAssign.forEach(id => saveAssignment(id, targetEmployee.id));
    setJustAssigned(new Set(toAssign));
    setSelected(new Set());
    setTimeout(() => setJustAssigned(new Set()), 2000);
  };

  const assignBulk = () => {
    const toAssign = autoPool.filter(e => !pendingForTarget.has(e.id));
    toAssign.forEach(e => saveAssignment(e.id, targetEmployee.id));
    setBulkDone(true);
    setTimeout(() => setBulkDone(false), 2500);
  };

  const manualUnassignedVisible = manualList.filter(e => !pendingForTarget.has(e.id));
  const allVisibleChecked = manualUnassignedVisible.length > 0 && manualUnassignedVisible.every(e => selected.has(e.id));
  const autoAlreadyAll = autoPool.length > 0 && autoPool.every(e => pendingForTarget.has(e.id));
  const autoToAssignCount = autoPool.filter(e => !pendingForTarget.has(e.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Asignar evaluación</h2>
              <p className="text-xs text-gray-500">Para: <span className="font-semibold">{targetEmployee.name}</span></p>
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

        {/* Mode selector */}
        <div className="px-5 pt-4 shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Modo de selección</p>
          <div className="grid grid-cols-4 gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setSelected(new Set()); setBulkDone(false); }}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all ${
                  mode === m.id
                    ? 'border-slate-700 bg-slate-50 text-slate-800'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={mode === m.id ? 'text-slate-700' : 'text-gray-400'}>{m.icon}</span>
                <span className="text-[11px] font-bold leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 mb-3">
            {MODES.find(m2 => m2.id === mode)?.description}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">

          {/* MANUAL */}
          {mode === 'manual' && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {manualList.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${allVisibleChecked ? 'bg-slate-700 border-slate-700' : 'border-gray-300'}`}>
                    {allVisibleChecked && <CheckCircle size={10} className="text-white" />}
                  </div>
                  {allVisibleChecked ? 'Desmarcar todos' : 'Seleccionar todos'}
                </button>
              )}

              <div className="space-y-1.5">
                {manualList.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">Sin resultados</div>
                ) : (
                  manualList.map(emp => {
                    const isPending = pendingForTarget.has(emp.id);
                    const isChecked = selected.has(emp.id);
                    const wasJustAssigned = justAssigned.has(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => !isPending && toggleSelected(emp.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                          isPending
                            ? 'bg-teal-50 border border-teal-100 cursor-default'
                            : isChecked
                              ? 'bg-slate-50 border border-slate-200 cursor-pointer'
                              : 'bg-gray-50 hover:bg-gray-100 border border-transparent cursor-pointer'
                        }`}
                      >
                        {isPending ? (
                          <UserCheck size={16} className="text-teal-500 shrink-0" />
                        ) : (
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-slate-700 border-slate-700' : 'border-gray-300'}`}>
                            {isChecked && <CheckCircle size={10} className="text-white" />}
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {emp.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">{emp.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{emp.position} · {emp.department}</div>
                        </div>
                        {isPending && <span className="text-[10px] font-bold text-teal-600 shrink-0">Asignado</span>}
                        {wasJustAssigned && !isPending && <span className="text-[10px] font-bold text-emerald-600 shrink-0">Listo</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* AUTO MODES */}
          {mode !== 'manual' && (
            <div className="space-y-3">
              {autoPool.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400">
                    {mode === 'team' && 'No hay otros colaboradores en el mismo departamento.'}
                    {mode === 'position' && 'No hay otros colaboradores con el mismo puesto.'}
                    {mode === 'all' && 'No hay otros colaboradores.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      {mode === 'team' && <>Departamento: <span className="font-bold text-gray-800">{targetEmployee.department}</span></>}
                      {mode === 'position' && <>Puesto: <span className="font-bold text-gray-800">{targetEmployee.position}</span></>}
                      {mode === 'all' && <>Colaboradores: <span className="font-bold text-gray-800">{autoPool.length} en total</span></>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {autoToAssignCount} por asignar · {autoPool.length - autoToAssignCount} ya asignados
                    </p>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                    {autoPool.map(emp => {
                      const isPending = pendingForTarget.has(emp.id);
                      return (
                        <div
                          key={emp.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border ${isPending ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-transparent'}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {emp.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-800 truncate">{emp.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{emp.position} · {emp.department}</div>
                          </div>
                          {isPending
                            ? <span className="flex items-center gap-1 text-[10px] font-bold text-teal-600 shrink-0"><UserCheck size={12} /> Asignado</span>
                            : <span className="text-[10px] font-medium text-gray-400 shrink-0">Por asignar</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-2">
          {mode === 'manual' ? (
            <>
              <button
                type="button"
                onClick={assignManual}
                disabled={selected.size === 0}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  selected.size > 0
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <UserCheck size={15} />
                {selected.size > 0
                  ? `Asignar ${selected.size} evaluador${selected.size !== 1 ? 'es' : ''}`
                  : 'Selecciona evaluadores'}
              </button>
              <button type="button" onClick={onClose} className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Cerrar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={assignBulk}
                disabled={autoPool.length === 0 || autoAlreadyAll}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  autoPool.length > 0 && !autoAlreadyAll
                    ? bulkDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {bulkDone ? <CheckCircle size={15} /> : <Zap size={15} />}
                {bulkDone
                  ? 'Asignados correctamente'
                  : autoAlreadyAll
                    ? 'Todos ya asignados'
                    : `Asignar ${autoToAssignCount} evaluador${autoToAssignCount !== 1 ? 'es' : ''}`}
              </button>
              <button type="button" onClick={onClose} className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
