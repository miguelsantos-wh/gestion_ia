import { useMemo, useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { getTemplateById, DEFAULT_360_TEMPLATE_ID } from '../data/evaluation360Template';
import { useEvaluationStore } from '../context/EvaluationContext';
import Eval360Questionnaire from './Eval360Questionnaire';
import { effectiveLocationHash } from '../utils/hashRoute';
import { ClipboardList, CheckCircle, User, Briefcase, Equal, UserCheck, Globe, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Eval360Role } from '../types/evaluation';
import { EVAL_360_ROLE_LABELS } from '../types/evaluation';

function parseEval360Hash(routeHash: string): { employeeId: string | null; mode: 'self' | 'peer'; assignmentId: string | null; role: Eval360Role | null; sessionName: string | null; sessionDescription: string | null } {
  const raw = routeHash.replace(/^#/, '') || '';
  const q = raw.includes('?') ? raw.split('?')[1] : '';
  const params = new URLSearchParams(q);
  const employeeId = params.get('employeeId');
  const mode = params.get('mode') === 'self' ? 'self' : 'peer';
  const assignmentId = params.get('assignmentId');
  const role = (params.get('role') as Eval360Role | null) ?? null;
  const sessionName = params.get('sessionName');
  const sessionDescription = params.get('sessionDescription');
  return { employeeId, mode, assignmentId, role, sessionName, sessionDescription };
}

const ROLE_ICONS: Record<Eval360Role, React.ReactNode> = {
  self: <User size={14} />,
  leader: <Briefcase size={14} />,
  peer: <Equal size={14} />,
  collaborator: <UserCheck size={14} />,
  client: <Globe size={14} />,
  anonymous: <Users size={14} />,
};

const ROLE_COLORS: Record<Eval360Role, string> = {
  self: '#2563eb',
  leader: '#0d9488',
  peer: '#7c3aed',
  collaborator: '#d97706',
  client: '#dc2626',
  anonymous: '#64748b',
};

interface PublicEval360PageProps {
  routeHash: string;
}

export default function PublicEval360Page({ routeHash }: PublicEval360PageProps) {
  const fullHash = effectiveLocationHash(routeHash);
  const { employeeId, mode, assignmentId, role, sessionName, sessionDescription } = useMemo(() => parseEval360Hash(fullHash), [fullHash]);
  const { saveSelfEvaluation, savePeerEvaluation, completeEval360Assignment } = useEvaluationStore();
  const template = getTemplateById(DEFAULT_360_TEMPLATE_ID)!;
  const employee = EMPLOYEES.find((e) => e.id === employeeId);

  const [values, setValues] = useState<(number | null)[]>(() => Array(template.items.length).fill(null));
  const [evaluatorName, setEvaluatorName] = useState('');
  const [done, setDone] = useState(false);

  const setVal = (index: number, value: number) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const answered = values.filter(v => v !== null).length;
  const total = template.items.length;
  const progressPct = Math.round((answered / total) * 100);
  const complete = answered === total;

  const submit = () => {
    if (!employee || !complete) return;
    const scores = values as number[];
    if (mode === 'self') {
      saveSelfEvaluation(employee.id, scores);
    } else {
      savePeerEvaluation(employee.id, evaluatorName, scores);
    }
    if (assignmentId) {
      completeEval360Assignment(assignmentId, scores);
    }
    setDone(true);
  };

  if (!employeeId || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md text-center">
          <p className="text-sm text-gray-600">Enlace no válido o empleado no encontrado.</p>
          <button
            type="button"
            onClick={() => { window.location.hash = ''; }}
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-lg font-bold text-gray-900">¡Evaluación completada!</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Tu evaluación sobre <strong className="text-gray-800">{employee.name}</strong> ha sido guardada correctamente.
          </p>
          {sessionName && (
            <p className="text-xs text-gray-400 mt-1">{sessionName}</p>
          )}
          <button
            type="button"
            onClick={() => { window.location.hash = ''; }}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const effectiveRole = role ?? (mode === 'self' ? 'self' : 'peer');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <ClipboardList className="text-white" size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {sessionName ?? 'Evaluación 360'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Evaluando a <span className="font-semibold text-gray-700">{employee.name}</span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-gray-900">{answered}/{total}</span>
              <p className="text-[10px] text-gray-400">preguntas</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: complete ? '#059669' : '#2563eb' }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Evaluee + role card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Evaluee info */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-base font-bold text-slate-700 shrink-0">
              {employee.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Persona evaluada</p>
              <h2 className="text-base font-bold text-gray-900">{employee.name}</h2>
              <p className="text-xs text-gray-500">{employee.position} · {employee.department}</p>
            </div>
          </div>

          {/* Description */}
          {sessionDescription && (
            <div className="pt-4 pb-3 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Descripción de la evaluación</p>
              <p className="text-sm text-gray-600 leading-relaxed">{sessionDescription}</p>
            </div>
          )}

          {/* Role badge */}
          <div className="pt-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: ROLE_COLORS[effectiveRole] }}
            >
              {ROLE_ICONS[effectiveRole]}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Tu rol como evaluador</p>
              <p className="text-sm font-bold text-gray-800">{EVAL_360_ROLE_LABELS[effectiveRole]}</p>
            </div>
          </div>
        </div>

        {/* Evaluator name input for non-self */}
        {mode === 'peer' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">Tu nombre completo</label>
            <input
              type="text"
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        )}

        {/* Template name */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-gray-400">Plantilla:</span>
          <span className="text-xs font-semibold text-gray-600">{template.name}</span>
        </div>

        {/* Questions */}
        <Eval360Questionnaire template={template} values={values} onChange={setVal} />

        {/* Submit */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Enviar evaluación</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {complete
                  ? 'Todas las preguntas respondidas. Listo para enviar.'
                  : `Faltan ${total - answered} pregunta${total - answered !== 1 ? 's' : ''} por responder.`}
              </p>
            </div>
            <span className={`text-sm font-black ${complete ? 'text-green-600' : 'text-gray-400'}`}>
              {progressPct}%
            </span>
          </div>

          {/* Mini progress */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: complete ? '#059669' : '#94a3b8' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={!complete || (mode === 'peer' && !evaluatorName.trim())}
              onClick={submit}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              <CheckCircle size={16} />
              Enviar evaluación
            </button>
            <button
              type="button"
              onClick={() => { window.location.hash = ''; }}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {mode === 'peer' && !evaluatorName.trim() && complete && (
            <p className="text-xs text-amber-600 text-center mt-2">Ingresa tu nombre para poder enviar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
