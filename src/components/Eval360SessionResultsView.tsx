import { useMemo, useState } from 'react';
import {
  ArrowLeft, Award, AlertCircle, TrendingUp, Plus, Trash2, BarChart2,
  User, Briefcase, Equal, UserCheck, Globe, Users, CalendarDays,
  CheckCircle2, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES } from '../data/evaluation360Template';
import type { Eval360Role, Evaluation360Session } from '../types/evaluation';
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

type PdiStatus = 'pendiente' | 'en_progreso' | 'completado';

interface PdiItem {
  area: string;
  action: string;
  responsible: string;
  deadline: string;
  progress: number;
  status: PdiStatus;
}

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
}

export default function Eval360SessionResultsView({ session, onBack }: Props) {
  const { threeSixty, eval360Assignments } = useEvaluationStore();
  const [pdiItems, setPdiItems] = useState<PdiItem[]>([]);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const employee = EMPLOYEES.find(e => e.id === session.targetEmployeeId);
  const assignments = eval360Assignments.filter(a => a.sessionId === session.id);
  const completedAssignments = assignments.filter(a => a.completedAt);
  const template = EVALUATION_360_TEMPLATES.find(t => t.id === session.templateId) ?? EVALUATION_360_TEMPLATES[0];
  const data = threeSixty[session.targetEmployeeId];

  /* Build all submissions */
  const allSubmissions = useMemo(() => {
    if (!data) return [];
    const subs: { label: string; role: Eval360Role; scores: number[] }[] = [];
    if (data.self) subs.push({ label: employee?.name ?? 'Auto', role: 'self', scores: data.self });
    data.peers.forEach(p => {
      if (p.scores.length > 0) {
        const a = assignments.find(x => x.evaluatorName.trim().toLowerCase() === p.evaluatorName.trim().toLowerCase() && x.role !== 'self');
        subs.push({ label: p.evaluatorName || 'Evaluador', role: (a?.role ?? 'peer') as Eval360Role, scores: p.scores });
      }
    });
    return subs;
  }, [data, assignments, employee]);

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

  const addPdi = () => setPdiItems(p => [...p, { area: '', action: '', responsible: employee?.name ?? '', deadline: '', progress: 0, status: 'pendiente' }]);
  const updatePdi = (idx: number, field: keyof PdiItem, value: string | number) => {
    setPdiItems(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const removePdi = (idx: number) => setPdiItems(p => p.filter((_, i) => i !== idx));

  if (!employee) return null;

  const conclusionDate = completedAssignments.length > 0
    ? completedAssignments.reduce((latest, a) => a.completedAt! > latest ? a.completedAt! : latest, completedAssignments[0].completedAt!)
    : null;

  const noData = !data || (!data.self && data.peers.length === 0);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={15} />
        Volver a la lista de evaluaciones
      </button>

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

          {/* Scores by evaluator */}
          {allSubmissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Desglose por evaluador</h4>
              </div>
              <div className="divide-y divide-gray-50">
                {allSubmissions.map((sub, i) => {
                  const subAvg = sub.scores.length > 0 ? sub.scores.reduce((a, b) => a + b, 0) / sub.scores.length : 0;
                  const cls = getClassification(subAvg);
                  const isEx = expandedSource === `${i}`;
                  return (
                    <div key={i}>
                      <div className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: ROLE_COLORS[sub.role] }}>
                          {sub.label.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{sub.label}</p>
                          <div className="flex items-center gap-1">
                            <span style={{ color: ROLE_COLORS[sub.role] }}>{ROLE_ICONS[sub.role]}</span>
                            <span className="text-[10px] text-gray-400">{EVAL_360_ROLE_LABELS[sub.role]}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-black ${cls.text}`}>{subAvg.toFixed(2)}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls.badge}`}>{cls.label}</span>
                          <button
                            type="button"
                            onClick={() => setExpandedSource(isEx ? null : `${i}`)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            {isEx ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </div>
                      {isEx && (
                        <div className="px-5 pb-4 bg-gray-50 border-t border-gray-50">
                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {template.items.map((item, idx) => {
                              const score = sub.scores[idx] ?? 0;
                              const c = getClassification(score);
                              return (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-2.5 flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-300 w-4 shrink-0">{idx + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-gray-700 truncate">{COMPETENCY_NAMES[idx]}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                                        <div className="h-1 rounded-full" style={{ width: `${(score / 5) * 100}%`, backgroundColor: c.bar }} />
                                      </div>
                                      <span className={`text-[10px] font-black shrink-0 ${c.text}`}>{score}</span>
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
        </>
      )}

      {/* PDI */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            <h4 className="text-sm font-bold text-gray-900">Compromisos y Plan de Acción (PDI)</h4>
          </div>
          <button
            type="button"
            onClick={addPdi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>

        {pdiItems.length === 0 ? (
          <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs">
            Haz clic en "Agregar" para crear el plan de acción del colaborador
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Área a mejorar</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Cómo se llevará a cabo</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Responsable</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Plazo</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Avance %</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Estado</th>
                  <th className="px-3 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pdiItems.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.area}
                        onChange={e => updatePdi(idx, 'area', e.target.value)}
                        placeholder="Ej. Liderazgo"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[110px]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.action}
                        onChange={e => updatePdi(idx, 'action', e.target.value)}
                        placeholder="Acción específica"
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[130px]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.responsible}
                        onChange={e => updatePdi(idx, 'responsible', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[110px]"
                      >
                        <option value={employee?.name ?? ''}>{employee?.name ?? 'Evaluado'} (Evaluado)</option>
                        {eval360Assignments
                          .filter(a => a.sessionId === session.id && a.completedAt && !a.isAnonymous && a.role !== 'self')
                          .map(a => (
                            <option key={a.id} value={a.evaluatorName}>{a.evaluatorName} ({EVAL_360_ROLE_LABELS[a.role]})</option>
                          ))
                        }
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={item.deadline}
                        onChange={e => updatePdi(idx, 'deadline', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.progress}
                          onChange={e => updatePdi(idx, 'progress', Number(e.target.value))}
                          className="w-14 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-gray-400">%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={item.status}
                        onChange={e => updatePdi(idx, 'status', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En progreso</option>
                        <option value="completado">Completado</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removePdi(idx)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
