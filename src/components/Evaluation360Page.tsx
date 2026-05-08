import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Eye, Clock, Search, ChevronRight, Users, UserPlus,
  CheckCircle2, X, AlertCircle, UserCheck, Briefcase, Equal, Globe, User,
  TrendingUp, BarChart2, ChevronDown, ChevronUp, ArrowLeft, Award
} from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { useEvaluationStore } from '../context/EvaluationContext';
import type { Eval360Role } from '../types/evaluation';
import type { Employee } from '../types';
import Assign360Modal from './Assign360Modal';
import Eval360SessionStatusView from './Eval360SessionStatusView';
import Eval360SessionResultsView from './Eval360SessionResultsView';
import Eval360ResultsV2View from './Eval360ResultsV2View';
import type { Evaluation360Session } from '../types/evaluation';
import { EVAL_360_PERIODS } from '../types/evaluation';

const COMPETENCY_NAMES = [
  'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas',
  'Aprendizaje continuo', 'Hazlo Ahora', 'Mejora continua',
  'Autoaprendizaje', 'Alertidad', 'Amabilidad', 'Valor agregado', 'Asertividad',
];

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

function getScoreColor(score: number) {
  if (score >= 4.1) return 'text-green-600';
  if (score >= 3.1) return 'text-blue-600';
  if (score >= 2.1) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number) {
  if (score >= 4.1) return 'bg-green-100 text-green-700';
  if (score >= 3.1) return 'bg-blue-100 text-blue-700';
  if (score >= 2.1) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function getScoreBar(score: number) {
  if (score >= 4.1) return '#059669';
  if (score >= 3.1) return '#2563eb';
  if (score >= 2.1) return '#d97706';
  return '#dc2626';
}

function getClassificationLabel(score: number) {
  if (score >= 4.1) return 'Sobresaliente';
  if (score >= 3.1) return 'Bueno';
  if (score >= 2.1) return 'Regular';
  return 'Deficiente';
}

function computeOverallScore(employeeId: string, threeSixty: Record<string, { self?: number[]; peers: { scores: number[] }[] }>) {
  const data = threeSixty[employeeId];
  if (!data) return null;
  const allSubmissions: number[][] = [];
  if (data.self) allSubmissions.push(data.self);
  data.peers.forEach(p => { if (p.scores.length > 0) allSubmissions.push(p.scores); });
  if (allSubmissions.length === 0) return null;
  const total = allSubmissions.reduce((sum, s) => sum + s.reduce((a, b) => a + b, 0) / s.length, 0);
  return total / allSubmissions.length;
}

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
  const overallScore = computeOverallScore(employee.id, threeSixty);

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
          {overallScore !== null ? (
            <span className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${getScoreBg(overallScore)}`}>
              {overallScore.toFixed(1)}
            </span>
          ) : (
            <ChevronRight size={14} className={`text-gray-300 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
          )}
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

function ResumenTab({ employee }: { employee: Employee }) {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employee.id);
  const data = threeSixty[employee.id];
  const hasSelf = !!data?.self;
  const peers = data?.peers ?? [];

  const scoresBySource = useMemo(() => {
    if (!data) return null;
    const sources: { label: string; color: string; scores: number[] | undefined }[] = [
      { label: 'Autoevaluación', color: '#2563eb', scores: data.self },
      ...peers.map((p, i) => ({
        label: p.evaluatorName || `Evaluador ${i + 1}`,
        color: '#0d9488',
        scores: p.scores,
      })),
    ];
    return sources.filter(s => s.scores && s.scores.length > 0);
  }, [data, peers]);

  const competencyAverages = useMemo(() => {
    if (!data) return null;
    const allSubs: number[][] = [];
    if (data.self) allSubs.push(data.self);
    peers.forEach(p => { if (p.scores.length > 0) allSubs.push(p.scores); });
    if (allSubs.length === 0) return null;
    return COMPETENCY_NAMES.map((name, idx) => {
      const vals = allSubs.map(s => s[idx] ?? 0).filter(v => v > 0);
      return { name, avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
    });
  }, [data, peers]);

  const overallScore = useMemo(() => {
    if (!competencyAverages) return null;
    const valid = competencyAverages.filter(c => c.avg > 0);
    if (valid.length === 0) return null;
    return valid.reduce((a, c) => a + c.avg, 0) / valid.length;
  }, [competencyAverages]);

  const top3 = useMemo(() => {
    if (!competencyAverages) return [];
    return [...competencyAverages].filter(c => c.avg > 0).sort((a, b) => b.avg - a.avg).slice(0, 3);
  }, [competencyAverages]);

  const bottom3 = useMemo(() => {
    if (!competencyAverages) return [];
    return [...competencyAverages].filter(c => c.avg > 0).sort((a, b) => a.avg - b.avg).slice(0, 3);
  }, [competencyAverages]);

  const completed = assignments.filter(a => a.completedAt).length;
  const pending = assignments.filter(a => !a.completedAt).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/70 rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Asignadas</p>
          <p className="text-lg font-black text-gray-900">{assignments.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Completas</p>
          <p className="text-lg font-black text-green-600">{completed}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-0.5">Pendientes</p>
          <p className="text-lg font-black text-amber-600">{pending}</p>
        </div>
      </div>

      {overallScore !== null ? (
        <>
          <div className={`rounded-2xl border p-4 ${overallScore >= 4.1 ? 'bg-green-50 border-green-200' : overallScore >= 3.1 ? 'bg-blue-50 border-blue-200' : overallScore >= 2.1 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Puntaje global 360</p>
                <p className={`text-xs text-gray-500`}>{(hasSelf ? 1 : 0) + peers.length} respuesta{(hasSelf ? 1 : 0) + peers.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black ${getScoreColor(overallScore)}`}>{overallScore.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400">de 5.0</div>
              </div>
            </div>
            <div className="mt-2.5">
              <div className="w-full bg-white/60 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${(overallScore / 5) * 100}%`, backgroundColor: getScoreBar(overallScore) }} />
              </div>
              <span className={`mt-1.5 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getScoreBg(overallScore)}`}>
                {getClassificationLabel(overallScore)}
              </span>
            </div>
          </div>

          {competencyAverages && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700">Por competencia</p>
              </div>
              <div className="divide-y divide-gray-50">
                {competencyAverages.map((comp, idx) => (
                  <div key={idx} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-300 w-4 shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-gray-800 truncate">{comp.name}</span>
                        <span className={`text-[11px] font-black ml-2 shrink-0 ${comp.avg > 0 ? getScoreColor(comp.avg) : 'text-gray-300'}`}>
                          {comp.avg > 0 ? comp.avg.toFixed(1) : '—'}
                        </span>
                      </div>
                      {comp.avg > 0 && (
                        <div className="w-full bg-gray-100 rounded-full h-1">
                          <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${(comp.avg / 5) * 100}%`, backgroundColor: getScoreBar(comp.avg) }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-2xl border border-green-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Award size={13} className="text-green-600" />
                <p className="text-[10px] font-bold text-green-900 uppercase tracking-wide">Fortalezas</p>
              </div>
              {top3.map((c, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] font-black text-green-600 w-4">{i + 1}.</span>
                  <span className="text-[11px] text-green-900 flex-1 truncate">{c.name}</span>
                  <span className="text-[11px] font-bold text-green-600">{c.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={13} className="text-yellow-600" />
                <p className="text-[10px] font-bold text-yellow-900 uppercase tracking-wide">A mejorar</p>
              </div>
              {bottom3.map((c, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <span className="text-[10px] font-black text-yellow-600 w-4">{i + 1}.</span>
                  <span className="text-[11px] text-yellow-900 flex-1 truncate">{c.name}</span>
                  <span className="text-[11px] font-bold text-yellow-600">{c.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-center">
          <BarChart2 size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-400">Sin datos de evaluación aún</p>
          <p className="text-[11px] text-gray-400 mt-1">Los resultados aparecen cuando se completen evaluaciones.</p>
        </div>
      )}

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
    </div>
  );
}

const TEAMS = ['Adminolt', 'CRMInbox', 'Wisphub'];

function EmployeeDetailView({
  employee,
  onBack,
  onAssign,
}: {
  employee: Employee;
  onBack: () => void;
  onAssign: () => void;
}) {
  const { eval360Sessions } = useEvaluationStore();
  const [activeTab, setActiveTab] = useState<'estado' | 'resultados'>('estado');

  const lastSession: Evaluation360Session | null = useMemo(() => {
    const sessions = eval360Sessions
      .filter(s => s.targetEmployeeId === employee.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sessions[0] ?? null;
  }, [eval360Sessions, employee.id]);

  const periodLabel = lastSession
    ? (EVAL_360_PERIODS.find(p => p.value === lastSession.period)?.label ?? lastSession.period)
    : null;

  const TABS = [
    { id: 'estado' as const, label: 'Estado', icon: <Eye size={14} /> },
    { id: 'resultados' as const, label: 'Resultados', icon: <BarChart3 size={14} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a la lista
        </button>
        <button
          type="button"
          onClick={onAssign}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors shrink-0"
        >
          <UserPlus size={14} />
          Nueva evaluación
        </button>
      </div>

      {/* Employee identity card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 shrink-0">
            {employee.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900">{employee.name}</p>
            <p className="text-sm text-gray-500">{employee.position}</p>
            <p className="text-xs text-gray-400 mt-0.5">{employee.department}</p>
          </div>
          {lastSession && (
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Última sesión</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{lastSession.name}</p>
              {periodLabel && <p className="text-xs text-gray-400">{periodLabel}</p>}
            </div>
          )}
        </div>
      </div>

      {!lastSession ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <BarChart2 size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">Sin evaluaciones aún</p>
          <p className="text-xs text-gray-300 mt-1 max-w-xs">Crea la primera evaluación 360 para este colaborador.</p>
          <button
            type="button"
            onClick={onAssign}
            className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <UserPlus size={14} />
            Asignar evaluación
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50/60">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {activeTab === 'estado' && (
              <Eval360SessionStatusView session={lastSession} onBack={() => {}} embedded />
            )}
            {activeTab === 'resultados' && (
              <Eval360ResultsV2View session={lastSession} onBack={() => {}} embedded />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function computeLastSessionScore(
  employeeId: string,
  sessions: Evaluation360Session[],
  assignments: ReturnType<typeof useEvaluationStore>['eval360Assignments'],
  threeSixty: Record<string, { self?: number[]; peers: { evaluatorName: string; scores: number[] }[] }>
): number | null {
  const last = [...sessions]
    .filter(s => s.targetEmployeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!last) return null;
  const data = threeSixty[employeeId];
  if (!data) return null;
  const sessionAssignments = assignments.filter(a => a.sessionId === last.id && a.completedAt);
  const all: number[][] = [];
  if (sessionAssignments.find(a => a.role === 'self') && data.self) all.push(data.self);
  sessionAssignments.filter(a => a.role !== 'self').forEach(a => {
    const peer = data.peers.find(p => p.evaluatorName.trim().toLowerCase() === a.evaluatorName.trim().toLowerCase() && p.scores.length > 0);
    if (peer) all.push(peer.scores);
  });
  if (all.length === 0) return null;
  return all.reduce((sum, s) => sum + s.reduce((a, b) => a + b, 0) / s.length, 0) / all.length;
}

function GlobalStatsPanel() {
  const { eval360Assignments, threeSixty } = useEvaluationStore();

  const totalAssigned = eval360Assignments.length;
  const totalCompleted = eval360Assignments.filter(a => a.completedAt).length;
  const totalPending = eval360Assignments.filter(a => !a.completedAt).length;

  const allScores: number[] = [];
  EMPLOYEES.forEach(emp => {
    const data = threeSixty[emp.id];
    if (!data) return;
    const subs: number[][] = [];
    if (data.self) subs.push(data.self);
    data.peers.forEach(p => { if (p.scores.length > 0) subs.push(p.scores); });
    if (subs.length === 0) return;
    const avg = subs.reduce((sum, s) => sum + s.reduce((a, b) => a + b, 0) / s.length, 0) / subs.length;
    allScores.push(avg);
  });
  const globalAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;
  const completionPct = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <BarChart3 size={18} className="text-slate-600" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">Total asignadas</div>
          <div className="text-2xl font-bold text-gray-900 mt-0.5">{totalAssigned}</div>
          <div className="text-xs text-gray-400 mt-0.5">evaluaciones</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} className="text-emerald-600" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">Completadas</div>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">{totalCompleted}</div>
          <div className="text-xs text-gray-400 mt-0.5">{completionPct}% del total</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Clock size={18} className="text-amber-500" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">Sin finalizar</div>
          <div className="text-2xl font-bold text-amber-500 mt-0.5">{totalPending}</div>
          <div className="text-xs text-gray-400 mt-0.5">pendientes</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <TrendingUp size={18} className="text-blue-600" />
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">Promedio general</div>
          <div className={`text-2xl font-bold mt-0.5 ${globalAvg !== null ? getScoreColor(globalAvg) : 'text-gray-300'}`}>
            {globalAvg !== null ? globalAvg.toFixed(2) : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">de 5.0 · {allScores.length} evaluados</div>
        </div>
      </div>
    </div>
  );
}

function Eval360AdminView() {
  const { eval360Assignments, eval360Sessions, threeSixty } = useEvaluationStore();
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [detailEmployeeId, setDetailEmployeeId] = useState<string | null>(null);
  const [showAssignModalFor, setShowAssignModalFor] = useState<Employee | null>(null);

  const areas = useMemo(() => Array.from(new Set(EMPLOYEES.map(e => e.department))), []);

  const availablePeriods = useMemo(() => {
    const periods = new Set(eval360Sessions.map(s => s.period));
    return EVAL_360_PERIODS.filter(p => periods.has(p.value));
  }, [eval360Sessions]);

  const filtered = useMemo(() => {
    return EMPLOYEES.filter(e => {
      const matchSearch = search === '' ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase());
      const matchArea = filterArea === 'all' || e.department === filterArea;
      const matchTeam = filterTeam === 'all';
      if (!matchSearch || !matchArea || !matchTeam) return false;
      if (filterPeriod !== 'all') {
        const hasPeriod = eval360Sessions.some(s => s.targetEmployeeId === e.id && s.period === filterPeriod);
        if (!hasPeriod) return false;
      }
      return true;
    });
  }, [search, filterArea, filterTeam, filterPeriod, eval360Sessions]);

  const detailEmployee = detailEmployeeId ? EMPLOYEES.find(e => e.id === detailEmployeeId) ?? null : null;

  if (detailEmployee) {
    return (
      <>
        <EmployeeDetailView
          employee={detailEmployee}
          onBack={() => setDetailEmployeeId(null)}
          onAssign={() => setShowAssignModalFor(detailEmployee)}
        />
        {showAssignModalFor && (
          <Assign360Modal targetEmployee={showAssignModalFor} onClose={() => setShowAssignModalFor(null)} />
        )}
      </>
    );
  }

  return (
    <div className="space-y-5">
      <GlobalStatsPanel />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 transition-all"
            />
          </div>

          {/* Área */}
          <div className="relative">
            <select
              value={filterArea}
              onChange={e => setFilterArea(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700 cursor-pointer transition-all"
            >
              <option value="all">Todas las áreas</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Equipo */}
          <div className="relative">
            <select
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700 cursor-pointer transition-all"
            >
              <option value="all">Todos los equipos</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Periodo */}
          <div className="relative">
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700 cursor-pointer transition-all"
            >
              <option value="all">Todos los periodos</option>
              {availablePeriods.length > 0
                ? availablePeriods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)
                : EVAL_360_PERIODS.slice(0, 6).map(p => <option key={p.value} value={p.value}>{p.label}</option>)
              }
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <span className="text-xs text-gray-400 ml-auto">{filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Colaborador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Progreso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Puntaje</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 w-36" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-gray-400">
                    No se encontraron colaboradores con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filtered.map(emp => {
                  const lastSession = [...eval360Sessions]
                    .filter(s => s.targetEmployeeId === emp.id)
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
                  const sessionAssignments = lastSession
                    ? eval360Assignments.filter(a => a.sessionId === lastSession.id)
                    : [];
                  const completed = sessionAssignments.filter(a => a.completedAt).length;
                  const total = sessionAssignments.length;
                  const pct = total > 0 ? (completed / total) * 100 : 0;
                  const lastScore = computeLastSessionScore(emp.id, eval360Sessions, eval360Assignments, threeSixty);
                  const statusLabel = total === 0 ? 'Sin asignar' : pct === 100 ? 'Completo' : 'En progreso';
                  const statusCls = total === 0
                    ? 'bg-gray-100 text-gray-500'
                    : pct === 100
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700';

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {emp.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{emp.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-600">{emp.department}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#2563eb' }} />
                          </div>
                          <span className="text-[11px] text-gray-500 shrink-0">{completed}/{total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {lastScore !== null
                          ? <span className={`text-sm font-black ${getScoreColor(lastScore)}`}>{lastScore.toFixed(2)}</span>
                          : <span className="text-sm text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusCls}`}>{statusLabel}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setDetailEmployeeId(emp.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all whitespace-nowrap"
                        >
                          <Eye size={12} />
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignModalFor && (
        <Assign360Modal
          targetEmployee={showAssignModalFor}
          onClose={() => setShowAssignModalFor(null)}
        />
      )}
    </div>
  );
}

function Eval360EmployeeView({ employeeId }: { employeeId: string }) {
  const { eval360Sessions, syncCompletedEvaluations } = useEvaluationStore();
  const [activeTab, setActiveTab] = useState<'estado' | 'resultados'>('estado');

  useEffect(() => {
    syncCompletedEvaluations();
  }, [syncCompletedEvaluations]);

  const lastSession = useMemo(() => {
    const sessions = eval360Sessions
      .filter(s => s.targetEmployeeId === employeeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sessions[0] ?? null;
  }, [eval360Sessions, employeeId]);

  const TABS = [
    { id: 'estado' as const, label: 'Estado', icon: <Clock size={16} /> },
    { id: 'resultados' as const, label: 'Resultados', icon: <Eye size={16} /> },
  ];

  if (!lastSession) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart2 size={32} className="text-gray-200 mb-3" />
        <p className="text-sm font-semibold text-gray-400">Sin evaluaciones aún</p>
        <p className="text-xs text-gray-300 mt-1">Cuando se cree una evaluación 360 para ti, aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50/60">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'estado' && <Eval360SessionStatusView session={lastSession} onBack={() => {}} embedded />}
          {activeTab === 'resultados' && <Eval360ResultsV2View session={lastSession} onBack={() => {}} embedded />}
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
