import { useLayoutEffect, useState } from 'react';
import { EMPLOYEES, BOX_CONFIGS } from './data/mockData';
import { ViewType } from './types';
import IndividualView from './components/IndividualView';
import Evaluation360View from './components/Evaluation360View';
import PublicEval360Page from './components/PublicEval360Page';
import PublicPercepcionPage from './components/PublicPercepcionPage';
import { isEval360Hash, isPercepcionHash } from './utils/hashRoute';
import {
  BarChart3,
  Users,
  Grid3x3 as Grid3X3,
  TrendingUp,
  Award,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

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
  const total = EMPLOYEES.length;
  const stars = EMPLOYEES.filter((e) => e.potentialLevel === 'high' && e.performanceLevel === 'high').length;
  const highPotential = EMPLOYEES.filter((e) => e.potentialLevel === 'high').length;
  const highPerf = EMPLOYEES.filter((e) => e.performanceLevel === 'high').length;
  const lowPerf = EMPLOYEES.filter((e) => e.performanceLevel === 'low' && e.potentialLevel === 'low').length;

  const departments = Array.from(new Set(EMPLOYEES.map((e) => e.department)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={<Users size={18} />} label="Total Empleados" value={total} sub="en evaluacion" color="#2563eb" />
        <StatCard icon={<Award size={18} />} label="Casilla A (Estrella)" value={stars} sub="100% valores · 100% resultados" color="#059669" />
        <StatCard icon={<TrendingUp size={18} />} label="Valores altos" value={highPotential} sub="eje vertical alto" color="#0d9488" />
        <StatCard icon={<BarChart3 size={18} />} label="Resultados altos" value={highPerf} sub="eje horizontal alto" color="#1d4ed8" />
        <StatCard icon={<AlertTriangle size={18} />} label="Bajo Rendimiento" value={lowPerf} sub="requieren plan mejora" color="#dc2626" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Distribucion 9-Box</h3>
          <div className="space-y-2.5">
            {BOX_CONFIGS.map((cfg) => {
              const count = EMPLOYEES.filter(
                (e) => e.potentialLevel === cfg.potentialLevel && e.performanceLevel === cfg.performanceLevel
              ).length;
              const pct = (count / total) * 100;
              return (
                <div key={cfg.id} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-xs font-medium text-gray-600 w-36 shrink-0">
                    <span className="font-bold">{cfg.code}</span> {cfg.label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-4 text-right">{count}</span>
                  <span className="text-xs text-gray-400 w-10">({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Promedio por área (resultados y valores)</h3>
          <div className="space-y-3">
            {departments.map((dept) => {
              const emps = EMPLOYEES.filter((e) => e.department === dept);
              const avgP = emps.reduce((s, e) => s + e.performance, 0) / emps.length;
              const avgPot = emps.reduce((s, e) => s + e.potential, 0) / emps.length;
              return (
                <div key={dept} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{dept.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-28 shrink-0">{dept}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-14">Result.</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${(avgP / 5) * 100}%`, backgroundColor: '#2563eb' }}
                        />
                      </div>
                      <span className="text-xs font-bold text-blue-700 w-7">{avgP.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-14">Valor.</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${(avgPot / 5) * 100}%`, backgroundColor: '#059669' }}
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 w-7">{avgPot.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{emps.length} empl.</span>
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
            {activeTab === 'overview' && `Panorama general — ${EMPLOYEES.length} empleados evaluados`}
            {activeTab === 'individual' &&
              'Filtra por departamento y tipo de evaluación; la matriz refleja Metrika, percepción o autoevaluación 360.'}
            {activeTab === 'eval360' &&
              'Plantilla reutilizable, enlaces para autoevaluación y evaluadores, y percepción rápida en la matriz 9-Box.'}
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
  if (isPercepcionHash(hash)) {
    return <PublicPercepcionPage key={hash || 'perc'} routeHash={hash} />;
  }

  return <MainApp />;
}
