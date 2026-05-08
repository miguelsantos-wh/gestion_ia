import { useMemo, useState } from 'react';
import {
  BarChart3, Clock, CheckCircle2, User, Briefcase, Equal, UserCheck,
  Globe, Users, ArrowRight, AlertTriangle, BarChart2, ExternalLink, Eye,
} from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import type { Eval360Role, Evaluation360Session } from '../types/evaluation';
import { EVAL_360_PERIODS, EVAL_360_ROLE_LABELS } from '../types/evaluation';
import Eval360SessionResultsView from './Eval360SessionResultsView';
import Eval360SessionStatusView from './Eval360SessionStatusView';

const ROLE_ICONS: Record<Eval360Role, React.ReactNode> = {
  self: <User size={13} />,
  leader: <Briefcase size={13} />,
  peer: <Equal size={13} />,
  collaborator: <UserCheck size={13} />,
  client: <Globe size={13} />,
  anonymous: <Users size={13} />,
};

const ROLE_COLORS: Record<Eval360Role, string> = {
  self: '#2563eb',
  leader: '#0d9488',
  peer: '#7c3aed',
  collaborator: '#d97706',
  client: '#dc2626',
  anonymous: '#64748b',
};

function buildEvalLink(employeeId: string, assignmentId: string, role: Eval360Role, sessionName?: string): string {
  const params: Record<string, string> = {
    employeeId,
    mode: role === 'self' ? 'self' : 'peer',
    assignmentId,
    role,
  };
  if (sessionName) params.sessionName = sessionName;
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#/eval-360?${q}`;
}

function getScoreColor(score: number): string {
  if (score >= 4.1) return 'text-green-600';
  if (score >= 3.1) return 'text-blue-600';
  if (score >= 2.1) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 4.1) return 'bg-green-100 text-green-700';
  if (score >= 3.1) return 'bg-blue-100 text-blue-700';
  if (score >= 2.1) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

