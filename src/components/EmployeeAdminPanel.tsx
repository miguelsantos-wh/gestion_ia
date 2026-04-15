import { useState, useMemo } from 'react';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import {
  deriveBoxFromPerceptions,
  deriveBoxFromAutoPercepcion,
} from '../utils/evaluationDerivation';
import PercepcionResultsView from './PercepcionResultsView';
import AssignPercepcionModal from './AssignPercepcionModal';
import { Search, Users, Eye, User, Link2, ChevronRight, X, Copy, BarChart2, UserX, UserCheck, AlertCircle } from 'lucide-react';
import type { Employee } from '../types';
import type { PerceptionPlacement } from '../types/evaluation';
import type { PerformanceLevel, PotentialLevel } from '../types';

const PERF_ORDER: PerformanceLevel[] = ['low', 'medium', 'high'];
const POT_ORDER: PotentialLevel[] = ['high', 'medium', 'low'];

function VotesMatrix({
  percList,
  autoPerc,
}: {
  percList: PerceptionPlacement[];
  autoPerc: PerceptionPlacement | undefined;
}) {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, { cfg: typeof BOX_CONFIGS[0]; voters: { name: string; isAnon: boolean; isAuto: boolean }[] }> = {};
    percList.forEach((pl) => {
      const key = `${pl.performanceLevel}-${pl.potentialLevel}`;
      const cfg = BOX_CONFIGS.find((b) => b.performanceLevel === pl.performanceLevel && b.potentialLevel === pl.potentialLevel);
      if (!cfg) return;
      if (!map[key]) map[key] = { cfg, voters: [] };
      const isAnon = !pl.evaluatorName || pl.evaluatorName.trim() === '' || pl.evaluatorName === 'Anónimo';
      map[key].voters.push({ name: pl.evaluatorName || 'Anónimo', isAnon, isAuto: false });
    });
    if (autoPerc) {
      const key = `${autoPerc.performanceLevel}-${autoPerc.potentialLevel}`;
      const cfg = BOX_CONFIGS.find((b) => b.performanceLevel === autoPerc.performanceLevel && b.potentialLevel === autoPerc.potentialLevel);
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
            <div className="flex flex-col items-center gap-1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
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
                {POT_ORDER.map((pot) => (
                  <div key={pot} className="grid grid-cols-3 gap-1">
                    {PERF_ORDER.map((perf) => {
                      const key = `${perf}-${pot}`;
                      const cfg = BOX_CONFIGS.find((b) => b.performanceLevel === perf && b.potentialLevel === pot)!;
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
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span
                                  className="font-black leading-none text-sm"
                                  style={{ color: cell ? cfg.textColor : '#d1d5db' }}
                                >
                                  {cfg.code}
                                </span>
                                <span
                                  className="font-bold leading-tight text-[10px]"
                                  style={{ color: cell ? cfg.textColor : '#d1d5db' }}
                                >
                                  {cfg.label}
                                </span>
                              </div>
                              <div
                                className="text-[9px] mt-0.5 opacity-80 leading-snug"
                                style={{ color: cell ? cfg.textColor : '#d1d5db' }}
                              >
                                {cfg.description}
                              </div>
                            </div>

                            {cell && (
                              <div className="flex flex-wrap gap-0.5 mt-1">
                                {cell.voters.map((v, vi) => (
                                  <div
                                    key={vi}
                                    title={v.name}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm border border-white transition-all duration-150 hover:scale-110"
                                    style={{
                                      backgroundColor: v.isAuto ? '#2563eb' : v.isAnon ? '#94a3b8' : cfg.color,
                                      color: 'white',
                                    }}
                                  >
                                    {v.isAuto ? (
                                      <User size={10} />
                                    ) : v.isAnon ? (
                                      <UserX size={10} />
                                    ) : (
                                      v.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {count > 0 && (
                            <div
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                              style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                            >
                              {count}
                            </div>
                          )}

                          {isHovered && cell && (
                            <div className="absolute bottom-full left-0 mb-1.5 z-20 bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-2 shadow-xl whitespace-nowrap max-w-[200px]">
                              <div className="font-bold mb-1" style={{ color: cfg.bgColor }}>{cfg.code} · {cfg.label}</div>
                              {cell.voters.map((v, vi) => (
                                <div key={vi} className="flex items-center gap-1.5 py-0.5">
                                  {v.isAuto ? (
                                    <User size={9} className="text-blue-400 shrink-0" />
                                  ) : v.isAnon ? (
                                    <UserX size={9} className="text-gray-400 shrink-0" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                                  )}
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
          <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-[7px] text-white font-bold">AB</span>
          </div>
          <span className="text-[10px] text-gray-500">Evaluador nombrado</span>
        </div>
      </div>
    </div>
  );
}

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

function StatusPill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

interface EmployeeCardProps {
  employee: Employee;
  onSelect: () => void;
  isSelected: boolean;
}

function EmployeeCard({ employee, onSelect, isSelected }: EmployeeCardProps) {
  const { percepcion, autoPercepcion } = useEvaluationStore();
  const percList = percepcion[employee.id] ?? [];
  const autoPerc = autoPercepcion[employee.id];
  const derived = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfg = derived
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derived.performanceLevel && b.potentialLevel === derived.potentialLevel)
    : null;
  const cfgAuto = derivedAuto
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel)
    : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-slate-400 shadow-md ring-2 ring-slate-200'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      } bg-white`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: cfg?.color ?? '#94a3b8' }}
          >
            {employee.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{employee.name}</div>
            <div className="text-xs text-gray-500 truncate">{employee.position}</div>
            <div className="text-xs text-gray-400">{employee.department}</div>
          </div>
          <ChevronRight size={14} className={`text-gray-300 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {percList.length > 0 ? (
            <StatusPill color="#0d9488" label={`${percList.length} percep.`} />
          ) : (
            <StatusPill color="#94a3b8" label="sin percep." />
          )}
          {cfg ? (
            <StatusPill color={cfg.color} label={`${cfg.code} · ${cfg.label}`} />
          ) : null}
          {autoPerc && cfgAuto ? (
            <StatusPill color="#2563eb" label={`Auto: ${cfgAuto.code}`} />
          ) : (
            <StatusPill color="#94a3b8" label="sin autoevaluación" />
          )}
        </div>
      </div>
    </button>
  );
}

type DetailTab = 'resultados' | 'enlaces' | 'asignar';

function EmployeeDetailPanel({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { percepcion, autoPercepcion, assignments } = useEvaluationStore();
  const percList = percepcion[employee.id] ?? [];
  const autoPerc = autoPercepcion[employee.id];
  const derived = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfg = derived
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derived.performanceLevel && b.potentialLevel === derived.potentialLevel)
    : null;
  const cfgAuto = derivedAuto
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel)
    : null;

  const [activeTab, setActiveTab] = useState<DetailTab>('resultados');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const percLink = buildHashLink('/eval-percepcion', { employeeId: employee.id });
  const autoPercLink = buildHashLink('/eval-autopercepcion', { employeeId: employee.id });
  const misResultadosLink = buildHashLink('/mis-resultados', { employeeId: employee.id });

  const copy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resultados', label: 'Resultados', icon: <BarChart2 size={13} /> },
    { id: 'enlaces', label: 'Enlaces', icon: <Link2 size={13} /> },
    { id: 'asignar', label: 'Asignar evaluador', icon: <Users size={13} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full">
      <div
        className="p-5 relative shrink-0"
        style={{ background: `linear-gradient(135deg, ${cfg?.color ?? '#64748b'}12, ${cfg?.color ?? '#64748b'}28)` }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500"
        >
          <X size={14} />
        </button>

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
            {cfg ? (
              <div className="text-sm font-black" style={{ color: cfg.color }}>{cfg.code}</div>
            ) : (
              <div className="text-sm font-black text-gray-300">—</div>
            )}
          </div>
          <div className="bg-white/60 rounded-xl p-2.5 text-center backdrop-blur-sm">
            <div className="text-xs text-gray-500 mb-0.5">Autoevaluación</div>
            {cfgAuto ? (
              <div className="text-sm font-black" style={{ color: cfgAuto.color }}>{cfgAuto.code}</div>
            ) : (
              <div className="text-sm font-black text-gray-300">—</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'resultados' && (
          <>
            <div className="space-y-3">
              <div
                className="rounded-2xl border-2 p-4 transition-all"
                style={{
                  backgroundColor: cfg ? cfg.bgColor : '#f0fdfa',
                  borderColor: cfg ? cfg.color : '#99f6e4',
                }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Eye size={13} style={{ color: cfg?.color ?? '#0d9488' }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg?.color ?? '#0d9488' }}>
                    Percepción externa
                  </span>
                  {percList.length > 0 && (
                    <span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: cfg ? `${cfg.color}20` : '#ccfbf1', color: cfg?.color ?? '#0d9488' }}
                    >
                      {percList.length} evaluación{percList.length !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                {percList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin percepciones aún</p>
                ) : cfg && derived ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-black leading-none" style={{ color: cfg.color }}>{cfg.code}</span>
                      <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                    </div>
                    <p className="text-xs opacity-75 leading-snug" style={{ color: cfg.textColor }}>{cfg.description}</p>
                  </>
                ) : null}
              </div>

              <div
                className="rounded-2xl border-2 p-4 transition-all"
                style={{
                  backgroundColor: cfgAuto ? cfgAuto.bgColor : '#eff6ff',
                  borderColor: cfgAuto ? cfgAuto.color : '#bfdbfe',
                }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <User size={13} style={{ color: cfgAuto?.color ?? '#2563eb' }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: cfgAuto?.color ?? '#2563eb' }}>
                    Autoevaluación
                  </span>
                  {autoPerc && (
                    <span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: cfgAuto ? `${cfgAuto.color}20` : '#dbeafe', color: cfgAuto?.color ?? '#2563eb' }}
                    >
                      {new Date(autoPerc.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                {!autoPerc ? (
                  <p className="text-xs text-gray-400 italic">No completada</p>
                ) : cfgAuto && derivedAuto ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-black leading-none" style={{ color: cfgAuto.color }}>{cfgAuto.code}</span>
                      <span className="text-sm font-bold" style={{ color: cfgAuto.textColor }}>{cfgAuto.label}</span>
                    </div>
                    <p className="text-xs opacity-75 leading-snug" style={{ color: cfgAuto.textColor }}>{cfgAuto.description}</p>
                  </>
                ) : null}
              </div>
            </div>

            {(percList.length > 0 || autoPerc) && (
              <VotesMatrix percList={percList} autoPerc={autoPerc} />
            )}

            {percList.length > 0 && autoPerc && cfg && cfgAuto && (
              <div className={`rounded-xl p-3 ${cfg.code === cfgAuto.code ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                <p className={`text-xs font-bold mb-1 ${cfg.code === cfgAuto.code ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {cfg.code === cfgAuto.code ? 'Coincidencia' : 'Brecha de percepción'}
                </p>
                <p className={`text-xs leading-relaxed ${cfg.code === cfgAuto.code ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {cfg.code === cfgAuto.code
                    ? 'El colaborador coincide con la percepción externa.'
                    : `Externos: ${cfg.code} (${cfg.label}) · Se evalúa: ${cfgAuto.code} (${cfgAuto.label})`}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'enlaces' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Comparte estos enlaces. La percepción puede ser anónima o con nombre — es opcional para quien responde.
            </p>

            {[
              { key: 'perc', label: 'Percepción externa', url: percLink, color: '#0d9488', hint: 'Para que otros califiquen al colaborador en la matriz 9-Box.' },
              { key: 'auto', label: 'Autoevaluación 9-Box', url: autoPercLink, color: '#2563eb', hint: 'Para que el propio colaborador se ubique en la matriz.' },
              { key: 'mis', label: 'Ver mis resultados', url: misResultadosLink, color: '#d97706', hint: 'Para que el colaborador consulte cómo lo ven y cómo se ve él mismo.' },
            ].map(({ key, label, url, color, hint }) => (
              <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-700">{label}</span>
                  <button
                    type="button"
                    onClick={() => copy(url, key)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white transition-all"
                    style={{ backgroundColor: color }}
                  >
                    <Copy size={11} />
                    {copied === key ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mb-1.5 leading-relaxed">{hint}</p>
                <code className="text-[10px] text-gray-500 break-all bg-white px-2 py-1 rounded-lg border border-gray-100 block">
                  {url}
                </code>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'asignar' && (() => {
          const pendingEvaluators = assignments.filter(
            (a) => a.targetId === employee.id && !a.completedAt
          ).map((a) => ({ ...a, evaluator: EMPLOYEES.find((e) => e.id === a.evaluatorId) })).filter((a) => a.evaluator);

          return (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Asigna a un colaborador para que evalúe a <strong>{employee.name}</strong> en la matriz 9-Box. La evaluación aparecerá como tarea pendiente en su portal.
              </p>
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <Users size={16} />
                Asignar evaluador
              </button>

              {pendingEvaluators.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle size={13} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-800">Evaluadores asignados pendientes</span>
                    <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5">
                      {pendingEvaluators.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {pendingEvaluators.map((a) => (
                      <div key={`${a.evaluatorId}-${a.targetId}`} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-100">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          {a.evaluator!.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-gray-800 truncate">{a.evaluator!.name}</div>
                          <div className="text-[9px] text-gray-400">
                            Asignado {new Date(a.assignedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <UserCheck size={12} className="text-amber-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {showAssignModal && (
        <AssignPercepcionModal
          targetEmployee={employee}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}

interface EmployeeAdminPanelProps {
  view: 'empleados' | 'matriz' | 'resultados';
}

export default function EmployeeAdminPanel({ view }: EmployeeAdminPanelProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterDept, setFilterDept] = useState('all');

  const departments = Array.from(new Set(EMPLOYEES.map((e) => e.department)));

  const filtered = useMemo(
    () =>
      EMPLOYEES.filter((e) => {
        const matchSearch =
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.position.toLowerCase().includes(search.toLowerCase());
        const matchDept = filterDept === 'all' || e.department === filterDept;
        return matchSearch && matchDept;
      }),
    [search, filterDept]
  );

  const selectedEmployee = selectedId ? EMPLOYEES.find((e) => e.id === selectedId) ?? null : null;

  if (view === 'resultados') {
    return <PercepcionResultsView />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 h-full">
      <div className="xl:col-span-2 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white"
          >
            <option value="all">Todos</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              Sin resultados
            </div>
          ) : (
            filtered.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onSelect={() => setSelectedId(selectedId === emp.id ? null : emp.id)}
                isSelected={selectedId === emp.id}
              />
            ))
          )}
        </div>
      </div>

      <div className="xl:col-span-3">
        {selectedEmployee ? (
          <EmployeeDetailPanel
            employee={selectedEmployee}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Users size={26} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-semibold text-gray-500">Selecciona un colaborador</h4>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
              Haz clic en una ficha de la lista para ver sus resultados de evaluación, gestionar sus enlaces y asignar evaluadores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
