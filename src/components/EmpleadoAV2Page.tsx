import { useEffect, useMemo, useState } from 'react';
import {
  Users, UserCheck, TrendingUp, TrendingDown,
  Search, Filter, X, Star,
  Eye, User, UserX, ChevronLeft,
  BarChart2, Link2, Copy, AlertCircle,
} from 'lucide-react';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import {
  employeeForLens,
  deriveBoxFromPerceptions,
  deriveBoxFromAutoPercepcion,
} from '../utils/evaluationDerivation';
import AssignPercepcionModal from './AssignPercepcionModal';
import EmpleadoAResultsView from './EmpleadoAResultsView';
import type { Employee, PerformanceLevel, PotentialLevel } from '../types';
import type { EvaluationLens, PerceptionPlacement } from '../types/evaluation';

// ── constants ──────────────────────────────────────────────────────────────

const LENS_OPTIONS: { id: EvaluationLens; label: string; hint: string }[] = [
  {
    id: 'percepcion',
    label: 'Percepción externa',
    hint: 'Promedio de las casillas 9-Box que otros eligieron. Solo muestra colaboradores con al menos una percepción.',
  },
  {
    id: 'autoevaluacion',
    label: 'Autoevaluación',
    hint: 'Cómo se ubica el propio colaborador en la matriz 9-Box. Solo muestra quienes han completado su autoevaluación.',
  },
];

const PERF_ORDER: PerformanceLevel[] = ['low', 'medium', 'high'];
const POT_ORDER: PotentialLevel[] = ['high', 'medium', 'low'];

const GRID_LAYOUT: { potential: 'high' | 'medium' | 'low'; performance: 'low' | 'medium' | 'high' }[][] = [
  [{ potential: 'high', performance: 'low' }, { potential: 'high', performance: 'medium' }, { potential: 'high', performance: 'high' }],
  [{ potential: 'medium', performance: 'low' }, { potential: 'medium', performance: 'medium' }, { potential: 'medium', performance: 'high' }],
  [{ potential: 'low', performance: 'low' }, { potential: 'low', performance: 'medium' }, { potential: 'low', performance: 'high' }],
];

// ── stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── 9-box grid ─────────────────────────────────────────────────────────────

