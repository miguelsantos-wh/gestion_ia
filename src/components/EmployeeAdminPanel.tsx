import { useState, useMemo } from 'react';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';
import {
  deriveBoxFromPerceptions,
  deriveBoxFromAutoPercepcion,
} from '../utils/evaluationDerivation';
import PercepcionResultsView from './PercepcionResultsView';
import AssignPercepcionModal from './AssignPercepcionModal';
import { Search, Users, Eye, User, Link2, ChevronRight, X, Copy, BarChart2 } from 'lucide-react';
import type { Employee } from '../types';

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
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye size={13} className="text-teal-600" />
                  <span className="text-xs font-bold text-teal-800">Percepción externa</span>
                </div>
                {percList.length === 0 ? (
                  <p className="text-xs text-teal-700 opacity-60">Sin percepciones aún</p>
                ) : cfg ? (
                  <>
                    <div className="text-xl font-black mb-0.5" style={{ color: cfg.color }}>{cfg.code}</div>
                    <div className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</div>
                    <div className="text-xs text-teal-700 mt-1">{percList.length} evaluación{percList.length !== 1 ? 'es' : ''}</div>
                  </>
                ) : null}
              </div>

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <User size={13} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">Autoevaluación</span>
                </div>
                {!autoPerc ? (
                  <p className="text-xs text-blue-700 opacity-60">No completada</p>
                ) : cfgAuto ? (
                  <>
                    <div className="text-xl font-black mb-0.5" style={{ color: cfgAuto.color }}>{cfgAuto.code}</div>
                    <div className="text-xs font-semibold" style={{ color: cfgAuto.color }}>{cfgAuto.label}</div>
                    <div className="text-xs text-blue-700 mt-1">
                      {new Date(autoPerc.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {percList.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Votos recibidos</p>
                <div className="space-y-2">
                  {percList.map((pl, i) => {
                    const plcfg = BOX_CONFIGS.find((b) => b.performanceLevel === pl.performanceLevel && b.potentialLevel === pl.potentialLevel);
                    return (
                      <div key={`${pl.at}-${i}`} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ backgroundColor: plcfg?.color ?? '#94a3b8' }}
                        >
                          {plcfg?.code ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-800">{pl.evaluatorName || 'Anónimo'}</div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(pl.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-[10px] text-right text-gray-500 shrink-0">
                          <div>Res: <strong>{pl.performanceLevel === 'high' ? 'Alto' : pl.performanceLevel === 'medium' ? 'Medio' : 'Bajo'}</strong></div>
                          <div>Val: <strong>{pl.potentialLevel === 'high' ? 'Alto' : pl.potentialLevel === 'medium' ? 'Medio' : 'Bajo'}</strong></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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

        {activeTab === 'asignar' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              Asigna a un empleado específico para que evalúe a <strong>{employee.name}</strong> en la matriz 9-Box.
              También puedes copiar el enlace genérico para enviar a quien quieras (con nombre opcional).
            </p>
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <Users size={16} />
              Asignar evaluador interno
            </button>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Link2 size={13} className="text-teal-600" />
                <span className="text-xs font-bold text-gray-700">Enlace abierto (anónimo opcional)</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                Cualquier persona puede usar este enlace. El nombre del evaluador es opcional.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 text-[10px] text-gray-500 break-all bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                  {percLink}
                </code>
                <button
                  type="button"
                  onClick={() => copy(percLink, 'perc-asignar')}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold"
                >
                  <Copy size={11} />
                  {copied === 'perc-asignar' ? 'OK' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        )}
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
