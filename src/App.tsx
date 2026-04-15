import { useLayoutEffect, useState } from 'react';
import { EMPLOYEES, BOX_CONFIGS } from './data/mockData';
import { ViewType } from './types';
import IndividualView from './components/IndividualView';
import Evaluation360View from './components/Evaluation360View';
import PublicEval360Page from './components/PublicEval360Page';
import PublicPercepcionPage from './components/PublicPercepcionPage';
import PublicAutoPercepcionPage from './components/PublicAutoPercepcionPage';
import MiPercepcionPage from './components/MiPercepcionPage';
import { isEval360Hash, isPercepcionHash, isAutoPercepcionHash } from './utils/hashRoute';
import { getPathFromLocationHash } from './utils/hashRoute';
import { useEvaluationStore } from './context/EvaluationContext';
import {
  BarChart3,
  Users,
  Grid3x3 as Grid3X3,
  TrendingUp,
  Award,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

function isMiPercepcionHash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return p === '/mis-resultados' || p.startsWith('/mis-resultados/');
}

const TABS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Resumen', icon: <BarChart3 size={16} /> },
  { id: 'individual', label: 'Individual', icon: <Grid3X3 size={16} /> },
  { id: 'eval360', label: 'Evaluación 360', icon: <ClipboardList size={16} /> },
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

  const employeesWithPerc = EMPLOYEES.filter(
    (e) => (percepcion[e.id]?.length ?? 0) > 0
  ).length;
  const employeesWithAuto = EMPLOYEES.filter((e) => !!autoPercepcion[e.id]).length;
  const employeesEvaluated = EMPLOYEES.filter(
    (e) => (percepcion[e.id]?.length ?? 0) > 0 || !!autoPercepcion[e.id]
  ).length;

  const departments = Array.from(new Set(EMPLOYEES.map((e) => e.department)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users size={18} />} label="Total Colaboradores" value={total} sub="registrados en el sistema" color="#2563eb" />
        <StatCard icon={<Award size={18} />} label="Con evaluación" value={employeesEvaluated} sub="con al menos un dato" color="#059669" />
        <StatCard icon={<TrendingUp size={18} />} label="Con percepción externa" value={employeesWithPerc} sub="evaluados por otros" color="#0d9488" />
        <StatCard icon={<AlertTriangle size={18} />} label="Con autoevaluación" value={employeesWithAuto} sub="se ubicaron en la matriz" color="#1d4ed8" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Estado de evaluaciones por área</h3>
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
                  <span className="text-xs font-medium text-gray-700 w-32 shrink-0">{dept}</span>
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
          <h3 className="text-sm font-bold text-gray-700 mb-4">Colaboradores registrados</h3>
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
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">
                        sin perc.
                      </span>
                    )}
                    {hasAuto ? (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                        auto
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">
                        sin auto
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Definicion de los Cuadrantes</h3>
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

function MainApp() {
  const [activeTab, setActiveTab] = useState<ViewType>('overview');

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
                <p className="text-xs text-gray-400 hidden sm:block">Valores y resultados (matriz 9-Box)</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto max-w-[55vw] sm:max-w-none">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
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
          <h2 className="text-lg font-bold text-gray-900">
            {activeTab === 'overview' && 'Resumen Ejecutivo'}
            {activeTab === 'individual' && 'Evaluacion Individual'}
            {activeTab === 'eval360' && 'Evaluación 360 y percepción'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeTab === 'overview' && `Panorama general — ${EMPLOYEES.length} colaboradores registrados`}
            {activeTab === 'individual' &&
              'Visualiza la matriz según las evaluaciones recibidas. Solo aparecen colaboradores con al menos una evaluación.'}
            {activeTab === 'eval360' &&
              'Plantilla reutilizable, enlaces para evaluación 360, percepción y autoevaluación en la matriz 9-Box.'}
          </p>
        </div>

        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'individual' && <IndividualView employees={EMPLOYEES} />}
        {activeTab === 'eval360' && <Evaluation360View />}
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
