import { useLayoutEffect, useState } from 'react';
import { EMPLOYEES, BOX_CONFIGS } from './data/mockData';
import IndividualView from './components/IndividualView';
import Evaluation360View from './components/Evaluation360View';
import EmployeeAdminPanel from './components/EmployeeAdminPanel';
import PublicEval360Page from './components/PublicEval360Page';
import PublicPercepcionPage from './components/PublicPercepcionPage';
import PublicAutoPercepcionPage from './components/PublicAutoPercepcionPage';
import MiPercepcionPage from './components/MiPercepcionPage';
import { isEval360Hash, isPercepcionHash, isAutoPercepcionHash } from './utils/hashRoute';
import { getPathFromLocationHash } from './utils/hashRoute';
import { useEvaluationStore } from './context/EvaluationContext';
import { BarChart3, Users, Grid3x3 as Grid3X3, TrendingUp, Award, ClipboardList, CircleUser as UserCircle2, Eye, LayoutDashboard, Target, ThumbsUp } from 'lucide-react';

function isMiPercepcionHash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return p === '/mis-resultados' || p.startsWith('/mis-resultados/');
}

type AdminView = 'overview' | 'empleados' | 'matriz' | 'resultados' | 'eval360' | 'panel';

const ADMIN_TABS: { id: AdminView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Resumen', icon: <BarChart3 size={15} /> },
  { id: 'empleados', label: 'Colaboradores', icon: <Users size={15} /> },
  { id: 'matriz', label: 'Matriz 9-Box', icon: <Grid3X3 size={15} /> },
  { id: 'resultados', label: 'Resultados', icon: <Eye size={15} /> },
  { id: 'eval360', label: 'Evaluación 360', icon: <ClipboardList size={15} /> },
  { id: 'panel', label: 'Panel', icon: <LayoutDashboard size={15} /> },
];

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
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

