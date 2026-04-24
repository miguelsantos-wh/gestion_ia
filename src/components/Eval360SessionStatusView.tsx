import { useMemo, useState } from 'react';
import {
  CheckCircle2, Clock, User, Briefcase, Equal, UserCheck, Globe, Users,
  Link2, Check, AlertTriangle, CalendarDays, ChevronDown, ChevronUp,
  ArrowLeft, TrendingUp, BarChart2, Info
} from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES } from '../data/evaluation360Template';
import type { Eval360Role, Evaluation360Session } from '../types/evaluation';
import { EVAL_360_ROLE_LABELS } from '../types/evaluation';
import { EMPLOYEES } from '../data/mockData';

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

const COMPETENCY_NAMES = [
  'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas',
  'Aprendizaje continuo', 'Hazlo Ahora', 'Mejora continua',
  'Autoaprendizaje', 'Alertidad', 'Amabilidad', 'Valor agregado', 'Asertividad',
];

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function daysUntil(iso: string): number {
  const now = new Date();
  const due = new Date(iso);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface Props {
  session: Evaluation360Session;
  onBack: () => void;
}

export default function Eval360SessionStatusView({ session, onBack }: Props) {
  const { eval360Assignments, threeSixty, completeEval360Assignment } = useEvaluationStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAnswersId, setExpandedAnswersId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const employee = EMPLOYEES.find(e => e.id === session.targetEmployeeId);
  const assignments = eval360Assignments.filter(a => a.sessionId === session.id);
  const completed = assignments.filter(a => a.completedAt);
  const pending = assignments.filter(a => !a.completedAt);
  const pct = assignments.length > 0 ? Math.round((completed.length / assignments.length) * 100) : 0;
  const template = EVALUATION_360_TEMPLATES.find(t => t.id === session.templateId) ?? EVALUATION_360_TEMPLATES[0];

  const daysLeft = daysUntil(session.dueDate);
  const overdue = daysLeft < 0;

  /* Overall score for completed assignments that have scores */
  const overallScore = useMemo(() => {
    const data = threeSixty[session.targetEmployeeId];
    if (!data) return null;
    const all: number[][] = [];
    if (data.self) all.push(data.self);
    data.peers.forEach(p => { if (p.scores.length > 0) all.push(p.scores); });
    if (all.length === 0) return null;
    const total = all.reduce((sum, s) => sum + s.reduce((a, b) => a + b, 0) / s.length, 0);
    return total / all.length;
  }, [threeSixty, session.targetEmployeeId]);

  const handleCopy = (assignmentId: string, empId: string, role: Eval360Role) => {
    const params: Record<string, string> = {
      employeeId: empId,
      mode: role === 'self' ? 'self' : 'peer',
      assignmentId,
      role,
    };
    if (session.name) params.sessionName = session.name;
    if (session.description) params.sessionDescription = session.description;
    const link = buildHashLink('/eval-360', params);
    void navigator.clipboard.writeText(link);
    setCopiedId(assignmentId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkComplete = (id: string) => {
    if (confirmId !== id) { setConfirmId(id); return; }
    completeEval360Assignment(id, []);
    setConfirmId(null);
  };

  /* Get scores for a specific assignment if completed */
  const getAssignmentScores = (assignmentId: string): number[] | null => {
    const a = assignments.find(x => x.id === assignmentId);
    if (!a?.completedAt) return null;
    const data = threeSixty[session.targetEmployeeId];
    if (!data) return null;
    if (a.role === 'self') return data.self ?? null;
    const peer = data.peers.find(p =>
      p.evaluatorName.trim().toLowerCase() === a.evaluatorName.trim().toLowerCase()
    );
    return peer?.scores ?? null;
  };

  if (!employee) return null;

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={15} />
        Volver a la lista de evaluaciones
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-base font-bold text-slate-700 shrink-0">
                {employee.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{session.name}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{employee.name} · {employee.position}</p>
                <p className="text-xs text-gray-400">{employee.department}</p>
              </div>
            </div>
            {overallScore !== null && (
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 mb-0.5">Puntaje parcial</p>
                <p className={`text-2xl font-black ${overallScore >= 4.1 ? 'text-green-600' : overallScore >= 3.1 ? 'text-blue-600' : overallScore >= 2.1 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overallScore.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400">de 5.0</p>
              </div>
            )}
          </div>

          {session.description && (
            <div className="mt-3 flex items-start gap-2 p-2.5 bg-white/60 rounded-xl border border-white/80">
              <Info size={12} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">{session.description}</p>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="px-5 py-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">Periodo</p>
            <p className="text-xs font-bold text-gray-800">{session.period}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">Creada</p>
            <p className="text-xs font-semibold text-gray-700">{formatDate(session.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1"><CalendarDays size={9} /> Fecha límite</p>
            <p className={`text-xs font-bold ${overdue ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-gray-800'}`}>
              {formatDate(session.dueDate)}
            </p>
            <p className={`text-[10px] font-semibold ${overdue ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-gray-400'}`}>
              {overdue ? `Venció hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) !== 1 ? 's' : ''}` : daysLeft === 0 ? 'Vence hoy' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">Plantilla</p>
            <p className="text-xs font-semibold text-gray-700 truncate">{template.name.slice(0, 30)}…</p>
          </div>
        </div>
      </div>

      {/* Progress block */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-900">Avance de la evaluación</h4>
          <span className={`text-sm font-black ${pct === 100 ? 'text-green-600' : pct > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{pct}%</span>
        </div>

        {/* Big progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#2563eb' }}
          />
        </div>
        <p className="text-xs text-gray-500 mb-4">{completed.length} de {assignments.length} evaluadores han respondido</p>

        {/* KPI mini grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-xl border border-green-100 p-3 text-center">
            <p className="text-[10px] text-green-600 font-semibold mb-0.5">Completaron</p>
            <p className="text-xl font-black text-green-700">{completed.length}</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 text-center">
            <p className="text-[10px] text-amber-600 font-semibold mb-0.5">Pendientes</p>
            <p className="text-xl font-black text-amber-700">{pending.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-center">
            <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Total</p>
            <p className="text-xl font-black text-gray-700">{assignments.length}</p>
          </div>
        </div>

        {overdue && pending.length > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700">La fecha límite venció y hay evaluaciones pendientes.</p>
          </div>
        )}
      </div>

      {/* Evaluator list: completed */}
      {completed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-100 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600" />
            <h4 className="text-sm font-bold text-green-900">Completaron la evaluación</h4>
            <span className="ml-auto text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{completed.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {completed.map(a => {
              const color = ROLE_COLORS[a.role];
              const scores = getAssignmentScores(a.id);
              const avgScore = scores && scores.length > 0
                ? scores.reduce((x, y) => x + y, 0) / scores.length
                : null;
              const isExpanded = expandedAnswersId === a.id;

              return (
                <div key={a.id}>
                  <div className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>
                      {a.isAnonymous ? '?' : a.evaluatorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{a.isAnonymous ? 'Anónimo' : a.evaluatorName}</p>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color }}>{ROLE_ICONS[a.role]}</span>
                        <span className="text-[10px] text-gray-400">{EVAL_360_ROLE_LABELS[a.role]}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{a.completedAt ? formatShort(a.completedAt) : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {avgScore !== null && (
                        <span className={`text-sm font-black ${avgScore >= 4.1 ? 'text-green-600' : avgScore >= 3.1 ? 'text-blue-600' : avgScore >= 2.1 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {avgScore.toFixed(2)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
                        <CheckCircle2 size={9} /> Completó
                      </span>
                      {scores && scores.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedAnswersId(isExpanded ? null : a.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded answers */}
                  {isExpanded && scores && (
                    <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide py-2">Respuestas</p>
                      <div className="space-y-2">
                        {template.items.map((item, idx) => {
                          const score = scores[idx] ?? 0;
                          const barColor = score >= 4.1 ? '#059669' : score >= 3.1 ? '#2563eb' : score >= 2.1 ? '#d97706' : '#dc2626';
                          const option = item.options.find(o => o.value === score);
                          return (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-3">
                              <div className="flex items-start gap-2.5">
                                <span className="text-[10px] font-bold text-gray-300 w-4 shrink-0 mt-0.5">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-gray-700 mb-1">{COMPETENCY_NAMES[idx] ?? item.statement.slice(0, 40)}</p>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${(score / 5) * 100}%`, backgroundColor: barColor }} />
                                    </div>
                                    <span className="text-xs font-black shrink-0" style={{ color: barColor }}>{score}</span>
                                  </div>
                                  {option && <p className="text-[10px] text-gray-400 italic leading-relaxed">{option.text}</p>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evaluator list: pending */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2">
            <Clock size={14} className="text-amber-500" />
            <h4 className="text-sm font-bold text-amber-900">Pendientes de responder</h4>
            <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.map(a => {
              const color = ROLE_COLORS[a.role];
              const isConfirming = confirmId === a.id;
              return (
                <div key={a.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 opacity-70" style={{ backgroundColor: color }}>
                    {a.isAnonymous ? '?' : a.evaluatorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700">{a.isAnonymous ? 'Anónimo' : a.evaluatorName}</p>
                    <div className="flex items-center gap-1.5">
                      <span style={{ color, opacity: 0.7 }}>{ROLE_ICONS[a.role]}</span>
                      <span className="text-[10px] text-gray-400">{EVAL_360_ROLE_LABELS[a.role]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                      <Clock size={9} /> Pendiente
                    </span>
                    <button
                      type="button"
                      title="Copiar enlace"
                      onClick={() => handleCopy(a.id, session.targetEmployeeId, a.role)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      {copiedId === a.id ? <Check size={13} className="text-green-600" /> : <Link2 size={13} />}
                    </button>
                    {isConfirming ? (
                      <div className="flex gap-1">
                        <button type="button" onClick={() => handleMarkComplete(a.id)} className="px-2 py-1 rounded-lg bg-green-600 text-white text-[10px] font-bold hover:bg-green-700 transition-colors">
                          ✓
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold transition-colors">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        title="Marcar como completada"
                        onClick={() => handleMarkComplete(a.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                      >
                        <CheckCircle2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={22} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Sin evaluadores asignados</p>
          <p className="text-xs text-gray-300 mt-1">Agrega evaluadores desde el modal de asignación.</p>
        </div>
      )}
    </div>
  );
}
