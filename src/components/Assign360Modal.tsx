import { useState, useMemo } from 'react';
import {
  X, Users, User, Briefcase, Equal, UserCheck, Globe, Copy, Check,
  ChevronRight, Calendar, FileText, AlertTriangle, Info, Plus, Trash2,
  ClipboardList, ChevronLeft, CheckCircle2, HelpCircle, Search
} from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES, DEFAULT_360_TEMPLATE_ID } from '../data/evaluation360Template';
import type { Eval360Role, Eval360Period } from '../types/evaluation';
import { EVAL_360_PERIODS } from '../types/evaluation';
import type { Employee } from '../types';

/* ─── Role configs ─────────────────────────────────────────────────────────── */

interface RoleConfig {
  role: Eval360Role;
  label: string;
  shortLabel: string;
  description: string;
  tooltip: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  borderColor: string;
  allowExternal: boolean;
}

const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'leader',
    label: 'Gerente / Supervisor',
    shortLabel: 'Líder',
    description: 'Su líder directo o supervisor inmediato.',
    tooltip: 'La persona que supervisa directamente al evaluado.',
    icon: <Briefcase size={16} />,
    color: '#0d9488',
    bgLight: '#f0fdfa',
    borderColor: '#99f6e4',
    allowExternal: false,
  },
  {
    role: 'peer',
    label: 'Compañero / Igual',
    shortLabel: 'Par',
    description: 'Alguien del mismo puesto o mismo nivel.',
    tooltip: 'Alguien del mismo puesto o mismo nivel jerárquico que el evaluado.',
    icon: <Equal size={16} />,
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    allowExternal: false,
  },
  {
    role: 'collaborator',
    label: 'Su Colaborador',
    shortLabel: 'Colaborador',
    description: 'Alguien que depende directamente del evaluado.',
    tooltip: 'Persona que reporta o depende directamente del evaluado.',
    icon: <UserCheck size={16} />,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    allowExternal: false,
  },
  {
    role: 'client',
    label: 'Su Cliente',
    shortLabel: 'Cliente',
    description: 'Alguien externo; si no tiene clientes, otro compañero.',
    tooltip: 'Un cliente externo con quien tenga trato. Si no aplica, puede ser otro compañero de la empresa.',
    icon: <Globe size={16} />,
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fecaca',
    allowExternal: true,
  },
  {
    role: 'self',
    label: 'Autoevaluación',
    shortLabel: 'Auto',
    description: 'El propio colaborador se evalúa a sí mismo.',
    tooltip: 'El evaluado responde sobre sí mismo.',
    icon: <User size={16} />,
    color: '#7c3aed',
    bgLight: '#faf5ff',
    borderColor: '#ddd6fe',
    allowExternal: false,
  },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const LEADER_TITLES = ['Gerente', 'Director', 'Directora', 'Jefe', 'Coordinador'];

function isLeader(e: Employee) {
  return LEADER_TITLES.some(t => e.position.includes(t));
}

function inferLeader(target: Employee): Employee | null {
  // First: someone with a leader title in same department
  const deptLeader = EMPLOYEES.find(
    e => e.id !== target.id && e.department === target.department && isLeader(e)
  );
  if (deptLeader) return deptLeader;
  // Fallback: any leader in any department
  return EMPLOYEES.find(e => e.id !== target.id && isLeader(e)) ?? null;
}

function inferPeer(target: Employee, exclude: string[]): Employee | null {
  // Same dept, not a leader, not already excluded
  return EMPLOYEES.find(
    e => e.id !== target.id && !exclude.includes(e.id) && e.department === target.department && !isLeader(e)
  ) ?? null;
}

function inferCollaborator(target: Employee, exclude: string[]): Employee | null {
  // Someone in same dept who is NOT a leader and is "below" (lower seniority/non-manager) – just another non-leader colleague
  return EMPLOYEES.find(
    e => e.id !== target.id && !exclude.includes(e.id) && e.department === target.department && !isLeader(e)
  ) ?? null;
}