function OverviewView() {
  const { percepcion, autoPercepcion } = useEvaluationStore();

  const total = EMPLOYEES.length;
  const employeesWithPerc = EMPLOYEES.filter((e) => (percepcion[e.id]?.length ?? 0) > 0).length;
  const employeesWithAuto = EMPLOYEES.filter((e) => !!autoPercepcion[e.id]).length;
  const employeesEvaluated = EMPLOYEES.filter(
    (e) => (percepcion[e.id]?.length ?? 0) > 0 || !!autoPercepcion[e.id]
  ).length;
  const departments = Array.from(new Set(EMPLOYEES.map((e) => e.department)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Users size={18} />} label="Total Colaboradores" value={total} sub="registrados en el sistema" color="#2563eb" />
        <StatCard icon={<Award size={18} />} label="Con evaluación" value={employeesEvaluated} sub="con al menos un dato" color="#059669" />
        <StatCard icon={<TrendingUp size={18} />} label="Con percepción externa" value={employeesWithPerc} sub="evaluados por otros" color="#0d9488" />
        <StatCard icon={<UserCircle2 size={18} />} label="Con autoevaluación" value={employeesWithAuto} sub="se ubicaron en la matriz" color="#1d4ed8" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Estado por área</h3>
          <div className="space-y-3">
            {departments.map((dept) => {
              const emps = EMPLOYEES.filter((e) => e.department === dept);
              const evaluated = emps.filter(
                (e) => (percepcion[e.id]?.length ?? 0) > 0 || !!autoPercepcion[e.id]
              ).length;
              const pct = emps.length > 0 ? (evaluated / emps.length) * 100 : 0;
              return (
                <div key={dept} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{dept.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-28 shrink-0">{dept}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : pct > 0 ? '#2563eb' : '#e5e7eb' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-10 text-right">{evaluated}/{emps.length}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Colaboradores</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {EMPLOYEES.map((e) => {
              const hasPerc = (percepcion[e.id]?.length ?? 0) > 0;
              const hasAuto = !!autoPercepcion[e.id];
              return (
                <div key={e.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {e.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{e.name}</div>
                    <div className="text-xs text-gray-400 truncate">{e.position}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {hasPerc ? (
                      <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2 py-0.5 font-medium">
                        {percepcion[e.id].length} perc.
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">sin perc.</span>
                    )}
                    {hasAuto ? (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5 font-medium">auto</span>
                    ) : (
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">sin auto</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Definición de Cuadrantes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BOX_CONFIGS.map((cfg) => (
            <div
              key={cfg.id}
              className="rounded-xl p-4 border"
              style={{ backgroundColor: cfg.bgColor, borderColor: `${cfg.color}30` }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-lg font-black" style={{ color: cfg.textColor }}>{cfg.code}</span>
                <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{cfg.description}</p>
              <ul className="text-xs text-gray-700 leading-relaxed mb-2 list-disc pl-4 space-y-0.5">
                {cfg.detailBullets.map((line, i) => (
                  <li key={`${cfg.id}-b${i}`}>{line}</li>
                ))}
              </ul>
              <p className="text-xs font-medium" style={{ color: cfg.textColor }}>{cfg.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type PanelTab = 'eval360' | 'empleadoA' | 'aciertos';

const PANEL_TABS: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'eval360', label: 'Evaluación 360', icon: <ClipboardList size={14} /> },
  { id: 'empleadoA', label: 'Empleado A', icon: <Users size={14} /> },
  { id: 'aciertos', label: 'Aciertos y desaciertos', icon: <ThumbsUp size={14} /> },
];

function PanelView() {
  const [activeTab, setActiveTab] = useState<PanelTab>('empleadoA');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-4 pt-4">
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 w-fit">
          {PANEL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'eval360' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">Evaluación 360</h3>
            <p className="text-xs text-gray-400 max-w-xs">Esta sección estará disponible próximamente.</p>
          </div>
        )}

        {activeTab === 'empleadoA' && (
          <div className="-m-4">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-xs text-gray-500">Vista completa del sistema — todos los módulos disponibles</p>
              </div>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resumen</h4>
                <OverviewView />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Colaboradores</h4>
                <EmployeeAdminPanel view="empleados" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Matriz 9-Box</h4>
                <IndividualView employees={EMPLOYEES} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resultados de percepción</h4>
                <EmployeeAdminPanel view="resultados" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Evaluación 360</h4>
                <Evaluation360View />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aciertos' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Target size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">Aciertos y desaciertos</h3>
            <p className="text-xs text-gray-400 max-w-xs">Esta sección estará disponible próximamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const VIEW_TITLES: Record<AdminView, { title: string; sub: string }> = {
  overview: { title: 'Resumen Ejecutivo', sub: `Panorama general — ${EMPLOYEES.length} colaboradores registrados` },
  empleados: { title: 'Colaboradores', sub: 'Fichas individuales con resultados, enlaces y asignación de evaluadores' },
  matriz: { title: 'Matriz 9-Box', sub: 'Visualiza la posición de los colaboradores según evaluaciones recibidas' },
  resultados: { title: 'Resultados de percepción', sub: 'Resumen de todas las percepciones externas y autoevaluaciones' },
  eval360: { title: 'Evaluación 360', sub: 'Plantilla de cuestionario, enlaces y resultados 360' },
  panel: { title: 'Panel', sub: 'Vista unificada con Evaluación 360, colaboradores y análisis de aciertos' },
};

function MainApp() {
  const [activeView, setActiveView] = useState<AdminView>('overview');

  const { title, sub } = VIEW_TITLES[activeView];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                <Grid3X3 size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Matriz 9-Box</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Panel RRHH</p>
              </div>
            </div>

            <nav className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 overflow-x-auto max-w-[60vw] sm:max-w-none">
              {ADMIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                    ${activeView === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">RH</span>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-gray-700">RRHH Admin</div>
                <div className="text-xs text-gray-400">Ciclo 2024</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
        </div>

        {activeView === 'overview' && <OverviewView />}
        {activeView === 'empleados' && <EmployeeAdminPanel view="empleados" />}
        {activeView === 'matriz' && <IndividualView employees={EMPLOYEES} />}
        {activeView === 'resultados' && <EmployeeAdminPanel view="resultados" />}
        {activeView === 'eval360' && <Evaluation360View />}
        {activeView === 'panel' && <PanelView />}
      </main>
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));

  useLayoutEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  if (isEval360Hash(hash)) {
    return <PublicEval360Page key={hash || 'eval360'} routeHash={hash} />;
  }
  if (isAutoPercepcionHash(hash)) {
    return <PublicAutoPercepcionPage key={hash || 'autopercepcion'} routeHash={hash} />;
  }
  if (isPercepcionHash(hash)) {
    return <PublicPercepcionPage key={hash || 'perc'} routeHash={hash} />;
  }
  if (isMiPercepcionHash(hash)) {
    return <MiPercepcionPage key={hash || 'misresultados'} routeHash={hash} />;
  }

  return <MainApp />;
}