function NineBoxMatrix({ employees, selectedBox, onBoxClick }: {
  employees: Employee[];
  selectedBox: { potential: string; performance: string } | null;
  onBoxClick: (potential: string, performance: string) => void;
}) {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-2">
        <div className="flex flex-col items-center justify-center w-6 shrink-0">
          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Valores</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex gap-1">
            <div className="flex flex-col justify-between w-12 shrink-0 text-right pr-2">
              <span className="text-xs font-medium text-gray-400 py-1">Alto</span>
              <span className="text-xs font-medium text-gray-400 py-1">Medio</span>
              <span className="text-xs font-medium text-gray-400 py-1">Bajo</span>
            </div>
            <div className="flex-1 grid grid-rows-3 gap-1">
              {GRID_LAYOUT.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-3 gap-1">
                  {row.map((cell, colIdx) => {
                    const config = BOX_CONFIGS.find(b => b.potentialLevel === cell.potential && b.performanceLevel === cell.performance);
                    const boxEmployees = employees.filter(e => e.potentialLevel === cell.potential && e.performanceLevel === cell.performance);
                    if (!config) return null;
                    const isHovered = hoveredBox === config.id;
                    const isSelected = selectedBox?.potential === cell.potential && selectedBox?.performance === cell.performance;
                    return (
                      <div
                        key={colIdx}
                        onMouseEnter={() => setHoveredBox(config.id)}
                        onMouseLeave={() => setHoveredBox(null)}
                        onClick={() => onBoxClick(cell.potential, cell.performance)}
                        className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer min-h-[118px] ${isSelected ? 'ring-2 ring-offset-2 ring-slate-700 shadow-md' : ''}`}
                        style={{
                          backgroundColor: isHovered || isSelected ? config.bgColor : `${config.bgColor}99`,
                          borderColor: isHovered || isSelected ? config.color : `${config.color}40`,
                          transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                        }}
                      >
                        <div className="p-2 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-black leading-none text-base" style={{ color: config.textColor }}>{config.code}</span>
                              <span className="font-bold leading-tight text-xs" style={{ color: config.textColor }}>{config.label}</span>
                            </div>
                            <div className="text-[10px] mt-0.5 opacity-85 leading-snug" style={{ color: config.textColor }}>{config.description}</div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {boxEmployees.map(emp => (
                              <div
                                key={emp.id}
                                className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white"
                                style={{ backgroundColor: config.color }}
                                title={`${emp.name} - ${emp.position}`}
                              >
                                {emp.avatar}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: `${config.color}20`, color: config.color }}
                        >
                          {boxEmployees.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex ml-12 gap-1 mt-1">
            <div className="flex-1 grid grid-cols-3 gap-1 text-center">
              <span className="text-xs font-medium text-gray-400">Bajo</span>
              <span className="text-xs font-medium text-gray-400">Medio</span>
              <span className="text-xs font-medium text-gray-400">Alto</span>
            </div>
          </div>
          <div className="flex justify-center ml-12 mt-0.5">
            <span className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Resultados</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── votes matrix (used inside detail view) ────────────────────────────────

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

// ── employee detail view ──────────────────────────────────────────────────

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

type DetailTab = 'resultados' | 'enlaces' | 'asignar';

function EmployeeDetailView({ employee, onBack }: { employee: Employee; onBack: () => void }) {
  const { percepcion, autoPercepcion, assignments } = useEvaluationStore();
  const percList: PerceptionPlacement[] = percepcion[employee.id] ?? [];
  const autoPerc = autoPercepcion[employee.id];
  const derived = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfg = derived ? BOX_CONFIGS.find(b => b.performanceLevel === derived.performanceLevel && b.potentialLevel === derived.potentialLevel) : null;
  const cfgAuto = derivedAuto ? BOX_CONFIGS.find(b => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel) : null;

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

  const pendingEvaluators = assignments
    .filter(a => a.targetId === employee.id && !a.completedAt)
    .map(a => ({ ...a, evaluator: EMPLOYEES.find(e => e.id === a.evaluatorId) }))
    .filter(a => a.evaluator);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
      >
        <ChevronLeft size={16} />
        Volver a la lista
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 relative" style={{ background: `linear-gradient(135deg, ${cfg?.color ?? '#64748b'}12, ${cfg?.color ?? '#64748b'}28)` }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow shrink-0" style={{ backgroundColor: cfg?.color ?? '#64748b' }}>
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
              {cfg ? <div className="text-sm font-black" style={{ color: cfg.color }}>{cfg.code}</div> : <div className="text-sm font-black text-gray-300">—</div>}
            </div>
            <div className="bg-white/60 rounded-xl p-2.5 text-center backdrop-blur-sm">
              <div className="text-xs text-gray-500 mb-0.5">Autoevaluación</div>
              {cfgAuto ? <div className="text-sm font-black" style={{ color: cfgAuto.color }}>{cfgAuto.code}</div> : <div className="text-sm font-black text-gray-300">—</div>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'resultados' && (
            <EmpleadoAResultsView employeeId={employee.id} />
          )}

          {activeTab === 'enlaces' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">Comparte estos enlaces. La percepción puede ser anónima o con nombre — es opcional para quien responde.</p>
              {[
                { key: 'perc', label: 'Percepción externa', url: percLink, color: '#0d9488', hint: 'Para que otros califiquen al colaborador en la matriz 9-Box.' },
                { key: 'auto', label: 'Autoevaluación 9-Box', url: autoPercLink, color: '#2563eb', hint: 'Para que el propio colaborador se ubique en la matriz.' },
                { key: 'mis', label: 'Ver mis resultados', url: misResultadosLink, color: '#d97706', hint: 'Para que el colaborador consulte cómo lo ven y cómo se ve él mismo.' },
              ].map(({ key, label, url, color, hint }) => (
                <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-700">{label}</span>
                    <button type="button" onClick={() => copy(url, key)} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white transition-all" style={{ backgroundColor: color }}>
                      <Copy size={11} />
                      {copied === key ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1.5 leading-relaxed">{hint}</p>
                  <code className="text-[10px] text-gray-500 break-all bg-white px-2 py-1 rounded-lg border border-gray-100 block">{url}</code>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'asignar' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Asigna a un colaborador para que evalúe a <strong>{employee.name}</strong> en la matriz 9-Box.
              </p>
              <button type="button" onClick={() => setShowAssignModal(true)} className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                <Users size={16} />
                Asignar evaluador
              </button>
              {pendingEvaluators.length > 0 && (
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle size={13} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-800">Evaluadores asignados pendientes</span>
                    <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5">{pendingEvaluators.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {pendingEvaluators.map(a => (
                      <div key={`${a.evaluatorId}-${a.targetId}`} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-100">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">{a.evaluator!.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-gray-800 truncate">{a.evaluator!.name}</div>
                          <div className="text-[9px] text-gray-400">Asignado {new Date(a.assignedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</div>
                        </div>
                        <UserCheck size={12} className="text-amber-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAssignModal && (
        <AssignPercepcionModal targetEmployee={employee} onClose={() => setShowAssignModal(false)} />
      )}
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────

// Seed perception data for the first 5 employees using their base profile levels.
// This only runs once when there are zero perception records in the store.
function useSeedPerceptions() {
  const { percepcion, savePerceptionPlacement } = useEvaluationStore();

  useEffect(() => {
    const hasAnyData = Object.keys(percepcion).some(id => (percepcion[id]?.length ?? 0) > 0);
    if (hasAnyData) return;

    const seedEvaluators = [
      'Sistema (demo)',
      'Evaluador A',
      'Evaluador B',
    ];

    const first5 = EMPLOYEES.slice(0, 5);
    first5.forEach(emp => {
      seedEvaluators.forEach(evalName => {
        savePerceptionPlacement(
          emp.id,
          evalName,
          emp.performanceLevel as PerformanceLevel,
          emp.potentialLevel as PotentialLevel
        );
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function EmpleadoAV2Page() {
  const { threeSixty, percepcion, autoPercepcion, syncCompletedEvaluations } = useEvaluationStore();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [evaluationLens, setEvaluationLens] = useState<EvaluationLens>('percepcion');

  const [selectedBox, setSelectedBox] = useState<{ potential: string; performance: string } | null>(null);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [assignEmployee, setAssignEmployee] = useState<Employee | null>(null);

  useSeedPerceptions();

  useEffect(() => {
    syncCompletedEvaluations();
  }, [syncCompletedEvaluations]);

  const departments = Array.from(new Set(EMPLOYEES.map(e => e.department)));

  const total = EMPLOYEES.length;

  // Base filter for the table (search + dept)
  const baseFiltered = useMemo(
    () => EMPLOYEES.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.position.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'all' || e.department === filterDept;
      return matchSearch && matchDept;
    }),
    [search, filterDept]
  );

  // lensFiltered: employees with real evaluation data — drives the 9-box matrix and stats panel
  const lensFiltered = useMemo(
    () => EMPLOYEES.map(e => employeeForLens(e, evaluationLens, threeSixty, percepcion, autoPercepcion)).filter((e): e is Employee => e !== null),
    [evaluationLens, threeSixty, percepcion, autoPercepcion]
  );

  // Stats derived from real evaluation data (lensFiltered)
  const empA = lensFiltered.filter(e => e.potentialLevel === 'high' && e.performanceLevel === 'high').length;
  const empB = lensFiltered.filter(e => (BOX_CONFIGS.find(b => b.potentialLevel === e.potentialLevel && b.performanceLevel === e.performanceLevel)?.code ?? '').startsWith('B')).length;
  const empC = lensFiltered.filter(e => (BOX_CONFIGS.find(b => b.potentialLevel === e.potentialLevel && b.performanceLevel === e.performanceLevel)?.code ?? '').startsWith('C')).length;
  const empD = lensFiltered.filter(e => e.potentialLevel === 'low' && e.performanceLevel === 'low').length;

  // tableRows: always all base-filtered employees; hasResult=true only when lens data exists
  const tableRows = useMemo(() => {
    return baseFiltered.map(e => {
      const lensVersion = employeeForLens(e, evaluationLens, threeSixty, percepcion, autoPercepcion);
      return { employee: lensVersion ?? e, hasResult: lensVersion !== null };
    });
  }, [baseFiltered, evaluationLens, threeSixty, percepcion, autoPercepcion]);

  const displayRows = useMemo(
    () => selectedBox
      ? tableRows.filter(r => r.hasResult && r.employee.potentialLevel === selectedBox.potential && r.employee.performanceLevel === selectedBox.performance)
      : tableRows,
    [tableRows, selectedBox]
  );

  const selectedBoxConfig = selectedBox ? BOX_CONFIGS.find(b => b.potentialLevel === selectedBox.potential && b.performanceLevel === selectedBox.performance) : null;

  const handleBoxClick = (potential: string, performance: string) => {
    const already = selectedBox?.potential === potential && selectedBox?.performance === performance;
    setSelectedBox(already ? null : { potential, performance });
  };

  // If detail view is open, render it instead
  if (detailEmployee) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard icon={<Users size={18} />} label="Total Colaboradores" value={total} sub="registrados en el sistema" color="#2563eb" />
          <StatCard icon={<Star size={18} />} label="Empleados A" value={empA} sub="alto valores · alto resultados" color="#065f46" />
          <StatCard icon={<UserCheck size={18} />} label="Empleados B" value={empB} sub="perfil B (alto·medio)" color="#1d4ed8" />
          <StatCard icon={<TrendingUp size={18} />} label="Empleados C" value={empC} sub="perfil C (medio·bajo)" color="#d97706" />
          <StatCard icon={<TrendingDown size={18} />} label="Empleados D" value={empD} sub="bajo valores · bajo resultados" color="#dc2626" />
        </div>
        <EmployeeDetailView employee={detailEmployee} onBack={() => setDetailEmployee(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={<Users size={18} />} label="Total Colaboradores" value={total} sub="registrados en el sistema" color="#2563eb" />
        <StatCard icon={<Star size={18} />} label="Empleados A" value={empA} sub="alto valores · alto resultados" color="#065f46" />
        <StatCard icon={<UserCheck size={18} />} label="Empleados B" value={empB} sub="perfil B (alto·medio)" color="#1d4ed8" />
        <StatCard icon={<TrendingUp size={18} />} label="Empleados C" value={empC} sub="perfil C (medio·bajo)" color="#d97706" />
        <StatCard icon={<TrendingDown size={18} />} label="Empleados D" value={empD} sub="bajo valores · bajo resultados" color="#dc2626" />
      </div>

      {/* 9-Box (full width) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Matriz 9-Box (valores × resultados)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Haz clic en un cuadrante para filtrar la lista de colaboradores</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={evaluationLens}
              onChange={e => setEvaluationLens(e.target.value as EvaluationLens)}
              className="pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-600 font-medium"
            >
              {LENS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            {selectedBox && selectedBoxConfig && (
              <button type="button" onClick={() => setSelectedBox(null)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ backgroundColor: selectedBoxConfig.bgColor, color: selectedBoxConfig.textColor, borderColor: `${selectedBoxConfig.color}40` }}>
                <X size={11} />
                {selectedBoxConfig.code} · {selectedBoxConfig.label}
              </button>
            )}
          </div>
        </div>
        <NineBoxMatrix employees={lensFiltered} selectedBox={selectedBox} onBoxClick={handleBoxClick} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleado o posición..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative min-w-[180px]">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                <option value="all">Todos los departamentos</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {selectedBox && selectedBoxConfig && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">Cuadrante activo:</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: selectedBoxConfig.bgColor, color: selectedBoxConfig.textColor }}>
                {selectedBoxConfig.code} · {selectedBoxConfig.label}
              </span>
              <button type="button" onClick={() => setSelectedBox(null)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Limpiar</button>
            </div>
          )}
        </div>

        {/* Table header */}
        <div className="overflow-x-auto">
          {displayRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3"><Search size={22} className="text-gray-200" /></div>
              <p className="text-sm font-semibold text-gray-400">Sin colaboradores</p>
              <p className="text-xs text-gray-300 mt-1">Ajusta los filtros para ver resultados.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Colaborador</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Área</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Progreso</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Resultado</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayRows.map(({ employee: emp, hasResult }) => {
                  const cfg = hasResult ? BOX_CONFIGS.find(b => b.potentialLevel === emp.potentialLevel && b.performanceLevel === emp.performanceLevel) : null;
                  const perfPct = hasResult ? Math.round(((emp.performance - 1) / 4) * 100) : null;
                  const potPct = hasResult ? Math.round(((emp.potential - 1) / 4) * 100) : null;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      {/* Colaborador */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: cfg?.color ?? '#94a3b8' }}>
                            {emp.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{emp.name}</div>
                            <div className="text-xs text-gray-400 truncate">{emp.position}</div>
                          </div>
                        </div>
                      </td>
                      {/* Área */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-gray-600 font-medium">{emp.department}</span>
                      </td>
                      {/* Progreso */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        {perfPct !== null && potPct !== null ? (
                          <div className="space-y-1.5 w-32">
                            <div>
                              <div className="flex justify-between mb-0.5">
                                <span className="text-[10px] text-gray-400">Resultados</span>
                                <span className="text-[10px] font-bold text-gray-600">{perfPct}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-1.5 rounded-full" style={{ width: `${perfPct}%`, backgroundColor: '#0d9488' }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-0.5">
                                <span className="text-[10px] text-gray-400">Valores</span>
                                <span className="text-[10px] font-bold text-gray-600">{potPct}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-1.5 rounded-full" style={{ width: `${potPct}%`, backgroundColor: '#2563eb' }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">—</span>
                        )}
                      </td>
                      {/* Resultado */}
                      <td className="px-4 py-3.5">
                        {cfg ? (
                          <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-xl" style={{ backgroundColor: cfg.bgColor, color: cfg.textColor }}>
                            {cfg.code} · {cfg.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Sin resultados</span>
                        )}
                      </td>
                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailEmployee(emp)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
                          >
                            <Eye size={12} />
                            Ver detalle
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssignEmployee(emp)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
                          >
                            <Users size={12} />
                            Asignar evaluación
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {displayRows.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-400">{displayRows.length} colaborador{displayRows.length !== 1 ? 'es' : ''}</span>
          </div>
        )}
      </div>

      {/* Assign modal */}
      {assignEmployee && (
        <AssignPercepcionModal targetEmployee={assignEmployee} onClose={() => setAssignEmployee(null)} />
      )}
    </div>
  );
}
