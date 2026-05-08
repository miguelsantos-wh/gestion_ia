import { useLayoutEffect, useState } from 'react';
import Sidebar, { SidebarView } from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import EmpleadoAV2Page from './components/EmpleadoAV2Page';
import Evaluation360Page from './components/Evaluation360Page';
import AciertosDesaciertosPage from './components/AciertosDesaciertosPage';
import TemplatesPage from './components/TemplatesPage';
import FormShowcasePage from './components/FormShowcasePage';
import DesignSystemPage from './components/DesignSystemPage';
import EmployeeListPage from './components/EmployeeListPage';
import EmployeeEmpleadoAPage from './components/EmployeeEmpleadoAPage';
import PublicEval360Page from './components/PublicEval360Page';
import PublicPercepcionPage from './components/PublicPercepcionPage';
import PublicAutoPercepcionPage from './components/PublicAutoPercepcionPage';
import MiPercepcionPage from './components/MiPercepcionPage';
import LoginSelectPage from './components/LoginSelectPage';
import { isEval360Hash, isPercepcionHash, isAutoPercepcionHash } from './utils/hashRoute';
import { getPathFromLocationHash } from './utils/hashRoute';
import { UserProvider, useUser } from './context/UserContext';

function isMiPercepcionHash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return p === '/mis-resultados' || p.startsWith('/mis-resultados/');
}

const ADMIN_PAGE_TITLES: Record<SidebarView, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Panorama general del sistema de evaluaciones' },
  empleadoAV2: { title: 'Empleado A', sub: 'Vista unificada: resumen, matriz 9-Box y detalle de colaboradores' },
  miEmpleadoA: { title: 'Empleado A', sub: 'Tu posición en la matriz 9-Box y recomendación de desarrollo' },
  eval360: { title: 'Evaluación 360', sub: 'Asignación, seguimiento y análisis de evaluaciones 360' },
  aciertos: { title: 'Aciertos y Desaciertos', sub: 'Evaluación de fortalezas y áreas de mejora' },
  templates: { title: 'Plantillas de Evaluación', sub: 'Crea y gestiona las plantillas de preguntas para evaluaciones 360' },
  formulario: { title: 'Guía de Formularios', sub: 'Referencia visual de todos los elementos de formulario disponibles' },
  designsystem: { title: 'Design System', sub: 'Documentación visual de componentes y patrones de diseño' },
  empleados: { title: 'Empleados', sub: 'Directorio y perfiles del equipo' },
};

const EMPLOYEE_PAGE_TITLES: Partial<Record<SidebarView, { title: string; sub: string }>> = {
  miEmpleadoA: { title: 'Empleado A', sub: 'Tus percepciones y resultados' },
  eval360: { title: 'Evaluación 360', sub: 'Tus evaluaciones y resultados' },
  aciertos: { title: 'Aciertos y Desaciertos', sub: 'Tus fortalezas y áreas de mejora' },
};

function MainApp() {
  const { isAdmin, currentEmployee } = useUser();
  const defaultView: SidebarView = isAdmin ? 'dashboard' : 'eval360';
  const [activeView, setActiveView] = useState<SidebarView>(defaultView);

  const pageTitles = isAdmin ? ADMIN_PAGE_TITLES : EMPLOYEE_PAGE_TITLES;
  const pageInfo = pageTitles[activeView] ?? { title: 'Evaluación 360', sub: 'Tus evaluaciones' };
  const isEmployees = activeView === 'empleados';
  const isDesignSystem = activeView === 'designsystem';
  const isFullPage = isEmployees || isDesignSystem;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 lg:ml-64 flex flex-col">
        {!isFullPage && (
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-6 py-5">
              <h1 className="text-2xl font-bold text-gray-900">{pageInfo.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{pageInfo.sub}</p>
            </div>
          </header>
        )}

        {isEmployees ? (
          <div className="flex-1">
            <EmployeeListPage />
          </div>
        ) : isDesignSystem ? (
          <div className="flex-1">
            <DesignSystemPage />
          </div>
        ) : (
          <main className="p-6 max-w-7xl mx-auto w-full">
            {isAdmin && activeView === 'dashboard' && <DashboardPage />}
            {isAdmin && activeView === 'empleadoAV2' && <EmpleadoAV2Page />}
            {activeView === 'miEmpleadoA' && currentEmployee && <EmployeeEmpleadoAPage employeeId={currentEmployee.id} />}
            {activeView === 'eval360' && <Evaluation360Page />}
            {activeView === 'aciertos' && <AciertosDesaciertosPage />}
            {isAdmin && activeView === 'templates' && <TemplatesPage />}
            {isAdmin && activeView === 'formulario' && <FormShowcasePage />}
          </main>
        )}
      </div>
    </div>
  );
}

function AuthGate() {
  const { user } = useUser();

  if (!user) {
    return <LoginSelectPage />;
  }

  return <MainApp />;
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

  return (
    <UserProvider>
      <AuthGate />
    </UserProvider>
  );
}
