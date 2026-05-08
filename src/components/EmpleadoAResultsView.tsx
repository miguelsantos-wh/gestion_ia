import { useMemo, useState } from 'react';
import { Eye, User, UserX } from 'lucide-react';
import { BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import type { PerformanceLevel, PotentialLevel } from '../types';
import type { PerceptionPlacement } from '../types/evaluation';

const PERF_ORDER: PerformanceLevel[] = ['low', 'medium', 'high'];
const POT_ORDER: PotentialLevel[] = ['high', 'medium', 'low'];

function VotesMatrix({ percList, autoPerc }: { percList: PerceptionPlacement[]; autoPerc: PerceptionPlacement | undefined }) {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, { cfg: typeof BOX_CONFIGS[0]; voters: { name: string; isAnon: boolean; isAuto: boolean }[] }> = {};
    percList.forEach(pl => {
      const key = `${pl.performanceLevel}-${pl.potentialLevel}`;
      const cfg = BOX_CONFIGS.find(b => b.performanceLevel === pl.performanceLevel && b.potentialLevel === pl.potentialLevel);
      if (!cfg) return;
      if (!map[key]) map[key] = { cfg, voters: [] };
      const isAnon = !pl.evaluatorName || pl.evaluatorName.trim() === '' || pl.evaluatorName === 'Anónimo';
      map[key].voters.push({ name: pl.evaluatorName || 'Anónimo', isAnon, isAuto: false });
    });
    if (autoPerc) {
      const key = `${autoPerc.performanceLevel}-${autoPerc.potentialLevel}`;
      const cfg = BOX_CONFIGS.find(b => b.performanceLevel === autoPerc.performanceLevel && b.potentialLevel === autoPerc.potentialLevel);
      if (cfg) {
        if (!map[key]) map[key] = { cfg, voters: [] };
        map[key].voters.push({ name: 'Yo (autoevaluación)', isAnon: false, isAuto: true });
      }
    }
    return map;
  }, [percList, autoPerc]);

  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Votos en la matriz</p>
      <div className="w-full">
        <div className="flex items-stretch gap-2">
          <div className="flex flex-col items-center justify-center w-5 shrink-0">
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Valores</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-1">
              <div className="flex flex-col justify-between w-10 shrink-0 text-right pr-1.5">
                <span className="text-[9px] font-medium text-gray-400 py-1">Alto</span>
                <span className="text-[9px] font-medium text-gray-400 py-1">Medio</span>
                <span className="text-[9px] font-medium text-gray-400 py-1">Bajo</span>
              </div>
              <div className="flex-1 grid grid-rows-3 gap-1">
                {POT_ORDER.map(pot => (
                  <div key={pot} className="grid grid-cols-3 gap-1">
                    {PERF_ORDER.map(perf => {
                      const key = `${perf}-${pot}`;
                      const cfg = BOX_CONFIGS.find(b => b.performanceLevel === perf && b.potentialLevel === pot)!;
                      const cell = grouped[key];
                      const isHovered = hoveredBox === key;
                      const count = cell?.voters.length ?? 0;
                      return (
                        <div
                          key={key}
                          onMouseEnter={() => setHoveredBox(key)}
                          onMouseLeave={() => setHoveredBox(null)}
                          className="relative rounded-xl border-2 transition-all duration-200"
                          style={{
                            backgroundColor: cell ? (isHovered ? cfg.bgColor : `${cfg.bgColor}99`) : '#f9fafb',
                            borderColor: cell ? (isHovered ? cfg.color : `${cfg.color}40`) : '#e5e7eb',
                            minHeight: '90px',
                            transform: isHovered && cell ? 'scale(1.01)' : 'scale(1)',
                          }}
                        >
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div>
                              <span className="font-black leading-none text-sm" style={{ color: cell ? cfg.textColor : '#d1d5db' }}>{cfg.code}</span>
                              <span className="font-bold leading-tight text-[10px] ml-1" style={{ color: cell ? cfg.textColor : '#d1d5db' }}>{cfg.label}</span>
                            </div>
                            {cell && (
                              <div className="flex flex-wrap gap-0.5 mt-1">
                                {cell.voters.map((v, vi) => (
                                  <div
                                    key={vi}
                                    title={v.name}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm border border-white"
                                    style={{ backgroundColor: v.isAuto ? '#2563eb' : v.isAnon ? '#94a3b8' : cfg.color, color: 'white' }}
                                  >
                                    {v.isAuto ? <User size={10} /> : v.isAnon ? <UserX size={10} /> : v.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {count > 0 && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                              {count}
                            </div>
                          )}
                          {isHovered && cell && (
                            <div className="absolute bottom-full left-0 mb-1.5 z-20 bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-2 shadow-xl whitespace-nowrap max-w-[200px]">
                              <div className="font-bold mb-1" style={{ color: cfg.bgColor }}>{cfg.code} · {cfg.label}</div>
                              {cell.voters.map((v, vi) => (
                                <div key={vi} className="flex items-center gap-1.5 py-0.5">
                                  {v.isAuto ? <User size={9} className="text-blue-400 shrink-0" /> : v.isAnon ? <UserX size={9} className="text-gray-400 shrink-0" /> : <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />}
                                  <span className={v.isAnon && !v.isAuto ? 'text-gray-400 italic' : 'text-white'}>{v.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex ml-10 gap-1 mt-1">
              <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                <span className="text-[9px] font-medium text-gray-400">Bajo</span>
                <span className="text-[9px] font-medium text-gray-400">Medio</span>
                <span className="text-[9px] font-medium text-gray-400">Alto</span>
              </div>
            </div>
            <div className="flex justify-center ml-10 mt-0.5">
              <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Resultados</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center"><UserX size={8} className="text-white" /></div>
          <span className="text-[10px] text-gray-500">Anónimo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center"><User size={8} className="text-white" /></div>
          <span className="text-[10px] text-gray-500">Autoevaluación</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center"><span className="text-[7px] text-white font-bold">AB</span></div>
          <span className="text-[10px] text-gray-500">Evaluador nombrado</span>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────────────────

export interface EmpleadoAResultsViewProps {
  employeeId: string;
}

export default function EmpleadoAResultsView({ employeeId }: EmpleadoAResultsViewProps) {
  const { percepcion, autoPercepcion } = useEvaluationStore();

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 p-3" style={{ backgroundColor: cfg ? cfg.bgColor : '#f0fdfa', borderColor: cfg ? cfg.color : '#99f6e4' }}>
          <div className="flex items-center gap-1 mb-2">
            <Eye size={12} style={{ color: cfg?.color ?? '#0d9488' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfg?.color ?? '#0d9488' }}>Percepción</span>
            {percList.length > 0 && (
              <span className="ml-auto text-[9px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: cfg ? `${cfg.color}20` : '#ccfbf1', color: cfg?.color ?? '#0d9488' }}>
                {percList.length}
              </span>
            )}
          </div>
          {percList.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic">Sin percepciones</p>
          ) : cfg && derived ? (
            <>
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-xl font-black leading-none" style={{ color: cfg.color }}>{cfg.code}</span>
                <span className="text-xs font-bold leading-tight" style={{ color: cfg.textColor }}>{cfg.label}</span>
              </div>
              <p className="text-[10px] opacity-70 leading-snug" style={{ color: cfg.textColor }}>{cfg.description}</p>
            </>
          ) : null}
        </div>
        <div className="rounded-2xl border-2 p-3" style={{ backgroundColor: cfgAuto ? cfgAuto.bgColor : '#eff6ff', borderColor: cfgAuto ? cfgAuto.color : '#bfdbfe' }}>
          <div className="flex items-center gap-1 mb-2">
            <User size={12} style={{ color: cfgAuto?.color ?? '#2563eb' }} />
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfgAuto?.color ?? '#2563eb' }}>Autoevaluación</span>
            {autoPerc && (
              <span className="ml-auto text-[9px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: cfgAuto ? `${cfgAuto.color}20` : '#dbeafe', color: cfgAuto?.color ?? '#2563eb' }}>
                {new Date(autoPerc.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          {!autoPerc ? (
            <p className="text-[10px] text-gray-400 italic">No completada</p>
          ) : cfgAuto && derivedAuto ? (
            <>
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-xl font-black leading-none" style={{ color: cfgAuto.color }}>{cfgAuto.code}</span>
                <span className="text-xs font-bold leading-tight" style={{ color: cfgAuto.textColor }}>{cfgAuto.label}</span>
              </div>
              <p className="text-[10px] opacity-70 leading-snug" style={{ color: cfgAuto.textColor }}>{cfgAuto.description}</p>
            </>
          ) : null}
        </div>
      </div>
      {(percList.length > 0 || autoPerc) && (
        <VotesMatrix percList={percList} autoPerc={autoPerc} />
      )}
    </div>
  );
}
