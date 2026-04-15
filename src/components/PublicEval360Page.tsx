import { useMemo, useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { getTemplateById, DEFAULT_360_TEMPLATE_ID } from '../data/evaluation360Template';
import { useEvaluationStore } from '../context/EvaluationContext';
import Eval360Questionnaire from './Eval360Questionnaire';
import { effectiveLocationHash } from '../utils/hashRoute';
import { ClipboardList, CheckCircle } from 'lucide-react';

function parseEval360Hash(routeHash: string): { employeeId: string | null; mode: 'self' | 'peer' } {
  const raw = routeHash.replace(/^#/, '') || '';
  const q = raw.includes('?') ? raw.split('?')[1] : '';
  const params = new URLSearchParams(q);
  const employeeId = params.get('employeeId');
  const mode = params.get('mode') === 'self' ? 'self' : 'peer';
  return { employeeId, mode };
}

interface PublicEval360PageProps {
  /** Hash completo (p. ej. #/eval-360?...) para reparsear al cambiar la URL en la misma pestaña */
  routeHash: string;
}

export default function PublicEval360Page({ routeHash }: PublicEval360PageProps) {
  const fullHash = effectiveLocationHash(routeHash);
  const { employeeId, mode } = useMemo(() => parseEval360Hash(fullHash), [fullHash]);
  const { saveSelfEvaluation, savePeerEvaluation } = useEvaluationStore();
  const template = getTemplateById(DEFAULT_360_TEMPLATE_ID)!;
  const employee = EMPLOYEES.find((e) => e.id === employeeId);

  const [values, setValues] = useState<(number | null)[]>(() => Array(11).fill(null));
  const [evaluatorName, setEvaluatorName] = useState('');
  const [done, setDone] = useState(false);

  const setVal = (index: number, value: number) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const complete = values.every((v) => v !== null && v >= 1 && v <= 5);

  const submit = () => {
    if (!employee || !complete) return;
    const scores = values as number[];
    if (mode === 'self') {
      saveSelfEvaluation(employee.id, scores);
    } else {
      savePeerEvaluation(employee.id, evaluatorName, scores);
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
            onClick={() => {
              window.location.hash = '';
            }}
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
          <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
          <h1 className="text-lg font-bold text-gray-900">Gracias</h1>
          <p className="text-sm text-gray-600 mt-2">
            Tu evaluación 360 sobre <strong>{employee.name}</strong> se ha guardado en este dispositivo (demo local).
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
            }}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <ClipboardList className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Evaluación 360</h1>
            <p className="text-xs text-gray-500">
              {mode === 'self' ? 'Autoevaluación' : 'Evaluación de un compañero'} · {employee.name}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Plantilla: <strong>{template.name}</strong>. Responde con honestidad; las respuestas orientan la posición en la matriz 9-Box
          (resultados y valores) y, en conjunto con KPI, el tipo <strong>Metrika</strong>.
        </p>

        {mode === 'peer' && (
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu nombre</label>
            <input
              type="text"
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              placeholder="Nombre y apellido"
              className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <Eval360Questionnaire template={template} values={values} onChange={setVal} />

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={!complete}
            onClick={submit}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Enviar evaluación
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
            }}
            className="py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
