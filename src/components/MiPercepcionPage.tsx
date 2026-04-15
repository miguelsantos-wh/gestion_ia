import { useMemo, useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import { BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import { effectiveLocationHash } from '../utils/hashRoute';
import { Eye, User, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import type { PerceptionPlacement } from '../types/evaluation';

function parseEmployeeIdFromHash(routeHash: string): string | null {
  const raw = routeHash.replace(/^#/, '') || '';
  const q = raw.includes('?') ? raw.split('?')[1] : '';
  const params = new URLSearchParams(q);
  return params.get('employeeId');
}

function levelLabel(level: string): string {
  if (level === 'high') return 'Alto';
  if (level === 'medium') return 'Medio';
  return 'Bajo';
}

function MiniBox({ perf, pot, highlight }: { perf: string; pot: string; highlight?: boolean }) {
  const cfg = BOX_CONFIGS.find((b) => b.performanceLevel === perf && b.potentialLevel === pot);
  if (!cfg) return null;
  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all ${highlight ? 'scale-105 shadow-md' : ''}`}
      style={{
        backgroundColor: cfg.bgColor,
        borderColor: highlight ? cfg.color : `${cfg.color}30`,
      }}
    >
      <div className="text-2xl font-black mb-1" style={{ color: cfg.textColor }}>{cfg.code}</div>
      <div className="text-sm font-bold mb-1" style={{ color: cfg.textColor }}>{cfg.label}</div>
      <div className="text-xs" style={{ color: cfg.textColor, opacity: 0.8 }}>{cfg.description}</div>
    </div>
  );
}

function VoteList({ placements }: { placements: PerceptionPlacement[] }) {
  const grouped = placements.reduce<Record<string, { cfg: typeof BOX_CONFIGS[0]; names: string[] }>>((acc, pl) => {
    const key = `${pl.performanceLevel}-${pl.potentialLevel}`;
    const cfg = BOX_CONFIGS.find((b) => b.performanceLevel === pl.performanceLevel && b.potentialLevel === pl.potentialLevel);
    if (!cfg) return acc;
    if (!acc[key]) acc[key] = { cfg, names: [] };
    acc[key].names.push(pl.evaluatorName || 'Anónimo');
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([key, { cfg, names }]) => (
        <div key={key} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
            style={{ backgroundColor: cfg.bgColor, color: cfg.textColor }}
          >
            {cfg.code}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-700">{cfg.label}</div>
            <div className="text-xs text-gray-500 truncate">{names.join(', ')}</div>
          </div>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: cfg.color }}
          >
            {names.length}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MiPercepcionPageProps {
  routeHash: string;
}

export default function MiPercepcionPage({ routeHash }: MiPercepcionPageProps) {
  const fullHash = effectiveLocationHash(routeHash);
  const employeeId = useMemo(() => parseEmployeeIdFromHash(fullHash), [fullHash]);
  const { percepcion, autoPercepcion } = useEvaluationStore();
  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  const [activeTab, setActiveTab] = useState<'percepcion' | 'auto' | 'brecha'>('percepcion');

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

  const percList = percepcion[employee.id] ?? [];
  const autoPerc = autoPercepcion[employee.id];
  const derivedPerc = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfgPerc = derivedPerc
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derivedPerc.performanceLevel && b.potentialLevel === derivedPerc.potentialLevel)
    : null;
  const cfgAuto = derivedAuto
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel)
    : null;

  const hasPercepcion = percList.length > 0;
  const hasAuto = !!autoPerc;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white text-sm font-bold">
            {employee.avatar}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mis resultados 9-Box</h1>
            <p className="text-xs text-gray-500">{employee.name} · {employee.position}</p>
          </div>
        </div>

        {!hasPercepcion && !hasAuto ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Eye size={24} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-semibold text-gray-500">Aún no hay resultados</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Nadie ha completado una percepción tuya todavía, y tampoco has hecho tu autoevaluación.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('percepcion')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'percepcion' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                <Eye size={13} /> Cómo me ven ({percList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('auto')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                <User size={13} /> Cómo me veo
              </button>
              {hasPercepcion && hasAuto && (
                <button
                  type="button"
                  onClick={() => setActiveTab('brecha')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'brecha' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                  <BarChart3 size={13} /> Brecha
                </button>
              )}
            </div>

            {activeTab === 'percepcion' && (
              <div className="space-y-4">
                {!hasPercepcion ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-400">Nadie ha registrado una percepción tuya aún.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-teal-600" />
                        <h3 className="text-sm font-bold text-gray-900">Resultado promedio</h3>
                        <span className="ml-auto text-xs text-gray-500">{percList.length} voto{percList.length !== 1 ? 's' : ''}</span>
                      </div>
                      {cfgPerc && derivedPerc && (
                        <MiniBox perf={derivedPerc.performanceLevel} pot={derivedPerc.potentialLevel} highlight />
                      )}
                      {cfgPerc && (
                        <p className="text-xs text-gray-600 mt-3 leading-relaxed">{cfgPerc.recommendation}</p>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye size={14} className="text-gray-500" />
                        <h3 className="text-sm font-bold text-gray-900">Detalle de votos</h3>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-20">Resultados:</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${((derivedPerc?.performance ?? 1) - 1) / 4 * 100}%`,
                                backgroundColor: '#0d9488',
                              }}
                            />
                          </div>
                          <span className="font-bold">{levelLabel(derivedPerc?.performanceLevel ?? 'low')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-20">Valores:</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${((derivedPerc?.potential ?? 1) - 1) / 4 * 100}%`,
                                backgroundColor: '#2563eb',
                              }}
                            />
                          </div>
                          <span className="font-bold">{levelLabel(derivedPerc?.potentialLevel ?? 'low')}</span>
                        </div>
                      </div>
                      <VoteList placements={percList} />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'auto' && (
              <div className="space-y-4">
                {!hasAuto ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <p className="text-sm text-gray-400 mb-4">Aún no has completado tu autoevaluación.</p>
                    <CheckCircle size={32} className="mx-auto text-gray-200" />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <User size={16} className="text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900">Cómo me percibo</h3>
                      <span className="ml-auto text-xs text-gray-500">
                        {new Date(autoPerc.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {cfgAuto && derivedAuto && (
                      <MiniBox perf={derivedAuto.performanceLevel} pot={derivedAuto.potentialLevel} highlight />
                    )}
                    {cfgAuto && (
                      <p className="text-xs text-gray-600 mt-3 leading-relaxed">{cfgAuto.recommendation}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'brecha' && hasPercepcion && hasAuto && derivedPerc && derivedAuto && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Comparación de percepciones</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <Eye size={12} className="text-teal-600" />
                        <span className="text-xs font-semibold text-gray-600">Cómo me ven</span>
                      </div>
                      <MiniBox perf={derivedPerc.performanceLevel} pot={derivedPerc.potentialLevel} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <User size={12} className="text-blue-600" />
                        <span className="text-xs font-semibold text-gray-600">Cómo me veo</span>
                      </div>
                      <MiniBox perf={derivedAuto.performanceLevel} pot={derivedAuto.potentialLevel} />
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    cfgPerc?.code === cfgAuto?.code
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-amber-50 border-amber-100'
                  }`}
                >
                  {cfgPerc?.code === cfgAuto?.code ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">Coincidencia total</span>
                      </div>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Tu autopercepción coincide exactamente con cómo te ven los demás. Esto indica una visión
                        clara y realista de tu posición.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-amber-800 mb-2">Brecha de percepción detectada</p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Los demás te ubican en <strong>{cfgPerc?.code} ({cfgPerc?.label})</strong> mientras que tú
                        te ubicas en <strong>{cfgAuto?.code} ({cfgAuto?.label})</strong>. Esta diferencia es una
                        oportunidad de reflexión y conversación con tu equipo o líder.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => { window.location.hash = ''; }}
          className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
