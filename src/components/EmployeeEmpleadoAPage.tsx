import { BarChart2, ClipboardList, ArrowRight } from 'lucide-react';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import EmpleadoAResultsView from './EmpleadoAResultsView';
import type { PerceptionPlacement } from '../types/evaluation';

export default function EmployeeEmpleadoAPage({ employeeId }: { employeeId: string }) {
  const { percepcion, autoPercepcion } = useEvaluationStore();

  const employee = EMPLOYEES.find(e => e.id === employeeId);
  const percList: PerceptionPlacement[] = percepcion[employeeId] ?? [];
  const autoPerc = autoPercepcion[employeeId];

  const derived = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfg = derived
    ? BOX_CONFIGS.find(b => b.performanceLevel === derived.performanceLevel && b.potentialLevel === derived.potentialLevel) ?? null
    : null;
  const cfgAuto = derivedAuto
    ? BOX_CONFIGS.find(b => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel) ?? null
    : null;

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-gray-400">Empleado no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">

        {/* Header */}
        <div
          className="p-5"
          style={{ background: `linear-gradient(135deg, ${cfg?.color ?? '#64748b'}12, ${cfg?.color ?? '#64748b'}28)` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow shrink-0"
              style={{ backgroundColor: cfg?.color ?? '#64748b' }}
            >
              {employee.avatar}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{employee.name}</h3>
              <p className="text-xs text-gray-600">{employee.position}</p>
              <p className="text-xs text-gray-400">{employee.department}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/60 rounded-xl p-2.5 text-center backdrop-blur-sm">
              <div className="text-xs text-gray-500 mb-0.5">Percepciones</div>
              <div className="text-lg font-black text-gray-900">{percList.length}</div>
            </div>
            <div className="bg-white/60 rounded-xl p-2.5 text-center backdrop-blur-sm">
              <div className="text-xs text-gray-500 mb-0.5">Promedio externo</div>
              {cfg
                ? <div className="text-sm font-black" style={{ color: cfg.color }}>{cfg.code}</div>
                : <div className="text-sm font-black text-gray-300">—</div>}
            </div>
            <div className="bg-white/60 rounded-xl p-2.5 text-center backdrop-blur-sm">
              <div className="text-xs text-gray-500 mb-0.5">Autoevaluación</div>
              {cfgAuto
                ? <div className="text-sm font-black" style={{ color: cfgAuto.color }}>{cfgAuto.code}</div>
                : <div className="text-sm font-black text-gray-300">—</div>}
            </div>
          </div>
        </div>

        {/* Tab bar — matches admin layout */}
        <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-900 shadow-sm"
          >
            <BarChart2 size={13} />
            Resultados
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!autoPerc && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <ClipboardList size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900">Autoevaluación pendiente</p>
                <p className="text-xs text-amber-700 mt-0.5">Aún no has completado tu autoevaluación en la matriz 9-Box.</p>
              </div>
              <a
                href={`#/eval-autopercepcion?employeeId=${employeeId}`}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
              >
                Completar ahora
                <ArrowRight size={13} />
              </a>
            </div>
          )}
          <EmpleadoAResultsView employeeId={employeeId} />
        </div>
      </div>
    </div>
  );
}
