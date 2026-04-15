import { useMemo, useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import PerceptionPlacementGrid from './PerceptionPlacementGrid';
import type { PerformanceLevel, PotentialLevel } from '../types';
import { BOX_CONFIGS } from '../data/mockData';
import { effectiveLocationHash } from '../utils/hashRoute';
import { User, CheckCircle } from 'lucide-react';

function parseEmployeeIdFromHash(routeHash: string): string | null {
  const raw = routeHash.replace(/^#/, '') || '';
  const q = raw.includes('?') ? raw.split('?')[1] : '';
  const params = new URLSearchParams(q);
  return params.get('employeeId');
}

interface PublicAutoPercepcionPageProps {
  routeHash: string;
}

export default function PublicAutoPercepcionPage({ routeHash }: PublicAutoPercepcionPageProps) {
  const fullHash = effectiveLocationHash(routeHash);
  const employeeId = useMemo(() => parseEmployeeIdFromHash(fullHash), [fullHash]);
  const { saveAutoPercepcion } = useEvaluationStore();
  const employee = EMPLOYEES.find((e) => e.id === employeeId);

  const [pending, setPending] = useState<{ performanceLevel: PerformanceLevel; potentialLevel: PotentialLevel } | null>(
    null
  );
  const [done, setDone] = useState(false);

  const confirmPlacement = () => {
    if (!employee || !pending) return;
    saveAutoPercepcion(employee.id, employee.name, pending.performanceLevel, pending.potentialLevel);
    setDone(true);
  };

  if (!employeeId || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md text-center">
          <p className="text-sm text-gray-600">Enlace no válido o colaborador no encontrado.</p>
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
          <CheckCircle className="mx-auto text-blue-500 mb-3" size={40} />
          <h1 className="text-lg font-bold text-gray-900">Autoevaluación registrada</h1>
          <p className="text-sm text-gray-600 mt-2">
            Has indicado cómo te percibes tú mismo en la matriz 9-Box.
          </p>
          <button
            type="button"
            onClick={() => { window.location.hash = ''; }}
            className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const cfg =
    pending &&
    BOX_CONFIGS.find(
      (b) => b.performanceLevel === pending.performanceLevel && b.potentialLevel === pending.potentialLevel
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Autoevaluación</h1>
            <p className="text-xs text-gray-500">¿Cómo te percibes en la matriz 9-Box?</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-6 leading-relaxed">
          Hola <strong>{employee.name}</strong>, elige la casilla donde crees que te encuentras actualmente en cuanto a
          resultados (eje horizontal) y valores (eje vertical).
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <PerceptionPlacementGrid
            onSelect={(performanceLevel, potentialLevel) => setPending({ performanceLevel, potentialLevel })}
          />
        </div>

        {pending && cfg && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900">
              Casilla elegida: <span className="font-black">{cfg.code}</span> {cfg.label}
            </p>
            <p className="text-xs text-blue-800 mt-1">{cfg.description}</p>
            <button
              type="button"
              onClick={confirmPlacement}
              className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
            >
              Confirmar y enviar
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => { window.location.hash = ''; }}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
