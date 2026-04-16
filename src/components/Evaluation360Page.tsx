import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Eye, Clock, Search, ChevronRight, Users, UserPlus,
  CheckCircle2, X, AlertCircle, UserCheck, Briefcase, Equal, Globe, User,
  TrendingUp, Award, BarChart2, ChevronDown, ChevronUp
} from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { useEvaluationStore } from '../context/EvaluationContext';
import type { Eval360Role } from '../types/evaluation';
import type { Employee } from '../types';
import Evaluation360Results from './Evaluation360Results';
import PendingEvaluations360 from './PendingEvaluations360';
import Assign360Modal from './Assign360Modal';

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

type DetailTab = 'resumen' | 'asignar' | 'seguimiento' | 'resultados';

function EmployeeDetailPanel({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const [activeTab, setActiveTab] = useState<DetailTab>('resumen');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employee.id);
  const completed = assignments.filter(a => a.completedAt).length;
  const pending = assignments.filter(a => !a.completedAt).length;

  const TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resumen', label: 'Resumen', icon: <BarChart3 size={13} /> },
    { id: 'asignar', label: 'Asignar', icon: <UserPlus size={13} /> },
    { id: 'seguimiento', label: 'Seguimiento', icon: <Clock size={13} /> },
    { id: 'resultados', label: 'Resultados', icon: <Eye size={13} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-100 shrink-0">
        <div className="flex items-start justify-between mb-3">
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
          <>
            <ResumenTab employee={employee} />
            <button
              type="button"
              onClick={() => setActiveTab('asignar')}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <UserPlus size={15} />
              Asignar evaluadores
            </button>
          </>
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

function GlobalResults360() {
  const { threeSixty, eval360Assignments } = useEvaluationStore();
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'completion'>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return EMPLOYEES.map(emp => {
      const data = threeSixty[emp.id];
      const assignments = eval360Assignments.filter(a => a.targetEmployeeId === emp.id);
      const completed = assignments.filter(a => a.completedAt).length;
      const total = assignments.length;
      const overallScore = computeOverallScore(emp.id, threeSixty);
      const respondents = (data?.self ? 1 : 0) + (data?.peers?.length ?? 0);

      let competencyScores: { name: string; avg: number }[] | null = null;
      if (data) {
        const allSubs: number[][] = [];
        if (data.self) allSubs.push(data.self);
        (data.peers ?? []).forEach(p => { if (p.scores.length > 0) allSubs.push(p.scores); });
        if (allSubs.length > 0) {
          competencyScores = COMPETENCY_NAMES.map((name, idx) => {
            const vals = allSubs.map(s => s[idx] ?? 0).filter(v => v > 0);
            return { name, avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
          });
        }
      }

      return { emp, overallScore, respondents, completed, total, competencyScores };
    });
  }, [threeSixty, eval360Assignments]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'name') diff = a.emp.name.localeCompare(b.emp.name);
      else if (sortBy === 'score') diff = (a.overallScore ?? -1) - (b.overallScore ?? -1);
      else if (sortBy === 'completion') diff = (a.total > 0 ? a.completed / a.total : -1) - (b.total > 0 ? b.completed / b.total : -1);
      return sortDir === 'desc' ? -diff : diff;
    });
    return copy;
  }, [rows, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return <ChevronDown size={12} className="text-gray-300" />;
    return sortDir === 'desc' ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronUp size={12} className="text-gray-600" />;
  };

  const withData = rows.filter(r => r.overallScore !== null).length;
  const avgScore = withData > 0
    ? rows.filter(r => r.overallScore !== null).reduce((s, r) => s + r.overallScore!, 0) / withData
    : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <BarChart3 size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Con resultados</p>
            <p className="text-xl font-black text-gray-900">{withData}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Award size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Promedio general</p>
            <p className={`text-xl font-black ${avgScore ? getScoreColor(avgScore) : 'text-gray-300'}`}>
              {avgScore ? avgScore.toFixed(2) : '—'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <Users size={16} className="text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total colaboradores</p>
            <p className="text-xl font-black text-gray-900">{EMPLOYEES.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Comparativo por colaborador</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left">
                  <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                    Colaborador <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button type="button" onClick={() => toggleSort('score')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                    Puntaje global <SortIcon col="score" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Clasificación</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Respuestas</th>
                <th className="px-4 py-3 text-left">
                  <button type="button" onClick={() => toggleSort('completion')} className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900">
                    Progreso <SortIcon col="completion" />
                  </button>
                </th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(({ emp, overallScore, respondents, completed, total, competencyScores }) => {
                const pct = total > 0 ? (completed / total) * 100 : 0;
                const isExpanded = expandedId === emp.id;
                return (
                  <>
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
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
                      <td className="px-4 py-3">
                        {overallScore !== null ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-black ${getScoreColor(overallScore)}`}>{overallScore.toFixed(2)}</span>
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: `${(overallScore / 5) * 100}%`, backgroundColor: getScoreBar(overallScore) }} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-300 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {overallScore !== null ? (
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${getScoreBg(overallScore)}`}>
                            {getClassificationLabel(overallScore)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-300">Sin datos</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 font-medium">{respondents}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : '#2563eb' }} />
                          </div>
                          <span className="text-[11px] text-gray-500">{completed}/{total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {competencyScores && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && competencyScores && (
                      <tr key={`${emp.id}-expanded`} className="bg-slate-50">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {competencyScores.map((comp, idx) => (
                              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-2.5">
                                <p className="text-[10px] text-gray-500 mb-1 truncate">{comp.name}</p>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: `${(comp.avg / 5) * 100}%`, backgroundColor: getScoreBar(comp.avg) }} />
                                  </div>
                                  <span className={`text-[11px] font-bold shrink-0 ${comp.avg > 0 ? getScoreColor(comp.avg) : 'text-gray-300'}`}>
                                    {comp.avg > 0 ? comp.avg.toFixed(1) : '—'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Eval360AdminView() {
  const { eval360Assignments, threeSixty } = useEvaluationStore();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'colaboradores' | 'resultados'>('colaboradores');

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

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setMainTab('colaboradores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mainTab === 'colaboradores' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={15} />
          Colaboradores
        </button>
        <button
          type="button"
          onClick={() => setMainTab('resultados')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mainTab === 'resultados' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart2 size={15} />
          Resultados globales
        </button>
      </div>

      {mainTab === 'colaboradores' && (
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
            <div className="space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto pr-0.5">
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
                  Haz clic en una ficha para ver el resumen, asignar evaluadores 360, dar seguimiento y ver resultados individuales.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'resultados' && <GlobalResults360 />}
    </div>
  );
}

function Eval360EmployeeView({ employeeId }: { employeeId: string }) {
  const { threeSixty, eval360Assignments, syncCompletedEvaluations } = useEvaluationStore();
  const employee = EMPLOYEES.find(e => e.id === employeeId);

  useEffect(() => {
    syncCompletedEvaluations();
  }, [syncCompletedEvaluations]);

  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<'resumen' | 'resultados' | 'seguimiento'>('resumen');

  const assignments = eval360Assignments.filter(a => a.targetEmployeeId === employeeId);
  const data = threeSixty[employeeId];
  const hasSelf = !!data?.self;
  const peerCount = (data?.peers ?? []).length;

  const TABS = [
    { id: 'resumen' as const, label: 'Resumen', icon: <BarChart3 size={16} /> },
    { id: 'resultados' as const, label: 'Mis Resultados', icon: <Eye size={16} /> },
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
          {activeTab === 'resumen' && <ResumenTab employee={employee} />}
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
