import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Star, AlertCircle, Target, MessageSquare, Plus, Save, FileText, Eye, Trash2, X } from 'lucide-react';
import type { Eval360Role, Evaluation360Session, PdiItem } from '../types/evaluation';
import { EVAL_360_ROLE_LABELS } from '../types/evaluation';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EMPLOYEES } from '../data/mockData';
import { EVALUATION_360_TEMPLATES } from '../data/evaluation360Template';

interface Props {
  session: Evaluation360Session;
  onBack: () => void;
  embedded?: boolean;
}

const COMPETENCY_NAMES = [
  'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas',
  'Aprendizaje continuo', 'Hazlo Ahora', 'Mejora continua',
  'Autoaprendizaje', 'Alertidad', 'Amabilidad', 'Valor agregado', 'Asertividad',
];

const ROLE_COLORS: Record<Eval360Role, string> = {
  self: '#2563eb',
  leader: '#0d9488',
  peer: '#7c3aed',
  collaborator: '#d97706',
  client: '#dc2626',
  anonymous: '#64748b',
};

function cls(score: number) {
  if (score >= 4.1) return { label: 'Sobresaliente', bar: '#059669', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', descColor: 'text-emerald-700' };
  if (score >= 3.1) return { label: 'Bueno', bar: '#2563eb', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', descColor: 'text-blue-700' };
  if (score >= 2.1) return { label: 'Regular', bar: '#d97706', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', descColor: 'text-amber-700' };
  return { label: 'Deficiente', bar: '#dc2626', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', descColor: 'text-red-700' };
}

function desc(score: number) {
  if (score >= 4.1) return 'Supera consistentemente las expectativas del puesto';
  if (score >= 3.1) return 'Cumple con las expectativas del puesto de forma consistente';
  if (score >= 2.1) return 'Cumple con las expectativas del puesto de forma consistente';
  return 'Por debajo de las expectativas del puesto';
}

function formatCalc(d: Date) {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Eval360ResultsV2View({ session, onBack, embedded = false }: Props) {
  const { threeSixty, eval360Assignments, pdiItems: allPdi, savePdiItems } = useEvaluationStore();
  const [pdiItems, setPdiItems] = useState<PdiItem[]>(() => allPdi[session.id] ?? []);
  const [pdiDirty, setPdiDirty] = useState(false);
  const [observations, setObservations] = useState('');
  const [editingObs, setEditingObs] = useState(false);

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

  const allSubmissions = useMemo(() => {
    if (!data) return [];
    const subs: { label: string; role: Eval360Role; scores: number[]; comment?: string }[] = [];
    const selfA = completedAssignments.find(a => a.role === 'self');
    if (selfA && data.self) subs.push({ label: employee?.name ?? 'Auto', role: 'self', scores: data.self, comment: data.selfComment ?? selfA.comment });
    completedAssignments.filter(a => a.role !== 'self').forEach(a => {
      const peer = data.peers.find(p => p.scores.length > 0 && p.evaluatorName.trim().toLowerCase() === a.evaluatorName.trim().toLowerCase());
      if (peer) subs.push({ label: peer.evaluatorName, role: a.role as Eval360Role, scores: peer.scores, comment: peer.comment ?? a.comment });
    });
    return subs;
  }, [data, completedAssignments, employee]);

  const competencyScores = useMemo(() => {
    if (allSubmissions.length === 0) return null;
    return template.items.map((item, idx) => {
      const vals = allSubmissions.map(s => s.scores[idx] ?? 0).filter(v => v > 0);
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const name = COMPETENCY_NAMES[idx] ?? item.statement.slice(0, 30);
      return { id: idx + 1, name, avg };
    }).filter(c => c.avg > 0);
  }, [allSubmissions, template]);

  const overallScore = useMemo(() => {
    if (!competencyScores || competencyScores.length === 0) return null;
    return competencyScores.reduce((a, c) => a + c.avg, 0) / competencyScores.length;
  }, [competencyScores]);

  const strengths = useMemo(() => {
    if (!competencyScores) return [];
    return [...competencyScores].sort((a, b) => b.avg - a.avg).slice(0, 3);
  }, [competencyScores]);

  const improvements = useMemo(() => {
    if (!competencyScores) return [];
    return [...competencyScores].sort((a, b) => a.avg - b.avg).slice(0, 3);
  }, [competencyScores]);

  const [showNewModal, setShowNewModal] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);

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

  const overallCls = overallScore !== null ? cls(overallScore) : null;

  return (
    <div className="space-y-5 pb-10">
      {/* Back */}
      {!embedded && (
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={15} />
          Volver al detalle
        </button>
      )}

      {/* ── HEADER CARD ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* Dark header bar */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: '#1e293b' }}>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">EVALUACIÓN 360°</p>
            <h2 className="text-xl font-bold text-white">Reporte de Resultados</h2>
          </div>
          {overallCls && (
            <div className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow">
              <CheckCircle2 size={16} />
              {overallCls.label}
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="bg-white px-6 py-4 grid grid-cols-4 gap-4 border-b border-gray-100">
          {[
            { icon: '👤', label: 'Colaborador', value: employee.name },
            { icon: '📋', label: 'Evaluación', value: session.name },
            { icon: '📊', label: 'Competencias', value: String(competencyScores?.length ?? 0) },
            { icon: '📅', label: 'Calculado', value: formatCalc(new Date()) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
              <p className="text-sm font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Classification block */}
        {overallScore !== null && overallCls && (
          <div className="bg-white px-6 py-5">
            <div className="flex items-center gap-4">
              {/* Score box */}
              <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-md" style={{ backgroundColor: overallCls.bar }}>
                <span className="text-2xl font-black leading-none">{overallScore.toFixed(2)}</span>
                <span className="text-xs font-semibold mt-1">/ 5.0</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clasificación Global: {overallCls.label}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{desc(overallScore)}</p>
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-2.5">
                  {[
                    { color: '#059669', label: 'Sobresaliente (4.1-5.0)' },
                    { color: '#2563eb', label: 'Bueno (3.1-4.0)' },
                    { color: '#d97706', label: 'Regular (2.1-3.0)' },
                    { color: '#dc2626', label: 'Deficiente (1.0-2.0)' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-xs text-gray-600">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── COMPETENCY TABLE ── */}
      {competencyScores && overallScore !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tabla de Resultados por Competencia</span>
            </div>
            <span className="text-xs text-gray-400">{competencyScores.length} competencias evaluadas</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Competencia / Valor</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Puntaje Obtenido</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Clasificación</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {competencyScores.map((comp, idx) => {
                const c = cls(comp.avg);
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-xs text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">{comp.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black" style={{ color: c.bar }}>{comp.avg.toFixed(2)}</span>
                          <span className="text-xs text-gray-400">/ 5.0</span>
                        </div>
                        <div className="w-28 bg-gray-200 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${(comp.avg / 5) * 100}%`, backgroundColor: c.bar }} />
                        </div>
                        <span className="text-xs text-gray-400">{comp.avg.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${c.badge}`}>
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        {c.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600">{desc(comp.avg)}</td>
                  </tr>
                );
              })}
            </tbody>
            {/* Promedio Global row */}
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td />
                <td className="px-4 py-3 text-xs font-black text-gray-700 uppercase tracking-wide">Promedio Global</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-black text-base" style={{ color: overallCls?.bar }}>
                    {overallScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 ml-0.5">/ 5.0</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {overallCls && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg ${overallCls.badge}`}>
                      <CheckCircle2 size={12} />
                      {overallCls.label}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{overallScore !== null ? desc(overallScore) : ''}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── STRENGTHS + IMPROVEMENTS ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fortalezas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Star size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-emerald-900">Fortalezas Identificadas</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">Top {strengths.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {strengths.map((s, i) => {
              const c = cls(s.avg);
              return (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Star size={12} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc(s.avg)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-sm font-black" style={{ color: c.bar }}>{s.avg.toFixed(2)}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${(s.avg / 5) * 100}%`, backgroundColor: c.bar }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{s.avg.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Oportunidades de mejora */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
                <AlertCircle size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-amber-900">Oportunidades de Mejora</span>
            </div>
            <span className="text-xs font-bold text-amber-600">Bottom {improvements.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {improvements.map((s, i) => {
              const c = cls(s.avg);
              return (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle size={12} className="text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc(s.avg)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-sm font-black" style={{ color: c.bar }}>{s.avg.toFixed(2)}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${(s.avg / 5) * 100}%`, backgroundColor: c.bar }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{s.avg.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PDI TABLE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Target size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Compromisos y Plan de Acción — PDI</p>
              <p className="text-xs text-gray-400 mt-0.5">Las áreas se generan automáticamente · Acciones, responsables y plazos son editables</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Área de Mejora</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Acción Concreta</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Responsable</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Plazo</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Editar</th>
            </tr>
          </thead>
          <tbody>
            {pdiItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Sin compromisos registrados. Usa "Agregar" para crear uno.</td>
              </tr>
            ) : (
              pdiItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{item.area || <span className="text-gray-300 italic">—</span>}</p>
                        <p className="text-[10px] text-gray-400">Auto-generado</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-700 max-w-xs line-clamp-2">
                      {item.action || <span className="text-gray-300 italic">Sin definir...</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {item.responsible || <span className="text-gray-300 italic">Sin definir...</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {item.deadline || <span className="text-gray-300 italic">Sin definir...</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${item.status === 'completado' ? 'bg-emerald-100 text-emerald-700' : item.status === 'en_progreso' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status === 'completado' ? 'Completado' : item.status === 'en_progreso' ? 'En progreso' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setDetailIdx(idx)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-gray-400 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 mx-auto"
                    >
                      <Eye size={11} />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {pdiDirty && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
            <button type="button" onClick={handleSavePdi} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <Save size={13} />
              Guardar cambios
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewPdiModal
          employee={employee}
          session={session}
          eval360Assignments={eval360Assignments}
          improvementAreas={improvements.map(s => s.name)}
          onConfirm={item => { addPdi(item); setShowNewModal(false); }}
          onClose={() => setShowNewModal(false)}
        />
      )}
      {detailIdx !== null && detailIdx < pdiItems.length && (
        <PdiDetailModal
          item={pdiItems[detailIdx]}
          idx={detailIdx}
          session={session}
          employee={employee}
          eval360Assignments={eval360Assignments}
          onUpdate={updatePdi}
          onRemove={idx => { removePdi(idx); setDetailIdx(null); }}
          onClose={() => setDetailIdx(null)}
        />
      )}

      {/* ── EVALUATOR COMMENTS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <FileText size={14} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Comentarios de Evaluadores</span>
        </div>
        <div className="divide-y divide-gray-100">
          {allSubmissions.filter(s => s.comment).length === 0 ? (
            <div className="px-5 py-8 text-center">
              <MessageSquare size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin comentarios registrados</p>
            </div>
          ) : (
            allSubmissions.filter(s => s.comment).map((sub, i) => (
              <div key={i} className="px-5 py-5">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-bold text-gray-900">{sub.label}</p>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">{EVAL_360_ROLE_LABELS[sub.role]}</span>
                </div>
                <p className="text-xs font-bold text-emerald-600 mb-1">Fortalezas:</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{sub.comment}</p>
                <p className="text-xs font-bold text-amber-600 mb-1">Áreas de mejora:</p>
                <p className="text-sm text-gray-500 italic">Sin áreas de mejora indicadas</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── OBSERVATIONS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Observaciones Adicionales</span>
          </div>
          <button
            type="button"
            onClick={() => setEditingObs(!editingObs)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <FileText size={12} />
            Editar
          </button>
        </div>
        <div className="px-5 py-4">
          {editingObs ? (
            <div className="space-y-2">
              <textarea
                value={observations}
                onChange={e => setObservations(e.target.value)}
                rows={3}
                placeholder="Escribe observaciones adicionales aquí..."
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingObs(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="button" onClick={() => setEditingObs(false)} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Guardar</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              {observations || 'Se realizará seguimiento mensual con el líder directo'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── STATUS CONFIG ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pendiente: { label: 'Pendiente', barColor: '#64748b', accentLight: '#f1f5f9', accentDark: '#475569', dot: 'bg-slate-500' },
  en_progreso: { label: 'En progreso', barColor: '#0ea5e9', accentLight: '#e0f2fe', accentDark: '#0369a1', dot: 'bg-sky-500 animate-pulse' },
  completado: { label: 'Completado', barColor: '#10b981', accentLight: '#ecfdf5', accentDark: '#059669', dot: 'bg-emerald-500' },
} as const;

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pendiente: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  en_progreso: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  completado: <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 4.5l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
};

/* ── PdiDetailModal ─────────────────────────────────────────────────────────── */
function PdiDetailModal({
  item, idx, session, employee, eval360Assignments, onUpdate, onRemove, onClose,
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
  const overlayRef = useRef<HTMLDivElement>(null);

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
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3" style={{ background: `linear-gradient(135deg, ${statusCfg.accentLight}, rgba(255,255,255,0.6))` }}>
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full shrink-0 ${statusCfg.dot}`} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusCfg.accentDark }}>Compromiso {idx + 1}</p>
              <p className="text-xs font-bold text-gray-800 truncate max-w-xs">{item.area || 'Sin área'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { onRemove(idx); onClose(); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors" title="Eliminar">
              <Trash2 size={14} />
            </button>
            <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
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
                <button key={key} type="button" onClick={() => onUpdate(idx, 'status', key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200"
                  style={active ? { background: cfg.barColor, color: '#fff', boxShadow: `0 2px 8px ${cfg.barColor}60` } : { background: 'transparent', color: cfg.barColor }}
                >
                  {STATUS_ICONS[key]}
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
              <input type="text" value={item.area} onChange={e => onUpdate(idx, 'area', e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all font-medium text-gray-800"
                placeholder="Ej. Liderazgo, Comunicación…" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Responsable</label>
              <div className="relative">
                <select value={item.responsible} onChange={e => onUpdate(idx, 'responsible', e.target.value)}
                  className="w-full appearance-none text-xs pl-3 pr-7 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-gray-800 cursor-pointer transition-all">
                  <option value={employee?.name ?? ''}>{employee?.name ?? 'Evaluado'} (Evaluado)</option>
                  {eval360Assignments.filter(a => a.sessionId === session.id && a.completedAt && !a.isAnonymous && a.role !== 'self')
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
            <textarea value={item.action} onChange={e => onUpdate(idx, 'action', e.target.value)} rows={3} placeholder="Describe la acción concreta a realizar…"
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all text-gray-800" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">Fecha límite</label>
            <input type="date" value={item.deadline} onChange={e => onUpdate(idx, 'deadline', e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-gray-700 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-2" style={{ color: statusCfg.accentDark }}>
              Avance — <span className="font-black text-lg" style={{ color: statusCfg.barColor }}>{progressVal}%</span>
            </label>
            <input type="range" min={0} max={100} step={5} value={progressVal} onChange={e => onUpdate(idx, 'progress', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: statusCfg.barColor, background: `linear-gradient(to right, ${statusCfg.barColor} 0%, ${statusCfg.barColor} ${progressVal}%, #e5e7eb ${progressVal}%, #e5e7eb 100%)` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/10 bg-white/40 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── NewPdiModal ─────────────────────────────────────────────────────────────── */
function NewPdiModal({
  employee, session, eval360Assignments, improvementAreas, onConfirm, onClose,
}: {
  employee: ReturnType<typeof EMPLOYEES.find>;
  session: Evaluation360Session;
  eval360Assignments: { id: string; sessionId: string; completedAt?: string; isAnonymous: boolean; role: string; evaluatorName: string }[];
  improvementAreas: string[];
  onConfirm: (item: PdiItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PdiItem>({
    id: `pdi-${Date.now()}`, area: improvementAreas[0] ?? '', action: '',
    responsible: employee?.name ?? '', deadline: '', progress: 0, status: 'pendiente',
  });
  const [customArea, setCustomArea] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  const statusCfg = STATUS_CONFIG[draft.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
  const progressVal = Math.min(100, Math.max(0, draft.progress ?? 0));
  const update = (field: keyof PdiItem, value: string | number) => setDraft(prev => ({ ...prev, [field]: value }));

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
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3" style={{ background: `linear-gradient(135deg, ${statusCfg.accentLight}, rgba(255,255,255,0.6))` }}>
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
                <button key={key} type="button" onClick={() => update('status', key)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200"
                  style={active ? { background: cfg.barColor, color: '#fff', boxShadow: `0 2px 8px ${cfg.barColor}60` } : { background: 'transparent', color: cfg.barColor }}
                >
                  {STATUS_ICONS[key]}
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
                        if (e.target.value === '__custom__') { update('area', customArea); }
                        else { setCustomArea(''); update('area', e.target.value); }
                      }}
                      className="w-full appearance-none text-xs pl-3 pr-7 py-2.5 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 bg-amber-50 cursor-pointer transition-all font-semibold text-amber-900"
                    >
                      {improvementAreas.map((a, i) => <option key={i} value={a}>{a}</option>)}
                      <option value="__custom__">Otra área…</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  {!improvementAreas.includes(draft.area) && (
                    <input type="text" value={customArea} onChange={e => { setCustomArea(e.target.value); update('area', e.target.value); }}
                      placeholder="Escribe el área…" autoFocus
                      className="w-full text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white transition-all" />
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
                  {eval360Assignments.filter(a => a.sessionId === session.id && a.completedAt && !a.isAnonymous && a.role !== 'self')
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
            <textarea value={draft.action} onChange={e => update('action', e.target.value)} rows={3} placeholder="Describe la acción concreta…"
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
            <input type="range" min={0} max={100} step={5} value={progressVal} onChange={e => update('progress', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: statusCfg.barColor, background: `linear-gradient(to right, ${statusCfg.barColor} 0%, ${statusCfg.barColor} ${progressVal}%, #e5e7eb ${progressVal}%, #e5e7eb 100%)` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/10 bg-white/40 flex justify-between items-center gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={() => onConfirm({ ...draft, id: `pdi-${Date.now()}` })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors">
            <Plus size={13} />
            Agregar compromiso
          </button>
        </div>
      </div>
    </div>
  );
}