export interface SlotEvaluator {
  roleIndex: number; // 0-4 maps to ROLE_CONFIGS
  employeeId: string | null;   // internal employee, null if external
  externalName: string;         // used only when no internal employee selected
  isExternal: boolean;
}

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

interface Assign360ModalProps {
  targetEmployee: Employee;
  onClose: () => void;
}

type Step = 'config' | 'evaluators' | 'done';

/* ─── Tooltip component ─────────────────────────────────────────────────────── */
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="text-gray-300 hover:text-gray-500 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white text-[11px] leading-relaxed px-3 py-2 rounded-lg shadow-xl pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

/* ─── Employee picker ───────────────────────────────────────────────────────── */
function EmployeePicker({
  value,
  exclude,
  onChange,
  placeholder,
}: {
  value: string;
  exclude: string[];
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const options = EMPLOYEES.filter(
    e => !exclude.includes(e.id) && (
      query === '' ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.position.toLowerCase().includes(query.toLowerCase())
    )
  );

  const selected = EMPLOYEES.find(e => e.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
      >
        {selected ? (
          <>
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
              {selected.avatar}
            </div>
            <span className="flex-1 text-left text-gray-800 font-medium text-xs truncate">{selected.name}</span>
            <span className="text-[10px] text-gray-400 shrink-0 truncate max-w-[100px]">{selected.position}</span>
          </>
        ) : (
          <span className="text-gray-400 text-xs flex-1 text-left">{placeholder}</span>
        )}
        <ChevronRight size={12} className="text-gray-300 shrink-0 rotate-90" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
              <Search size={12} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar colaborador…"
                className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-xs text-gray-400 border-b border-gray-50"
              >
                <X size={11} /> Quitar selección
              </button>
            )}
            {options.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">Sin resultados</p>
            ) : (
              options.map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => { onChange(e.id); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${value === e.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {e.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{e.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{e.position} · {e.department}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Slot card ──────────────────────────────────────────────────────────────── */
function SlotCard({
  roleIndex,
  slot,
  targetEmployee,
  usedIds,
  onChange,
}: {
  roleIndex: number;
  slot: SlotEvaluator;
  targetEmployee: Employee;
  usedIds: string[];
  onChange: (s: SlotEvaluator) => void;
}) {
  const rc = ROLE_CONFIGS[roleIndex];
  const isSelf = rc.role === 'self';
  const resolvedEmployee = slot.employeeId ? EMPLOYEES.find(e => e.id === slot.employeeId) : null;
  const isFilled = isSelf || !!slot.employeeId || (slot.isExternal && slot.externalName.trim() !== '');

  return (
    <div
      className="rounded-2xl border-2 transition-all overflow-hidden"
      style={{
        borderColor: isFilled ? rc.borderColor : '#e5e7eb',
        background: isFilled ? rc.bgLight : '#fafafa',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${isFilled ? rc.borderColor : '#f3f4f6'}` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white"
          style={{ background: isFilled ? rc.color : '#d1d5db' }}
        >
          {rc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-800">{rc.label}</span>
            <Tooltip text={rc.tooltip} />
          </div>
          <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{rc.description}</p>
        </div>
        {/* Filled indicator */}
        <div className="shrink-0">
          {isFilled ? (
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: rc.color }}>
              <Check size={10} className="text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {isSelf ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
              {targetEmployee.avatar}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">{targetEmployee.name}</p>
              <p className="text-[10px] text-gray-400">{targetEmployee.position}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Toggle external */}
            {rc.allowExternal && (
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => onChange({ ...slot, isExternal: false, externalName: '' })}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${!slot.isExternal ? 'text-white' : 'text-gray-500 bg-gray-100'}`}
                  style={!slot.isExternal ? { background: rc.color } : {}}
                >
                  Colaborador interno
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...slot, isExternal: true, employeeId: null })}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all ${slot.isExternal ? 'text-white' : 'text-gray-500 bg-gray-100'}`}
                  style={slot.isExternal ? { background: rc.color } : {}}
                >
                  Externo / nombre
                </button>
              </div>
            )}

            {/* Picker or name input */}
            {slot.isExternal ? (
              <input
                type="text"
                value={slot.externalName}
                onChange={e => onChange({ ...slot, externalName: e.target.value })}
                placeholder="Nombre del cliente o evaluador externo"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-blue-400 bg-white text-gray-800 placeholder:text-gray-400 transition-all"
                style={{ '--tw-ring-color': `${rc.color}40` } as React.CSSProperties}
              />
            ) : (
              <EmployeePicker
                value={slot.employeeId ?? ''}
                exclude={usedIds}
                onChange={id => onChange({ ...slot, employeeId: id || null })}
                placeholder={`Seleccionar ${rc.shortLabel.toLowerCase()}…`}
              />
            )}

            {/* Resolved employee detail */}
            {!slot.isExternal && resolvedEmployee && (
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pl-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: rc.color }} />
                {resolvedEmployee.department} · {resolvedEmployee.position}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */

export default function Assign360Modal({ targetEmployee, onClose }: Assign360ModalProps) {
  const { createEval360Session, saveEval360Assignment, eval360Assignments, hasPeriodConflict } = useEvaluationStore();

  const [step, setStep] = useState<Step>('config');

  /* Step 1 */
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

  /* Step 2: 5 fixed slots */
  const initialSlots = useMemo<SlotEvaluator[]>(() => {
    const leader = inferLeader(targetEmployee);
    const usedAfterLeader = [targetEmployee.id, ...(leader ? [leader.id] : [])];
    const peer = inferPeer(targetEmployee, usedAfterLeader);
    const usedAfterPeer = [...usedAfterLeader, ...(peer ? [peer.id] : [])];
    const collaborator = inferCollaborator(targetEmployee, usedAfterPeer);

    return [
      { roleIndex: 0, employeeId: leader?.id ?? null, externalName: '', isExternal: false },
      { roleIndex: 1, employeeId: peer?.id ?? null, externalName: '', isExternal: false },
      { roleIndex: 2, employeeId: collaborator?.id ?? null, externalName: '', isExternal: false },
      { roleIndex: 3, employeeId: null, externalName: '', isExternal: false },
      { roleIndex: 4, employeeId: targetEmployee.id, externalName: '', isExternal: false }, // self – always target
    ];
  }, [targetEmployee]);

  const [slots, setSlots] = useState<SlotEvaluator[]>(initialSlots);

  /* Done step */
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const periodConflict = useMemo(
    () => hasPeriodConflict(targetEmployee.id, period),
    [hasPeriodConflict, targetEmployee.id, period]
  );

  /* IDs already used (to exclude from pickers) */
  const usedIds = useMemo(() => {
    const ids: string[] = [targetEmployee.id];
    slots.forEach(s => { if (s.employeeId) ids.push(s.employeeId); });
    return ids;
  }, [slots, targetEmployee.id]);

  const updateSlot = (idx: number, updated: SlotEvaluator) => {
    setSlots(prev => prev.map((s, i) => i === idx ? updated : s));
  };

  /* Count filled */
  const filledCount = slots.filter((s, i) => {
    const rc = ROLE_CONFIGS[i];
    if (rc.role === 'self') return true;
    return !!s.employeeId || (s.isExternal && s.externalName.trim() !== '');
  }).length;

  /* Step 1 submit */
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
    setStep('evaluators');
  };

  /* Step 2 submit */
  const handleSaveAll = () => {
    if (!sessionId) return;
    const links: Record<string, string> = {};

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const rc = ROLE_CONFIGS[i];
      const isSelf = rc.role === 'self';

      const name = isSelf
        ? targetEmployee.name
        : slot.isExternal
          ? slot.externalName.trim()
          : (slot.employeeId ? EMPLOYEES.find(e => e.id === slot.employeeId)?.name ?? '' : '');

      if (!isSelf && !name && !slot.employeeId) continue; // skip empty slots

      const id = saveEval360Assignment({
        sessionId,
        targetEmployeeId: targetEmployee.id,
        role: rc.role,
        evaluatorName: name,
        evaluatorEmployeeId: isSelf ? targetEmployee.id : (slot.employeeId ?? undefined),
        isAnonymous: false,
      });

      links[id] = buildHashLink('/eval-360', {
        employeeId: targetEmployee.id,
        mode: rc.role === 'self' ? 'self' : 'peer',
        assignmentId: id,
        role: rc.role,
        ...(sessionName ? { sessionName } : {}),
        ...(sessionDescription ? { sessionDescription } : {}),
      });
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
    void navigator.clipboard.writeText(Object.values(generatedLinks).join('\n'));
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const STEPS = [
    { key: 'config', label: 'Configurar', icon: <ClipboardList size={14} /> },
    { key: 'evaluators', label: 'Evaluadores', icon: <Users size={14} /> },
    { key: 'done', label: 'Listo', icon: <CheckCircle2 size={14} /> },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">

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

          {/* ═══ STEP 2: Evaluators (5 fixed slots) ═══ */}
          {step === 'evaluators' && (
            <div className="space-y-4">
              {/* Progress header */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-700">5 roles de evaluación</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Preselección automática según equipo</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {slots.map((s, i) => {
                      const rc = ROLE_CONFIGS[i];
                      const filled = rc.role === 'self' || !!s.employeeId || (s.isExternal && s.externalName.trim() !== '');
                      return (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full transition-all"
                          style={{ background: filled ? rc.color : '#e5e7eb' }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-black text-slate-700">{filledCount}/5</span>
                </div>
              </div>

              {/* 5 slots */}
              <div className="space-y-3">
                {slots.map((slot, i) => (
                  <SlotCard
                    key={i}
                    roleIndex={i}
                    slot={slot}
                    targetEmployee={targetEmployee}
                    usedIds={usedIds.filter((id) => {
                      // Each slot can only exclude IDs used by OTHER slots (not itself)
                      const othersIds = slots
                        .filter((_, j) => j !== i)
                        .map(s => s.employeeId)
                        .filter(Boolean) as string[];
                      return othersIds.includes(id);
                    })}
                    onChange={updated => updateSlot(i, updated)}
                  />
                ))}
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-50 border border-sky-100">
                <Info size={13} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-700 leading-relaxed">
                  La preselección se basa en el equipo de <strong>{targetEmployee.name}</strong>. Puedes cambiar cualquier evaluador antes de continuar.
                </p>
              </div>

              {/* Footer */}
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
                  disabled={filledCount < 1}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={15} />
                  Guardar y generar enlaces ({filledCount} evaluadores)
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
                      <div key={a.id} className="rounded-xl border-2 overflow-hidden" style={{ borderColor: rc?.borderColor ?? '#e5e7eb' }}>
                        <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ background: rc?.bgLight ?? '#f9fafb' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: rc?.color ?? '#64748b' }}>
                            {rc?.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{a.evaluatorName}</p>
                            <p className="text-[10px] text-gray-500">{rc?.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white">
                          <code className="flex-1 text-[9px] text-gray-500 truncate font-mono">{link}</code>
                          <button
                            type="button"
                            onClick={() => handleCopy(link, a.id)}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                            style={{
                              background: copiedId === a.id ? '#d1fae5' : '#f1f5f9',
                              color: copiedId === a.id ? '#059669' : '#475569',
                            }}
                          >
                            {copiedId === a.id ? <><Check size={10} /> Copiado</> : <><Copy size={10} /> Copiar</>}
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
