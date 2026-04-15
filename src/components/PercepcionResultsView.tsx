import { useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import { ChevronDown, ChevronUp, Eye, User, UserX } from 'lucide-react';
import type { PerceptionPlacement } from '../types/evaluation';

const GRID_LAYOUT: { potential: 'high' | 'medium' | 'low'; performance: 'low' | 'medium' | 'high' }[][] = [
  [
    { potential: 'high', performance: 'low' },
    { potential: 'high', performance: 'medium' },
    { potential: 'high', performance: 'high' },
  ],
  [
    { potential: 'medium', performance: 'low' },
    { potential: 'medium', performance: 'medium' },
    { potential: 'medium', performance: 'high' },
  ],
  [
    { potential: 'low', performance: 'low' },
    { potential: 'low', performance: 'medium' },
    { potential: 'low', performance: 'high' },
  ],
];

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

function MiniMatrix({
  percList,
  autoPerc,
}: {
  percList: PerceptionPlacement[] | undefined;
  autoPerc: PerceptionPlacement | undefined;
}) {
  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2">
        <div className="flex flex-col items-center justify-center w-5 shrink-0">
          <div
            className="flex flex-col items-center gap-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Valores</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <div className="flex gap-1">
            <div className="flex flex-col justify-between w-10 shrink-0 text-right pr-1.5">
              <span className="text-[10px] font-medium text-gray-400 py-0.5">Alto</span>
              <span className="text-[10px] font-medium text-gray-400 py-0.5">Medio</span>
              <span className="text-[10px] font-medium text-gray-400 py-0.5">Bajo</span>
            </div>

            <div className="flex-1 grid grid-rows-3 gap-1">
              {GRID_LAYOUT.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-3 gap-1">
                  {row.map((cell, colIdx) => {
                    const config = BOX_CONFIGS.find(
                      (b) => b.potentialLevel === cell.potential && b.performanceLevel === cell.performance
                    );
                    if (!config) return null;

                    const evaluatorsHere = (percList ?? []).filter(
                      (p) => p.performanceLevel === cell.performance && p.potentialLevel === cell.potential
                    );
                    const autoHere =
                      autoPerc &&
                      autoPerc.performanceLevel === cell.performance &&
                      autoPerc.potentialLevel === cell.potential;

                    return (
                      <div
                        key={colIdx}
                        className="relative rounded-lg border-2 min-h-[72px] p-1.5 flex flex-col justify-between"
                        style={{
                          backgroundColor: `${config.bgColor}88`,
                          borderColor: `${config.color}40`,
                        }}
                      >
                        <div>
                          <div className="flex items-baseline gap-1 flex-wrap">
                            <span className="text-[10px] font-black leading-none" style={{ color: config.textColor }}>
                              {config.code}
                            </span>
                            <span className="text-[9px] font-bold leading-tight opacity-90" style={{ color: config.textColor }}>
                              {config.label}
                            </span>
                          </div>
                          <div className="text-[8px] mt-0.5 opacity-70 leading-snug" style={{ color: config.textColor }}>
                            {config.description}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluatorsHere.map((pl, i) => (
                            <div
                              key={`${pl.at}-${i}`}
                              title={pl.evaluatorName || 'Anónimo'}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                              style={{ backgroundColor: config.color }}
                            >
                              {pl.evaluatorName
                                ? pl.evaluatorName.charAt(0).toUpperCase()
                                : <UserX size={10} />}
                            </div>
                          ))}
                          {autoHere && (
                            <div
                              title="Autoevaluación"
                              className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-500 bg-blue-100 shrink-0"
                            >
                              <User size={10} className="text-blue-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex ml-10 gap-1 mt-0.5">
            <div className="flex-1 grid grid-cols-3 gap-1 text-center">
              <span className="text-[10px] font-medium text-gray-400">Bajo</span>
              <span className="text-[10px] font-medium text-gray-400">Medio</span>
              <span className="text-[10px] font-medium text-gray-400">Alto</span>
            </div>
          </div>
          <div className="flex justify-center ml-10 mt-0.5">
            <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Resultados</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-[9px] font-bold">A</div>
          <span>Percepción externa</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
            <User size={9} className="text-blue-600" />
          </div>
          <span>Autoevaluación</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
            <UserX size={9} className="text-gray-500" />
          </div>
          <span>Anónimo</span>
        </div>
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
          <MiniMatrix percList={percList} autoPerc={autoPerc} />

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