/* ─── Session card on the main list ──────────────────────────────────────── */
function SessionCard({
  session,
  onViewDetails,
}: {
  session: Evaluation360Session;
  onViewDetails: () => void;
}) {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const assignments = eval360Assignments.filter(a => a.sessionId === session.id);
  const completed = assignments.filter(a => a.completedAt).length;
  const total = assignments.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const periodLabel = EVAL_360_PERIODS.find(p => p.value === session.period)?.label ?? session.period;

  const score = useMemo(() => {
    const data = threeSixty[session.targetEmployeeId];
    if (!data) return null;
    const all: number[][] = [];
    const done = assignments.filter(a => a.completedAt);
    if (done.find(a => a.role === 'self') && data.self) all.push(data.self);
    done.filter(a => a.role !== 'self').forEach(a => {
      const peer = data.peers.find(p => p.evaluatorName.trim().toLowerCase() === a.evaluatorName.trim().toLowerCase() && p.scores.length > 0);
      if (peer) all.push(peer.scores);
    });
    if (all.length === 0) return null;
    return all.reduce((sum, s) => sum + s.reduce((a, b) => a + b, 0) / s.length, 0) / all.length;
  }, [assignments, threeSixty, session.targetEmployeeId]);

  const statusLabel = total === 0 ? 'Sin asignar' : pct === 100 ? 'Completo' : 'En progreso';
  const statusCls = total === 0
    ? 'bg-gray-100 text-gray-500'
    : pct === 100
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-blue-100 text-blue-700';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{session.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {score !== null && (
              <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${getScoreBg(score)}`}>
                {score.toFixed(2)}
              </span>
            )}
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusCls}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 py-3.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">{completed} de {total} evaluadores respondieron</p>
          <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#2563eb' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all"
        >
          <BarChart3 size={14} />
          Ver resultados y estado
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Pending-to-do section (evaluations the employee must fill) ─────────── */
function PendingToDoSection({ employeeId }: { employeeId: string }) {
  const { eval360Assignments, eval360Sessions } = useEvaluationStore();

  const pending = useMemo(() => {
    return eval360Assignments.filter(
      a => a.evaluatorEmployeeId === employeeId && !a.completedAt
    );
  }, [eval360Assignments, employeeId]);

  if (pending.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border-b border-amber-100">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={16} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-900">Evaluaciones pendientes por completar</p>
          <p className="text-xs text-amber-600 mt-0.5">Tienes {pending.length} evaluación{pending.length !== 1 ? 'es' : ''} que debes responder</p>
        </div>
        <span className="shrink-0 text-sm font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
          {pending.length}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {pending.map(a => {
          const session = eval360Sessions.find(s => s.id === a.sessionId);
          const targetEmployee = EMPLOYEES.find(e => e.id === a.targetEmployeeId);
          const color = ROLE_COLORS[a.role];
          const link = buildEvalLink(a.targetEmployeeId, a.id, a.role, session?.name);

          return (
            <div key={a.id} className="px-5 py-4 flex items-center gap-4">
              {/* Target employee avatar */}
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                {targetEmployee?.avatar ?? '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {targetEmployee?.name ?? 'Colaborador'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span style={{ color }}>{ROLE_ICONS[a.role]}</span>
                  <span className="text-xs text-gray-400">{EVAL_360_ROLE_LABELS[a.role]}</span>
                  {session && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400 truncate max-w-[160px]">{session.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action */}
              <a
                href={link}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <ExternalLink size={13} />
                Responder
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Detail view (Estado + Resultados tabs) ─────────────────────────────── */
type DetailTab = 'estado' | 'resultados';

function SessionDetailView({
  session,
  onBack,
}: {
  session: Evaluation360Session;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>('estado');

  const TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'estado', label: 'Estado', icon: <Clock size={14} /> },
    { id: 'resultados', label: 'Resultados', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowRight size={15} className="rotate-180" />
        Volver a mis evaluaciones
      </button>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50/60">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'estado' && <Eval360SessionStatusView session={session} onBack={onBack} embedded />}
          {tab === 'resultados' && <Eval360SessionResultsView session={session} onBack={onBack} embedded />}
        </div>
      </div>
    </div>
  );
}

/* ─── Empleado A 9-Box section ───────────────────────────────────────────── */
function EmpleadoASection({ employeeId }: { employeeId: string }) {
  const { percepcion, autoPercepcion } = useEvaluationStore();
  const percList = percepcion[employeeId] ?? [];
  const autoPerc = autoPercepcion[employeeId];
  const derived = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfgPerc = derived ? BOX_CONFIGS.find(b => b.performanceLevel === derived.performanceLevel && b.potentialLevel === derived.potentialLevel) : null;
  const cfgAuto = derivedAuto ? BOX_CONFIGS.find(b => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel) : null;

  if (!percList.length && !autoPerc) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <Eye size={15} className="text-teal-600 shrink-0" />
        <h2 className="text-sm font-bold text-gray-900">Empleado A · Resultados 9-Box</h2>
      </div>
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 p-3" style={{ backgroundColor: cfgPerc ? cfgPerc.bgColor : '#f0fdfa', borderColor: cfgPerc ? cfgPerc.color : '#99f6e4' }}>
            <div className="flex items-center gap-1 mb-2">
              <Eye size={11} style={{ color: cfgPerc?.color ?? '#0d9488' }} />
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfgPerc?.color ?? '#0d9488' }}>Percepción externa</span>
              {percList.length > 0 && (
                <span className="ml-auto text-[9px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: cfgPerc ? `${cfgPerc.color}20` : '#ccfbf1', color: cfgPerc?.color ?? '#0d9488' }}>
                  {percList.length}
                </span>
              )}
            </div>
            {percList.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic">Sin percepciones aún</p>
            ) : cfgPerc ? (
              <>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-xl font-black leading-none" style={{ color: cfgPerc.color }}>{cfgPerc.code}</span>
                  <span className="text-xs font-bold leading-tight" style={{ color: cfgPerc.textColor }}>{cfgPerc.label}</span>
                </div>
                <p className="text-[10px] opacity-70 leading-snug" style={{ color: cfgPerc.textColor }}>{cfgPerc.description}</p>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border-2 p-3" style={{ backgroundColor: cfgAuto ? cfgAuto.bgColor : '#eff6ff', borderColor: cfgAuto ? cfgAuto.color : '#bfdbfe' }}>
            <div className="flex items-center gap-1 mb-2">
              <User size={11} style={{ color: cfgAuto?.color ?? '#2563eb' }} />
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfgAuto?.color ?? '#2563eb' }}>Autoevaluación</span>
              {autoPerc && (
                <span className="ml-auto text-[9px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: cfgAuto ? `${cfgAuto.color}20` : '#dbeafe', color: cfgAuto?.color ?? '#2563eb' }}>
                  {new Date(autoPerc.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
            {!autoPerc ? (
              <p className="text-[10px] text-gray-400 italic">No completada</p>
            ) : cfgAuto ? (
              <>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-xl font-black leading-none" style={{ color: cfgAuto.color }}>{cfgAuto.code}</span>
                  <span className="text-xs font-bold leading-tight" style={{ color: cfgAuto.textColor }}>{cfgAuto.label}</span>
                </div>
                <p className="text-[10px] opacity-70 leading-snug" style={{ color: cfgAuto.textColor }}>{cfgAuto.description}</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function EmployeeSessionPage({ employeeId }: { employeeId: string }) {
  const { eval360Sessions, eval360Assignments } = useEvaluationStore();
  const [selectedSession, setSelectedSession] = useState<Evaluation360Session | null>(null);

  const employee = EMPLOYEES.find(e => e.id === employeeId);

  const sessions = useMemo(() => {
    return [...eval360Sessions]
      .filter(s => s.targetEmployeeId === employeeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [eval360Sessions, employeeId]);

  const totalCompleted = useMemo(() => {
    return eval360Assignments.filter(a => a.targetEmployeeId === employeeId && a.completedAt).length;
  }, [eval360Assignments, employeeId]);

  const totalPending = useMemo(() => {
    return eval360Assignments.filter(a => a.targetEmployeeId === employeeId && !a.completedAt).length;
  }, [eval360Assignments, employeeId]);

  const pendingToDo = useMemo(() => {
    return eval360Assignments.filter(a => a.evaluatorEmployeeId === employeeId && !a.completedAt).length;
  }, [eval360Assignments, employeeId]);

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart2 size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-base font-semibold text-gray-400">Colaborador no encontrado</p>
          <p className="text-sm text-gray-300 mt-1">El enlace puede estar desactualizado.</p>
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <SessionDetailView session={selectedSession} onBack={() => setSelectedSession(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-700 shrink-0">
              {employee.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{employee.name}</h1>
              <p className="text-sm text-gray-500 truncate">{employee.position} · {employee.department}</p>
            </div>
            <div className="shrink-0 hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              <BarChart3 size={12} />
              Mis evaluaciones 360
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Sesiones</p>
            <p className="text-2xl font-black text-gray-900">{sessions.length}</p>
          </div>
          <div className={`rounded-2xl border shadow-sm p-4 text-center ${totalCompleted > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Completadas</p>
            <p className={`text-2xl font-black ${totalCompleted > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>{totalCompleted}</p>
          </div>
          <div className={`rounded-2xl border shadow-sm p-4 text-center ${totalPending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-100'}`}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pendientes</p>
            <p className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-600' : 'text-gray-300'}`}>{totalPending}</p>
          </div>
        </div>

        {/* Pending to-do evaluations (employee must fill) */}
        {pendingToDo > 0 && <PendingToDoSection employeeId={employeeId} />}

        {/* Empleado A — 9-Box results */}
        <EmpleadoASection employeeId={employeeId} />

        {/* Sessions list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Mis evaluaciones</h2>
            <span className="text-xs text-gray-400">{sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
              <BarChart2 size={32} className="text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-400">Sin evaluaciones asignadas</p>
              <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
                Cuando el administrador cree una evaluación 360 para ti, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sessions.map(s => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onViewDetails={() => setSelectedSession(s)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed-to-do evaluations (employee has filled for others) */}
        <CompletedByEmployeeSection employeeId={employeeId} />
      </div>
    </div>
  );
}

/* ─── Evaluations the employee has already done for others ───────────────── */
function CompletedByEmployeeSection({ employeeId }: { employeeId: string }) {
  const { eval360Assignments, eval360Sessions } = useEvaluationStore();

  const done = useMemo(() => {
    return eval360Assignments.filter(
      a => a.evaluatorEmployeeId === employeeId && a.completedAt
    );
  }, [eval360Assignments, employeeId]);

  if (done.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
        <p className="text-sm font-bold text-gray-700">Evaluaciones que ya completé</p>
        <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">{done.length}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {done.map(a => {
          const session = eval360Sessions.find(s => s.id === a.sessionId);
          const targetEmployee = EMPLOYEES.find(e => e.id === a.targetEmployeeId);
          const color = ROLE_COLORS[a.role];

          return (
            <div key={a.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                {targetEmployee?.avatar ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {targetEmployee?.name ?? 'Colaborador'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span style={{ color }}>{ROLE_ICONS[a.role]}</span>
                  <span className="text-xs text-gray-400">{EVAL_360_ROLE_LABELS[a.role]}</span>
                  {session && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400 truncate max-w-[140px]">{session.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 size={11} />
                Completada
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
