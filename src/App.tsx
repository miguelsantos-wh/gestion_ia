import { useLayoutEffect, useState } from 'react';
import Sidebar, { SidebarView } from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import EmployeesPage from './components/EmployeesPage';
import EvaluationsPage from './components/EvaluationsPage';
import EmpleadoAPage from './components/EmpleadoAPage';
import Evaluation360Page from './components/Evaluation360Page';
import AciertosDesaciertosPage from './components/AciertosDesaciertosPage';
import KPITrackerPage from './components/KPITrackerPage';
import InsightsPage from './components/InsightsPage';
import ConfigurationPage from './components/ConfigurationPage';
import PublicEval360Page from './components/PublicEval360Page';
import PublicPercepcionPage from './components/PublicPercepcionPage';
import PublicAutoPercepcionPage from './components/PublicAutoPercepcionPage';
import MiPercepcionPage from './components/MiPercepcionPage';
import { isEval360Hash, isPercepcionHash, isAutoPercepcionHash } from './utils/hashRoute';
import { getPathFromLocationHash } from './utils/hashRoute';

function isMiPercepcionHash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return p === '/mis-resultados' || p.startsWith('/mis-resultados/');
}

const PAGE_TITLES: Record<SidebarView, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Panorama general del sistema de evaluaciones' },
  empleados: { title: 'Empleados', sub: 'Gestión centralizada de perfiles y evaluaciones' },
  evaluaciones: { title: 'Evaluaciones', sub: 'Asignación y seguimiento de evaluaciones' },
  empleadoA: { title: 'Empleado A', sub: 'Resumen, colaboradores, matriz y resultados' },
  eval360: { title: 'Evaluación 360', sub: 'Asignación, seguimiento y análisis de evaluaciones 360' },
  aciertos: { title: 'Aciertos y Desaciertos', sub: 'Evaluación de fortalezas y áreas de mejora' },
  kpi: { title: 'KPI Tracker', sub: 'Métricas y rendimiento del sistema' },
  insights: { title: 'Insights', sub: 'Análisis inteligente de datos de evaluación' },
  configuracion: { title: 'Configuración', sub: 'Ajustes del sistema y gestión de usuarios' },
};

function MainApp() {
  const [activeView, setActiveView] = useState<SidebarView>('dashboard');

  const { title, sub } = PAGE_TITLES[activeView];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">{sub}</p>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          {activeView === 'dashboard' && <DashboardPage />}
          {activeView === 'empleados' && <EmployeesPage />}
          {activeView === 'evaluaciones' && <EvaluationsPage />}
          {activeView === 'empleadoA' && <EmpleadoAPage />}
          {activeView === 'eval360' && <Evaluation360Page />}
          {activeView === 'aciertos' && <AciertosDesaciertosPage />}
          {activeView === 'kpi' && <KPITrackerPage />}
          {activeView === 'insights' && <InsightsPage />}
          {activeView === 'configuracion' && <ConfigurationPage />}
        </main>
      </div>
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
