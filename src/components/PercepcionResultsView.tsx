import { useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import { ChevronDown, ChevronUp, Eye, User } from 'lucide-react';
import type { PerceptionPlacement } from '../types/evaluation';

function levelLabel(level: string): string {
  if (level === 'high') return 'Alto';
  if (level === 'medium') return 'Medio';
  return 'Bajo';
}

function PlacementBadge({ perf, pot }: { perf: string; pot: string }) {
  const cfg = BOX_CONFIGS.find((b) => b.performanceLevel === perf && b.potentialLevel === pot);
  if (!cfg) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: cfg.bgColor, color: cfg.textColor }}
    >
      {cfg.code} · {cfg.label}
    </span>
  );
}

function PerceptionRow({ placement, index }: { placement: PerceptionPlacement; index: number }) {
  const cfg = BOX_CONFIGS.find(
    (b) => b.performanceLevel === placement.performanceLevel && b.potentialLevel === placement.potentialLevel
  );
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-gray-500">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">
          {placement.evaluatorName || 'Anónimo'}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(placement.at).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="flex gap-1.5 items-center justify-end">
          <span className="text-xs text-gray-500">Result: <strong>{levelLabel(placement.performanceLevel)}</strong></span>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">Val: <strong>{levelLabel(placement.potentialLevel)}</strong></span>
        </div>
        {cfg && (
          <div className="mt-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.bgColor, color: cfg.textColor }}
            >
              {cfg.code}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeePercepcionCard({
  employeeId,
  percList,
  autoPerc,
}: {
  employeeId: string;
  percList: PerceptionPlacement[] | undefined;
  autoPerc: PerceptionPlacement | undefined;
}) {
  const [open, setOpen] = useState(false);
  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  if (!employee) return null;

  const derivedPerc = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const percCount = percList?.length ?? 0;

  const cfg = derivedPerc
    ? BOX_CONFIGS.find(
        (b) => b.performanceLevel === derivedPerc.performanceLevel && b.potentialLevel === derivedPerc.potentialLevel
      )
    : null;
  const cfgAuto = derivedAuto
    ? BOX_CONFIGS.find(
        (b) => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel
      )
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: cfg?.color ?? '#94a3b8' }}
        >
          {employee.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900">{employee.name}</div>
          <div className="text-xs text-gray-500 truncate">{employee.position} · {employee.department}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end gap-1">
            {derivedPerc && cfg ? (
              <PlacementBadge perf={derivedPerc.performanceLevel} pot={derivedPerc.potentialLevel} />
            ) : (
              <span className="text-xs text-gray-400">Sin percepciones</span>
            )}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Eye size={11} /> {percCount} percepción{percCount !== 1 ? 'es' : ''}
              </span>
              {autoPerc && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <User size={11} /> Auto
                </span>
              )}
            </div>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={13} className="text-teal-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Percepciones de otros</span>
              </div>
              {percCount === 0 ? (
                <p className="text-xs text-gray-400 italic">Ninguna percepción registrada aún.</p>
              ) : (
                <>
                  {derivedPerc && cfg && (
                    <div className="mb-2 text-xs font-semibold text-gray-700">
                      Promedio:{' '}
                      <span className="font-black" style={{ color: cfg.color }}>{cfg.code}</span>{' '}
                      <span style={{ color: cfg.textColor }}>{cfg.label}</span>
                    </div>
                  )}
                  <div className="space-y-0">
                    {percList!.map((pl, i) => (
                      <PerceptionRow key={`${pl.at}-${i}`} placement={pl} index={i} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <User size={13} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Autoevaluación</span>
              </div>
              {!autoPerc ? (
                <p className="text-xs text-gray-400 italic">No ha completado su autoevaluación.</p>
              ) : (
                <>
                  {cfgAuto && (
                    <div className="mb-2 text-xs font-semibold text-gray-700">
                      Se ubicó en:{' '}
                      <span className="font-black" style={{ color: cfgAuto.color }}>{cfgAuto.code}</span>{' '}
                      <span style={{ color: cfgAuto.textColor }}>{cfgAuto.label}</span>
                    </div>
                  )}
                  <PerceptionRow placement={autoPerc} index={0} />
                </>
              )}
            </div>
          </div>

          {percCount > 0 && derivedPerc && derivedAuto && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-800 mb-1">Brecha autopercepción vs. percepción externa</p>
              <p className="text-xs text-amber-700">
                Otros lo ubican en{' '}
                <strong>{BOX_CONFIGS.find(b => b.performanceLevel === derivedPerc.performanceLevel && b.potentialLevel === derivedPerc.potentialLevel)?.code ?? '—'}</strong>
                {' '}mientras que él/ella se ubica en{' '}
                <strong>{BOX_CONFIGS.find(b => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel)?.code ?? '—'}</strong>.
                {derivedPerc.performanceLevel === derivedAuto.performanceLevel &&
                derivedPerc.potentialLevel === derivedAuto.potentialLevel
                  ? ' Hay coincidencia total.'
                  : ' Hay una diferencia de percepción a considerar.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PercepcionResultsView() {
  const { percepcion, autoPercepcion } = useEvaluationStore();

  const employeesWithData = EMPLOYEES.filter(
    (e) => (percepcion[e.id]?.length ?? 0) > 0 || autoPercepcion[e.id]
  );
  const employeesWithout = EMPLOYEES.filter(
    (e) => (percepcion[e.id]?.length ?? 0) === 0 && !autoPercepcion[e.id]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Resultados de percepciones</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {employeesWithData.length} colaborador{employeesWithData.length !== 1 ? 'es' : ''} con datos ·{' '}
            {employeesWithout.length} pendiente{employeesWithout.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {employeesWithData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Eye size={24} className="text-gray-300" />
          </div>
          <h4 className="text-sm font-semibold text-gray-500">Sin datos todavía</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Comparte los enlaces de percepción o autoevaluación para que los colaboradores se ubiquen en la matriz.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {employeesWithData.map((e) => (
            <EmployeePercepcionCard
              key={e.id}
              employeeId={e.id}
              percList={percepcion[e.id]}
              autoPerc={autoPercepcion[e.id]}
            />
          ))}
        </div>
      )}

      {employeesWithout.length > 0 && employeesWithData.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Sin evaluaciones aún</p>
          <div className="flex flex-wrap gap-2">
            {employeesWithout.map((e) => (
              <span key={e.id} className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600">
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
