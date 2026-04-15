import { CheckCircle2, Clock, User, Briefcase, Equal, UserCheck, Globe, Users } from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import type { Eval360Role } from '../types/evaluation';
import { EVAL_360_ROLE_LABELS } from '../types/evaluation';

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

interface PendingEvaluations360Props {
  employeeId: string;
}

export default function PendingEvaluations360({ employeeId }: PendingEvaluations360Props) {
  const { eval360Assignments } = useEvaluationStore();
  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employeeId);

  const completed = assignments.filter(a => a.completedAt).length;
  const pending = assignments.filter(a => !a.completedAt).length;

  const byRole: Record<Eval360Role, typeof assignments> = {
    self: assignments.filter(a => a.role === 'self'),
    leader: assignments.filter(a => a.role === 'leader'),
    peer: assignments.filter(a => a.role === 'peer'),
    collaborator: assignments.filter(a => a.role === 'collaborator'),
    client: assignments.filter(a => a.role === 'client'),
    anonymous: assignments.filter(a => a.role === 'anonymous'),
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
        <Clock size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-400">Sin evaluadores asignados</p>
        <p className="text-xs text-gray-400 mt-1">Ve a la pestaña "Asignar" para agregar evaluadores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-xl border border-green-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-900">Completadas</p>
            <p className="text-xl font-black text-green-600">{completed}</p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Clock size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-900">Pendientes</p>
            <p className="text-xl font-black text-amber-600">{pending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-700">Matriz de seguimiento</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Evaluador</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Rol</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Estatus</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map((a) => {
                const color = ROLE_COLORS[a.role];
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: color }}>
                          {a.isAnonymous ? '?' : a.evaluatorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                          {a.isAnonymous ? 'Anónimo' : a.evaluatorName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color }}>{ROLE_ICONS[a.role]}</span>
                        <span className="text-[10px] font-semibold text-gray-600">{EVAL_360_ROLE_LABELS[a.role]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.completedAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
                          <CheckCircle2 size={10} /> Completada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                          <Clock size={10} /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-gray-400">
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                          : new Date(a.assignedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Por tipo de evaluador</p>
        {(Object.entries(byRole) as [Eval360Role, typeof assignments][]).map(([role, list]) => {
          if (list.length === 0) return null;
          const doneCount = list.filter(a => a.completedAt).length;
          const color = ROLE_COLORS[role];
          return (
            <div key={role} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
              <span style={{ color }}>{ROLE_ICONS[role]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">{EVAL_360_ROLE_LABELS[role]}</p>
                <p className="text-[10px] text-gray-400">{list.map(a => a.isAnonymous ? 'Anónimo' : a.evaluatorName).join(', ')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${(doneCount / list.length) * 100}%`, backgroundColor: color }} />
                </div>
                <span className="text-[10px] font-bold w-8 text-right" style={{ color }}>{doneCount}/{list.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
