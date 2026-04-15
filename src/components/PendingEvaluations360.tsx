import { useState } from 'react';
import { CheckCircle2, Clock, User, Briefcase, Equal, UserCheck, Globe, Users, Link2, Copy, Check, AlertTriangle } from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import type { Eval360Assignment, Eval360Role } from '../types/evaluation';
import { EVAL_360_ROLE_LABELS } from '../types/evaluation';
import { EMPLOYEES } from '../data/mockData';

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

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

interface PendingEvaluations360Props {
  employeeId: string;
}

function AssignmentRow({ assignment, employeeId }: { assignment: Eval360Assignment; employeeId: string }) {
  const { completeEval360Assignment } = useEvaluationStore();
  const [confirming, setConfirming] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const color = ROLE_COLORS[assignment.role];

  const handleMarkComplete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    completeEval360Assignment(assignment.id, []);
    setConfirming(false);
  };

  const handleGetLink = () => {
    const link = buildHashLink('/eval-360', {
      employeeId,
      mode: assignment.role === 'self' ? 'self' : 'peer',
      assignmentId: assignment.id,
    });
    void navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {assignment.isAnonymous ? '?' : assignment.evaluatorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-gray-800 block truncate max-w-[110px]">
              {assignment.isAnonymous ? 'Anónimo' : assignment.evaluatorName}
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(assignment.assignedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' })}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span style={{ color }}>{ROLE_ICONS[assignment.role]}</span>
          <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">{EVAL_360_ROLE_LABELS[assignment.role]}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {assignment.completedAt ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
            <CheckCircle2 size={10} /> Completada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
            <Clock size={10} /> Pendiente
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {assignment.completedAt ? (
          <span className="text-[10px] text-gray-400">
            {new Date(assignment.completedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </span>
        ) : (
          <span className="text-[10px] text-gray-300">—</span>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGetLink}
            title="Copiar link de evaluación"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            {copiedLink ? <Check size={13} className="text-green-600" /> : <Link2 size={13} />}
          </button>
          {!assignment.completedAt && (
            confirming ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  className="px-2 py-1 rounded-lg bg-green-600 text-white text-[10px] font-bold hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleMarkComplete}
                title="Marcar como completada"
                className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                <CheckCircle2 size={13} />
              </button>
            )
          )}
        </div>
      </td>
    </tr>
  );
}

export default function PendingEvaluations360({ employeeId }: PendingEvaluations360Props) {
  const { eval360Assignments, completeEval360Assignment } = useEvaluationStore();
  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employeeId);
  const employee = EMPLOYEES.find(e => e.id === employeeId);

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

  const handleMarkAllComplete = () => {
    assignments.filter(a => !a.completedAt).forEach(a => {
      completeEval360Assignment(a.id, []);
    });
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

      {pending > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-800 leading-relaxed">
              Si ya contestaron las evaluaciones y siguen apareciendo como pendientes, puedes marcarlas como completadas manualmente o copiar el link para reenviar.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllComplete}
            className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Marcar todas
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700">Matriz de seguimiento</p>
          <span className="text-[10px] text-gray-400">{completed}/{assignments.length} completadas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Evaluador</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Rol</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Estatus</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Fecha</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map((a) => (
                <AssignmentRow key={a.id} assignment={a} employeeId={employeeId} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Progreso por tipo de evaluador</p>
        {(Object.entries(byRole) as [Eval360Role, typeof assignments][]).map(([role, list]) => {
          if (list.length === 0) return null;
          const doneCount = list.filter(a => a.completedAt).length;
          const color = ROLE_COLORS[role];
          const pct = (doneCount / list.length) * 100;
          return (
            <div key={role} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                <span style={{ color }}>{ROLE_ICONS[role]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">{EVAL_360_ROLE_LABELS[role]}</p>
                <p className="text-[10px] text-gray-400 truncate">{list.map(a => a.isAnonymous ? 'Anónimo' : a.evaluatorName).join(', ')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : color }} />
                </div>
                <span className="text-[10px] font-bold w-8 text-right" style={{ color: pct === 100 ? '#059669' : color }}>{doneCount}/{list.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
