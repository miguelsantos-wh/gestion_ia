import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Award, AlertCircle, TrendingUp, Plus, Trash2, BarChart2,
  User, Briefcase, Equal, UserCheck, Globe, Users,
  CheckCircle2, Clock, ChevronDown, ChevronUp, Save, Eye, X, Calendar, MessageSquare, Quote,
} from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES } from '../data/evaluation360Template';
import type { Eval360Role, Evaluation360Session, PdiItem } from '../types/evaluation';
import { EVAL_360_ROLE_LABELS } from '../types/evaluation';
import { EMPLOYEES } from '../data/mockData';

const ROLE_ICONS: Record<Eval360Role, React.ReactNode> = {
  self: <User size={11} />,
  leader: <Briefcase size={11} />,
  peer: <Equal size={11} />,
  collaborator: <UserCheck size={11} />,
  client: <Globe size={11} />,
  anonymous: <Users size={11} />,
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

function getClassification(s: number) {
  if (s >= 4.1) return { label: 'Sobresaliente', badge: 'bg-green-100 text-green-700', bar: '#059669', border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-600' };
  if (s >= 3.1) return { label: 'Bueno', badge: 'bg-blue-100 text-blue-700', bar: '#2563eb', border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-600' };
  if (s >= 2.1) return { label: 'Regular', badge: 'bg-yellow-100 text-yellow-700', bar: '#d97706', border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-600' };
  return { label: 'Deficiente', badge: 'bg-red-100 text-red-700', bar: '#dc2626', border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-600' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Props {
  session: Evaluation360Session;
  onBack: () => void;
  embedded?: boolean;
}

export default function Eval360SessionResultsView({ session, onBack, embedded }: Props) {
  const { threeSixty, eval360Assignments, pdiItems: allPdi, savePdiItems } = useEvaluationStore();
  const [pdiItems, setPdiItems] = useState<PdiItem[]>(() => allPdi[session.id] ?? []);
  const [pdiDirty, setPdiDirty] = useState(false);

  useEffect(() => {
    setPdiItems(allPdi[session.id] ?? []);
    setPdiDirty(false);
  }, [session.id, allPdi]);

  const handleSavePdi = useCallback(() => {
    savePdiItems(session.id, pdiItems);
    setPdiDirty(false);
  }, [savePdiItems, session.id, pdiItems]);

  const employee = EMPLOYEES.find(e => e.id === session.targetEmployeeId);
  const assignments = eval360Assignments.filter(a => a.sessionId === session.id);
  const completedAssignments = assignments.filter(a => a.completedAt);
  const template = EVALUATION_360_TEMPLATES.find(t => t.id === session.templateId) ?? EVALUATION_360_TEMPLATES[0];
  const data = threeSixty[session.targetEmployeeId];

  /* Build submissions scoped to this session only */
  const allSubmissions = useMemo(() => {
    if (!data) return [];
    const subs: { label: string; role: Eval360Role; scores: number[]; comment?: string }[] = [];

    // Self: only include if there's a completed self-assignment in this session
    const selfAssignment = completedAssignments.find(a => a.role === 'self');
    if (selfAssignment && data.self) {
      subs.push({ label: employee?.name ?? 'Auto', role: 'self', scores: data.self, comment: data.selfComment ?? selfAssignment.comment });
    }

    // Peers: only include those whose names match a completed assignment of this session
    completedAssignments
      .filter(a => a.role !== 'self')
      .forEach(a => {
        const peer = data.peers.find(
          p => p.scores.length > 0 && p.evaluatorName.trim().toLowerCase() === a.evaluatorName.trim().toLowerCase()
        );
        if (peer) {
          subs.push({ label: peer.evaluatorName || 'Evaluador', role: a.role as Eval360Role, scores: peer.scores, comment: peer.comment ?? a.comment });
        }
      });

    return subs;
  }, [data, completedAssignments, employee]);

  /* Competency averages (all respondents) */
  const competencyScores = useMemo(() => {
    if (allSubmissions.length === 0) return null;
    return template.items.map((item, idx) => {
      const vals = allSubmissions.map(s => s.scores[idx] ?? 0).filter(v => v > 0);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const name = COMPETENCY_NAMES[idx] ?? item.statement.slice(0, 30);
      return { id: idx + 1, name, avg, classification: getClassification(avg) };
    });
  }, [allSubmissions, template]);

  const overallScore = useMemo(() => {
    if (!competencyScores) return null;
    const scored = competencyScores.filter(c => c.avg > 0);
    if (scored.length === 0) return null;
    return scored.reduce((a, c) => a + c.avg, 0) / scored.length;
  }, [competencyScores]);

  const strengths = useMemo(() => {
    if (!competencyScores) return [];
    return [...competencyScores].filter(c => c.avg > 0).sort((a, b) => b.avg - a.avg).slice(0, 3);
  }, [competencyScores]);

  const improvements = useMemo(() => {
    if (!competencyScores) return [];
    return [...competencyScores].filter(c => c.avg > 0).sort((a, b) => a.avg - b.avg).slice(0, 3);
  }, [competencyScores]);

  const addPdi = (item: PdiItem) => {
    setPdiItems(p => [...p, item]);
    setPdiDirty(true);
  };
  const updatePdi = (idx: number, field: keyof PdiItem, value: string | number) => {
    setPdiItems(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    setPdiDirty(true);
  };
  const removePdi = (idx: number) => {
    setPdiItems(p => p.filter((_, i) => i !== idx));
    setPdiDirty(true);
  };

  if (!employee) return null;

  const conclusionDate = completedAssignments.length > 0
    ? completedAssignments.reduce((latest, a) => a.completedAt! > latest ? a.completedAt! : latest, completedAssignments[0].completedAt!)
    : null;

  const noData = !data || (!data.self && data.peers.length === 0);

  return (
    <div className="space-y-6">
      {/* Back — hidden when embedded */}
      {!embedded && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver a la lista de evaluaciones
        </button>
      )}

      {/* Session description card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-1">{session.name}</h3>
        {session.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{session.description}</p>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Persona evaluada</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {employee.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{employee.name}</p>
                <p className="text-[10px] text-gray-400">{employee.position}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Periodo</p>
            <p className="text-xs font-bold text-gray-900">{session.period}</p>
            <p className="text-[10px] text-gray-400">Trimestre</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Competencias</p>
            <p className="text-xs font-bold text-gray-900">{template.items.length}</p>
            <p className="text-[10px] text-gray-400 truncate">{template.name.slice(0, 25)}…</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Conclusión</p>
            {conclusionDate ? (
              <>
                <p className="text-xs font-bold text-green-700">{formatDate(conclusionDate)}</p>
                <div className="flex items-center gap-1 text-[10px] text-green-500">
                  <CheckCircle2 size={9} /> {completedAssignments.length}/{assignments.length} completos
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Clock size={11} /> En progreso
              </div>
            )}
          </div>
        </div>
      </div>

      {noData ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={22} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Sin resultados disponibles</p>
          <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
            Los resultados aparecen cuando los evaluadores completen la evaluación.
          </p>
        </div>
      ) : (
        <>
          {/* Score + overall */}
          {overallScore !== null && (() => {
            const cls = getClassification(overallScore);
            return (
              <div className={`rounded-2xl border ${cls.border} ${cls.bg} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Calificación y promedio global</p>
                    <p className="text-xs text-gray-500">
                      {allSubmissions.length} respuesta{allSubmissions.length !== 1 ? 's' : ''} · {data?.self ? 'incluye autoevaluación' : 'sin autoevaluación'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-black ${cls.text}`}>{overallScore.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">de 5.0</div>
                  </div>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2.5 mb-2">
                  <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${(overallScore / 5) * 100}%`, backgroundColor: cls.bar }} />
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls.badge}`}>{cls.label}</span>
                  <span className="text-xs text-gray-600">
                    {cls.label === 'Sobresaliente' && 'Desempeño excelente. Supera expectativas en la mayoría de áreas.'}
                    {cls.label === 'Bueno' && 'Cumple con las expectativas. Algunas áreas a mejorar.'}
                    {cls.label === 'Regular' && 'Desempeño aceptable, pero necesita mejoras claras.'}
                    {cls.label === 'Deficiente' && 'Desempeño por debajo de lo esperado. Requiere intervención.'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Competency results table */}
          {competencyScores && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tabla de resultados por competencia</h4>
              </div>
              <div className="divide-y divide-gray-50">
                {competencyScores.map(comp => (
                  <div key={comp.id} className="px-5 py-3 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5 shrink-0 font-medium">{comp.id}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-gray-800">{comp.name}</span>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`text-xs font-black ${comp.avg > 0 ? comp.classification.text : 'text-gray-300'}`}>
                              {comp.avg > 0 ? comp.avg.toFixed(2) : '—'}
                            </span>
                            {comp.avg > 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${comp.classification.badge}`}>
                                {comp.classification.label}
                              </span>
                            )}
                          </div>
                        </div>
                        {comp.avg > 0 && (
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${(comp.avg / 5) * 100}%`, backgroundColor: comp.classification.bar }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {overallScore !== null && (
                <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Promedio Total</span>
                  <span className={`text-lg font-black ${getClassification(overallScore).text}`}>{overallScore.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Strengths + Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-green-600" />
                <h4 className="text-xs font-bold text-green-900 uppercase tracking-wide">Fortalezas (Top 3)</h4>
              </div>
              {strengths.length === 0 ? (
                <p className="text-xs text-green-500 italic">Sin fortalezas destacadas aún</p>
              ) : (
                <div className="space-y-2">
                  {strengths.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-green-100">
                      <span className="text-xs font-black text-green-700 bg-green-100 w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-green-900">{s.name}</span>
                      </div>
                      <span className={`text-xs font-black ${s.classification.text}`}>{s.avg.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-amber-600" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Áreas de Mejora (3 más bajas)</h4>
              </div>
              {improvements.length === 0 ? (
                <p className="text-xs text-amber-500 italic">Sin áreas de mejora identificadas</p>
              ) : (
                <div className="space-y-2">
                  {improvements.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-amber-100">
                      <span className="text-xs font-black text-amber-700 bg-amber-100 w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-amber-900">{s.name}</span>
                      </div>
                      <span className={`text-xs font-black ${s.classification.text}`}>{s.avg.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PDI — before evaluator breakdown */}
          <PdiSection
            pdiItems={pdiItems}
            pdiDirty={pdiDirty}
            employee={employee}
            session={session}
            eval360Assignments={eval360Assignments}
            improvementAreas={improvements.map(s => s.name)}
            onAdd={addPdi}
            onUpdate={updatePdi}
            onRemove={removePdi}
            onSave={handleSavePdi}
          />

        </>
      )}

      {/* Comments panel */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Comentarios de los evaluadores</h4>
            {allSubmissions.some(s => s.comment) ? (
              <p className="text-xs text-slate-400 mt-0.5">
                {allSubmissions.filter(s => s.comment).length} comentario{allSubmissions.filter(s => s.comment).length !== 1 ? 's' : ''} recibido{allSubmissions.filter(s => s.comment).length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Sin comentarios</p>
            )}
          </div>
        </div>

        {/* Comment cards */}
        <div className="bg-slate-50 p-4">
          {allSubmissions.some(s => s.comment) ? (
            <div className="space-y-3">
              {allSubmissions.filter(s => s.comment).map((sub, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Evaluator header */}
                  <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-50">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[sub.role] }}
                    >
                      {sub.label.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{sub.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span style={{ color: ROLE_COLORS[sub.role] }}>{ROLE_ICONS[sub.role]}</span>
                        <span className="text-[10px] text-gray-400">{EVAL_360_ROLE_LABELS[sub.role]}</span>
                      </div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${ROLE_COLORS[sub.role]}15` }}
                    >
                      <Quote size={11} style={{ color: ROLE_COLORS[sub.role] }} />
                    </div>
                  </div>
                  {/* Comment body */}
                  <div className="px-4 py-3.5 relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                      style={{ background: ROLE_COLORS[sub.role] }}
                    />
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-3">
                      {sub.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No hay comentarios</p>
              <p className="text-xs text-slate-400 mt-1">Los evaluadores no han dejado comentarios en esta evaluación.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

const STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    cardBorder: 'border-l-slate-400',
    barColor: '#64748b',
    dot: 'bg-slate-500',
    badgeBg: 'bg-gradient-to-r from-slate-100 to-slate-50',
    headerGradient: 'from-slate-50 to-slate-100',
    accentLight: '#f1f5f9',
    accentDark: '#475569',
  },
  en_progreso: {
    label: 'En progreso',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    cardBorder: 'border-l-sky-500',
    barColor: '#0ea5e9',
    dot: 'bg-sky-500 animate-pulse',
    badgeBg: 'bg-gradient-to-r from-sky-100 to-blue-50',
    headerGradient: 'from-sky-50 to-cyan-100',
    accentLight: '#e0f2fe',
    accentDark: '#0369a1',
  },
  completado: {
    label: 'Completado',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    cardBorder: 'border-l-emerald-500',
    barColor: '#10b981',
    dot: 'bg-emerald-500',
    badgeBg: 'bg-gradient-to-r from-emerald-100 to-green-50',
    headerGradient: 'from-emerald-50 to-green-100',
    accentLight: '#ecfdf5',
    accentDark: '#059669',
  },
} as const;

/* ─── PdiDetailModal ──────────────────────────────────────────────────────── */
function PdiDetailModal({
  item,
  idx,
  session,
  employee,
  eval360Assignments,
  onUpdate,
  onRemove,
  onClose,
}: {
  item: PdiItem;
  idx: number;
  session: Evaluation360Session;
  employee: ReturnType<typeof EMPLOYEES.find>;
  eval360Assignments: { id: string; sessionId: string; completedAt?: string; isAnonymous: boolean; role: string; evaluatorName: string }[];
  onUpdate: (idx: number, field: keyof PdiItem, value: string | number) => void;
  onRemove: (idx: number) => void;
  onClose: () => void;
}) {
  const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
  const progressVal = Math.min(100, Math.max(0, item.progress ?? 0));
  const isCompleted = item.status === 'completado';
  const overlayRef = useRef<HTMLDivElement>(null);

  const statusIcons: Record<string, React.ReactNode> = {
    pendiente: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
    en_progreso: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
    completado: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 4.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: statusCfg.accentLight, border: `2px solid ${statusCfg.accentDark}30`, borderLeftWidth: '5px', borderLeftColor: statusCfg.accentDark }}
      >
        {/* Modal header */}
        <div
          className="px-5 pt-4 pb-3 flex items-center justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${statusCfg.accentLight}, rgba(255,255,255,0.6))` }}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full shrink-0 ${statusCfg.dot} shadow-sm`} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusCfg.accentDark }}>
                Compromiso {idx + 1}
              </p>
              <p className="text-xs font-bold text-gray-800 truncate max-w-xs">{item.area || 'Sin área'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { onRemove(idx); onClose(); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
              title="Eliminar compromiso"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Status selector */}
        <div className="px-5 py-3 border-b border-black/10 flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mr-1">Estado</span>
          <div className="flex items-center gap-1 p-0.5 bg-white/60 rounded-full border border-black/10">
            {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => {
              const active = item.status === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onUpdate(idx, 'status', key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200"
                  style={active ? { background: cfg.barColor, color: '#fff', boxShadow: `0 2px 8px ${cfg.barColor}60` } : { background: 'transparent', color: cfg.barColor }}
                >
                  {statusIcons[key]}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Area + Responsible */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                Área a mejorar
              </label>
              <input
                type="text"
                value={item.area}
                onChange={e => onUpdate(idx, 'area', e.target.value)}
                placeholder="Ej. Liderazgo, Comunicación…"
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                Responsable
              </label>
              <div className="relative">
                <select
                  value={item.responsible}
                  onChange={e => onUpdate(idx, 'responsible', e.target.value)}
                  className="w-full appearance-none text-xs pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-gray-800 cursor-pointer transition-all"
                >
                  <option value={employee?.name ?? ''}>{employee?.name ?? 'Evaluado'} (Evaluado)</option>
                  {eval360Assignments
                    .filter(a => a.sessionId === session.id && a.completedAt && !a.isAnonymous && a.role !== 'self')
                    .map(a => (
                      <option key={a.id} value={a.evaluatorName}>
                        {a.evaluatorName} ({EVAL_360_ROLE_LABELS[a.role as Eval360Role]})
                      </option>
                    ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Acción / Cómo se llevará a cabo
            </label>
            <textarea
              value={item.action}
              onChange={e => onUpdate(idx, 'action', e.target.value)}
              placeholder="Describe la acción concreta a realizar…"
              rows={3}
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all text-gray-800"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
              Fecha límite
            </label>
            <input
              type="date"
              value={item.deadline}
              onChange={e => onUpdate(idx, 'deadline', e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-gray-700 transition-all"
            />
          </div>

          {/* Progress */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-2" style={{ color: statusCfg.accentDark }}>
              Avance — <span className="font-black text-lg" style={{ color: statusCfg.barColor }}>{progressVal}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progressVal}
              onChange={e => onUpdate(idx, 'progress', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                accentColor: statusCfg.barColor,
                background: `linear-gradient(to right, ${statusCfg.barColor} 0%, ${statusCfg.barColor} ${progressVal}%, #e5e7eb ${progressVal}%, #e5e7eb 100%)`,
              }}
            />
            {isCompleted && (
              <div className="flex items-center justify-end gap-1 mt-1.5 text-emerald-600 text-[10px] font-bold">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 9L2 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                100% completado
              </div>
            )}
          </div>
        </div>

        {/* Close footer */}
        <div className="px-5 py-3 border-t border-black/10 bg-white/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PdiItemList ─────────────────────────────────────────────────────────── */
function PdiItemList({
  pdiItems,
  session,
  employee,
  eval360Assignments,
  onUpdate,
  onRemove,
}: {
  pdiItems: PdiItem[];
  session: Evaluation360Session;
  employee: ReturnType<typeof EMPLOYEES.find>;
  eval360Assignments: { id: string; sessionId: string; completedAt?: string; isAnonymous: boolean; role: string; evaluatorName: string }[];
  onUpdate: (idx: number, field: keyof PdiItem, value: string | number) => void;
  onRemove: (idx: number) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <>
      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 w-6">#</th>
              <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 w-36">Área a mejorar</th>
              <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5">Acción</th>
              <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 w-28">Estado</th>
              <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 w-24">Fecha límite</th>
              <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2.5 w-32">Progreso</th>
              <th className="w-20 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pdiItems.map((item, idx) => {
              const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
              const progressVal = Math.min(100, Math.max(0, item.progress ?? 0));

              return (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors group"
                  style={{ borderLeft: `3px solid ${statusCfg.accentDark}` }}
                >
                  {/* # */}
                  <td className="px-4 py-3 text-[10px] font-black text-gray-400">{idx + 1}</td>

                  {/* Área */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-800 truncate block max-w-[130px]">
                      {item.area || <span className="text-gray-300 font-normal italic">—</span>}
                    </span>
                  </td>

                  {/* Acción */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed max-w-xs">
                      {item.action || <span className="text-gray-300 italic">Sin acción definida</span>}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: `${statusCfg.barColor}18`, color: statusCfg.barColor }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3">
                    {item.deadline ? (
                      <span className="flex items-center gap-1 text-[11px] text-gray-500 whitespace-nowrap">
                        <Calendar size={10} className="text-gray-400 shrink-0" />
                        {item.deadline}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Progreso */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden min-w-[60px]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressVal}%`, background: statusCfg.barColor }}
                        />
                      </div>
                      <span className="text-[11px] font-bold shrink-0 w-8 text-right" style={{ color: statusCfg.barColor }}>
                        {progressVal}%
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenIdx(idx)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-gray-400 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={11} />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {openIdx !== null && openIdx < pdiItems.length && (
        <PdiDetailModal
          item={pdiItems[openIdx]}
          idx={openIdx}
          session={session}
          employee={employee}
          eval360Assignments={eval360Assignments}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </>
  );
}

/* ─── NewPdiModal ─────────────────────────────────────────────────────────── */
function NewPdiModal({
  employee,
  session,
  eval360Assignments,
  improvementAreas,
  onConfirm,
  onClose,
}: {
  employee: ReturnType<typeof EMPLOYEES.find>;
  session: Evaluation360Session;
  eval360Assignments: { id: string; sessionId: string; completedAt?: string; isAnonymous: boolean; role: string; evaluatorName: string }[];
  improvementAreas: string[];
  onConfirm: (item: PdiItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PdiItem>({
    id: `pdi-${Date.now()}`,
    area: improvementAreas[0] ?? '',
    action: '',
    responsible: employee?.name ?? '',
    deadline: '',
    progress: 0,
    status: 'pendiente',
  });
  const [customArea, setCustomArea] = useState('');

  const statusCfg = STATUS_CONFIG[draft.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
  const progressVal = Math.min(100, Math.max(0, draft.progress ?? 0));
  const overlayRef = useRef<HTMLDivElement>(null);

  const statusIcons: Record<string, React.ReactNode> = {
    pendiente: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
    en_progreso: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
    completado: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 4.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  };

  const update = (field: keyof PdiItem, value: string | number) =>
    setDraft(prev => ({ ...prev, [field]: value }));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: statusCfg.accentLight, border: `2px solid ${statusCfg.accentDark}30`, borderLeftWidth: '5px', borderLeftColor: statusCfg.accentDark }}
      >
        {/* Header */}
        <div
          className="px-5 pt-4 pb-3 flex items-center justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${statusCfg.accentLight}, rgba(255,255,255,0.6))` }}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full shrink-0 ${statusCfg.dot}`} />
            <p className="text-sm font-bold text-gray-800">Nuevo compromiso</p>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Status selector */}
        <div className="px-5 py-3 border-b border-black/10 flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mr-1">Estado</span>
          <div className="flex items-center gap-1 p-0.5 bg-white/60 rounded-full border border-black/10">
            {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => {
              const active = draft.status === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update('status', key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200"
                  style={active ? { background: cfg.barColor, color: '#fff', boxShadow: `0 2px 8px ${cfg.barColor}60` } : { background: 'transparent', color: cfg.barColor }}
                >
                  {statusIcons[key]}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Área a mejorar</label>
              {improvementAreas.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="relative">
                    <select
                      value={improvementAreas.includes(draft.area) ? draft.area : '__custom__'}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          update('area', customArea);
                        } else {
                          setCustomArea('');
                          update('area', e.target.value);
                        }
                      }}
                      className="w-full appearance-none text-xs pl-3 pr-7 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-amber-50 cursor-pointer transition-all font-semibold text-amber-900"
                    >
                      {improvementAreas.map((a, i) => (
                        <option key={i} value={a}>{a}</option>
                      ))}
                      <option value="__custom__">Otra área…</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  {!improvementAreas.includes(draft.area) && (
                    <input
                      type="text"
                      value={customArea}
                      onChange={e => { setCustomArea(e.target.value); update('area', e.target.value); }}
                      placeholder="Escribe el área…"
                      autoFocus
                      className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all"
                    />
                  )}
                </div>
              ) : (
                <input type="text" value={draft.area} onChange={e => update('area', e.target.value)} placeholder="Ej. Liderazgo…"
                  className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all" />
              )}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Responsable</label>
              <div className="relative">
                <select value={draft.responsible} onChange={e => update('responsible', e.target.value)}
                  className="w-full appearance-none text-xs pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white cursor-pointer transition-all">
                  <option value={employee?.name ?? ''}>{employee?.name ?? 'Evaluado'} (Evaluado)</option>
                  {eval360Assignments
                    .filter(a => a.sessionId === session.id && a.completedAt && !a.isAnonymous && a.role !== 'self')
                    .map(a => <option key={a.id} value={a.evaluatorName}>{a.evaluatorName} ({EVAL_360_ROLE_LABELS[a.role as Eval360Role]})</option>)}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Acción / Cómo se llevará a cabo</label>
            <textarea value={draft.action} onChange={e => update('action', e.target.value)} placeholder="Describe la acción concreta…" rows={3}
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Fecha límite</label>
            <input type="date" value={draft.deadline} onChange={e => update('deadline', e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-2" style={{ color: statusCfg.accentDark }}>
              Avance — <span className="font-black text-lg" style={{ color: statusCfg.barColor }}>{progressVal}%</span>
            </label>
            <input type="range" min={0} max={100} step={5} value={progressVal}
              onChange={e => update('progress', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: statusCfg.barColor, background: `linear-gradient(to right, ${statusCfg.barColor} 0%, ${statusCfg.barColor} ${progressVal}%, #e5e7eb ${progressVal}%, #e5e7eb 100%)` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/10 bg-white/40 flex justify-between items-center gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ ...draft, id: `pdi-${Date.now()}` })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={13} />
            Agregar compromiso
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PdiSection ──────────────────────────────────────────────────────────── */
function PdiSection({
  pdiItems,
  pdiDirty,
  employee,
  session,
  eval360Assignments,
  improvementAreas,
  onAdd,
  onUpdate,
  onRemove,
  onSave,
}: {
  pdiItems: PdiItem[];
  pdiDirty: boolean;
  employee: ReturnType<typeof EMPLOYEES.find>;
  session: Evaluation360Session;
  eval360Assignments: { id: string; sessionId: string; completedAt?: string; isAnonymous: boolean; role: string; evaluatorName: string }[];
  improvementAreas: string[];
  onAdd: (item: PdiItem) => void;
  onUpdate: (idx: number, field: keyof PdiItem, value: string | number) => void;
  onRemove: (idx: number) => void;
  onSave: () => void;
}) {
  const [showNewModal, setShowNewModal] = useState(false);

  const blankItem: PdiItem = {
    id: `pdi-${Date.now()}`,
    area: '',
    action: '',
    responsible: employee?.name ?? '',
    deadline: '',
    progress: 0,
    status: 'pendiente',
  };

  const completedCount = pdiItems.filter(p => p.status === 'completado').length;
  const totalProgress = pdiItems.length > 0
    ? Math.round(pdiItems.reduce((sum, p) => sum + (p.progress ?? 0), 0) / pdiItems.length)
    : 0;

  const openNew = () => setShowNewModal(true);

  return (
    <>
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)', border: '1px solid #bae6fd' }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Compromisos y Plan de Acción</h4>
              <p className="text-xs text-blue-300 font-medium mt-0.5">PDI · {employee?.name ?? 'Colaborador'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pdiDirty && (
              <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white' }}
              >
                <Save size={12} />
                Guardar cambios
              </button>
            )}
            <button
              type="button"
              onClick={openNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
            >
              <Plus size={12} />
              Agregar
            </button>
          </div>
        </div>

        {/* Stats row */}
        {pdiItems.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-black text-white">{pdiItems.length}</p>
              <p className="text-[10px] text-blue-300">compromisos</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-black text-emerald-300">{completedCount}</p>
              <p className="text-[10px] text-blue-300">completados</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-black text-cyan-300">{totalProgress}%</p>
              <p className="text-[10px] text-blue-300">avance promedio</p>
            </div>
          </div>
        )}

        {/* Overall progress bar */}
        {pdiItems.length > 0 && (
          <div className="mt-3">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${totalProgress}%`,
                  background: totalProgress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#3b82f6,#06b6d4)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {pdiItems.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              <TrendingUp size={22} className="text-blue-400" />
            </div>
            <p className="text-sm font-bold text-slate-600">Sin compromisos registrados</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Define acciones concretas para el desarrollo del colaborador
            </p>
            <button
              type="button"
              onClick={openNew}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mx-auto transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}
            >
              <Plus size={14} />
              Crear primer compromiso
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <PdiItemList
              pdiItems={pdiItems}
              session={session}
              employee={employee}
              eval360Assignments={eval360Assignments}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />

            {/* Summary footer */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = pdiItems.filter(p => p.status === key).length;
                    if (count === 0) return null;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-[11px] font-bold transition-all hover:shadow-sm"
                        style={{
                          background: cfg.accentLight,
                          borderColor: cfg.accentDark,
                          color: cfg.accentDark,
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                        <span className="ml-1 font-black text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
                {pdiDirty && (
                  <button
                    type="button"
                    onClick={onSave}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 shadow-md hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                  >
                    <Save size={12} />
                    Guardar cambios
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* New item modal — uses PdiDetailModal in "create" mode */}
    {showNewModal && (
      <NewPdiModal
        employee={employee}
        session={session}
        eval360Assignments={eval360Assignments}
        improvementAreas={improvementAreas}
        onConfirm={item => { onAdd(item); setShowNewModal(false); }}
        onClose={() => setShowNewModal(false)}
      />
    )}
    </>
  );
}
