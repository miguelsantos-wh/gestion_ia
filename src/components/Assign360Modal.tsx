import { useState, useMemo } from 'react';
import {
  X, Users, User, Briefcase, Equal, UserCheck, Globe, Copy, Check,
  ChevronRight, Calendar, FileText, AlertTriangle, Info, Plus, Trash2,
  ClipboardList, ChevronLeft, CheckCircle2
} from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES, DEFAULT_360_TEMPLATE_ID } from '../data/evaluation360Template';
import type { Eval360Role, Eval360Period } from '../types/evaluation';
import { EVAL_360_PERIODS } from '../types/evaluation';
import type { Employee } from '../types';

interface RoleConfig {
  role: Eval360Role;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  allowAnonymous: boolean;
}

const ROLE_CONFIGS: RoleConfig[] = [
  { role: 'self', label: 'Autoevaluación', shortLabel: 'Auto', description: 'El propio colaborador se evalúa a sí mismo.', icon: <User size={15} />, color: '#2563eb', allowAnonymous: false },
  { role: 'leader', label: 'Evaluación por Líder', shortLabel: 'Líder', description: 'Su líder directo lo evalúa.', icon: <Briefcase size={15} />, color: '#0d9488', allowAnonymous: false },
  { role: 'peer', label: 'Evaluación por Par', shortLabel: 'Par', description: 'Un compañero con el mismo puesto o nivel.', icon: <Equal size={15} />, color: '#7c3aed', allowAnonymous: true },
  { role: 'collaborator', label: 'Evaluación por Colaborador', shortLabel: 'Colaborador', description: 'Alguien que depende del evaluado.', icon: <UserCheck size={15} />, color: '#d97706', allowAnonymous: true },
  { role: 'client', label: 'Evaluación por Cliente', shortLabel: 'Cliente', description: 'Un cliente interno o externo.', icon: <Globe size={15} />, color: '#dc2626', allowAnonymous: true },
  { role: 'anonymous', label: 'Evaluación Anónima', shortLabel: 'Anónimo', description: 'Link anónimo para cualquier evaluador.', icon: <Users size={15} />, color: '#64748b', allowAnonymous: true },
];

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

/** Infer the leader for an employee based on department: find a Gerente/Director in same dept */
function inferLeader(targetEmployee: Employee): Employee | null {
  const leaderTitles = ['Gerente', 'Director', 'Directora', 'Jefe', 'Coordinador'];
  return EMPLOYEES.find(e =>
    e.id !== targetEmployee.id &&
    e.department === targetEmployee.department &&
    leaderTitles.some(t => e.position.includes(t))
  ) ?? null;
}

/** Pre-suggested evaluators: leader from same dept, peers from same dept */
function getSuggestedEvaluators(target: Employee) {
  const leader = inferLeader(target);
  const peers = EMPLOYEES.filter(
    e => e.id !== target.id && e.department === target.department && e.id !== leader?.id
  ).slice(0, 2);
  return { leader, peers };
}

interface PendingEvaluator {
  role: Eval360Role;
  evaluatorName: string;
  evaluatorEmployeeId?: string;
  isAnonymous: boolean;
}

interface Assign360ModalProps {
  targetEmployee: Employee;
  onClose: () => void;
}

type Step = 'config' | 'evaluators' | 'done';

