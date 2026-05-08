import { BarChart3, UserCheck, ClipboardList, Target, ChevronRight, Menu, X, LayoutList, Users, BookOpen, FileText, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export type SidebarView = 'dashboard' | 'empleadoAV2' | 'eval360' | 'aciertos' | 'formulario' | 'empleados' | 'designsystem' | 'templates' | 'miEmpleadoA';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

interface MenuItem {
  id: SidebarView;
  label: string;
  icon: React.ReactNode;
  section: string;
  adminOnly?: boolean;
  employeeOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, section: 'principal', adminOnly: true },
  { id: 'empleados', label: 'Empleados', icon: <Users size={18} />, section: 'principal', adminOnly: true },
  { id: 'empleadoAV2', label: 'Empleado A', icon: <UserCheck size={18} />, section: 'evaluaciones', adminOnly: true },
  { id: 'miEmpleadoA', label: 'Empleado A', icon: <UserCheck size={18} />, section: 'evaluaciones', employeeOnly: true },
  { id: 'eval360', label: 'Evaluación 360', icon: <ClipboardList size={18} />, section: 'evaluaciones' },
  { id: 'aciertos', label: 'Aciertos y Desaciertos', icon: <Target size={18} />, section: 'evaluaciones' },
  { id: 'templates', label: 'Plantillas', icon: <FileText size={18} />, section: 'evaluaciones', adminOnly: true },
  { id: 'formulario', label: 'Guía de Formularios', icon: <LayoutList size={18} />, section: 'utilidades', adminOnly: true },
  { id: 'designsystem', label: 'Design System', icon: <BookOpen size={18} />, section: 'utilidades', adminOnly: true },
];

const SECTIONS = {
  principal: 'Navegación Principal',
  evaluaciones: 'Evaluaciones',
  utilidades: 'Utilidades',
};

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { user, logout, isAdmin, currentEmployee } = useUser();

  const handleNavClick = (view: SidebarView) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (!confirmLogout) { setConfirmLogout(true); return; }
    setConfirmLogout(false);
    logout();
  };

  const visibleItems = MENU_ITEMS.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.employeeOnly && isAdmin) return false;
    return true;
  });

  const groupedItems = visibleItems.reduce(
    (acc, item) => {
      const section = item.section;
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  const displayName = isAdmin ? 'RRHH Admin' : (currentEmployee?.name ?? user?.name ?? 'Empleado');
  const displaySub = isAdmin ? 'Administrador' : (currentEmployee?.position ?? 'Colaborador');
  const avatarContent = isAdmin
    ? <ShieldCheck size={14} className="text-white" />
    : <span className="text-white text-xs font-bold">{currentEmployee?.avatar ?? displayName.charAt(0)}</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-transform lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Matriz 9-Box</h1>
              <p className="text-xs text-gray-400">Panel RRHH</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-6 pb-36">
          {Object.entries(groupedItems).map(([sectionKey, items]) => (
            items.length === 0 ? null : (
              <div key={sectionKey}>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  {SECTIONS[sectionKey as keyof typeof SECTIONS]}
                </h2>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${activeView === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {activeView === item.id && <ChevronRight size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </nav>

        {/* User footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shrink-0">
              {avatarContent}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{displayName}</div>
              <div className="text-[11px] text-gray-400 truncate">{displaySub}</div>
            </div>
          </div>

          {confirmLogout ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex-1">¿Cerrar sesión?</span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={14} />
              <span className="text-xs font-medium">Cerrar sesión</span>
            </button>
          )}
        </div>
      </aside>

      <div
        className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
}
