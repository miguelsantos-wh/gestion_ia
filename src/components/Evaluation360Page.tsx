import { useMemo, useState } from 'react';
import {
  BarChart3, Eye, Clock, Search, ChevronRight, Users, UserPlus,
  CheckCircle2, X, AlertCircle, UserCheck, Briefcase, Equal, Globe, User
} from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { useEvaluationStore } from '../context/EvaluationContext';
import type { Eval360Role } from '../types/evaluation';
import type { Employee } from '../types';
import Evaluation360Results from './Evaluation360Results';
import PendingEvaluations360 from './PendingEvaluations360';
import Assign360Modal from './Assign360Modal';

const ROLE_ICONS: Record<Eval360Role, React.ReactNode> = {
  self: <User size={12} />,
  leader: <Briefcase size={12} />,
  peer: <Equal size={12} />,
  collaborator: <UserCheck size={12} />,
  client: <Globe size={12} />,
  anonymous: <Users size={12} />,
};

const ROLE_COLORS: Record<Eval360Role, string> = {
  self: '#2563eb',
  leader: '#0d9488',
  peer: '#7c3aed',
  collaborator: '#d97706',
  client: '#dc2626',
  anonymous: '#64748b',
};

function EmployeeCard360({
  employee,
  onSelect,
  isSelected,
}: {
  employee: Employee;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employee.id);
  const completed = assignments.filter(a => a.completedAt).length;
  const total = assignments.length;
  const hasSelf = !!threeSixty[employee.id]?.self;
  const peerCount = (threeSixty[employee.id]?.peers ?? []).length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
        isSelected
          ? 'border-slate-400 shadow-md ring-2 ring-slate-200'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
            {employee.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{employee.name}</div>
            <div className="text-xs text-gray-500 truncate">{employee.position}</div>
            <div className="text-xs text-gray-400">{employee.department}</div>
          </div>
          <ChevronRight size={14} className={`text-gray-300 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{completed}/{total} evaluaciones</span>
            <span className={`font-semibold ${pct === 100 ? 'text-green-600' : pct > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {total === 0 ? 'Sin asignar' : pct === 100 ? 'Completo' : 'En progreso'}
            </span>
          </div>
          {total > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#2563eb' }} />
            </div>
          )}
          <div className="flex gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${hasSelf ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
              <User size={9} /> Auto
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${peerCount > 0 ? 'bg-teal-50 text-teal-700' : 'bg-gray-50 text-gray-400'}`}>
              <Users size={9} /> {peerCount} evaluador{peerCount !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

type DetailTab = 'resumen' | 'asignar' | 'seguimiento' | 'resultados';

function EmployeeDetailPanel({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const [activeTab, setActiveTab] = useState<DetailTab>('resumen');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employee.id);
  const completed = assignments.filter(a => a.completedAt).length;
  const pending = assignments.filter(a => !a.completedAt).length;
  const data = threeSixty[employee.id];
  const hasSelf = !!data?.self;
  const peerCount = (data?.peers ?? []).length;

  const TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resumen', label: 'Resumen', icon: <BarChart3 size={13} /> },
    { id: 'asignar', label: 'Asignar', icon: <UserPlus size={13} /> },
    { id: 'seguimiento', label: 'Seguimiento', icon: <Clock size={13} /> },
    { id: 'resultados', label: 'Resultados', icon: <Eye size={13} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-100 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-base font-bold text-slate-700 shrink-0">
              {employee.avatar}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{employee.name}</h3>
              <p className="text-xs text-gray-600">{employee.position}</p>
              <p className="text-xs text-gray-400">{employee.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/70 rounded-xl p-2.5 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Asignadas</p>
            <p className="text-lg font-black text-gray-900">{assignments.length}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-2.5 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Completadas</p>
            <p className="text-lg font-black text-green-600">{completed}</p>
          </div>
          <div className="bg-white/70 rounded-xl p-2.5 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Pendientes</p>
            <p className="text-lg font-black text-amber-600">{pending}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border p-3 ${hasSelf ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={13} className={hasSelf ? 'text-blue-600' : 'text-gray-400'} />
                  <p className="text-xs font-semibold text-gray-700">Autoevaluación</p>
                </div>
                <p className={`text-sm font-bold ${hasSelf ? 'text-blue-700' : 'text-gray-400'}`}>{hasSelf ? 'Completada' : 'Pendiente'}</p>
              </div>
              <div className={`rounded-xl border p-3 ${peerCount > 0 ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users size={13} className={peerCount > 0 ? 'text-teal-600' : 'text-gray-400'} />
                  <p className="text-xs font-semibold text-gray-700">Evaluadores</p>
                </div>
                <p className={`text-sm font-bold ${peerCount > 0 ? 'text-teal-700' : 'text-gray-400'}`}>{peerCount} respuesta{peerCount !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Por tipo de evaluador</p>
              {(['self', 'leader', 'peer', 'collaborator', 'client', 'anonymous'] as Eval360Role[]).map((role) => {
                const roleAssignments = assignments.filter(a => a.role === role);
                if (roleAssignments.length === 0) return null;
                const doneCount = roleAssignments.filter(a => a.completedAt).length;
                const color = ROLE_COLORS[role];
                return (
                  <div key={role} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <span style={{ color }}>{ROLE_ICONS[role]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        {roleAssignments[0].evaluatorName}{roleAssignments.length > 1 && ` +${roleAssignments.length - 1}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${doneCount === roleAssignments.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {doneCount}/{roleAssignments.length}
                    </span>
                  </div>
                );
              })}
              {assignments.length === 0 && <div className="text-center py-6 text-gray-400 text-xs">No hay evaluadores asignados aún</div>}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('asignar')}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <UserPlus size={15} />
              Asignar evaluadores
            </button>
          </div>
        )}

        {activeTab === 'asignar' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Asigna hasta 5 evaluadores: su líder, un par (mismo puesto), un colaborador (depende del evaluado), un cliente y la autoevaluación.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {([
                { role: 'self' as Eval360Role, label: 'Autoevaluación', icon: <User size={14} />, color: '#2563eb', hint: 'El propio colaborador' },
                { role: 'leader' as Eval360Role, label: 'Líder', icon: <Briefcase size={14} />, color: '#0d9488', hint: 'Su líder directo' },
                { role: 'peer' as Eval360Role, label: 'Par', icon: <Equal size={14} />, color: '#7c3aed', hint: 'Mismo nivel/puesto' },
                { role: 'collaborator' as Eval360Role, label: 'Colaborador', icon: <UserCheck size={14} />, color: '#d97706', hint: 'Depende del evaluado' },
                { role: 'client' as Eval360Role, label: 'Cliente', icon: <Globe size={14} />, color: '#dc2626', hint: 'Cliente interno/externo' },
                { role: 'anonymous' as Eval360Role, label: 'Anónimo', icon: <Users size={14} />, color: '#64748b', hint: 'Enlace anónimo abierto' },
              ]).map(({ role, label, icon, color, hint }) => {
                const roleAssignments = assignments.filter(a => a.role === role);
                const done = roleAssignments.filter(a => a.completedAt).length;
                return (
                  <div key={role} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                      <span style={{ color }}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{label}</p>
                      <p className="text-[10px] text-gray-400">{hint}</p>
                    </div>
                    {roleAssignments.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                        {done}/{roleAssignments.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <UserPlus size={16} />
              Asignar nuevo evaluador
            </button>
          </div>
        )}

        {activeTab === 'seguimiento' && (
          <PendingEvaluations360 employeeId={employee.id} />
        )}

        {activeTab === 'resultados' && (
          <Evaluation360Results employeeId={employee.id} />
        )}
      </div>

      {showAssignModal && (
        <Assign360Modal
          targetEmployee={employee}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}

function Eval360AdminView() {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const departments = Array.from(new Set(EMPLOYEES.map(e => e.department)));

  const filtered = useMemo(() =>
    EMPLOYEES.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'all' || e.department === filterDept;
      return matchSearch && matchDept;
    }),
    [search, filterDept]
  );

  const selectedEmployee = selectedId ? EMPLOYEES.find(e => e.id === selectedId) ?? null : null;
  const totalAssigned = EMPLOYEES.filter(e => eval360Assignments.some(a => a.targetEmployeeId === e.id)).length;
  const totalCompleted = EMPLOYEES.filter(e => {
    const a = eval360Assignments.filter(x => x.targetEmployeeId === e.id);
    return a.length > 0 && a.every(x => x.completedAt);
  }).length;
  const totalWithData = EMPLOYEES.filter(e => (threeSixty[e.id]?.peers?.length ?? 0) > 0 || threeSixty[e.id]?.self).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Users size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Con evaluadores</p>
            <p className="text-xl font-black text-gray-900">{totalAssigned}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Completos</p>
            <p className="text-xl font-black text-gray-900">{totalCompleted}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Con respuestas</p>
            <p className="text-xl font-black text-gray-900">{totalWithData}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-2 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
            >
              <option value="all">Todos</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-0.5">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">Sin resultados</div>
            ) : (
              filtered.map(emp => (
                <EmployeeCard360
                  key={emp.id}
                  employee={emp}
                  onSelect={() => setSelectedId(selectedId === emp.id ? null : emp.id)}
                  isSelected={selectedId === emp.id}
                />
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-3">
          {selectedEmployee ? (
            <EmployeeDetailPanel employee={selectedEmployee} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Users size={26} className="text-gray-300" />
              </div>
              <h4 className="text-sm font-semibold text-gray-500">Selecciona un colaborador</h4>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
                Haz clic en una ficha para asignar evaluadores 360, dar seguimiento y ver resultados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Eval360EmployeeView({ employeeId }: { employeeId: string }) {
  const { threeSixty, eval360Assignments } = useEvaluationStore();
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<'resultados' | 'seguimiento'>('resultados');

  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employeeId);
  const data = threeSixty[employeeId];
  const hasSelf = !!data?.self;
  const peerCount = (data?.peers ?? []).length;

  const TABS = [
    { id: 'resultados' as const, label: 'Mis Resultados', icon: <BarChart3 size={16} /> },
    { id: 'seguimiento' as const, label: 'Seguimiento', icon: <Clock size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${hasSelf ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-xs font-semibold mb-1" style={{ color: hasSelf ? '#2563eb' : '#94a3b8' }}>Autoevaluación</p>
          <p className={`text-lg font-bold ${hasSelf ? 'text-blue-800' : 'text-gray-400'}`}>{hasSelf ? 'Completada' : 'Pendiente'}</p>
        </div>
        <div className={`p-4 rounded-xl border ${peerCount > 0 ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-xs font-semibold text-gray-500 mb-1">Evaluadores</p>
          <p className={`text-lg font-bold ${peerCount > 0 ? 'text-teal-800' : 'text-gray-400'}`}>{peerCount}</p>
        </div>
        <div className={`p-4 rounded-xl border ${assignments.length > 0 ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-xs font-semibold text-gray-500 mb-1">Asignaciones</p>
          <p className={`text-lg font-bold ${assignments.length > 0 ? 'text-amber-800' : 'text-gray-400'}`}>{assignments.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'resultados' && <Evaluation360Results employeeId={employeeId} />}
          {activeTab === 'seguimiento' && <PendingEvaluations360 employeeId={employeeId} />}
        </div>
      </div>
    </div>
  );
}

export default function Evaluation360Page() {
  const { currentEmployee, isAdmin } = useUser();

  if (isAdmin) {
    return <Eval360AdminView />;
  }

  if (currentEmployee) {
    return <Eval360EmployeeView employeeId={currentEmployee.id} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-500">No hay empleado asignado a tu cuenta.</p>
    </div>
  );
}