export default function Assign360Modal({ targetEmployee, onClose }: Assign360ModalProps) {
  const { createEval360Session, saveEval360Assignment, eval360Assignments, hasPeriodConflict } = useEvaluationStore();

  /* ── Step state ── */
  const [step, setStep] = useState<Step>('config');

  /* ── Step 1: session config ── */
  const [sessionName, setSessionName] = useState(`Evaluación 360 – ${targetEmployee.name}`);
  const [sessionDescription, setSessionDescription] = useState('');
  const [period, setPeriod] = useState<Eval360Period>('Q2-2026');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [templateId, setTemplateId] = useState(DEFAULT_360_TEMPLATE_ID);
  const [sessionId, setSessionId] = useState<string | null>(null);

  /* ── Step 2: evaluators ── */
  const [pendingEvaluators, setPendingEvaluators] = useState<PendingEvaluator[]>([]);
  const [selectedRole, setSelectedRole] = useState<Eval360Role>('leader');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorEmployeeId, setEvaluatorEmployeeId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const suggestions = useMemo(() => getSuggestedEvaluators(targetEmployee), [targetEmployee]);

  const periodConflict = useMemo(
    () => hasPeriodConflict(targetEmployee.id, period),
    [hasPeriodConflict, targetEmployee.id, period]
  );

  const roleConfig = ROLE_CONFIGS.find(r => r.role === selectedRole)!;
  const otherEmployees = EMPLOYEES.filter(e => e.id !== targetEmployee.id);

  /* ── Step 1 submit ── */
  const handleCreateSession = () => {
    if (!sessionName.trim() || !dueDate || periodConflict) return;
    const id = createEval360Session({
      targetEmployeeId: targetEmployee.id,
      name: sessionName.trim(),
      description: sessionDescription.trim(),
      period,
      dueDate,
      templateId,
    });
    if (!id) return;
    setSessionId(id);

    // Auto-preload leader if found
    const auto: PendingEvaluator[] = [];
    if (suggestions.leader) {
      auto.push({
        role: 'leader',
        evaluatorName: suggestions.leader.name,
        evaluatorEmployeeId: suggestions.leader.id,
        isAnonymous: false,
      });
    }
    // Auto-preload self
    auto.push({
      role: 'self',
      evaluatorName: targetEmployee.name,
      evaluatorEmployeeId: targetEmployee.id,
      isAnonymous: false,
    });
    setPendingEvaluators(auto);
    setStep('evaluators');
  };

  /* ── Step 2: add evaluator to pending list ── */
  const handleAddEvaluator = () => {
    const name = isAnonymous
      ? 'Anónimo'
      : selectedRole === 'self'
        ? targetEmployee.name
        : evaluatorName.trim() || (evaluatorEmployeeId ? EMPLOYEES.find(e => e.id === evaluatorEmployeeId)?.name ?? '' : '');

    if (!isAnonymous && selectedRole !== 'self' && selectedRole !== 'anonymous' && !name) return;

    const finalName = selectedRole === 'anonymous' ? 'Anónimo' : name;
    const finalAnon = isAnonymous || selectedRole === 'anonymous';

    setPendingEvaluators(prev => [
      ...prev,
      {
        role: selectedRole,
        evaluatorName: finalName,
        evaluatorEmployeeId: evaluatorEmployeeId || undefined,
        isAnonymous: finalAnon,
      },
    ]);
    setEvaluatorName('');
    setEvaluatorEmployeeId('');
    setIsAnonymous(false);
  };

  const handleRemovePending = (idx: number) => {
    setPendingEvaluators(prev => prev.filter((_, i) => i !== idx));
  };

  /* ── Step 2 submit: save all assignments ── */
  const handleSaveAll = () => {
    if (!sessionId || pendingEvaluators.length === 0) return;

    const links: Record<string, string> = {};
    for (const ev of pendingEvaluators) {
      const id = saveEval360Assignment({
        sessionId,
        targetEmployeeId: targetEmployee.id,
        role: ev.role,
        evaluatorName: ev.evaluatorName,
        evaluatorEmployeeId: ev.evaluatorEmployeeId,
        isAnonymous: ev.isAnonymous,
      });
      const link = buildHashLink('/eval-360', {
        employeeId: targetEmployee.id,
        mode: ev.role === 'self' ? 'self' : 'peer',
        assignmentId: id,
      });
      links[id] = link;
    }
    setGeneratedLinks(links);
    setStep('done');
  };

  const handleCopy = (link: string, id: string) => {
    void navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const allLinks = Object.values(generatedLinks).join('\n');
    void navigator.clipboard.writeText(allLinks);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ── Step indicator ── */
  const STEPS = [
    { key: 'config', label: 'Configurar', icon: <ClipboardList size={14} /> },
    { key: 'evaluators', label: 'Evaluadores', icon: <Users size={14} /> },
    { key: 'done', label: 'Listo', icon: <CheckCircle2 size={14} /> },
  ];

  const stepIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Asignar Evaluación 360</h2>
            <p className="text-xs text-gray-500 mt-0.5">Para: <span className="font-semibold text-gray-700">{targetEmployee.name}</span></p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-1 transition-all ${
                  i < stepIdx ? 'text-emerald-700 bg-emerald-50'
                  : i === stepIdx ? 'text-gray-900 bg-white shadow-sm border border-gray-200'
                  : 'text-gray-400 bg-transparent'
                }`}>
                  {i < stepIdx ? <CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> : s.icon}
                  <span>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ═══ STEP 1: Config ═══ */}
          {step === 'config' && (
            <div className="space-y-4">
              {periodConflict && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Ya existe una evaluación para <strong>{targetEmployee.name}</strong> en el periodo seleccionado. Solo se permite una evaluación 360 por periodo.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nombre de la evaluación <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={e => setSessionName(e.target.value)}
                    placeholder="Ej. Evaluación 360 – Q2 2026"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción</label>
                  <textarea
                    value={sessionDescription}
                    onChange={e => setSessionDescription(e.target.value)}
                    placeholder="Contexto, objetivos o instrucciones adicionales para los evaluadores..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Calendar size={11} /> Periodo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={period}
                        onChange={e => setPeriod(e.target.value as Eval360Period)}
                        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all ${
                          periodConflict ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        {EVAL_360_PERIODS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                      <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Calendar size={11} /> Fecha límite <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                    <FileText size={11} /> Plantilla de preguntas
                  </label>
                  <div className="relative">
                    <select
                      value={templateId}
                      onChange={e => setTemplateId(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    >
                      {EVALUATION_360_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                  </div>
                  {templateId && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                      <Info size={12} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-blue-600 leading-relaxed">
                        {EVALUATION_360_TEMPLATES.find(t => t.id === templateId)?.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {suggestions.leader && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50 border border-teal-100">
                  <Info size={13} className="text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-teal-800 mb-0.5">Líder detectado</p>
                    <p className="text-[11px] text-teal-600 leading-relaxed">
                      Se precargará <strong>{suggestions.leader.name}</strong> ({suggestions.leader.position}) como evaluador líder.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateSession}
                disabled={!sessionName.trim() || !dueDate || periodConflict}
                className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar — Asignar evaluadores
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* ═══ STEP 2: Evaluators ═══ */}
          {step === 'evaluators' && (
            <div className="space-y-4">
              {/* Pending list */}
              {pendingEvaluators.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Evaluadores a asignar</p>
                  {pendingEvaluators.map((ev, idx) => {
                    const rc = ROLE_CONFIGS.find(r => r.role === ev.role)!;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${rc.color}15` }}>
                          <span style={{ color: rc.color }}>{rc.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{ev.isAnonymous ? 'Anónimo' : ev.evaluatorName}</p>
                          <p className="text-[10px] text-gray-400">{rc.label}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePending(idx)}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Role selector */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Agregar evaluador</p>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {ROLE_CONFIGS.map((rc) => {
                    const count = pendingEvaluators.filter(e => e.role === rc.role).length;
                    return (
                      <button
                        key={rc.role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(rc.role);
                          setEvaluatorName('');
                          setEvaluatorEmployeeId('');
                          setIsAnonymous(false);
                        }}
                        className={`flex flex-col items-start gap-1 p-2.5 rounded-xl border-2 transition-all text-left ${
                          selectedRole === rc.role ? 'border-current shadow-sm' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        style={selectedRole === rc.role ? { borderColor: rc.color, backgroundColor: `${rc.color}0d` } : {}}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span style={{ color: rc.color }}>{rc.icon}</span>
                          {count > 0 && (
                            <span className="text-[10px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: `${rc.color}18`, color: rc.color }}>
                              {count}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-800 leading-tight">{rc.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 mb-3">
                  <p className="text-[11px] text-gray-500">{roleConfig.description}</p>
                </div>

                {/* Role-specific inputs */}
                {selectedRole !== 'self' && selectedRole !== 'anonymous' && (
                  <div className="space-y-2.5">
                    {roleConfig.allowAnonymous && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={e => { setIsAnonymous(e.target.checked); setEvaluatorName(''); setEvaluatorEmployeeId(''); }}
                          className="w-4 h-4 rounded accent-slate-700"
                        />
                        <span className="text-sm text-gray-700">Generar enlace anónimo</span>
                      </label>
                    )}

                    {!isAnonymous && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Seleccionar de colaboradores</label>
                          <select
                            value={evaluatorEmployeeId}
                            onChange={e => { setEvaluatorEmployeeId(e.target.value); if (e.target.value) setEvaluatorName(''); }}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          >
                            <option value="">— Seleccionar colaborador —</option>
                            {otherEmployees.map(e => (
                              <option key={e.id} value={e.id}>{e.name} · {e.position}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-xs text-gray-400">o externo</span>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <input
                          type="text"
                          placeholder="Nombre del evaluador externo"
                          value={evaluatorName}
                          onChange={e => { setEvaluatorName(e.target.value); if (e.target.value) setEvaluatorEmployeeId(''); }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </>
                    )}
                  </div>
                )}

                {selectedRole === 'self' && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5">
                    <p className="text-xs text-blue-700">Se asignará autoevaluación a <strong>{targetEmployee.name}</strong>.</p>
                  </div>
                )}

                {selectedRole === 'anonymous' && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                    <p className="text-xs text-gray-600">Se generará un enlace anónimo compartible.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddEvaluator}
                  disabled={
                    !isAnonymous &&
                    selectedRole !== 'self' &&
                    selectedRole !== 'anonymous' &&
                    !evaluatorName.trim() &&
                    !evaluatorEmployeeId
                  }
                  className="mt-3 w-full py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 font-semibold flex items-center justify-center gap-1.5 hover:border-gray-300 hover:text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={15} />
                  Agregar evaluador
                </button>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep('config')}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={14} />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={pendingEvaluators.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={15} />
                  Guardar y generar enlaces ({pendingEvaluators.length})
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Done ═══ */}
          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Evaluación creada exitosamente</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{Object.keys(generatedLinks).length} enlace{Object.keys(generatedLinks).length !== 1 ? 's' : ''} generado{Object.keys(generatedLinks).length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enlaces generados</p>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    {copiedId === 'all' ? <><Check size={12} className="text-emerald-600" /> Copiado</> : <><Copy size={12} /> Copiar todos</>}
                  </button>
                </div>

                {eval360Assignments
                  .filter(a => generatedLinks[a.id])
                  .map(a => {
                    const rc = ROLE_CONFIGS.find(r => r.role === a.role)!;
                    const link = generatedLinks[a.id];
                    return (
                      <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span style={{ color: rc.color }}>{rc.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {a.isAnonymous ? 'Anónimo' : a.evaluatorName}
                            </p>
                            <p className="text-[10px] text-gray-400">{rc.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-[9px] text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100 truncate">
                            {link}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(link, a.id)}
                            className="shrink-0 p-1.5 rounded-lg transition-colors"
                            style={{ backgroundColor: copiedId === a.id ? '#d1fae5' : '#f1f5f9', color: copiedId === a.id ? '#059669' : '#64748b' }}
                          >
                            {copiedId === a.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
